// src/pages/Radiology/BookAppointmentPage.jsx
// Simplified layout: horizontal carousel → two columns (calendar | patient info + confirm)

import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaCheckCircle, FaChevronLeft, FaChevronRight, FaUser, FaEnvelope,
  FaPhone, FaIdCard, FaVenusMars, FaHome, FaLock, FaRegClock,
  FaCloudDownloadAlt, FaBirthdayCake,
} from 'react-icons/fa';

import mriImage            from '../../assets/MRI-1-768x576.jpg';
import ctImage             from '../../assets/ct scan.webp';
import ultrasoundImage     from '../../assets/Ultrasound.jpg';
import xrayImage           from '../../assets/X_Ray.jpg';
import octImage            from '../../assets/OCTttest.webp';
import visualFieldImage    from '../../assets/Visual-field-test.jpg';
import cornealTopographyImage  from '../../assets/Corneal Topography.jpg';
import specularMicroscopyImage from '../../assets/Specular Microscopy.jpg';
import cbcImage            from '../../assets/CBCtest.avif';
import bloodSugarImage     from '../../assets/bloodSuger.jpg';
import ergImage            from '../../assets/Electroretinography (ERG).webp';
import eogImage            from '../../assets/Electrooculography (EOG).webp';
import geneticImage        from '../../assets/Genetic Testing.png';

const RADIOLOGY_API = import.meta.env.VITE_RADIOLOGY_API || 'http://localhost:5202/api';

// ── RAD- ID: always read from localStorage ─────────────────────────────────────
const getRadId = () => {
  const s = localStorage.getItem('radiologyPatientId');
  if (s && s.startsWith('RAD-')) return s;
  const id = `RAD-${Math.floor(1000 + Math.random() * 9000)}`;
  localStorage.setItem('radiologyPatientId', id);
  return id;
};

const ALL_SERVICES = [
  { id:1,  name:'CBC',                specialty:'Complete Blood Count',         price:'250 LE',  image:cbcImage,                duration:15, color:'#ef4444' },
  { id:2,  name:'Blood Sugar',        specialty:'Glucose Testing',              price:'120 LE',  image:bloodSugarImage,         duration:10, color:'#f59e0b' },
  { id:3,  name:'CT Scan',            specialty:'Computed Tomography',          price:'1800 LE', image:ctImage,                 duration:45, color:'#00b8a8' },
  { id:4,  name:'MRI Scan',           specialty:'Magnetic Resonance Imaging',   price:'3500 LE', image:mriImage,                duration:60, color:'#1f6bff' },
  { id:5,  name:'X-Ray',              specialty:'Digital Radiography',          price:'350 LE',  image:xrayImage,               duration:20, color:'#28a745' },
  { id:6,  name:'OCT',                specialty:'Optical Coherence Tomography', price:'900 LE',  image:octImage,                duration:20, color:'#8b5cf6' },
  { id:7,  name:'Visual Field Test',  specialty:'Perimetry',                    price:'800 LE',  image:visualFieldImage,        duration:25, color:'#8b5cf6' },
  { id:8,  name:'Ultrasound',         specialty:'Ocular Ultrasound',            price:'600 LE',  image:ultrasoundImage,         duration:30, color:'#14b8a6' },
  { id:9,  name:'Corneal Topography', specialty:'Corneal Mapping',              price:'1000 LE', image:cornealTopographyImage,  duration:20, color:'#06b6d4' },
  { id:10, name:'Specular Microscopy',specialty:'Endothelial Cell Count',       price:'950 LE',  image:specularMicroscopyImage, duration:15, color:'#06b6d4' },
  { id:11, name:'ERG',                specialty:'Electroretinography',          price:'3000 LE', image:ergImage,                duration:45, color:'#f97316' },
  { id:12, name:'EOG',                specialty:'Electrooculography',           price:'2500 LE', image:eogImage,                duration:40, color:'#f97316' },
  { id:13, name:'Genetic Testing',    specialty:'Ocular Genetics',              price:'7000 LE', image:geneticImage,            duration:30, color:'#a855f7' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

const calcAge = (dob) => {
  if (!dob) return null;
  const t = new Date(), b = new Date(dob);
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a > 0 ? a : null;
};
const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':'); const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};
const genRef = () => {
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', N = '0123456789';
  return `${L[~~(Math.random()*26)]}${L[~~(Math.random()*26)]}${N[~~(Math.random()*10)]}${N[~~(Math.random()*10)]}${N[~~(Math.random()*10)]}${N[~~(Math.random()*10)]}`;
};
const getHashParams = () => {
  const h = window.location.hash;
  return new URLSearchParams(h.includes('?') ? h.split('?')[1] : window.location.search);
};
const getDays = (date) => {
  const y = date.getFullYear(), m = date.getMonth();
  const days = [];
  for (let i = 0; i < new Date(y, m, 1).getDay(); i++) days.push(null);
  for (let d = 1; d <= new Date(y, m+1, 0).getDate(); d++) days.push(new Date(y, m, d));
  return days;
};

