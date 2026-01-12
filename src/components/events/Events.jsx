import { useState, useEffect, useMemo } from 'react';
import EventForm from './EventForm';
import { storage } from '../../utils/mockData';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [bulkSelection, setBulkSelection] = useState([]);

  // Event categories for filtering
  const categories = [
    'all', 'academic', 'sports', 'cultural', 'parent-teacher',
    'holiday', 'exam', 'workshop', 'field-trip', 'ceremony', 'other'
  ];

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'past', label: 'Past' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'date', label: 'Date (Earliest)' },
    { value: 'date-desc', label: 'Date (Latest)' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'priority', label: 'Priority' },
    { value: 'category', label: 'Category' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    const data = storage.get('events') || [];
    setEvents(data);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(event => event.id !== id);
      storage.set('events', updatedEvents);
      setEvents(updatedEvents);
      setSuccessMessage('Event deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleBulkDelete = () => {
    if (bulkSelection.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${bulkSelection.length} selected event(s)?`)) {
      const updatedEvents = events.filter(event => !bulkSelection.includes(event.id));
      storage.set('events', updatedEvents);
      setEvents(updatedEvents);
      setBulkSelection([]);
      setSuccessMessage(`${bulkSelection.length} event(s) deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleToggleEventStatus = (id, status) => {
    const updatedEvents = events.map(event =>
      event.id === id ? { ...event, status } : event
    );
    storage.set('events', updatedEvents);
    setEvents(updatedEvents);
    setSuccessMessage(`Event ${status === 'cancelled' ? 'cancelled' : 'reactivated'}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleFormSubmit = (eventData) => {
    let updatedEvents;

    if (editingEvent) {
      updatedEvents = events.map(event =>
        event.id === editingEvent.id
          ? { ...eventData, id: editingEvent.id, updatedAt: new Date().toISOString() }
          : event
      );
      setSuccessMessage('Event updated successfully!');
    } else {
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'upcoming'
      };
      updatedEvents = [...events, newEvent];
      setSuccessMessage('Event created successfully!');
    }

    storage.set('events', updatedEvents);
    setEvents(updatedEvents);
    setShowForm(false);
    setEditingEvent(null);

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);

        switch (filterStatus) {
          case 'upcoming':
            return startTime > now && event.status !== 'cancelled';
          case 'ongoing':
            return startTime <= now && endTime >= now && event.status !== 'cancelled';
          case 'past':
            return endTime < now && event.status !== 'cancelled';
          case 'cancelled':
            return event.status === 'cancelled';
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startTime) - new Date(b.startTime);
        case 'date-desc':
          return new Date(b.startTime) - new Date(a.startTime);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2 };
          return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, filterCategory, filterStatus, sortBy]);

  const handleSelectAll = () => {
    if (bulkSelection.length === filteredAndSortedEvents.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(filteredAndSortedEvents.map(event => event.id));
    }
  };

  const handleSelectEvent = (id) => {
    setBulkSelection(prev =>
      prev.includes(id)
        ? prev.filter(eventId => eventId !== id)
        : [...prev, id]
    );
  };

  const handleExportEvents = (format) => {
    const eventsToExport = bulkSelection.length > 0
      ? events.filter(event => bulkSelection.includes(event.id))
      : filteredAndSortedEvents;

    let content;
    let mimeType;
    let filename = `maryouth-events-${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'csv':
        content = convertToCSV(eventsToExport);
        mimeType = 'text/csv';
        filename += '.csv';
        break;
      case 'json':
        content = JSON.stringify(eventsToExport, null, 2);
        mimeType = 'application/json';
        filename += '.json';
        break;
      case 'pdf':
        // In a real app, you would use a PDF generation library
        alert('PDF export would be implemented with a library like jsPDF');
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMessage(`Exported ${eventsToExport.length} events as ${format.toUpperCase()}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const convertToCSV = (evtList) => {
    const headers = ['Title', 'Description', 'Category', 'Start Time', 'End Time', 'Location', 'Contact Person', 'Status'];
    const rows = evtList.map(event => [
      `"${(event.title || '').replace(/"/g, '""')}"`,
      `"${(event.description || '').replace(/"/g, '""')}"`,
      event.category || '',
      new Date(event.startTime).toLocaleString(),
      new Date(event.endTime).toLocaleString(),
      event.location || 'N/A',
      event.contactPerson || 'N/A',
      event.status || 'upcoming'
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    if (event.status === 'cancelled') return 'cancelled';
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'past';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'danger',
      high: 'warning',
      normal: 'info'
    };
    return <span className={`badge badge-${colors[priority] || 'secondary'}`}>{priority}</span>;
  };

  const getCategoryBadge = (category) => {
    const categoryColors = {
      academic: 'primary',
      sports: 'success',
      cultural: 'warning',
      'parent-teacher': 'info',
      holiday: 'secondary',
      exam: 'danger',
      workshop: 'primary',
      'field-trip': 'success',
      ceremony: 'warning'
    };

    const label = (category || '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    return <span className={`badge badge-${categoryColors[category] || 'secondary'}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="events-container">
      {/* Header with actions */}
      <div className="events-header">
        <div className="header-left">
          <h1>School Events Calendar</h1>
          <p className="subtitle">Manage all events at Maryouth Academy</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            <span className="icon">➕</span> Create New Event
          </button>
          {bulkSelection.length > 0 && (
            <button className="btn btn-danger" onClick={handleBulkDelete}>
              <span className="icon">🗑️</span> Delete Selected ({bulkSelection.length})
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success">
          <span className="icon">✅</span> {successMessage}
        </div>
      )}

      {/* Filters & Controls */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <span className="icon">📋</span> Table
            </button>
            <button
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <span className="icon">📅</span> Calendar
            </button>
          </div>

          <div className="export-dropdown">
            <button
              className="btn btn-outline"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <span className="icon">📤</span> Export
            </button>
            {showExportOptions && (
              <div className="export-menu">
                <button onClick={() => handleExportEvents('csv')}>Export as CSV</button>
                <button onClick={() => handleExportEvents('json')}>Export as JSON</button>
                <button onClick={() => handleExportEvents('pdf')}>Export as PDF</button>
              </div>
            )}
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{events.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Upcoming</span>
            <span className="stat-value">
              {events.filter(e => getEventStatus(e) === 'upcoming').length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Ongoing</span>
            <span className="stat-value">
              {events.filter(e => getEventStatus(e) === 'ongoing').length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Past</span>
            <span className="stat-value">
              {events.filter(e => getEventStatus(e) === 'past').length}
            </span>
          </div>
        </div>
      </div>

      {/* Events List / Calendar View */}
      {viewMode === 'table' ? (
        <div className="table-container">
          <div className="table-responsive">
            <table className="events-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={bulkSelection.length === filteredAndSortedEvents.length && filteredAndSortedEvents.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Title & Description</th>
                  <th>Date & Time</th>
                  <th>Category & Priority</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">
                        <span className="icon">📅</span>
                        <h3>No events found</h3>
                        <p>Try adjusting your filters or create a new event</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedEvents.map((event) => {
                    const status = getEventStatus(event);
                    return (
                      <tr key={event.id} className={`event-row ${status}`}>
                        <td>
                          <input
                            type="checkbox"
                            checked={bulkSelection.includes(event.id)}
                            onChange={() => handleSelectEvent(event.id)}
                          />
                        </td>
                        <td>
                          <div className="event-info">
                            <div className="event-title">
                              {event.title}
                              {event.eventType === 'mandatory' && (
                                <span className="mandatory-badge">Mandatory</span>
                              )}
                            </div>
                            <div className="event-description">
                              {(event.description || '').substring(0, 80)}...
                            </div>
                            {event.targetGrades && event.targetGrades.length > 0 && (
                              <div className="grade-tags">
                                {event.targetGrades.slice(0, 3).map(grade => (
                                  <span key={grade} className="grade-tag">{grade}</span>
                                ))}
                                {event.targetGrades.length > 3 && (
                                  <span className="grade-tag">+{event.targetGrades.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="datetime-cell">
                            <div className="date">{new Date(event.startTime).toLocaleDateString()}</div>
                            <div className="time">
                              {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                              {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="category-cell">
                            <div>{getCategoryBadge(event.category)}</div>
                            <div>{getPriorityBadge(event.priority)}</div>
                          </div>
                        </td>
                        <td>
                          <div className="location-cell">
                            {event.location || 'N/A'}
                            {event.room && <div className="room">{event.room}</div>}
                          </div>
                        </td>
                        <td>
                          <div className={`status-badge ${status}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </div>
                          {event.registrationRequired === 'yes' && (
                            <div className="registration-badge">Registration Required</div>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => setSelectedEvent(event)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleEdit(event)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleDelete(event.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                            {status === 'upcoming' && event.status !== 'cancelled' && (
                              <button
                                className="btn-icon btn-warning"
                                onClick={() => handleToggleEventStatus(event.id, 'cancelled')}
                                title="Cancel Event"
                              >
                                🚫
                              </button>
                            )}
                            {event.status === 'cancelled' && (
                              <button
                                className="btn-icon btn-success"
                                onClick={() => handleToggleEventStatus(event.id, 'upcoming')}
                                title="Reactivate Event"
                              >
                                ↪️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Calendar View
        <div className="calendar-view">
          <div className="calendar-header">
            <h3>Calendar View</h3>
            <p>This would be a full calendar implementation in a real application</p>
          </div>
          <div className="calendar-placeholder">
            <span className="icon">📅</span>
            <p>Calendar view would show events by date with drag-and-drop capabilities</p>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal event-detail-modal">
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="event-detail-grid">
                <div className="detail-section">
                  <h4>Event Details</h4>
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{selectedEvent.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedEvent.eventType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Priority:</span>
                    <span className="detail-value">{selectedEvent.priority}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Date & Time</h4>
                  <div className="detail-row">
                    <span className="detail-label">Start:</span>
                    <span className="detail-value">
                      {new Date(selectedEvent.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">End:</span>
                    <span className="detail-value">
                      {new Date(selectedEvent.endTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Location</h4>
                  <div className="detail-row">
                    <span className="detail-label">Venue:</span>
                    <span className="detail-value">{selectedEvent.location || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Room:</span>
                    <span className="detail-value">{selectedEvent.room || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Contact Person:</span>
                    <span className="detail-value">{selectedEvent.contactPerson || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedEvent.contactEmail || 'N/A'}</span>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="detail-section full-width">
                    <h4>Description</h4>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.requirements && (
                  <div className="detail-section full-width">
                    <h4>Requirements</h4>
                    <p>{selectedEvent.requirements}</p>
                  </div>
                )}

                {selectedEvent.targetGrades && selectedEvent.targetGrades.length > 0 && (
                  <div className="detail-section">
                    <h4>Target Grades</h4>
                    <div className="grade-list">
                      {selectedEvent.targetGrades.map(grade => (
                        <span key={grade} className="grade-tag">{grade}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Registration</h4>
                  <div className="detail-row">
                    <span className="detail-label">Required:</span>
                    <span className="detail-value">{selectedEvent.registrationRequired}</span>
                  </div>
                  {selectedEvent.fee && (
                    <div className="detail-row">
                      <span className="detail-label">Fee:</span>
                      <span className="detail-value">${selectedEvent.fee}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => {
                setSelectedEvent(null);
                handleEdit(selectedEvent);
              }}>
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Events;