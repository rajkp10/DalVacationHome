import {
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useChatContext } from "../../context/ChatContext";

function ChatList() {
  const { chatListLoading, chatState, setChatWindow } = useChatContext();
  return (
    <Paper elevation={3} sx={{ height: "100%", overflow: "auto" }}>
      <Typography
        variant="h6"
        component="div"
        sx={{ padding: 2, borderBottom: "2px solid black" }}
      >
        Chats
      </Typography>
      <List>
        {chatState.chats.length === 0 && !chatListLoading && (
          <ListItem>
            <ListItemText primary="No Concerns Raised Yet." />
          </ListItem>
        )}
        {chatListLoading ? (
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
          chatState.chats.map((chat) => (
            <React.Fragment key={chat.messageId}>
              <ListItem button>
                <ListItemText
                  primary={`Booking ID: ${chat.bookingId}`}
                  onClick={() => setChatWindow(chat.messageId)}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
}

export default ChatList;
