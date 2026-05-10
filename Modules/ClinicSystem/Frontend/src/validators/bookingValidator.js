/**
 * BOOKING FORM VALIDATOR
 * ========================
 * Validates patient booking form data with clear conditions for:
 * - Required fields that must be filled
 * - Data mapping to receptionist workflow
 * - Data mapping to doctor workflow  
 * - Data mapping to EMR creation
 */

export const BOOKING_REQUIREMENTS = {
  // ===== STEP 1: PERSONAL INFORMATION (Required for receptionist & patient record) =====
  personalInfo: {
    patientName: { required: true, label: 'Patient Name', errorMsg: 'Patient name is required' },
    phone: { required: true, label: 'Phone Number', errorMsg: 'Phone number is required' },
    email: { required: true, label: 'Email Address', errorMsg: 'Email address is required' },
    dateOfBirth: { required: true, label: 'Date of Birth', errorMsg: 'Date of birth is required' },
    gender: { required: true, label: 'Gender', errorMsg: 'Gender is required' },
    nationalId: { required: true, label: 'National ID', errorMsg: 'National ID is required' },
    address: { required: true, label: 'Address', errorMsg: 'Address is required' },
  },

  // ===== STEP 2: APPOINTMENT DETAILS (Required for doctor scheduling & EMR) =====
  appointmentDetails: {
    doctorId: { required: true, label: 'Doctor', errorMsg: 'Doctor selection is required' },
    appointmentDate: { required: true, label: 'Appointment Date', errorMsg: 'Appointment date is required' },
    appointmentTime: { required: true, label: 'Appointment Time', errorMsg: 'Appointment time is required' },
    reasonForVisit: { required: true, label: 'Reason for Visit', errorMsg: 'Reason for visit is required' },
  },

  // ===== STEP 3: MEDICAL HISTORY (Required for EMR & doctor consultation) =====
  medicalHistory: {
    eyeAllergies: { required: false, label: 'Eye Allergies' }, // Can be "None"
    chronicDiseases: { required: false, label: 'Chronic Diseases' }, // Can be "None"
    currentMedications: { required: false, label: 'Current Medications' },
    visionSymptoms: { required: false, label: 'Vision Symptoms' },
    eyeSurgeries: { required: false, label: 'Eye Surgeries' }, // Can be "None"
    familyEyeDiseases: { required: false, label: 'Family Eye Diseases' }, // Can be "None"
  },

  // ===== STEP 4: INSURANCE (Optional but improves billing in EMR) =====
  insurance: {
    insuranceProvider: { required: false, label: 'Insurance Provider' },
    insuranceId: { required: false, label: 'Insurance ID' },
    policyNumber: { required: false, label: 'Policy Number' },
    coverageType: { required: false, label: 'Coverage Type' },
  },
};

/**
 * DATA MAPPING CONDITIONS
 * =====================
 * Defines WHERE booking data flows and HOW it's used
 */
export const DATA_MAPPING = {
  // ===== TO RECEPTIONIST DASHBOARD =====
  receptionist: {
    viewsOn: 'Appointment Details / Online Requests',
    displays: [
      'patientName',
      'patientId',
      'phone',
      'email',
      'appointmentDate',
      'appointmentTime',
      'doctorId',
      'reasonForVisit',
      'appointmentType',
      'status'
    ],
    actions: [
      'Confirm appointment',
      'Reschedule',
      'Cancel',
      'Add notes',
      'Update payment status'
    ]
  },

  // ===== TO DOCTOR DASHBOARD =====
  doctor: {
    viewsOn: 'Dashboard / Upcoming Appointments / Medical Records',
    displays: [
      'patientName',
      'patientId',
      'age',
      'dateOfBirth',
      'gender',
      'phone',
      'email',
      'reasonForVisit',
      'appointmentDate',
      'appointmentTime',
      'eyeAllergies',
      'chronicDiseases',
      'currentMedications',
      'visionSymptoms',
      'eyeSurgeries',
      'familyEyeDiseases',
      'nationalId',
      'address',
      'insuranceCompany'
    ],
    actions: [
      'View patient details',
      'Create/View medical record',
      'Add examination notes',
      'Add prescriptions',
      'Add diagnoses'
    ]
  },

  // ===== TO EMR (MEDICAL RECORD) =====
  medicalRecord: {
    createsRecord: true,
    populatesPatientInfo: {
      patientId: 'Maps to PatientInfo.PatientId',
      name: 'Maps to PatientInfo.Name (FirstName + LastName from Patient table)',
      age: 'Calculated from DateOfBirth',
      gender: 'Maps to PatientInfo.Gender',
      email: 'Maps to PatientInfo.Email',
      phone: 'Maps to PatientInfo.ContactNumber',
      address: 'Maps to PatientInfo.Address',
      nationalId: 'Maps to PatientInfo.NationalId',
      insuranceCompany: 'Maps to PatientInfo.InsuranceCompany',
      insuranceId: 'Maps to PatientInfo.InsuranceId',
      birthDate: 'Maps to PatientInfo.BirthDate',
      emergencyContactName: 'Maps to PatientInfo.EmergencyContactName',
      emergencyContactPhone: 'Maps to PatientInfo.EmergencyContactPhone'
    },
    initialData: {
      'Patient Complaints': 'reasonForVisit becomes initial complaint',
      'Medical History': 'Eye/chronic diseases, medications, surgeries, family history',
      'Vision Symptoms': 'Stored for reference during examination',
      'Insurance Info': 'Pre-filled for billing and coverage verification'
    },
    displayLocation: 'Patient Info Card at top of EMR page'
  }
};

