import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaUser, FaCalendarAlt, FaPhone, FaEnvelope, FaHome, FaIdCard,
    FaBirthdayCake, FaVenusMars, FaClock, FaStethoscope, FaArrowLeft,
    FaArrowRight, FaCheck, FaChevronLeft, FaChevronRight, FaShieldAlt,
    FaFileMedical, FaAllergies, FaHeartbeat, FaPills, FaSyringe, FaUserMd, FaEye,
    FaCheckCircle, FaCalendarDay, FaMoneyBillWave, FaInfoCircle, FaClipboard,
    FaPercent, FaCalendarTimes, FaPhoneAlt, FaHistory, FaPlus, FaFlag
} from 'react-icons/fa';
import { appointmentsAPI, doctorsAPI } from '../services/apiConfig';
import PatientLayout from '../components/PatientLayout';
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
    
    // Reason for visit options
    const reasonForVisitOptions = [
        'Regular Eye Checkup',
        'Vision Correction (Glasses/Contacts)',
        'Eye Infection',
        'Cataract Surgery',
        'LASIK Surgery',
        'Glaucoma Screening',
        'Diabetic Retinopathy',
        'Eye Injury',
        'Floaters/Flashes',
        'Dry Eye Syndrome',
        'Retina Issues',
        'Other'
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
    const [formData, setFormData] = useState(() => {
        // Get correct patientId from localStorage - PREFER patientIdentifier (P-XXXXXX format)
        const patientId = localStorage.getItem("patientIdentifier") || 
                         localStorage.getItem("PatientIdentifier") ||
                         localStorage.getItem("patientId") || 
                         localStorage.getItem("PatientId");
        
        const patientName = localStorage.getItem("patientName") || 
                           localStorage.getItem("userName") || '';
        
        const email = localStorage.getItem("patientEmail") || 
                     localStorage.getItem("userEmail") || '';
        
        const phone = localStorage.getItem("patientPhone") || '';
        
        const dob = localStorage.getItem("patientDateOfBirth") || '';
        
        return {
            // Patient Info
            patientName: patientName,
            patientId: patientId || 'P-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            appointmentId: 'A-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            phone: phone,
            email: email,
            dateOfBirth: dob,
            age: '',
            gender: '',
            nationalId: '',
            address: '',

            // Appointment Details
            doctorId: '',
            appointmentDate: '',
            appointmentTime: '',
            reasonForVisit: '',
            reasonForVisitOther: '',

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
            finalPrice: 500,
            status: 'Pending'
        };
    });

    // Field validation status: 'valid' | 'invalid' | 'duplicate' | 'empty'
    const [fieldStatus, setFieldStatus] = useState({
        phone: 'empty',
        nationalId: 'empty',
        email: 'empty'
    });

    // Fetch doctors on component mount
    useEffect(() => {
        fetchDoctors();
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

    // Validate Egyptian phone number format
    const isValidEgyptianPhone = (phone) => {
        if (!phone) return false;
        // Remove all non-digit characters
        const digitsOnly = phone.replace(/\D/g, '');
        // Egyptian mobile: 01X (10 or 11 digits starting with 01)
        // Pattern: 010, 011, 012, 015 followed by 8 digits
        // OR: 0 followed by area code (2,3) and 8 digits
        const egyptianMobilePattern = /^(201[0-2,5]|01[0-2,5])\d{8}$/; // +20 or 0 format
        const egyptianLandlinePattern = /^(20[2,3]|0[2,3])\d{8}$/; // +20 or 0 format
        
        return egyptianMobilePattern.test(digitsOnly) || egyptianLandlinePattern.test(digitsOnly);
    };

    // Check for duplicate phone number
    const checkPhoneDuplicate = async (phone) => {
        if (!phone) {
            setFieldStatus(prev => ({ ...prev, phone: 'empty' }));
            return false;
        }

        if (!isValidEgyptianPhone(phone)) {
            setFieldStatus(prev => ({ ...prev, phone: 'invalid' }));
            return false;
        }

        try {
            const response = await fetch(`http://localhost:5201/api/Appointments/CheckPhoneExists/${phone}`);
            if (response.ok) {
                const { exists } = await response.json();
                if (exists) {
                    setFieldStatus(prev => ({ ...prev, phone: 'duplicate' }));
                    return false;
                } else {
                    setFieldStatus(prev => ({ ...prev, phone: 'valid' }));
                    return true;
                }
            } else {
                setFieldStatus(prev => ({ ...prev, phone: 'valid' }));
            }
        } catch (error) {
            console.warn('Phone check failed:', error);
            setFieldStatus(prev => ({ ...prev, phone: 'valid' }));
        }
        return true;
    };

    // Validate Egyptian National ID format (14 digits)
    const isValidEgyptianNationalId = (nationalId) => {
        if (!nationalId) return false;
        const digitsOnly = nationalId.replace(/\D/g, '');
        // Egyptian National ID: exactly 14 digits
        return /^\d{14}$/.test(digitsOnly);
    };

    // Check for duplicate National ID
    const checkNationalIdDuplicate = async (nationalId) => {
        if (!nationalId || nationalId.trim() === '') {
            setFieldStatus(prev => ({ ...prev, nationalId: 'empty' }));
            return true; // Optional field
        }

        if (!isValidEgyptianNationalId(nationalId)) {
            setFieldStatus(prev => ({ ...prev, nationalId: 'invalid' }));
            return false;
        }

        try {
            const response = await fetch(`http://localhost:5201/api/Appointments/CheckNationalIdExists/${nationalId}`);
            if (response.ok) {
                const { exists } = await response.json();
                if (exists) {
                    setFieldStatus(prev => ({ ...prev, nationalId: 'duplicate' }));
                    return false;
                } else {
                    setFieldStatus(prev => ({ ...prev, nationalId: 'valid' }));
                    return true;
                }
            } else {
                setFieldStatus(prev => ({ ...prev, nationalId: 'valid' }));
            }
        } catch (error) {
            console.warn('National ID check failed:', error);
            setFieldStatus(prev => ({ ...prev, nationalId: 'valid' }));
        }
        return true;
    };

    // Helper function to get validation icon
    const getValidationIcon = (status) => {
        if (status === 'valid') {
            return <span style={{color: '#22c55e', fontSize: '1.2rem'}}>✓</span>;
        } else if (status === 'duplicate') {
            return <span style={{color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold'}}>✗</span>;
        } else if (status === 'invalid') {
            return <span style={{color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold'}}>✗</span>;
        }
        return null;
    };

    // Helper function to get validation message
    const getValidationMessage = (status) => {
        if (status === 'duplicate') {
            return <span style={{color: '#ef4444', fontSize: '0.75rem', fontWeight: '600'}}>Already exists in system</span>;
        } else if (status === 'invalid') {
            return <span style={{color: '#ef4444', fontSize: '0.75rem', fontWeight: '600'}}>Invalid format</span>;
        }
        return null;
    };

    // Validation function for each step
    const validateStep = (step) => {
        const errors = [];

        if (step === 1) {
            // Personal Information validation
            if (!formData.patientName || formData.patientName.trim() === '') errors.push('Patient Name is required');
            if (!formData.phone || formData.phone.trim() === '') errors.push('Phone Number is required');
            if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) errors.push('Phone Number must be at least 10 digits');
            if (!formData.email || formData.email.trim() === '') errors.push('Email Address is required');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Email Address is invalid');
            if (!formData.gender || formData.gender === '') errors.push('Gender is required');
            if (!formData.address || formData.address.trim() === '') errors.push('Address is required');
        } else if (step === 2) {
            // Appointment Details validation
            if (!formData.doctorId || formData.doctorId === '') errors.push('Doctor is required');
            if (!formData.appointmentDate || formData.appointmentDate === '') errors.push('Appointment Date is required');
            if (!formData.appointmentTime || formData.appointmentTime === '') errors.push('Appointment Time is required');
        } else if (step === 3) {
            // Medical History - can be empty but validate if filled
            if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
                errors.push('Date of Birth cannot be in the future');
            }
        } else if (step === 4) {
            // Insurance Information - can be empty but validate if filled
            if (formData.insuranceProvider && formData.insuranceExpiryDate) {
                if (new Date(formData.insuranceExpiryDate) < new Date()) {
                    errors.push('Insurance Expiry Date cannot be in the past');
                }
            }
        }

        return errors;
    };

    const nextStep = () => {
        // Validate current step before advancing
        const stepErrors = validateStep(currentStep);
        
        if (stepErrors.length > 0) {
            alert(`Please fix the following errors:\n\n${stepErrors.join('\n')}`);
            return;
        }

        // Allow advancing to next step
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
        if (e) e.preventDefault();

        // Only allow booking from the final step (Payment Summary)
        if (currentStep !== 5) {
            nextStep();
            return;
        }

        setLoading(true);

        try {
            // Validate all required fields
            const requiredFields = {
                patientName: 'Patient Name',
                phone: 'Phone Number',
                email: 'Email Address',
                gender: 'Gender',
                address: 'Address',
                appointmentDate: 'Appointment Date',
                appointmentTime: 'Appointment Time',
                doctorId: 'Doctor'
            };

            const missingFields = [];
            for (const [field, label] of Object.entries(requiredFields)) {
                if (!formData[field] || formData[field].toString().trim() === '') {
                    missingFields.push(label);
                }
            }

            if (missingFields.length > 0) {
                alert(`Please fill in all required fields:\n${missingFields.join('\n')}`);
                setLoading(false);
                return;
            }

            // Validate phone number format (basic check)
            if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
                alert('Please enter a valid phone number (at least 10 digits)');
                setLoading(false);
                return;
            }

            // Check for duplicate phone number in database
            try {
                const phoneCheckResponse = await fetch(`http://localhost:5201/api/Appointments/CheckPhoneExists/${formData.phone}`);
                if (phoneCheckResponse.ok) {
                    const { exists } = await phoneCheckResponse.json();
                    if (exists) {
                        alert('This phone number is already registered in the system. Please use a different phone number.');
                        setLoading(false);
                        return;
                    }
                }
            } catch (phoneCheckError) {
                console.warn('Phone uniqueness check failed, continuing...', phoneCheckError);
            }

            // Check for duplicate National ID if provided
            if (formData.nationalId && formData.nationalId.trim() !== '') {
                try {
                    const nationalIdCheckResponse = await fetch(`http://localhost:5201/api/Appointments/CheckNationalIdExists/${formData.nationalId}`);
                    if (nationalIdCheckResponse.ok) {
                        const { exists } = await nationalIdCheckResponse.json();
                        if (exists) {
                            alert('This National ID is already registered in the system. Please check your information.');
                            setLoading(false);
                            return;
                        }
                    }
                } catch (nationalIdCheckError) {
                    console.warn('National ID uniqueness check failed, continuing...', nationalIdCheckError);
                }
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
                nationalId: formData.nationalId && formData.nationalId.trim() !== '' ? formData.nationalId : '',
                address: formData.address && formData.address.trim() !== '' ? formData.address : '',
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
                // Store patientId in localStorage for appointment history linking
                localStorage.setItem('patientId', appointmentData.patientId);
                
                // Store booking details for confirmation page
                setBookingDetails({
                    patientName: appointmentData.patientName,
                    appointmentDate: appointmentData.appointmentDate,
                    appointmentTime: appointmentData.appointmentTime,
                    doctor: doctors.find(d => d.id === appointmentData.doctorId)?.name || 'Dr. Mohab Khairy',
                    patientId: appointmentData.patientId,
                    finalPrice: appointmentData.finalPrice || 500,
                    status: 'Pending Confirmation'
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
        <PatientLayout>
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
                            <div className="detail-row">
                                <FaMoneyBillWave className="detail-icon" />
                                <span className="detail-label">Consultation Fee:</span>
                                <span className="detail-value">{bookingDetails?.finalPrice} EGP</span>
                            </div>
                            <div className="detail-row">
                                <FaShieldAlt className="detail-icon" />
                                <span className="detail-label">Status:</span>
                                <span className="detail-value" style={{ color: '#10b981', fontWeight: '700' }}>{bookingDetails?.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Original Booking Form */
                <>
                    {/* Main Content */}
                    <div className="appointment-content">
                        <div className="appointment-header">
                            <h1><FaCalendarAlt /> Book an Appointment</h1>
                            <p>Fill out the form to book your appointment with our specialists</p>
                        </div>

                        <div className="appointment-container">
                            {renderStepIndicator()}

                            <form onSubmit={handleSubmit} noValidate>
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="form-step active">
                                <div className="form-grid-simple">
                                    {/* Patient ID */}
                                    <div className="form-field-simple">
                                        <label>Patient ID</label>
                                        <input type="text" value={formData.patientId} readOnly />
                                    </div>

                                    {/* Appointment ID */}
                                    <div className="form-field-simple">
                                        <label>Appointment ID</label>
                                        <input type="text" value={formData.appointmentId} readOnly />
                                    </div>

                                    {/* Full Name */}
                                    <div className="form-field-simple">
                                        <label>Full Name *</label>
                                        <div className="input-with-validation">
                                            <input
                                                type="text"
                                                name="patientName"
                                                value={formData.patientName}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter full name"
                                            />
                                            <span className="status-icon">
                                                {formData.patientName && formData.patientName.trim() ? <span className="valid">✓</span> : formData.patientName ? <span className="invalid">✗</span> : null}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div className="form-field-simple">
                                        <label><FaFlag style={{color: '#CE1126', marginRight: '0.5rem'}} /> Phone Number *</label>
                                        <div className="input-with-validation">
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                onBlur={() => checkPhoneDuplicate(formData.phone)}
                                                required
                                                placeholder="201xxxxxxxxxx (14 digits)"
                                            />
                                            <span className="status-icon">
                                                {fieldStatus.phone === 'valid' && <span className="valid">✓</span>}
                                                {fieldStatus.phone === 'duplicate' && <span className="invalid">✗</span>}
                                                {fieldStatus.phone === 'invalid' && <span className="invalid">✗</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="form-field-simple">
                                        <label>Email Address *</label>
                                        <div className="input-with-validation">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="example@email.com"
                                            />
                                            <span className="status-icon">
                                                {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? <span className="valid">✓</span> : formData.email ? <span className="invalid">✗</span> : null}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="form-field-simple">
                                        <label>Gender *</label>
                                        <div className="input-with-validation">
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            <span className="status-icon">
                                                {formData.gender && <span className="valid">✓</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="form-field-simple">
                                        <label>Date of Birth</label>
                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                                    </div>

                                    {/* National ID */}
                                    <div className="form-field-simple">
                                        <label>National ID (14 digits)</label>
                                        <div className="input-with-validation">
                                            <input
                                                type="text"
                                                name="nationalId"
                                                value={formData.nationalId}
                                                onChange={handleInputChange}
                                                onBlur={() => checkNationalIdDuplicate(formData.nationalId)}
                                                placeholder="xxxxxxxxxxxxx (14 digits)"
                                                maxLength="14"
                                            />
                                            <span className="status-icon">
                                                {fieldStatus.nationalId === 'valid' && <span className="valid">✓</span>}
                                                {fieldStatus.nationalId === 'duplicate' && <span className="invalid">✗</span>}
                                                {fieldStatus.nationalId === 'invalid' && <span className="invalid">✗</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="form-field-simple">
                                        <label>Address *</label>
                                        <div className="input-with-validation">
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter address"
                                            />
                                            <span className="status-icon">
                                                {formData.address && formData.address.trim() ? <span className="valid">✓</span> : formData.address ? <span className="invalid">✗</span> : null}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Age */}
                                    <div className="form-field-simple">
                                        <label>Age</label>
                                        <input type="number" name="age" value={formData.age || ''} readOnly placeholder="Auto-calculated" />
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Step 2: Appointment Details */}
                    {currentStep === 2 && (
                        <div className="form-step active">
                            {/* Doctor Selection - Simple */}
                            <div className="step2-doctor-section">
                                <h3><FaUserMd /> Select Your Doctor *</h3>
                                <div className="step2-doctors-list">
                                    {doctors.map((doctor) => (
                                        <button
                                            key={doctor.doctorId}
                                            type="button"
                                            className={`step2-doctor-btn ${formData.doctorId === doctor.doctorId.toString() ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, doctorId: doctor.doctorId.toString() }))}
                                        >
                                            <span className="doctor-info">
                                                <strong>{doctor.fullName}</strong>
                                                <small>{doctor.specialization}</small>
                                            </span>
                                            {formData.doctorId === doctor.doctorId.toString() && <FaCheck />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Two Column Layout */}
                            <div className="step2-two-columns">
                                {/* Left: Calendar */}
                                <div className="step2-calendar-col">
                                    <h3><FaCalendarDay /> Select Date *</h3>
                                    <div className="step2-calendar">
                                        <div className="step2-calendar-nav">
                                            <button type="button" onClick={() => {
                                                if (currentMonth === 0) {
                                                    setCurrentMonth(11);
                                                    setCurrentYear(currentYear - 1);
                                                } else {
                                                    setCurrentMonth(currentMonth - 1);
                                                }
                                            }}>
                                                <FaChevronLeft />
                                            </button>
                                            <span>{monthNames[currentMonth]} {currentYear}</span>
                                            <button type="button" onClick={() => {
                                                if (currentMonth === 11) {
                                                    setCurrentMonth(0);
                                                    setCurrentYear(currentYear + 1);
                                                } else {
                                                    setCurrentMonth(currentMonth + 1);
                                                }
                                            }}>
                                                <FaChevronRight />
                                            </button>
                                        </div>
                                        <div className="step2-calendar-days">
                                            <div className="day-name">Sun</div>
                                            <div className="day-name">Mon</div>
                                            <div className="day-name">Tue</div>
                                            <div className="day-name">Wed</div>
                                            <div className="day-name">Thu</div>
                                            <div className="day-name">Fri</div>
                                            <div className="day-name">Sat</div>
                                        </div>
                                        <div className="step2-calendar-grid">
                                            {renderCalendar()}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Time Slots & Reason */}
                                <div className="step2-time-col">
                                    <h3><FaClock /> Select Time *</h3>
                                    {selectedDate ? (
                                        <>
                                            <div className="step2-time-slots">
                                                {timeSlots.map(time => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        className={`step2-time-btn ${selectedTime === time ? 'selected' : ''}`}
                                                        onClick={() => handleTimeSelect(time)}
                                                    >
                                                        {time}
                                                        {selectedTime === time && <FaCheck />}
                                                    </button>
                                                ))}
                                            </div>

                                            {selectedTime && (
                                                <div className="step2-reason">
                                                    <label><FaClipboard /> Reason for Visit *</label>
                                                    <select
                                                        name="reasonForVisit"
                                                        value={formData.reasonForVisit}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select a reason</option>
                                                        {reasonForVisitOptions.map(reason => (
                                                            <option key={reason} value={reason}>{reason}</option>
                                                        ))}
                                                    </select>
                                                    
                                                    {formData.reasonForVisit === 'Other' && (
                                                        <textarea
                                                            name="reasonForVisitOther"
                                                            value={formData.reasonForVisitOther || ''}
                                                            onChange={handleInputChange}
                                                            placeholder="Please describe your reason..."
                                                            rows="4"
                                                            required
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="step2-message">
                                            <p>Select a date to see available times</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Medical History */}
                    {currentStep === 3 && (
                        <div className="form-step active">
                            <div className="medical-history-layout">

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
                        </div>
                    )}

                    {/* Step 4: Insurance Information */}
                    {currentStep === 4 && (
                        <div className="form-step active">
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

                    {/* Step 5: Unified Booking & Payment Summary */}
                    {currentStep === 5 && (
                        <div className="form-step active">
                            <div className="unified-summary-container">
                                {/* Header */}
                                <div className="summary-header">
                                    <FaCheckCircle className="header-icon" />
                                    <h2>Booking Summary</h2>
                                </div>

                                {/* Patient Information Section */}
                                <div className="summary-section">
                                    <div className="section-header">
                                        <FaUser className="section-icon" />
                                        <h3>Patient Information</h3>
                                    </div>
                                    <div className="section-content">
                                        <div className="info-row">
                                            <span className="info-label">
                                                <FaUser className="icon" />
                                                Patient Name:
                                            </span>
                                            <span className="info-value">{formData.patientName || 'Not provided'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">
                                                <FaIdCard className="icon" />
                                                Patient ID:
                                            </span>
                                            <span className="info-value">{formData.patientId}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">
                                                <FaPhone className="icon" />
                                                Phone:
                                            </span>
                                            <span className="info-value">{formData.phone || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="section-divider"></div>

                                {/* Appointment Details Section */}
                                <div className="summary-section">
                                    <div className="section-header">
                                        <FaCalendarAlt className="section-icon" />
                                        <h3>Appointment Details</h3>
                                    </div>
                                    <div className="section-content">
                                        <div className="info-row">
                                            <span className="info-label">
                                                <FaCalendarAlt className="icon" />
                                                Date:
                                            </span>
                                            <span className="info-value">{formData.appointmentDate || 'Not selected'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">
                                                <FaClock className="icon" />
                                                Time:
                                            </span>
                                            <span className="info-value">{formData.appointmentTime || 'Not selected'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">
                                                <FaStethoscope className="icon" />
                                                Reason for Visit:
                                            </span>
                                            <span className="info-value">{formData.reasonForVisit || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="section-divider"></div>

                                {/* Payment Summary Section */}
                                <div className="summary-section">
                                    <div className="section-header">
                                        <FaInfoCircle className="section-icon" />
                                        <h3>Payment Summary</h3>
                                    </div>
                                    <div className="section-content">
                                        <div className="payment-row">
                                            <span className="payment-label">Base Consultation Fee:</span>
                                            <span className="payment-value">500 EGP</span>
                                        </div>

                                        {formData.insuranceProvider && !formData.noInsurance && (() => {
                                            const provider = insuranceProviders.find(p => p.id === formData.insuranceProvider);
                                            const priceInfo = calculatePrice(formData.insuranceProvider, 500);
                                            return (
                                                <>
                                                    <div className="payment-row discount-row">
                                                        <span className="payment-label">
                                                            Insurance Discount ({provider?.name}):
                                                        </span>
                                                        <span className="payment-value discount-value">
                                                            -{priceInfo.discount} EGP
                                                        </span>
                                                    </div>
                                                    <div className="mini-divider"></div>
                                                </>
                                            );
                                        })()}

                                        <div className="payment-row total-row">
                                            <span className="payment-label">Final Amount to Pay:</span>
                                            <span className="payment-value total-value">
                                                {calculatePrice(formData.insuranceProvider, 500).finalPrice} EGP
                                            </span>
                                        </div>

                                        {formData.insuranceProvider && !formData.noInsurance && (() => {
                                            const priceInfo = calculatePrice(formData.insuranceProvider, 500);
                                            return priceInfo.discount > 0 && (
                                                <div className="savings-info">
                                                    <FaPercent className="savings-icon" />
                                                    <span>You save {priceInfo.discount} EGP ({Math.round((priceInfo.discount / priceInfo.basePrice) * 100)}%)</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="section-divider"></div>

                                {/* Payment Method & Status Section */}
                                <div className="summary-section">
                                    <div className="section-header">
                                        <FaMoneyBillWave className="section-icon" />
                                        <h3>Payment Method</h3>
                                    </div>
                                    <div className="section-content">
                                        <div className="payment-method-info">
                                            <p><strong>Payment Method:</strong> <span>Cash Only</span></p>
                                            <p><strong>Payment Location:</strong> <span>At the clinic on your appointment day</span></p>
                                            <p><strong>Payment Status:</strong> <span className="status-badge">Pending</span></p>
                                        </div>
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
                            <button 
                                type="button" 
                                className="btn-primary" 
                                onClick={nextStep}
                                disabled={validateStep(currentStep).length > 0}
                                title={validateStep(currentStep).length > 0 ? `Please fix: ${validateStep(currentStep).join(', ')}` : ''}
                            >
                                Next <FaArrowRight />
                            </button>
                        ) : (
                            <button type="button" className="btn-success" onClick={handleSubmit} disabled={loading}>
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
        </PatientLayout>
    );
};

export default BookAppointmentPage;
