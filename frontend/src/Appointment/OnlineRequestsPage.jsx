import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserMd, FaCheck, FaTimes, FaEye, FaUser, FaPhone, FaEnvelope, FaSearch, FaFilter } from 'react-icons/fa';
import './OnlineRequestsPage.css';

const OnlineRequestsPage = () => {
    const [onlineRequests, setOnlineRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [confirmingId, setConfirmingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);

    useEffect(() => {
        fetchOnlineRequests();
    }, []);

    const fetchOnlineRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5201/api/Appointments');
            if (response.ok) {
                const data = await response.json();
                // Filter for online appointments with "Upcoming" status (status = 0)
                const online = data.filter(apt => 
                    apt.appointmentType === 'online' && apt.status === 0
                );
                setOnlineRequests(online);
            }
        } catch (error) {
            console.error('Error fetching online requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to confirm this appointment?')) {
            return;
        }

        try {
            setConfirmingId(appointmentId);
            const response = await fetch(
                `http://localhost:5201/api/Appointments/confirm/${appointmentId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.ok) {
                alert('Appointment confirmed successfully!');
                // Remove from the list
                setOnlineRequests(prev => prev.filter(req => req.appointmentId !== appointmentId));
            } else {
                alert('Failed to confirm appointment');
            }
        } catch (error) {
            console.error('Error confirming appointment:', error);
            alert('Error confirming appointment');
        } finally {
            setConfirmingId(null);
        }
    };

    const handleReject = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to reject this appointment?')) {
            return;
        }

        try {
            setRejectingId(appointmentId);
            const response = await fetch(
                `http://localhost:5201/api/Appointments/${appointmentId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Status: 2 }) // 2 = Cancelled
                }
            );

            if (response.ok) {
                alert('Appointment rejected successfully!');
                // Remove from the list
                setOnlineRequests(prev => prev.filter(req => req.appointmentId !== appointmentId));
            } else {
                alert('Failed to reject appointment');
            }
        } catch (error) {
            console.error('Error rejecting appointment:', error);
            alert('Error rejecting appointment');
        } finally {
            setRejectingId(null);
        }
    };

    const viewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

    const filteredRequests = onlineRequests.filter(req => {
        const matchesSearch = 
            req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (req.phone && req.phone.includes(searchQuery));

        const matchesDoctor = filterDoctor === 'all' || 
            (req.doctor && req.doctor.doctorId === parseInt(filterDoctor));

        return matchesSearch && matchesDoctor;
    });

    // Get unique doctors for filter
    const uniqueDoctors = [...new Map(onlineRequests
        .filter(req => req.doctor)
        .map(req => [req.doctor.doctorId, req.doctor]))
        .values()
    ];

    return (
        <div className="online-requests-page">
            <div className="requests-header">
                <h1><FaCalendarAlt /> Pending Online Appointment Requests</h1>
                <p>Review and confirm patient appointment requests</p>
            </div>

            <div className="requests-controls">
                <div className="search-box">
                    <FaSearch />
                    <input 
                        type="text"
                        placeholder="Search by patient name, ID, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <FaFilter />
                    <select 
                        value={filterDoctor}
                        onChange={(e) => setFilterDoctor(e.target.value)}
                    >
                        <option value="all">All Doctors</option>
                        {uniqueDoctors.map(doc => (
                            <option key={doc.doctorId} value={doc.doctorId}>
                                Dr. {doc.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="requests-count">
                    <span>{filteredRequests.length} Pending Requests</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading requests...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="no-requests">
                    <FaCalendarAlt className="no-req-icon" />
                    <h2>No Pending Requests</h2>
                    <p>There are no online appointment requests at the moment.</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {filteredRequests.map(request => (
                        <div key={request.appointmentId} className="request-card">
                            <div className="card-badge">Online Request</div>
                            
                            <div className="request-header">
                                <div className="patient-info">
                                    <FaUser className="info-icon" />
                                    <div>
                                        <h3>{request.patientName}</h3>
                                        <span className="patient-id">{request.patientId}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="request-details">
                                <div className="detail-row">
                                    <FaCalendarAlt />
                                    <span>{new Date(request.appointmentDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <div className="detail-row">
                                    <FaClock />
                                    <span>{request.appointmentTime}</span>
                                </div>
                                <div className="detail-row">
                                    <FaUserMd />
                                    <span>Dr. {request.doctor?.name || 'Not Assigned'}</span>
                                </div>
                                {request.phone && (
                                    <div className="detail-row">
                                        <FaPhone />
                                        <span>{request.phone}</span>
                                    </div>
                                )}
                                {request.email && (
                                    <div className="detail-row">
                                        <FaEnvelope />
                                        <span>{request.email}</span>
                                    </div>
                                )}
                                {request.reasonForVisit && (
                                    <div className="detail-row reason">
                                        <strong>Reason:</strong>
                                        <span>{request.reasonForVisit}</span>
                                    </div>
                                )}
                            </div>

                            <div className="request-actions">
                                <button 
                                    className="btn-view"
                                    onClick={() => viewDetails(request)}
                                >
                                    <FaEye /> View Details
                                </button>
                                <button 
                                    className="btn-confirm"
                                    onClick={() => handleConfirm(request.appointmentId)}
                                    disabled={confirmingId === request.appointmentId}
                                >
                                    <FaCheck /> {confirmingId === request.appointmentId ? 'Confirming...' : 'Confirm'}
                                </button>
                                <button 
                                    className="btn-reject"
                                    onClick={() => handleReject(request.appointmentId)}
                                    disabled={rejectingId === request.appointmentId}
                                >
                                    <FaTimes /> {rejectingId === request.appointmentId ? 'Rejecting...' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedRequest && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Appointment Request Details</h2>
                            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Patient Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Name:</label>
                                        <span>{selectedRequest.patientName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Patient ID:</label>
                                        <span>{selectedRequest.patientId}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone:</label>
                                        <span>{selectedRequest.phone || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{selectedRequest.email || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Gender:</label>
                                        <span>{selectedRequest.patientGender === 0 ? 'Male' : 'Female'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Age:</label>
                                        <span>{selectedRequest.age || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Appointment Details</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Date:</label>
                                        <span>{new Date(selectedRequest.appointmentDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Time:</label>
                                        <span>{selectedRequest.appointmentTime}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Doctor:</label>
                                        <span>Dr. {selectedRequest.doctor?.name || 'Not Assigned'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Duration:</label>
                                        <span>{selectedRequest.durationMinutes} minutes</span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <label>Reason for Visit:</label>
                                        <span>{selectedRequest.reasonForVisit || 'N/A'}</span>
                                    </div>
                                    {selectedRequest.notes && (
                                        <div className="detail-item full-width">
                                            <label>Notes:</label>
                                            <span>{selectedRequest.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedRequest.insuranceCompany && (
                                <div className="detail-section">
                                    <h3>Insurance Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Company:</label>
                                            <span>{selectedRequest.insuranceCompany}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Policy Number:</label>
                                            <span>{selectedRequest.policyNumber || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-modal-confirm"
                                onClick={() => {
                                    handleConfirm(selectedRequest.appointmentId);
                                    setShowDetailsModal(false);
                                }}
                            >
                                <FaCheck /> Confirm Appointment
                            </button>
                            <button 
                                className="btn-modal-reject"
                                onClick={() => {
                                    handleReject(selectedRequest.appointmentId);
                                    setShowDetailsModal(false);
                                }}
                            >
                                <FaTimes /> Reject Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineRequestsPage;
