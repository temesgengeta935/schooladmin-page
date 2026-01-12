import React, { useState, useEffect } from 'react';

const TeacherForm = ({ 
  teacher, 
  onSubmit, 
  onClose,
  departments = [],
  subjects = [],
  gradeLevels = [],
  employmentTypes = [],
  statuses = []
}) => {
  const [formData, setFormData] = useState({
    // Basic Information
    basicInfo: {
      title: 'Mr.',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      nationality: '',
      photoUrl: '',
      signature: ''
    },
    // Contact Information
    contactInfo: {
      email: '',
      phone: '',
      emergencyContact: '',
      address: '',
      city: '',
      postalCode: ''
    },
    // Professional Information
    professionalInfo: {
      employeeId: '',
      department: '',
      subjects: [],
      gradeLevels: [],
      specialization: '',
      qualification: '',
      degree: '',
      university: '',
      yearOfGraduation: '',
      teachingLicenseNumber: '',
      licenseExpiry: ''
    },
    // Employment Details
    employmentDetails: {
      employmentType: 'Full-time',
      joinDate: '',
      contractEndDate: '',
      salaryScale: '',
      payrollNumber: '',
      bankDetails: {
        accountName: '',
        accountNumber: '',
        bankName: '',
        branch: ''
      }
    },
    // Academic Responsibilities
    academicResponsibilities: {
      homeroomTeacher: false,
      classTeacherOf: '',
      clubSponsor: '',
      committeeMembership: []
    },
    // Documents (placeholder - would be file objects in real app)
    documents: {
      resume: '',
      certificates: [],
      policeClearance: '',
      medicalReport: ''
    },
    // Status
    status: 'Active',
    // Additional Info
    additionalInfo: {
      bio: '',
      teachingPhilosophy: '',
      achievements: '',
      professionalGoals: ''
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (teacher) {
      // Map existing teacher data to the enhanced structure
      setFormData({
        basicInfo: {
          title: teacher.basicInfo?.title || 'Mr.',
          firstName: teacher.basicInfo?.firstName || teacher.name?.split(' ')[0] || '',
          lastName: teacher.basicInfo?.lastName || teacher.name?.split(' ').slice(1).join(' ') || '',
          dateOfBirth: teacher.basicInfo?.dateOfBirth || '',
          gender: teacher.basicInfo?.gender || 'Male',
          nationality: teacher.basicInfo?.nationality || '',
          photoUrl: teacher.basicInfo?.photoUrl || teacher.photoUrl || '',
          signature: teacher.basicInfo?.signature || ''
        },
        contactInfo: teacher.contactInfo || {
          email: '',
          phone: '',
          emergencyContact: '',
          address: '',
          city: '',
          postalCode: ''
        },
        professionalInfo: teacher.professionalInfo || {
          employeeId: '',
          department: teacher.department || '',
          subjects: [],
          gradeLevels: [],
          specialization: '',
          qualification: '',
          degree: '',
          university: '',
          yearOfGraduation: '',
          teachingLicenseNumber: '',
          licenseExpiry: ''
        },
        employmentDetails: teacher.employmentDetails || {
          employmentType: 'Full-time',
          joinDate: '',
          contractEndDate: '',
          salaryScale: '',
          payrollNumber: '',
          bankDetails: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            branch: ''
          }
        },
        academicResponsibilities: teacher.academicResponsibilities || {
          homeroomTeacher: false,
          classTeacherOf: '',
          clubSponsor: '',
          committeeMembership: []
        },
        documents: teacher.documents || {
          resume: '',
          certificates: [],
          policeClearance: '',
          medicalReport: ''
        },
        status: teacher.status || 'Active',
        additionalInfo: {
          bio: teacher.bio || teacher.additionalInfo?.bio || '',
          teachingPhilosophy: teacher.additionalInfo?.teachingPhilosophy || '',
          achievements: teacher.additionalInfo?.achievements || '',
          professionalGoals: teacher.additionalInfo?.professionalGoals || ''
        }
      });
    }
  }, [teacher]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const path = name.split('.');
    
    setFormData(prev => {
      if (path.length === 1) {
        return {
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        };
      } else if (path.length === 2) {
        return {
          ...prev,
          [path[0]]: {
            ...prev[path[0]],
            [path[1]]: type === 'checkbox' ? checked : value
          }
        };
      } else if (path.length === 3) {
        return {
          ...prev,
          [path[0]]: {
            ...prev[path[0]],
            [path[1]]: {
              ...prev[path[0]][path[1]],
              [path[2]]: type === 'checkbox' ? checked : value
            }
          }
        };
      }
      return prev;
    });
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => {
      const currentValues = prev.professionalInfo[field] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        professionalInfo: {
          ...prev.professionalInfo,
          [field]: updatedValues
        }
      };
    });
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [field]: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic Info validation
    if (!formData.basicInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.basicInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.contactInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Professional Info validation
    if (!formData.professionalInfo.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.professionalInfo.department) newErrors.department = 'Department is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }
    
    onSubmit(formData);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'professional', label: 'Professional', icon: '🎓' },
    { id: 'employment', label: 'Employment', icon: '💼' },
    { id: 'academic', label: 'Academic', icon: '📚' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'additional', label: 'Additional', icon: '➕' }
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="tab-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Title *
                </label>
                <select
                  name="basicInfo.title"
                  value={formData.basicInfo.title}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  First Name *
                  {errors.firstName && <span style={{ color: '#dc3545', fontSize: '12px', marginLeft: '5px' }}>{errors.firstName}</span>}
                </label>
                <input
                  type="text"
                  name="basicInfo.firstName"
                  value={formData.basicInfo.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: errors.firstName ? '1px solid #dc3545' : '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Last Name *
                  {errors.lastName && <span style={{ color: '#dc3545', fontSize: '12px', marginLeft: '5px' }}>{errors.lastName}</span>}
                </label>
                <input
                  type="text"
                  name="basicInfo.lastName"
                  value={formData.basicInfo.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: errors.lastName ? '1px solid #dc3545' : '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="basicInfo.dateOfBirth"
                  value={formData.basicInfo.dateOfBirth}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                {formData.basicInfo.dateOfBirth && (
                  <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                    Age: {calculateAge(formData.basicInfo.dateOfBirth)} years
                  </small>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Gender</label>
                <select
                  name="basicInfo.gender"
                  value={formData.basicInfo.gender}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nationality</label>
                <input
                  type="text"
                  name="basicInfo.nationality"
                  value={formData.basicInfo.nationality}
                  onChange={handleChange}
                  placeholder="Enter nationality"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Photo URL</label>
                <input
                  type="url"
                  name="basicInfo.photoUrl"
                  value={formData.basicInfo.photoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                  Recommended: 200x200px square image. Leave empty for default avatar.
                </small>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="tab-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Email Address *
                  {errors.email && <span style={{ color: '#dc3545', fontSize: '12px', marginLeft: '5px' }}>{errors.email}</span>}
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
                  required
                  placeholder="teacher@school.edu"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: errors.email ? '1px solid #dc3545' : '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Phone Number</label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                  placeholder="+1 (234) 567-8900"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Emergency Contact</label>
                <input
                  type="text"
                  name="contactInfo.emergencyContact"
                  value={formData.contactInfo.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact name & number"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address</label>
                <textarea
                  name="contactInfo.address"
                  value={formData.contactInfo.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Street address"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>City</label>
                <input
                  type="text"
                  name="contactInfo.city"
                  value={formData.contactInfo.city}
                  onChange={handleChange}
                  placeholder="City"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Postal Code</label>
                <input
                  type="text"
                  name="contactInfo.postalCode"
                  value={formData.contactInfo.postalCode}
                  onChange={handleChange}
                  placeholder="ZIP/Postal code"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'professional':
        return (
          <div className="tab-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Employee ID *
                  {errors.employeeId && <span style={{ color: '#dc3545', fontSize: '12px', marginLeft: '5px' }}>{errors.employeeId}</span>}
                </label>
                <input
                  type="text"
                  name="professionalInfo.employeeId"
                  value={formData.professionalInfo.employeeId}
                  onChange={handleChange}
                  required
                  placeholder="SCH-TCH-001"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: errors.employeeId ? '1px solid #dc3545' : '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Department *
                  {errors.department && <span style={{ color: '#dc3545', fontSize: '12px', marginLeft: '5px' }}>{errors.department}</span>}
                </label>
                <select
                  name="professionalInfo.department"
                  value={formData.professionalInfo.department}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: errors.department ? '1px solid #dc3545' : '1px solid #ced4da'
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Subjects Taught</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                  {subjects.map(subject => (
                    <label key={subject} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={formData.professionalInfo.subjects?.includes(subject)}
                        onChange={() => handleMultiSelect('subjects', subject)}
                      />
                      <span>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Grade Levels</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                  {gradeLevels.map(grade => (
                    <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={formData.professionalInfo.gradeLevels?.includes(grade)}
                        onChange={() => handleMultiSelect('gradeLevels', grade)}
                      />
                      <span>Grade {grade}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Specialization</label>
                <input
                  type="text"
                  name="professionalInfo.specialization"
                  value={formData.professionalInfo.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Special Education, STEM"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Highest Qualification</label>
                <select
                  name="professionalInfo.qualification"
                  value={formData.professionalInfo.qualification}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  <option value="">Select Qualification</option>
                  <option value="PhD">PhD</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Degree</label>
                <input
                  type="text"
                  name="professionalInfo.degree"
                  value={formData.professionalInfo.degree}
                  onChange={handleChange}
                  placeholder="e.g., M.Ed in Mathematics"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>University</label>
                <input
                  type="text"
                  name="professionalInfo.university"
                  value={formData.professionalInfo.university}
                  onChange={handleChange}
                  placeholder="University name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Year of Graduation</label>
                <input
                  type="number"
                  name="professionalInfo.yearOfGraduation"
                  value={formData.professionalInfo.yearOfGraduation}
                  onChange={handleChange}
                  min="1950"
                  max={new Date().getFullYear()}
                  placeholder="YYYY"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Teaching License No.</label>
                <input
                  type="text"
                  name="professionalInfo.teachingLicenseNumber"
                  value={formData.professionalInfo.teachingLicenseNumber}
                  onChange={handleChange}
                  placeholder="License number"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>License Expiry</label>
                <input
                  type="date"
                  name="professionalInfo.licenseExpiry"
                  value={formData.professionalInfo.licenseExpiry}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'employment':
        return (
          <div className="tab-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Employment Type</label>
                <select
                  name="employmentDetails.employmentType"
                  value={formData.employmentDetails.employmentType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                >
                  <option value="">Select Type</option>
                  {employmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Join Date</label>
                <input
                  type="date"
                  name="employmentDetails.joinDate"
                  value={formData.employmentDetails.joinDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Contract End Date</label>
                <input
                  type="date"
                  name="employmentDetails.contractEndDate"
                  value={formData.employmentDetails.contractEndDate}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Salary Scale</label>
                <input
                  type="text"
                  name="employmentDetails.salaryScale"
                  value={formData.employmentDetails.salaryScale}
                  onChange={handleChange}
                  placeholder="e.g., T-5, Grade 10"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Payroll Number</label>
                <input
                  type="text"
                  name="employmentDetails.payrollNumber"
                  value={formData.employmentDetails.payrollNumber}
                  onChange={handleChange}
                  placeholder="Payroll/Staff number"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <h4 style={{ marginBottom: '15px', color: '#495057' }}>Bank Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Account Name</label>
                    <input
                      type="text"
                      name="employmentDetails.bankDetails.accountName"
                      value={formData.employmentDetails.bankDetails.accountName}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ced4da'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Account Number</label>
                    <input
                      type="text"
                      name="employmentDetails.bankDetails.accountNumber"
                      value={formData.employmentDetails.bankDetails.accountNumber}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ced4da'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Bank Name</label>
                    <input
                      type="text"
                      name="employmentDetails.bankDetails.bankName"
                      value={formData.employmentDetails.bankDetails.bankName}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ced4da'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Branch</label>
                    <input
                      type="text"
                      name="employmentDetails.bankDetails.branch"
                      value={formData.employmentDetails.bankDetails.branch}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ced4da'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="tab-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="academicResponsibilities.homeroomTeacher"
                  checked={formData.academicResponsibilities.homeroomTeacher}
                  onChange={handleChange}
                />
                <label style={{ fontWeight: '500' }}>Homeroom Teacher</label>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Class Teacher Of</label>
                <input
                  type="text"
                  name="academicResponsibilities.classTeacherOf"
                  value={formData.academicResponsibilities.classTeacherOf}
                  onChange={handleChange}
                  placeholder="e.g., Grade 5A"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Club Sponsor</label>
                <input
                  type="text"
                  name="academicResponsibilities.clubSponsor"
                  value={formData.academicResponsibilities.clubSponsor}
                  onChange={handleChange}
                  placeholder="e.g., Science Club, Debate Team"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Committee Membership</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Curriculum', 'Discipline', 'Sports', 'Examination', 'Cultural', 'PTA'].map(committee => (
                    <label key={committee} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={formData.academicResponsibilities.committeeMembership?.includes(committee)}
                        onChange={() => {
                          const current = formData.academicResponsibilities.committeeMembership || [];
                          const updated = current.includes(committee)
                            ? current.filter(c => c !== committee)
                            : [...current, committee];
                          setFormData(prev => ({
                            ...prev,
                            academicResponsibilities: {
                              ...prev.academicResponsibilities,
                              committeeMembership: updated
                            }
                          }));
                        }}
                      />
                      <span>{committee} Committee</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="tab-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Resume/CV</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'resume')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                {formData.documents.resume && (
                  <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>✓ Resume uploaded</small>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Certificates</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    // Handle multiple certificate uploads
                    console.log('Certificates to upload:', files);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                  Upload degree certificates, awards, etc.
                </small>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Police Clearance</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, 'policeClearance')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                {formData.documents.policeClearance && (
                  <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>✓ Police clearance uploaded</small>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Medical Report</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, 'medicalReport')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                {formData.documents.medicalReport && (
                  <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>✓ Medical report uploaded</small>
                )}
              </div>
              
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                  <strong>Note:</strong> All uploaded documents should be in PDF or image format. 
                  Maximum file size: 10MB per file.
                </p>
              </div>
            </div>
          </div>
        );

      case 'additional':
        return (
          <div className="tab-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Biography</label>
                <textarea
                  name="additionalInfo.bio"
                  value={formData.additionalInfo.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Teacher's biography for school website/public profile..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Teaching Philosophy</label>
                <textarea
                  name="additionalInfo.teachingPhilosophy"
                  value={formData.additionalInfo.teachingPhilosophy}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Teacher's teaching philosophy and approach..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Achievements & Awards</label>
                <textarea
                  name="additionalInfo.achievements"
                  value={formData.additionalInfo.achievements}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Notable achievements, awards, publications..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Professional Goals</label>
                <textarea
                  name="additionalInfo.professionalGoals"
                  value={formData.additionalInfo.professionalGoals}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Future professional development goals..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status</label>
                <select
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
                  <option value="">Select Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>
            {teacher ? 'Edit Teacher Profile' : 'Add New Teacher'}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6c757d',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #007bff' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: activeTab === tab.id ? '#007bff' : '#495057',
                fontWeight: activeTab === tab.id ? '600' : '400'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1
        }}>
          <form onSubmit={handleSubmit}>
            {getTabContent()}
            
            {/* Progress Indicator */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {tabs.map((tab, index) => (
                    <div
                      key={tab.id}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: activeTab === tab.id ? '#007bff' : 
                                       index < tabs.findIndex(t => t.id === activeTab) ? '#28a745' : '#dee2e6'
                      }}
                      title={tab.label}
                    />
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1].id);
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #6c757d',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        cursor: 'pointer'
                      }}
                    >
                      Previous
                    </button>
                  )}
                  
                  {activeTab !== 'additional' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1].id);
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Next
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={onClose}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #6c757d',
                          borderRadius: '4px',
                          backgroundColor: 'transparent',
                          color: '#6c757d',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #28a745',
                          borderRadius: '4px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {teacher ? 'Update Teacher' : 'Add Teacher'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;