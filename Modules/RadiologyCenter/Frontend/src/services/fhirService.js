// src/services/fhirService.js
// FHIR service — gracefully handles unavailable server (no crash, no console spam)

const FHIR_BASE = import.meta.env.VITE_FHIR_SERVER_URL || null;
const TOKEN_URL = FHIR_BASE ? `${FHIR_BASE}/token` : null;

let _cachedToken  = null;
let _tokenExpiry  = 0;
let _serverAvail  = null; // null=unknown, true=up, false=down
let _lastCheck    = 0;
const CHECK_TTL   = 60_000; // re-check server every 60s

// ── Silent token fetch — never throws ─────────────────────────────────────────
async function tryFetch(url, opts = {}, timeout = 5000) {
  if (!url) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timer);
    return res.ok ? res : null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export const fhirService = {
  // Returns token string or null — never throws
  getAccessToken: async () => {
    if (!TOKEN_URL) return null;

    // Serve cached token if still valid
    if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

    // Don't hammer a known-down server
    if (_serverAvail === false && Date.now() - _lastCheck < CHECK_TTL) return null;

    const res = await tryFetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     import.meta.env.VITE_FHIR_CLIENT_ID     || 'radiology-center',
        client_secret: import.meta.env.VITE_FHIR_CLIENT_SECRET || '',
      }),
    });

    _lastCheck = Date.now();

    if (!res) {
      _serverAvail = false;
      return null;
    }

    try {
      const data = await res.json();
      if (data?.access_token) {
        _cachedToken = data.access_token;
        _tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
        _serverAvail = true;
        return _cachedToken;
      }
    } catch { /* ignore parse error */ }

    _serverAvail = false;
    return null;
  },

  // Create FHIR Patient resource — silent fail if server down
  createPatient: async (patientData) => {
    const token = await fhirService.getAccessToken();
    if (!token || !FHIR_BASE) return null;

    const resource = {
      resourceType: 'Patient',
      identifier: [
        { system: 'http://radiology-center.eg/patient-id', value: patientData.radiologyPatientId || patientData.id },
        ...(patientData.externalId ? [{ system: 'http://dr-mohab-eye-clinic.eg/patient-id', value: patientData.externalId }] : []),
      ],
      name: [{ text: patientData.name, use: 'official' }],
      telecom: [
        ...(patientData.phone ? [{ system:'phone', value: patientData.phone }] : []),
        ...(patientData.email ? [{ system:'email', value: patientData.email }] : []),
      ],
      gender: (patientData.gender||'').toLowerCase() || 'unknown',
      birthDate: patientData.dateOfBirth || undefined,
    };

    const res = await tryFetch(`${FHIR_BASE}/Patient`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/fhir+json' },
      body: JSON.stringify(resource),
    });

    if (!res) return null;
    try { return await res.json(); } catch { return null; }
  },

  // Create FHIR Appointment resource
  createAppointment: async (appointmentData) => {
    const token = await fhirService.getAccessToken();
    if (!token || !FHIR_BASE) return null;

    const resource = {
      resourceType: 'Appointment',
      status: 'proposed',
      serviceType: [{ coding: [{ display: appointmentData.serviceName }] }],
      start: appointmentData.appointmentDateTime,
      participant: [{ actor: { reference: `Patient/${appointmentData.patientId}`, display: appointmentData.patientName }, status:'accepted' }],
      identifier: [{ value: appointmentData.bookingReference }],
    };

    const res = await tryFetch(`${FHIR_BASE}/Appointment`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/fhir+json' },
      body: JSON.stringify(resource),
    });

    if (!res) return null;
    try { return await res.json(); } catch { return null; }
  },

  // Check if FHIR server is available
  isAvailable: () => _serverAvail === true,
};

export default fhirService;