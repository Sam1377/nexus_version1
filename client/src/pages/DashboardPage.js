import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import Navbar from '../components/Layout/Navbar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'html', 'rust'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '', language: 'javascript' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.rooms);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/rooms', createForm);
      toast.success('Room created!');
      navigate(`/room/${res.data.room.roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const id = joinId.trim().toUpperCase();
    if (!id) return toast.error('Enter a Room ID');
    navigate(`/room/${id}`);
  };

  const handleGenerate = () => {
    const id = uuidv4().slice(0, 8).toUpperCase();
    setJoinId(id);
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        {/* Header */}
        <section className="dashboard-hero fade-in">
          <div className="hero-text">
            <p className="hero-greeting">Good to see you, <span className="red">{user?.username}</span></p>
            <h1 className="hero-title">Your Coding Rooms</h1>
            <p className="hero-desc">Create or join a room to start collaborating in real time.</p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? 'Cancel' : '+ New Room'}
            </button>
          </div>
        </section>

        {/* Create Room Panel */}
        {showCreate && (
          <div className="create-panel glass-card fade-in">
            <h3 className="panel-title">Create a Room</h3>
            <form onSubmit={handleCreate} className="create-form">
              <div className="create-row">
                <div className="form-group">
                  <label className="form-label">Room Name</label>
                  <input
                    className="input"
                    placeholder="My Coding Session"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    className="input"
                    value={createForm.language}
                    onChange={(e) => setCreateForm({ ...createForm, language: e.target.value })}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input
                  className="input"
                  placeholder="What are you building?"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create & Enter Room'}
              </button>
            </form>
          </div>
        )}

        {/* Join Room */}
        <div className="join-panel glass-card fade-in">
          <h3 className="panel-title">Join a Room</h3>
          <form onSubmit={handleJoin} className="join-form">
            <input
              className="input"
              placeholder="Enter Room ID (e.g. A1B2C3D4)"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
            />
            <button className="btn btn-ghost" type="button" onClick={handleGenerate}>
              Generate ID
            </button>
            <button className="btn btn-primary" type="submit">
              Join Room
            </button>
          </form>
        </div>

        {/* Rooms List */}
        <section className="rooms-section">
          <div className="section-header">
            <h2 className="section-title">Public Rooms</h2>
            <span className="badge badge-gray">{rooms.length} active</span>
          </div>

          {loading ? (
            <div className="rooms-loading">
              {[1, 2, 3].map((i) => <div key={i} className="room-skeleton" />)}
            </div>
          ) : rooms.length === 0 ? (
            <div className="rooms-empty glass-card">
              <p>No public rooms yet. Create the first one!</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div key={room._id} className="room-card glass-card fade-in">
                  <div className="room-card-top">
                    <div className="room-card-info">
                      <h3 className="room-card-name">{room.name}</h3>
                      {room.description && <p className="room-card-desc">{room.description}</p>}
                    </div>
                    <span className="badge badge-red">{room.language}</span>
                  </div>
                  <div className="room-card-bottom">
                    <div className="room-card-meta">
                      <span className="meta-item">by @{room.owner?.username}</span>
                      <span className="meta-dot">·</span>
                      <span className="meta-item">ID: {room.roomId}</span>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/room/${room.roomId}`)}>
                      Enter →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
