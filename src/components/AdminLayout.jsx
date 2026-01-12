import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = ({ onLogout }) => {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>School Admin</h2>
          <p>Administration Panel</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                <span role="img" aria-label="dashboard">📊</span> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/announcements" className={({ isActive }) => isActive ? 'active' : ''}>
                <span role="img" aria-label="announcements">📢</span> Announcements
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/events" className={({ isActive }) => isActive ? 'active' : ''}>
                <span role="img" aria-label="events">📅</span> Events
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/teachers" className={({ isActive }) => isActive ? 'active' : ''}>
                <span role="img" aria-label="teachers">👨‍🏫</span> Teachers
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/departments" className={({ isActive }) => isActive ? 'active' : ''}>
                <span role="img" aria-label="departments">🏛️</span> Departments
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/gallery" className={({ isActive }) => isActive ? 'active' : ''}>
                <span role="img" aria-label="gallery">🖼️</span> Gallery
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/messages" className={({ isActive }) => isActive ? 'active' : ''}>
                <span role="img" aria-label="messages">📧</span> Messages
              </NavLink>
            </li>
          </ul>
          <button 
            className="btn btn-danger logout-btn" 
            onClick={onLogout}
          >
            <span role="img" aria-label="logout">🚪</span> Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;