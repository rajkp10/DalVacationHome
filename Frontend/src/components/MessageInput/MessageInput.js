import { Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import { useChatContext } from "../../context/ChatContext";

function MessageInput() {
  const { sendMessage } = useChatContext();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message) {
      return;
    }
    sendMessage(message);
    setMessage("");
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        label="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        sx={{ marginLeft: 2 }}
      >
        Send
      </Button>
    </Box>
  );
}

export default MessageInput;
