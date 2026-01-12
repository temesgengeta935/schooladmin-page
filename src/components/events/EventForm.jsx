import React, { useState, useEffect } from 'react';
import './EventForm.css';

const EventForm = ({ event, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    category: 'academic',
    eventType: 'general',
    location: '',
    room: '',
    imageUrl: '',
    dressCode: '',
    requirements: '',
    contactPerson: '',
    contactEmail: '',
    registrationRequired: 'no',
    registrationDeadline: '',
    fee: '',
    maxParticipants: '',
    permissionSlipRequired: false,
    parentAttendance: false,
    transportationProvided: false,
    priority: 'normal',
    visibility: 'public',
    isRecurring: false,
    recurrencePattern: 'weekly',
    recurrenceEndDate: ''
  });

  const [selectedGrades, setSelectedGrades] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradeOptions = ['Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

  useEffect(() => {
    if (event) {
      const eventData = {
        title: event.title || '',
        description: event.description || '',
        startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '',
        endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '',
        category: event.category || 'academic',
        eventType: event.eventType || 'general',
        location: event.location || '',
        room: event.room || '',
        imageUrl: event.imageUrl || '',
        dressCode: event.dressCode || '',
        requirements: event.requirements || '',
        contactPerson: event.contactPerson || '',
        contactEmail: event.contactEmail || '',
        registrationRequired: event.registrationRequired || 'no',
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
        fee: event.fee || '',
        maxParticipants: event.maxParticipants || '',
        permissionSlipRequired: event.permissionSlipRequired || false,
        parentAttendance: event.parentAttendance || false,
        transportationProvided: event.transportationProvided || false,
        priority: event.priority || 'normal',
        visibility: event.visibility || 'public',
        isRecurring: event.isRecurring || false,
        recurrencePattern: event.recurrencePattern || 'weekly',
        recurrenceEndDate: event.recurrenceEndDate || ''
      };
      
      setFormData(eventData);
      setSelectedGrades(event.targetGrades || []);
      setAttachments(event.attachments || []);
    } else {
      // Set default values for new event
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(endTime.getHours() + 2);
      
      setFormData(prev => ({
        ...prev,
        startTime: tomorrow.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16)
      }));
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024); // 5MB limit
    
    if (validFiles.length !== files.length) {
      alert('Some files exceed the 5MB limit and were not added.');
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    
    if (formData.startTime && formData.endTime) {
      if (new Date(formData.endTime) <= new Date(formData.startTime)) {
        errors.endTime = 'End time must be after start time';
      }
    }
    
    if (formData.registrationRequired === 'yes' && formData.registrationDeadline) {
      if (new Date(formData.registrationDeadline) > new Date(formData.startTime)) {
        errors.registrationDeadline = 'Registration deadline must be before event start';
      }
    }
    
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
    
    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      errors.imageUrl = 'Please enter a valid URL';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare form data with attachments
      const eventData = {
        ...formData,
        targetGrades: selectedGrades,
        attachments: attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          // In real implementation, upload files to server here
          url: URL.createObjectURL(file) // Temporary URL for preview
        }))
      };
      
      await onSubmit(eventData);
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGradeToggle = (grade) => {
    setSelectedGrades(prev =>
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const handleSelectAllGrades = () => {
    setSelectedGrades(gradeOptions);
  };

  const handleClearAllGrades = () => {
    setSelectedGrades([]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter event title"
                  className={formErrors.title ? 'error' : ''}
                />
                {formErrors.title && <span className="error-message">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="parent-teacher">Parent-Teacher Meeting</option>
                  <option value="holiday">Holiday</option>
                  <option value="exam">Exam Schedule</option>
                  <option value="workshop">Workshop/Seminar</option>
                  <option value="field-trip">Field Trip</option>
                  <option value="ceremony">Ceremony</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Enter detailed event description"
                className={formErrors.description ? 'error' : ''}
              />
              {formErrors.description && <span className="error-message">{formErrors.description}</span>}
            </div>
          </div>

          {/* Date & Time */}
          <div className="form-section">
            <h3>Date & Time</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className={formErrors.startTime ? 'error' : ''}
                />
                {formErrors.startTime && <span className="error-message">{formErrors.startTime}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Date & Time *</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className={formErrors.endTime ? 'error' : ''}
                />
                {formErrors.endTime && <span className="error-message">{formErrors.endTime}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="eventType">Event Type</label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                >
                  <option value="general">General</option>
                  <option value="mandatory">Mandatory</option>
                  <option value="optional">Optional</option>
                  <option value="paid">Paid Event</option>
                  <option value="invite-only">Invite Only</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority Level</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Logistics */}
          <div className="form-section">
            <h3>Location & Logistics</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., School Auditorium, Sports Field"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="room">Room Number</label>
                <input
                  type="text"
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="Room 101, Gym, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dressCode">Dress Code</label>
                <select
                  id="dressCode"
                  name="dressCode"
                  value={formData.dressCode}
                  onChange={handleChange}
                >
                  <option value="">Select dress code</option>
                  <option value="uniform">School Uniform</option>
                  <option value="formal">Formal Attire</option>
                  <option value="casual">Casual</option>
                  <option value="sports">Sports Uniform</option>
                  <option value="traditional">Traditional Attire</option>
                  <option value="theme">Theme-based</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="transportationProvided">Transportation</label>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="transportationProvided"
                      checked={formData.transportationProvided}
                      onChange={handleChange}
                    />
                    School transportation provided
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Requirements to Bring</label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="e.g., Notebook, Permission slip, Sports equipment, Lunch..."
                rows="3"
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="form-section">
            <h3>Target Audience</h3>
            
            <div className="form-group">
              <div className="grades-header">
                <label>Target Grades</label>
                <div className="grade-actions">
                  <button type="button" onClick={handleSelectAllGrades} className="action-btn">
                    Select All
                  </button>
                  <button type="button" onClick={handleClearAllGrades} className="action-btn">
                    Clear All
                  </button>
                </div>
              </div>
              <div className="checkbox-group">
                {gradeOptions.map(grade => (
                  <label key={grade} className={`checkbox-label ${selectedGrades.includes(grade) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      value={grade}
                      checked={selectedGrades.includes(grade)}
                      onChange={() => handleGradeToggle(grade)}
                      className="hidden-checkbox"
                    />
                    <span className="custom-checkbox"></span>
                    {grade}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="parentAttendance">Parent Involvement</label>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="parentAttendance"
                      checked={formData.parentAttendance}
                      onChange={handleChange}
                    />
                    Parents encouraged to attend
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="permissionSlipRequired">Permissions</label>
                <div className="checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="permissionSlipRequired"
                      checked={formData.permissionSlipRequired}
                      onChange={handleChange}
                    />
                    Permission slip required
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Registration & Contact */}
          <div className="form-section">
            <h3>Registration & Contact</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registrationRequired">Registration Required</label>
                <select
                  id="registrationRequired"
                  name="registrationRequired"
                  value={formData.registrationRequired}
                  onChange={handleChange}
                >
                  <option value="no">No Registration</option>
                  <option value="yes">Required</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
              
              {formData.registrationRequired === 'yes' && (
                <div className="form-group">
                  <label htmlFor="registrationDeadline">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className={formErrors.registrationDeadline ? 'error' : ''}
                  />
                  {formErrors.registrationDeadline && (
                    <span className="error-message">{formErrors.registrationDeadline}</span>
                  )}
                </div>
              )}
            </div>

            {formData.registrationRequired !== 'no' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fee">Fee (if any)</label>
                  <div className="input-with-symbol">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      id="fee"
                      name="fee"
                      value={formData.fee}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Participants</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Teacher/Coordinator name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactEmail">Contact Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="contact@maryoutacademy.edu"
                  className={formErrors.contactEmail ? 'error' : ''}
                />
                {formErrors.contactEmail && (
                  <span className="error-message">{formErrors.contactEmail}</span>
                )}
              </div>
            </div>
          </div>

          {/* Media & Attachments */}
          <div className="form-section">
            <h3>Media & Attachments</h3>
            
            <div className="form-group">
              <label htmlFor="imageUrl">Event Image URL</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/event-image.jpg"
                className={formErrors.imageUrl ? 'error' : ''}
              />
              <small className="hint">
                You can use images from Unsplash or any other image hosting service. Recommended size: 1200x600px
              </small>
              {formErrors.imageUrl && <span className="error-message">{formErrors.imageUrl}</span>}
              
              {formData.imageUrl && (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Attachments</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="file-input"
                />
                <label htmlFor="attachments" className="file-upload-label">
                  <span className="upload-icon">📎</span>
                  <span className="upload-text">Click to upload files or drag and drop</span>
                  <span className="upload-subtext">PDF, DOC, JPG, PNG up to 5MB each</span>
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="attachments-list">
                  {attachments.map((file, index) => (
                    <div key={index} className="attachment-item">
                      <span className="attachment-name">{file.name}</span>
                      <span className="attachment-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="remove-attachment"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="form-section">
            <h3>Advanced Settings</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="visibility">Visibility</label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                  <option value="staff">Staff Only</option>
                  <option value="specific-grades">Specific Grades Only</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                  />
                  This is a recurring event
                </label>
              </div>
            </div>

            {formData.isRecurring && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="recurrencePattern">Recurrence Pattern</label>
                  <select
                    id="recurrencePattern"
                    name="recurrencePattern"
                    value={formData.recurrencePattern}
                    onChange={handleChange}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="recurrenceEndDate">Ends On</label>
                  <input
                    type="date"
                    id="recurrenceEndDate"
                    name="recurrenceEndDate"
                    value={formData.recurrenceEndDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  {event ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                event ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;