# Implementation Guide - Patient Medical Record Data Mapping

## 🚀 Quick Start Implementation

### Step 1: Frontend - Service Layer (API calls)

Create `src/services/patientService.js`:

```javascript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5201';

export const patientService = {
  /**
   * Fetch complete patient information including medical records
   * @param {string} patientIdentifier - P-XXXXXX format or numeric ID
   */
  async getPatientMedicalRecord(patientIdentifier) {
    try {
      // First, fetch patient info
      const patientRes = await axios.get(
        `${API_BASE}/api/patient/${patientIdentifier}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const patient = patientRes.data;

      // Then fetch medical records
      const recordsRes = await axios.get(
        `${API_BASE}/api/patient/${patientIdentifier}/medical-records`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const records = recordsRes.data || [];

      // Organize records by type
      return {
        ...patient,
        complaints: records.filter(r => r.recordType === 'complaint'),
        histories: records.filter(r => r.recordType === 'history'),
        investigations: records.filter(r => r.recordType === 'investigation'),
        eyeExaminations: records.filter(r => r.recordType === 'exam'),
        operations: records.filter(r => r.recordType === 'operation'),
        prescriptions: records.filter(r => r.recordType === 'prescription'),
        diagnoses: records.filter(r => r.recordType === 'diagnosis'),
        images: records.filter(r => r.recordType === 'image'),
      };
    } catch (error) {
      console.error('Error fetching patient medical record:', error);
      throw error;
    }
  },

  /**
   * Fetch specific record type
   */
  async getRecordsByType(patientIdentifier, recordType) {
    try {
      const res = await axios.get(
        `${API_BASE}/api/patient/${patientIdentifier}/${recordType}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      return res.data || [];
    } catch (error) {
      console.error(`Error fetching ${recordType}:`, error);
      return [];
    }
  },

  /**
   * Get patient info only
   */
  async getPatientInfo(patientIdentifier) {
    try {
      const res = await axios.get(
        `${API_BASE}/api/patient/${patientIdentifier}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      return res.data;
    } catch (error) {
      console.error('Error fetching patient info:', error);
      throw error;
    }
  }
};
```

---

### Step 2: Frontend - Data Normalization

Create `src/utils/patientNormalizer.js`:

```javascript
/**
 * Normalize patient data from various backend formats
 */
export function normalizePatient(raw) {
  if (!raw) return null;

  // Gender mapping
  const genderMap = {
    0: 'Male',
    1: 'Female',
    2: 'Other',
    'M': 'Male',
    'F': 'Female',
    'm': 'Male',
    'f': 'Female',
    'male': 'Male',
    'female': 'Female',
  };

  const genderRaw = raw.gender ?? raw.PatientGender ?? raw.Gender;
  const gender = typeof genderRaw === 'number'
    ? (genderMap[genderRaw] ?? '—')
    : (genderMap[String(genderRaw).toLowerCase()] || genderRaw || '—');

  // Date of birth
  const dob = raw.dateOfBirth || raw.birthDate || raw.PatientBirthDate || raw.BirthDate || null;

  // Calculate age
  let age = raw.age || raw.Age || null;
  if (!age && dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    if (!isNaN(birthDate.getTime())) {
      age = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 365.25));
    }
  }

  return {
    // Basic patient info
    patientId: raw.patientId || raw.patientID || raw.id || raw.PatientId || '—',
    name: raw.name || raw.patientName || 
          [raw.firstName, raw.lastName].filter(Boolean).join(' ') ||
          [raw.FirstName, raw.LastName].filter(Boolean).join(' ') ||
          '—',
    age: age ?? '—',
    gender: gender,
    email: raw.email || raw.Email || raw.patientEmail || raw.EmailAddress || '—',
    phone: raw.phone || raw.contactNumber || raw.Phone || raw.patientPhone || raw.ContactNumber || '—',
    address: raw.address || raw.Address || raw.PatientAddress || '—',
    birthDate: dob,
    nationalId: raw.nationalId || raw.NationalId || raw.NationalID || null,

    // Insurance information
    insuranceCompany: raw.insuranceCompany || raw.InsuranceCompany || null,
    insuranceId: raw.insuranceId || raw.InsuranceId || raw.InsuranceID || null,
    policyNumber: raw.policyNumber || raw.PolicyNumber || raw.PolicyNo || null,
    coverage: raw.coverage || raw.Coverage || null,

    // Emergency contact
    emergencyContactName: raw.emergencyContactName || raw.EmergencyContactName || null,
    emergencyContactPhone: raw.emergencyContactPhone || raw.EmergencyContactPhone || null,

    // Medical records
    complaints: Array.isArray(raw.complaints) ? raw.complaints : [],
    histories: Array.isArray(raw.histories) ? raw.histories : [],
    investigations: Array.isArray(raw.investigations) ? raw.investigations : [],
    eyeExaminations: Array.isArray(raw.eyeExaminations) ? raw.eyeExaminations : [],
    operations: Array.isArray(raw.operations) ? raw.operations : [],
    prescriptions: Array.isArray(raw.prescriptions) ? raw.prescriptions : [],
    diagnoses: Array.isArray(raw.diagnoses) ? raw.diagnoses : [],
    images: Array.isArray(raw.images) ? raw.images : [],
  };
}

