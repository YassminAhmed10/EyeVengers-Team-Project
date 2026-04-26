// Radiology Center Frontend - FHIR API Client Service
// Handles all communication with RadiologyCenter.Backend.Net

import axios from 'axios';

class FhirApiClient {
    constructor() {
        this.baseURL = import.meta.env.VITE_RADIOLOGY_API_URL;
        this.tokenURL = import.meta.env.VITE_RADIOLOGY_TOKEN_URL;
        this.clientId = import.meta.env.VITE_FHIR_CLIENT_ID;
        this.clientSecret = import.meta.env.VITE_FHIR_CLIENT_SECRET;
        this.token = null;
        this.tokenExpiration = null;
    }

    /**
     * Get Bearer token from FHIR server
     */
    async getToken() {
        try {
            // Check if token is still valid
            if (this.token && this.tokenExpiration && new Date() < this.tokenExpiration) {
                return this.token;
            }

            const response = await axios.post(this.tokenURL, {
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                grantType: 'client_credentials'
            });

            this.token = response.data.accessToken;
            // Set expiration to 5 minutes before actual expiration
            const expiresIn = response.data.expiresIn || 3600;
            this.tokenExpiration = new Date(Date.now() + (expiresIn - 300) * 1000);

            return this.token;
        } catch (error) {
            console.error('Failed to get FHIR token:', error);
            throw new Error('Authentication failed');
        }
    }

