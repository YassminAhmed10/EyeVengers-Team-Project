import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE = "http://localhost:5201";

export default function DoctorDashboard() {
    const [stats, setStats] = useState({
        totalAppointments: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0
    });

    const [todayAppointments, setTodayAppointments] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch dashboard stats
            const statsRes = await fetch(`${API_BASE}/api/Dashboard/Stats`);
            const statsData = await statsRes.json();
            setStats({
                totalAppointments: statsData.totalAppointments || 0,
                todayAppointments: statsData.todayAppointments || 0,
                upcomingAppointments: statsData.upcomingAppointments || 0,
                completedAppointments: statsData.completedAppointments || 0
            });

            // Fetch today's appointments
            const todayRes = await fetch(`${API_BASE}/api/Appointments/today`);
            const todayData = await todayRes.json();
            setTodayAppointments(todayData);

            // Fetch recent appointments
            const recentRes = await fetch(`${API_BASE}/api/Appointments?limit=10`);
            const recentData = await recentRes.json();
            setRecentAppointments(recentData.slice(0, 10));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewEMR = (appointment) => {
        navigate(`/emr/${encodeURIComponent(appointment.patientName)}`, {
            state: {
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                phone: appointment.phone,
                email: appointment.email,
                patientBirthDate: appointment.patientBirthDate,
                patientGender: appointment.patientGender,
                address: appointment.address,
                appointmentDate: appointment.appointmentDate,
                appointmentTime: appointment.appointmentTime,
                reasonForVisit: appointment.reasonForVisit,
                // Parse medical history if available
                eyeAllergies: appointment.eyeAllergies ?
                    (typeof appointment.eyeAllergies === 'string' ?
                        JSON.parse(appointment.eyeAllergies) : appointment.eyeAllergies) : [],
                chronicDiseases: appointment.chronicDiseases ?
                    (typeof appointment.chronicDiseases === 'string' ?
                        JSON.parse(appointment.chronicDiseases) : appointment.chronicDiseases) : [],
                currentMedications: appointment.currentMedications,
                visionSymptoms: appointment.visionSymptoms ?
                    (typeof appointment.visionSymptoms === 'string' ?
                        JSON.parse(appointment.visionSymptoms) : appointment.visionSymptoms) : [],
                insuranceCompany: appointment.insuranceCompany,
                insuranceId: appointment.insuranceId,
                coverage: appointment.coverage,
                status: appointment.status
            }
        });
    };

    const handleViewAllAppointments = () => {
        navigate("/appointments");
    };

    const handleBookAppointment = () => {
        navigate("/appointments", { state: { activeTab: "book" } });
    };

    const filteredAppointments = recentAppointments.filter(appt =>
        appt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.patientId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const calculateAge = (dob) => {
        if (!dob) return "N/A";
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="dashboard-container">
            {/* Dashboard Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Doctor Dashboard</h1>
                    <p>Welcome back! Manage your appointments and patient records</p>
                </div>
                <div className="header-right">
                    <button
                        className="btn-primary"
                        onClick={handleBookAppointment}
                    >
                        <span className="material-symbols-outlined">add</span>
                        New Appointment
                    </button>
                </div>
            </div>

            {/* Search Section */}
            <div className="dashboard-search-section">
                <div className="search-box">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchQuery("")}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-blue">
                    <div className="stat-icon">
                        <span className="material-symbols-outlined">event</span>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalAppointments}</h3>
                        <p>Total Appointments</p>
                    </div>
                </div>

                <div className="stat-card stat-green">
                    <div className="stat-icon">
                        <span className="material-symbols-outlined">today</span>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.todayAppointments}</h3>
                        <p>Today's Appointments</p>
                    </div>
                </div>

                <div className="stat-card stat-orange">
                    <div className="stat-icon">
                        <span className="material-symbols-outlined">upcoming</span>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.upcomingAppointments}</h3>
                        <p>Upcoming</p>
                    </div>
                </div>

                <div className="stat-card stat-purple">
                    <div className="stat-icon">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.completedAppointments}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-content-grid">
                {/* Today's Appointments */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Today's Schedule</h3>
                        <span className="card-date">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <div className="appointments-list">
                        {loading ? (
                            <div className="loading-state">Loading...</div>
                        ) : todayAppointments.length === 0 ? (
                            <div className="empty-state">
                                <span className="material-symbols-outlined">event_available</span>
                                <p>No appointments scheduled for today</p>
                            </div>
                        ) : (
                            todayAppointments.map((appt, index) => (
                                <div key={index} className="appointment-item">
                                    <div className="appointment-time">
                                        {appt.appointmentTime ?
                                            appt.appointmentTime.split(':').slice(0, 2).join(':') : '--:--'}
                                    </div>
                                    <div className="appointment-details">
                                        <div className="patient-name">{appt.patientName}</div>
                                        <div className="appointment-reason">{appt.reasonForVisit}</div>
                                    </div>
                                    <div className="appointment-actions">
                                        <button
                                            className="btn-view-emr"
                                            onClick={() => handleViewEMR(appt)}
                                            title="View EMR"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Appointments Table */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Recent Appointments</h3>
                        <button
                            className="btn-view-all"
                            onClick={handleViewAllAppointments}
                        >
                            View All
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="loading-row">Loading...</td>
                                    </tr>
                                ) : filteredAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="empty-row">
                                            <div className="empty-state">
                                                <span className="material-symbols-outlined">person_search</span>
                                                <p>No appointments found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAppointments.map((appt) => (
                                        <tr key={appt.appointmentId}>
                                            <td>
                                                <div className="patient-cell">
                                                    <div className="patient-avatar">
                                                        {appt.patientName?.charAt(0) || 'P'}
                                                    </div>
                                                    <div className="patient-info">
                                                        <div className="patient-name">{appt.patientName}</div>
                                                        <div className="patient-meta">
                                                            ID: {appt.patientId} • {calculateAge(appt.patientBirthDate)} yrs
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="date-cell">
                                                    {appt.appointmentDate ?
                                                        new Date(appt.appointmentDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${appt.status?.toLowerCase()}`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-emr"
                                                    onClick={() => handleViewEMR(appt)}
                                                    title="View Medical Record"
                                                >
                                                    <span className="material-symbols-outlined">clinical_notes</span>
                                                    EMR
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <button
                        className="action-btn"
                        onClick={() => navigate("/appointments")}
                    >
                        <span className="material-symbols-outlined">event</span>
                        Manage Appointments
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate("/appointments?tab=book")}
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Book Appointment
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate("/patients")}
                    >
                        <span className="material-symbols-outlined">groups</span>
                        View All Patients
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate("/reports")}
                    >
                        <span className="material-symbols-outlined">assessment</span>
                        Generate Reports
                    </button>
                </div>
            </div>
        </div>
    );
}