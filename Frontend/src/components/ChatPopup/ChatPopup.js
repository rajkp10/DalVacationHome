import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';

const ChatPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
            {!isOpen && (
                <IconButton onClick={toggleChat} style={{ backgroundColor: 'white', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}>
                    <ChatBubbleIcon color="primary" />
                </IconButton>
            )}

            {isOpen && (
                <div style={{ position: 'relative' }}>
                    <IconButton
                        onClick={toggleChat}
                        style={{ position: 'absolute', top: 0, right: 0 }}
                    >
                        <ChatBubbleIcon color="secondary" />
                    </IconButton>
                    <iframe width="350" height="430" allow="microphone;" src="https://console.dialogflow.com/api-client/demo/embedded/86e7fecf-1320-4a3c-9e13-6ff70a9f6443"></iframe>
                </div>
            )}
        </div>
    );
};

export default ChatPopup;
