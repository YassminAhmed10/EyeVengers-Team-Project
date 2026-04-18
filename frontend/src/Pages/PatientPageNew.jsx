import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUser, FaSearch,
    FaIdCard, FaFilter, FaNotesMedical,
    FaUserInjured, FaShieldAlt, FaMars, FaVenus
} from 'react-icons/fa';
import { appointmentsAPI } from '../services/apiConfig';
import './PatientPageNew.css';

const PatientPageNew = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        filterPatients();
    }, [searchTerm, patients]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch all appointments and keep only Completed (status = 1)
            const allAppointments = await appointmentsAPI.getAll();
            const completed = allAppointments.filter(a => a.status === 1 || a.status === '1');

            // Deduplicate by patientId — keep the latest completed appointment per patient
            const patientMap = new Map();
            for (const apt of completed) {
                const pid = apt.patientId?.toString();
                if (!pid) continue;
                const existing = patientMap.get(pid);
                if (!existing || new Date(apt.appointmentDate) > new Date(existing.appointmentDate)) {
                    patientMap.set(pid, apt);
                }
            }

            const transformed = Array.from(patientMap.values()).map(apt => {
                const gender = apt.patientGender === 0 || apt.patientGender === '0' ? 'Male'
                    : apt.patientGender === 1 || apt.patientGender === '1' ? 'Female'
                    : typeof apt.patientGender === 'string' ? apt.patientGender : '';
                return {
                    id: apt.patientId,
                    name: apt.patientName || `Patient ${apt.patientId}`,
                    age: apt.age,
                    dateOfBirth: apt.patientBirthDate || null,
                    gender,
                    phone: apt.phone || '',
                    email: apt.email || '',
                    address: apt.address || '',
                    nationalId: apt.nationalId || '',
                    insuranceCompany: apt.insuranceCompany || '',
                    lastVisit: apt.appointmentDate,
                    lastReason: apt.reasonForVisit || '',
                    completedCount: completed.filter(a => a.patientId?.toString() === apt.patientId?.toString()).length,
                };
            }).sort((a, b) => Number(a.id) - Number(b.id));

            setPatients(transformed);
            setFilteredPatients(transformed);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to load patients. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const filterPatients = () => {
        let filtered = patients;
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.phone?.includes(searchTerm) ||
                p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.nationalId?.includes(searchTerm)
            );
        }
        setFilteredPatients(filtered);
    };

    const calculateAge = (dob) => {
        if (!dob) return '—';
        const birthDate = new Date(dob);
        if (isNaN(birthDate)) return '—';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="patient-page-loading">
                <div className="spinner"></div>
                <p>Loading patients...</p>
            </div>
        );
    }

    return (
        <div className="patient-page-new">
            {/* Header */}
            <div className="patient-header">
                <button className="btn-refresh" onClick={fetchPatients} title="Refresh">↻ Refresh</button>
            </div>

            {error && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-cards">
                <div className="stat-card total">
                    <div className="stat-icon"><FaUserInjured /></div>
                    <div className="stat-info">
                        <h3>Total Patients</h3>
                        <p className="stat-number">{patients.length}</p>
                    </div>
                </div>
                <div className="stat-card insured">
                    <div className="stat-icon"><FaShieldAlt /></div>
                    <div className="stat-info">
                        <h3>Insured</h3>
                        <p className="stat-number">{patients.filter(p => p.insuranceCompany).length}</p>
                    </div>
                </div>
                <div className="stat-card male">
                    <div className="stat-icon"><FaMars /></div>
                    <div className="stat-info">
                        <h3>Male</h3>
                        <p className="stat-number">{patients.filter(p => p.gender === 'Male').length}</p>
                    </div>
                </div>
                <div className="stat-card female">
                    <div className="stat-icon"><FaVenus /></div>
                    <div className="stat-info">
                        <h3>Female</h3>
                        <p className="stat-number">{patients.filter(p => p.gender === 'Female').length}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="filters-section">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by name, phone, email, or national ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Patients Table */}
            <div className="patients-table-container">
                <table className="patients-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Phone</th>
                            <th>National ID</th>
                            <th>Insurance</th>
                            <th>Last Visit</th>
                            <th>Reason for Visit</th>
                            <th>Visits</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id}>
                                    <td>#{patient.id}</td>
                                    <td className="patient-name">
                                        <div className="name-avatar">
                                            <div className={`avatar ${patient.gender?.toLowerCase()}`}>
                                                {patient.name?.charAt(0) || '?'}
                                            </div>
                                            <span>{patient.name}</span>
                                        </div>
                                    </td>
                                    <td>{patient.age || calculateAge(patient.dateOfBirth)} yrs</td>
                                    <td>
                                        <span className={`gender-badge ${patient.gender?.toLowerCase()}`}>
                                            {patient.gender || '—'}
                                        </span>
                                    </td>
                                    <td>{patient.phone || '—'}</td>
                                    <td>{patient.nationalId || '—'}</td>
                                    <td>{patient.insuranceCompany || 'Uninsured'}</td>
                                    <td>{formatDate(patient.lastVisit)}</td>
                                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={patient.lastReason}>
                                        {patient.lastReason || '—'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ background: '#e3f2fd', color: '#1565c0', borderRadius: 12, padding: '2px 10px', fontWeight: 600, fontSize: 13 }}>
                                            {patient.completedCount}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="action-btn emr"
                                            onClick={() => navigate(`/doctor/view-medical-record/${patient.id}`)}
                                            title="View EMR"
                                        >
                                            <FaNotesMedical /> EMR
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="no-data">
                                    {error ? 'Error loading data.' : 'No patients with completed appointments found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientPageNew;
