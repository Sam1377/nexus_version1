import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import CodeEditor from '../components/Editor/CodeEditor';
import ChatPanel from '../components/Chat/ChatPanel';
import UsersPanel from '../components/Room/UsersPanel';
import './RoomPage.css';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'html', 'rust'];

export default function RoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'users'
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const codeRef = useRef(code);
  codeRef.current = code;

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        setRoom(res.data.room);
      } catch {
        toast.error('Room not found');
        navigate('/dashboard');
        return;
      }

      const socket = getSocket();
      socketRef.current = socket;

      socket.emit('join_room', { roomId, userId: user._id, username: user.username });

      socket.on('room_joined', ({ code, language, messages }) => {
        setCode(code);
        setLanguage(language);
        setMessages(messages || []);
        setLoading(false);
      });

      socket.on('code_update', ({ code }) => setCode(code));
      socket.on('language_update', ({ language }) => setLanguage(language));
      socket.on('users_update', ({ users }) => setOnlineUsers(users));
      socket.on('new_message', (msg) => setMessages((prev) => [...prev, msg]));

      socket.on('user_joined', ({ username }) => toast(`${username} joined the room`, { icon: '👋' }));
      socket.on('user_left', ({ username }) => toast(`${username} left`, { icon: '🚪' }));

      socket.on('user_typing', ({ username }) => {
        setTypingUsers((prev) => [...new Set([...prev, username])]);
      });
      socket.on('user_stopped_typing', ({ username }) => {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      });

      socket.on('error', ({ message }) => toast.error(message));
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { roomId, username: user.username });
        socketRef.current.off('room_joined');
        socketRef.current.off('code_update');
        socketRef.current.off('language_update');
        socketRef.current.off('users_update');
        socketRef.current.off('new_message');
        socketRef.current.off('user_joined');
        socketRef.current.off('user_left');
        socketRef.current.off('user_typing');
        socketRef.current.off('user_stopped_typing');
        socketRef.current.off('error');
      }
    };
  }, []); // eslint-disable-line 

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    if (socketRef.current) {
      socketRef.current.emit('code_change', { roomId, code: newCode });
    }
  }, [roomId]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (socketRef.current) {
      socketRef.current.emit('language_change', { roomId, language: lang });
    }
  };

  const handleSendMessage = (content) => {
    if (!content.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      roomId,
      userId: user._id,
      username: user.username,
      content,
    });
  };

  const handleTyping = (isTyping) => {
    if (!socketRef.current) return;
    if (isTyping) {
      socketRef.current.emit('typing_start', { roomId, username: user.username });
    } else {
      socketRef.current.emit('typing_stop', { roomId, username: user.username });
    }
  };

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', { roomId, username: user.username });
    }
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="room-loading">
        <div className="room-loading-inner">
          <div className="loading-hex glow-anim">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="#e63946" strokeWidth="2" fill="rgba(230,57,70,0.1)" />
              <circle cx="12" cy="12" r="3" fill="#e63946" />
            </svg>
          </div>
          <p className="loading-text pulse">Connecting to room…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page">
      {/* Top Bar */}
      <header className="room-header">
        <div className="room-header-left">
          <button className="btn btn-ghost btn-sm" onClick={handleLeave}>← Leave</button>
          <div className="room-title-wrap">
            <h2 className="room-title">{room?.name || roomId}</h2>
            <span className="badge badge-gray room-id">ID: {roomId}</span>
          </div>
        </div>
        <div className="room-header-center">
          <select
            className="lang-select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="room-header-right">
          <span className="online-pill">
            <div className="dot-online" />
            {onlineUsers.length} online
          </span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="room-body">
        {/* Editor */}
        <div className="editor-wrap">
          <CodeEditor code={code} language={language} onChange={handleCodeChange} />
        </div>

        {/* Sidebar */}
        <aside className="room-sidebar">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
              {messages.length > 0 && <span className="tab-count">{messages.length}</span>}
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
              <span className="tab-count">{onlineUsers.length}</span>
            </button>
          </div>

          <div className="sidebar-content">
            {activeTab === 'chat' ? (
              <ChatPanel
                messages={messages}
                typingUsers={typingUsers}
                currentUser={user}
                onSend={handleSendMessage}
                onTyping={handleTyping}
              />
            ) : (
              <UsersPanel users={onlineUsers} currentUser={user} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
