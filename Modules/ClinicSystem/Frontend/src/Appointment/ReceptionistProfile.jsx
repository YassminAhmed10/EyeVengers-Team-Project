import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, Edit2 } from 'lucide-react';
import './ReceptionistProfile.css';

const ReceptionistProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'Receptionist',
    email: 'receptionist@clinic.com',
    phone: '+20 123 456 7890',
    address: 'Cairo, Egypt',
    position: 'Front Desk Receptionist',
    department: 'Reception',
    joinDate: '2023-01-15',
    employeeId: 'REC-001'
  });

  const [formData, setFormData] = useState(profile);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    localStorage.setItem('userName', formData.name);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <div className="receptionist-profile">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-basic-info">
              <h1>{profile.name}</h1>
              <p className="position">{profile.position}</p>
            </div>
          </div>
          <button 
            className={`btn-edit ${isEditing ? 'cancel' : ''}`}
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
          >
            <Edit2 size={18} />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Main Profile Content */}
        <div className="profile-content">
          {/* Personal Information */}
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <User size={16} />
                  Full Name
                </label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email Address
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Phone Number
                </label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={16} />
                  Address
                </label>
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="profile-section">
            <h2>Employment Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <Briefcase size={16} />
                  Position
                </label>
                <input 
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <Briefcase size={16} />
                  Department
                </label>
                <input 
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Join Date
                </label>
                <input 
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Employee ID</label>
                <input 
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  disabled
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="action-buttons">
              <button 
                className="btn-primary"
                onClick={handleSave}
              >
                <Save size={18} />
                Save Changes
              </button>
              <button 
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="profile-stats">
        <h2>Profile Statistics</h2>
        <div className="stats-container">
          <div className="stat">
            <span className="stat-label">Total Appointments Scheduled</span>
            <span className="stat-value">342</span>
          </div>
          <div className="stat">
            <span className="stat-label">Patients Registered</span>
            <span className="stat-value">1,234</span>
          </div>
          <div className="stat">
            <span className="stat-label">Appointment Success Rate</span>
            <span className="stat-value">98.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistProfile;
