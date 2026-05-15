/**
 * PatientDataForm Component
 * ===========================
 * Used for DIRECT RADIOLOGY PATIENTS (Flow 1)
 * Allows manual entry of all patient demographics
 * 
 * Features:
 * - Form validation
 * - Real-time age calculation
 * - Mobile-friendly layout
 * - Clear field labels and required indicators
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaIdCard, FaVenusMars, FaCalendarAlt, FaHome, FaExclamationCircle } from 'react-icons/fa';

const PatientDataForm = ({ patientData, onDataChange, onValidationChange, isReadOnly = false }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age > 0 ? age : null;
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'phone':
        if (!value || !/^[0-9\-\+\(\)]+$/.test(value)) {
          newErrors.phone = 'Invalid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'nationalId':
        if (!value || value.trim().length < 5) {
          newErrors.nationalId = 'National ID is required';
        } else {
          delete newErrors.nationalId;
        }
        break;
      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          delete newErrors.dateOfBirth;
        }
        break;
      case 'gender':
        if (!value) {
          newErrors.gender = 'Gender is required';
        } else {
          delete newErrors.gender;
        }
        break;
      case 'address':
        if (!value || value.trim().length < 5) {
          newErrors.address = 'Address must be at least 5 characters';
        } else {
          delete newErrors.address;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update touched state
    setTouched({ ...touched, [name]: true });
    
    // Validate field
    validateField(name, value);
    
    // Notify parent
    onDataChange(name, value);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  // Check validation on prop changes
  useEffect(() => {
    const required = ['name', 'phone', 'email', 'gender', 'dateOfBirth', 'nationalId', 'address'];
    const isValid = required.every(field => patientData[field] && !errors[field]);
    onValidationChange?.(isValid);
  }, [patientData, errors, onValidationChange]);

  const fieldConfig = [
    { 
      name: 'name', 
      label: 'Full Name', 
      type: 'text', 
      icon: FaUser, 
      required: true,
      placeholder: 'Enter your full name'
    },
    { 
      name: 'phone', 
      label: 'Phone Number', 
      type: 'tel', 
      icon: FaPhone, 
      required: true,
      placeholder: 'e.g., +20123456789'
    },
    { 
      name: 'email', 
      label: 'Email Address', 
      type: 'email', 
      icon: FaEnvelope, 
      required: true,
      placeholder: 'you@example.com'
    },
    { 
      name: 'nationalId', 
      label: 'National ID', 
      type: 'text', 
      icon: FaIdCard, 
      required: true,
      placeholder: 'Enter your national ID'
    },
    { 
      name: 'dateOfBirth', 
      label: 'Date of Birth', 
      type: 'date', 
      icon: FaCalendarAlt, 
      required: true
    },
    { 
      name: 'gender', 
      label: 'Gender', 
      type: 'select', 
      icon: FaVenusMars, 
      required: true,
      options: [
        { value: '', label: 'Select Gender' },
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
      ]
    },
    { 
      name: 'address', 
      label: 'Address', 
      type: 'textarea', 
      icon: FaHome, 
      required: true,
      placeholder: 'Enter your complete address'
    }
  ];

  const age = calculateAge(patientData.dateOfBirth);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}
    >
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: 600, 
        marginBottom: '20px', 
        color: '#1e3a5f',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <FaUser size={14} />
        Patient Information
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {fieldConfig.slice(0, 5).map((field) => {
          const Icon = field.icon;
          const hasError = touched[field.name] && errors[field.name];
          
          return (
            <div key={field.name} style={{ gridColumn: field.name === 'address' ? 'span 2' : 'span 1' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px'
              }}>
                <Icon size={12} />
                {field.label}
                {field.required && <span style={{ color: '#dc2626' }}>*</span>}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={patientData[field.name] || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                readOnly={isReadOnly}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: hasError ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  background: isReadOnly ? '#f1f5f9' : 'white',
                  color: '#1e293b',
                  cursor: isReadOnly ? 'default' : 'text'
                }}
              />
              {hasError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px', color: '#dc2626' }}>
                  <FaExclamationCircle size={10} />
                  {errors[field.name]}
                </div>
              )}
              {field.name === 'dateOfBirth' && age && (
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Age: <strong>{age} years</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gender */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#334155',
          marginBottom: '6px'
        }}>
          <FaVenusMars size={12} />
          Gender
          <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <select
          name="gender"
          value={patientData.gender || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isReadOnly}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: touched.gender && errors.gender ? '2px solid #dc2626' : '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '13px',
            background: isReadOnly ? '#f1f5f9' : 'white',
            color: '#1e293b',
            cursor: isReadOnly ? 'default' : 'pointer'
          }}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Address */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#334155',
          marginBottom: '6px'
        }}>
          <FaHome size={12} />
          Address
          <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea
          name="address"
          value={patientData.address || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your complete address"
          readOnly={isReadOnly}
          rows="3"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: touched.address && errors.address ? '2px solid #dc2626' : '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '13px',
            background: isReadOnly ? '#f1f5f9' : 'white',
            color: '#1e293b',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      {Object.keys(errors).length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '12px',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaExclamationCircle size={14} />
          Please fill in all required fields correctly
        </div>
      )}
    </motion.div>
  );
};

export default PatientDataForm;
