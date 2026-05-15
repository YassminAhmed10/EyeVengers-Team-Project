/**
 * Doctor Order → Radiology Booking Redirect Utility
 * 
 * This utility helps the Clinic System (Eye Clinic) redirect patients to the
 * Radiology Center's Book Appointment page with proper doctor request context.
 * 
 * Used in: Doctor Requests/Orders page to send patients to radiology for imaging tests
 */

/**
 * Build a URL to redirect patient to radiology booking with doctor order context
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.radiologyBaseUrl - Base URL of radiology system (e.g., 'http://localhost:5202')
 * @param {Object} options.patient - Patient object with id, name, phone, email, gender, dateOfBirth, nationalId, address
 * @param {Object} options.doctor - Doctor object with id, name, specialty
 * @param {Object} options.order - Doctor order object with id, date, requestedTest, notes
 * @param {string} options.clinicName - Clinic system name (e.g., 'Eye Clinic')
 * @param {string} options.clinicBackUrl - URL to redirect back to clinic (e.g., 'http://localhost:5173/patient')
 * @param {string} options.patientInstructions - Optional: Patient-facing instructions (e.g., "Fasting required")
 * 
 * @returns {string} Complete URL for radiology booking with all parameters encoded
 * 
 * @example
 * const radiologyUrl = buildDoctorOrderRedirectUrl({
 *   radiologyBaseUrl: 'http://localhost:5202',
 *   patient: {
 *     id: 'P001',
 *     name: 'Ahmed Hassan',
 *     phone: '+20123456789',
 *     email: 'ahmed@example.com',
 *     gender: 'M',
 *     dateOfBirth: '1990-01-15',
 *     nationalId: '30001011234567',
 *     address: 'Cairo, Egypt'
 *   },
 *   doctor: {
 *     id: 'DOC001',
 *     name: 'Dr. Fatima Mohamed',
 *     specialty: 'Ophthalmology'
 *   },
 *   order: {
 *     id: 'ORD001',
 *     date: '2024-05-13',
 *     requestedTest: 'OCT',
 *     notes: 'Urgent: Check retina thickness'
 *   },
 *   clinicName: 'Eye Clinic',
 *   clinicBackUrl: 'http://localhost:5173/doctor-orders',
 *   patientInstructions: 'No eye drops 24 hours before appointment'
 * });
 * 
 * // Result URL:
 * // http://localhost:5202/patient/book-appointment?
 * //   doctorOrder=true
 * //   &orderId=ORD001
 * //   &doctorId=DOC001
 * //   &doctorName=Dr.%20Fatima%20Mohamed
 * //   &doctorSpecialty=Ophthalmology
 * //   &requestedTest=OCT
 * //   &orderDate=2024-05-13
 * //   &orderNotes=Urgent%3A%20Check%20retina%20thickness
 * //   &clinicName=Eye%20Clinic
 * //   &clinicBackUrl=http%3A%2F%2Flocalhost%3A5173%2Fdoctor-orders
 * //   &patientId=P001
 * //   &patientName=Ahmed%20Hassan
 * //   &patientEmail=ahmed%40example.com
 * //   &patientPhone=%2B20123456789
 * //   &patientDateOfBirth=1990-01-15
 * //   &patientInstructions=No%20eye%20drops%2024%20hours%20before%20appointment
 */
export function buildDoctorOrderRedirectUrl({
  radiologyBaseUrl = 'http://localhost:5202',
  patient = {},
  doctor = {},
  order = {},
  clinicName = 'Clinic System',
  clinicBackUrl = 'http://localhost:5173/patient',
  patientInstructions = null
}) {
  const url = new URL(`${radiologyBaseUrl}/patient/book-appointment`);
  
  // Doctor Order Markers (CRITICAL)
  url.searchParams.set('doctorOrder', 'true');  // Flag: this is a doctor order
  url.searchParams.set('fromClinic', 'true');   // Flag: from clinic system
  
  // Doctor Order Context
  if (order.id) url.searchParams.set('orderId', order.id);
  if (doctor.id) url.searchParams.set('doctorId', doctor.id);
  if (doctor.name) url.searchParams.set('doctorName', doctor.name);
  if (doctor.specialty) url.searchParams.set('doctorSpecialty', doctor.specialty);
  if (order.requestedTest) url.searchParams.set('requestedTest', order.requestedTest);
  if (order.date) url.searchParams.set('orderDate', order.date);
  if (order.notes) url.searchParams.set('orderNotes', order.notes);
  
  // Clinic Context
  url.searchParams.set('clinicName', clinicName);
  if (clinicBackUrl) url.searchParams.set('clinicBackUrl', clinicBackUrl);
  
  // Patient Data (Auto-filled in radiology)
  if (patient.id) url.searchParams.set('patientId', patient.id);
  if (patient.name) url.searchParams.set('patientName', patient.name);
  if (patient.email) url.searchParams.set('patientEmail', patient.email);
  if (patient.phone) url.searchParams.set('patientPhone', patient.phone);
  if (patient.dateOfBirth) url.searchParams.set('patientDateOfBirth', patient.dateOfBirth);
  if (patient.gender) url.searchParams.set('patientGender', patient.gender);
  if (patient.nationalId) url.searchParams.set('patientNationalId', patient.nationalId);
  if (patient.address) url.searchParams.set('patientAddress', patient.address);
  
  // Optional: Patient Instructions
  if (patientInstructions) url.searchParams.set('patientInstructions', patientInstructions);
  
  return url.toString();
}

