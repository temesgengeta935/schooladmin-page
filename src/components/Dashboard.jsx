import React, { useState, useEffect } from 'react';
import { storage } from '../utils/mockData';

const Dashboard = () => {
  const [stats, setStats] = useState({
    announcements: 0,
    events: 0,
    teachers: 0,
    departments: 0,
    gallery: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => {
    const announcements = storage.get('announcements') || [];
    const events = storage.get('events') || [];
    const teachers = storage.get('teachers') || [];
    const departments = storage.get('departments') || [];
    const gallery = storage.get('gallery') || [];
    const messages = storage.get('messages') || [];

    setStats({
      announcements: announcements.length,
      events: events.length,
      teachers: teachers.length,
      departments: departments.length,
      gallery: gallery.length,
      messages: messages.length
    });
    setLoading(false);
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            <span role="img" aria-label="refresh">🔄</span> Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <span role="img" aria-label="announcements">📢</span>
          </div>
          <div className="stat-content">
            <h3>Announcements</h3>
            <div className="stat-number">{stats.announcements}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <span role="img" aria-label="events">📅</span>
          </div>
          <div className="stat-content">
            <h3>Events</h3>
            <div className="stat-number">{stats.events}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <span role="img" aria-label="teachers">👨‍🏫</span>
          </div>
          <div className="stat-content">
            <h3>Teachers</h3>
            <div className="stat-number">{stats.teachers}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <span role="img" aria-label="departments">🏛️</span>
          </div>
          <div className="stat-content">
            <h3>Departments</h3>
            <div className="stat-number">{stats.departments}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <span role="img" aria-label="gallery">🖼️</span>
          </div>
          <div className="stat-content">
            <h3>Gallery Items</h3>
            <div className="stat-number">{stats.gallery}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
            <span role="img" aria-label="messages">📧</span>
          </div>
          <div className="stat-content">
            <h3>Messages</h3>
            <div className="stat-number">{stats.messages}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Recent Activity</h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <p>Your recent activities will appear here</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            This is a frontend-only demo. All data is stored in your browser's localStorage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;