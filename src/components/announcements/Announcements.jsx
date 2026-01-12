import React, { useState, useEffect } from 'react';
import AnnouncementForm from './AnnouncementForm';
import { storage } from '../../utils/mockData';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    audience: 'all',
    status: 'all',
    search: ''
  });

  // Priority levels configuration
  const priorityConfig = {
    critical: { label: 'Critical', color: '#dc3545', icon: '🚨' },
    important: { label: 'Important', color: '#fd7e14', icon: '⚠️' },
    regular: { label: 'Regular', color: '#007bff', icon: '📢' },
    informational: { label: 'Informational', color: '#6c757d', icon: 'ℹ️' }
  };

  // Categories configuration
  const categoriesConfig = {
    academic: { label: 'Academic', color: '#28a745' },
    event: { label: 'Event', color: '#17a2b8' },
    sports: { label: 'Sports', color: '#ffc107' },
    clubs: { label: 'Clubs', color: '#e83e8c' },
    holiday: { label: 'Holiday', color: '#6f42c1' },
    emergency: { label: 'Emergency', color: '#dc3545' },
    general: { label: 'General', color: '#6c757d' }
  };

  // Audience options
  const audienceOptions = ['All', 'Students', 'Parents', 'Staff', 'Teachers', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  // Status options
  const statusOptions = {
    draft: { label: 'Draft', color: '#6c757d' },
    pending: { label: 'Pending Approval', color: '#ffc107' },
    published: { label: 'Published', color: '#28a745' },
    archived: { label: 'Archived', color: '#6c757d' }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [announcements, filters]);

  const fetchAnnouncements = () => {
    const data = storage.get('announcements') || [];
    // Auto-expire announcements
    const currentDate = new Date();
    const validAnnouncements = data.filter(ann => {
      if (ann.expiryDate && new Date(ann.expiryDate) < currentDate) {
        return ann.status === 'archived'; // Keep archived announcements
      }
      return true;
    });
    
    // Update storage if some announcements expired
    if (validAnnouncements.length !== data.length) {
      storage.set('announcements', validAnnouncements);
    }
    
    setAnnouncements(validAnnouncements);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...announcements];
    
    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(ann => ann.category === filters.category);
    }
    
    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(ann => ann.priority === filters.priority);
    }
    
    // Filter by audience
    if (filters.audience !== 'all') {
      filtered = filtered.filter(ann => 
        ann.targetAudience && (ann.targetAudience.includes(filters.audience) || 
        ann.targetAudience.includes('All'))
      );
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(ann => ann.status === filters.status);
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(ann => 
        ann.title.toLowerCase().includes(searchLower) ||
        (ann.content && ann.content.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredAnnouncements(filtered);
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setShowForm(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleArchive = (id) => {
    const updatedAnnouncements = announcements.map(ann => 
      ann.id === id ? { ...ann, status: 'archived', updatedAt: new Date().toISOString() } : ann
    );
    storage.set('announcements', updatedAnnouncements);
    setAnnouncements(updatedAnnouncements);
    setSuccessMessage('Announcement archived successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this announcement? This action cannot be undone.')) {
      const updatedAnnouncements = announcements.filter(ann => ann.id !== id);
      storage.set('announcements', updatedAnnouncements);
      setAnnouncements(updatedAnnouncements);
      setSuccessMessage('Announcement deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handlePublish = (id) => {
    const updatedAnnouncements = announcements.map(ann => 
      ann.id === id ? { 
        ...ann, 
        status: 'published', 
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString() 
      } : ann
    );
    storage.set('announcements', updatedAnnouncements);
    setAnnouncements(updatedAnnouncements);
    setSuccessMessage('Announcement published successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const handleFormSubmit = (announcementData) => {
    let updatedAnnouncements;
    
    if (editingAnnouncement) {
      // Update existing announcement
      updatedAnnouncements = announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { 
              ...announcementData, 
              id: editingAnnouncement.id,
              updatedAt: new Date().toISOString(),
              createdAt: editingAnnouncement.createdAt,
              publishedAt: editingAnnouncement.publishedAt,
              // Keep version history
              version: (editingAnnouncement.version || 1) + 1,
              previousVersions: [
                ...(editingAnnouncement.previousVersions || []),
                {
                  id: editingAnnouncement.id,
                  title: editingAnnouncement.title,
                  content: editingAnnouncement.content,
                  updatedAt: editingAnnouncement.updatedAt,
                  version: editingAnnouncement.version || 1
                }
              ]
            }
          : ann
      );
      setSuccessMessage('Announcement updated successfully!');
    } else {
      // Create new announcement
      const newAnnouncement = {
        ...announcementData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: announcementData.status || 'draft',
        version: 1,
        views: 0,
        readConfirmations: []
      };
      
      // Set publishedAt if status is published
      if (newAnnouncement.status === 'published') {
        newAnnouncement.publishedAt = new Date().toISOString();
      }
      
      updatedAnnouncements = [...announcements, newAnnouncement];
      setSuccessMessage('Announcement created successfully!');
    }
    
    storage.set('announcements', updatedAnnouncements);
    setAnnouncements(updatedAnnouncements);
    setShowForm(false);
    setEditingAnnouncement(null);
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getPriorityBadge = (priority) => {
    const config = priorityConfig[priority] || priorityConfig.regular;
    return (
      <span 
        className="badge priority-badge" 
        style={{ 
          backgroundColor: config.color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px'
        }}
      >
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = statusOptions[status] || statusOptions.draft;
    return (
      <span 
        className="badge status-badge" 
        style={{ 
          backgroundColor: config.color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px'
        }}
      >
        {config.label}
      </span>
    );
  };

  const getAudienceBadges = (audiences) => {
    if (!audiences || audiences.length === 0) return 'All';
    
    return audiences.map((audience, index) => (
      <span 
        key={index} 
        className="badge audience-badge"
        style={{ 
          backgroundColor: '#e9ecef',
          color: '#495057',
          marginRight: '4px',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '11px',
          display: 'inline-block',
          marginBottom: '2px'
        }}
      >
        {audience}
      </span>
    ));
  };

  const handleViewDetails = (announcement) => {
    // Increment view count
    const updatedAnnouncements = announcements.map(ann => 
      ann.id === announcement.id 
        ? { ...ann, views: (ann.views || 0) + 1 }
        : ann
    );
    storage.set('announcements', updatedAnnouncements);
    setAnnouncements(updatedAnnouncements);
    
    // Show announcement details modal (you'll need to implement this)
    console.log('View details:', announcement);
    alert(`Viewing: ${announcement.title}\n\n${announcement.content}`);
  };

  const getRowStyle = (priority) => {
    const borderColors = {
      critical: '#dc3545',
      important: '#fd7e14',
      regular: '#007bff',
      informational: '#6c757d'
    };
    
    return {
      borderLeft: `4px solid ${borderColors[priority] || '#6c757d'}`,
      backgroundColor: 'white'
    };
  };

  const getContainerStyle = () => ({
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  });

  const getFiltersPanelStyle = () => ({
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #dee2e6'
  });

  const getFilterRowStyle = () => ({
    display: 'flex',
    gap: '15px',
    marginTop: '15px'
  });

  const getFilterGroupStyle = () => ({
    flex: 1
  });

  const getStatsSummaryStyle = () => ({
    display: 'flex',
    gap: '15px',
    marginBottom: '20px'
  });

  const getStatCardStyle = () => ({
    flex: 1,
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #dee2e6'
  });

  const getActionButtonsStyle = () => ({
    display: 'flex',
    gap: '5px'
  });

  const getAnnouncementTitleStyle = () => ({
    maxWidth: '250px'
  });

  const getAnnouncementPreviewStyle = () => ({
    color: '#6c757d',
    fontSize: '12px',
    marginTop: '4px'
  });

  if (loading) {
    return <div className="spinner">Loading...</div>;
  }

  return (
    <div style={getContainerStyle()}>
      <div className="header" style={{ marginBottom: '20px' }}>
        <h1>Announcements Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            <span role="img" aria-label="add">➕</span> New Announcement
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ 
          padding: '10px 15px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}

      {/* Filter Controls */}
      <div style={getFiltersPanelStyle()}>
        <div style={getFilterGroupStyle()}>
          <input
            type="text"
            placeholder="Search announcements..."
            className="form-control"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da' }}
          />
        </div>
        
        <div style={getFilterRowStyle()}>
          <div style={getFilterGroupStyle()}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category</label>
            <select 
              className="form-control" 
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da' }}
            >
              <option value="all">All Categories</option>
              {Object.entries(categoriesConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          
          <div style={getFilterGroupStyle()}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Priority</label>
            <select 
              className="form-control" 
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da' }}
            >
              <option value="all">All Priorities</option>
              {Object.entries(priorityConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          
          <div style={getFilterGroupStyle()}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Audience</label>
            <select 
              className="form-control" 
              value={filters.audience}
              onChange={(e) => handleFilterChange('audience', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da' }}
            >
              <option value="all">All Audiences</option>
              {audienceOptions.map(audience => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
          </div>
          
          <div style={getFilterGroupStyle()}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status</label>
            <select 
              className="form-control" 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da' }}
            >
              <option value="all">All Statuses</option>
              {Object.entries(statusOptions).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div style={getStatsSummaryStyle()}>
        <div style={getStatCardStyle()}>
          <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold' }}>
            {announcements.filter(a => a.status === 'published').length}
          </span>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Published</span>
        </div>
        <div style={getStatCardStyle()}>
          <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold' }}>
            {announcements.filter(a => a.status === 'draft').length}
          </span>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Drafts</span>
        </div>
        <div style={getStatCardStyle()}>
          <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold' }}>
            {announcements.filter(a => a.status === 'pending').length}
          </span>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Pending</span>
        </div>
        <div style={getStatCardStyle()}>
          <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold' }}>
            {announcements.filter(a => a.priority === 'critical').length}
          </span>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Critical</span>
        </div>
      </div>

      <div className="table-container" style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div className="table-header" style={{ 
          padding: '15px 20px', 
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>Announcements ({filteredAnnouncements.length})</h2>
          <div className="table-actions">
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setFilters({
                category: 'all',
                priority: 'all',
                audience: 'all',
                status: 'all',
                search: ''
              })}
              style={{ 
                padding: '5px 10px', 
                border: '1px solid #6c757d', 
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#6c757d'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {filteredAnnouncements.length === 0 ? (
          <div className="empty-state" style={{ 
            padding: '40px 20px', 
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <span role="img" aria-label="no announcements" style={{ fontSize: '48px' }}>📢</span>
            <h3 style={{ margin: '10px 0 5px 0' }}>No announcements found</h3>
            <p>Try adjusting your filters or create a new announcement</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Priority</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Title</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Audience</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Schedule</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Views</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map((announcement) => (
                  <tr 
                    key={announcement.id} 
                    style={getRowStyle(announcement.priority)}
                  >
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                      {getPriorityBadge(announcement.priority)}
                    </td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                      <div style={getAnnouncementTitleStyle()}>
                        <strong>{announcement.title}</strong>
                        <div style={getAnnouncementPreviewStyle()}>
                          {announcement.content ? announcement.content.substring(0, 60) + '...' : 'No content'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                      <span className="badge category-badge" style={{ 
                        backgroundColor: categoriesConfig[announcement.category]?.color || '#6c757d',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {categoriesConfig[announcement.category]?.label || announcement.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                      <div className="audience-list">
                        {getAudienceBadges(announcement.targetAudience)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                      {getStatusBadge(announcement.status)}
                    </td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                      <div className="schedule-info">
                        {announcement.publishDate ? (
                          <div>
                            <div>Publish: {new Date(announcement.publishDate).toLocaleDateString()}</div>
                            {announcement.expiryDate && (
                              <div className="text-muted small" style={{ color: '#6c757d', fontSize: '11px' }}>
                                Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          'Immediate'
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                      {announcement.views || 0}
                    </td>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>
                      <div style={getActionButtonsStyle()}>
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewDetails(announcement)}
                          title="View Details"
                          style={{ 
                            padding: '4px 8px', 
                            backgroundColor: '#17a2b8', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <span role="img" aria-label="view">👁️</span>
                        </button>
                        
                        {announcement.status === 'draft' && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handlePublish(announcement.id)}
                            title="Publish"
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#28a745', 
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <span role="img" aria-label="publish">📤</span>
                          </button>
                        )}
                        
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(announcement)}
                          title="Edit"
                          style={{ 
                            padding: '4px 8px', 
                            backgroundColor: '#6c757d', 
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <span role="img" aria-label="edit">✏️</span>
                        </button>
                        
                        {announcement.status !== 'archived' ? (
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handleArchive(announcement.id)}
                            title="Archive"
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#ffc107', 
                              color: '#212529',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <span role="img" aria-label="archive">📁</span>
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(announcement.id)}
                            title="Delete Permanently"
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#dc3545', 
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <span role="img" aria-label="delete">🗑️</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          priorityConfig={priorityConfig}
          categoriesConfig={categoriesConfig}
          audienceOptions={audienceOptions}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
};

export default Announcements;