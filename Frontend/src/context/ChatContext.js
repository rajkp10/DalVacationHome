import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const ChatContext = createContext();

// const FETCH_CHATS_URL = `${process.env.REACT_APP_BASE_URL}/chat`;
// "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/chats";
// const FETCH_MESSAGES_URL = `${process.env.REACT_APP_BASE_URL}/chat/messages`;
// "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/chats/messages";
// const WEBSOCKET_URL = `${process.env.REACT_APP_WEB_SOCKET_URL}`;
// "wss://4i88d0ij0b.execute-api.us-east-1.amazonaws.com/deployment/";
const BASE_URL = "https://fpa7ui7p69.execute-api.us-east-1.amazonaws.com/prod";

const FETCH_CHATS_URL = `${BASE_URL}/chat`;
const FETCH_MESSAGES_URL = `${BASE_URL}/chat/messages`;
// const WEBSOCKET_URL = "wss://2mebxpg1mi.execute-api.us-east-1.amazonaws.com/prod/"
const WEBSOCKET_URL = `${process.env.REACT_APP_WEB_SOCKET_URL}`;
// "wss://4i88d0ij0b.execute-api.us-east-1.amazonaws.com/deployment/";

const initialState = {
  chats: [],
  activeChatId: "",
  messages: [],
};

const ChatProvider = ({ children }) => {
  const [chatState, setChatState] = useState(initialState);
  const [chatListLoading, setChatListLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const { authState } = useContext(AuthContext);
  const { userId, role } = authState;
  const ws = useRef(null);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);

  const fetchChats = async () => {
    setChatListLoading(true);
    await axios
      .post(FETCH_CHATS_URL, {
        userId,
        role,
      })
      .then((res) => {
        const chatList = JSON.parse(res.data.body);
        setChatState({ ...chatState, chats: chatList.data });
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setChatListLoading(false);
      });
  };

  const setChatWindow = async (chatId) => {
    setMessagesLoading(true);
    console.log(chatState);
    await axios
      .get(`${FETCH_MESSAGES_URL}?messageId=${chatId}`)
      .then((res) => {
        const chat = JSON.parse(res.data.body);
        setChatState({
          ...chatState,
          activeChatId: chat.data.messageId,
          messages: chat.data.messages,
        });
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setMessagesLoading(false);
      });
  };

  const sendMessage = async (message) => {
    if (isWebSocketReady) {
      const messageData = {
        messageId: chatState.activeChatId,
        userId,
        role,
        message,
      };
      ws.current.send(
        JSON.stringify({ action: "sendMessage", data: messageData })
      );
    } else {
      console.log("WebSocket is not open");
    }
  };

  useEffect(() => {
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      setIsWebSocketReady(true);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      setIsWebSocketReady(false);
    };

    ws.current.onmessage = (event) => {
      try {
        console.log(event.data);
        const data = JSON.parse(event.data);
        setChatState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, { [data.role]: data.message }],
        }));
        console.log(chatState);
      } catch (error) {
        console.log(error);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chatState,
        setChatState,
        chatListLoading,
        messagesLoading,
        sendMessage,
        fetchChats,
        setChatWindow,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => {
  return useContext(ChatContext);
};

export { ChatProvider, useChatContext };
