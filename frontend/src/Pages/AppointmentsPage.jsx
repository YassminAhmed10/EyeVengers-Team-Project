import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Appointments.css";

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState("book");
  const [age, setAge] = useState("");
  const [patientId, setPatientId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    phone: "",
    email: "",
    patientBirthDate: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "Upcoming",
    reasonForVisit: "",
    notes: "",
    patientGender: 0,  // 0 = Male, 1 = Female
    doctorId: 1
  });
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  // Generate unique Patient ID (sequential)
  const generatePatientId = async () => {
    try {
      const res = await fetch("http://localhost:5201/api/Appointments");
      const data = await res.json();
      const nextNumber = data.length + 1;
      return `P-${nextNumber.toString().padStart(6, '0')}`;
    } catch {
      // Fallback if API fails
      const randomNum = Math.floor(Math.random() * 999999) + 1;
      return `P-${randomNum.toString().padStart(6, '0')}`;
    }
  };

  // Generate time slots (every 30 minutes from 09:00 to 17:00)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 17:00
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push({ value: time, display: displayTime });
      }
    }
    return slots;
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle input change for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "patientBirthDate") {
      setAge(calculateAge(value));
    }
    if (name === "patientName" && value && !patientId) {
      generatePatientId().then(newId => {
        setPatientId(newId);
        setFormData(prev => ({ ...prev, patientId: newId }));
      });
    }
    // Update booked times when appointment date changes
    if (name === "appointmentDate" && value) {
      const times = appointments
        .filter(apt => apt.appointmentDate?.split('T')[0] === value && apt.status !== 'Cancelled')
        .map(apt => apt.appointmentTime);
      setBookedTimes(times);
    }
  };

  // Check if time slot is available
  const isTimeSlotAvailable = (date, time) => {
    return !appointments.some(
      apt => apt.appointmentDate?.split('T')[0] === date && 
             apt.appointmentTime === time && 
             apt.status !== 'Cancelled'
    );
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;
    
    try {
      const res = await fetch(`http://localhost:5201/api/Appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      
      if (res.ok) {
        setNotification('✅ Appointment cancelled successfully!');
        setTimeout(() => setNotification(''), 4000);
        fetchAppointments();
      } else {
        setNotification('❌ Error cancelling appointment');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (error) {
      setNotification('❌ Error: ' + error.message);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  // Handle form submit for booking appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if appointment date and time are selected
    if (!formData.appointmentDate) {
      setNotification("❌ Please select an appointment date.");
      setTimeout(() => setNotification(""), 4000);
      return;
    }
    
    if (!formData.appointmentTime) {
      setNotification("❌ Please select a time slot.");
      setTimeout(() => setNotification(""), 4000);
      return;
    }
    
    // Check if time slot is already booked
    if (!isTimeSlotAvailable(formData.appointmentDate, formData.appointmentTime)) {
      setNotification("❌ This time slot is already booked. Please select another time.");
      setTimeout(() => setNotification(""), 4000);
      return;
    }
    
    try {
      // Prepare data for backend
      const appointmentData = {
        patientName: formData.patientName,
        patientId: formData.patientId,
        phone: formData.phone,
        email: formData.email,
        patientBirthDate: formData.patientBirthDate,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime + ":00", // Convert "09:00" to "09:00:00" for TimeSpan
        reasonForVisit: formData.reasonForVisit,
        notes: formData.notes,
        patientGender: parseInt(formData.patientGender), // Convert to number
        doctorId: formData.doctorId,
        status: 0 // 0 = Upcoming
      };

      const res = await fetch("http://localhost:5201/api/Appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData)
      });
      
      if (res.ok) {
        setNotification("✅ Appointment booked successfully!");
        setTimeout(() => setNotification(""), 4000);
        fetchAppointments();
        setFormData({
          patientName: "",
          patientId: "",
          phone: "",
          email: "",
          patientBirthDate: "",
          appointmentDate: "",
          appointmentTime: "",
          status: "Upcoming",
          reasonForVisit: "",
          notes: "",
          patientGender: 0,
          doctorId: 1
        });
        setAge("");
        setPatientId("");
      } else {
        const errorData = await res.text();
        console.error("Error response:", errorData);
        setNotification("❌ Error booking appointment: " + errorData);
        setTimeout(() => setNotification(""), 5000);
      }
    } catch (error) {
      console.error("Error:", error);
      setNotification("❌ Error: " + error.message);
      setTimeout(() => setNotification(""), 5000);
    }
  };

    useEffect(() => {
      const role = localStorage.getItem("userRole");
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      if (!isAuthenticated || !role) {
        navigate("/login");
        return;
      }
      fetchAppointments();
    }, [navigate]);

    // Fetch appointments from Backend
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`http://localhost:5201/api/Appointments`);
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setAppointments([]);
      }
    };

    // ...existing code...

    return (
      <div className="appointments-page">
        {/* Tab Navigation */}
        <div className="tab-buttons">
          <button
            className={activeTab === "book" ? "active" : ""}
            onClick={() => setActiveTab("book")}
          >
            Book Appointment
          </button>
          <button
            className={activeTab === "manage" ? "active" : ""}
            onClick={() => setActiveTab("manage")}
          >
            Manage Appointments
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className="notification">
            {notification}
          </div>
        )}

        <div className="tab-content">
          {activeTab === "book" ? (
            <>
              {/* Main Grid - Two Columns */}
              <div className="main-grid">
                {/* Left Column - Book New Appointment */}
                <div className="form-column">
                  <div className="column-header">
                    <h2>Book New Appointment</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="appointment-form">
                    {/* Patient Information */}
                    <div className="form-section">
                      <div className="section-title">
                        <span className="material-symbols-outlined">person</span>
                        Patient Information
                      </div>
                      <div className="form-grid">
                        <div className="form-field">
                          <label>Patient Name</label>
                          <input 
                            type="text" 
                            name="patientName" 
                            placeholder="Enter full name" 
                            value={formData.patientName} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        <div className="form-field">
                          <label>Patient ID</label>
                          <input 
                            type="text" 
                            name="patientId" 
                            placeholder="Auto-generated" 
                            value={formData.patientId} 
                            readOnly 
                          />
                        </div>
                        <div className="form-field">
                          <label>Phone Number</label>
                          <input 
                            type="tel" 
                            name="phone" 
                            placeholder="Enter phone number" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        <div className="form-field">
                          <label>Email</label>
                          <input 
                            type="email" 
                            name="email" 
                            placeholder="Enter email address" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        <div className="form-field">
                          <label>Date of Birth</label>
                          <input 
                            type="date" 
                            name="patientBirthDate" 
                            value={formData.patientBirthDate} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        <div className="form-field">
                          <label>Age</label>
                          <input 
                            type="text" 
                            placeholder="Auto-calculated" 
                            value={age} 
                            readOnly 
                          />
                        </div>
                        <div className="form-field">
                          <label>Gender</label>
                          <select 
                            name="patientGender" 
                            value={formData.patientGender} 
                            onChange={handleInputChange} 
                            required
                          >
                            <option value={0}>Male</option>
                            <option value={1}>Female</option>
                          </select>
                        </div>
                        <div className="form-field">
                          <label>Address</label>
                          <input 
                            type="text" 
                            name="address" 
                            placeholder="Enter address" 
                            value={formData.address || ''} 
                            onChange={handleInputChange} 
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Right Column - Appointment Details */}
                <div className="form-column">
                  <div className="column-header">
                    <h2>Appointment Details</h2>
                  </div>
                  
                  <div className="form-section">
                    <div className="section-title">
                      <span className="material-symbols-outlined">calendar_today</span>
                      Select Date & Time
                    </div>
                    <div className="form-field">
                      <label>Appointment Date</label>
                      <input 
                        type="date" 
                        name="appointmentDate" 
                        value={formData.appointmentDate} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    {/* Time Slots */}
                    <div className="time-slots-section">
                      <label style={{fontWeight: 600, marginBottom: '0.75rem', display: 'block'}}>Select Time</label>
                      <div className="time-slots-grid">
                        {generateTimeSlots().map(slot => {
                          const isBooked = bookedTimes.includes(slot.value);
                          const isSelected = formData.appointmentTime === slot.value;
                          return (
                            <button
                              key={slot.value}
                              type="button"
                                disabled={isBooked}
                                onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot.value }))}
                                className={`time-slot ${isSelected ? 'selected' : ''}`}
                              >
                                {slot.display}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* Reason for Visit Section */}
              <div className="reason-section">
                <div className="section-title" style={{fontSize: '1.3rem', marginBottom: '1.5rem', textAlign: 'center'}}>
                  Reason for Visit
                </div>
                <div className="reason-buttons-grid">
                  <button
                    type="button"
                    className={`reason-btn ${formData.reasonForVisit === "Routine Eye Exam" ? "selected" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonForVisit: "Routine Eye Exam" }))}
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    <span className="reason-text">Routine Eye Exam</span>
                  </button>

                  <button
                    type="button"
                    className={`reason-btn ${formData.reasonForVisit === "Vision Problems" ? "selected" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonForVisit: "Vision Problems" }))}
                  >
                    <span className="material-symbols-outlined">blur_on</span>
                    <span className="reason-text">Vision Problems</span>
                  </button>

                  <button
                    type="button"
                    className={`reason-btn ${formData.reasonForVisit === "Eye Pain" ? "selected" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonForVisit: "Eye Pain" }))}
                  >
                    <span className="material-symbols-outlined">sentiment_very_dissatisfied</span>
                    <span className="reason-text">Eye Pain</span>
                  </button>

                  <button
                    type="button"
                    className={`reason-btn ${formData.reasonForVisit === "Red Eyes" ? "selected" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonForVisit: "Red Eyes" }))}
                  >
                    <span className="material-symbols-outlined">remove_red_eye</span>
                    <span className="reason-text">Red Eyes</span>
                  </button>

                  <button
                    type="button"
                    className={`reason-btn ${formData.reasonForVisit === "Contact Lenses" ? "selected" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonForVisit: "Contact Lenses" }))}
                  >
                    <span className="material-symbols-outlined">contact_page</span>
                    <span className="reason-text">Contact Lenses</span>
                  </button>

                  <button
                    type="button"
                    className={`reason-btn ${formData.reasonForVisit === "Glasses Prescription" ? "selected" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonForVisit: "Glasses Prescription" }))}
                  >
                    <span className="material-symbols-outlined">eyeglasses</span>
                    <span className="reason-text">New Glasses</span>
                  </button>

                  <button
                    type="button"
                    className={`reason-btn ${formData.reasonForVisit === "Dry Eyes" ? "selected" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonForVisit: "Dry Eyes" }))}
                  >
                    <span className="material-symbols-outlined">water_drop</span>
                    <span className="reason-text">Dry Eyes</span>
                  </button>

                  <button
                    type="button"
                    className={`reason-btn ${formData.reasonForVisit === "Eye Infection" ? "selected" : ""}`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonForVisit: "Eye Infection" }))}
                  >
                    <span className="material-symbols-outlined">coronavirus</span>
                    <span className="reason-text">Eye Infection</span>
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="action-buttons">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setFormData({
                    patientName: "",
                    patientId: "",
                    phone: "",
                    email: "",
                    patientBirthDate: "",
                    appointmentDate: "",
                    appointmentTime: "",
                    status: "Upcoming",
                    reasonForVisit: "",
                    notes: "",
                    patientGender: 0,
                    doctorId: 1
                  });
                  setAge("");
                  setPatientId("");
                }}>
                  <span className="material-symbols-outlined">restart_alt</span>
                  Reset
                </button>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                  <span className="material-symbols-outlined">check_circle</span>
                  Book Appointment
                </button>
              </div>
            </>
          ) : (
            <div className="appointment-card management-card">
              <div className="card-header">
                <h2>Manage Appointments</h2>
                <p>View and manage all scheduled appointments</p>
              </div>
              <div className="management-controls">
                <div className="search-filter-section">
                  <div className="search-box">
                    <span className="material-symbols-outlined">search</span>
                    <input 
                      type="text" 
                      placeholder="Search patients, appointments..." 
                      className="search-input"
                    />
                  </div>
                  <div className="filter-controls">
                    <select className="filter-select">
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select className="filter-select">
                      <option value="">All Types</option>
                      <option value="checkup">Routine Checkup</option>
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                    </select>
                    <input 
                      type="date" 
                      className="filter-select"
                      placeholder="Filter by date"
                    />
                  </div>
                </div>
              </div>
              <div className="table-container">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Age</th>
                      <th>Contact Info</th>
                      <th>Appointment Date</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr><td colSpan="8">No appointments found</td></tr>
                    ) : (
                      appointments.map((appt) => (
                        <tr key={appt.appointmentId}>
                          <td>
                            <div className="patient-info">
                              <span className="patient-name">{appt.patientName}</span>
                              <span className="patient-id">ID: {appt.patientId}</span>
                            </div>
                          </td>
                          <td>{appt.age ?? ''}</td>
                          <td>
                            <div className="contact-info">
                              <span>{appt.phoneNumber}</span>
                              <span>{appt.email}</span>
                            </div>
                          </td>
                          <td>{appt.appointmentDate?.split('T')[0]}</td>
                          <td>{appt.appointmentTime}</td>
                          <td>{appt.reasonForVisit}</td>
                          <td>
                            <span className={`status-badge ${appt.status}`}>{appt.status}</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="action-btn view-btn" title="View Details">
                                <span className="material-symbols-outlined">visibility</span>
                              </button>
                              {appt.status !== 'Cancelled' && (
                                <button 
                                  className="action-btn cancel-btn" 
                                  title="Cancel Appointment"
                                  onClick={() => handleCancelAppointment(appt.appointmentId)}
                                  style={{backgroundColor: '#ef4444', color: 'white'}}
                                >
                                  <span className="material-symbols-outlined">cancel</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-pagination">
                <div className="pagination-info">
                  Showing 1-{appointments.length} of {appointments.length} appointments
                </div>
                <div className="pagination-controls">
                  <button className="pagination-btn" disabled>
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="pagination-btn active">1</button>
                  <button className="pagination-btn">2</button>
                  <button className="pagination-btn">3</button>
                  <button className="pagination-btn">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }