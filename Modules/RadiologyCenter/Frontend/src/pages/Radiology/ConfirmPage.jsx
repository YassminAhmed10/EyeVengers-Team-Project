// src/pages/Radiology/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const RADIOLOGY_API = "http://localhost:5301/api/fhir";
const CLINIC_API = "http://localhost:5201/api";

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const patientId = searchParams.get("patientId");
  const patientName = searchParams.get("patientName");
  const patientEmail = searchParams.get("patientEmail");
  const patientPhone = searchParams.get("patientPhone");
  const priority = searchParams.get("priority") || "Routine";
  const clinicalIndication = searchParams.get("clinicalIndication") || "";

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    fetchServices();
    if (patientId) fetchPatientData();
  }, [patientId]);

  useEffect(() => {
    if (selectedService && date) fetchSlots();
  }, [selectedService, date]);

  const fetchPatientData = async () => {
    try {
      const { data } = await axios.get(`${CLINIC_API}/Patient/${patientId}`);
      setPatientData(data);
    } catch (err) {
      console.warn("Could not load patient data:", err.message);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${RADIOLOGY_API}/services`);
      setServices(data);
    } catch (err) {
      setError("Unable to load radiology services. Make sure Radiology Center is running on port 5301.");
    }
    setLoading(false);
  };

  const fetchSlots = async () => {
    if (!selectedService || !date) return;
    setLoading(true);
    try {
      const code = selectedService.type?.[0]?.coding?.[0]?.code || selectedService.id;
      const { data } = await axios.get(`${RADIOLOGY_API}/slots`, {
        params: { service: code, date }
      });
      setSlots(data);
      setSelectedSlot(null);
    } catch (err) {
      setError("Unable to load available time slots");
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedService || !date || !selectedSlot) {
      setError("Please complete all steps");
      return;
    }

    setBooking(true);
    try {
      // Build FHIR Bundle directly
      const slotStart = new Date(selectedSlot.start);
      const slotEnd = new Date(selectedSlot.end);
      const code = selectedService.type?.[0]?.coding?.[0];

      const bundle = {
        resourceType: "Bundle",
        type: "transaction",
        entry: [
          {
            resource: {
              resourceType: "Patient",
              id: patientId || "P-" + Date.now(),
              identifier: [{ system: "EyeClinic", value: patientId || "UNKNOWN" }],
              name: [{
                family: (patientName || patientData?.lastName || "Unknown").split(" ").pop() || "Unknown",
                given: [(patientName || patientData?.firstName || "Unknown").split(" ")[0]]
              }],
              telecom: [
                { system: "phone", value: patientPhone || patientData?.phone || "" },
                { system: "email", value: patientEmail || patientData?.email || "" }
              ],
              gender: (patientData?.gender || "unknown").toLowerCase(),
              birthDate: patientData?.dateOfBirth?.split("T")[0]
            }
          },
          {
            resource: {
              resourceType: "ServiceRequest",
              status: "active",
              intent: "order",
              priority: priority.toLowerCase(),
              code: {
                coding: [{ system: "http://loinc.org", code: code?.code, display: code?.display }]
              },
              subject: { reference: `Patient/${patientId}` },
              requester: { reference: "Practitioner/DR-1" },
              note: clinicalIndication ? [{ text: clinicalIndication }] : null
            }
          },
          {
            resource: {
              resourceType: "Appointment",
              status: "booked",
              serviceType: [{ text: code?.display }],
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              participant: [
                { actor: { reference: `Patient/${patientId}` }, status: "accepted" }
              ]
            }
          }
        ]
      };

      console.log("Sending FHIR Bundle:", JSON.stringify(bundle, null, 2));

      const { data } = await axios.post(`${RADIOLOGY_API}/appointments`, bundle);
      console.log("Booking result:", data);

      setBookingResult(data);
      setMessage(`Appointment confirmed! Confirmation: ${data.confirmationId}`);
      setStep(4); // Show success page
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(`Booking failed: ${errMsg}`);
      console.error("Booking error:", err.response?.data || err);
    }
    setBooking(false);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const getTimeDisplay = (slot) => {
    return new Date(slot.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const styles = {
    mainContainer: { display: "flex", gap: "30px", padding: "30px 20px", maxWidth: "1400px", margin: "0 auto", fontFamily: "'Segoe UI', Arial, sans-serif" },
    leftPanel: { flex: "0 0 35%", minWidth: "300px" },
    rightPanel: { flex: "1 1 65%", minWidth: "400px" },
    fhirCard: { background: "white", border: "2px solid #1e3a5f", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "24px" },
    fhirTitle: { fontSize: "18px", fontWeight: "700", color: "#1e3a5f", marginBottom: "16px", borderBottom: "2px solid #1e3a5f", paddingBottom: "12px" },
    fhirSection: { marginBottom: "16px" },
    fhirLabel: { fontSize: "11px", color: "#999", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px", marginBottom: "4px" },
    fhirValue: { fontSize: "14px", color: "#333", fontWeight: "500" },
    header: { marginBottom: "30px", textAlign: "center" },
    title: { fontSize: "28px", fontWeight: "600", color: "#1e3a5f", margin: "0 0 8px 0" },
    subtitle: { fontSize: "14px", color: "#6c757d", margin: 0 },
    steps: { display: "flex", marginBottom: "30px", borderBottom: "1px solid #dee2e6", paddingBottom: "15px" },
    stepBox: { flex: 1, textAlign: "center", position: "relative" },
    stepNumber: { width: "30px", height: "30px", borderRadius: "50%", background: "#e9ecef", color: "#6c757d", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginBottom: "8px" },
    stepActive: { background: "#1e3a5f", color: "white" },
    stepCompleted: { background: "#28a745", color: "white" },
    stepLabel: { fontSize: "12px", color: "#6c757d", display: "block" },
    stepLabelActive: { color: "#1e3a5f", fontWeight: "bold" },
    card: { background: "white", border: "1px solid #e0e0e0", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
    label: { display: "block", fontWeight: "600", marginBottom: "8px", color: "#495057", fontSize: "14px" },
    select: { width: "100%", padding: "12px", border: "1px solid #ced4da", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", fontFamily: "inherit" },
    input: { width: "100%", padding: "12px", border: "1px solid #ced4da", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", fontFamily: "inherit" },
    slotsGrid: { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" },
    slotBtn: { padding: "10px 20px", border: "1px solid #dee2e6", borderRadius: "8px", background: "white", cursor: "pointer", fontSize: "14px", transition: "all 0.2s" },
    slotSelected: { background: "#1e3a5f", borderColor: "#1e3a5f", color: "white" },
    confirmBox: { background: "#f8f9fa", borderRadius: "8px", padding: "16px", marginBottom: "20px" },
    confirmRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e9ecef" },
    button: { width: "100%", padding: "14px", background: "#1e3a5f", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
    buttonDisabled: { background: "#adb5bd", cursor: "not-allowed" },
    navButtons: { display: "flex", gap: "12px", marginTop: "20px" },
    navButton: { flex: 1, padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", border: "none" },
    error: { background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
    success: { background: "#d4edda", color: "#155724", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
    loading: { textAlign: "center", padding: "20px", color: "#6c757d" },
    successCard: { background: "#d4edda", border: "2px solid #28a745", borderRadius: "12px", padding: "30px", textAlign: "center" }
  };

  if (loading && services.length === 0) {
    return <div style={styles.loading}>Loading services...</div>;
  }

  // Success view
  if (step === 4 && bookingResult) {
    return (
      <div style={{ ...styles.mainContainer, justifyContent: "center" }}>
        <div style={{ maxWidth: 600, width: "100%" }}>
          <div style={styles.successCard}>
            <h1 style={{ color: "#155724", marginBottom: 16 }}>Booking Confirmed</h1>
            <div style={{ fontSize: 14, color: "#155724", marginBottom: 24 }}>
              <div><strong>Appointment ID:</strong> {bookingResult.appointmentId}</div>
              <div><strong>Confirmation ID:</strong> {bookingResult.confirmationId}</div>
              <div><strong>HL7 Message ID:</strong> {bookingResult.hl7MessageId}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Check the Radiology Center backend console to see the full HL7 ORM^O01 message.
              </div>
            </div>
            <button onClick={() => navigate("/patient/orders")} style={styles.button}>
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      {/* LEFT PANEL */}
      <div style={styles.leftPanel}>
        <div style={styles.fhirCard}>
          <div style={styles.fhirTitle}>Patient Information (FHIR)</div>

          <div style={styles.fhirSection}>
            <div style={styles.fhirLabel}>Patient Name</div>
            <div style={styles.fhirValue}>{patientName || patientData?.firstName + " " + patientData?.lastName || "N/A"}</div>
          </div>

          <div style={styles.fhirSection}>
            <div style={styles.fhirLabel}>Patient ID (MRN)</div>
            <div style={styles.fhirValue}>{patientId || "N/A"}</div>
          </div>

          {patientData && (
            <>
              <div style={styles.fhirSection}>
                <div style={styles.fhirLabel}>Date of Birth</div>
                <div style={styles.fhirValue}>
                  {patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toLocaleDateString() : "N/A"}
                  {patientData.dateOfBirth && ` (Age ${calculateAge(patientData.dateOfBirth)})`}
                </div>
              </div>

              <div style={styles.fhirSection}>
                <div style={styles.fhirLabel}>Gender</div>
                <div style={styles.fhirValue}>{patientData.gender || "N/A"}</div>
              </div>
            </>
          )}

          <div style={styles.fhirSection}>
            <div style={styles.fhirLabel}>Phone</div>
            <div style={styles.fhirValue}>{patientPhone || patientData?.phone || "N/A"}</div>
          </div>

          <div style={styles.fhirSection}>
            <div style={styles.fhirLabel}>Email</div>
            <div style={styles.fhirValue}>{patientEmail || patientData?.email || "N/A"}</div>
          </div>

          <div style={{ ...styles.fhirSection, marginTop: 20, paddingTop: 20, borderTop: "1px solid #eee" }}>
            <div style={styles.fhirLabel}>Order Details</div>
            <div style={styles.fhirValue}>Order ID: {orderId || "N/A"}</div>
            <div style={styles.fhirValue}>Priority: {priority}</div>
            {clinicalIndication && (
              <div style={styles.fhirValue}>Indication: {clinicalIndication}</div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.rightPanel}>
        <div style={styles.header}>
          <h1 style={styles.title}>Book Appointment</h1>
          <p style={styles.subtitle}>Schedule your radiology examination</p>
        </div>

        <div style={styles.steps}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={styles.stepBox}>
              <div style={{ ...styles.stepNumber, ...(step >= n ? styles.stepActive : {}) }}>{n}</div>
              <span style={{ ...styles.stepLabel, ...(step >= n ? styles.stepLabelActive : {}) }}>
                {n === 1 ? "Service" : n === 2 ? "Date & Time" : "Confirm"}
              </span>
            </div>
          ))}
        </div>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {step === 1 && (
          <div style={styles.card}>
            <label style={styles.label}>Select Radiology Service</label>
            <select
              style={styles.select}
              value={selectedService?.id || ""}
              onChange={(e) => {
                const service = services.find(s => s.id === e.target.value);
                setSelectedService(service);
                setError("");
              }}
            >
              <option value="">-- Select a service --</option>
              {services.map(s => {
                const coding = s.type?.[0]?.coding?.[0];
                const durationExt = s.extension?.find(x => x.url === "durationMin");
                return (
                  <option key={s.id} value={s.id}>
                    {coding?.display} ({durationExt?.valueInteger || 30} min)
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {step === 2 && selectedService && (
          <div style={styles.card}>
            <label style={styles.label}>Select Date</label>
            <input
              type="date"
              style={styles.input}
              value={date}
              min={minDateStr}
              onChange={(e) => setDate(e.target.value)}
            />

            {date && (
              <>
                <label style={styles.label}>Available Time Slots</label>
                {loading ? (
                  <div style={styles.loading}>Loading slots...</div>
                ) : slots.length === 0 ? (
                  <div style={styles.error}>No available slots for this date.</div>
                ) : (
                  <div style={styles.slotsGrid}>
                    {slots.map(slot => (
                      <button
                        key={slot.id}
                        style={{
                          ...styles.slotBtn,
                          ...(selectedSlot?.id === slot.id ? styles.slotSelected : {})
                        }}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {getTimeDisplay(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 3 && selectedService && date && selectedSlot && (
          <div style={styles.card}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1e3a5f" }}>Confirm Your Appointment</h3>
            <div style={styles.confirmBox}>
              <div style={styles.confirmRow}>
                <span><strong>Service:</strong></span>
                <span>{selectedService.type?.[0]?.coding?.[0]?.display}</span>
              </div>
              <div style={styles.confirmRow}>
                <span><strong>Date:</strong></span>
                <span>{new Date(date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div style={styles.confirmRow}>
                <span><strong>Time:</strong></span>
                <span>{getTimeDisplay(selectedSlot)}</span>
              </div>
              <div style={styles.confirmRow}>
                <span><strong>Patient:</strong></span>
                <span>{patientName || "N/A"}</span>
              </div>
              <div style={styles.confirmRow}>
                <span><strong>Priority:</strong></span>
                <span>{priority}</span>
              </div>
            </div>

            <div style={{ background: "#fff3cd", padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
              <strong>Note:</strong> When you confirm, a FHIR Bundle will be sent to the Radiology Center, which will generate an HL7 v2.5 ORM^O01 message and send it to the RIS. You can see the full HL7 message in the Radiology Center backend console.
            </div>

            <button
              style={{ ...styles.button, ...(booking ? styles.buttonDisabled : {}) }}
              onClick={handleConfirm}
              disabled={booking}
            >
              {booking ? "Sending FHIR + HL7..." : "Confirm Booking"}
            </button>
          </div>
        )}

        <div style={styles.navButtons}>
          {step > 1 && step < 4 && (
            <button
              style={{ ...styles.navButton, background: "#6c757d", color: "white" }}
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}
          {step < 3 && (
            <button
              style={{
                ...styles.navButton,
                background: "#1e3a5f",
                color: "white",
                ...((step === 1 && !selectedService) || (step === 2 && (!date || !selectedSlot)) ? styles.buttonDisabled : {})
              }}
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !selectedService) || (step === 2 && (!date || !selectedSlot))}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;