/**
 * Entry Source Detector Utility
 * 
 * Detects whether a patient came from the clinic system or entered directly to radiology.
 * Checks multiple sources in order of priority:
 * 1. URL parameters (fromClinic, fhirSystemId, clinicOrderId)
 * 2. Token claims (clinicSource, fromClinic)
 * 3. localStorage (entrySource, clinicSystemName)
 * 4. Session storage
 * 
 * Returns: { source: 'clinic_system' | 'radiology_direct', clinicInfo: {...} }
 */

/**
 * Detect entry source from URL parameters
 * @returns {Object} { source, clinicInfo }
 */
export function detectEntrySourceFromUrl() {
  const params = new URLSearchParams(window.location.search);
  
  const fromClinic = params.get("fromClinic") === "true";
  const clinicName = params.get("clinicName") || params.get("clinicSystemName");
  const clinicBackUrl = params.get("clinicBackUrl") || params.get("returnUrl");
  const doctorId = params.get("doctorId");
  const orderId = params.get("orderId");
  const fhirSystemId = params.get("fhirSystemId");
  const clinicOrderId = params.get("clinicOrderId");
  
  if (fromClinic || fhirSystemId || clinicOrderId) {
    return {
      source: "clinic_system",
      clinicInfo: {
        name: clinicName || "Clinic System",
        backUrl: clinicBackUrl,
        doctorId,
        orderId: orderId || clinicOrderId,
        fhirSystemId
      }
    };
  }
  
  return null;
}

/**
 * Detect entry source from authentication token claims
 * @returns {Object|null} { source, clinicInfo } or null
 */
export function detectEntrySourceFromToken() {
  try {
    const token = localStorage.getItem("authToken") || 
                  localStorage.getItem("token") || 
                  sessionStorage.getItem("authToken");
    
    if (!token) return null;
    
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    const isFromClinic = payload.clinicSource === true || 
                        payload.fromClinic === true ||
                        payload.source === "clinic_system";
    
    if (isFromClinic) {
      return {
        source: "clinic_system",
        clinicInfo: {
          name: payload.clinicName || payload.clinicSystemName || "Clinic System",
          doctorId: payload.doctorId,
          orderId: payload.clinicOrderId || payload.orderId,
          fhirSystemId: payload.fhirSystemId
        }
      };
    }
  } catch (error) {
    console.warn('[Entry Source] Could not parse token claims:', error.message);
  }
  
  return null;
}

/**
 * Detect entry source from localStorage
 * @returns {Object|null} { source, clinicInfo } or null
 */
export function detectEntrySourceFromStorage() {
  const entrySource = localStorage.getItem("entrySource");
  
  if (entrySource === "clinic_system") {
    return {
      source: "clinic_system",
      clinicInfo: {
        name: localStorage.getItem("clinicSystemName") || "Clinic System",
        backUrl: localStorage.getItem("clinicBackUrl"),
        doctorId: localStorage.getItem("clinicDoctorId"),
        orderId: localStorage.getItem("clinicOrderId")
      }
    };
  }
  
  return null;
}

/**
 * Detect entry source from session storage
 * @returns {Object|null} { source, clinicInfo } or null
 */
export function detectEntrySourceFromSession() {
  const entrySource = sessionStorage.getItem("entrySource");
  
  if (entrySource === "clinic_system") {
    return {
      source: "clinic_system",
      clinicInfo: {
        name: sessionStorage.getItem("clinicSystemName") || "Clinic System",
        backUrl: sessionStorage.getItem("clinicBackUrl"),
        doctorId: sessionStorage.getItem("clinicDoctorId"),
        orderId: sessionStorage.getItem("clinicOrderId")
      }
    };
  }
  
  return null;
}

/**
 * Master function: Detect entry source from all available sources
 * Priority order:
 * 1. URL parameters (highest priority - immediate navigation parameter)
 * 2. Token claims (authentication data)
 * 3. localStorage (session persistence)
 * 4. sessionStorage (session-only data)
 * 5. Default to radiology_direct
 * 
 * @returns {Object} { source: 'clinic_system' | 'radiology_direct', clinicInfo: {...} }
 */
