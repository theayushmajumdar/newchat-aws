
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const ENDPOINT = "http://localhost:5000";
const socket = io(ENDPOINT);

function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const joinRoom = async () => {
    if (username && room) { 
      
      socket.emit('join_room', room);
      
      try {
        const response = await fetch(`${ENDPOINT}/api/messages/${room}`);
        const data = await response.json();
        setMessages(data.reverse());
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
      
      setIsJoined(true);
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