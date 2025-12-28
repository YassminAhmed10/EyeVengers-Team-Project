import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../services/apiConfig';
import { FaArrowLeft, FaPhone, FaEnvelope, FaCalendar, FaClock, FaUser, FaIdCard } from 'react-icons/fa';
import './AppointmentDetails.css';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const data = await appointmentsAPI.getById(parseInt(appointmentId));
        setAppointment(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details');
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const getStatusColor = (status) => {
    const statusMap = {
      0: 'upcoming',
      1: 'completed',
      2: 'cancelled',
      3: 'in-progress',
      4: 'no-show'
    };
    return statusMap[status] || 'unknown';
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: 'Upcoming',
      1: 'Completed',
      2: 'Cancelled',
      3: 'In Progress',
      4: 'No Show'
    };
    return statusMap[status] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="appointment-details-container">
        <div className="loading">Loading appointment details...</div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="appointment-details-container">
        <div className="error">
          <p>{error || 'Appointment not found'}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="appointment-details-card">
        {/* Header */}
        <div className="details-header">
          <h1>Appointment Details</h1>
          <span className={`status-badge status-${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>

        {/* Patient Information */}
        <div className="details-section">
          <h2>Patient Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>
                <FaUser /> Patient Name
              </label>
              <p>{appointment.patientName}</p>
            </div>
            <div className="detail-item">
              <label>
                <FaIdCard /> Patient ID
              </label>
              <p>{appointment.patientId}</p>
            </div>
            <div className="detail-item">
              <label>
                <FaPhone /> Phone
              </label>
              <p>{appointment.phone || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>
                <FaEnvelope /> Email
              </label>
              <p>{appointment.email || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Age</label>
              <p>{appointment.age || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Gender</label>
              <p>{appointment.patientGender === 0 ? 'Male' : 'Female'}</p>
            </div>
          </div>
        </div>

        {/* Appointment Information */}
        <div className="details-section">
          <h2>Appointment Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>
                <FaCalendar /> Date
              </label>
              <p>{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            </div>
            <div className="detail-item">
              <label>
                <FaClock /> Time
              </label>
              <p>{appointment.appointmentTime}</p>
            </div>
            <div className="detail-item">
              <label>Doctor</label>
              <p>{appointment.doctor?.doctorName || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Duration</label>
              <p>{appointment.durationMinutes} minutes</p>
            </div>
            <div className="detail-item">
              <label>Reason for Visit</label>
              <p>{appointment.reasonForVisit || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Is Surgery</label>
              <p>{appointment.isSurgery ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Medical History */}
        {(appointment.chronicDiseases || appointment.eyeAllergies || appointment.visionSymptoms) && (
          <div className="details-section">
            <h2>Medical History</h2>
            <div className="details-grid">
              {appointment.chronicDiseases && (
                <div className="detail-item full-width">
                  <label>Chronic Diseases</label>
                  <p>{appointment.chronicDiseases}</p>
                </div>
              )}
              {appointment.eyeAllergies && (
                <div className="detail-item full-width">
                  <label>Eye Allergies</label>
                  <p>{appointment.eyeAllergies}</p>
                </div>
              )}
              {appointment.visionSymptoms && (
                <div className="detail-item full-width">
                  <label>Vision Symptoms</label>
                  <p>{appointment.visionSymptoms}</p>
                </div>
              )}
              {appointment.otherAllergies && (
                <div className="detail-item full-width">
                  <label>Other Allergies</label>
                  <p>{appointment.otherAllergies}</p>
                </div>
              )}
              {appointment.currentMedications && (
                <div className="detail-item full-width">
                  <label>Current Medications</label>
                  <p>{appointment.currentMedications}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insurance Information */}
        {appointment.insuranceCompany && (
          <div className="details-section">
            <h2>Insurance Information</h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Insurance Company</label>
                <p>{appointment.insuranceCompany}</p>
              </div>
              <div className="detail-item">
                <label>Insurance ID</label>
                <p>{appointment.insuranceId || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Policy Number</label>
                <p>{appointment.policyNumber || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Coverage Type</label>
                <p>{appointment.coverageType || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Coverage Percentage</label>
                <p>{appointment.coverage || 'N/A'}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {appointment.finalPrice && (
          <div className="details-section">
            <h2>Payment Information</h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>Final Price</label>
                <p className="price">{appointment.finalPrice} EGP</p>
              </div>
              <div className="detail-item">
                <label>Payment Method</label>
                <p>{appointment.paymentMethod || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Payment Status</label>
                <p>{appointment.paymentStatus || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="details-section">
            <h2>Notes</h2>
            <p className="notes">{appointment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetails;