    /**
     * Make authenticated request to FHIR server
     */
    async request(method, endpoint, data = null) {
        try {
            const token = await this.getToken();
            const config = {
                method,
                url: `${this.baseURL}/${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/fhir+json',
                    'Accept': 'application/fhir+json'
                }
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error('FHIR API request failed:', error);
            throw this.handleError(error);
        }
    }

    // ========== PATIENT ENDPOINTS ==========

    /**
     * Get patient by ID
     * GET /fhir/Patient/{id}
     */
    async getPatient(patientId) {
        return this.request('GET', `Patient/${patientId}`);
    }

    /**
     * Create new patient
     * POST /fhir/Patient
     */
    async createPatient(patientData) {
        const fhirPatient = {
            resourceType: 'Patient',
            identifier: [{
                system: 'http://radiology.example.com/mrn',
                value: patientData.mrn || patientData.medicalRecordNumber
            }],
            name: [{
                given: [patientData.firstName],
                family: patientData.lastName
            }],
            birthDate: patientData.dateOfBirth,
            gender: patientData.gender?.toLowerCase(),
            telecom: [],
            address: patientData.address ? [{
                text: patientData.address
            }] : undefined
        };

        if (patientData.phone) {
            fhirPatient.telecom.push({
                system: 'phone',
                value: patientData.phone
            });
        }

        if (patientData.email) {
            fhirPatient.telecom.push({
                system: 'email',
                value: patientData.email
            });
        }

        return this.request('POST', 'Patient', fhirPatient);
    }

    // ========== SCAN ORDER (ServiceRequest) ENDPOINTS ==========

    /**
     * Create scan order
     * POST /fhir/ServiceRequest
     */
    async createScanOrder(orderData) {
        const serviceRequest = {
            resourceType: 'ServiceRequest',
            identifier: [{
                system: 'http://radiology.example.com/order',
                value: orderData.orderNumber || `ORD-${Date.now()}`
            }],
            status: orderData.status || 'active',
            intent: 'order',
            code: {
                coding: [{
                    system: 'http://loinc.org',
                    code: this.mapScanTypeToLoinc(orderData.scanType),
                    display: orderData.scanType
                }],
                text: orderData.scanType
            },
            subject: {
                reference: `Patient/${orderData.patientId}`
            },
            priority: orderData.priority || 'routine',
            orderedOn: new Date().toISOString(),
            bodySite: orderData.bodyPart ? [{
                text: orderData.bodyPart
            }] : undefined,
            reasonCode: orderData.clinicalIndication ? [{
                text: orderData.clinicalIndication
            }] : undefined
        };

        return this.request('POST', 'ServiceRequest', serviceRequest);
    }

    /**
     * Get scan order by ID
     * GET /fhir/ServiceRequest/{id}
     */
    async getScanOrder(orderId) {
        return this.request('GET', `ServiceRequest/${orderId}`);
    }

    /**
     * Get all scan orders for patient
     * GET /fhir/ServiceRequest?subject=Patient/{id}
     */
    async getPatientScanOrders(patientId) {
        return this.request('GET', `ServiceRequest?subject=Patient/${patientId}`);
    }

    // ========== DIAGNOSTIC REPORT ENDPOINTS ==========

    /**
     * Get radiology report by ID
     * GET /fhir/DiagnosticReport/{id}
     */
    async getDiagnosticReport(reportId) {
        return this.request('GET', `DiagnosticReport/${reportId}`);
    }

    /**
     * Get all reports for patient
     * GET /fhir/DiagnosticReport?subject=Patient/{id}
     */
    async getPatientReports(patientId) {
        return this.request('GET', `DiagnosticReport?subject=Patient/${patientId}`);
    }

    // ========== IMAGING STUDY ENDPOINTS ==========

    /**
     * Get imaging studies for patient
     * GET /fhir/ImagingStudy?subject=Patient/{id}
     */
    async getPatientImagingStudies(patientId) {
        return this.request('GET', `ImagingStudy?subject=Patient/${patientId}`);
    }

    // ========== APPOINTMENT ENDPOINTS ==========

    /**
     * Create appointment
     * POST /fhir/Appointment
     */
    async createAppointment(appointmentData) {
        const appointment = {
            resourceType: 'Appointment',
            identifier: [{
                system: 'http://radiology.example.com/appointment',
                value: appointmentData.appointmentNumber || `APT-${Date.now()}`
            }],
            status: appointmentData.status || 'proposed',
            serviceCategory: [{
                coding: [{
                    system: 'http://snomed.info/sct',
                    code: '363679005',
                    display: 'Imaging'
                }]
            }],
            serviceType: [{
                text: appointmentData.scanType || 'Radiology Scan'
            }],
            start: appointmentData.startTime,
            end: appointmentData.endTime,
            participant: [{
                actor: {
                    reference: `Patient/${appointmentData.patientId}`
                },
                status: 'accepted'
            }],
            description: appointmentData.description
        };

        if (appointmentData.scanOrderId) {
            appointment.basedOn = [{
                reference: `ServiceRequest/${appointmentData.scanOrderId}`
            }];
        }

        return this.request('POST', 'Appointment', appointment);
    }

    /**
     * Get appointment by ID
     * GET /fhir/Appointment/{id}
     */
    async getAppointment(appointmentId) {
        return this.request('GET', `Appointment/${appointmentId}`);
    }

    /**
     * Get all appointments for patient
     * GET /fhir/Appointment?actor=Patient/{id}
     */
    async getPatientAppointments(patientId) {
        return this.request('GET', `Appointment?actor=Patient/${patientId}`);
    }

    // ========== HELPER METHODS ==========

    /**
     * Map scan type to LOINC code
     */
    mapScanTypeToLoinc(scanType) {
        const loincMap = {
            'CT': '71558-2',
            'MRI': '71555-8',
            'XRAY': '71020-1',
            'X-RAY': '71020-1',
            'ULTRASOUND': '71526-4',
            'US': '71526-4'
        };
        return loincMap[scanType?.toUpperCase()] || '71558-2';
    }

    /**
     * Handle API errors
     */
    handleError(error) {
        if (error.response) {
            const operationOutcome = error.response.data;
            
            if (operationOutcome?.issue) {
                const issue = operationOutcome.issue[0];
                return new Error(`${issue.severity}: ${issue.diagnostics}`);
            }
            
            return new Error(`API Error: ${error.response.status} ${error.response.statusText}`);
        } else if (error.request) {
            return new Error('No response from server');
        } else {
            return new Error(error.message);
        }
    }
}

// Export singleton instance
export const fhirClient = new FhirApiClient();
export default FhirApiClient;
