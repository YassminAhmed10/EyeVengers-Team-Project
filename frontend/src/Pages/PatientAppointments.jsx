import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUserMd, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaArrowLeft } from 'react-icons/fa';
import './PatientAppointments.css';

const PatientAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            // Get patient ID from localStorage or context
            const patientId = localStorage.getItem('patientId') || 'P-000001';
            
            const response = await fetch(`http://localhost:5201/api/Appointments/ByPatient/${patientId}`);
            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 0: return <FaHourglassHalf className="status-icon upcoming" />;
            case 1: return <FaCheckCircle className="status-icon completed" />;
            case 2: return <FaTimesCircle className="status-icon cancelled" />;
            default: return <FaHourglassHalf className="status-icon" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return 'Upcoming';
            case 1: return 'Completed';
            case 2: return 'Cancelled';
            case 3: return 'In Progress';
            case 4: return 'No Show';
            default: return 'Unknown';
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return apt.status === 0;
        if (filter === 'completed') return apt.status === 1;
        if (filter === 'cancelled') return apt.status === 2;
        return true;
    });

    return (
        <div className="patient-appointments-page">
            <div className="appointments-header">
                <button className="back-btn" onClick={() => navigate('/patient')}>
                    <FaArrowLeft /> Back to Home
                </button>
                <h1><FaCalendarAlt /> My Appointments</h1>
                <p>View and manage your appointment history</p>
            </div>

            <div className="appointments-filters">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({appointments.length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setFilter('upcoming')}
                >
                    Upcoming ({appointments.filter(a => a.status === 0).length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed ({appointments.filter(a => a.status === 1).length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setFilter('cancelled')}
                >
                    Cancelled ({appointments.filter(a => a.status === 2).length})
                </button>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading appointments...</p>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="no-appointments">
                    <FaCalendarAlt className="no-apt-icon" />
                    <h2>No Appointments Found</h2>
                    <p>You don't have any {filter !== 'all' ? filter : ''} appointments yet.</p>
                    <button className="book-btn" onClick={() => navigate('/book-appointment')}>
                        Book New Appointment
                    </button>
                </div>
            ) : (
                <div className="appointments-grid">
                    {filteredAppointments.map(appointment => (
                        <div key={appointment.appointmentId} className="appointment-card">
                            <div className="card-header">
                                <div className="appointment-date">
                                    <FaCalendarAlt />
                                    <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}</span>
                                </div>
                                <div className={`status-badge status-${appointment.status}`}>
                                    {getStatusIcon(appointment.status)}
                                    {getStatusText(appointment.status)}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <FaClock />
                                    <span>{appointment.appointmentTime}</span>
                                </div>
                                <div className="info-row">
                                    <FaUserMd />
                                    <span>Dr. {appointment.doctor?.name || 'Not Assigned'}</span>
                                </div>
                                {appointment.reasonForVisit && (
                                    <div className="info-row">
                                        <span className="reason-label">Reason:</span>
                                        <span>{appointment.reasonForVisit}</span>
                                    </div>
                                )}
                                {appointment.notes && (
                                    <div className="info-row notes">
                                        <span className="notes-label">Notes:</span>
                                        <span>{appointment.notes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <button className="details-btn" onClick={() => navigate(`/appointment/${appointment.appointmentId}`)}>
                                    View Details
                                </button>
                                {appointment.status === 0 && (
                                    <button className="cancel-btn" onClick={() => {/* Add cancel logic */}}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;
