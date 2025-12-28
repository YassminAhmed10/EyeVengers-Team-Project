import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUser, FaCalendarAlt, FaPhone, FaEnvelope, FaHome, FaIdCard,
    FaBirthdayCake, FaVenusMars, FaClock, FaStethoscope, FaArrowLeft,
    FaArrowRight, FaCheck, FaChevronLeft, FaChevronRight, FaShieldAlt,
    FaFileMedical, FaAllergies, FaHeartbeat, FaPills, FaSyringe, FaUserMd, FaEye,
    FaCheckCircle, FaCalendarDay, FaMoneyBillWave, FaInfoCircle, FaClipboard,
    FaPercent, FaCalendarTimes, FaPhoneAlt, FaHistory, FaSignOutAlt, FaPlus
} from 'react-icons/fa';
import { appointmentsAPI, doctorsAPI } from '../services/apiConfig';
import './BookAppointment.css';

const BookAppointmentPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    
    // Header states
    const [userName, setUserName] = useState('Guest');
    const [userEmail, setUserEmail] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Medical History options
    const eyeAllergyOptions = ['Dust', 'Pollen', 'Eye Drops', 'Contact Lenses', 'None'];
    const chronicDiseaseOptions = ['Diabetes', 'Hypertension', 'Thyroid Disorders', 'Heart Disease', 'Asthma', 'Arthritis', 'None'];
    const eyeSurgeryOptions = ['Cataract', 'LASIK', 'Glaucoma Surgery', 'Retinal Surgery', 'None'];
    const familyEyeDiseaseOptions = ['Glaucoma', 'Cataract', 'Macular Degeneration', 'Retinitis Pigmentosa', 'None'];
    const visionSymptomOptions = [
        'Blurry Vision',
        'Double Vision',
        'Eye Pain',
        'Floaters',
        'Dry Eyes',
        'Red Eyes',
        'Light Sensitivity',
        'Night Blindness',
        'Headaches'
    ];

    // Insurance providers with offers
    const insuranceProviders = [
        {
            id: 'allianz',
            name: 'Allianz Egypt',
            discount: 15,
            discountType: 'percentage',
            contact: '+20 2 3539 4000',
            description: '15% discount on total fees'
        },
        {
            id: 'axa',
            name: 'AXA Egypt',
            discount: 100,
            discountType: 'fixed',
            contact: '+20 2 3335 5000',
            description: '100 EGP off total fees'
        },
        {
            id: 'misr',
            name: 'Misr Insurance',
            discount: 20,
            discountType: 'percentage',
            contact: '+20 2 3337 7000',
            description: '20% discount on consultation'
        }
    ];

    const coverageTypes = [
        'Basic Coverage',
        'Comprehensive',
        'Dental & Vision',
        'Full Medical',
        'Emergency Only',
        'Specialized Care'
    ];
    const [formData, setFormData] = useState({
        // Patient Info
        patientName: '',
        patientId: 'P-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        appointmentId: 'A-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        phone: '',
        email: '',
        dateOfBirth: '',
        age: '',
        gender: 'Male',
        nationalId: '',
        address: '',

        // Appointment Details
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reasonForVisit: '',

        // Medical History
        eyeAllergies: [],
        otherAllergies: '',
        chronicDiseases: [],
        currentMedications: '',
        eyeSurgeries: [],
        otherEyeSurgeries: '',
        familyEyeDiseases: [],
        otherFamilyEyeDiseases: '',
        visionSymptoms: [],

        // Insurance Information
        insuranceProvider: '',
        insuranceId: '',
        policyNumber: '',
        coveragePercentage: '',
        coverageType: '',
        insuranceExpiryDate: '',
        insuranceContact: '',
        noInsurance: false,
        calculatedPrice: 500,
        finalPrice: 500
    });

    // Fetch doctors on component mount
    useEffect(() => {
        fetchDoctors();
        
        // Load user info
        const storedUser = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');
        if (storedUser) setUserName(storedUser);
        if (storedEmail) setUserEmail(storedEmail);
        
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Auto-calculate age from date of birth
    useEffect(() => {
        if (formData.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(formData.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setFormData(prev => ({ ...prev, age: age.toString() }));
        }
    }, [formData.dateOfBirth]);

    const fetchDoctors = async () => {
        try {
            const data = await doctorsAPI.getAll();
            setDoctors(data);
            // Auto-select first doctor if available
            if (data.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    doctorId: data[0].doctorId.toString()
                }));
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            if (name === 'noInsurance') {
                const updatedForm = {
                    ...formData,
                    noInsurance: checked,
                    insuranceProvider: checked ? '' : formData.insuranceProvider,
                    insuranceId: checked ? '' : formData.insuranceId,
                    policyNumber: checked ? '' : formData.policyNumber,
                    coveragePercentage: checked ? '' : formData.coveragePercentage,
                    coverageType: checked ? '' : formData.coverageType,
                    insuranceExpiryDate: checked ? '' : formData.insuranceExpiryDate,
                    insuranceContact: checked ? '' : formData.insuranceContact
                };
                
                if (checked) {
                    updatedForm.finalPrice = updatedForm.calculatedPrice;
                } else {
                    const priceInfo = calculatePrice(updatedForm.insuranceProvider, updatedForm.calculatedPrice);
                    updatedForm.finalPrice = priceInfo.finalPrice;
                }
                
                setFormData(updatedForm);
            } else {
                // Handle medical history checkboxes
                const category = name.split('_')[0];
                const itemValue = name.split('_')[1];
                handleCheckboxChange(category, itemValue, checked);
            }
        } else {
            const updatedForm = { ...formData, [name]: value };
            
            // Recalculate price when insurance provider changes
            if (name === 'insuranceProvider') {
                const priceInfo = calculatePrice(value, formData.calculatedPrice);
                updatedForm.finalPrice = priceInfo.finalPrice;
            }
            
            setFormData(updatedForm);
        }
    };

    // Handle checkbox with "None" logic
    const handleCheckboxChange = (category, value, checked) => {
        setFormData(prev => {
            const currentArray = prev[category] || [];
            let newArray;
            
            if (value === 'None') {
                if (checked) {
                    newArray = ['None'];
                } else {
                    newArray = [];
                }
            } else {
                if (checked) {
                    newArray = [...currentArray.filter(item => item !== 'None'), value];
                } else {
                    newArray = currentArray.filter(item => item !== value);
                }
            }
            
            return { ...prev, [category]: newArray };
        });
    };

    // Calculate price with insurance
    const calculatePrice = (providerId, basePrice = 500) => {
        if (!providerId || formData.noInsurance) return { basePrice, finalPrice: basePrice, discount: 0 };
        
        const provider = insuranceProviders.find(p => p.id === providerId);
        if (!provider) return { basePrice, finalPrice: basePrice, discount: 0 };
        
        let finalPrice = basePrice;
        let discountAmount = 0;
        
        if (provider.discountType === 'percentage') {
            discountAmount = (basePrice * provider.discount) / 100;
            finalPrice = basePrice - discountAmount;
        } else if (provider.discountType === 'fixed') {
            discountAmount = Math.min(provider.discount, basePrice);
            finalPrice = basePrice - discountAmount;
        }
        
        return {
            basePrice,
            finalPrice,
            discount: discountAmount,
            providerName: provider.name
        };
    };

    const nextStep = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        setFormData(prev => ({
            ...prev,
            appointmentDate: dateStr
        }));
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setFormData(prev => ({
            ...prev,
            appointmentTime: time
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.patientName || !formData.appointmentDate || !formData.appointmentTime || !formData.doctorId) {
                alert('Please fill in all required fields: Patient Name, Date, Time, and Doctor');
                setLoading(false);
                return;
            }

            // Format appointmentTime to HH:mm:ss
            const timeFormatted = formData.appointmentTime.length === 5 ? `${formData.appointmentTime}:00` : formData.appointmentTime;
            
            // Convert date to proper format (YYYY-MM-DD)
            let appointmentDateFormatted = formData.appointmentDate;
            if (typeof appointmentDateFormatted === 'string' && appointmentDateFormatted.includes('-')) {
                // Already in YYYY-MM-DD format
            } else {
                appointmentDateFormatted = new Date(formData.appointmentDate).toISOString().split('T')[0];
            }

            const appointmentData = {
                patientId: formData.patientId || `P-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
                patientName: formData.patientName,
                patientGender: formData.gender === 'Male' ? 0 : 1,
                phone: formData.phone || null,
                email: formData.email || null,
                patientBirthDate: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
                age: formData.age ? formData.age.toString() : "0",
                nationalId: formData.nationalId || null,
                address: formData.address || null,
                doctorId: parseInt(formData.doctorId),
                appointmentDate: appointmentDateFormatted,
                appointmentTime: timeFormatted,
                durationMinutes: 30,
                status: 0, // Upcoming
                isSurgery: formData.isSurgery || false,
                appointmentType: 'online', // Mark as online booking
                reasonForVisit: formData.reasonForVisit || 'General Consultation',
                notes: 'Online booking request',
                
                // Medical History
                chronicDiseases: Array.isArray(formData.chronicDiseases) ? formData.chronicDiseases.join(', ') : (formData.chronicDiseases || ''),
                currentMedications: formData.currentMedications || null,
                otherAllergies: formData.otherAllergies || null,
                visionSymptoms: Array.isArray(formData.visionSymptoms) ? formData.visionSymptoms.join(', ') : (formData.visionSymptoms || ''),
                familyEyeDiseases: Array.isArray(formData.familyEyeDiseases) ? formData.familyEyeDiseases.join(', ') : (formData.familyEyeDiseases || ''),
                eyeAllergies: Array.isArray(formData.eyeAllergies) ? formData.eyeAllergies.join(', ') : (formData.eyeAllergies || ''),
                eyeSurgeries: Array.isArray(formData.eyeSurgeries) ? formData.eyeSurgeries.join(', ') : (formData.eyeSurgeries || ''),
                otherEyeSurgeries: formData.otherEyeSurgeries || null,
                otherFamilyDiseases: formData.otherFamilyDiseases || null,
                
                // Insurance Information
                insuranceCompany: formData.insuranceProvider || null,
                insuranceId: formData.insuranceId || null,
                policyNumber: formData.policyNumber || null,
                coverage: formData.coveragePercentage || null,
                coverageType: formData.coverageType || null,
                insuranceExpiryDate: formData.insuranceExpiryDate ? new Date(formData.insuranceExpiryDate).toISOString() : null,
                insuranceContact: formData.insuranceContact || null,
                
                // Payment info
                paymentMethod: 'Cash',
                paymentStatus: 'Pending',
                finalPrice: 500.00,
                emergencyContactName: null,
                emergencyContactPhone: null
            };

            console.log('Sending appointment data:', appointmentData);

            const response = await appointmentsAPI.create(appointmentData);
            
            if (response) {
                // Store booking details for confirmation page
                setBookingDetails({
                    patientName: appointmentData.patientName,
                    appointmentDate: appointmentData.appointmentDate,
                    appointmentTime: appointmentData.appointmentTime,
                    doctor: doctors.find(d => d.id === appointmentData.doctorId)?.name || 'Dr. Mohab Khairy',
                    patientId: appointmentData.patientId
                });
                setBookingSuccess(true);
                setLoading(false);
            } else {
                alert(`Error occurred while booking appointment`);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            
            // Show detailed error message
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}\n\nDetails: ${JSON.stringify(error.response.data.errors)}`);
            } else if (error.message) {
                alert(`Error booking appointment: ${error.message}`);
            } else {
                alert('An error occurred while booking the appointment. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Calendar helpers
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = selectedDate === day;
            const today = new Date();
            const isToday = day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
            const isPast = new Date(currentYear, currentMonth, day) < today.setHours(0, 0, 0, 0);

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
                    onClick={() => !isPast && handleDateSelect(day)}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
                    <div className="step-number">{step}</div>
                    <div className="step-label">
                        {step === 1 && 'Personal Information'}
                        {step === 2 && 'Appointment Details'}
                        {step === 3 && 'Medical History'}
                        {step === 4 && 'Insurance Information'}
                        {step === 5 && 'Payment Summary'}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="book-appointment-page">
            {/* Success Confirmation Page */}
            {bookingSuccess ? (
                <div className="success-container">
                    <div className="success-card">
                        <div className="success-icon">
                            <FaCheckCircle />
                        </div>
                        <h1 className="success-title">Booking Request Sent Successfully!</h1>
                        <p className="success-message">
                            Your appointment request has been submitted and is awaiting confirmation from our team.
                        </p>
                        
                        <div className="booking-details-card">
                            <h3>Booking Details</h3>
                            <div className="detail-row">
                                <FaUser className="detail-icon" />
                                <span className="detail-label">Patient Name:</span>
                                <span className="detail-value">{bookingDetails?.patientName}</span>
                            </div>
                            <div className="detail-row">
                                <FaIdCard className="detail-icon" />
                                <span className="detail-label">Patient ID:</span>
                                <span className="detail-value">{bookingDetails?.patientId}</span>
                            </div>
                            <div className="detail-row">
                                <FaCalendarAlt className="detail-icon" />
                                <span className="detail-label">Appointment Date:</span>
                                <span className="detail-value">{bookingDetails?.appointmentDate}</span>
                            </div>
                            <div className="detail-row">
                                <FaClock className="detail-icon" />
                                <span className="detail-label">Appointment Time:</span>
                                <span className="detail-value">{bookingDetails?.appointmentTime}</span>
                            </div>
                            <div className="detail-row">
                                <FaStethoscope className="detail-icon" />
                                <span className="detail-label">Doctor:</span>
                                <span className="detail-value">{bookingDetails?.doctor}</span>
                            </div>
                        </div>

                        <div className="next-steps">
                            <h3><FaInfoCircle /> What's Next?</h3>
                            <ul>
                                <li>Our receptionist will review your request</li>
                                <li>You will receive a confirmation call or email within 24 hours</li>
                                <li>Please arrive 15 minutes before your appointment time</li>
                                <li>Bring your ID and insurance card (if applicable)</li>
                            </ul>
                        </div>

                        <div className="success-actions">
                            <button 
                                className="btn-primary" 
                                onClick={() => {
                                    setBookingSuccess(false);
                                    setCurrentStep(1);
                                    setFormData({});
                                }}
                            >
                                <FaPlus /> Book Another Appointment
                            </button>
                            <button 
                                className="btn-secondary" 
                                onClick={() => navigate('/patient')}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Original Booking Form */
                <>
                    {/* Header */}
                    <header className="patient-header">
                        <div className="header-container">
                            <div className="header-logo">
                                <img src="/src/images/logo.png" alt="Clinic Logo" className="logo-img" />
                                <span className="clinic-name">Dr Mohab Khairy</span>
                            </div>

                            <nav className="header-nav">
                                <a href="/patient" className="nav-link">Home</a>
                                <a href="#services" className="nav-link">Services</a>
                                <a href="#about" className="nav-link">About</a>
                                <a href="#contact" className="nav-link">Contact</a>
                            </nav>

                            <div className="header-actions">
                                <div className="user-profile-container" ref={dropdownRef}>
                                    <button className="user-profile-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                        <div className="user-avatar">
                                            {userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                        </div>
                                        <span className="user-name">{userName}</span>
                                        <svg className="dropdown-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="profile-dropdown">
                                            <div className="dropdown-header">
                                                <div className="dropdown-user-name">{userName}</div>
                                                <div className="dropdown-user-email">{userEmail || 'patient@clinic.com'}</div>
                                            </div>
                                            <div className="dropdown-menu">
                                                <button className="dropdown-item" onClick={() => navigate('/patient/profile')}>
                                                    <FaUser />
                                                    <span>My Profile</span>
                                                </button>
                                                <button className="dropdown-item" onClick={() => navigate('/patient/appointments')}>
                                                    <FaHistory />
                                                    <span>Appointment History</span>
                                                </button>
                                                <div className="dropdown-divider"></div>
                                                <button className="dropdown-item logout-item" onClick={() => {
                                                    localStorage.clear();
                                                    navigate('/login');
                                                }}>
                                                    <FaSignOutAlt />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="appointment-content">
                        <div className="appointment-header">
                            <h1><FaCalendarAlt /> Book an Appointment</h1>
                            <p>Fill out the form to book your appointment with our specialists</p>
                        </div>

                        <div className="appointment-container">
                            {renderStepIndicator()}

                            <form onSubmit={handleSubmit}>
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="form-step active">
                                <h2><FaUser /> Personal Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><FaIdCard /> Patient ID</label>
                                        <input
                                            type="text"
                                            name="patientId"
                                            value={formData.patientId}
                                            readOnly
                                            style={{backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><FaCalendarAlt /> Appointment ID</label>
                                        <input
                                            type="text"
                                            name="appointmentId"
                                            value={formData.appointmentId}
                                            readOnly
                                            style={{backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label><FaUser /> Full Name *</label>
                                    <input
                                        type="text"
                                        name="patientName"
                                        value={formData.patientName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label><FaPhone /> Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="+20 123 456 7890"
                                    />
                                </div>

                                <div className="form-group">
                                    <label><FaEnvelope /> Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="example@email.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label><FaBirthdayCake /> Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label><FaVenusMars /> Gender *</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label><FaIdCard /> National ID</label>
                                    <input
                                        type="text"
                                        name="nationalId"
                                        value={formData.nationalId}
                                        onChange={handleInputChange}
                                        placeholder="29801010101234"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label><FaHome /> Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="2"
                                        placeholder="Enter your full address"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Appointment Details */}
                    {currentStep === 2 && (
                        <div className="form-step active">
                            <h2><FaCalendarAlt /> Appointment Details</h2>

                            <div className="appointment-details-layout">
                                {/* Calendar Section */}
                                <div className="calendar-wrapper">
                                    <h3 className="section-subtitle"><FaCalendarDay /> Select Date</h3>
                                    <div className="calendar-section">
                                        <div className="calendar-header">
                                            <button type="button" onClick={() => {
                                                if (currentMonth === 0) {
                                                    setCurrentMonth(11);
                                                    setCurrentYear(currentYear - 1);
                                                } else {
                                                    setCurrentMonth(currentMonth - 1);
                                                }
                                            }}>
                                                <FaChevronRight />
                                            </button>
                                            <h3>{monthNames[currentMonth]} {currentYear}</h3>
                                            <button type="button" onClick={() => {
                                                if (currentMonth === 11) {
                                                    setCurrentMonth(0);
                                                    setCurrentYear(currentYear + 1);
                                                } else {
                                                    setCurrentMonth(currentMonth + 1);
                                                }
                                            }}>
                                                <FaChevronLeft />
                                            </button>
                                        </div>
                                        <div className="calendar-grid">
                                            <div className="calendar-day header">Sun</div>
                                            <div className="calendar-day header">Mon</div>
                                            <div className="calendar-day header">Tue</div>
                                            <div className="calendar-day header">Wed</div>
                                            <div className="calendar-day header">Thu</div>
                                            <div className="calendar-day header">Fri</div>
                                            <div className="calendar-day header">Sat</div>
                                            {renderCalendar()}
                                        </div>
                                    </div>
                                </div>

                                {/* Time Slots Section */}
                                <div className="visit-details-wrapper">
                                    <h3 className="section-subtitle"><FaClock /> Select Available Time</h3>
                                    {selectedDate ? (
                                        <div className="time-slots-section">
                                            <div className="time-slots-grid">
                                                {timeSlots.map(time => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                                                        onClick={() => handleTimeSelect(time)}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="no-date-selected">
                                            <p>Please select a date first to see available time slots</p>
                                        </div>
                                    )}
                                    
                                    {/* Reason for Visit */}
                                    {selectedDate && selectedTime && (
                                        <div className="reason-section">
                                            <label><FaClipboard /> Reason for Visit *</label>
                                            <textarea
                                                name="reasonForVisit"
                                                value={formData.reasonForVisit}
                                                onChange={handleInputChange}
                                                required
                                                rows="4"
                                                placeholder="Please describe your symptoms or reason for visit..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Medical History */}
                    {currentStep === 3 && (
                        <div className="form-step active">
                            <h2><FaFileMedical /> Medical History</h2>
                            <p className="step-subtitle">Complete patient's eye & medical background information</p>
                            
                            <div className="medical-history-notice">
                                <FaInfoCircle className="notice-icon" />
                                <div className="notice-content">
                                    <strong>Important:</strong> Accurate medical history helps in proper diagnosis and treatment planning.
                                </div>
                            </div>

                            <div className="medical-grid-3x2">
                                {/* Row 1 - Eye Allergies */}
                                <div className="medical-grid-item">
                                    <div className="medical-section-header">
                                        <FaAllergies className="medical-section-icon" />
                                        <h4>1. Eye Allergies</h4>
                                    </div>
                                    <div className="medical-checkbox-grid">
                                        {eyeAllergyOptions.map((allergy) => (
                                            <label key={allergy} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name={`eyeAllergies_${allergy}`}
                                                    checked={formData.eyeAllergies?.includes(allergy)}
                                                    onChange={handleInputChange}
                                                    className="checkbox-input"
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">{allergy}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="form-group" style={{ marginTop: '10px' }}>
                                        <input
                                            type="text"
                                            name="otherAllergies"
                                            value={formData.otherAllergies}
                                            onChange={handleInputChange}
                                            placeholder="Other allergies..."
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                {/* Row 1 - Chronic Diseases */}
                                <div className="medical-grid-item">
                                    <div className="medical-section-header">
                                        <FaHeartbeat className="medical-section-icon" />
                                        <h4>2. Chronic Diseases</h4>
                                    </div>
                                    <div className="medical-checkbox-grid">
                                        {chronicDiseaseOptions.map((disease) => (
                                            <label key={disease} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name={`chronicDiseases_${disease}`}
                                                    checked={formData.chronicDiseases?.includes(disease)}
                                                    onChange={handleInputChange}
                                                    className="checkbox-input"
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">{disease}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="input-hint" style={{ marginTop: '10px' }}>
                                        Conditions that can affect eye health
                                    </div>
                                </div>

                                {/* Row 2 - Current Medications */}
                                <div className="medical-grid-item full-width">
                                    <div className="medical-section-header">
                                        <FaPills className="medical-section-icon" />
                                        <h4>3. Current Medications</h4>
                                    </div>
                                    <div className="textarea-container">
                                        <FaFileMedical className="textarea-icon" />
                                        <textarea
                                            name="currentMedications"
                                            value={formData.currentMedications}
                                            onChange={handleInputChange}
                                            placeholder="List all medications, supplements, or vitamins you are currently taking..."
                                            className="form-textarea"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="input-hint" style={{ marginTop: '10px' }}>
                                        Helps avoid drug interactions
                                    </div>
                                </div>

                                {/* Row 3 - Eye Surgeries */}
                                <div className="medical-grid-item">
                                    <div className="medical-section-header">
                                        <FaSyringe className="medical-section-icon" />
                                        <h4>4. Eye Surgeries</h4>
                                    </div>
                                    <div className="medical-checkbox-grid">
                                        {eyeSurgeryOptions.map((surgery) => (
                                            <label key={surgery} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name={`eyeSurgeries_${surgery}`}
                                                    checked={formData.eyeSurgeries?.includes(surgery)}
                                                    onChange={handleInputChange}
                                                    className="checkbox-input"
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">{surgery}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="form-group" style={{ marginTop: '10px' }}>
                                        <input
                                            type="text"
                                            name="otherEyeSurgeries"
                                            value={formData.otherEyeSurgeries}
                                            onChange={handleInputChange}
                                            placeholder="Other eye surgeries..."
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                {/* Row 3 - Family Eye Diseases */}
                                <div className="medical-grid-item">
                                    <div className="medical-section-header">
                                        <FaUserMd className="medical-section-icon" />
                                        <h4>5. Family Eye Diseases</h4>
                                    </div>
                                    <div className="medical-checkbox-grid">
                                        {familyEyeDiseaseOptions.map((disease) => (
                                            <label key={disease} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name={`familyEyeDiseases_${disease}`}
                                                    checked={formData.familyEyeDiseases?.includes(disease)}
                                                    onChange={handleInputChange}
                                                    className="checkbox-input"
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">{disease}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="form-group" style={{ marginTop: '10px' }}>
                                        <input
                                            type="text"
                                            name="otherFamilyEyeDiseases"
                                            value={formData.otherFamilyEyeDiseases}
                                            onChange={handleInputChange}
                                            placeholder="Other family diseases..."
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                {/* Row 4 - Vision Symptoms */}
                                <div className="medical-grid-item full-width">
                                    <div className="medical-section-header">
                                        <FaEye className="medical-section-icon" />
                                        <h4>6. Vision Symptoms</h4>
                                    </div>
                                    <div className="medical-checkbox-grid symptoms-grid">
                                        {visionSymptomOptions.map((symptom) => (
                                            <label key={symptom} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name={`visionSymptoms_${symptom}`}
                                                    checked={formData.visionSymptoms?.includes(symptom)}
                                                    onChange={handleInputChange}
                                                    className="checkbox-input"
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="checkbox-text">{symptom}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="input-hint" style={{ marginTop: '10px' }}>
                                        Current symptoms being experienced
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Insurance Information */}
                    {currentStep === 4 && (
                        <div className="form-step active">
                            <h2><FaShieldAlt /> Insurance Information</h2>
                            <p className="step-subtitle">Provide insurance details to apply discounts</p>
                            
                            <div className="insurance-notice">
                                <FaInfoCircle className="notice-icon" />
                                <div className="notice-content">
                                    <strong>Note:</strong> Insurance verification may take 24-48 hours. Please bring your insurance card to the appointment.
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="noInsurance"
                                            checked={formData.noInsurance}
                                            onChange={handleInputChange}
                                            className="checkbox-input"
                                        />
                                        <span className="checkbox-custom"></span>
                                        <span className="checkbox-text">No Insurance / Self Pay</span>
                                    </label>
                                    <div className="checkbox-hint">
                                        Check this if you don't have insurance coverage
                                    </div>
                                </div>
                            </div>

                            {!formData.noInsurance && (
                                <>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="insuranceProvider" className="form-label">
                                                <span className="label-text">Insurance Provider</span>
                                            </label>
                                            <div className="input-container select-container">
                                                <FaShieldAlt className="input-icon" />
                                                <select
                                                    id="insuranceProvider"
                                                    name="insuranceProvider"
                                                    value={formData.insuranceProvider}
                                                    onChange={handleInputChange}
                                                    className="form-select"
                                                    disabled={formData.noInsurance}
                                                >
                                                    <option value="">Select Insurance Provider</option>
                                                    {insuranceProviders.map((provider) => (
                                                        <option key={provider.id} value={provider.id}>
                                                            {provider.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="select-arrow">▼</span>
                                            </div>
                                            <div className="input-hint">Select your insurance provider</div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="policyNumber" className="form-label">
                                                <span className="label-text">Policy Number</span>
                                            </label>
                                            <div className="input-container">
                                                <FaIdCard className="input-icon" />
                                                <input
                                                    type="text"
                                                    id="policyNumber"
                                                    name="policyNumber"
                                                    value={formData.policyNumber}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter policy number"
                                                    disabled={formData.noInsurance}
                                                />
                                            </div>
                                            <div className="input-hint">As shown on your insurance card</div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="insuranceId" className="form-label">
                                                <span className="label-text">Member/Insurance ID</span>
                                            </label>
                                            <div className="input-container">
                                                <FaIdCard className="input-icon" />
                                                <input
                                                    type="text"
                                                    id="insuranceId"
                                                    name="insuranceId"
                                                    value={formData.insuranceId}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter insurance ID"
                                                    disabled={formData.noInsurance}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="insuranceContact" className="form-label">
                                                <span className="label-text">Insurance Contact</span>
                                            </label>
                                            <div className="input-container">
                                                <FaPhoneAlt className="input-icon" />
                                                <input
                                                    type="tel"
                                                    id="insuranceContact"
                                                    name="insuranceContact"
                                                    value={formData.insuranceContact}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Insurance company phone"
                                                    disabled={formData.noInsurance}
                                                />
                                            </div>
                                            {formData.insuranceProvider && (
                                                <div className="input-hint">
                                                    Provider contact: {insuranceProviders.find(p => p.id === formData.insuranceProvider)?.contact}
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="coverageType" className="form-label">
                                                <span className="label-text">Coverage Type</span>
                                            </label>
                                            <div className="input-container select-container">
                                                <FaShieldAlt className="input-icon" />
                                                <select
                                                    id="coverageType"
                                                    name="coverageType"
                                                    value={formData.coverageType}
                                                    onChange={handleInputChange}
                                                    className="form-select"
                                                    disabled={formData.noInsurance}
                                                >
                                                    <option value="">Select Coverage Type</option>
                                                    {coverageTypes.map((type, index) => (
                                                        <option key={index} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="select-arrow">▼</span>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="insuranceExpiryDate" className="form-label">
                                                <span className="label-text">Expiry Date</span>
                                            </label>
                                            <div className="input-container">
                                                <FaCalendarTimes className="input-icon" />
                                                <input
                                                    type="date"
                                                    id="insuranceExpiryDate"
                                                    name="insuranceExpiryDate"
                                                    value={formData.insuranceExpiryDate}
                                                    onChange={handleInputChange}
                                                    className="form-input date-input"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    disabled={formData.noInsurance}
                                                />
                                            </div>
                                            <div className="input-hint">Policy expiration date</div>
                                        </div>
                                    </div>

                                    {/* Insurance Discount Preview */}
                                    {formData.insuranceProvider && (
                                        <div className="insurance-preview-card">
                                            <h4 className="preview-title">
                                                <FaInfoCircle className="title-icon" />
                                                Insurance Discount Applied
                                            </h4>
                                            <div className="preview-details">
                                                {(() => {
                                                    const provider = insuranceProviders.find(p => p.id === formData.insuranceProvider);
                                                    const priceInfo = calculatePrice(formData.insuranceProvider, 500);
                                                    return (
                                                        <>
                                                            <div className="preview-row">
                                                                <span className="preview-label">Provider:</span>
                                                                <span className="preview-value">{provider?.name}</span>
                                                            </div>
                                                            <div className="preview-row discount-row">
                                                                <span className="preview-label">Discount:</span>
                                                                <span className="preview-value discount-value">
                                                                    {provider?.discount}{provider?.discountType === 'percentage' ? '%' : ' EGP'} off
                                                                </span>
                                                            </div>
                                                            <div className="preview-row">
                                                                <span className="preview-label">{provider?.description}</span>
                                                            </div>
                                                            <div className="preview-divider"></div>
                                                            <div className="preview-row highlight-row">
                                                                <span className="preview-label">Estimated Amount After Insurance:</span>
                                                                <span className="preview-value amount-value">{priceInfo.finalPrice} EGP</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 5: Payment Summary */}
                    {currentStep === 5 && (
                        <div className="form-step active">
                            <h2><FaMoneyBillWave /> Payment Summary</h2>
                            <p className="step-subtitle">Review your appointment cost and payment details</p>

                            {/* Price Summary Card */}
                            <div className="price-summary-card">
                                <h4 className="price-summary-title">
                                    <FaInfoCircle className="title-icon" />
                                    Price Breakdown
                                </h4>

                                <div className="price-details">
                                    <div className="price-row">
                                        <span className="price-label">Base Consultation Fee:</span>
                                        <span className="price-value">500 EGP</span>
                                    </div>

                                    {formData.insuranceProvider && !formData.noInsurance && (() => {
                                        const provider = insuranceProviders.find(p => p.id === formData.insuranceProvider);
                                        const priceInfo = calculatePrice(formData.insuranceProvider, 500);
                                        return (
                                            <>
                                                <div className="price-row discount-row">
                                                    <span className="price-label">
                                                        Insurance Discount ({provider?.name}):
                                                    </span>
                                                    <span className="price-value discount-value">
                                                        -{priceInfo.discount} EGP
                                                    </span>
                                                </div>

                                                <div className="price-row">
                                                    <span className="price-label discount-description">
                                                        <FaInfoCircle className="info-icon" />
                                                        {provider?.description}
                                                    </span>
                                                </div>

                                                <div className="price-divider"></div>
                                            </>
                                        );
                                    })()}

                                    <div className="price-row total-row">
                                        <span className="price-label">Final Amount to Pay:</span>
                                        <span className="price-value total-value">
                                            {calculatePrice(formData.insuranceProvider, 500).finalPrice} EGP
                                        </span>
                                    </div>

                                    {formData.insuranceProvider && !formData.noInsurance && (() => {
                                        const priceInfo = calculatePrice(formData.insuranceProvider, 500);
                                        return priceInfo.discount > 0 && (
                                            <div className="price-savings">
                                                <div className="savings-badge">
                                                    <FaPercent className="savings-icon" />
                                                    You save {priceInfo.discount} EGP ({Math.round((priceInfo.discount / priceInfo.basePrice) * 100)}%)
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="price-note">
                                    <FaInfoCircle className="note-icon" />
                                    <span className="note-text">
                                        This is an estimated amount. Final charges may vary based on additional services required during your visit.
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method Section */}
                            <div className="payment-notice-section">
                                <div className="payment-notice-header">
                                    <FaMoneyBillWave className="payment-icon" />
                                    <h3>Payment Information</h3>
                                </div>
                                <div className="payment-notice-content">
                                    <div className="payment-method-badge">
                                        <FaMoneyBillWave />
                                        <span>Cash Payment at Clinic</span>
                                    </div>
                                    <div className="payment-notice-info">
                                        <FaInfoCircle />
                                        <div className="payment-details">
                                            <p><strong>Payment Method:</strong> Cash Only</p>
                                            <p><strong>Payment Location:</strong> At the clinic on your appointment day</p>
                                            <p><strong>Payment Status:</strong> <span className="pending-badge">Pending</span></p>
                                        </div>
                                    </div>
                                    <div className="payment-notice-alert">
                                        <FaInfoCircle />
                                        <p>Please bring the exact amount or sufficient cash. Payment must be completed before your consultation.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Summary */}
                            <div className="appointment-summary-section">
                                <h4 className="summary-title">
                                    <FaCheckCircle className="title-icon" />
                                    Appointment Summary
                                </h4>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label"><FaUser /> Patient Name:</span>
                                        <span className="summary-value">{formData.patientName || 'Not provided'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label"><FaIdCard /> Patient ID:</span>
                                        <span className="summary-value">{formData.patientId}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label"><FaPhone /> Phone:</span>
                                        <span className="summary-value">{formData.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label"><FaCalendarAlt /> Date:</span>
                                        <span className="summary-value">{formData.appointmentDate || 'Not selected'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label"><FaClock /> Time:</span>
                                        <span className="summary-value">{formData.appointmentTime || 'Not selected'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label"><FaStethoscope /> Reason:</span>
                                        <span className="summary-value">{formData.reasonForVisit || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="form-navigation">
                        {currentStep > 1 && (
                            <button type="button" className="btn-secondary" onClick={prevStep}>
                                <FaArrowLeft /> Previous
                            </button>
                        )}
                        
                        {currentStep < 5 ? (
                            <button type="button" className="btn-primary" onClick={nextStep}>
                                Next <FaArrowRight />
                            </button>
                        ) : (
                            <button type="submit" className="btn-success" disabled={loading}>
                                {loading ? 'Booking...' : <><FaCheck /> Confirm Booking</>}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
                </>
            )}
        </div>
    );
};

export default BookAppointmentPage;
