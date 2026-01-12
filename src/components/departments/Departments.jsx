import React, { useState, useEffect } from 'react';
import DepartmentForm from './DepartmentForm';
import { storage } from '../../utils/mockData';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = () => {
    const data = storage.get('departments') || [];
    setDepartments(data);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      const updatedDepartments = departments.filter(dept => dept.id !== id);
      storage.set('departments', updatedDepartments);
      setDepartments(updatedDepartments);
      setSuccessMessage('Department deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  const handleFormSubmit = (departmentData) => {
    let updatedDepartments;
    
    if (editingDepartment) {
      updatedDepartments = departments.map(dept => 
        dept.id === editingDepartment.id 
          ? { ...departmentData, id: editingDepartment.id }
          : dept
      );
      setSuccessMessage('Department updated successfully!');
    } else {
      const newDepartment = {
        ...departmentData,
        id: Date.now().toString()
      };
      updatedDepartments = [...departments, newDepartment];
      setSuccessMessage('Department created successfully!');
    }
    
    storage.set('departments', updatedDepartments);
    setDepartments(updatedDepartments);
    setShowForm(false);
    setEditingDepartment(null);
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="header">
        <h1>Departments</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            <span role="img" aria-label="add">➕</span> Add Department
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
          <h2>All Departments</h2>
        </div>
        
        {departments.length === 0 ? (
          <div className="empty-state">
            <span role="img" aria-label="no departments">🏛️</span>
            <h3>No departments yet</h3>
            <p>Add your first department to get started</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.name}</td>
                  <td>{department.description.substring(0, 100)}...</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(department)}
                      >
                        <span role="img" aria-label="edit">✏️</span> Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(department.id)}
                      >
                        <span role="img" aria-label="delete">🗑️</span> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <DepartmentForm
          department={editingDepartment}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Departments;