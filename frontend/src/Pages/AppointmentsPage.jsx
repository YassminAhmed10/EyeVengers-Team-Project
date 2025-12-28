// AppointmentBooking.jsx - Main component with sidebar width minimized and duplicate headers removed
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Appointments.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { appointmentsAPI } from '../services/apiConfig';

import {
    FaUser,
    FaCalendarAlt,
    FaShieldAlt,
    FaFileMedical,
    FaPhone,
    FaEnvelope,
    FaHome,
    FaIdCard,
    FaBirthdayCake,
    FaVenusMars,
    FaArrowLeft,
    FaArrowRight,
    FaCheck,
    FaCalendarDay,
    FaClock,
    FaStethoscope,
    FaChevronLeft,
    FaChevronRight,
    FaInfoCircle,
    FaPercent,
    FaCalendarTimes,
    FaPhoneAlt,
    FaAllergies,
    FaHeartbeat,
    FaPills,
    FaSyringe,
    FaUserMd,
    FaEye,
    FaSearch,
    FaFilter,
    FaCalendarCheck,
    FaEdit,
    FaTrash,
    FaEye as FaView,
    FaPrint,
    FaDownload,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaTimes,
    FaList,
    FaTable,
    FaCalendar,
    FaUserPlus,
    FaCheckCircle,
    FaClock as FaClockIcon,
    FaBan,
    FaHistory,
    FaFileAlt,
    FaPlus,
    FaMinus,
    FaFilePdf,
    FaCogs,
    FaExternalLinkAlt,
    FaUserInjured,
    FaExclamationCircle,
    FaUserClock
} from 'react-icons/fa';

const AppointmentBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('book');  // Default to Book Appointment
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [sortField, setSortField] = useState('appointmentDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [isPatientSearching, setIsPatientSearching] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedOnlineRequest, setSelectedOnlineRequest] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isOnlineRequestModalOpen, setIsOnlineRequestModalOpen] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Online Requests state
    const [requestSearchQuery, setRequestSearchQuery] = useState('');
    const [requestFilterDate, setRequestFilterDate] = useState('');
    const [showRequestCalendar, setShowRequestCalendar] = useState(false);
    const [requestSortField, setRequestSortField] = useState('submittedDate');
    const [requestSortDirection, setRequestSortDirection] = useState('desc');
    const [requestViewMode, setRequestViewMode] = useState('card'); // 'card' or 'table'

    // Payment state
    const [paymentData, setPaymentData] = useState({
        consultationFee: 500,
        additionalServices: [],
        subtotal: 500,
        insuranceDiscount: 0,
        totalAmount: 500,
        amountPaid: 0,
        remainingBalance: 500,
        paymentMethod: 'cash',
        paymentNotes: ''
    });

    // Appointment data from API
    const [existingPatients, setExistingPatients] = useState([]);
    const [existingAppointments, setExistingAppointments] = useState([]);
    const [onlineRequests, setOnlineRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Insurance providers with their offers
    const insuranceProviders = [
        {
            id: 'allianz',
            name: 'أليانز مصر (Allianz Egypt)',
            discount: 15,
            discountType: 'percentage',
            contact: '+20 2 3539 4000',
            description: '15% discount on total appointment fees'
        },
        {
            id: 'axa',
            name: 'أكسا مصر (AXA Egypt)',
            discount: 100,
            discountType: 'fixed',
            contact: '+20 2 3335 5000',
            description: '100 EGP off total appointment fees'
        },
        {
            id: 'misr',
            name: 'مصر للتأمين (Misr Insurance)',
            discount: 20,
            discountType: 'percentage',
            contact: '+20 2 3337 7000',
            description: '20% discount on consultation fees only'
        }
    ];

    // Coverage type options
    const coverageTypes = [
        'Basic Coverage',
        'Comprehensive',
        'Dental & Vision',
        'Full Medical',
        'Emergency Only',
        'Specialized Care'
    ];

    // Medical History options
    const eyeAllergyOptions = ['Dust', 'Pollen', 'Eye Drops', 'None'];
    const chronicDiseaseOptions = ['Diabetes', 'Hypertension', 'Thyroid Disorders', 'Heart Disease', 'Asthma', 'Arthritis', 'None'];
    const eyeSurgeryOptions = ['Cataract', 'LASIK', 'Glaucoma Surgery', 'None'];
    const familyEyeDiseaseOptions = ['Glaucoma', 'Cataract', 'Macular Degeneration', 'None'];
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

    // Status options for appointments
    const statusOptions = {
        'Pending': { color: '#ff9800', bg: '#fff3e0', icon: <FaClockIcon /> },
        'Confirmed': { color: '#2196f3', bg: '#e3f2fd', icon: <FaCheckCircle /> },
        'Completed': { color: '#4caf50', bg: '#e8f5e9', icon: <FaCheck /> },
        'Cancelled': { color: '#f44336', bg: '#ffebee', icon: <FaBan /> },
        'No-show': { color: '#9e9e9e', bg: '#f5f5f5', icon: <FaHistory /> }
    };

    const [formData, setFormData] = useState({
        // Patient Info
        patientName: '',
        patientId: 'P-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        phone: '',
        email: '',
        dateOfBirth: '',
        age: '',
        gender: '',
        nationalId: '',
        address: '',

        // Appointment Details
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
        finalPrice: 500,
    });

    // Filtered appointments based on search and filters
    const filteredAppointments = useMemo(() => {
        let filtered = [...existingAppointments];

        // Search filter
        if (appointmentSearchQuery) {
            const query = appointmentSearchQuery.toLowerCase();
            filtered = filtered.filter(apt =>
                apt.patientName.toLowerCase().includes(query) ||
                apt.patientId.toLowerCase().includes(query) ||
                apt.phone.includes(query) ||
                apt.appointmentId.toLowerCase().includes(query) ||
                apt.reasonForVisit.toLowerCase().includes(query)
            );
        }

        // Date filter
        if (filterDate) {
            filtered = filtered.filter(apt => apt.appointmentDate === filterDate);
        }

        // Status filter
        if (filterStatus) {
            filtered = filtered.filter(apt => apt.status === filterStatus);
        }

        // Sorting
        filtered.sort((a, b) => {
            if (sortField === 'appointmentDate') {
                const dateA = new Date(a.appointmentDateTime);
                const dateB = new Date(b.appointmentDateTime);
                return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            }
            if (sortField === 'patientName') {
                return sortDirection === 'asc'
                    ? a.patientName.localeCompare(b.patientName)
                    : b.patientName.localeCompare(a.patientName);
            }
            if (sortField === 'finalPrice') {
                return sortDirection === 'asc'
                    ? a.finalPrice - b.finalPrice
                    : b.finalPrice - a.finalPrice;
            }
            return 0;
        });

        return filtered;
    }, [existingAppointments, appointmentSearchQuery, filterDate, filterStatus, sortField, sortDirection]);

    // Filtered patients for search
    const filteredPatients = useMemo(() => {
        if (!patientSearchQuery) return [];
        const query = patientSearchQuery.toLowerCase();
        return existingPatients.filter(patient =>
            patient.patientName.toLowerCase().includes(query) ||
            patient.patientId.toLowerCase().includes(query) ||
            patient.phone.includes(query) ||
            patient.nationalId.includes(query)
        );
    }, [existingPatients, patientSearchQuery]);

    // Calculate total appointments for current day
    const totalAppointmentsToday = useMemo(() => {
        const dateToCheck = filterDate || new Date().toISOString().split('T')[0];
        return existingAppointments.filter(apt => apt.appointmentDate === dateToCheck).length;
    }, [existingAppointments, filterDate]);

    // Get day name from date
    const getDayName = (dateString) => {
        const date = new Date(dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    // Get appointment statistics
    const appointmentStats = useMemo(() => {
        const stats = {
            total: existingAppointments.length,
            today: totalAppointmentsToday,
            pending: existingAppointments.filter(apt => apt.status === 'Pending').length,
            confirmed: existingAppointments.filter(apt => apt.status === 'Confirmed').length,
            completed: existingAppointments.filter(apt => apt.status === 'Completed').length,
            cancelled: existingAppointments.filter(apt => apt.status === 'Cancelled').length
        };
        return stats;
    }, [existingAppointments, totalAppointmentsToday]);

    // Reason for visit options
    const reasonOptions = [
        'Routine Checkup',
        'Follow-up',
        'Eye Problem',
        'Surgery Consultation',
        'Contact Lenses',
        'Glasses Prescription'
    ];

    // Generate calendar for current month and year
    const generateCalendar = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const today = new Date();
        const currentDay = today.getDate();
        const currentMonthToday = today.getMonth();
        const currentYearToday = today.getFullYear();

        const calendar = [];
        let day = 1;

        // Generate 6 rows (weeks)
        for (let week = 0; week < 6; week++) {
            const weekDays = [];

            // Generate 7 columns (days)
            for (let weekDay = 0; weekDay < 7; weekDay++) {
                if ((week === 0 && weekDay < startingDay) || day > daysInMonth) {
                    weekDays.push(null);
                } else {
                    const isToday = currentYearToday === currentYear &&
                        currentMonthToday === currentMonth &&
                        day === currentDay;
                    const isSelected = selectedCalendarDate === day &&
                        selectedCalendarDate !== null;
                    const isPastDate = (currentYear < currentYearToday) ||
                        (currentYear === currentYearToday && currentMonth < currentMonthToday) ||
                        (currentYear === currentYearToday && currentMonth === currentMonthToday && day < currentDay);

                    weekDays.push({ day, date: new Date(currentYear, currentMonth, day), isToday, isSelected, isPastDate });
                    day++;
                }
            }

            if (weekDays.some(day => day !== null)) {
                calendar.push(weekDays);
            }
        }

        return calendar;
    };

    const calendar = generateCalendar();

    // Time slots (9 AM to 5 PM)
    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            const period = hour >= 12 ? 'PM' : 'AM';
            const timeString = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
            const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeSlots.push({ display: timeString, value: timeValue });
        }
    }

    // Month names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Check for tab parameter from navigation state
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
            // Clear the state so it doesn't persist on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    // Fetch online requests from API
    // Fetch appointments and online requests from API
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const data = await appointmentsAPI.getAll();
                
                // Transform API data to component format
                const statusMap = {
                    0: 'Upcoming',
                    1: 'Completed',
                    2: 'Cancelled',
                    3: 'In Progress',
                    4: 'No Show'
                };
                
                const transformedAppointments = data.map(apt => ({
                    id: apt.appointmentId,
                    appointmentId: apt.appointmentId,
                    patientId: apt.patientId,
                    patientName: apt.patientName,
                    phone: apt.phone,
                    appointmentDate: apt.appointmentDate,
                    appointmentTime: apt.appointmentTime,
                    appointmentDateTime: `${apt.appointmentDate}T${apt.appointmentTime}`,
                    appointmentType: apt.appointmentType || 'offline',
                    reasonForVisit: apt.reasonForVisit,
                    status: statusMap[apt.status] || 'Upcoming',
                    doctor: apt.doctor?.doctorName || 'Not Assigned',
                    insuranceProvider: apt.insuranceCompany,
                    finalPrice: apt.finalPrice || 500,
                    notes: apt.notes,
                    email: apt.email,
                    age: apt.age,
                    gender: apt.patientGender === 0 ? 'Male' : 'Female',
                    address: apt.address,
                    chronicDiseases: apt.chronicDiseases,
                    currentMedications: apt.currentMedications,
                    eyeAllergies: apt.eyeAllergies,
                    familyEyeDiseases: apt.familyEyeDiseases
                }));
                
                setExistingAppointments(transformedAppointments);
                // Online Requests are appointments with appointmentType='online' and status 0 (Upcoming)
                setOnlineRequests(transformedAppointments.filter(apt => 
                    apt.appointmentType === 'online' && apt.status === 'Upcoming'
                ));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching appointments:', error);
                setExistingAppointments([]);
                setOnlineRequests([]);
                setLoading(false);
            }
        };

        fetchAppointments();
        // Refresh every 30 seconds
        const interval = setInterval(fetchAppointments, 30000);
        return () => clearInterval(interval);
    }, []);

    // Helper function to calculate age
    const calculateAge = (birthDate) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age.toString();
    };

    // Auto-calculate age
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

    // Price calculation function
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

    // Handle checkbox selection with "None" logic
    const handleCheckboxChange = (category, value, checked) => {
        setFormData(prev => {
            const currentArray = prev[category] || [];
            let newArray;

            // Handle "None" selection
            if (value === 'None') {
                if (checked) {
                    // If "None" is checked, clear all other selections
                    newArray = ['None'];
                } else {
                    // If "None" is unchecked, clear the array
                    newArray = [];
                }
            } else {
                if (checked) {
                    // Add value to array, remove "None" if present
                    newArray = [...currentArray.filter(item => item !== 'None'), value];
                } else {
                    // Remove value from array
                    newArray = currentArray.filter(item => item !== value);
                }
            }

            return { ...prev, [category]: newArray };
        });
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

                // Recalculate price when noInsurance is checked
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
            // Handle input changes
            const updatedForm = { ...formData, [name]: value };

            // Recalculate price when insurance provider changes
            if (name === 'insuranceProvider') {
                const priceInfo = calculatePrice(value, formData.calculatedPrice);
                updatedForm.finalPrice = priceInfo.finalPrice;
            }

            setFormData(updatedForm);
        }
    };

    const handleStepChange = (step) => {
        setCurrentStep(step);
    };

    // Function to automatically determine appointment status
    const getAppointmentStatus = (appointment) => {
        // If manually set to cancelled or completed, keep it
        if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
            return appointment.status;
        }

        const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
        const now = new Date();
        
        // Check if appointment time has passed
        if (appointmentDateTime < now) {
            // If more than 1 hour passed and status is still confirmed
            const hoursPassed = (now - appointmentDateTime) / (1000 * 60 * 60);
            if (hoursPassed > 1 && appointment.status === 'Confirmed') {
                return 'No-Show'; // Didn't show up
            }
            // Otherwise keep current status (Completed or Cancelled)
            return appointment.status;
        }
        
        // Future appointments
        if (appointment.status === 'Pending') {
            return 'Pending'; // Waiting for receptionist confirmation
        }
        
        return 'Upcoming'; // Confirmed and in the future
    };

    // Function to update appointment status manually
    const handleStatusChange = (appointmentId, newStatus) => {
        setExistingAppointments(prev => 
            prev.map(apt => 
                apt.id === appointmentId 
                    ? { ...apt, status: newStatus }
                    : apt
            )
        );
    };

    const handleNextStep = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCalendarSelect = (day) => {
        if (day && !day.isPastDate) {
            setSelectedCalendarDate(day.day);
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`;
            setFormData(prev => ({ ...prev, appointmentDate: dateStr }));
        }
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time.value);
        setFormData(prev => ({ ...prev, appointmentTime: time.value }));
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Handle patient search and autofill
    const handlePatientSearch = () => {
        if (!patientSearchQuery) return;
        setIsPatientSearching(true);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for search
        searchTimeoutRef.current = setTimeout(() => {
            const foundPatient = existingPatients.find(patient =>
                patient.patientId.toLowerCase() === patientSearchQuery.toLowerCase() ||
                patient.phone === patientSearchQuery
            );

            if (foundPatient) {
                setFormData(prev => ({
                    ...prev,
                    patientName: foundPatient.patientName,
                    patientId: foundPatient.patientId,
                    phone: foundPatient.phone,
                    email: foundPatient.email,
                    dateOfBirth: foundPatient.dateOfBirth,
                    age: foundPatient.age,
                    gender: foundPatient.gender,
                    nationalId: foundPatient.nationalId,
                    address: foundPatient.address,
                    eyeAllergies: foundPatient.eyeAllergies,
                    otherAllergies: foundPatient.otherAllergies,
                    chronicDiseases: foundPatient.chronicDiseases,
                    currentMedications: foundPatient.currentMedications,
                    eyeSurgeries: foundPatient.eyeSurgeries,
                    otherEyeSurgeries: foundPatient.otherEyeSurgeries,
                    familyEyeDiseases: foundPatient.familyEyeDiseases,
                    otherFamilyEyeDiseases: foundPatient.otherFamilyEyeDiseases,
                    visionSymptoms: foundPatient.visionSymptoms
                }));

                // Show success message
                alert(`Patient ${foundPatient.patientName} found! Information has been auto-filled.`);
            } else {
                alert('Patient not found. Please enter new patient information.');
            }

            setIsPatientSearching(false);
        }, 500);
    };

    // Clear search timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const clearPatientSearch = () => {
        setPatientSearchQuery('');
        // Reset form to initial state except for auto-generated ID
        setFormData({
            patientName: '',
            patientId: 'P-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            phone: '',
            email: '',
            dateOfBirth: '',
            age: '',
            gender: '',
            nationalId: '',
            address: '',
            appointmentDate: '',
            appointmentTime: '',
            reasonForVisit: '',
            eyeAllergies: [],
            otherAllergies: '',
            chronicDiseases: [],
            currentMedications: '',
            eyeSurgeries: [],
            otherEyeSurgeries: '',
            familyEyeDiseases: [],
            otherFamilyEyeDiseases: '',
            visionSymptoms: [],
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
        });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Handle view appointment details
    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setIsViewModalOpen(true);
    };

    // Handle view online request details
    const handleViewOnlineRequest = (request) => {
        setSelectedOnlineRequest(request);
        setIsOnlineRequestModalOpen(true);
    };

    // Handle status update
    const handleStatusUpdate = (appointmentId, newStatus) => {
        setExistingAppointments(prev =>
            prev.map(apt =>
                apt.id === appointmentId
                    ? { ...apt, status: newStatus }
                    : apt
            )
        );

        if (selectedAppointment?.id === appointmentId) {
            setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
        }
    };

    // Handle appointment deletion
    const handleDeleteAppointment = (appointmentId) => {
        if (window.confirm('Are you sure you want to delete this appointment?')) {
            setExistingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
            if (selectedAppointment?.id === appointmentId) {
                setIsViewModalOpen(false);
                setSelectedAppointment(null);
            }
        }
    };

    // Handle online request actions
    const handleOnlineRequestAction = async (requestId, action) => {
        const request = onlineRequests.find(req => req.id === requestId);
        if (!request) return;

        switch (action) {
            case 'confirm':
                try {
                    // Update the appointment status from Upcoming (0) to Confirmed (1)
                    await appointmentsAPI.patch(requestId, { status: 1 });
                    
                    alert(`Appointment confirmed for ${request.patientName}`);
                    
                    // Refresh appointments
                    const response = await appointmentsAPI.getAll();
                    const statusMap = {
                        0: 'Upcoming',
                        1: 'Completed',
                        2: 'Cancelled',
                        3: 'In Progress',
                        4: 'No Show'
                    };
                    
                    const transformedAppointments = response.map(apt => ({
                        id: apt.appointmentId,
                        appointmentId: apt.appointmentId,
                        patientId: apt.patientId,
                        patientName: apt.patientName,
                        phone: apt.phone,
                        appointmentDate: apt.appointmentDate,
                        appointmentTime: apt.appointmentTime,
                        appointmentType: apt.appointmentType || 'offline',
                        reasonForVisit: apt.reasonForVisit,
                        status: statusMap[apt.status] || 'Upcoming',
                        doctor: apt.doctor?.doctorName || 'Not Assigned',
                        email: apt.email,
                        age: apt.age,
                        gender: apt.patientGender === 0 ? 'Male' : 'Female',
                        address: apt.address,
                        chronicDiseases: apt.chronicDiseases,
                        currentMedications: apt.currentMedications,
                        eyeAllergies: apt.eyeAllergies,
                        familyEyeDiseases: apt.familyEyeDiseases
                    }));
                    
                    setExistingAppointments(transformedAppointments);
                    setOnlineRequests(transformedAppointments.filter(apt => 
                        apt.appointmentType === 'online' && apt.status === 'Upcoming'
                    ));
                    setIsOnlineRequestModalOpen(false);
                } catch (error) {
                    console.error('Error confirming request:', error);
                    alert('Error confirming appointment. Please try again.');
                }
                break;

            case 'cancel':
                try {
                    // Update the appointment status to Cancelled (2)
                    await appointmentsAPI.patch(requestId, { status: 2 });
                    
                    alert(`Appointment cancelled for ${request.patientName}`);
                    
                    // Refresh appointments
                    const response = await appointmentsAPI.getAll();
                    const statusMap = {
                        0: 'Upcoming',
                        1: 'Completed',
                        2: 'Cancelled',
                        3: 'In Progress',
                        4: 'No Show'
                    };
                    
                    const transformedAppointments = response.map(apt => ({
                        id: apt.appointmentId,
                        appointmentId: apt.appointmentId,
                        patientId: apt.patientId,
                        patientName: apt.patientName,
                        phone: apt.phone,
                        appointmentDate: apt.appointmentDate,
                        appointmentTime: apt.appointmentTime,
                        appointmentType: apt.appointmentType || 'offline',
                        reasonForVisit: apt.reasonForVisit,
                        status: statusMap[apt.status] || 'Upcoming',
                        doctor: apt.doctor?.doctorName || 'Not Assigned',
                        email: apt.email,
                        age: apt.age,
                        gender: apt.patientGender === 0 ? 'Male' : 'Female',
                        address: apt.address
                    }));
                    
                    setExistingAppointments(transformedAppointments);
                    setOnlineRequests(transformedAppointments.filter(apt => 
                        apt.appointmentType === 'online' && apt.status === 'Upcoming'
                    ));
                    setIsOnlineRequestModalOpen(false);
                } catch (error) {
                    console.error('Error cancelling request:', error);
                    alert('Error cancelling appointment. Please try again.');
                }
                break;

            case 'view':
                handleViewOnlineRequest(request);
                break;

            default:
                break;
        }
    };

    // Handle print functionality
    const handlePrint = () => {
        // Filter only completed appointments
        const completedAppointments = filteredAppointments.filter(apt => apt.status === 'Completed');

        if (completedAppointments.length === 0) {
            alert('No completed appointments to print. Only completed appointments can be printed.');
            return;
        }

        // Create a printable template with completed appointments data
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Completed Appointments Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    h1 {
                        color: #1976D2;
                        font-size: 24px;
                    }
                    .date-info {
                        color: #666;
                        font-size: 14px;
                        margin-bottom: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th {
                        background: #1976D2;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        font-weight: bold;
                        border: 1px solid #ddd;
                    }
                    td {
                        padding: 12px;
                        border: 1px solid #ddd;
                        color: #333;
                    }
                    tr:nth-child(even) {
                        background: #f9f9f9;
                    }
                    tr:hover {
                        background: #f0f0f0;
                    }
                    .status-badge {
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-weight: bold;
                        text-align: center;
                        background: #e0f2f1;
                        color: #00695c;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #999;
                        font-size: 12px;
                    }
                    .report-type {
                        color: #2e7d32;
                        font-weight: bold;
                        font-size: 16px;
                        margin-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>👁️ Eye Clinic - Completed Appointments Report</h1>
                    <div class="report-type">✓ Completed Cases Only</div>
                    <div class="date-info">
                        Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        <br>
                        Total Completed Appointments: ${completedAppointments.length}
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Appointment ID</th>
                            <th>Patient Name</th>
                            <th>Appointment Date</th>
                            <th>Time</th>
                            <th>Reason for Visit</th>
                            <th>Status</th>
                            <th>Amount (EGP)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${completedAppointments.map(apt => `
                            <tr>
                                <td>${apt.appointmentId}</td>
                                <td>${apt.patientName}</td>
                                <td>${apt.appointmentDate} (${getDayName(apt.appointmentDate)})</td>
                                <td>${apt.appointmentTime}</td>
                                <td>${apt.reasonForVisit}</td>
                                <td>
                                    <span class="status-badge">
                                        ${apt.status}
                                    </span>
                                </td>
                                <td>${apt.finalPrice}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>This is a computer-generated report for completed appointments only. No signature required.</p>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    // Handle export to PDF
    const handleExportPDF = () => {
        alert('Exporting appointments to PDF...');
        // In a real app, this would generate and download a PDF
    };

    // Handle export to CSV
    const handleExportCSV = () => {
        const headers = ['Appointment ID', 'Patient Name', 'Date', 'Time', 'Reason', 'Status', 'Amount'];
        const csvData = filteredAppointments.map(apt => [
            apt.appointmentId,
            apt.patientName,
            apt.appointmentDate,
            apt.appointmentTime,
            apt.reasonForVisit,
            apt.status,
            `${apt.finalPrice} EGP`
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Handle clear all filters
    const handleClearFilters = () => {
        setAppointmentSearchQuery('');
        setFilterDate('');
        setFilterStatus('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.patientName || !formData.phone || !formData.appointmentDate || !formData.appointmentTime || !formData.reasonForVisit) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }

        // Create new appointment
        const newAppointment = {
            id: 'A-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            appointmentId: 'A-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            patientId: formData.patientId,
            patientName: formData.patientName,
            phone: formData.phone,
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime,
            appointmentDateTime: `${formData.appointmentDate}T${formData.appointmentTime}:00`,
            reasonForVisit: formData.reasonForVisit,
            status: 'Confirmed', // Receptionist creates = Confirmed directly
            doctor: 'Dr. Mohab Khaiery',
            insuranceProvider: formData.insuranceProvider,
            finalPrice: formData.finalPrice,
            amountPaid: parseFloat(paymentData.amountPaid) || 0,
            remainingBalance: (formData.finalPrice - (parseFloat(paymentData.amountPaid) || 0)),
            notes: 'New appointment created by receptionist'
        };

        // Add to existing appointments
        setExistingAppointments(prev => [newAppointment, ...prev]);

        // Check if patient exists, if not add to existing patients
        const patientExists = existingPatients.find(p => p.patientId === formData.patientId);
        if (!patientExists) {
            const newPatient = {
                id: formData.patientId,
                patientId: formData.patientId,
                patientName: formData.patientName,
                phone: formData.phone,
                email: formData.email,
                dateOfBirth: formData.dateOfBirth,
                age: formData.age,
                gender: formData.gender,
                nationalId: formData.nationalId,
                address: formData.address,
                eyeAllergies: formData.eyeAllergies,
                otherAllergies: formData.otherAllergies,
                chronicDiseases: formData.chronicDiseases,
                currentMedications: formData.currentMedications,
                eyeSurgeries: formData.eyeSurgeries,
                otherEyeSurgeries: formData.otherEyeSurgeries,
                familyEyeDiseases: formData.familyEyeDiseases,
                otherFamilyEyeDiseases: formData.otherFamilyEyeDiseases,
                visionSymptoms: formData.visionSymptoms
            };
            setExistingPatients(prev => [...prev, newPatient]);
        }

        console.log('Form submitted:', formData);
        console.log('New appointment:', newAppointment);

        // Success notification
        alert(`Appointment booked successfully!\n\nAppointment ID: ${newAppointment.appointmentId}\nPatient: ${newAppointment.patientName}\nDate: ${newAppointment.appointmentDate}\nTime: ${newAppointment.appointmentTime}`);

        // Reset form
        setFormData({
            patientName: '',
            patientId: 'P-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            phone: '',
            email: '',
            dateOfBirth: '',
            age: '',
            gender: '',
            nationalId: '',
            address: '',
            appointmentDate: '',
            appointmentTime: '',
            reasonForVisit: '',
            eyeAllergies: [],
            otherAllergies: '',
            chronicDiseases: [],
            currentMedications: '',
            eyeSurgeries: [],
            otherEyeSurgeries: '',
            familyEyeDiseases: [],
            otherFamilyEyeDiseases: '',
            visionSymptoms: [],
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
        });
        setCurrentStep(1);
        setSelectedCalendarDate(null);
        setSelectedTime('');
        setPatientSearchQuery('');

        // Switch to appointments tab to see the new appointment
        setActiveTab('all');
    };

    // View Appointment Modal
    const ViewAppointmentModal = () => {
        if (!selectedAppointment) return null;

        const statusConfig = statusOptions[selectedAppointment.status] || statusOptions.Pending;
        const insuranceProvider = insuranceProviders.find(p => p.id === selectedAppointment.insuranceProvider);
        const patient = existingPatients.find(p => p.patientId === selectedAppointment.patientId);

        return (
            <div className={`view-modal-overlay ${isViewModalOpen ? 'active' : ''}`} onClick={() => setIsViewModalOpen(false)}>
                <div className="view-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="view-modal-header">
                        <h3><FaCalendarCheck /> Appointment Details - {selectedAppointment.appointmentId}</h3>
                        <button className="close-modal-btn" onClick={() => setIsViewModalOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="view-modal-body">
                        <div className="appointment-details-grid">
                            <div className="detail-section">
                                <h4><FaUser /> Patient Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Patient Name:</span>
                                        <span className="detail-value">{selectedAppointment.patientName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Patient ID:</span>
                                        <span className="detail-value badge">{selectedAppointment.patientId}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Phone:</span>
                                        <span className="detail-value">{selectedAppointment.phone}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Date of Birth:</span>
                                        <span className="detail-value">{selectedAppointment.dateOfBirth || (patient && patient.dateOfBirth) || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Age:</span>
                                        <span className="detail-value">{selectedAppointment.age || (patient && patient.age) || 'N/A'} {selectedAppointment.age || patient?.age ? 'years' : ''}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Gender:</span>
                                        <span className="detail-value">{selectedAppointment.gender || (patient && patient.gender) || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">National ID:</span>
                                        <span className="detail-value">{selectedAppointment.nationalId || (patient && patient.nationalId) || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Email:</span>
                                        <span className="detail-value">{selectedAppointment.email || (patient && patient.email) || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Address:</span>
                                        <span className="detail-value">{selectedAppointment.address || (patient && patient.address) || 'N/A'}</span>
                                    </div>
                                    {patient && (
                                        <>
                                            <div className="detail-item">
                                                <span className="detail-label">Date of Birth:</span>
                                                <span className="detail-value">{patient.dateOfBirth}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Age:</span>
                                                <span className="detail-value">{patient.age} years</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Gender:</span>
                                                <span className="detail-value">{patient.gender}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">National ID:</span>
                                                <span className="detail-value">{patient.nationalId}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Email:</span>
                                                <span className="detail-value">{patient.email}</span>
                                            </div>
                                            <div className="detail-item full-width">
                                                <span className="detail-label">Address:</span>
                                                <span className="detail-value">{patient.address}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4><FaCalendarAlt /> Appointment Details</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Date:</span>
                                        <span className="detail-value">{selectedAppointment.appointmentDate} ({getDayName(selectedAppointment.appointmentDate)})</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Time:</span>
                                        <span className="detail-value badge">{selectedAppointment.appointmentTime}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Appointment ID:</span>
                                        <span className="detail-value badge">{selectedAppointment.appointmentId}</span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Reason for Visit:</span>
                                        <span className="detail-value reason-badge">{selectedAppointment.reasonForVisit}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status:</span>
                                        <div
                                            className="detail-status-badge"
                                            style={{
                                                color: statusConfig.color,
                                                backgroundColor: statusConfig.bg,
                                                border: `2px solid ${statusConfig.color}`,
                                                padding: '8px 16px',
                                                borderRadius: '12px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontWeight: '700',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {statusConfig.icon}
                                            <span>{selectedAppointment.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section full-width">
                                <h4><FaShieldAlt /> Insurance & Payment</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Insurance:</span>
                                        <span className="detail-value">
                                            {insuranceProvider ? insuranceProvider.name : 'Self Pay'}
                                        </span>
                                    </div>
                                    {insuranceProvider && (
                                        <div className="detail-item">
                                            <span className="detail-label">Discount:</span>
                                            <span className="detail-value badge success">
                                                {insuranceProvider.discount}{insuranceProvider.discountType === 'percentage' ? '%' : ' EGP'} off
                                            </span>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <span className="detail-label">Final Amount:</span>
                                        <span className="detail-value amount">{selectedAppointment.finalPrice} EGP</span>
                                    </div>
                                </div>
                            </div>

                            {selectedAppointment.notes && (
                                <div className="detail-section full-width">
                                    <h4><FaFileAlt /> Notes</h4>
                                    <div className="notes-box">
                                        {selectedAppointment.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="view-modal-footer">
                        <button className="modal-btn delete-btn" onClick={() => handleDeleteAppointment(selectedAppointment.id)}>
                            <FaTrash /> Delete Appointment
                        </button>
                        <button className="modal-btn print-btn" onClick={handlePrint}>
                            <FaPrint /> Print Details
                        </button>
                        <button className="modal-btn close-btn" onClick={() => setIsViewModalOpen(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Online Request Modal
    const OnlineRequestModal = () => {
        if (!selectedOnlineRequest) return null;

        const formatTime = (time) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const period = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            return `${hour12}:${minutes} ${period}`;
        };

        return (
            <div className={`view-modal-overlay ${isOnlineRequestModalOpen ? 'active' : ''}`} onClick={() => setIsOnlineRequestModalOpen(false)}>
                <div className="view-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="view-modal-header">
                        <h3><FaUserClock /> Online Request Details - {selectedOnlineRequest.requestId}</h3>
                        <button className="close-modal-btn" onClick={() => setIsOnlineRequestModalOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="view-modal-body">
                        <div className="appointment-details-grid">
                            <div className="detail-section">
                                <h4><FaUser /> Patient Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Patient Name:</span>
                                        <span className="detail-value">{selectedOnlineRequest.patientName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Patient ID:</span>
                                        <span className="detail-value badge">{selectedOnlineRequest.patientId}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Phone:</span>
                                        <span className="detail-value">{selectedOnlineRequest.phone}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Email:</span>
                                        <span className="detail-value">{selectedOnlineRequest.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Age:</span>
                                        <span className="detail-value">{selectedOnlineRequest.age} years</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Gender:</span>
                                        <span className="detail-value">{selectedOnlineRequest.gender}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4><FaCalendarAlt /> Appointment Request Details</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Request Date:</span>
                                        <span className="detail-value">{selectedOnlineRequest.submittedDate}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Appointment Date:</span>
                                        <span className="detail-value">{selectedOnlineRequest.appointmentDate} ({getDayName(selectedOnlineRequest.appointmentDate)})</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Time Slot:</span>
                                        <span className="detail-value badge">{formatTime(selectedOnlineRequest.timeSlot)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Request ID:</span>
                                        <span className="detail-value badge">{selectedOnlineRequest.requestId}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Reason for Visit:</span>
                                        <span className="detail-value">{selectedOnlineRequest.reasonForVisit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section full-width">
                                <h4><FaInfoCircle /> Additional Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Address:</span>
                                        <span className="detail-value">{selectedOnlineRequest.address}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Reported Symptoms:</span>
                                        <span className="detail-value">{selectedOnlineRequest.symptoms}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Request Status:</span>
                                        <span className="detail-value">
                                            <span className="status-badge pending">
                                                <FaClock /> {selectedOnlineRequest.status}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedOnlineRequest.notes && (
                                <div className="detail-section full-width">
                                    <h4><FaFileAlt /> Additional Notes</h4>
                                    <div className="notes-box">
                                        {selectedOnlineRequest.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="view-modal-footer">
                        <button className="modal-btn confirm-btn" onClick={() => handleOnlineRequestAction(selectedOnlineRequest.id, 'confirm')}>
                            <FaCheckCircle /> Confirm Request
                        </button>
                        <button className="modal-btn cancel-btn" onClick={() => handleOnlineRequestAction(selectedOnlineRequest.id, 'cancel')}>
                            <FaBan /> Cancel Request
                        </button>
                        <button className="modal-btn close-btn" onClick={() => setIsOnlineRequestModalOpen(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPatientInfo = () => (
        <div className="form-section">
            <div className="form-section-header">
                <h3><FaUser className="section-icon" /> Patient Information</h3>
                <p className="section-subtitle">Search existing patient or add new patient details</p>
            </div>

            {/* Patient Search Bar */}
            <div className="patient-search-container">
                <div className="search-header">
                    <FaSearch className="search-icon" />
                    <h4>Search Existing Patient</h4>
                </div>
                <div className="search-input-group">
                    <div className="search-input-container">
                        <input
                            type="text"
                            value={patientSearchQuery}
                            onChange={(e) => setPatientSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePatientSearch()}
                            placeholder="Search by Patient ID, Phone Number, or Name"
                            className="search-input"
                        />
                        {patientSearchQuery && (
                            <button className="clear-search-btn" onClick={() => setPatientSearchQuery('')}>
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    <button
                        className="search-btn"
                        onClick={handlePatientSearch}
                        disabled={!patientSearchQuery || isPatientSearching}
                    >
                        {isPatientSearching ? 'Searching...' : 'Search Patient'}
                    </button>
                </div>

                {/* Quick Search Results */}
                {filteredPatients.length > 0 && patientSearchQuery && (
                    <div className="quick-search-results">
                        <div className="quick-search-header">
                            <span>Quick Search Results ({filteredPatients.length})</span>
                        </div>
                        {filteredPatients.map(patient => (
                            <div
                                key={patient.id}
                                className="quick-search-result"
                                onClick={() => {
                                    setPatientSearchQuery(patient.patientId);
                                    handlePatientSearch();
                                }}
                            >
                                <div className="patient-result-info">
                                    <FaUser className="patient-icon" />
                                    <div className="patient-details">
                                        <strong>{patient.patientName}</strong>
                                        <span>ID: {patient.patientId} | Phone: {patient.phone}</span>
                                    </div>
                                </div>
                                <button className="select-patient-btn">Select</button>
                            </div>
                        ))}
                    </div>
                )}

                {formData.patientName && (
                    <div className="patient-found-notice">
                        <FaCheck className="check-icon" />
                        <span>Patient <strong>{formData.patientName}</strong> (ID: {formData.patientId}) found and auto-filled.</span>
                        <button className="clear-patient-btn" onClick={clearPatientSearch}>
                            <FaTimes /> Clear
                        </button>
                    </div>
                )}
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label htmlFor="patientName" className="form-label">
                        <span className="label-text">Full Name</span>
                        <span className="required-star">*</span>
                    </label>
                    <div className="input-container">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            id="patientName"
                            name="patientName"
                            value={formData.patientName}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter patient's full name"
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="patientId" className="form-label">
                        <span className="label-text">Patient ID</span>
                    </label>
                    <div className="input-container">
                        <FaIdCard className="input-icon" />
                        <input
                            type="text"
                            id="patientId"
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleInputChange}
                            disabled={formData.patientName && formData.phone}
                            className="form-input disabled"
                            placeholder="Auto-generated"
                        />
                    </div>
                    <div className="input-hint">Auto-generated ID</div>
                </div>

                <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                        <span className="label-text">Phone Number</span>
                        <span className="required-star">*</span>
                    </label>
                    <div className="input-container">
                        <FaPhone className="input-icon" />
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter phone number"
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="form-label">
                        <span className="label-text">Email Address</span>
                    </label>
                    <div className="input-container">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email address"
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="dateOfBirth" className="form-label">
                        <span className="label-text">Date of Birth</span>
                    </label>
                    <div className="input-container">
                        <FaBirthdayCake className="input-icon" />
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="form-input date-input"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="age" className="form-label">
                        <span className="label-text">Age</span>
                    </label>
                    <div className="input-container">
                        <span className="input-icon">#</span>
                        <input
                            type="text"
                            id="age"
                            name="age"
                            value={formData.age}
                            disabled
                            className="form-input disabled"
                            placeholder="Auto-calculated"
                        />
                    </div>
                    <div className="input-hint">Calculated from birth date</div>
                </div>

                <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                        <span className="label-text">Gender</span>
                    </label>
                    <div className="input-container select-container">
                        <FaVenusMars className="input-icon" />
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <span className="select-arrow">▼</span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="nationalId" className="form-label">
                        <span className="label-text">National ID</span>
                    </label>
                    <div className="input-container">
                        <FaIdCard className="input-icon" />
                        <input
                            type="text"
                            id="nationalId"
                            name="nationalId"
                            value={formData.nationalId}
                            onChange={handleInputChange}
                            placeholder="Enter national ID number"
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="address" className="form-label">
                        <span className="label-text">Address</span>
                    </label>
                    <div className="textarea-container">
                        <FaHome className="textarea-icon" />
                        <textarea
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter full address with street, city, and zip code"
                            className="form-textarea"
                            rows="3"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAppointmentDetails = () => (
        <div className="form-section appointment-details-section">
            <div className="form-section-header">
                <h3><FaCalendarAlt className="section-icon" /> Appointment Details</h3>
                <p className="section-subtitle">Select date, time, and reason for visit</p>
            </div>

            <div className="appointment-layout">
                {/* Calendar Section */}
                <div className="calendar-section">
                    <div className="calendar-header">
                        <div className="calendar-navigation">
                            <button className="nav-btn prev-month" onClick={handlePrevMonth}>
                                <FaChevronLeft />
                            </button>
                            <h4>
                                <FaCalendarDay /> {monthNames[currentMonth]} {currentYear}
                            </h4>
                            <button className="nav-btn next-month" onClick={handleNextMonth}>
                                <FaChevronRight />
                            </button>
                        </div>
                        {formData.appointmentDate && (
                            <div className="selected-date-info">
                                <FaCalendarCheck />
                                <span>Selected: {formData.appointmentDate}</span>
                            </div>
                        )}
                    </div>

                    <div className="calendar-grid">
                        {/* Days of week header */}
                        <div className="days-header">
                            {daysOfWeek.map((day, index) => (
                                <div key={index} className="day-header">{day}</div>
                            ))}
                        </div>

                        {/* Calendar dates */}
                        {calendar.map((week, weekIndex) => (
                            <div key={weekIndex} className="calendar-week">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className={`calendar-day ${day ? '' : 'empty'} ${day?.isToday ? 'today' : ''} ${day?.isSelected ? 'selected' : ''} ${day?.isPastDate ? 'past-date' : ''}`}
                                        onClick={() => handleCalendarSelect(day)}
                                        title={day?.isPastDate ? 'Past dates cannot be selected' : day ? `Select ${monthNames[currentMonth]} ${day.day}, ${currentYear}` : ''}
                                    >
                                        {day && (
                                            <>
                                                <span className="day-number">{day.day}</span>
                                                {day.isSelected && <div className="selected-indicator"></div>}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="calendar-legend">
                        <div className="legend-item">
                            <div className="legend-color today"></div>
                            <span>Today</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color selected"></div>
                            <span>Selected</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color available"></div>
                            <span>Available</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color past-date"></div>
                            <span>Unavailable</span>
                        </div>
                    </div>
                </div>

                {/* Time Slots Section */}
                <div className="time-slots-section">
                    <div className="time-slots-header">
                        <h4><FaClock /> Available Time Slots</h4>
                        <div className="selected-date">
                            {formData.appointmentDate ?
                                `${formData.appointmentDate} (${getDayName(formData.appointmentDate)})` :
                                'Select a date first'}
                        </div>
                    </div>

                    <div className="time-slots-grid">
                        {timeSlots.map((time, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`time-slot ${selectedTime === time.value ? 'selected' : ''}`}
                                onClick={() => handleTimeSelect(time)}
                                disabled={!formData.appointmentDate}
                                title={formData.appointmentDate ? `Select ${time.display}` : 'Please select a date first'}
                            >
                                <FaClock className="time-icon" />
                                <span className="time-text">{time.display}</span>
                                {selectedTime === time.value && <FaCheck className="selected-check" />}
                            </button>
                        ))}
                    </div>

                    <div className="appointment-details-form">
                        <div className="form-group full-width">
                            <label htmlFor="reasonForVisit" className="form-label">
                                <span className="label-text">Reason for Visit</span>
                                <span className="required-star">*</span>
                            </label>
                            <div className="input-container select-container">
                                <FaStethoscope className="input-icon" />
                                <select
                                    id="reasonForVisit"
                                    name="reasonForVisit"
                                    value={formData.reasonForVisit}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select reason for visit</option>
                                    {reasonOptions.map((reason, index) => (
                                        <option key={index} value={reason}>{reason}</option>
                                    ))}
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                            <div className="input-hint">Please select the primary reason for your appointment</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMedicalHistory = () => (
        <div className="form-section medical-history-section">
            <div className="form-section-header">
                <h3><FaFileMedical className="section-icon" /> Medical History</h3>
                <p className="section-subtitle">Complete patient's eye & medical background information</p>
            </div>

            <div className="medical-history-notice">
                <FaInfoCircle className="notice-icon" />
                <div className="notice-content">
                    <strong>Important:</strong> Accurate medical history helps in proper diagnosis and treatment planning.
                </div>
            </div>

            {/* 3x2 Grid Layout */}
            <div className="medical-grid-3x2">
                {/* Row 1 */}
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
                                    checked={formData.eyeAllergies.includes(allergy)}
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
                                    checked={formData.chronicDiseases.includes(disease)}
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

                {/* Row 2 */}
                <div className="medical-grid-item full-width">
                    <div className="medical-section-header">
                        <FaPills className="medical-section-icon" />
                        <h4>3. Current Medications</h4>
                    </div>
                    <div className="textarea-container">
                        <FaFileMedical className="textarea-icon" />
                        <textarea
                            id="currentMedications"
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

                {/* Row 3 */}
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
                                    checked={formData.eyeSurgeries.includes(surgery)}
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
                                    checked={formData.familyEyeDiseases.includes(disease)}
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

                {/* Row 4 */}
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
                                    checked={formData.visionSymptoms.includes(symptom)}
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
    );

    const renderInsuranceInfo = () => {
        const selectedProvider = insuranceProviders.find(p => p.id === formData.insuranceProvider);
        const priceInfo = calculatePrice(formData.insuranceProvider, formData.calculatedPrice);

        return (
            <div className="form-section">
                <div className="form-section-header">
                    <h3><FaShieldAlt className="section-icon" /> Insurance Information</h3>
                    <p className="section-subtitle">Provide insurance details to apply discounts</p>
                </div>

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
                                        required={!formData.noInsurance}
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
                                        required={!formData.noInsurance}
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
                                {selectedProvider && (
                                    <div className="input-hint">Provider contact: {selectedProvider.contact}</div>
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
                    </>
                )}
            </div>
        );
    };

    const renderPaymentInfo = () => {
        // Calculate totals based on insurance
        const basePrice = 500;
        const priceInfo = calculatePrice(formData.insuranceProvider, basePrice);
        const insuranceDiscount = priceInfo.discount || 0;
        const totalAmount = priceInfo.finalPrice;
        const amountPaid = parseFloat(paymentData.amountPaid) || 0;
        const remainingBalance = totalAmount - amountPaid;

        const handlePaymentChange = (e) => {
            const { name, value } = e.target;
            setPaymentData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleAdditionalServiceToggle = (service) => {
            setPaymentData(prev => {
                const services = prev.additionalServices.includes(service)
                    ? prev.additionalServices.filter(s => s !== service)
                    : [...prev.additionalServices, service];
                return { ...prev, additionalServices: services };
            });
        };

        return (
            <div className="form-section">
                <div className="form-section-header">
                    <h3><FaPercent className="section-icon" /> Payment & Billing</h3>
                    <p className="section-subtitle">Enter payment details for the appointment</p>
                </div>

                {/* Payment Summary Card */}
                <div className="payment-summary-card">
                    <div className="payment-summary-header">
                        <FaFileMedical className="payment-summary-icon" />
                        <h4>Appointment Cost Breakdown</h4>
                    </div>

                    <div className="payment-breakdown">
                        <div className="payment-row">
                            <span className="payment-label">Base Consultation Fee:</span>
                            <span className="payment-value">{basePrice} EGP</span>
                        </div>

                        {formData.insuranceProvider && !formData.noInsurance && (
                            <div className="payment-row discount-row">
                                <span className="payment-label">
                                    <FaShieldAlt className="inline-icon" />
                                    Insurance Discount:
                                </span>
                                <span className="payment-value discount-value">
                                    -{insuranceDiscount} EGP
                                </span>
                            </div>
                        )}

                        <div className="payment-divider"></div>

                        <div className="payment-row total-row">
                            <span className="payment-label">Total Amount:</span>
                            <span className="payment-value total-value">
                                {totalAmount} EGP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="form-group">
                    <label className="form-label">
                        <FaPercent className="label-icon" />
                        Payment Method
                    </label>
                    <div className="payment-method-box">
                        <div className="payment-method-item selected">
                            <FaPercent className="payment-method-icon" />
                            <div className="payment-method-info">
                                <span className="payment-method-name">Cash Payment</span>
                                <span className="payment-method-desc">Pay in cash at reception</span>
                            </div>
                            <FaCheckCircle className="payment-method-check" />
                        </div>
                    </div>
                    <p className="form-help">Currently, only cash payments are accepted at the clinic</p>
                </div>

                {/* Amount Paid */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            <FaPercent className="label-icon" />
                            Amount Paid by Patient
                        </label>
                        <div className="input-container">
                            <FaPercent className="input-icon" />
                            <input
                                type="number"
                                name="amountPaid"
                                value={paymentData.amountPaid}
                                onChange={handlePaymentChange}
                                placeholder="Enter amount paid"
                                className="form-input"
                                min="0"
                                max={totalAmount}
                                step="0.01"
                            />
                            <span className="input-suffix">EGP</span>
                        </div>
                    </div>
                </div>

                {/* Remaining Balance */}
                <div className="payment-balance-card">
                    <div className="balance-row">
                        <span className="balance-label">Amount Paid:</span>
                        <span className="balance-value paid-value">
                            {amountPaid.toFixed(2)} EGP
                        </span>
                    </div>
                    <div className="balance-row">
                        <span className="balance-label">Remaining Balance:</span>
                        <span className={`balance-value ${remainingBalance > 0 ? 'remaining-value' : 'paid-full-value'}`}>
                            {remainingBalance.toFixed(2)} EGP
                        </span>
                    </div>
                    {remainingBalance > 0 ? (
                        <div className="balance-status pending">
                            <FaExclamationCircle className="status-icon" />
                            <span>Payment Incomplete - Balance Due</span>
                        </div>
                    ) : remainingBalance < 0 ? (
                        <div className="balance-status overpaid">
                            <FaExclamationCircle className="status-icon" />
                            <span>Overpaid - Refund Due: {Math.abs(remainingBalance).toFixed(2)} EGP</span>
                        </div>
                    ) : (
                        <div className="balance-status complete">
                            <FaCheckCircle className="status-icon" />
                            <span>Payment Complete - Fully Paid</span>
                        </div>
                    )}
                </div>

                {/* Payment Receipt Preview */}
                <div className="payment-receipt-preview">
                    <div className="receipt-header">
                        <FaFilePdf className="receipt-icon" />
                        <h4>Payment Receipt Preview</h4>
                    </div>
                    <div className="receipt-content">
                        <div className="receipt-row">
                            <span>Patient Name:</span>
                            <span>{formData.patientName || 'Not entered'}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="receipt-row">
                            <span>Total Amount:</span>
                            <span className="receipt-highlight">{totalAmount} EGP</span>
                        </div>
                        <div className="receipt-row">
                            <span>Amount Paid:</span>
                            <span className="receipt-highlight">{amountPaid.toFixed(2)} EGP</span>
                        </div>
                        <div className="receipt-row">
                            <span>Balance Due:</span>
                            <span className={remainingBalance > 0 ? 'receipt-due' : 'receipt-complete'}>
                                {remainingBalance.toFixed(2)} EGP
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderAllAppointments = () => (
        <div className="appointment-details-container">
            {/* Today's Appointments Only */}
            <div className="today-appointments-card">
                <div className="today-icon">
                    <FaCalendarDay />
                </div>
                <div className="today-content">
                    <div className="today-label">
                        {filterDate ? `Appointments for ${filterDate}` : "Today's Appointments"}
                    </div>
                    <div className="today-value">{totalAppointmentsToday}</div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="appointments-toolbar">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        value={appointmentSearchQuery}
                        onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                        placeholder="Search appointments..."
                        className="search-input"
                    />
                    {appointmentSearchQuery && (
                        <button className="clear-btn" onClick={() => setAppointmentSearchQuery('')}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="filter-group">
                    <div className="filter-item">
                        <FaCalendar className="filter-icon" />
                        <button
                            type="button"
                            className="date-filter date-picker-btn"
                            onClick={() => setShowCalendar(!showCalendar)}
                            title="Click to select a date"
                        >
                            {filterDate ? filterDate : 'Select Date...'}
                        </button>
                        {filterDate && (
                            <button 
                                className="clear-date-btn"
                                onClick={() => {
                                    setFilterDate('');
                                    setShowCalendar(false);
                                }}
                                title="Clear date filter"
                            >
                                ✕
                            </button>
                        )}
                        {showCalendar && (
                            <>
                                <div className="calendar-modal-overlay" onClick={() => setShowCalendar(false)} />
                                <div className="calendar-dropdown">
                                    <Calendar
                                        value={filterDate ? new Date(filterDate) : null}
                                        onChange={(date) => {
                                            if (date) {
                                                const dateString = date.toISOString().split('T')[0];
                                                setFilterDate(dateString);
                                            }
                                            setShowCalendar(false);
                                        }}
                                        calendarType="gregory"
                                        showNeighboringMonth={false}
                                        locale="en-US"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="filter-item">
                        <FaFilter className="filter-icon" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="status-filter"
                        >
                            <option value="">All Status</option>
                            {Object.keys(statusOptions).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="action-btn export-btn" onClick={handleExportCSV}>
                        <FaDownload /> Export
                    </button>
                    <button className="action-btn print-btn" onClick={handlePrint}>
                        <FaPrint /> Print
                    </button>
                    <button className="action-btn clear-btn" onClick={handleClearFilters}>
                        <FaTimes /> Clear
                    </button>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="appointments-table-container">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th className="col-patient-id">
                                <div className="table-header">
                                    <FaIdCard className="header-icon" />
                                    Patient ID
                                </div>
                            </th>
                            <th onClick={() => handleSort('patientName')} className="col-patient">
                                <div className="table-header">
                                    <FaUser className="header-icon" />
                                    Patient
                                    {sortField === 'patientName' && (
                                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                    )}
                                </div>
                            </th>
                            <th className="col-contact">
                                <div className="table-header">
                                    <FaPhone className="header-icon" />
                                    Contact
                                </div>
                            </th>
                            <th onClick={() => handleSort('appointmentDate')} className="col-date">
                                <div className="table-header">
                                    <FaCalendar className="header-icon" />
                                    Date
                                    {sortField === 'appointmentDate' && (
                                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                    )}
                                </div>
                            </th>
                            <th className="col-time">
                                <div className="table-header">
                                    <FaClock className="header-icon" />
                                    Time
                                </div>
                            </th>
                            <th className="col-reason">
                                <div className="table-header">
                                    <FaStethoscope className="header-icon" />
                                    Reason
                                </div>
                            </th>
                            <th className="col-insurance">
                                <div className="table-header">
                                    <FaShieldAlt className="header-icon" />
                                    Insurance
                                </div>
                            </th>
                            <th onClick={() => handleSort('finalPrice')} className="col-amount">
                                <div className="table-header">
                                    <FaPercent className="header-icon" />
                                    Amount
                                    {sortField === 'finalPrice' && (
                                        sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                    )}
                                </div>
                            </th>
                            <th className="col-status">
                                <div className="table-header">
                                    <FaInfoCircle className="header-icon" />
                                    Status
                                </div>
                            </th>
                            <th className="col-actions">
                                <div className="table-header">
                                    <FaEye className="header-icon" />
                                    Actions
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map(appointment => {
                                const statusConfig = statusOptions[appointment.status] || statusOptions.Pending;
                                const insuranceProvider = insuranceProviders.find(p => p.id === appointment.insuranceProvider);

                                return (
                                    <tr key={appointment.id} className="appointment-row">
                                        <td className="col-patient-id">
                                            <div className="patient-id-cell">
                                                <div className="patient-id">{appointment.patientId}</div>
                                            </div>
                                        </td>
                                        <td className="col-patient">
                                            <div className="patient-cell">
                                                <div className="patient-name">{appointment.patientName}</div>
                                            </div>
                                        </td>
                                        <td className="col-contact">
                                            <div className="contact-cell">
                                                <div className="phone">{appointment.phone}</div>
                                            </div>
                                        </td>
                                        <td className="date-cell">
                                            {appointment.appointmentDate}
                                        </td>
                                        <td className="time-cell">
                                            {appointment.appointmentTime}
                                        </td>
                                        <td className="col-reason">
                                            <div className="reason-cell">
                                                <span className="reason-text">{appointment.reasonForVisit}</span>
                                            </div>
                                        </td>
                                        <td className="col-insurance">
                                            <div className="insurance-cell">
                                                {insuranceProvider ? (
                                                    <>
                                                        <div className="provider">{insuranceProvider.name.split('(')[0].trim()}</div>
                                                        <div className="discount">{insuranceProvider.discount}% off</div>
                                                    </>
                                                ) : (
                                                    <span className="no-insurance">Self Pay</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="col-amount">
                                            <div className="amount-cell">
                                                <div className="final-price">{appointment.finalPrice} EGP</div>
                                            </div>
                                        </td>
                                        <td className="col-status">
                                            <select
                                                className="status-dropdown"
                                                value={appointment.status}
                                                onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                                                style={{
                                                    color: statusConfig.color,
                                                    backgroundColor: statusConfig.bg,
                                                    border: `2px solid ${statusConfig.color}`
                                                }}
                                            >
                                                <option value="Pending">⏳ Pending</option>
                                                <option value="Confirmed">✓ Confirmed</option>
                                                <option value="Upcoming">→ Upcoming</option>
                                                <option value="Completed">✓ Completed</option>
                                                <option value="Cancelled">✕ Cancelled</option>
                                                <option value="No-Show">⚠ No-Show</option>
                                            </select>
                                        </td>
                                        <td className="col-actions">
                                            <div className="action-cell">
                                                <button
                                                    className="action-icon-btn view-btn"
                                                    title="View Details"
                                                    onClick={() => handleViewAppointment(appointment)}
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="10" className="no-data">
                                    <FaCalendar className="no-data-icon" />
                                    <div className="no-data-text">No appointments found</div>
                                    <div className="no-data-subtext">Try changing your search or filters</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="table-footer">
                <div className="footer-info">
                    Showing <strong>{filteredAppointments.length}</strong> of <strong>{existingAppointments.length}</strong> appointments
                    {filterDate && ` on ${filterDate}`}
                    {filterStatus && ` with status: ${filterStatus}`}
                </div>
            </div>
        </div>
    );

    // Filter and sort online requests
    const filteredAndSortedRequests = useMemo(() => {
        let filtered = [...onlineRequests];

        // Search filter
        if (requestSearchQuery) {
            const query = requestSearchQuery.toLowerCase();
            filtered = filtered.filter(req => 
                req.patientName.toLowerCase().includes(query) ||
                req.patientId.toLowerCase().includes(query) ||
                req.requestId.toLowerCase().includes(query) ||
                req.phone.includes(query) ||
                (req.email && req.email.toLowerCase().includes(query))
            );
        }

        // Date filter
        if (requestFilterDate) {
            filtered = filtered.filter(req => req.appointmentDate === requestFilterDate);
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue = a[requestSortField];
            let bValue = b[requestSortField];

            if (requestSortField === 'appointmentDate' || requestSortField === 'submittedDate') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            } else if (requestSortField === 'timeSlot') {
                aValue = aValue.replace(':', '');
                bValue = bValue.replace(':', '');
            }

            if (aValue < bValue) return requestSortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return requestSortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [onlineRequests, requestSearchQuery, requestFilterDate, requestSortField, requestSortDirection]);

    // Calculate request statistics
    const requestStats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const weekFromNowStr = weekFromNow.toISOString().split('T')[0];

        return {
            total: onlineRequests.length,
            today: onlineRequests.filter(req => req.appointmentDate === today).length,
            thisWeek: onlineRequests.filter(req => req.appointmentDate <= weekFromNowStr && req.appointmentDate >= today).length,
            urgent: onlineRequests.filter(req => {
                const submittedDate = new Date(req.submittedDate);
                const daysSinceSubmitted = Math.floor((new Date() - submittedDate) / (1000 * 60 * 60 * 24));
                return daysSinceSubmitted >= 2;
            }).length
        };
    }, [onlineRequests]);

    const handleRequestSort = (field) => {
        if (requestSortField === field) {
            setRequestSortDirection(requestSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setRequestSortField(field);
            setRequestSortDirection('asc');
        }
    };

    const renderOnlineRequests = () => (
        <div className="online-requests-container">
            <div className="requests-header">
                <div className="header-with-badge">
                    <div>
                        <h2><FaUserInjured className="header-icon" /> Online Appointment Requests</h2>
                        <p className="header-subtitle">Manage upcoming appointment requests from patients</p>
                    </div>
                    <div className="total-pending-badge">
                        <FaClock className="badge-icon" />
                        <span className="badge-value">{requestStats.total}</span>
                        <span className="badge-label">Total Pending</span>
                    </div>
                </div>
            </div>

            {/* Search, Filter and View Toggle Toolbar */}
            <div className="requests-toolbar">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        value={requestSearchQuery}
                        onChange={(e) => setRequestSearchQuery(e.target.value)}
                        placeholder="Search by name, ID, phone, or email..."
                        className="search-input"
                    />
                    {requestSearchQuery && (
                        <button className="clear-btn" onClick={() => setRequestSearchQuery('')}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="filter-group">
                    <div className="filter-item">
                        <FaCalendar className="filter-icon" />
                        <button
                            type="button"
                            className="date-filter date-picker-btn"
                            onClick={() => setShowRequestCalendar(!showRequestCalendar)}
                            title="Click to select a date"
                        >
                            {requestFilterDate ? requestFilterDate : 'Select Date...'}
                        </button>
                        {requestFilterDate && (
                            <button 
                                className="clear-date-btn"
                                onClick={() => {
                                    setRequestFilterDate('');
                                    setShowRequestCalendar(false);
                                }}
                                title="Clear date filter"
                            >
                                ✕
                            </button>
                        )}
                        {showRequestCalendar && (
                            <>
                                <div className="calendar-modal-overlay" onClick={() => setShowRequestCalendar(false)} />
                                <div className="calendar-dropdown">
                                    <Calendar
                                        value={requestFilterDate ? new Date(requestFilterDate) : null}
                                        onChange={(date) => {
                                            if (date) {
                                                const dateString = date.toISOString().split('T')[0];
                                                setRequestFilterDate(dateString);
                                            }
                                            setShowRequestCalendar(false);
                                        }}
                                        calendarType="gregory"
                                        showNeighboringMonth={false}
                                        locale="en-US"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="sort-item">
                        <FaSort className="filter-icon" />
                        <select
                            value={requestSortField}
                            onChange={(e) => setRequestSortField(e.target.value)}
                            className="sort-select"
                        >
                            <option value="submittedDate">Sort by Submit Date</option>
                            <option value="appointmentDate">Sort by Appointment Date</option>
                            <option value="timeSlot">Sort by Time</option>
                            <option value="patientName">Sort by Name</option>
                        </select>
                    </div>

                    <button 
                        className="sort-direction-btn"
                        onClick={() => setRequestSortDirection(requestSortDirection === 'asc' ? 'desc' : 'asc')}
                        title={`Sort ${requestSortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                        {requestSortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />}
                    </button>
                </div>

                <div className="view-toggle">
                    <button 
                        className={`view-btn ${requestViewMode === 'card' ? 'active' : ''}`}
                        onClick={() => setRequestViewMode('card')}
                        title="Card View"
                    >
                        <FaList /> Cards
                    </button>
                    <button 
                        className={`view-btn ${requestViewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setRequestViewMode('table')}
                        title="Table View"
                    >
                        <FaTable /> Table
                    </button>
                </div>
            </div>

            {/* Results count */}
            <div className="requests-results-info">
                <span>Showing <strong>{filteredAndSortedRequests.length}</strong> of <strong>{onlineRequests.length}</strong> requests</span>
                {(requestSearchQuery || requestFilterDate) && (
                    <button className="clear-all-filters-btn" onClick={() => { setRequestSearchQuery(''); setRequestFilterDate(''); }}>
                        <FaTimes /> Clear All Filters
                    </button>
                )}
            </div>

            {/* Card View */}
            {requestViewMode === 'card' && (
                <div className="requests-grid">
                    {filteredAndSortedRequests.map(request => {
                    const formatTime = (time) => {
                        if (!time) return 'Not set';
                        const [hours, minutes] = time.split(':');
                        const hour = parseInt(hours);
                        const period = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                        return `${hour12}:${minutes} ${period}`;
                    };

                    const isUrgent = () => {
                        const submittedDate = new Date(request.submittedDate);
                        const daysSinceSubmitted = Math.floor((new Date() - submittedDate) / (1000 * 60 * 60 * 24));
                        return daysSinceSubmitted >= 2;
                    };

                    return (
                        <div key={request.id} className={`request-card ${isUrgent() ? 'urgent' : ''}`}>
                            <div className="request-card-header">
                                <div className="request-id-badge">
                                    <FaIdCard className="request-id-icon" /> 
                                    <span className="request-id-text">Request ID: {request.requestId}</span>
                                </div>
                                <div className="request-submitted-date">
                                    <FaCalendarAlt className="submitted-icon" />
                                    <span>Submitted: {request.submittedDate}</span>
                                </div>
                            </div>

                            <div className="request-card-body">
                                <div className="request-appointment-info">
                                    <h4 className="section-title">
                                        <FaCalendarCheck className="section-icon" />
                                        Requested Appointment
                                    </h4>
                                    <div className="appointment-details-row">
                                        <div className="appointment-detail-item">
                                            <FaCalendar className="detail-icon" />
                                            <div className="detail-content">
                                                <span className="detail-label">Date</span>
                                                <span className="detail-value">{request.appointmentDate}</span>
                                                <span className="detail-extra">({getDayName(request.appointmentDate)})</span>
                                            </div>
                                        </div>
                                        <div className="appointment-detail-item">
                                            <FaClock className="detail-icon" />
                                            <div className="detail-content">
                                                <span className="detail-label">Time</span>
                                                <span className="detail-value highlight">{formatTime(request.timeSlot)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="request-patient-info">
                                    <h4 className="section-title">
                                        <FaUser className="section-icon" />
                                        Patient Information
                                    </h4>
                                    <div className="patient-info-grid">
                                        <div className="patient-info-item">
                                            <FaUser className="info-icon" />
                                            <div className="info-content">
                                                <div className="info-label">Name</div>
                                                <div className="info-value">{request.patientName}</div>
                                            </div>
                                        </div>

                                        <div className="patient-info-item">
                                            <FaPhone className="info-icon" />
                                            <div className="info-content">
                                                <div className="info-label">Phone</div>
                                                <div className="info-value">{request.phone}</div>
                                            </div>
                                        </div>

                                        <div className="patient-info-item">
                                            <FaEnvelope className="info-icon" />
                                            <div className="info-content">
                                                <div className="info-label">Email</div>
                                                <div className="info-value">{request.email || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div className="patient-info-item full-width">
                                            <FaStethoscope className="info-icon" />
                                            <div className="info-content">
                                                <div className="info-label">Reason for Visit</div>
                                                <div className="info-value reason-value">{request.reasonForVisit}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="request-card-actions">
                                    <button
                                        className="request-action-btn confirm-btn"
                                        onClick={() => handleOnlineRequestAction(request.id, 'confirm')}
                                        title="Confirm and add to appointments"
                                    >
                                        <FaCheckCircle className="btn-icon" /> 
                                        <span className="btn-text">Confirm Request</span>
                                    </button>
                                    <button
                                        className="request-action-btn cancel-btn"
                                        onClick={() => handleOnlineRequestAction(request.id, 'cancel')}
                                        title="Reject this request"
                                    >
                                        <FaBan className="btn-icon" /> 
                                        <span className="btn-text">Reject</span>
                                    </button>
                                    <button
                                        className="request-action-btn details-btn"
                                        onClick={() => handleViewOnlineRequest(request)}
                                        title="View full details"
                                    >
                                        <FaExternalLinkAlt className="btn-icon" /> 
                                        <span className="btn-text">Full Details</span>
                                    </button>
                                </div>
                            </div>

                            <div className="request-card-footer">
                                <div className="request-status">
                                    <span className="status-badge pending">
                                        <FaClock /> {request.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredAndSortedRequests.length === 0 && onlineRequests.length > 0 && (
                    <div className="no-requests-message">
                        <FaSearch className="no-requests-icon" />
                        <h3>No Matching Requests</h3>
                        <p>Try adjusting your search or filter criteria.</p>
                    </div>
                )}

                {onlineRequests.length === 0 && (
                    <div className="no-requests-message">
                        <FaCalendarCheck className="no-requests-icon" />
                        <h3>No Pending Requests</h3>
                        <p>All online appointment requests have been processed.</p>
                    </div>
                )}
            </div>
            )}

            {/* Table View */}
            {requestViewMode === 'table' && (
                <div className="requests-table-container">
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleRequestSort('requestId')}>
                                    <div className="table-header">
                                        <FaIdCard className="header-icon" />
                                        Appointment ID
                                        {requestSortField === 'requestId' && (
                                            requestSortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleRequestSort('submittedDate')}>
                                    <div className="table-header">
                                        <FaCalendarAlt className="header-icon" />
                                        Submitted
                                        {requestSortField === 'submittedDate' && (
                                            requestSortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleRequestSort('patientName')}>
                                    <div className="table-header">
                                        <FaUser className="header-icon" />
                                        Patient
                                        {requestSortField === 'patientName' && (
                                            requestSortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                        )}
                                    </div>
                                </th>
                                <th>
                                    <div className="table-header">
                                        <FaPhone className="header-icon" />
                                        Contact
                                    </div>
                                </th>
                                <th onClick={() => handleRequestSort('appointmentDate')}>
                                    <div className="table-header">
                                        <FaCalendar className="header-icon" />
                                        Appointment Date
                                        {requestSortField === 'appointmentDate' && (
                                            requestSortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleRequestSort('timeSlot')}>
                                    <div className="table-header">
                                        <FaClock className="header-icon" />
                                        Time
                                        {requestSortField === 'timeSlot' && (
                                            requestSortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                                        )}
                                    </div>
                                </th>
                                <th>
                                    <div className="table-header">
                                        <FaStethoscope className="header-icon" />
                                        Reason
                                    </div>
                                </th>
                                <th>
                                    <div className="table-header">
                                        <FaInfoCircle className="header-icon" />
                                        Status
                                    </div>
                                </th>
                                <th>
                                    <div className="table-header">
                                        <FaCogs className="header-icon" />
                                        Actions
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedRequests.map(request => {
                                const formatTime = (time) => {
                                    const [hours, minutes] = time.split(':');
                                    const hour = parseInt(hours);
                                    const period = hour >= 12 ? 'PM' : 'AM';
                                    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                    return `${hour12}:${minutes} ${period}`;
                                };

                                const isUrgent = () => {
                                    const submittedDate = new Date(request.submittedDate);
                                    const daysSinceSubmitted = Math.floor((new Date() - submittedDate) / (1000 * 60 * 60 * 24));
                                    return daysSinceSubmitted >= 2;
                                };

                                return (
                                    <tr key={request.id} className={isUrgent() ? 'urgent-row' : ''}>
                                        <td>
                                            <div className="table-cell-content">
                                                <span className="request-id-cell">{request.requestId}</span>
                                                {isUrgent() && <FaExclamationCircle className="urgent-icon-small" title="Urgent: 2+ days waiting" />}
                                            </div>
                                        </td>
                                        <td>{request.submittedDate}</td>
                                        <td>
                                            <div className="patient-cell">
                                                <div className="patient-name">{request.patientName}</div>
                                                <div className="patient-id-small">{request.patientId}</div>
                                                <div className="patient-details-small">{request.age}y, {request.gender}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-cell">
                                                <div className="phone-cell"><FaPhone className="cell-icon" /> {request.phone}</div>
                                                {request.email && <div className="email-cell"><FaEnvelope className="cell-icon" /> {request.email}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                {request.appointmentDate}
                                                <span className="day-name">({getDayName(request.appointmentDate)})</span>
                                            </div>
                                        </td>
                                        <td><span className="time-badge">{formatTime(request.timeSlot)}</span></td>
                                        <td>
                                            <div className="reason-cell">
                                                <strong>{request.reasonForVisit}</strong>
                                                {request.symptoms && <div className="symptoms-small">{request.symptoms}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="status-badge pending-small">
                                                <FaClock /> {request.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="table-action-btn confirm-small"
                                                    onClick={() => handleOnlineRequestAction(request.id, 'confirm')}
                                                    title="Confirm"
                                                >
                                                    <FaCheckCircle />
                                                </button>
                                                <button
                                                    className="table-action-btn cancel-small"
                                                    onClick={() => handleOnlineRequestAction(request.id, 'cancel')}
                                                    title="Reject"
                                                >
                                                    <FaBan />
                                                </button>
                                                <button
                                                    className="table-action-btn details-small"
                                                    onClick={() => handleViewOnlineRequest(request)}
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredAndSortedRequests.length === 0 && onlineRequests.length > 0 && (
                        <div className="no-requests-message">
                            <FaSearch className="no-requests-icon" />
                            <h3>No Matching Requests</h3>
                            <p>Try adjusting your search or filter criteria.</p>
                        </div>
                    )}

                    {onlineRequests.length === 0 && (
                        <div className="no-requests-message">
                            <FaCalendarCheck className="no-requests-icon" />
                            <h3>No Pending Requests</h3>
                            <p>All online appointment requests have been processed.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderFormContent = () => {
        switch (currentStep) {
            case 1:
                return renderPatientInfo();
            case 2:
                return renderAppointmentDetails();
            case 3:
                return renderMedicalHistory();
            case 4:
                return renderInsuranceInfo();
            case 5:
                return renderPaymentInfo();
            default:
                return renderPatientInfo();
        }
    };

    const stepLabels = [
        { id: 1, label: 'Patient Info', icon: <FaUser />, description: 'Basic patient information' },
        { id: 2, label: 'Appointment Details', icon: <FaCalendarAlt />, description: 'Date, time & reason' },
        { id: 3, label: 'Medical History', icon: <FaFileMedical />, description: 'Health background' },
        { id: 4, label: 'Insurance Info', icon: <FaShieldAlt />, description: 'Insurance & coverage' },
        { id: 5, label: 'Payment', icon: <FaPercent />, description: 'Payment & billing' }
    ];

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'book':
                return (
                    <div className="right-form">
                        <div className="form-card">
                            {/* Removed duplicate header - only using section headers */}
                            <form onSubmit={handleSubmit}>
                                <div className="form-content">
                                    {renderFormContent()}
                                </div>

                                <div className="form-navigation">
                                    <div className="navigation-info">
                                        <span className="step-indicator">Step {currentStep} of 5</span>
                                        <span className="form-status">
                                            {currentStep === 1 && 'Patient Information'}
                                            {currentStep === 2 && 'Appointment Details'}
                                            {currentStep === 3 && 'Medical History'}
                                            {currentStep === 4 && 'Insurance Information'}
                                            {currentStep === 5 && 'Payment & Billing'}
                                        </span>
                                    </div>
                                    <div className="navigation-buttons">
                                        {currentStep > 1 && (
                                            <button type="button" className="nav-btn prev-btn" onClick={handlePrevStep}>
                                                <FaArrowLeft className="nav-icon" />
                                                <span className="nav-text">Previous</span>
                                            </button>
                                        )}

                                        {currentStep < 5 ? (
                                            <button type="button" className="nav-btn next-btn" onClick={handleNextStep}>
                                                <span className="nav-text">Next</span>
                                                <FaArrowRight className="nav-icon" />
                                            </button>
                                        ) : (
                                            <button type="submit" className="nav-btn submit-btn">
                                                <FaCheck className="nav-icon" />
                                                <span className="nav-text">Book Appointment</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 'all':
                return renderAllAppointments();
            case 'requests':
                return renderOnlineRequests();
            default:
                return (
                    <div className="right-form">
                        <div className="form-card">
                            <div className="form-header">
                                <h2 className="form-title">
                                    <FaCalendarAlt /> Book Appointment
                                </h2>
                                <p className="form-description">
                                    Start by selecting "Book Appointment" tab or "All Appointments" to view existing bookings
                                </p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <div className="appointment-booking-container">
                <div className="medical-dashboard">
                    {/* Top Navigation Tabs */}
                    <div className="top-nav-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
                            onClick={() => setActiveTab('book')}
                        >
                            <FaUserPlus className="tab-icon" />
                            <span className="tab-text">Book Appointment</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            <FaCalendarCheck className="tab-icon" />
                            <span className="tab-text">Appointment Details</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('requests')}
                        >
                            <FaFileMedical className="tab-icon" />
                            <span className="tab-text">Online Requests</span>
                        </button>
                    </div>

                    <div className="main-container">
                        {activeTab === 'book' ? (
                            <>
                                {/* Left Side Stepper (only for Book Appointment) */}
                                <div className="left-stepper">
                                    <div className="stepper-header">
                                        <h3 className="stepper-title">Appointment Booking</h3>
                                    </div>

                                    <div className="stepper-vertical">
                                        {stepLabels.map((step, index) => (
                                            <div key={step.id} className="stepper-step">
                                                <button
                                                    className={`step-btn ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                                                    onClick={() => handleStepChange(step.id)}
                                                >
                                                    <div className="step-number-container">
                                                        <span className="step-number">
                                                            {currentStep > step.id ? <FaCheck /> : step.id}
                                                        </span>
                                                    </div>
                                                    <div className="step-content">
                                                        <span className="step-icon">{step.icon}</span>
                                                        <div className="step-text">
                                                            <span className="step-label">{step.label}</span>
                                                            <span className="step-description">{step.description}</span>
                                                        </div>
                                                    </div>
                                                </button>
                                                {index < stepLabels.length - 1 && (
                                                    <div className={`step-connector ${currentStep > step.id ? 'active' : ''}`}></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="stepper-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${(currentStep - 1) * 25}%` }}
                                            ></div>
                                        </div>
                                        <div className="progress-text">
                                            Progress: {Math.round(((currentStep - 1) / 4) * 100)}%
                                        </div>
                                    </div>

                                    <div className="stepper-notes">
                                        <FaInfoCircle className="notes-icon" />
                                        <p>Please ensure all information is accurate before submitting.</p>
                                    </div>
                                </div>

                                {/* Right Side Form */}
                                {renderActiveTabContent()}
                            </>
                        ) : (
                            // Full width for other tabs
                            <div className="full-width-container">
                                {renderActiveTabContent()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Appointment Modal */}
            <ViewAppointmentModal />

            {/* Online Request Modal */}
            <OnlineRequestModal />
        </>
    );
};

export default AppointmentBooking;