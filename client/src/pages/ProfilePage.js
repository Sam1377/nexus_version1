import React, { useState } from 'react';
import Navbar from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ bio: user?.bio || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initial = user?.username?.[0]?.toUpperCase();

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-main">
        <div className="profile-card glass-card fade-in">
          {/* Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {form.avatar ? (
                <img src={form.avatar} alt={user?.username} />
              ) : (
                <span className="avatar-initial">{initial}</span>
              )}
            </div>
            <div className="profile-identity">
              <h1 className="profile-username">@{user?.username}</h1>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badges">
                <span className="badge badge-red">Developer</span>
                <span className="badge badge-green">
                  <span className="dot-online" /> Online
                </span>
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Edit form */}
          <form onSubmit={handleSave} className="profile-form">
            <h3 className="section-title" style={{ marginBottom: 20 }}>Edit Profile</h3>

            <div className="form-group">
              <label className="form-label">Avatar URL</label>
              <input
                className="input"
                placeholder="https://example.com/avatar.jpg"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="input profile-bio"
                placeholder="Tell others about yourself…"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                maxLength={200}
              />
              <span className="char-count">{form.bio.length}/200</span>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>

          <div className="divider" />

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-val">{user?.roomsCreated?.length || 0}</span>
              <span className="stat-label">Rooms Created</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{user?.roomsJoined?.length || 0}</span>
              <span className="stat-label">Rooms Joined</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{new Date(user?.createdAt).getFullYear() || '—'}</span>
              <span className="stat-label">Member Since</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
