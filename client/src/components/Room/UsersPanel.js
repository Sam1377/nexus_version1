import React from 'react';
import './UsersPanel.css';

export default function UsersPanel({ users, currentUser }) {
  return (
    <div className="users-panel">
      <div className="users-header">
        <span className="users-count">{users.length} online</span>
      </div>
      <div className="users-list">
        {users.map((u, i) => {
          const isMe = u.userId === currentUser?._id || u.username === currentUser?.username;
          return (
            <div key={i} className="user-item">
              <div className="user-avatar">
                {u.username?.[0]?.toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {u.username}
                  {isMe && <span className="you-tag">you</span>}
                </span>
                <span className="user-status">Active now</span>
              </div>
              <div className="dot-online" />
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="users-empty">No one else is here yet.</div>
        )}
      </div>
    </div>
  );
}
