import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import Announcements from './components/announcements/Announcements';
import Events from './components/events/Events';
import Teachers from './components/teachers/Teachers';
import Departments from './components/departments/Departments';
import Gallery from './components/gallery/Gallery';
import Messages from './components/messages/Messages';
import { initializeStorage } from './utils/mockData';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize localStorage with mock data
    initializeStorage();

    // Check for existing session
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('adminToken', 'mock-jwt-token');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/admin/dashboard" /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/admin/*"
          element={isAuthenticated ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="events" element={<Events />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="departments" element={<Departments />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="messages" element={<Messages />} />
          <Route path="" element={<Navigate to="dashboard" />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
