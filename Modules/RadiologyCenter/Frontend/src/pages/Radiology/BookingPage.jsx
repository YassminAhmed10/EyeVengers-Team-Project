// src/pages/Radiology/BookAppointmentPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendar, FaClock, FaStethoscope, FaCheckCircle, FaArrowRight, 
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaVenusMars, FaBirthdayCake,
  FaHome, FaFileMedical, FaHospitalUser, FaRegCalendarCheck, FaRegClock,
  FaChevronLeft, FaChevronRight, FaTimes, FaSearch, FaFilter, FaTag,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5201";
const RADIOLOGY_API = import.meta.env.VITE_RADIOLOGY_API || "http://localhost:5202/api";

// Import images
import mriImage from "../../assets/MRI-1-768x576.jpg";
import ctImage from "../../assets/ct scan.webp";
import ultrasoundImage from "../../assets/Ultrasound.jpg";
import xrayImage from "../../assets/X_Ray.jpg";
import octImage from "../../assets/OCTttest.webp";
import visualFieldImage from "../../assets/Visual-field-test.jpg";
import cornealTopographyImage from "../../assets/Corneal Topography.jpg";
import specularMicroscopyImage from "../../assets/Specular Microscopy.jpg";
import cbcImage from "../../assets/CBCtest.avif";
import bloodSugarImage from "../../assets/bloodSuger.jpg";
import ergImage from "../../assets/Electroretinography (ERG).webp";
import eogImage from "../../assets/Electrooculography (EOG).webp";
import geneticImage from "../../assets/Genetic Testing.png";

const ALL_SERVICES = [
  { id: 1, name: 'CBC', nameAr: 'صورة دم كاملة', specialty: 'Complete Blood Count', specialtyAr: 'صورة دم كاملة', desc: 'Full blood count for anemia, infection detection', range: '250 LE', image: cbcImage, duration: 15, color: '#ef4444' },
  { id: 2, name: 'Blood Sugar', nameAr: 'سكر الدم', specialty: 'Glucose Testing', specialtyAr: 'اختبار الجلوكوز', desc: 'Fasting and random blood sugar testing', range: '120 LE', image: bloodSugarImage, duration: 10, color: '#f59e0b' },
  { id: 3, name: 'CT Scan', nameAr: 'الأشعة المقطعية', specialty: 'Computed Tomography', specialtyAr: 'التصوير المقطعي المحوسب', desc: '128-slice CT scanner for chest, abdomen, head', range: '1800 LE', image: ctImage, duration: 45, color: '#00b8a8' },
  { id: 4, name: 'MRI Scan', nameAr: 'الرنين المغناطيسي', specialty: 'Magnetic Resonance Imaging', specialtyAr: 'التصوير بالرنين المغناطيسي', desc: '3 Tesla high-resolution MRI', range: '3500 LE', image: mriImage, duration: 60, color: '#1f6bff' },
  { id: 5, name: 'X-Ray', nameAr: 'الأشعة السينية', specialty: 'Digital Radiography', specialtyAr: 'التصوير الشعاعي الرقمي', desc: 'Digital X-ray for bones, chest, joints', range: '350 LE', image: xrayImage, duration: 20, color: '#28a745' },
  { id: 6, name: 'OCT', nameAr: 'التماسك البصري', specialty: 'Optical Coherence Tomography', specialtyAr: 'التصوير المقطعي التوافقي البصري', desc: 'High-resolution retina imaging', range: '900 LE', image: octImage, duration: 20, color: '#8b5cf6' },
  { id: 7, name: 'Visual Field Test', nameAr: 'اختبار المجال البصري', specialty: 'Perimetry', specialtyAr: 'قياس المحيط', desc: 'Measure peripheral and central vision', range: '800 LE', image: visualFieldImage, duration: 25, color: '#8b5cf6' },
  { id: 8, name: 'Ultrasound', nameAr: 'الموجات فوق الصوتية', specialty: 'Ocular Ultrasound', specialtyAr: 'الموجات فوق الصوتية للعين', desc: 'Evaluate internal eye structures', range: '600 LE', image: ultrasoundImage, duration: 30, color: '#14b8a6' },
  { id: 9, name: 'Corneal Topography', nameAr: 'تخطيط القرنية', specialty: 'Corneal Mapping', specialtyAr: 'رسم خرائط القرنية', desc: '3D map of corneal surface', range: '1000 LE', image: cornealTopographyImage, duration: 20, color: '#06b6d4' },
  { id: 10, name: 'Specular Microscopy', nameAr: 'المجهر المرآوي', specialty: 'Endothelial Cell Count', specialtyAr: 'عدد خلايا البطانة', desc: 'Corneal endothelial health', range: '950 LE', image: specularMicroscopyImage, duration: 15, color: '#06b6d4' },
  { id: 11, name: 'ERG', nameAr: 'تخطيط كهربية الشبكية', specialty: 'Electroretinography', specialtyAr: 'تخطيط كهربية الشبكية', desc: 'Retinal function test', range: '3000 LE', image: ergImage, duration: 45, color: '#f97316' },
  { id: 12, name: 'EOG', nameAr: 'تخطيط كهربية العين', specialty: 'Electrooculography', specialtyAr: 'تخطيط كهربية العين', desc: 'Eye movement test', range: '2500 LE', image: eogImage, duration: 40, color: '#f97316' },
  { id: 13, name: 'Genetic Testing', nameAr: 'الاختبارات الجينية', specialty: 'Ocular Genetics', specialtyAr: 'علم الوراثة العينية', desc: 'Inherited eye disease markers', range: '7000 LE', image: geneticImage, duration: 30, color: '#a855f7' },
];

