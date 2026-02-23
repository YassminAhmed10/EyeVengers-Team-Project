import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaUser, FaSearch, FaPlus, FaPhone, FaEnvelope, 
    FaCalendarAlt, FaIdCard, FaEdit, FaTrash, FaEye,
    FaFilter, FaUserMd, FaMale, FaFemale, FaNotesMedical
} from 'react-icons/fa';
import './PatientPageNew.css';

const PatientPageNew = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        nationalId: '',
        insuranceCompany: '',
        insuranceId: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        filterPatients();
    }, [searchTerm, genderFilter, patients]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            // Fetch all patients directly from Patient API
            const patientsResponse = await fetch('https://localhost:7071/api/Patient');
            const patientsData = await patientsResponse.json();
            
            console.log('========== PATIENTS PAGE DEBUG ==========');
            console.log('All patients from API:', patientsData);
            console.log('Number of patients:', patientsData.length);
            
            // Transform the data to match our component format
            const transformedPatients = patientsData.map(patient => ({
                id: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                phone: patient.phone,
                email: patient.email,
                address: patient.address,
                nationalId: patient.nationalId,
                insuranceCompany: patient.insuranceCompany || '',
                insuranceId: patient.insuranceId || '',
                emergencyContactName: patient.emergencyContactName || '',
                emergencyContactPhone: patient.emergencyContactPhone || '',
                createdAt: patient.createdAt
            }));
            
            console.log('Transformed patients:', transformedPatients);
            
            setPatients(transformedPatients);
            setFilteredPatients(transformedPatients);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPatients = () => {
        let filtered = patients;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(patient =>
                `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone?.includes(searchTerm) ||
                patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.nationalId?.includes(searchTerm)
            );
        }

        // Gender filter
        if (genderFilter !== 'all') {
            filtered = filtered.filter(patient => patient.gender === genderFilter);
        }

        setFilteredPatients(filtered);
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://localhost:7071/api/Patient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    createdAt: new Date().toISOString()
                })
            });

            if (response.ok) {
                await fetchPatients();
                setShowAddModal(false);
                resetForm();
                alert('Patient added successfully!');
            }
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('Failed to add patient');
        }
    };

    const handleUpdatePatient = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://localhost:7071/api/Patient/${selectedPatient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    id: selectedPatient.id,
                    createdAt: selectedPatient.createdAt
                })
            });

            if (response.ok) {
                await fetchPatients();
                setShowAddModal(false);
                setSelectedPatient(null);
                resetForm();
                alert('Patient updated successfully!');
            }
        } catch (error) {
            console.error('Error updating patient:', error);
            alert('Failed to update patient');
        }
    };

    const handleDeletePatient = async (patientId) => {
        if (!window.confirm('Are you sure you want to delete this patient?')) return;

        try {
            const response = await fetch(`https://localhost:7071/api/Patient/${patientId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchPatients();
                alert('Patient deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            alert('Failed to delete patient');
        }
    };

    const handleEditPatient = (patient) => {
        setSelectedPatient(patient);
        setFormData({
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: patient.dateOfBirth.split('T')[0],
            gender: patient.gender,
            phone: patient.phone || '',
            email: patient.email || '',
            address: patient.address || '',
            nationalId: patient.nationalId || '',
            insuranceCompany: patient.insuranceCompany || '',
            insuranceId: patient.insuranceId || '',
            emergencyContactName: patient.emergencyContactName || '',
            emergencyContactPhone: patient.emergencyContactPhone || ''
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'Male',
            phone: '',
            email: '',
            address: '',
            nationalId: '',
            insuranceCompany: '',
            insuranceId: '',
            emergencyContactName: '',
            emergencyContactPhone: ''
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleViewRecord = (patientId) => {
        navigate(`/doctor/view-medical-record/${patientId}`);
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
                <div className="header-content">
                    <h1><FaUser /> Patients Management</h1>
                    <p>View all patients with completed appointments</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-cards">
                <div className="stat-card total">
                    <div className="stat-icon">
                        <FaUser />
                    </div>
                    <div className="stat-info">
                        <h3>Total Patients</h3>
                        <p className="stat-number">{patients.length}</p>
                    </div>
                </div>
                <div className="stat-card insured">
                    <div className="stat-icon">
                        <FaIdCard />
                    </div>
                    <div className="stat-info">
                        <h3>Insured Patients</h3>
                        <p className="stat-number">{patients.filter(p => p.insuranceCompany).length}</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
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
                <div className="gender-filter">
                    <FaFilter />
                    <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                        <option value="all">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
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
                            <th>Email</th>
                            <th>National ID</th>
                            <th>Insurance</th>
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
                                            <div className={`avatar ${patient.gender.toLowerCase()}`}>
                                                {patient.firstName[0]}{patient.lastName[0]}
                                            </div>
                                            <span>{patient.firstName} {patient.lastName}</span>
                                        </div>
                                    </td>
                                    <td>{calculateAge(patient.dateOfBirth)} years</td>
                                    <td>
                                        <span className={`gender-badge ${patient.gender.toLowerCase()}`}>
                                            {patient.gender}
                                        </span>
                                    </td>
                                    <td>{patient.phone || 'N/A'}</td>
                                    <td>{patient.email || 'N/A'}</td>
                                    <td>{patient.nationalId || 'N/A'}</td>
                                    <td>{patient.insuranceCompany || 'Uninsured'}</td>
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
                                <td colSpan="9" className="no-data">
                                    No patients found matching your search criteria
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
