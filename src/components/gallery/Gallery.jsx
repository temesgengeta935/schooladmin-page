import React, { useState, useEffect } from 'react';
import GalleryForm from './GalleryForm';
import { storage } from '../../utils/mockData';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = () => {
    const data = storage.get('gallery') || [];
    setGallery(data);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      const updatedGallery = gallery.filter(item => item.id !== id);
      storage.set('gallery', updatedGallery);
      setGallery(updatedGallery);
      setSuccessMessage('Image deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (galleryData) => {
    let updatedGallery;
    
    if (editingItem) {
      updatedGallery = gallery.map(item => 
        item.id === editingItem.id 
          ? { ...galleryData, id: editingItem.id }
          : item
      );
      setSuccessMessage('Image updated successfully!');
    } else {
      const newItem = {
        ...galleryData,
        id: Date.now().toString()
      };
      updatedGallery = [...gallery, newItem];
      setSuccessMessage('Image added successfully!');
    }
    
    storage.set('gallery', updatedGallery);
    setGallery(updatedGallery);
    setShowForm(false);
    setEditingItem(null);
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="header">
        <h1>Gallery</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            <span role="img" aria-label="add">➕</span> Add Image
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <h2>Gallery Images</h2>
        </div>
        
        {gallery.length === 0 ? (
          <div className="empty-state">
            <span role="img" aria-label="no gallery">🖼️</span>
            <h3>No gallery images yet</h3>
            <p>Add your first image to get started</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {gallery.map((item) => (
              <div key={item.id} className="gallery-item">
                <img 
                  src={item.imageUrl} 
                  alt={item.caption}
                  className="gallery-image"
                />
                <div className="gallery-caption">
                  <p>{item.caption}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(item)}
                    >
                      <span role="img" aria-label="edit">✏️</span> Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      <span role="img" aria-label="delete">🗑️</span> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <GalleryForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Gallery;