/**
 * Format date as DD MMM YYYY
 */
export function formatDate(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return null;
  }
}

/**
 * Format date and time as DD MMM YYYY, HH:MM
 */
export function formatDateTime(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return null;
  }
}

/**
 * Get initials from name
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  if (isNaN(birthDate.getTime()) || birthDate.getFullYear() < 1900) return null;
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? age : null;
}

/**
 * Check if patient data is complete
 */
export function isPatientDataComplete(patient) {
  const requiredFields = [
    'patientId',
    'name',
    'age',
    'gender',
    'birthDate',
    'phone',
    'email',
    'address',
    'nationalId',
    'insuranceCompany',
    'emergencyContactName',
    'emergencyContactPhone'
  ];

  return requiredFields.every(field => {
    const value = patient[field];
    return value !== null && value !== undefined && value !== '—' && value !== '';
  });
}
```

---

### Step 3: Frontend - Hook for Patient Data

Create `src/hooks/usePatientMedicalRecord.js`:

```javascript
import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { normalizePatient } from '../utils/patientNormalizer';

/**
 * Hook to fetch and manage patient medical record
 * Usage: const { patient, loading, error } = usePatientMedicalRecord(patientIdentifier);
 */
export function usePatientMedicalRecord(patientIdentifier) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetch, setRefetch] = useState(0);

  useEffect(() => {
    if (!patientIdentifier) {
      setError('Patient identifier is required');
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rawData = await patientService.getPatientMedicalRecord(patientIdentifier);
        const normalizedData = normalizePatient(rawData);
        
        setPatient(normalizedData);
      } catch (err) {
        console.error('Error fetching patient medical record:', err);
        setError(err.message || 'Failed to fetch patient medical record');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientIdentifier, refetch]);

  return {
    patient,
    loading,
    error,
    refetch: () => setRefetch(r => r + 1)
  };
}
```

---

### Step 4: Frontend - Component Usage

Update `PatientEMRPage.jsx` to use the hook:

```javascript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientMedicalRecord } from '../hooks/usePatientMedicalRecord';
import DoctorViewPatientMedicalRecord from '../DoctorDashboard/DoctorViewPatientMedicalRecord';

