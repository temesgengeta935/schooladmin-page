import React, { useState, useEffect } from 'react';

const AnnouncementForm = ({ 
  announcement, 
  onSubmit, 
  onClose,
  priorityConfig,
  categoriesConfig,
  audienceOptions,
  statusOptions
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'regular',
    targetAudience: ['All'],
    status: 'draft',
    publishDate: '',
    expiryDate: '',
    attachments: [],
    isRecurring: false,
    recurrencePattern: '',
    featured: false,
    notifyUsers: true,
    tags: []
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        category: announcement.category || 'general',
        priority: announcement.priority || 'regular',
        targetAudience: announcement.targetAudience || ['All'],
        status: announcement.status || 'draft',
        publishDate: announcement.publishDate || '',
        expiryDate: announcement.expiryDate || '',
        attachments: announcement.attachments || [],
        isRecurring: announcement.isRecurring || false,
        recurrencePattern: announcement.recurrencePattern || '',
        featured: announcement.featured || false,
        notifyUsers: announcement.notifyUsers !== undefined ? announcement.notifyUsers : true,
        tags: announcement.tags || []
      });
    }
  }, [announcement]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAudienceChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        if (value === 'All') {
          return { ...prev, targetAudience: ['All'] };
        }
        const newAudience = prev.targetAudience.filter(a => a !== 'All');
        return { 
          ...prev, 
          targetAudience: [...newAudience, value]
        };
      } else {
        return { 
          ...prev, 
          targetAudience: prev.targetAudience.filter(a => a !== value)
        };
      }
    });
  };

  const handleTagChange = (e) => {
    const { value } = e.target;
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleAttachment = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file
    }));
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (id) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate publish date if scheduled
    if (formData.publishDate && new Date(formData.publishDate) < new Date()) {
      alert('Publish date cannot be in the past');
      return;
    }

    // Validate expiry date if set
    if (formData.expiryDate && formData.publishDate && 
        new Date(formData.expiryDate) <= new Date(formData.publishDate)) {
      alert('Expiry date must be after publish date');
      return;
    }

    // If immediate publish, set publish date to now
    const finalData = {
      ...formData,
      publishDate: formData.publishDate || (formData.status === 'published' ? new Date().toISOString() : '')
    };

    onSubmit(finalData);
  };

  // Calculate character count for content
  const contentLength = formData.content.length;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div className="modal-header" style={{
          padding: '20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6c757d'
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Basic Information Section */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#495057' }}>Basic Information</h3>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter announcement title"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="category" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  {Object.entries(categoriesConfig || {
                    general: { label: 'General', color: '#6c757d' },
                    academic: { label: 'Academic', color: '#28a745' },
                    event: { label: 'Event', color: '#17a2b8' },
                    sports: { label: 'Sports', color: '#ffc107' },
                    emergency: { label: 'Emergency', color: '#dc3545' }
                  }).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="priority" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Priority Level *
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  {Object.entries(priorityConfig || {
                    critical: { label: 'Critical', color: '#dc3545', icon: '🚨' },
                    important: { label: 'Important', color: '#fd7e14', icon: '⚠️' },
                    regular: { label: 'Regular', color: '#007bff', icon: '📢' },
                    informational: { label: 'Informational', color: '#6c757d', icon: 'ℹ️' }
                  }).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Audience Targeting Section */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#495057' }}>Audience Targeting</h3>
            <div style={{ 
              border: '1px solid #dee2e6', 
              borderRadius: '4px', 
              padding: '15px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.targetAudience.includes('All')}
                    onChange={handleAudienceChange}
                    value="All"
                  />
                  <span><strong>All Users</strong> (Everyone in the school community)</span>
                </label>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                {(audienceOptions || ['Students', 'Parents', 'Staff', 'Teachers']).map(audience => (
                  audience !== 'All' && (
                    <label key={audience} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={formData.targetAudience.includes(audience)}
                        onChange={handleAudienceChange}
                        value={audience}
                        disabled={formData.targetAudience.includes('All')}
                      />
                      <span>{audience}</span>
                    </label>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#495057' }}>
              Content *
              <span style={{ 
                float: 'right', 
                fontSize: '14px', 
                color: contentLength > 2000 ? '#dc3545' : '#6c757d',
                fontWeight: 'normal'
              }}>
                {contentLength} / 2000 characters
              </span>
            </h3>
            <div className="form-group">
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="8"
                placeholder="Enter detailed announcement content..."
                maxLength="2000"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
            
            {/* Rich text toolbar (simplified) */}
            <div style={{ 
              display: 'flex', 
              gap: '5px', 
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              <button type="button" style={{ padding: '4px 8px', border: '1px solid #ced4da', borderRadius: '3px', background: 'white' }} title="Bold">B</button>
              <button type="button" style={{ padding: '4px 8px', border: '1px solid #ced4da', borderRadius: '3px', background: 'white' }} title="Italic">I</button>
              <button type="button" style={{ padding: '4px 8px', border: '1px solid #ced4da', borderRadius: '3px', background: 'white' }} title="Underline">U</button>
              <button type="button" style={{ padding: '4px 8px', border: '1px solid #ced4da', borderRadius: '3px', background: 'white' }} title="Bullet List">•</button>
              <button type="button" style={{ padding: '4px 8px', border: '1px solid #ced4da', borderRadius: '3px', background: 'white' }} title="Numbered List">1.</button>
              <button type="button" style={{ padding: '4px 8px', border: '1px solid #ced4da', borderRadius: '3px', background: 'white' }} title="Link">🔗</button>
            </div>
          </div>

          {/* Scheduling Section */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#495057' }}>Scheduling</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="publishDate" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="publishDate"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                  Leave empty for immediate publication
                </small>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="expiryDate" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                  Announcement will auto-expire on this date
                </small>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
              />
              <label htmlFor="isRecurring">This is a recurring announcement</label>
            </div>

            {formData.isRecurring && (
              <div className="form-group">
                <label htmlFor="recurrencePattern" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Recurrence Pattern
                </label>
                <select
                  id="recurrencePattern"
                  name="recurrencePattern"
                  value={formData.recurrencePattern}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  <option value="">Select pattern</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#495057' }}>Attachments</h3>
            <div style={{ 
              border: '2px dashed #dee2e6', 
              borderRadius: '4px', 
              padding: '20px',
              textAlign: 'center'
            }}>
              <input
                type="file"
                id="attachments"
                multiple
                onChange={handleAttachment}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="attachments" style={{
                display: 'block',
                cursor: 'pointer',
                color: '#007bff'
              }}>
                <span role="img" aria-label="upload">📎</span> Click to upload files
                <br />
                <small style={{ color: '#6c757d' }}>PDF, DOC, Images up to 10MB each</small>
              </label>
            </div>

            {formData.attachments.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Uploaded Files:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.attachments.map(attachment => (
                    <div key={attachment.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <span style={{ fontSize: '14px' }}>
                        <span role="img" aria-label="file">📄</span> {attachment.name}
                        <small style={{ color: '#6c757d', marginLeft: '10px' }}>
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#495057' }}>Advanced Options</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  {Object.entries(statusOptions || {
                    draft: { label: 'Draft', color: '#6c757d' },
                    pending: { label: 'Pending Approval', color: '#ffc107' },
                    published: { label: 'Published', color: '#28a745' }
                  }).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleTagChange}
                  placeholder="exam, holiday, sports day"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                  Separate tags with commas
                </small>
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <span>Mark as Featured Announcement</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="notifyUsers"
                  name="notifyUsers"
                  checked={formData.notifyUsers}
                  onChange={handleChange}
                />
                <span>Send email notifications to selected audience</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #dee2e6'
          }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #6c757d',
                borderRadius: '4px',
                backgroundColor: '#6c757d',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                border: '1px solid #007bff',
                borderRadius: '4px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {announcement ? 'Update Announcement' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;