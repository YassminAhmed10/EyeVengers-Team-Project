/**
 * FHIR/HL7 Segment Logger
 * Logs all FHIR interactions between Clinic and Radiology systems
 */

class FhirSegmentLogger {
    constructor() {
        this.logs = [];
        this.enableConsoleLogging = true;
    }

    // ── Format FHIR Patient Segment ──────────────────────────────────────────
    formatPatientSegment(patient) {
        const segment = {
            segment_type: 'PID', // Patient Identification
            timestamp: new Date().toISOString(),
            system: 'Radiology Center',
            remote_system: 'Eye Clinic',
            data: {
                patient_id: patient.id,
                mrn: patient.identifier?.[0]?.value,
                first_name: patient.name?.[0]?.given?.[0],
                last_name: patient.name?.[0]?.family,
                dob: patient.birthDate,
                gender: patient.gender,
                phone: patient.telecom?.find(t => t.system === 'phone')?.value,
                email: patient.telecom?.find(t => t.system === 'email')?.value,
                address: patient.address?.[0]?.text,
            }
        };
        return segment;
    }

    // ── Format FHIR Observation Segment ──────────────────────────────────────
    formatObservationSegment(observation) {
        const segment = {
            segment_type: 'OBX', // Observation/Result
            timestamp: new Date().toISOString(),
            system: 'Radiology Center',
            remote_system: 'Eye Clinic',
            data: {
                observation_id: observation.id,
                patient_id: observation.subject?.reference,
                status: observation.status,
                code: observation.code?.coding?.[0]?.code,
                code_display: observation.code?.coding?.[0]?.display,
                value: observation.value?.Coding?.display || observation.valueString,
                effective_date: observation.effectiveDateTime,
            }
        };
        return segment;
    }

    // ── Format FHIR Appointment Segment ──────────────────────────────────────
    formatAppointmentSegment(appointment) {
        const segment = {
            segment_type: 'SCH', // Appointment/Schedule
            timestamp: new Date().toISOString(),
            system: 'Radiology Center',
            remote_system: 'Eye Clinic',
            data: {
                appointment_id: appointment.id,
                patient_id: appointment.participant?.find(p => p.actor?.reference?.includes('Patient'))?.actor?.reference,
                status: appointment.status,
                start: appointment.start,
                end: appointment.end,
                reason: appointment.reasonCode?.[0]?.coding?.[0]?.display,
                location: appointment.location?.[0]?.display,
            }
        };
        return segment;
    }

    // ── Log FHIR Segment ─────────────────────────────────────────────────────
    logSegment(segmentType, data, direction = 'REQUEST') {
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const arrow = direction === 'REQUEST' ? '→ OUT' : '← IN';
        const color = direction === 'REQUEST' ? '\x1b[33m' : '\x1b[36m'; // Yellow for OUT, Cyan for IN
        const reset = '\x1b[0m';

        const logEntry = {
            timestamp: new Date().toISOString(),
            type: segmentType.segment_type,
            direction,
            data: segmentType
        };

        this.logs.push(logEntry);

        if (this.enableConsoleLogging) {
            console.log(`
${color}╔══════════════════════════════════════════════════════════════════╗${reset}
${color}║ FHIR/HL7 SEGMENT LOG - ${timestamp}${reset}
${color}║ Direction: ${arrow}${reset}
${color}╠══════════════════════════════════════════════════════════════════╣${reset}
${color}║ Segment Type: ${segmentType.segment_type}${reset}
${color}║ System: ${segmentType.system} → ${segmentType.remote_system}${reset}
${color}║ Status: SUCCESS${reset}
${color}╠══════════════════════════════════════════════════════════════════╣${reset}
${color}║ PAYLOAD:${reset}
${color}${JSON.stringify(segmentType.data, null, 2).split('\n').map(line => '║ ' + line).join('\n')}${reset}
${color}╚══════════════════════════════════════════════════════════════════╝${reset}
            `);
        }
    }

    // ── Log Connection Event ─────────────────────────────────────────────────
    logConnection(fromSystem, toSystem, status = 'SUCCESS') {
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const statusColor = status === 'SUCCESS' ? '\x1b[32m' : '\x1b[31m'; // Green for SUCCESS, Red for ERROR
        const reset = '\x1b[0m';

        console.log(`
${statusColor}╔══════════════════════════════════════════════════════════════════╗${reset}
${statusColor}║ SYSTEM INTEGRATION - ${timestamp}${reset}
${statusColor}║ Connection: ${fromSystem} ↔ ${toSystem}${reset}
${statusColor}║ Status: ${status}${reset}
${statusColor}╚══════════════════════════════════════════════════════════════════╝${reset}
        `);
    }

    // ── Log FHIR Query ──────────────────────────────────────────────────────
    logQuery(endpoint, method, filters = {}) {
        const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        console.log(`
\x1b[35m╔══════════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[35m║ FHIR QUERY - ${timestamp}\x1b[0m
\x1b[35m║ Endpoint: ${endpoint}\x1b[0m
\x1b[35m║ Method: ${method}\x1b[0m
\x1b[35m║ Filters: ${JSON.stringify(filters)}\x1b[0m
\x1b[35m╚══════════════════════════════════════════════════════════════════╝\x1b[0m
        `);
    }

    // ── Get All Logs ────────────────────────────────────────────────────────
    getAllLogs() {
        return this.logs;
    }

    // ── Clear Logs ──────────────────────────────────────────────────────────
    clearLogs() {
        this.logs = [];
    }

    // ── Export Logs ─────────────────────────────────────────────────────────
    exportLogs(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.logs, null, 2);
        }
        // CSV format
        const csv = this.logs.map(log => 
            `${log.timestamp},${log.type},${log.direction},${JSON.stringify(log.data)}`
        ).join('\n');
        return csv;
    }
}

export const fhirSegmentLogger = new FhirSegmentLogger();
