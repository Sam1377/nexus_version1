import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="#e63946" strokeWidth="2" fill="rgba(230,57,70,0.1)" />
              <circle cx="12" cy="12" r="3" fill="#e63946" />
            </svg>
          </div>
          <span className="brand-name">Nexus</span>
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
            Profile
          </Link>
        </div>

        <div className="navbar-actions">
          {user && (
            <>
              <div className="user-chip">
                <div className="dot-online" />
                <span className="user-chip-name">@{user.username}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