export function detectEntrySource() {
  console.log('[Entry Source] Detecting patient entry source...');
  
  // 1. Check URL parameters
  let result = detectEntrySourceFromUrl();
  if (result) {
    console.log('[Entry Source] Detected from URL parameters:', result);
    return result;
  }
  
  // 2. Check token claims
  result = detectEntrySourceFromToken();
  if (result) {
    console.log('[Entry Source] Detected from token claims:', result);
    return result;
  }
  
  // 3. Check localStorage
  result = detectEntrySourceFromStorage();
  if (result) {
    console.log('[Entry Source] Detected from localStorage:', result);
    return result;
  }
  
  // 4. Check sessionStorage
  result = detectEntrySourceFromSession();
  if (result) {
    console.log('[Entry Source] Detected from sessionStorage:', result);
    return result;
  }
  
  // 5. Default to direct entry
  console.log('[Entry Source] No clinic indicators found - defaulting to radiology_direct');
  return {
    source: "radiology_direct",
    clinicInfo: {
      name: null,
      backUrl: null,
      doctorId: null,
      orderId: null
    }
  };
}

/**
 * Check if patient came from clinic system
 * Shorthand for: detectEntrySource().source === 'clinic_system'
 * 
 * @returns {boolean}
 */
export function isFromClinicSystem() {
  return detectEntrySource().source === "clinic_system";
}

/**
 * Get clinic system information for current patient
 * 
 * @returns {Object} Clinic info object with name, backUrl, doctorId, orderId
 */
export function getClinicSystemInfo() {
  return detectEntrySource().clinicInfo;
}

/**
 * Persist entry source to localStorage for session persistence
 * Call this after detecting clinic system entry to maintain state across page reloads
 * 
 * @param {string} source - 'clinic_system' or 'radiology_direct'
 * @param {Object} clinicInfo - Clinic information object
 */
export function persistEntrySource(source, clinicInfo) {
  if (source === "clinic_system") {
    localStorage.setItem("entrySource", "clinic_system");
    if (clinicInfo?.name) localStorage.setItem("clinicSystemName", clinicInfo.name);
    if (clinicInfo?.backUrl) localStorage.setItem("clinicBackUrl", clinicInfo.backUrl);
    if (clinicInfo?.doctorId) localStorage.setItem("clinicDoctorId", clinicInfo.doctorId);
    if (clinicInfo?.orderId) localStorage.setItem("clinicOrderId", clinicInfo.orderId);
    console.log('[Entry Source] Persisted clinic system entry to localStorage');
  } else {
    localStorage.setItem("entrySource", "radiology_direct");
    // Optionally clear clinic-specific data
    ["clinicSystemName", "clinicBackUrl", "clinicDoctorId", "clinicOrderId"].forEach(
      key => localStorage.removeItem(key)
    );
    console.log('[Entry Source] Persisted direct entry to localStorage');
  }
}

/**
 * Clear entry source from storage
 * Useful for logout or session reset
 */
export function clearEntrySource() {
  localStorage.removeItem("entrySource");
  localStorage.removeItem("clinicSystemName");
  localStorage.removeItem("clinicBackUrl");
  localStorage.removeItem("clinicDoctorId");
  localStorage.removeItem("clinicOrderId");
  
  sessionStorage.removeItem("entrySource");
  sessionStorage.removeItem("clinicSystemName");
  sessionStorage.removeItem("clinicBackUrl");
  sessionStorage.removeItem("clinicDoctorId");
  sessionStorage.removeItem("clinicOrderId");
  
  console.log('[Entry Source] Cleared entry source from storage');
}

/**
 * Build clinic redirect URL
 * Constructs the URL to redirect back to clinic system
 * 
 * @param {string} defaultUrl - Fallback URL if none found in storage
 * @returns {string} Clinic return URL
 */
export function getClinicReturnUrl(defaultUrl = 'http://localhost:5173/patient') {
  const clinicInfo = getClinicSystemInfo();
  return clinicInfo?.backUrl || defaultUrl;
}

/**
 * Build doctor order context
 * Returns object with doctor and order information from clinic referral
 * 
 * @returns {Object} { doctorId, orderId } or { doctorId: null, orderId: null }
 */
export function getDoctorOrderContext() {
  const clinicInfo = getClinicSystemInfo();
  return {
    doctorId: clinicInfo?.doctorId || null,
    orderId: clinicInfo?.orderId || null
  };
}

export default {
  detectEntrySource,
  detectEntrySourceFromUrl,
  detectEntrySourceFromToken,
  detectEntrySourceFromStorage,
  detectEntrySourceFromSession,
  isFromClinicSystem,
  getClinicSystemInfo,
  persistEntrySource,
  clearEntrySource,
  getClinicReturnUrl,
  getDoctorOrderContext
};