/**
 * VALIDATION FUNCTIONS
 * ====================
 */

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field
 * @param {any} value - Value to validate
 * @param {string} step - Which step (personalInfo, appointmentDetails, etc)
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateField = (fieldName, value, step) => {
  const requirement = BOOKING_REQUIREMENTS[step]?.[fieldName];
  
  if (!requirement) {
    return { isValid: true, error: '' };
  }

  if (requirement.required && !value) {
    return { isValid: false, error: requirement.errorMsg };
  }

  // Special validation for email
  if (fieldName === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
  }

  // Special validation for phone
  if (fieldName === 'phone' && value) {
    const phoneRegex = /^[\d+\-\s()]+$/;
    if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
      return { isValid: false, error: 'Please enter a valid phone number (at least 10 digits)' };
    }
  }

  // Special validation for date of birth (must be valid and not future)
  if (fieldName === 'dateOfBirth' && value) {
    const dob = new Date(value);
    const today = new Date();
    if (dob > today) {
      return { isValid: false, error: 'Date of birth cannot be in the future' };
    }
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 1) {
      return { isValid: false, error: 'Patient must be at least 1 year old' };
    }
  }

  // Special validation for appointment date (must be future)
  if (fieldName === 'appointmentDate' && value) {
    const appointmentDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate <= today) {
      return { isValid: false, error: 'Appointment date must be in the future' };
    }
  }

  return { isValid: true, error: '' };
};

/**
 * Validate entire step
 * @param {object} formData - Form data object
 * @param {string} step - Which step to validate
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateStep = (formData, step) => {
  const errors = {};
  const requirements = BOOKING_REQUIREMENTS[step] || {};

  Object.keys(requirements).forEach(fieldName => {
    const result = validateField(fieldName, formData[fieldName], step);
    if (!result.isValid) {
      errors[fieldName] = result.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate all steps before submission
 * @param {object} formData - Complete form data
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateAllSteps = (formData) => {
  const allErrors = {};

  Object.keys(BOOKING_REQUIREMENTS).forEach(step => {
    const result = validateStep(formData, step);
    if (!result.isValid) {
      allErrors[step] = result.errors;
    }
  });

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors
  };
};

/**
 * Get required fields for a specific step
 * @param {string} step - Step name
 * @returns {array} Array of required field names
 */
export const getRequiredFieldsForStep = (step) => {
  return Object.keys(BOOKING_REQUIREMENTS[step] || {})
    .filter(field => BOOKING_REQUIREMENTS[step][field].required);
};

/**
 * Get all required fields
 * @returns {array} Array of all required field names
 */
export const getAllRequiredFields = () => {
  const required = [];
  Object.keys(BOOKING_REQUIREMENTS).forEach(step => {
    getRequiredFieldsForStep(step).forEach(field => {
      required.push({ step, field });
    });
  });
  return required;
};

/**
 * Format validation errors for display
 * @param {object} errors - Errors object from validate functions
 * @returns {array} Array of error messages
 */
export const formatErrorMessages = (errors) => {
  const messages = [];
  
  if (typeof errors === 'string') {
    return [errors];
  }

  Object.entries(errors).forEach(([key, value]) => {
    if (typeof value === 'object') {
      messages.push(...formatErrorMessages(value));
    } else if (value) {
      messages.push(value);
    }
  });

  return messages;
};

/**
 * Check if form is ready for submission
 * All required fields must have values
 */
export const isFormReadyForSubmission = (formData) => {
  const requiredFields = getAllRequiredFields();
  
  for (const { field } of requiredFields) {
    const value = formData[field];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return {
        ready: false,
        missingField: field
      };
    }
  }

  return { ready: true, missingField: null };
};
