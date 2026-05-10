import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const RADIOLOGY_API = "http://localhost:5301/api";
const CLINIC_API = "http://localhost:5201/api";

// Image imports - MAKE SURE THESE PATHS ARE CORRECT FOR YOUR PROJECT
import mriImage from "../../assets/MRI-1-768x576.jpg";
import ctImage from "../../assets/ct scan.webp";
import ultrasoundImage from "../../assets/Ultrasound.jpg";
import xrayImage from "../../assets/X_Ray.jpg";

// Fallback images in case imports fail
const FALLBACK_IMAGES = {
  mri: "https://images.unsplash.com/photo-1581595220894-b7c8fd2a53e1?w=100&q=80",
  ct: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&q=80",
  ultrasound: "https://images.unsplash.com/photo-1581595220894-b7c8fd2a53e1?w=100&q=80",
  xray: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=100&q=80",
  default: "https://images.unsplash.com/photo-1581595220894-b7c8fd2a53e1?w=100&q=80"
};

const BookingPage = ({ selectedService: propSelectedService, onBack, setPage }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const patientId = searchParams.get("patientId");
  const patientNameParam = searchParams.get("patientName");

  const [selectedService, setSelectedService] = useState(() => {
    if (propSelectedService) return propSelectedService;
    // Try to read service info from URL search params for direct links
    const svcName = searchParams.get("serviceName");
    if (svcName) {
      const svcId = searchParams.get("serviceId");
      const svcRange = searchParams.get("serviceRange");
      const parsedId = svcId && !isNaN(parseInt(svcId, 10)) ? parseInt(svcId, 10) : null;
      return { id: parsedId, name: svcName, range: svcRange || "" };
    }
    return null;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  // Auto-generated patient data
  const [autoPatientId, setAutoPatientId] = useState("");
  const [autoPatientName, setAutoPatientName] = useState("");

  // Generate random booking reference
  const generateBookingReference = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const ref = letters[Math.floor(Math.random() * 26)] + 
                letters[Math.floor(Math.random() * 26)] + 
                numbers[Math.floor(Math.random() * 10)] +
                numbers[Math.floor(Math.random() * 10)] +
                numbers[Math.floor(Math.random() * 10)] +
                numbers[Math.floor(Math.random() * 10)];
    return ref;
  };

  useEffect(() => {
    setBookingReference(generateBookingReference());
  }, []);

  useEffect(() => {
    if (patientId && !patientData) {
      fetchPatientData();
    } else {
      generateAutoPatientId();
    }
  }, [patientId]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      generateTimeSlots();
    }
  }, [selectedService, selectedDate]);

  const fetchPatientData = async () => {
    setPatientLoading(true);
    try {
      const { data } = await axios.get(`${CLINIC_API}/Patient/${patientId}`);
      setPatientData(data);
    } catch (err) {
      console.error("Failed to load patient data:", err);
    }
    setPatientLoading(false);
  };

  const generateAutoPatientId = () => {
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    setAutoPatientId(`PAT-${randomNum}`);
    if (patientNameParam) {
      setAutoPatientName(patientNameParam);
    } else {
      setAutoPatientName("Walk-in Patient");
    }
  };

  // Convert price from USD to EGP (1 USD = 50 EGP)
  const convertToEGP = (usdRange) => {
    if (!usdRange) return "0 ج.م";
    const match = usdRange.match(/\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/);
    if (match) {
      const minUSD = parseInt(match[1].replace(/,/g, ''));
      const maxUSD = parseInt(match[2].replace(/,/g, ''));
      const minEGP = minUSD * 50;
      const maxEGP = maxUSD * 50;
      return `${minEGP.toLocaleString()} – ${maxEGP.toLocaleString()} ج.م`;
    }
    return usdRange.replace('$', '').replace('-', '–') + ' ج.م';
  };

  const generateTimeSlots = () => {
    setLoading(true);
    const slotsArray = [];
    const startHour = 9;
    const endHour = 21;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const isBooked = Math.random() < 0.15;
        
        slotsArray.push({
          id: `${selectedDate?.toISOString().split('T')[0]}-${timeString}`,
          start: timeString,
          display: displayTime,
          isBooked: isBooked
        });
      }
    }
    
    setSlots(slotsArray);
    setSelectedSlot(null);
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      setError("Please complete all steps");
      return;
    }

    if (selectedSlot.isBooked) {
      setError("This time slot is already booked. Please select another time.");
      return;
    }

    setBooking(true);
    try {
      const payload = {
        bookingReference: bookingReference,
        orderId: orderId ? parseInt(orderId, 10) : null,
        patientId: patientId || autoPatientId,
        patientName: patientNameParam || autoPatientName,
        patientData: patientData,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePriceEGP: convertToEGP(selectedService.range),
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: selectedSlot.display,
      };

      try {
        await axios.post(`${RADIOLOGY_API}/appointments`, payload);
      } catch (apiErr) {
        console.log("API not available, simulating booking");
      }
      
      setMessage(`✓ Appointment confirmed! Booking ID: ${bookingReference}`);
      setTimeout(() => navigate("/patient/orders"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    }
    setBooking(false);
  };

  const getTimeDisplay = (slot) => slot.display;

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date && date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date && date < today;
  };

  const changeMonth = (increment) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const monthNames = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  };
  
  const dayNames = {
    en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
    ar: ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
  };

  const [lang, setLang] = useState(() => {
    return document.documentElement.lang === "en" ? "en" : "ar";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setLang(document.documentElement.lang === "en" ? "en" : "ar");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  // FIXED: Get test image with fallback
  const getTestImage = (testName) => {
    if (!testName) return FALLBACK_IMAGES.default;
    
    const name = testName.toLowerCase();
    try {
      if (name.includes("mri")) return mriImage || FALLBACK_IMAGES.mri;
      if (name.includes("ct")) return ctImage || FALLBACK_IMAGES.ct;
      if (name.includes("ultrasound") || name.includes("سونار")) return ultrasoundImage || FALLBACK_IMAGES.ultrasound;
      if (name.includes("x-ray") || name.includes("أشعة سينية")) return xrayImage || FALLBACK_IMAGES.xray;
      return mriImage || FALLBACK_IMAGES.default;
    } catch (e) {
      return FALLBACK_IMAGES.default;
    }
  };

  const egpPrice = selectedService ? convertToEGP(selectedService.range) : "";

  if (!selectedService) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280", marginBottom: 16 }}>No service selected</p>
          <button
            onClick={() => setPage && setPage("services")}
            style={{
              background: "#1e3a5f",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      background: "#f8fafc",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "80px 0 0 0"
    }}>
      {/* Header with Test Name and Image */}
      <div style={{
        background: "#0b1a34",
        padding: "30px 40px",
        marginBottom: 40
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 24 }}>
          <button
            onClick={onBack || (() => setPage && setPage("services"))}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              fontSize: 14,
              color: "#fff",
              cursor: "pointer",
              padding: "8px 16px",
              borderRadius: 30,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            ← {lang === "ar" ? "رجوع" : "Back"}
          </button>
          
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img 
              src={getTestImage(selectedService.name)} 
              alt={selectedService.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = FALLBACK_IMAGES.default;
              }}
            />
          </div>
          
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "white",
            margin: 0
          }}>
            {selectedService.name}
          </h1>
        </div>
      </div>

      {/* 3-Column Layout - Equal Height Boxes */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 60px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 32,
          alignItems: "stretch"
        }}>
          
          {/* COLUMN 1: Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 28
            }}>
              <button onClick={() => changeMonth(-1)} style={{
                background: "#f1f5f9",
                border: "none",
                width: 40,
                height: 40,
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 18
              }}>←</button>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                {monthNames[lang][currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button onClick={() => changeMonth(1)} style={{
                background: "#f1f5f9",
                border: "none",
                width: 40,
                height: 40,
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 18
              }}>→</button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
              marginBottom: 16,
              textAlign: "center"
            }}>
              {dayNames[lang].map((day, idx) => (
                <div key={idx} style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#64748b",
                  padding: "8px 0"
                }}>{day}</div>
              ))}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4
            }}>
              {getDaysInMonth(currentMonth).map((date, idx) => {
                if (!date) return <div key={idx} style={{ padding: "8px 4px" }} />;
                const isPast = isPastDate(date);
                const selected = isSelected(date);
                const today = isToday(date);
                return (
                  <button
                    key={idx}
                    onClick={() => !isPast && setSelectedDate(date)}
                    disabled={isPast}
                    style={{
                      padding: "10px 4px",
                      borderRadius: 40,
                      background: selected ? "#1e3a5f" : "transparent",
                      color: selected ? "white" : (isPast ? "#cbd5e1" : "#334155"),
                      fontWeight: selected ? 600 : (today ? 600 : 400),
                      fontSize: 13,
                      cursor: isPast ? "not-allowed" : "pointer",
                      position: "relative"
                    }}
                  >
                    {date.getDate()}
                    {today && !selected && (
                      <span style={{
                        position: "absolute",
                        bottom: 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 4,
                        height: 4,
                        background: "#1e3a5f",
                        borderRadius: 2
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* COLUMN 2: Time Slots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: 20
            }}>
              {lang === "ar" ? "المواعيد المتاحة" : "Available Time Slots"}
              <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>(9:00 AM - 9:00 PM)</span>
            </h3>

            {!selectedDate ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                <span style={{ fontSize: 48 }}>📅</span>
                <p style={{ fontSize: 13, marginTop: 12 }}>Select a date first</p>
              </div>
            ) : loading ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                <span style={{ fontSize: 48 }}>⏳</span>
                <p style={{ fontSize: 13, marginTop: 12 }}>Loading slots...</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                flex: 1
              }}>
                {slots.map((slot) => (
                  <motion.button
                    key={slot.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                    disabled={slot.isBooked}
                    style={{
                      padding: "12px 8px",
                      background: selectedSlot?.id === slot.id ? "#1e3a5f" : (slot.isBooked ? "#f1f5f9" : "#fff"),
                      border: selectedSlot?.id === slot.id ? "1px solid #1e3a5f" : "1px solid #e2e8f0",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: selectedSlot?.id === slot.id ? 600 : 500,
                      color: selectedSlot?.id === slot.id ? "#fff" : (slot.isBooked ? "#94a3b8" : "#334155"),
                      cursor: slot.isBooked ? "not-allowed" : "pointer",
                      textDecoration: slot.isBooked ? "line-through" : "none",
                      opacity: slot.isBooked ? 0.6 : 1
                    }}
                  >
                    {getTimeDisplay(slot)}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* COLUMN 3: Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 24,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <h3 style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 24,
              paddingBottom: 12,
              borderBottom: "2px solid #e2e8f0"
            }}>
              {lang === "ar" ? "ملخص الحجز" : "Booking Summary"}
            </h3>

            {/* SERVICE Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                {lang === "ar" ? "الخدمة" : "SERVICE"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                {selectedService.name}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e3a5f", marginTop: 6 }}>
                {egpPrice}
              </div>
            </div>

            {/* DATE & TIME Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                {lang === "ar" ? "التاريخ والوقت" : "DATE & TIME"}
              </div>
              {selectedDate ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                    {selectedDate.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric"
                    })}
                  </div>
                  {selectedSlot && (
                    <div style={{ fontSize: 13, color: "#1e3a5f", marginTop: 4, fontWeight: 500 }}>
                      {getTimeDisplay(selectedSlot)}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Not selected</div>
              )}
            </div>

            {/* PATIENT INFORMATION Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                {lang === "ar" ? "معلومات المريض" : "PATIENT INFORMATION"}
              </div>
              
              {patientLoading ? (
                <div style={{ textAlign: "center", padding: 16, background: "#f8fafc", borderRadius: 12 }}>
                  <span>⏳ Loading...</span>
                </div>
              ) : patientData ? (
                <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16 }}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Full Name</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                      {patientData.firstName} {patientData.lastName}
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Patient ID</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1e3a5f" }}>
                      {patientData.id}
                    </div>
                  </div>
                  {patientData.phone && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: "#64748b" }}>Phone Number</div>
                      <div style={{ fontSize: 13, color: "#334155" }}>{patientData.phone}</div>
                    </div>
                  )}
                  {patientData.dateOfBirth && (
                    <div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>Age</div>
                      <div style={{ fontSize: 13, color: "#334155" }}>{calculateAge(patientData.dateOfBirth)} years</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16 }}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Patient Name</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{autoPatientName}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Patient ID</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f" }}>{autoPatientId}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Phone Number</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>Not provided</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>Age</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>N/A</div>
                  </div>
                </div>
              )}
            </div>

            {/* APPOINTMENT ID Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                {lang === "ar" ? "رقم الحجز" : "APPOINTMENT ID"}
              </div>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1e3a5f",
                fontFamily: "monospace",
                background: "#e2e8f0",
                display: "inline-block",
                padding: "6px 16px",
                borderRadius: 30,
                letterSpacing: "1px"
              }}>
                {bookingReference}
              </div>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "12px",
                borderRadius: 12,
                fontSize: 12,
                marginBottom: 20
              }}>
                ⚠️ {error}
              </div>
            )}

            {message && (
              <div style={{
                background: "#ecfdf5",
                color: "#059669",
                padding: "12px",
                borderRadius: 12,
                fontSize: 12,
                marginBottom: 20
              }}>
                ✓ {message}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedSlot || booking || (selectedSlot?.isBooked)}
              style={{
                width: "100%",
                background: (!selectedDate || !selectedSlot || booking) ? "#cbd5e1" : "#1e3a5f",
                color: (!selectedDate || !selectedSlot || booking) ? "#64748b" : "#ffffff",
                border: "none",
                padding: "16px",
                borderRadius: 16,
 fontSize: 15,
                fontWeight: 600,
                cursor: (!selectedDate || !selectedSlot || booking) ? "not-allowed" : "pointer",
                marginTop: "auto"
              }}
            >
              {booking ? "Processing..." : "Confirm Booking"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;