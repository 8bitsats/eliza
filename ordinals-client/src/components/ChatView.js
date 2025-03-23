import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const ChatView = () => {
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  const { 
    messages, 
    sendMessage, 
    connectionStatus, 
    connectToEliza 
  } = useAppContext();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    if (connectionStatus !== 'connected') {
      connectToEliza();
      setTimeout(() => {
        sendMessage(inputText);
        setInputText('');
      }, 1000);
    } else {
      sendMessage(inputText);
      setInputText('');
    }
  };

  // Format timestamp to a readable time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format special content like emojis and URLs
  const formatMessageContent = (content) => {
    // Handle URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const formattedContent = content.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    return formattedContent;
  };

  return (
    <div className="chat-view">
      <div className="chat-container" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="welcome-message system-message">
            Welcome to the Ordinals Client! Connect to Ord GPT to start chatting about Bitcoin Ordinals.
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.type}-message`}
            >
              {message.type === 'system' ? (
                <div>{message.content}</div>
              ) : (
                <>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content) 
                    }} 
                  />
                  <div className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
      
      <form className="input-container" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          className="message-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            connectionStatus === 'connected'
              ? 'Type your message...'
              : 'Connect to Ord GPT to start chatting...'
          }
          disabled={connectionStatus !== 'connected'}
        />
        <button
          type="submit"
          className="btn primary"
          disabled={connectionStatus !== 'connected' || !inputText.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatView;