export default function PatientEMRPage() {
  const navigate = useNavigate();
  const [patientIdentifier, setPatientIdentifier] = useState(null);

  useEffect(() => {
    // Get patient identifier from localStorage
    const pi = localStorage.getItem('patientIdentifier') || 
               localStorage.getItem('PatientIdentifier') ||
               localStorage.getItem('patientId');
    
    if (!pi) {
      // Redirect to login if not found
      navigate('/login');
      return;
    }
    
    setPatientIdentifier(pi);
  }, [navigate]);

  // Use the hook to fetch patient data
  const { patient, loading, error, refetch } = usePatientMedicalRecord(patientIdentifier);

  if (!patientIdentifier) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div className="pmr-loading">Loading patient medical record...</div>;
  }

  if (error) {
    return (
      <div className="pmr-error">
        <p>Error: {error}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  if (!patient) {
    return <div>No patient data found</div>;
  }

  // Render the doctor's medical record view component
  // This component is designed for both doctor and patient views
  return (
    <DoctorViewPatientMedicalRecord 
      patientData={patient} 
      isPatientView={true}
      onRefresh={refetch}
    />
  );
}
```

---

### Step 5: Backend - API Endpoint Example (C#)

In `Controllers/PatientController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;
using EyeClinicAPI.PatientModule.Services;
using EyeClinicAPI.PatientModule.DTOs;

namespace EyeClinicAPI.PatientModule.Controllers
{
    [ApiController]
    [Route("api/patient")]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;
        private readonly IMedicalRecordService _medicalRecordService;

        public PatientController(
            IPatientService patientService,
            IMedicalRecordService medicalRecordService)
        {
            _patientService = patientService;
            _medicalRecordService = medicalRecordService;
        }

        /// <summary>
        /// Get patient information by identifier (P-XXXXXX) or ID
        /// </summary>
        [HttpGet("{identifier}")]
        public async Task<IActionResult> GetPatientInfo(string identifier)
        {
            try
            {
                // Try to get by PatientIdentifier first, then by ID
                var patient = await _patientService.GetPatientByIdentifierAsync(identifier);
                
                if (patient == null)
                {
                    return NotFound(new { message = "Patient not found" });
                }

                var dto = MapToPatientInfoDto(patient);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get patient's complete medical record with all data
        /// </summary>
        [HttpGet("{identifier}/medical-records")]
        public async Task<IActionResult> GetPatientMedicalRecords(string identifier)
        {
            try
            {
                // Get patient first
                var patient = await _patientService.GetPatientByIdentifierAsync(identifier);
                
                if (patient == null)
                {
                    return NotFound(new { message = "Patient not found" });
                }

                // Fetch all records related to patient
                var records = await _medicalRecordService
                    .GetRecordsByPatientIdAsync(patient.Id);

                return Ok(new
                {
                    patientId = patient.Id,
                    records = records.Select(r => new
                    {
                        id = r.Id,
                        patientId = r.PatientId,
                        recordType = r.RecordType,
                        data = JsonSerializer.Deserialize<dynamic>(r.JsonData),
                        createdAt = r.CreatedAt
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get specific record types
        /// </summary>
        [HttpGet("{identifier}/complaints")]
        public async Task<IActionResult> GetComplaints(string identifier) =>
            await GetRecordsByType(identifier, "complaint");

        [HttpGet("{identifier}/histories")]
        public async Task<IActionResult> GetHistories(string identifier) =>
            await GetRecordsByType(identifier, "history");

        [HttpGet("{identifier}/investigations")]
        public async Task<IActionResult> GetInvestigations(string identifier) =>
            await GetRecordsByType(identifier, "investigation");

        [HttpGet("{identifier}/eye-exams")]
        public async Task<IActionResult> GetEyeExams(string identifier) =>
            await GetRecordsByType(identifier, "exam");

        [HttpGet("{identifier}/operations")]
        public async Task<IActionResult> GetOperations(string identifier) =>
            await GetRecordsByType(identifier, "operation");

        [HttpGet("{identifier}/prescriptions")]
        public async Task<IActionResult> GetPrescriptions(string identifier) =>
            await GetRecordsByType(identifier, "prescription");

        [HttpGet("{identifier}/diagnoses")]
        public async Task<IActionResult> GetDiagnoses(string identifier) =>
            await GetRecordsByType(identifier, "diagnosis");

        // ─── Helper Methods ─────────────────────────────────────
        private async Task<IActionResult> GetRecordsByType(string identifier, string recordType)
        {
            try
            {
                var patient = await _patientService.GetPatientByIdentifierAsync(identifier);
                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                var records = await _medicalRecordService
                    .GetRecordsByPatientAndTypeAsync(patient.Id, recordType);

                return Ok(records);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private PatientInfoDto MapToPatientInfoDto(Patient patient)
        {
            return new PatientInfoDto
            {
                PatientId = patient.Id,
                Name = $"{patient.FirstName} {patient.LastName}",
                Age = CalculateAge(patient.DateOfBirth),
                Gender = patient.Gender,
                BirthDate = patient.DateOfBirth,
                NationalId = patient.NationalId,
                ContactNumber = patient.Phone,
                Email = patient.Email,
                Address = patient.Address,
                InsuranceCompany = patient.InsuranceCompany,
                InsuranceId = patient.InsuranceId,
                EmergencyContactName = patient.EmergencyContactName,
                EmergencyContactPhone = patient.EmergencyContactPhone
            };
        }

        private int CalculateAge(DateTime dateOfBirth)
        {
            var today = DateTime.Today;
            var age = today.Year - dateOfBirth.Year;
            if (dateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}
```

---

## 🔗 LocalStorage Keys

Store these keys consistently:

```javascript
// Primary identifier
localStorage.setItem('patientIdentifier', 'P-000123');

// Fallback keys
localStorage.setItem('patientId', patient.id);

// Auth
localStorage.setItem('authToken', token);

// User type
localStorage.setItem('userRole', 'patient'); // or 'doctor', 'receptionist'
```

---

## ✨ Best Practices

1. **Always fetch using patientIdentifier (P-XXXXXX)** - This is the unique identifier
2. **Store in localStorage** - Persist for page refresh
3. **Use the normalizer** - Ensure consistent field naming across all responses
4. **Implement error handling** - Show user-friendly error messages
5. **Add loading states** - Improve UX during API calls
6. **Cache results** - Reduce API calls with local state
7. **Validate data completeness** - Warn if required fields are missing

