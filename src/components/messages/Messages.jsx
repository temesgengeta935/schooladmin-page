import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/mockData';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [newMessage, setNewMessage] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    read: false
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = () => {
    const data = storage.get('messages') || [];
    setMessages(data);
    setLoading(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const updatedMessages = messages.filter(msg => msg.id !== id);
      storage.set('messages', updatedMessages);
      setMessages(updatedMessages);
      setSuccessMessage('Message deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleMarkAsRead = (id) => {
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    );
    storage.set('messages', updatedMessages);
    setMessages(updatedMessages);
  };

  const handleReply = (message) => {
    setSelectedMessage(message);
    setReplyContent(`Dear ${message.name},\n\nThank you for your message regarding "${message.subject}".\n\n`);
    setShowReplyForm(true);
  };

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      alert('Please enter reply content');
      return;
    }

    // In a real app, this would send an email
    // For now, we'll just mark it as replied and show success
    const updatedMessages = messages.map(msg => 
      msg.id === selectedMessage.id 
        ? { 
            ...msg, 
            replied: true, 
            repliedAt: new Date().toISOString(),
            replyContent: replyContent,
            read: true 
          }
        : msg
    );
    
    storage.set('messages', updatedMessages);
    setMessages(updatedMessages);
    
    // Simulate sending email
    console.log('Reply email would be sent:', {
      to: selectedMessage.email,
      subject: `Re: ${selectedMessage.subject}`,
      body: replyContent
    });
    
    setSuccessMessage(`Reply sent to ${selectedMessage.email} successfully!`);
    setShowReplyForm(false);
    setSelectedMessage(null);
    setReplyContent('');
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAddMessage = () => {
    if (!newMessage.name || !newMessage.email || !newMessage.subject || !newMessage.message) {
      alert('Please fill all required fields');
      return;
    }

    const newMessageObj = {
      ...newMessage,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
      replied: false
    };

    const updatedMessages = [...messages, newMessageObj];
    storage.set('messages', updatedMessages);
    setMessages(updatedMessages);
    
    setSuccessMessage('Test message added successfully!');
    setShowAddForm(false);
    setNewMessage({
      name: '',
      email: '',
      subject: '',
      message: '',
      read: false
    });
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const fillTestData = () => {
    const testNames = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Sarah Williams'];
    const testEmails = ['john@example.com', 'jane@example.com', 'robert@example.com', 'sarah@example.com'];
    const testSubjects = ['Admission Inquiry', 'Teacher Feedback', 'Event Question', 'General Question'];
    const testMessages = [
      'I would like to inquire about the admission process for the upcoming academic year.',
      'I wanted to provide feedback about my child\'s teacher this semester.',
      'Could you provide more details about the upcoming science fair?',
      'I have a general question about the school curriculum.'
    ];

    const randomIndex = Math.floor(Math.random() * testNames.length);
    
    setNewMessage({
      name: testNames[randomIndex],
      email: testEmails[randomIndex],
      subject: testSubjects[randomIndex],
      message: testMessages[randomIndex],
      read: false
    });
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  // Count unread messages
  const unreadCount = messages.filter(msg => !msg.read).length;
  const repliedCount = messages.filter(msg => msg.replied).length;

  return (
    <div>
      <div className="header">
        <div>
          <h1>Contact Messages</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {unreadCount > 0 && (
              <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                📥 {unreadCount} unread
              </span>
            )}
            {repliedCount > 0 && (
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                📤 {repliedCount} replied
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAddForm(true)}
            style={{ marginRight: '0.5rem' }}
          >
            <span role="img" aria-label="add">➕</span> Add Test Message
          </button>
          <button className="btn btn-primary" onClick={fetchMessages}>
            <span role="img" aria-label="refresh">🔄</span> Refresh
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {/* Add Message Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Test Message</h2>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={newMessage.name}
                onChange={(e) => setNewMessage({...newMessage, name: e.target.value})}
                placeholder="Enter sender name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={newMessage.email}
                onChange={(e) => setNewMessage({...newMessage, email: e.target.value})}
                placeholder="Enter sender email"
                required
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                placeholder="Enter message subject"
                required
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                rows="5"
                placeholder="Enter message content"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button 
                className="btn btn-secondary"
                onClick={fillTestData}
              >
                Fill with Test Data
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAddMessage}
              >
                Add Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Form Modal */}
      {showReplyForm && selectedMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Reply to Message</h2>
              <button className="close-btn" onClick={() => setShowReplyForm(false)}>×</button>
            </div>
            
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
              <p><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
              <p><strong>Subject:</strong> {selectedMessage.subject}</p>
              <p><strong>Message:</strong> {selectedMessage.message}</p>
            </div>

            <div className="form-group">
              <label>Your Reply *</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows="8"
                placeholder="Type your reply here..."
                required
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowReplyForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSendReply}
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <div>
            <h2>All Messages ({messages.length})</h2>
            {messages.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    const allRead = messages.map(msg => ({ ...msg, read: true }));
                    storage.set('messages', allRead);
                    setMessages(allRead);
                  }}
                >
                  Mark All as Read
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    if (window.confirm('Delete all messages? This cannot be undone.')) {
                      storage.set('messages', []);
                      setMessages([]);
                      setSuccessMessage('All messages deleted!');
                      setTimeout(() => setSuccessMessage(''), 3000);
                    }
                  }}
                >
                  Delete All
                </button>
              </div>
            )}
          </div>
        </div>
        
        {messages.length === 0 ? (
          <div className="empty-state">
            <span role="img" aria-label="no messages">📧</span>
            <h3>No messages yet</h3>
            <p>Messages from contact form will appear here</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddForm(true)}
              style={{ marginTop: '1rem' }}
            >
              Add Test Message
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr 
                  key={message.id} 
                  style={{ 
                    background: !message.read ? '#f8f9fa' : 'transparent',
                    opacity: message.replied ? 0.8 : 1
                  }}
                >
                  <td style={{ textAlign: 'center' }}>
                    {message.replied ? (
                      <span title="Replied" style={{ color: '#28a745', fontSize: '1.2rem' }}>📤</span>
                    ) : !message.read ? (
                      <span title="Unread" style={{ color: '#dc3545', fontSize: '1.2rem' }}>📥</span>
                    ) : (
                      <span title="Read" style={{ color: '#6c757d', fontSize: '1.2rem' }}>📭</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {message.name}
                      {!message.read && (
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          background: '#dc3545', 
                          borderRadius: '50%',
                          display: 'inline-block'
                        }}></span>
                      )}
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${message.email}`} style={{ color: '#007bff' }}>
                      {message.email}
                    </a>
                  </td>
                  <td>{message.subject}</td>
                  <td className="message-preview" title={message.message}>
                    {message.message.length > 50 ? `${message.message.substring(0, 50)}...` : message.message}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>
                      {new Date(message.createdAt).toLocaleDateString()}
                      <br />
                      <small style={{ color: '#6c757d' }}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => {
                          alert(`Full Message:\n\nName: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\nMessage: ${message.message}\nDate: ${new Date(message.createdAt).toLocaleString()}`);
                          handleMarkAsRead(message.id);
                        }}
                        title="View full message"
                      >
                        <span role="img" aria-label="view">👁️</span>
                      </button>
                      
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleReply(message)}
                        title="Reply to message"
                      >
                        <span role="img" aria-label="reply">↩️</span>
                      </button>
                      
                      {!message.read ? (
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleMarkAsRead(message.id)}
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            const updatedMessages = messages.map(msg => 
                              msg.id === message.id ? { ...msg, read: false } : msg
                            );
                            storage.set('messages', updatedMessages);
                            setMessages(updatedMessages);
                          }}
                          title="Mark as unread"
                        >
                          ✕
                        </button>
                      )}
                      
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(message.id)}
                        title="Delete message"
                      >
                        <span role="img" aria-label="delete">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Messages;