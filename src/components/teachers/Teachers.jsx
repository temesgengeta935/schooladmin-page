        import React, { useState, useEffect } from 'react';
import TeacherForm from './TeacherForm';
import { storage } from '../../utils/mockData';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  
  // Filter states
  const [filters, setFilters] = useState({
    department: 'all',
    subject: 'all',
    gradeLevel: 'all',
    employmentType: 'all',
    status: 'all',
    search: ''
  });

  // Configuration data
  const departments = ['Mathematics', 'Science', 'English', 'Social Studies', 'Languages', 'Arts', 'Physical Education', 'Technology', 'Special Education'];
  const subjects = ['Algebra', 'Biology', 'Chemistry', 'Physics', 'English Literature', 'History', 'Geography', 'French', 'Spanish', 'Art', 'Music', 'Computer Science'];
  const gradeLevels = ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Substitute'];
  const statuses = ['Active', 'On Leave', 'Resigned', 'Retired'];

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [teachers, filters]);

  const fetchTeachers = () => {
    const data = storage.get('teachers') || [];
    setTeachers(data);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...teachers];
    
    // Filter by department
    if (filters.department !== 'all') {
      filtered = filtered.filter(t => t.professionalInfo?.department === filters.department);
    }
    
    // Filter by subject
    if (filters.subject !== 'all') {
      filtered = filtered.filter(t => 
        t.professionalInfo?.subjects?.includes(filters.subject)
      );
    }
    
    // Filter by grade level
    if (filters.gradeLevel !== 'all') {
      filtered = filtered.filter(t => 
        t.professionalInfo?.gradeLevels?.includes(filters.gradeLevel)
      );
    }
    
    // Filter by employment type
    if (filters.employmentType !== 'all') {
      filtered = filtered.filter(t => t.employmentDetails?.employmentType === filters.employmentType);
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.basicInfo?.firstName?.toLowerCase().includes(searchLower) ||
        t.basicInfo?.lastName?.toLowerCase().includes(searchLower) ||
        t.professionalInfo?.employeeId?.toLowerCase().includes(searchLower) ||
        t.contactInfo?.email?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredTeachers(filtered);
  };

  const handleCreate = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleArchive = (id) => {
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === id ? { ...teacher, status: 'Archived' } : teacher
    );
    storage.set('teachers', updatedTeachers);
    setTeachers(updatedTeachers);
    setSuccessMessage('Teacher archived successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this teacher? This action cannot be undone.')) {
      const updatedTeachers = teachers.filter(t => t.id !== id);
      storage.set('teachers', updatedTeachers);
      setTeachers(updatedTeachers);
      setSuccessMessage('Teacher deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTeacher(null);
  };

  const handleFormSubmit = (teacherData) => {
    let updatedTeachers;
    
    if (editingTeacher) {
      updatedTeachers = teachers.map(teacher => 
        teacher.id === editingTeacher.id 
          ? { 
              ...teacherData, 
              id: editingTeacher.id,
              updatedAt: new Date().toISOString(),
              createdAt: teacherData.createdAt || new Date().toISOString()
            }
          : teacher
      );
      setSuccessMessage('Teacher updated successfully!');
    } else {
      const newTeacher = {
        ...teacherData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedTeachers = [...teachers, newTeacher];
      setSuccessMessage('Teacher added successfully!');
    }
    
    storage.set('teachers', updatedTeachers);
    setTeachers(updatedTeachers);
    setShowForm(false);
    setEditingTeacher(null);
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(teachers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teachers-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccessMessage('Teachers exported successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTeachers = JSON.parse(e.target.result);
          const existingTeachers = storage.get('teachers') || [];
          const updatedTeachers = [...existingTeachers, ...importedTeachers];
          storage.set('teachers', updatedTeachers);
          setTeachers(updatedTeachers);
          setSuccessMessage('Teachers imported successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
          alert('Error importing teachers: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Active': '#28a745',
      'On Leave': '#ffc107',
      'Resigned': '#dc3545',
      'Retired': '#6c757d',
      'Archived': '#6c757d'
    };
    
    return (
      <span style={{
        backgroundColor: colors[status] || '#6c757d',
        color: 'white',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500'
      }}>
        {status}
      </span>
    );
  };

  const getTeacherCard = (teacher) => (
    <div key={teacher.id} style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      ':hover': {
        transform: 'translateY(-2px)'
      }
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '15px',
          overflow: 'hidden'
        }}>
          {teacher.basicInfo?.photoUrl ? (
            <img 
              src={teacher.basicInfo.photoUrl} 
              alt={`${teacher.basicInfo.firstName} ${teacher.basicInfo.lastName}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '24px' }}>👨‍🏫</span>
          )}
        </div>
        <div>
          <h4 style={{ margin: '0 0 5px 0' }}>
            {teacher.basicInfo?.title} {teacher.basicInfo?.firstName} {teacher.basicInfo?.lastName}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {getStatusBadge(teacher.status)}
            <span style={{ color: '#6c757d', fontSize: '14px' }}>
              ID: {teacher.professionalInfo?.employeeId}
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: '#495057', fontSize: '14px', marginBottom: '5px' }}>
          <strong>Department:</strong> {teacher.professionalInfo?.department}
        </div>
        <div style={{ color: '#495057', fontSize: '14px', marginBottom: '5px' }}>
          <strong>Subjects:</strong> {teacher.professionalInfo?.subjects?.join(', ') || 'N/A'}
        </div>
        <div style={{ color: '#495057', fontSize: '14px' }}>
          <strong>Email:</strong> {teacher.contactInfo?.email}
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        borderTop: '1px solid #dee2e6',
        paddingTop: '10px'
      }}>
        <button 
          onClick={() => handleEdit(teacher)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Edit
        </button>
        <button 
          onClick={() => handleArchive(teacher.id)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Archive
        </button>
      </div>
    </div>
  );

  const getStatistics = () => {
    const stats = {
      total: teachers.length,
      active: teachers.filter(t => t.status === 'Active').length,
      onLeave: teachers.filter(t => t.status === 'On Leave').length,
      byDepartment: {}
    };

    departments.forEach(dept => {
      stats.byDepartment[dept] = teachers.filter(t => 
        t.professionalInfo?.department === dept
      ).length;
    });

    return stats;
  };

  const stats = getStatistics();

  if (loading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#6c757d'
    }}>Loading teachers...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Teachers Management</h1>
          <p style={{ color: '#6c757d', margin: '5px 0 0 0' }}>
            Total Teachers: {stats.total} | Active: {stats.active} | On Leave: {stats.onLeave}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="file"
            id="importFile"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <label htmlFor="importFile" style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Import
          </label>
          <button 
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Export
          </button>
          <button 
            onClick={handleCreate}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <span role="img" aria-label="add">➕</span> Add Teacher
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
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

      {/* Filters */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search by name, employee ID, or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ced4da'
            }}
          />
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Department</label>
            <select 
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Subject</label>
            <select 
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>View Mode</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: viewMode === 'table' ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('card')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: viewMode === 'card' ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Card View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {stats.total}
          </div>
          <div style={{ color: '#6c757d' }}>Total Teachers</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {stats.active}
          </div>
          <div style={{ color: '#6c757d' }}>Active Teachers</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
            {stats.onLeave}
          </div>
          <div style={{ color: '#6c757d' }}>On Leave</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
            {departments.length}
          </div>
          <div style={{ color: '#6c757d' }}>Departments</div>
        </div>
      </div>

      {/* Teachers List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>Teachers ({filteredTeachers.length})</h2>
          <button 
            onClick={() => setFilters({
              department: 'all',
              subject: 'all',
              gradeLevel: 'all',
              employmentType: 'all',
              status: 'all',
              search: ''
            })}
            style={{
              padding: '5px 10px',
              border: '1px solid #6c757d',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: '#6c757d',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
        
        {filteredTeachers.length === 0 ? (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center',
            color: '#6c757d'
          }}>
            <span role="img" aria-label="no teachers" style={{ fontSize: '48px' }}>👨‍🏫</span>
            <h3 style={{ margin: '10px 0 5px 0' }}>No teachers found</h3>
            <p>Try adjusting your filters or add a new teacher</p>
          </div>
        ) : viewMode === 'card' ? (
          <div style={{ 
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {filteredTeachers.map(teacher => getTeacherCard(teacher))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Photo</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Department</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Subjects</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Email</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px 15px' }}>
                      {teacher.professionalInfo?.employeeId || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {teacher.basicInfo?.photoUrl ? (
                          <img 
                            src={teacher.basicInfo.photoUrl} 
                            alt={`${teacher.basicInfo.firstName} ${teacher.basicInfo.lastName}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '18px' }}>👨‍🏫</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      {teacher.basicInfo?.title} {teacher.basicInfo?.firstName} {teacher.basicInfo?.lastName}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      {teacher.professionalInfo?.department || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      {teacher.professionalInfo?.subjects?.slice(0, 2).join(', ') || 'N/A'}
                      {teacher.professionalInfo?.subjects?.length > 2 && '...'}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      {teacher.contactInfo?.email || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      {getStatusBadge(teacher.status)}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => handleEdit(teacher)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleArchive(teacher.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Archive
                        </button>
                        {teacher.status === 'Archived' && (
                          <button 
                            onClick={() => handleDelete(teacher.id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Delete
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

      {/* Teacher Form Modal */}
      {showForm && (
        <TeacherForm
          teacher={editingTeacher}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          departments={departments}
          subjects={subjects}
          gradeLevels={gradeLevels}
          employmentTypes={employmentTypes}
          statuses={statuses}
        />
      )}
    </div>
  );
};

export default Teachers;