// Helper functions
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const generateBookingReference = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  return letters[Math.floor(Math.random() * 26)] + 
         letters[Math.floor(Math.random() * 26)] + 
         numbers[Math.floor(Math.random() * 10)] +
         numbers[Math.floor(Math.random() * 10)] +
         numbers[Math.floor(Math.random() * 10)] +
         numbers[Math.floor(Math.random() * 10)];
};

// Horizontal Scrolling Test Card Component
const TestCard = ({ test, isSelected, onSelect, lang }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(test)}
      style={{
        minWidth: '200px',
        maxWidth: '200px',
        background: isSelected ? `linear-gradient(135deg, ${test.color}, ${test.color}dd)` : 'white',
        borderRadius: '16px',
        padding: '12px',
        cursor: 'pointer',
        border: isSelected ? `2px solid ${test.color}` : '1px solid #e2e8f0',
        boxShadow: isSelected ? `0 8px 24px ${test.color}30` : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: test.color,
          borderRadius: '50%',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1
        }}>
          <FaCheckCircle size={14} color="white" />
        </div>
      )}
      <div style={{
        width: '100%',
        height: '120px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        <img 
          src={test.image} 
          alt={test.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      <h4 style={{
        fontSize: '14px',
        fontWeight: 700,
        color: isSelected ? 'white' : '#1e3a5f',
        marginBottom: '4px',
        textAlign: 'center'
      }}>
        {lang === 'ar' ? test.nameAr : test.name}
      </h4>
      <p style={{
        fontSize: '10px',
        color: isSelected ? 'rgba(255,255,255,0.8)' : '#64748b',
        marginBottom: '6px',
        textAlign: 'center'
      }}>
        {lang === 'ar' ? test.specialtyAr : test.specialty}
      </p>
      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        color: isSelected ? 'white' : test.color,
        marginBottom: '4px',
        textAlign: 'center'
      }}>
        {test.range}
      </div>
      <div style={{
        fontSize: '9px',
        color: isSelected ? 'rgba(255,255,255,0.7)' : '#94a3b8',
        textAlign: 'center'
      }}>
        ⏱ {test.duration} min
      </div>
    </motion.div>
  );
};

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state (from clinic system or service selection)
  const selectedTestFromState = location.state?.selectedTest || null;
  const fromClinic = location.state?.fromClinic || false;
  const clinicPatientData = location.state?.patientData || null;
  
  const [lang, setLang] = useState(() => document.documentElement.lang === "en" ? "en" : "ar");
  const [selectedService, setSelectedService] = useState(selectedTestFromState || null);
  const [allServices] = useState(ALL_SERVICES);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingReference] = useState(generateBookingReference());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const scrollContainerRef = useRef(null);
  
  // Patient data from FHIR/Clinic System or localStorage
  const [patientInfo, setPatientInfo] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    age: null,
    nationalId: '',
    address: '',
    appointmentId: ''
  });

  // Load patient data
  useEffect(() => {
    const loadPatientData = () => {
      // Priority 1: FHIR data from clinic system
      if (clinicPatientData && fromClinic) {
        console.log('[Radiology] Loading patient data from FHIR/Clinic System:', clinicPatientData);
        setPatientInfo({
          id: clinicPatientData.patientId || clinicPatientData.id || '',
          name: clinicPatientData.name || clinicPatientData.patientName || '',
          phone: clinicPatientData.phone || clinicPatientData.contactNumber || '',
          email: clinicPatientData.email || '',
          gender: clinicPatientData.gender || '',
          dateOfBirth: clinicPatientData.birthDate || clinicPatientData.dateOfBirth || '',
          age: clinicPatientData.age || calculateAge(clinicPatientData.birthDate || clinicPatientData.dateOfBirth),
          nationalId: clinicPatientData.nationalId || '',
          address: clinicPatientData.address || '',
          appointmentId: clinicPatientData.appointmentId || ''
        });
        return;
      }
      
      // Priority 2: localStorage
      const storedPatient = {
        id: localStorage.getItem('radiologyPatientId') || '',
        name: localStorage.getItem('radiologyPatientName') || '',
        phone: localStorage.getItem('radiologyPatientPhone') || '',
        email: localStorage.getItem('radiologyPatientEmail') || '',
        gender: localStorage.getItem('radiologyPatientGender') || '',
        dateOfBirth: localStorage.getItem('radiologyPatientDateOfBirth') || '',
        nationalId: localStorage.getItem('radiologyPatientNationalId') || '',
        address: localStorage.getItem('radiologyPatientAddress') || ''
      };
      setPatientInfo({
        ...storedPatient,
        age: storedPatient.dateOfBirth ? calculateAge(storedPatient.dateOfBirth) : null,
        appointmentId: ''
      });
    };
    
    loadPatientData();
  }, [clinicPatientData, fromClinic]);

  // Generate time slots
  const generateTimeSlots = useCallback(() => {
    if (!selectedDate) return;
    const slots = [];
    const startHour = 9;
    const endHour = 20;
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > 0) continue;
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    setTimeSlots(slots);
    setSelectedTime('');
  }, [selectedDate]);

  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate, generateTimeSlots]);

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isToday = (date) => date && date.toDateString() === new Date().toDateString();
  const isSelected = (date) => selectedDate && date && date.toDateString() === selectedDate.toDateString();
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date && date < today;
  };

  const changeMonth = (increment) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
    setSelectedDate(null);
    setSelectedTime('');
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handleSelectTest = (test) => {
    setSelectedService(test);
    // Update URL
    navigate(`?serviceId=${test.id}&serviceName=${encodeURIComponent(test.name)}`, { replace: true });
  };

  const handleConfirmBooking = async () => {
    if (!selectedService) { setError('Please select a radiology service'); return; }
    if (!selectedDate) { setError('Please select a date'); return; }
    if (!selectedTime) { setError('Please select a time slot'); return; }

    setBooking(true);
    setError('');

    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const bookingData = {
      bookingReference,
      patientId: patientInfo.id || `RAD-${Date.now()}`,
      patientName: patientInfo.name,
      patientPhone: patientInfo.phone,
      patientEmail: patientInfo.email,
      patientGender: patientInfo.gender,
      patientDateOfBirth: patientInfo.dateOfBirth,
      patientAge: patientInfo.age,
      patientNationalId: patientInfo.nationalId,
      patientAddress: patientInfo.address,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.range,
      appointmentDate: selectedDate.toISOString().split('T')[0],
      appointmentTime: selectedTime,
      appointmentDateTime: appointmentDateTime.toISOString(),
      status: 'Pending'
    };

    try {
      localStorage.setItem('radiologyPatientId', patientInfo.id);
      localStorage.setItem('radiologyPatientName', patientInfo.name);
      
      try {
        await axios.post(`${RADIOLOGY_API}/appointments`, bookingData);
      } catch (apiErr) {
        console.warn('Backend API not available:', apiErr.message);
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/patient/appointments'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  // Horizontal scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', padding: '80px 40px 40px' }}>
      {/* Horizontal Scrolling Test Selector - No header text */}
      <div style={{ marginBottom: 32, position: 'relative' }}>
        {/* Scroll Buttons */}
        <button
          onClick={scrollLeft}
          style={{
            position: 'absolute',
            left: -15,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <FaChevronLeft size={14} />
        </button>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '16px',
            padding: '12px 40px',
            scrollBehavior: 'smooth',
            cursor: 'grab',
            scrollbarWidth: 'thin'
          }}
        >
          {allServices.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              isSelected={selectedService?.id === test.id}
              onSelect={handleSelectTest}
              lang={lang}
            />
          ))}
        </div>

        <button
          onClick={scrollRight}
          style={{
            position: 'absolute',
            right: -15,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      {/* 2-Column Layout - Equal Height */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 32, 
        maxWidth: '1400px', 
        margin: '0 auto',
        alignItems: 'stretch'
      }}>
        
        {/* LEFT: Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ 
            background: 'white', 
            borderRadius: 24, 
            padding: 28, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <button onClick={() => changeMonth(-1)} style={{ background: '#f1f5f9', border: 'none', width: 40, height: 40, borderRadius: 20, cursor: 'pointer' }}>←</button>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e3a5f' }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
              <button onClick={() => changeMonth(1)} style={{ background: '#f1f5f9', border: 'none', width: 40, height: 40, borderRadius: 20, cursor: 'pointer' }}>→</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 12, textAlign: 'center' }}>
              {dayNames.map((day, idx) => (
                <div key={idx} style={{ fontSize: 11, fontWeight: 600, color: '#64748b', padding: '8px 0' }}>{day}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 24 }}>
              {getDaysInMonth(currentMonth).map((date, idx) => {
                if (!date) return <div key={idx} style={{ padding: '8px 4px' }} />;
                const isPast = isPastDate(date);
                const selected = isSelected(date);
                const today = isToday(date);
                return (
                  <button
                    key={idx}
                    onClick={() => !isPast && setSelectedDate(date)}
                    disabled={isPast}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 40,
                      background: selected ? (selectedService?.color || '#1e3a5f') : 'transparent',
                      color: selected ? 'white' : (isPast ? '#cbd5e1' : '#334155'),
                      fontWeight: selected ? 600 : (today ? 600 : 400),
                      fontSize: 13,
                      cursor: isPast ? 'not-allowed' : 'pointer',
                      border: 'none'
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div style={{ marginTop: 'auto' }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaRegClock /> Available Time Slots
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: 8,
                  maxHeight: '240px',
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: '10px 8px',
                        background: selectedTime === time ? (selectedService?.color || '#1e3a5f') : '#f8fafc',
                        border: selectedTime === time ? 'none' : '1px solid #e2e8f0',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: selectedTime === time ? 600 : 500,
                        color: selectedTime === time ? 'white' : '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      {formatTime(time)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT: Appointment Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ 
            background: 'white', 
            borderRadius: 24, 
            padding: 28, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaRegCalendarCheck /> Appointment Summary
          </h2>

          {/* ROW 1: Patient Information */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>PATIENT INFORMATION</div>
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px' }}>
              <div><div style={{ fontSize: 10, color: '#64748b' }}>Full Name</div><div style={{ fontSize: 13, fontWeight: 600 }}>{patientInfo.name || '—'}</div></div>
              <div><div style={{ fontSize: 10, color: '#64748b' }}>Patient ID</div><div style={{ fontSize: 12, fontFamily: 'monospace' }}>{patientInfo.id || '—'}</div></div>
              <div><div style={{ fontSize: 10, color: '#64748b' }}><FaPhone size={9} /> Phone</div><div style={{ fontSize: 12 }}>{patientInfo.phone || '—'}</div></div>
              <div><div style={{ fontSize: 10, color: '#64748b' }}><FaEnvelope size={9} /> Email</div><div style={{ fontSize: 12 }}>{patientInfo.email || '—'}</div></div>
              <div><div style={{ fontSize: 10, color: '#64748b' }}><FaVenusMars size={9} /> Gender</div><div style={{ fontSize: 12 }}>{patientInfo.gender || '—'}</div></div>
              <div><div style={{ fontSize: 10, color: '#64748b' }}><FaBirthdayCake size={9} /> DOB</div><div style={{ fontSize: 12 }}>{patientInfo.dateOfBirth ? new Date(patientInfo.dateOfBirth).toLocaleDateString() : '—'}</div></div>
              <div><div style={{ fontSize: 10, color: '#64748b' }}>Age</div><div style={{ fontSize: 12, fontWeight: 600 }}>{patientInfo.age ? `${patientInfo.age} years` : '—'}</div></div>
              <div><div style={{ fontSize: 10, color: '#64748b' }}><FaIdCard size={9} /> National ID</div><div style={{ fontSize: 12 }}>{patientInfo.nationalId || '—'}</div></div>
              <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 10, color: '#64748b' }}><FaHome size={9} /> Address</div><div style={{ fontSize: 12 }}>{patientInfo.address || '—'}</div></div>
            </div>
          </div>

          {/* ROW 2: Test Name */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>RADIOLOGY SERVICE</div>
            <div style={{ 
              background: selectedService ? `${selectedService.color}10` : '#f8fafc', 
              borderRadius: 16, 
              padding: 16, 
              textAlign: 'center',
              border: selectedService ? `1px solid ${selectedService.color}30` : '1px solid #e2e8f0'
            }}>
              <div style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: selectedService?.color || '#64748b', 
                marginBottom: 4 
              }}>
                {selectedService?.name || 'No test selected'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                {selectedService?.specialty || 'Please select a test from above'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: selectedService?.color || '#64748b' }}>
                {selectedService?.range || '—'}
              </div>
            </div>
          </div>

          {/* ROW 3: Time & Date */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>APPOINTMENT DETAILS</div>
            <div style={{ background: '#f0fdf4', borderRadius: 16, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Not selected'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', marginBottom: 4 }}>
                {selectedTime ? formatTime(selectedTime) : '— —'}
              </div>
              <div style={{ fontSize: 11, color: '#10b981' }}>Duration: {selectedService?.duration || '—'} minutes</div>
            </div>
          </div>

          {/* Booking Reference */}
          <div style={{ background: '#1e3a5f', borderRadius: 10, padding: 10, textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>Booking Reference</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'monospace', letterSpacing: '1px' }}>{bookingReference}</div>
          </div>

          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: 10, borderRadius: 10, fontSize: 11, marginBottom: 16 }}>⚠️ {error}</div>}
          {success && <div style={{ background: '#ecfdf5', color: '#059669', padding: 10, borderRadius: 10, fontSize: 11, marginBottom: 16, textAlign: 'center' }}>✓ Appointment booked successfully! Redirecting...</div>}

          <button
            onClick={handleConfirmBooking}
            disabled={!selectedService || !selectedDate || !selectedTime || booking}
            style={{
              width: '100%',
              background: (!selectedService || !selectedDate || !selectedTime || booking) ? '#cbd5e1' : (selectedService?.color || '#1e3a5f'),
              color: (!selectedService || !selectedDate || !selectedTime || booking) ? '#64748b' : 'white',
              border: 'none',
              padding: '14px',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 600,
              cursor: (!selectedService || !selectedDate || !selectedTime || booking) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {booking ? 'Processing...' : 'Confirm Booking'}
          </button>
        </motion.div>
      </div>

      {/* FHIR Source Indicator */}
      {fromClinic && clinicPatientData && (
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#64748b', background: '#e8f1ff', padding: '8px 20px', borderRadius: 30, width: 'fit-content', marginLeft: 'auto', marginRight: 'auto' }}>
          <FaHospitalUser size={10} style={{ marginRight: 6 }} />
          Patient data loaded from Clinic System via FHIR/HL7
        </div>
      )}
    </div>
  );
}