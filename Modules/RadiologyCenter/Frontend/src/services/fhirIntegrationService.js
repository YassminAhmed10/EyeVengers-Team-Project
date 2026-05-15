/**
 * FHIR Integration Service
 * Handles communication between Clinic and Radiology systems using FHIR/HL7
 * Replaces Firebase with proper healthcare interoperability standards
 */

import { fhirSegmentLogger } from './fhirSegmentLogger';

class FhirIntegrationService {
    constructor() {
        this.clinicApiUrl = import.meta.env.VITE_CLINIC_API_URL || 'http://localhost:5300/api';
        this.radiologyApiUrl = import.meta.env.VITE_RADIOLOGY_BASE_URL + '/api' || 'http://localhost:5301/api';
        this.token = localStorage.getItem('authToken') || localStorage.getItem('token');
    }

    // ── Fetch Patient from Clinic via FHIR ──────────────────────────────────
    async getPatientFromClinic(patientEmail) {
        try {
            fhirSegmentLogger.logQuery(`/Patient/by-email/${patientEmail}`, 'GET', { email: patientEmail });
            
            // Search for patient from clinic backend using exact email endpoint
            const response = await fetch(
                `${this.clinicApiUrl}/Patient/by-email/${encodeURIComponent(patientEmail)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/fhir+json'
                    }
                }
            );

            if (!response.ok) throw new Error(`Patient not found (${response.status})`);

            const patient = await response.json();

            if (patient) {
                fhirSegmentLogger.logConnection('Eye Clinic', 'Radiology Center', 'SUCCESS');
                fhirSegmentLogger.logSegment(
                    fhirSegmentLogger.formatPatientSegment(patient),
                    patient,
                    'IN'
                );
                
                // IMPORTANT: Send FHIR patient to Radiology backend to trigger [PID], [SCH] logging
                await this.sendFhirBundleToRadiology({ resourceType: 'Bundle', entry: [{ resource: patient }] });
            }

            return patient;
        } catch (error) {
            fhirSegmentLogger.logConnection('Eye Clinic', 'Radiology Center', 'ERROR');
            console.error('Error fetching patient from clinic:', error);
            return null;
        }
    }

    // ── Send FHIR Bundle to Radiology Backend (triggers segment logging) ─────
    async sendFhirBundleToRadiology(fhirBundle) {
        try {
            console.log('\n%c→ SENDING FHIR BUNDLE TO RADIOLOGY BACKEND', 'color: yellow; font-weight: bold; font-size: 12px');
            
            const response = await fetch(
                `${this.radiologyApiUrl}/RadiologyIntegration/receive-fhir-bundle`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/fhir+json',
                        'Accept': 'application/fhir+json'
                    },
                    body: JSON.stringify(fhirBundle)
                }
            );

            if (!response.ok) {
                throw new Error(`Radiology backend returned ${response.status}`);
            }

            const result = await response.json();
            console.log('%c✓ FHIR bundle delivered to Radiology backend', 'color: green; font-weight: bold; font-size: 12px');
            console.log('%c  Check Terminal 2 for FHIR segment logs: [PID], [SCH], [OBX]', 'color: cyan; font-size: 11px');
            
            return result;
        } catch (error) {
            console.error('%c✗ Failed to send FHIR bundle to Radiology backend:', 'color: red; font-weight: bold', error);
            return null;
        }
    }

    // ── Fetch Observations (Test Results) from Clinic ──────────────────────
    async getObservationsFromClinic(patientId) {
        try {
            fhirSegmentLogger.logQuery(`/MedicalRecord?patientId=${patientId}`, 'GET', { patientId: patientId });

            const response = await fetch(
                `${this.clinicApiUrl}/Patient/${patientId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/fhir+json'
                    }
                }
            );

            if (!response.ok) throw new Error('Medical records not found');

            const patient = await response.json();
            const medicalRecords = patient.medicalRecords || [];

            medicalRecords.forEach(record => {
                fhirSegmentLogger.logSegment(
                    fhirSegmentLogger.formatObservationSegment(record),
                    record,
                    'IN'
                );
            });

            return medicalRecords;
        } catch (error) {
            console.error('Error fetching medical records:', error);
            return [];
        }
    }

    // ── Fetch Appointments from Clinic ──────────────────────────────────────
    async getAppointmentsFromClinic(patientId) {
        try {
            fhirSegmentLogger.logQuery(`/Appointment?patient=${patientId}`, 'GET', { patient: patientId });

            // Try to fetch appointments from appointment endpoint
            const response = await fetch(
                `${this.clinicApiUrl}/Appointment?patientId=${patientId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/fhir+json'
                    }
                }
            );

            if (!response.ok) {
                console.warn('Appointments endpoint returned:', response.status);
                return [];
            }

            const result = await response.json();
            const appointments = Array.isArray(result) ? result : result.entry?.map(e => e.resource) || [];

            appointments.forEach(apt => {
                fhirSegmentLogger.logSegment(
                    fhirSegmentLogger.formatAppointmentSegment(apt),
                    apt,
                    'IN'
                );
            });

            return appointments;
        } catch (error) {
            console.warn('Error fetching appointments (this may be expected if endpoint not available):', error);
            return [];
        }
    }

    // ── Send Radiology Result to Clinic (Reference Exchange) ──────────────
    async sendRadiologyResultToClinic(diagnosticReport) {
        try {
            fhirSegmentLogger.logQuery('/DiagnosticReport', 'POST', { patientId: diagnosticReport.subject?.reference });

            const response = await fetch(
                `${this.clinicApiUrl}/DiagnosticReport`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/fhir+json',
                        'Accept': 'application/fhir+json'
                    },
                    body: JSON.stringify(diagnosticReport)
                }
            );

            if (!response.ok) throw new Error('Failed to send diagnostic report to clinic');

            const result = await response.json();
            
            console.log('\x1b[32m✓ Diagnostic Report sent to Clinic\x1b[0m');
            fhirSegmentLogger.logConnection('Radiology Center', 'Eye Clinic', 'SUCCESS');

            return result;
        } catch (error) {
            console.error('Error sending diagnostic report:', error);
            fhirSegmentLogger.logConnection('Radiology Center', 'Eye Clinic', 'ERROR');
            return null;
        }
    }

    // ── Parse FHIR Response to UI-friendly format ───────────────────────────
    parseFhirPatient(patient) {
        if (!patient) return null;

        // Handle clinic model format (FirstName, LastName, Phone, Email, DateOfBirth)
        if (patient.firstName || patient.FirstName) {
            return {
                firstName: patient.firstName || patient.FirstName || '',
                lastName: patient.lastName || patient.LastName || '',
                email: patient.email || patient.Email || '',
                phone: patient.phone || patient.Phone || '',
                birthDate: patient.dateOfBirth || patient.DateOfBirth || '',
                gender: patient.gender || patient.Gender || '',
                address: patient.address || patient.Address || '',
                patientId: patient.id || patient.Id,
                patientIdentifier: patient.identifier || patient.Identifier || patient.id || patient.Id,
                resourceId: patient.id || patient.Id,
            };
        }

        // Handle FHIR format (name array, telecom array)
        const name = patient.name?.[0] || {};
        const telecom = patient.telecom || [];
        const address = patient.address?.[0] || {};
        
        // Extract patient identifier from FHIR identifier array (P-000035 format)
        const identifier = patient.identifier?.[0]?.value || patient.identifier || patient.id;

        return {
            firstName: name.given?.[0] || '',
            lastName: name.family || '',
            email: telecom.find(t => t.system === 'email')?.value || '',
            phone: telecom.find(t => t.system === 'phone')?.value || '',
            birthDate: patient.birthDate || '',
            gender: patient.gender || '',
            address: address.text || '',
            patientId: patient.id,
            patientIdentifier: identifier,
            resourceId: patient.id,
        };
    }
}

export const fhirIntegrationService = new FhirIntegrationService();
