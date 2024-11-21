import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Socket connection with error handling
const socket = io({
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Socket error handling
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError('Unable to connect to chat server');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected on attempt:', attemptNumber);
      setConnectionError(null);
    });

    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('connect_error');
      socket.off('reconnect');
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const joinRoom = async () => {
    if (!username.trim() || !room.trim()) {
      alert('Please enter both username and room name');
      return;
    }

    try {
      socket.emit('join_room', room);
      const response = await fetch(`/api/messages/${room}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.reverse());
      setIsJoined(true);
      setConnectionError(null);
    } catch (error) {
      console.error('Error joining room:', error);
      setConnectionError('Failed to join room. Please try again.');
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      const messageData = {
        user: username,
        content: messageInput,
        room: room,
        timestamp: new Date()
      };

      socket.emit('send_message', messageData);
      setMessageInput('');
    }
  };

  if (!isJoined) {
    return (
      <div className="join-container">
        <h2>Join Chat</h2>
        {connectionError && (
          <div className="error-message">{connectionError}</div>
        )}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room Name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Room: {room}</h2>
        <p>Welcome, {username}!</p>
      </div>

      {connectionError && (
        <div className="error-banner">{connectionError}</div>
      )}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.user === username ? 'own-message' : 'other-message'}`}
          >
            <div className="message-info">
              <span className="username">{message.user}</span>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;