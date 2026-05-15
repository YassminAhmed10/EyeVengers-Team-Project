// src/services/authService.js — No Firebase
export const authService = {
  logout: () => {
    const keep = ['radiologyAdminLoggedIn','radiologyAdminEmail','radiologyAdminRole','localPatientAccounts'];
    const saved = {};
    keep.forEach(k => { const v = localStorage.getItem(k); if(v) saved[k]=v; });
    localStorage.clear();
    Object.entries(saved).forEach(([k,v]) => localStorage.setItem(k,v));
    window.dispatchEvent(new Event("userDataUpdated"));
  },
  isLoggedIn: () => !!(localStorage.getItem("radiologyPatientName") || localStorage.getItem("authToken")),
  isAdmin:    () => localStorage.getItem("radiologyAdminLoggedIn") === "true",
  getPatientName:  () => localStorage.getItem("radiologyPatientName") || "",
  getPatientEmail: () => localStorage.getItem("radiologyPatientEmail") || "",
  getRadiologyId:  () => localStorage.getItem("radiologyPatientId") || "",
};
export default authService;