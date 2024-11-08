import {
  Box,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useRef } from "react";
import { useChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

function ChatWindow() {
  const { messagesLoading, chatState } = useChatContext();
  const { authState } = useContext(AuthContext);
  const { role } = authState;
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatState.messages]);

  return (
    <Paper
      sx={{
        flex: 1,
        boxShadow: "none",
        borderBottom: "2px solid black",
      }}
    >
      <Typography
        variant="h6"
        component="div"
        sx={{ padding: 2, borderBottom: "2px solid black" }}
      >
        Messages
      </Typography>
      <List
        ref={listRef}
        style={{
          padding: 0,
          height: "calc(100vh - 250px)",
          overflow: "auto",
        }}
      >
        {messagesLoading ? (
          <Box
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeContent: "center",
            }}
          >
            <CircularProgress size="2rem" />
          </Box>
        ) : (
          chatState.messages.map((message, index) => {
            const messageUserRole = Object.keys(message)[0];
            const messageContent = Object.values(message)[0];
            return (
              <ListItem
                key={index}
                style={{
                  width: "100%",
                  textAlign: `${messageUserRole === role ? "right" : "left"}`,
                }}
              >
                <Box
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    textAlign={`${messageUserRole === role ? "right" : "left"}`}
                    color="GrayText"
                    fontSize="0.8rem"
                  >
                    {messageUserRole.toUpperCase()}
                  </Typography>
                  <Typography
                    padding="0.5rem"
                    bgcolor="steelblue"
                    color="whitesmoke"
                    style={{
                      maxWidth: "80%",
                      width: "fit-content",
                      borderRadius: "0.2rem",
                      borderTopLeftRadius: `${
                        messageUserRole === role ? "0.2rem" : "0"
                      }`,
                      borderTopRightRadius: `${
                        messageUserRole !== role ? "0.2rem" : "0"
                      }`,
                    }}
                    textAlign={`${messageUserRole === role ? "right" : "left"}`}
                    alignSelf={`${messageUserRole === role ? "end" : "start"}`}
                  >
                    {messageContent}
                  </Typography>
                </Box>
              </ListItem>
            );
          })
        )}
      </List>
    </Paper>
  );
}

export default ChatWindow;
