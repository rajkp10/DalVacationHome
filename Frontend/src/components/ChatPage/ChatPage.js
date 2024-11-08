import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import React, { useEffect } from "react";
import ChatList from "../ChatList/ChatList";
import MessageInput from "../MessageInput/MessageInput";
import { useChatContext } from "../../context/ChatContext";
import ChatWindow from "../ChatWindow/ChatWindow";

function ChatPage() {
  const { fetchChats, chatState, messagesLoading } = useChatContext();

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <Container
      sx={{
        height: "85vh",
        display: "flex",
        flexDirection: "column",
        marginY: "2rem",
      }}
    >
      <Grid container sx={{ height: "100%" }}>
        <Grid item xs={4} sx={{ borderRight: "1px solid #ddd" }}>
          <ChatList />
        </Grid>
        <Grid item xs={8}>
          <Paper
            elevation={3}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {!chatState.activeChatId ? (
              <Box
                bgcolor="gainsboro"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "grid",
                  placeContent: "center",
                }}
              >
                <Typography>Please select a chat</Typography>
              </Box>
            ) : (
              <>
                <ChatWindow />
                <MessageInput />
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ChatPage;
