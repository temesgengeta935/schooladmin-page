import React, { useState, useEffect } from 'react';

const GalleryForm = ({ item, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    imageUrl: '',
    caption: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        imageUrl: item.imageUrl,
        caption: item.caption
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{item ? 'Edit Gallery Item' : 'Add Gallery Item'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL *</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              required
              placeholder="Enter image URL"
            />
            <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
              Example: https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="caption">Caption *</label>
            <input
              type="text"
              id="caption"
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              required
              placeholder="Enter image caption"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {item ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GalleryForm;