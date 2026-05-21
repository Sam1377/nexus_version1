import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';

export default function ChatPanel({ messages, typingUsers, currentUser, onSend, onTyping }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
    clearTimeout(typingTimeout.current);
    if (isTyping) {
      onTyping(false);
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!isTyping) {
      onTyping(true);
      setIsTyping(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      onTyping(false);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const otherTyping = typingUsers.filter((u) => u !== currentUser?.username);

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">No messages yet. Say hi!</div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.username === currentUser?.username;
          return (
            <div key={i} className={`chat-msg ${isMe ? 'mine' : 'theirs'}`}>
              {!isMe && <span className="msg-author">{msg.username}</span>}
              <div className="msg-bubble">{msg.content}</div>
              <span className="msg-time">{formatTime(msg.timestamp)}</span>
            </div>
          );
        })}
        {otherTyping.length > 0 && (
          <div className="typing-indicator">
            <span className="typing-dots">
              <span /><span /><span />
            </span>
            <span className="typing-text">
              {otherTyping.join(', ')} {otherTyping.length === 1 ? 'is' : 'are'} typing…
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          className="chat-input"
          placeholder="Message…"
          value={input}
          onChange={handleInputChange}
          autoComplete="off"
        />
        <button className="chat-send-btn" type="submit" disabled={!input.trim()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
