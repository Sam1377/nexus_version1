import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Welcome to Nexus.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow" />
      </div>

      <div className="auth-card glass-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="#e63946" strokeWidth="2" fill="rgba(230,57,70,0.15)" />
              <circle cx="12" cy="12" r="3" fill="#e63946" />
            </svg>
          </div>
          <h1 className="auth-title">Nexus</h1>
          <p className="auth-subtitle">Create your developer account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="input"
              type="text"
              placeholder="devname"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="dev@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