// ── Input styles ──────────────────────────────────────────────────────────────
const INP = { width:'100%', padding:'10px 12px', border:'1.5px solid #d1d5db', borderRadius:8,
  fontSize:13, background:'white', color:'#111827', outline:'none', boxSizing:'border-box' };
const INP_E = { ...INP, border:'1.5px solid #dc2626' };
const INP_R = { ...INP, background:'#f3f4f6', color:'#6b7280', cursor:'not-allowed' };

// ── PatientForm (owns its own state) ─────────────────────────────────────────
function PatientForm({ init, readOnly, onChange, onValid }) {
  const [f, setF] = useState({
    name: init?.name||'', phone: init?.phone||'', email: init?.email||'',
    nationalId: init?.nationalId||'', dateOfBirth: init?.dateOfBirth||'',
    gender: init?.gender||'', address: init?.address||'',
  });
  const [touched, setT] = useState({});
  const prev = useRef(readOnly);

  useEffect(() => {
    if (!prev.current && readOnly && init) {
      const n = { name:init.name||'', phone:init.phone||'', email:init.email||'',
        nationalId:init.nationalId||'', dateOfBirth:init.dateOfBirth||'',
        gender:init.gender||'', address:init.address||'' };
      setF(n);
      Object.entries(n).forEach(([k,v]) => onChange?.(k,v));
    }
    prev.current = readOnly;
  }, [readOnly]);

  const errs = useMemo(() => {
    if (readOnly) return {};
    const e = {};
    if (!f.name||f.name.trim().length<2)            e.name       = 'Min 2 characters';
    if (!f.phone||!/^[0-9\-\+\(\)\s]{7,}$/.test(f.phone)) e.phone = 'Invalid phone';
    if (!f.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email';
    if (!f.nationalId||f.nationalId.trim().length<5) e.nationalId = 'Required';
    if (!f.dateOfBirth)                              e.dateOfBirth= 'Required';
    if (!f.gender)                                   e.gender     = 'Required';
    if (!f.address||f.address.trim().length<3)       e.address    = 'Required';
    return e;
  }, [f, readOnly]);

  useEffect(() => { onValid?.(readOnly || Object.keys(errs).length===0); }, [errs, readOnly]);

  const ch = (e) => {
    const {name,value} = e.target;
    setT(t=>({...t,[name]:true}));
    setF(p=>({...p,[name]:value}));
    onChange?.(name,value);
  };
  const bl = (e) => setT(t=>({...t,[e.target.name]:true}));
  const age = calcAge(f.dateOfBirth);

  const text_fields = [
    {name:'name',        label:'Full Name',     type:'text',  Icon:FaUser,         ph:'Your full name',    req:true},
    {name:'phone',       label:'Phone',         type:'tel',   Icon:FaPhone,        ph:'+20 1XX XXXX XXX',  req:true},
    {name:'email',       label:'Email',         type:'email', Icon:FaEnvelope,     ph:'you@email.com',     req:true},
    {name:'nationalId',  label:'National ID',   type:'text',  Icon:FaIdCard,       ph:'14 digits',         req:true, max:14},
    {name:'dateOfBirth', label:'Date of Birth', type:'date',  Icon:FaBirthdayCake, req:true},
  ];

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px 14px'}}>
      {text_fields.map(({name,label,type,Icon,ph,req,max}) => {
        const err = !readOnly && touched[name] && errs[name];
        return (
          <div key={name}>
            <label style={{fontSize:11,fontWeight:600,color:'#374151',display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
              <Icon size={10}/>{label}{req&&<span style={{color:'#dc2626'}}>*</span>}
            </label>
            <input type={type} name={name} value={f[name]} onChange={ch} onBlur={bl}
              placeholder={ph} readOnly={readOnly} maxLength={max}
              style={readOnly?INP_R:err?INP_E:INP}/>
            {err && <div style={{fontSize:10,color:'#dc2626',marginTop:2}}>{errs[name]}</div>}
            {name==='dateOfBirth'&&age&&<div style={{fontSize:10,color:'#6b7280',marginTop:2}}>Age: {age} yrs</div>}
          </div>
        );
      })}

      {/* Gender */}
      <div>
        <label style={{fontSize:11,fontWeight:600,color:'#374151',display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
          <FaVenusMars size={10}/>Gender<span style={{color:'#dc2626'}}>*</span>
        </label>
        <select name="gender" value={f.gender} onChange={ch} onBlur={bl} disabled={readOnly}
          style={readOnly?INP_R:(touched.gender&&errs.gender)?INP_E:INP}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {!readOnly&&touched.gender&&errs.gender&&<div style={{fontSize:10,color:'#dc2626',marginTop:2}}>{errs.gender}</div>}
      </div>

      {/* Address — full width */}
      <div style={{gridColumn:'span 2'}}>
        <label style={{fontSize:11,fontWeight:600,color:'#374151',display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
          <FaHome size={10}/>Address<span style={{color:'#dc2626'}}>*</span>
        </label>
        <textarea name="address" value={f.address} onChange={ch} onBlur={bl}
          placeholder="Full address" readOnly={readOnly} rows={2}
          style={{...(readOnly?INP_R:(touched.address&&errs.address)?INP_E:INP),resize:'none',pointerEvents:readOnly?'none':'auto'}}/>
        {!readOnly&&touched.address&&errs.address&&<div style={{fontSize:10,color:'#dc2626',marginTop:2}}>{errs.address}</div>}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BookAppointmentPage({ setPage }) {
  const hashParams = useMemo(() => getHashParams(), []);

  const isDoctorOrder   = hashParams.get('doctorOrder')==='true' || !!hashParams.get('orderId');
  const isClinicPatient = hashParams.get('fromClinic')==='true' || isDoctorOrder;

  const doctorInfo = useMemo(() => ({
    orderId:        hashParams.get('orderId')        || '',
    doctorName:     decodeURIComponent(hashParams.get('doctorName')     || ''),
    doctorSpecialty:decodeURIComponent(hashParams.get('doctorSpecialty')|| ''),
    requestedTest:  decodeURIComponent(hashParams.get('requestedTest')  || ''),
    orderNotes:     decodeURIComponent(hashParams.get('orderNotes')     || ''),
    clinicName:     decodeURIComponent(hashParams.get('clinicName')     || 'Eye Clinic'),
  }), []);

  const clinicInit = useMemo(() => {
    if (!isClinicPatient) return null;
    return {
      id:          decodeURIComponent(hashParams.get('patientId')         || ''),
      name:        decodeURIComponent(hashParams.get('patientName')       || ''),
      phone:       decodeURIComponent(hashParams.get('patientPhone')      || ''),
      email:       decodeURIComponent(hashParams.get('patientEmail')      || ''),
      gender:      decodeURIComponent(hashParams.get('patientGender')     || ''),
      dateOfBirth: hashParams.get('patientDateOfBirth') || '',
      nationalId:  decodeURIComponent(hashParams.get('patientNationalId') || ''),
      address:     decodeURIComponent(hashParams.get('patientAddress')    || ''),
    };
  }, []);

  const initialService = useMemo(() => {
    if (isDoctorOrder && doctorInfo.requestedTest) {
      const tn = doctorInfo.requestedTest.toUpperCase();
      return ALL_SERVICES.find(s => s.name.toUpperCase() === tn || s.name.toUpperCase().includes(tn)) || null;
    }
    const sid = localStorage.getItem('selectedServiceId');
    if (sid) return ALL_SERVICES.find(s => s.id === parseInt(sid)) || null;
    return null;
  }, []);

  const radId = useMemo(() => getRadId(), []);

  const [service,   setService]   = useState(initialService);
  const [month,     setMonth]     = useState(new Date());
  const [selDate,   setSelDate]   = useState(null);
  const [slots,     setSlots]     = useState([]);
  const [selTime,   setSelTime]   = useState('');
  const [formValid, setFormValid] = useState(isClinicPatient);
  const [booking,   setBooking]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [booked,    setBooked]    = useState(null);
  const [bookRef]                 = useState(genRef);

  const patRef = useRef({
    ...(clinicInit || { name:'', phone:'', email:'', nationalId:'', dateOfBirth:'', gender:'', address:'' }),
    radiologyPatientId: radId,
    externalPatientId:  clinicInit?.id || '',
  });

  useEffect(() => {
    if (clinicInit) patRef.current = { ...clinicInit, radiologyPatientId:radId, externalPatientId:clinicInit.id||'' };
  }, []);

  const scrollRef = useRef(null);
  const scrollL = () => scrollRef.current?.scrollBy({left:-240,behavior:'smooth'});
  const scrollR = () => scrollRef.current?.scrollBy({left: 240,behavior:'smooth'});

  // Time slots
  useEffect(() => {
    if (!selDate) return;
    const s = [];
    for (let h=9;h<=20;h++) for (let m=0;m<60;m+=30) {
      if (h===20&&m>0) continue;
      s.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
    setSlots(s); setSelTime('');
  }, [selDate]);

  const isPast  = d => { const t=new Date();t.setHours(0,0,0,0);return d&&d<t; };
  const isSel   = d => selDate&&d&&d.toDateString()===selDate.toDateString();
  const isToday = d => d&&d.toDateString()===new Date().toDateString();
  const chMon   = n => { setMonth(new Date(month.getFullYear(),month.getMonth()+n,1)); setSelDate(null); setSelTime(''); };

  const handleFieldChange = (k,v) => { patRef.current = {...patRef.current,[k]:v}; };

  // ── Book ─────────────────────────────────────────────────────────────────
  const handleBook = async () => {
    if (!service)   { setError('Please select a service.'); return; }
    if (!selDate)   { setError('Please select a date.'); return; }
    if (!selTime)   { setError('Please select a time slot.'); return; }
    if (!formValid) { setError('Please fill all required patient fields.'); return; }

    setBooking(true); setError('');
    const pd = patRef.current;
    const dt = new Date(selDate);
    const [hh,mm] = selTime.split(':');
    dt.setHours(parseInt(hh), parseInt(mm));

    const apt = {
      appointmentId:      `APT-${Date.now()}`,
      bookingReference:   bookRef,
      radiologyPatientId: pd.radiologyPatientId || radId,
      externalPatientId:  pd.externalPatientId  || '',
      patientId:          pd.radiologyPatientId || radId,
      patientName:        pd.name,
      patientPhone:       pd.phone,
      patientEmail:       pd.email,
      patientGender:      pd.gender,
      patientDateOfBirth: pd.dateOfBirth,
      patientNationalId:  pd.nationalId,
      patientAddress:     pd.address,
      serviceName:        service.name,
      servicePrice:       service.price,
      serviceDuration:    service.duration,
      appointmentDate:    selDate.toISOString().split('T')[0],
      appointmentTime:    selTime,
      appointmentDateTime:dt.toISOString(),
      status:             'Pending',
      investigationStatus:'Pending',
      source:             isClinicPatient ? 'EyeClinicReferral' : 'DirectWalkIn',
      referralSource:     isClinicPatient ? (doctorInfo.clinicName || 'Eye Clinic') : null,
      isDoctorOrder:      isClinicPatient ? isDoctorOrder : false,
      doctorName:         isClinicPatient ? (doctorInfo.doctorName || null) : null,
      clinicName:         isClinicPatient ? (doctorInfo.clinicName || null) : null,
      orderNotes:         isClinicPatient ? (doctorInfo.orderNotes || null) : null,
      uploadedFiles:      [],
      createdAt:          new Date().toISOString(),
      updatedAt:          new Date().toISOString(),
    };

    // Persist patient profile info
    if (!isClinicPatient) {
      const map = {
        radiologyPatientName:        pd.name,
        radiologyPatientPhone:       pd.phone,
        radiologyPatientEmail:       pd.email,
        radiologyPatientGender:      pd.gender,
        radiologyPatientDateOfBirth: pd.dateOfBirth,
        radiologyPatientNationalId:  pd.nationalId,
        radiologyPatientAddress:     pd.address,
      };
      Object.entries(map).forEach(([k,v]) => v && localStorage.setItem(k,v));
    }

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('radiologyAllAppointments')||'[]');
    const dup = existing.some(a =>
      a.patientName===apt.patientName &&
      a.appointmentDate===apt.appointmentDate &&
      a.appointmentTime===apt.appointmentTime &&
      a.serviceName===apt.serviceName
    );
    if (!dup) {
      localStorage.setItem('radiologyAllAppointments', JSON.stringify([apt,...existing]));
      const pend = JSON.parse(localStorage.getItem('radiologyAdminPendingRequests')||'[]');
      localStorage.setItem('radiologyAdminPendingRequests', JSON.stringify([apt,...pend]));
      window.dispatchEvent(new StorageEvent('storage',{key:'radiologyAllAppointments'}));
    }

    // Try backend
    try { await axios.post(`${RADIOLOGY_API}/appointments`, apt); }
    catch { /* backend down — saved locally */ }

    setBooked(apt);
    setSuccess(true);
    setBooking(false);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (success && booked) return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
        style={{background:'white',borderRadius:20,padding:40,maxWidth:480,width:'100%',textAlign:'center',boxShadow:'0 8px 40px rgba(0,0,0,0.1)'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <FaCheckCircle size={32} color="#16a34a"/>
        </div>
        <h2 style={{fontSize:20,fontWeight:700,color:'#111827',marginBottom:6}}>Appointment Request Sent!</h2>
        <p style={{color:'#6b7280',fontSize:13,marginBottom:20}}>Admin will review and confirm shortly.</p>
        <div style={{background:'#f9fafb',borderRadius:12,padding:16,marginBottom:20,textAlign:'left',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px'}}>
          {[
            ['Radiology ID', booked.radiologyPatientId],
            ['Booking Ref',  booked.bookingReference],
            ['Patient',      booked.patientName],
            ['Test',         booked.serviceName],
            ['Price',        booked.servicePrice],
            ['Date',         new Date(booked.appointmentDate+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})],
            ['Time',         fmtTime(booked.appointmentTime)],
          ].map(([l,v])=>(
            <div key={l}>
              <div style={{fontSize:10,color:'#9ca3af'}}>{l}</div>
              <div style={{fontSize:13,fontWeight:600,color: l==='Radiology ID'?'#0ea5e9':'#111827', fontFamily:l==='Radiology ID'||l==='Booking Ref'?'monospace':'inherit'}}>{v}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>setPage?.('home')}
          style={{background:'#1e3a5f',color:'white',border:'none',borderRadius:10,padding:'11px 28px',fontSize:14,fontWeight:600,cursor:'pointer'}}>
          Back to Home
        </button>
      </motion.div>
    </div>
  );

  const svc = service;

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',paddingTop:80,paddingBottom:40}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px'}}>

        {/* Doctor banner */}
        {isDoctorOrder && (
          <div style={{background:'#fffbeb',border:'1.5px solid #f59e0b',borderRadius:12,padding:'12px 18px',marginBottom:20,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{fontSize:20}}>👨‍⚕️</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#78350f'}}>Doctor Order — {doctorInfo.doctorName}</div>
              <div style={{fontSize:12,color:'#92400e'}}>{doctorInfo.clinicName}{doctorInfo.orderNotes&&` · ${doctorInfo.orderNotes}`}</div>
            </div>
            {doctorInfo.requestedTest && (
              <span style={{marginLeft:'auto',background:'#f59e0b',color:'white',borderRadius:8,padding:'4px 12px',fontSize:12,fontWeight:700}}>
                {doctorInfo.requestedTest}
              </span>
            )}
          </div>
        )}

        {/* ── Horizontal carousel ─────────────────────────────────────────── */}
        <div style={{position:'relative',marginBottom:24}}>
          <button onClick={scrollL} style={{position:'absolute',left:-12,top:'50%',transform:'translateY(-50%)',zIndex:10,
            width:32,height:32,borderRadius:'50%',border:'1px solid #e5e7eb',background:'white',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'}}>
            <FaChevronLeft size={12} color="#374151"/>
          </button>
          <div ref={scrollRef} style={{display:'flex',gap:12,overflowX:'auto',padding:'6px 20px',
            scrollBehavior:'smooth',scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
            {ALL_SERVICES.map(s => {
              const sel = svc?.id===s.id;
              return (
                <motion.div key={s.id} whileHover={{y:-3,scale:1.02}} whileTap={{scale:0.97}}
                  onClick={()=>{ if(isDoctorOrder&&!sel) return; setService(s); setError(''); }}
                  style={{minWidth:160,maxWidth:160,flexShrink:0,borderRadius:14,padding:10,cursor:'pointer',
                    background:sel?`linear-gradient(135deg,${s.color},${s.color}cc)`:'white',
                    border:sel?`2px solid ${s.color}`:'1px solid #e5e7eb',
                    boxShadow:sel?`0 4px 16px ${s.color}30`:'0 1px 4px rgba(0,0,0,0.06)',
                    position:'relative',opacity:isDoctorOrder&&!sel?0.4:1}}>
                  {sel&&<div style={{position:'absolute',top:6,right:6,background:s.color,borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <FaCheckCircle size={10} color="white"/>
                  </div>}
                  {sel&&isDoctorOrder&&<div style={{position:'absolute',top:6,left:6,background:'rgba(255,255,255,0.9)',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <FaLock size={9} color="#f59e0b"/>
                  </div>}
                  <div style={{width:'100%',height:90,borderRadius:10,overflow:'hidden',marginBottom:8}}>
                    <img src={s.image} alt={s.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:sel?'white':'#111827',textAlign:'center',marginBottom:2}}>{s.name}</div>
                  <div style={{fontSize:10,color:sel?'rgba(255,255,255,0.8)':'#6b7280',textAlign:'center',marginBottom:4}}>{s.specialty}</div>
                  <div style={{fontSize:12,fontWeight:700,color:sel?'white':s.color,textAlign:'center'}}>{s.price}</div>
                  <div style={{fontSize:9,color:sel?'rgba(255,255,255,0.7)':'#9ca3af',textAlign:'center'}}>{s.duration} min</div>
                </motion.div>
              );
            })}
          </div>
          <button onClick={scrollR} style={{position:'absolute',right:-12,top:'50%',transform:'translateY(-50%)',zIndex:10,
            width:32,height:32,borderRadius:'50%',border:'1px solid #e5e7eb',background:'white',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'}}>
            <FaChevronRight size={12} color="#374151"/>
          </button>
        </div>

        {/* Selected service strip */}
        {svc && (
          <div style={{borderRadius:12,padding:'12px 18px',marginBottom:20,color:'white',display:'flex',alignItems:'center',gap:12,
            background:`linear-gradient(135deg,${svc.color},${svc.color}bb)`}}>
            <div style={{width:42,height:42,borderRadius:8,overflow:'hidden',flexShrink:0}}>
              <img src={svc.image} alt={svc.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700}}>{svc.name}</div>
              <div style={{fontSize:11,opacity:0.9}}>{svc.specialty} · {svc.duration} min · {svc.price}</div>
            </div>
          </div>
        )}

        {!svc && (
          <div style={{textAlign:'center',padding:'60px 20px',color:'#9ca3af',fontSize:15}}>
            Select a service above to continue
          </div>
        )}

        {/* ── Two columns ─────────────────────────────────────────────────── */}
        {svc && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,alignItems:'start'}}>

            {/* LEFT — Calendar + Time slots */}
            <div style={{background:'white',borderRadius:16,padding:24,boxShadow:'0 1px 6px rgba(0,0,0,0.07)'}}>
              {/* Month nav */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <button onClick={()=>chMon(-1)} style={{width:32,height:32,borderRadius:8,border:'1px solid #e5e7eb',background:'#f9fafb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <FaChevronLeft size={11} color="#374151"/>
                </button>
                <span style={{fontWeight:700,color:'#111827',fontSize:15}}>{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
                <button onClick={()=>chMon(1)} style={{width:32,height:32,borderRadius:8,border:'1px solid #e5e7eb',background:'#f9fafb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <FaChevronRight size={11} color="#374151"/>
                </button>
              </div>
              {/* Day headers */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:6}}>
                {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:10,fontWeight:600,color:'#9ca3af',padding:'4px 0'}}>{d}</div>)}
              </div>
              {/* Dates */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:20}}>
                {getDays(month).map((d,i)=>{
                  if (!d) return <div key={i}/>;
                  const past=isPast(d),sel=isSel(d),tod=isToday(d);
                  return (
                    <button key={i} onClick={()=>!past&&setSelDate(d)} disabled={past}
                      style={{padding:'7px 2px',borderRadius:8,border:'none',fontSize:12,cursor:past?'not-allowed':'pointer',
                        background:sel?svc.color:'transparent',
                        color:sel?'white':past?'#d1d5db':tod?'#1d4ed8':'#374151',
                        fontWeight:sel||tod?700:400}}>
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
              {/* Time slots */}
              {selDate && (
                <>
                  <div style={{fontSize:12,fontWeight:600,color:'#6b7280',marginBottom:8,display:'flex',alignItems:'center',gap:5}}>
                    <FaRegClock size={11}/> {selDate.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'short'})}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,maxHeight:180,overflowY:'auto'}}>
                    {slots.map(t=>(
                      <button key={t} onClick={()=>setSelTime(t)}
                        style={{padding:'8px 2px',borderRadius:8,fontSize:11,fontWeight:500,cursor:'pointer',
                          background:selTime===t?svc.color:'#f9fafb',
                          color:selTime===t?'white':'#374151',
                          border:selTime===t?'none':'1px solid #e5e7eb'}}>
                        {fmtTime(t)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT — Patient data + Confirm */}
            <div style={{background:'white',borderRadius:16,padding:24,boxShadow:'0 1px 6px rgba(0,0,0,0.07)'}}>

              {/* Source badge — only show for clinic/referred patients */}
              {isClinicPatient && (
                <div style={{background:'#e0f2fe',borderRadius:8,padding:'7px 12px',marginBottom:14,
                  fontSize:12,fontWeight:500,color:'#0ea5e9',display:'flex',alignItems:'center',gap:6}}>
                  <FaCloudDownloadAlt size={12}/>
                  {`Referred from ${doctorInfo.clinicName}`}
                </div>
              )}

              {/* RAD ID */}
              <div style={{background:'#f0f9ff',borderRadius:8,padding:'8px 12px',marginBottom:14,display:'flex',alignItems:'center',gap:8,border:'1px solid #bae6fd'}}>
                <div style={{fontSize:10,color:'#64748b'}}>Radiology Patient ID</div>
                <div style={{fontWeight:700,color:'#0ea5e9',fontFamily:'monospace',fontSize:14,marginLeft:'auto'}}>{radId}</div>
              </div>

              {/* Patient form */}
              <PatientForm
                key={isClinicPatient?'clinic':'direct'}
                init={isClinicPatient?clinicInit:null}
                readOnly={isClinicPatient}
                onChange={handleFieldChange}
                onValid={setFormValid}
              />

              {/* Date/Time summary */}
              <div style={{background:'#f0fdf4',borderRadius:8,padding:'10px 14px',margin:'14px 0',textAlign:'center'}}>
                <div style={{fontSize:12,color:'#6b7280'}}>
                  {selDate?selDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}):'No date selected'}
                </div>
                <div style={{fontSize:20,fontWeight:700,color:'#111827',margin:'2px 0'}}>
                  {selTime?fmtTime(selTime):'— : —'}
                </div>
                {svc&&<div style={{fontSize:11,color:'#10b981'}}>Duration: {svc.duration} min</div>}
              </div>

              {/* Booking ref + Price */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                <div style={{background:'#1e3a5f',borderRadius:8,padding:'8px 14px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',marginBottom:1}}>Booking reference</div>
                  <div style={{fontSize:13,fontWeight:700,color:'white',fontFamily:'monospace',letterSpacing:1}}>{bookRef}</div>
                </div>
                <div style={{background:svc?.color||'#1e3a5f',borderRadius:8,padding:'8px 14px',textAlign:'center'}}>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',marginBottom:1}}>Price</div>
                  <div style={{fontSize:15,fontWeight:800,color:'white'}}>{svc?.price||'—'}</div>
                </div>
              </div>

              {error&&<div style={{background:'#fef2f2',color:'#dc2626',borderRadius:8,padding:'8px 12px',fontSize:12,marginBottom:10}}>⚠ {error}</div>}

              {/* Confirm button */}
              <button onClick={handleBook} disabled={booking||!selDate||!selTime}
                style={{width:'100%',padding:13,borderRadius:10,border:'none',fontSize:14,fontWeight:700,
                  cursor:booking||!selDate||!selTime?'not-allowed':'pointer',
                  background:booking||!selDate||!selTime?'#d1d5db':svc?.color||'#1e3a5f',
                  color:booking||!selDate||!selTime?'#9ca3af':'white'}}>
                {booking?'Processing…':!selDate?'Select a date first':!selTime?'Select a time slot':'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}