/**
 * Simple variant: Build redirect URL with minimal parameters
 * Useful for quick integrations
 * 
 * @param {string} orderId - Doctor order ID
 * @param {string} doctorId - Doctor ID
 * @param {string} patientId - Patient ID
 * @param {string} requestedTest - Test name (e.g., 'OCT', 'MRI')
 * @param {string} radiologyBaseUrl - Radiology base URL
 * @returns {string} Redirect URL
 */
export function buildMinimalDoctorOrderUrl(
  orderId,
  doctorId,
  patientId,
  requestedTest,
  radiologyBaseUrl = 'http://localhost:5202'
) {
  const url = new URL(`${radiologyBaseUrl}/patient/book-appointment`);
  url.searchParams.set('doctorOrder', 'true');
  url.searchParams.set('fromClinic', 'true');
  url.searchParams.set('orderId', orderId);
  url.searchParams.set('doctorId', doctorId);
  url.searchParams.set('patientId', patientId);
  url.searchParams.set('requestedTest', requestedTest);
  return url.toString();
}

/**
 * Navigate to radiology (browser-based, for React apps)
 * 
 * @param {string} redirectUrl - URL from buildDoctorOrderRedirectUrl()
 */
export function redirectToRadiologyBooking(redirectUrl) {
  window.location.href = redirectUrl;
}

/**
 * Extract doctor order parameters from URL (used in radiology page)
 * Useful when you need to read the URL parameters that were sent
 * 
 * @returns {Object} Doctor order context object
 */
export function extractDoctorOrderParamsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  
  return {
    isDoctorOrder: params.get('doctorOrder') === 'true',
    orderId: params.get('orderId'),
    doctorId: params.get('doctorId'),
    doctorName: params.get('doctorName'),
    doctorSpecialty: params.get('doctorSpecialty'),
    requestedTest: params.get('requestedTest'),
    orderDate: params.get('orderDate'),
    orderNotes: params.get('orderNotes'),
    clinicName: params.get('clinicName'),
    clinicBackUrl: params.get('clinicBackUrl'),
    patientId: params.get('patientId'),
    patientName: params.get('patientName'),
    patientEmail: params.get('patientEmail'),
    patientPhone: params.get('patientPhone'),
    patientDateOfBirth: params.get('patientDateOfBirth'),
    patientGender: params.get('patientGender'),
    patientNationalId: params.get('patientNationalId'),
    patientAddress: params.get('patientAddress'),
    patientInstructions: params.get('patientInstructions')
  };
}

/**
 * Validate doctor order parameters
 * Checks if all required parameters are present
 * 
 * @returns {Object} { isValid: boolean, missingFields: string[] }
 */
export function validateDoctorOrderParams() {
  const params = extractDoctorOrderParamsFromUrl();
  const required = ['isDoctorOrder', 'orderId', 'doctorId', 'patientId', 'requestedTest'];
  const missing = required.filter(field => !params[field]);
  
  return {
    isValid: missing.length === 0,
    missingFields: missing,
    params
  };
}

/**
 * Build data for appointment booking from doctor order context
 * Combines doctor order info with patient data for backend submission
 * 
 * @param {Object} appointmentData - Base appointment data (date, time, test selected, etc.)
 * @returns {Object} Complete appointment data with doctor order context
 */
export function enrichAppointmentWithDoctorOrder(appointmentData) {
  const doctorOrderParams = extractDoctorOrderParamsFromUrl();
  
  if (!doctorOrderParams.isDoctorOrder) {
    return appointmentData; // Not a doctor order, return as-is
  }
  
  return {
    ...appointmentData,
    isDoctorOrder: true,
    doctorOrderId: doctorOrderParams.orderId,
    doctorId: doctorOrderParams.doctorId,
    doctorName: doctorOrderParams.doctorName,
    doctorSpecialty: doctorOrderParams.doctorSpecialty,
    orderDate: doctorOrderParams.orderDate,
    orderNotes: doctorOrderParams.orderNotes,
    clinicName: doctorOrderParams.clinicName,
    status: 'Requested by Doctor'
  };
}

export default {
  buildDoctorOrderRedirectUrl,
  buildMinimalDoctorOrderUrl,
  redirectToRadiologyBooking,
  extractDoctorOrderParamsFromUrl,
  validateDoctorOrderParams,
  enrichAppointmentWithDoctorOrder
};
