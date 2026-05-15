// src/pages/Radiology/AdminDashboard.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaChartBar, FaClock, FaCheckCircle,
  FaTimesCircle, FaFileMedical, FaSync, FaUpload,
  FaChevronLeft, FaChevronRight, FaUser, FaHospital,
  FaIdCard, FaTag, FaMoneyBillWave, FaPhone, FaVenusMars,
} from 'react-icons/fa';

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  try {
    const dt = new Date(d.includes('T') ? d : d + 'T12:00:00');
    if (isNaN(dt)) return '—';
    return dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  } catch { return '—'; }
}
function fmtTime(t) {
  if (!t) return '—';
  try {
    const [h,m] = t.split(':'); const hr = parseInt(h);
    return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}`;
  } catch { return t; }
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    const dt = new Date(iso); if (isNaN(dt)) return '—';
    return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) +
           ' at ' + dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  } catch { return '—'; }
}
function toISO(d) { return d ? d.toISOString().split('T')[0] : ''; }

const STATUS_CFG = {
  Pending:      { bg:'#fef3c7', color:'#d97706', border:'#fcd34d' },
  Approved:     { bg:'#dbeafe', color:'#2563eb', border:'#93c5fd' },
  Completed:    { bg:'#d1fae5', color:'#059669', border:'#6ee7b7' },
  Rejected:     { bg:'#fee2e2', color:'#dc2626', border:'#fca5a5' },
  'In Progress':{ bg:'#ede9fe', color:'#7c3aed', border:'#c4b5fd' },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];


// ── Price lookup (fallback for old data) ────────────────────────────────────
const PRICE_MAP = {
  'CBC':'250 LE','Blood Sugar':'120 LE','CT Scan':'1800 LE','MRI Scan':'3500 LE',
  'X-Ray':'350 LE','OCT':'900 LE','Visual Field Test':'800 LE','Ultrasound':'600 LE',
  'Corneal Topography':'1000 LE','Specular Microscopy':'950 LE',
  'ERG':'3000 LE','EOG':'2500 LE','Genetic Testing':'7000 LE',
};
// ── localStorage helpers ──────────────────────────────────────────────────────
function readAll() {
  const keys = ['radiologyAllAppointments','radiologyAdminPendingRequests','bookings','appointments'];
  const seen = new Set(); const all = [];
  for (const key of keys) {
    try {
      const arr = JSON.parse(localStorage.getItem(key)||'[]');
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        const uid = item.appointmentId||item.id||item.bookingReference;
        if (uid && seen.has(uid)) continue;
        if (uid) seen.add(uid);
        const isRef = item.source === 'EyeClinicReferral' || item.isDoctorOrder;
        all.push({
          appointmentId:      item.appointmentId||item.id||uid,
          bookingReference:   item.bookingReference||'—',
          radiologyPatientId: item.radiologyPatientId||item.patientId||'—',
          externalPatientId:  item.externalPatientId||null,
          patientName:        item.patientName||item.name||'—',
          patientPhone:       item.patientPhone||item.phone||'—',
          patientEmail:       item.patientEmail||item.email||'—',
          patientGender:      item.patientGender||item.gender||'—',
          serviceName:        item.serviceName||item.service||'—',
          servicePrice:       item.servicePrice||item.price||item.range||PRICE_MAP[item.serviceName||item.service]||null,
          serviceDuration:    item.serviceDuration||item.duration||null,
          appointmentDate:    item.appointmentDate||item.date||'',
          appointmentTime:    item.appointmentTime||item.time||'',
          status:             item.status||'Pending',
          investigationStatus:item.investigationStatus||'Pending',
          source:             item.source||'DirectWalkIn',
          referralSource:     isRef ? (item.referralSource||item.clinicName||'Eye Clinic') : null,
          isDoctorOrder:      item.isDoctorOrder||false,
          doctorName:         item.doctorName||null,
          orderNotes:         item.orderNotes||null,
          uploadedFiles:      item.uploadedFiles||[],
          rejectionReason:    item.rejectionReason||null,
          completedAt:        item.completedAt||null,
          approvedAt:         item.approvedAt||null,
          createdAt:          item.createdAt||new Date().toISOString(),
          updatedAt:          item.updatedAt||null,
        });
      }
    } catch {}
  }
  return all.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}

function writeAll(arr) {
  localStorage.setItem('radiologyAllAppointments', JSON.stringify(arr));
  const pending = arr.filter(a=>a.status==='Pending');
  localStorage.setItem('radiologyAdminPendingRequests', JSON.stringify(pending));
  window.dispatchEvent(new StorageEvent('storage',{key:'radiologyAllAppointments'}));
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ appointments, onSelectDate, selectedDate }) {
  const [month, setMonth] = useState(new Date());

  const y = month.getFullYear(), m = month.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m+1, 0).getDate();

  // Dates that have appointments
  const apptDates = new Set(appointments.map(a => a.appointmentDate).filter(Boolean));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));

  return (
    <div style={{background:'white',borderRadius:16,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
      {/* Month nav */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <button onClick={()=>setMonth(new Date(y,m-1,1))}
          style={{width:28,height:28,borderRadius:8,border:'1px solid #e5e7eb',background:'#f9fafb',
            cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <FaChevronLeft size={10} color="#374151"/>
        </button>
        <span style={{fontSize:13,fontWeight:700,color:'#111827'}}>{MONTHS[m]} {y}</span>
        <button onClick={()=>setMonth(new Date(y,m+1,1))}
          style={{width:28,height:28,borderRadius:8,border:'1px solid #e5e7eb',background:'#f9fafb',
            cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <FaChevronRight size={10} color="#374151"/>
        </button>
      </div>
      {/* Day headers */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4}}>
        {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:10,fontWeight:600,color:'#9ca3af',padding:'3px 0'}}>{d}</div>)}
      </div>
      {/* Dates */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {cells.map((d,i)=>{
          if (!d) return <div key={i}/>;
          const iso = toISO(d);
          const hasApts = apptDates.has(iso);
          const isSel   = selectedDate === iso;
          const isToday = toISO(new Date()) === iso;
          return (
            <button key={i} onClick={()=>onSelectDate(isSel ? null : iso)}
              style={{position:'relative',padding:'6px 2px',borderRadius:8,border:'none',fontSize:11,
                cursor:'pointer',fontWeight:isSel||isToday?700:400,
                background:isSel?'#1e3a5f':isToday?'#eff6ff':'transparent',
                color:isSel?'white':isToday?'#2563eb':'#374151'}}>
              {d.getDate()}
              {hasApts && !isSel && (
                <div style={{position:'absolute',bottom:2,left:'50%',transform:'translateX(-50%)',
                  width:4,height:4,borderRadius:'50%',background:'#0ea5e9'}}/>
              )}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <button onClick={()=>onSelectDate(null)}
          style={{width:'100%',marginTop:10,padding:'6px',borderRadius:8,border:'1px solid #e5e7eb',
            background:'#f9fafb',fontSize:11,color:'#6b7280',cursor:'pointer',fontWeight:500}}>
          Clear filter
        </button>
      )}
    </div>
  );
}

// ── Upload modal ──────────────────────────────────────────────────────────────
function UploadModal({ apt, onClose, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded,  setUploaded]  = useState([]);
  const fileRef = useRef();

  const handleFile = (e) => {
    const files = Array.from(e.target.files||[]);
    if (!files.length) return;
    setUploading(true);
    const promises = files.map(file => new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res({
        id: `FILE-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        appointmentId: apt.appointmentId,
        dataUrl: ev.target.result,
      });
      reader.readAsDataURL(file);
    }));
    Promise.all(promises).then(records => {
      setUploaded(prev => [...prev, ...records]);
      setUploading(false);
    });
    e.target.value = '';
  };

  const handleConfirm = () => {
    if (!uploaded.length) return;
    onUpload(apt.appointmentId, uploaded);
    onClose();
  };

  return (
    <div onClick={onClose}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:9999,
        display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <motion.div initial={{scale:0.92}} animate={{scale:1}} onClick={e=>e.stopPropagation()}
        style={{background:'white',borderRadius:20,padding:28,width:'100%',maxWidth:520,
          boxShadow:'0 16px 48px rgba(0,0,0,0.3)'}}>
        <div style={{marginBottom:20}}>
          <h3 style={{fontSize:18,fontWeight:700,color:'#111827',margin:'0 0 4px'}}>Upload Results</h3>
          <div style={{fontSize:12,color:'#6b7280'}}>
            {apt.patientName} · <span style={{fontFamily:'monospace',color:'#0ea5e9'}}>{apt.radiologyPatientId}</span> · {apt.serviceName}
          </div>
        </div>

        {/* Drop zone */}
        <div onClick={()=>fileRef.current?.click()}
          style={{border:'2px dashed #d1d5db',borderRadius:12,padding:'32px 20px',textAlign:'center',
            cursor:'pointer',background:'#f9fafb',marginBottom:16,transition:'all 0.15s'}}
          onMouseEnter={e=>e.currentTarget.style.borderColor='#1e3a5f'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='#d1d5db'}>
          <FaUpload size={28} color="#9ca3af" style={{marginBottom:8}}/>
          <div style={{fontSize:13,fontWeight:600,color:'#374151',marginBottom:4}}>
            Click to select files
          </div>
          <div style={{fontSize:11,color:'#9ca3af'}}>PDF, JPG, PNG, DICOM — up to 50MB each</div>
          <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.dcm,.dicom"
            onChange={handleFile} style={{display:'none'}}/>
        </div>

        {/* Preview uploaded */}
        {uploaded.length > 0 && (
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:'#374151',marginBottom:8}}>
              Files to upload ({uploaded.length}):
            </div>
            {uploaded.map(f=>(
              <div key={f.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',
                background:'#f0fdf4',borderRadius:8,marginBottom:4,border:'1px solid #6ee7b7'}}>
                <FaCheckCircle size={12} color="#059669"/>
                <span style={{fontSize:12,fontWeight:500,color:'#065f46',flex:1,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.fileName}</span>
              </div>
            ))}
          </div>
        )}

        {uploading && <div style={{fontSize:12,color:'#6b7280',marginBottom:12,textAlign:'center'}}>Reading files…</div>}

        <div style={{display:'flex',gap:8}}>
          <button onClick={onClose}
            style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid #e5e7eb',
              background:'white',color:'#6b7280',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={!uploaded.length||uploading}
            style={{flex:2,padding:'10px',borderRadius:10,border:'none',
              background:uploaded.length&&!uploading?'#1e3a5f':'#d1d5db',
              color:uploaded.length&&!uploading?'white':'#9ca3af',
              fontSize:13,fontWeight:700,cursor:uploaded.length?'pointer':'not-allowed'}}>
            {uploaded.length ? `Confirm Upload (${uploaded.length} file${uploaded.length>1?'s':''})` : 'Select files first'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ setPage }) {
  const [apts,          setApts]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [uploadTarget,  setUploadTarget]  = useState(null);
  const [search,        setSearch]        = useState('');
  const [rejectOpen,    setRejectOpen]    = useState({});
  const [reasons,       setReasons]       = useState({});

  const load = useCallback(() => {
    setLoading(true);
    const all = readAll();
    setApts(all);
    writeAll(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 8000);
    window.addEventListener('storage', load);
    return () => { clearInterval(iv); window.removeEventListener('storage', load); };
  }, [load]);

  const handleAction = (appointmentId, action, reason='') => {
    const now = new Date().toISOString();
    setApts(prev => {
      const next = prev.map(a => {
        if (a.appointmentId !== appointmentId) return a;
        if (action==='approve') return {...a,status:'Approved',investigationStatus:'Active',approvedAt:now,updatedAt:now};
        if (action==='reject')  return {...a,status:'Rejected',rejectionReason:reason,updatedAt:now};
        return a;
      });
      writeAll(next);
      return next;
    });
    setRejectOpen(p=>({...p,[appointmentId]:false}));
    setReasons(p=>({...p,[appointmentId]:''}));
  };

  const handleUpload = (appointmentId, files) => {
    const now = new Date().toISOString();
    setApts(prev => {
      const next = prev.map(a => {
        if (a.appointmentId !== appointmentId) return a;
        const allFiles = [...(a.uploadedFiles||[]), ...files];
        return {...a, uploadedFiles:allFiles, status:'Completed', investigationStatus:'Completed', completedAt:now, updatedAt:now};
      });
      writeAll(next);
      // Save to patient results store
      const apt = next.find(a=>a.appointmentId===appointmentId);
      if (apt) {
        const results = JSON.parse(localStorage.getItem('radiologyPatientResults')||'[]');
        const rec = {
          id:`RES-${Date.now()}`, appointmentId,
          patientId:apt.radiologyPatientId, patientName:apt.patientName,
          serviceName:apt.serviceName, appointmentDate:apt.appointmentDate,
          files:apt.uploadedFiles, status:'Completed', completedAt:now,
        };
        localStorage.setItem('radiologyPatientResults', JSON.stringify([rec,...results]));
        window.dispatchEvent(new StorageEvent('storage',{key:'radiologyAllAppointments'}));
      }
      return next;
    });
  };

  const stats = {
    total:     apts.length,
    pending:   apts.filter(a=>a.status==='Pending').length,
    approved:  apts.filter(a=>a.status==='Approved').length,
    completed: apts.filter(a=>a.status==='Completed').length,
    rejected:  apts.filter(a=>a.status==='Rejected').length,
  };


  const displayed = (selectedDate || search.trim() ? apts.filter(a => {
    const matchDate = !selectedDate || a.appointmentDate === selectedDate;
    const q = search.toLowerCase().trim();
    const matchSearch = !q
      || (a.patientName||'').toLowerCase().includes(q)
      || (a.radiologyPatientId||'').toLowerCase().includes(q)
      || (a.bookingReference||'').toLowerCase().includes(q);
    return matchDate && matchSearch;
  }) : apts);

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',padding:'28px 32px'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,flexWrap:'wrap',gap:10}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0 3px'}}>Radiology Admin Dashboard</h1>
          <p style={{fontSize:13,color:'#6b7280',margin:0}}>{apts.length} total appointments</p>
        </div>
        <button onClick={load}
          style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:10,
            border:'1px solid #e5e7eb',background:'white',color:'#6b7280',fontSize:12,fontWeight:600,cursor:'pointer'}}>
          <FaSync size={11}/> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
        {[
          {label:'Total',     val:stats.total,     color:'#1e3a5f', icon:FaChartBar},
          {label:'Pending',   val:stats.pending,   color:'#d97706', icon:FaClock,        onClick:()=>setPage?.('admin-requests')},
          {label:'Approved',  val:stats.approved,  color:'#2563eb', icon:FaCheckCircle},
          {label:'Completed', val:stats.completed, color:'#059669', icon:FaFileMedical},
          {label:'Rejected',  val:stats.rejected,  color:'#dc2626', icon:FaTimesCircle},
        ].map(({label,val,color,icon:Icon,onClick})=>(
          <motion.div key={label} whileHover={onClick?{scale:1.03}:{}}
            onClick={onClick}
            style={{background:'white',borderRadius:14,padding:'14px 16px',
              boxShadow:'0 1px 4px rgba(0,0,0,0.07)',cursor:onClick?'pointer':'default',
              borderTop:`3px solid ${color}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <Icon size={18} color={color}/>
              <span style={{fontSize:26,fontWeight:800,color}}>{val}</span>
            </div>
            <div style={{fontSize:12,color:'#6b7280',fontWeight:500}}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search bar */}
      <div style={{marginBottom:16,position:'relative'}}>
        <div style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',display:'flex',alignItems:'center'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Search by patient name, RAD ID or booking reference…"
          style={{width:'100%',padding:'11px 40px',border:'1.5px solid #e5e7eb',borderRadius:12,
            fontSize:13,background:'white',color:'#111827',outline:'none',boxSizing:'border-box',
            boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}
          onFocus={e=>e.target.style.borderColor='#1e3a5f'}
          onBlur={e=>e.target.style.borderColor='#e5e7eb'}
        />
        {search && (
          <button onClick={()=>setSearch('')}
            style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
              background:'#f3f4f6',border:'none',cursor:'pointer',color:'#6b7280',
              width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',
              justifyContent:'center',fontSize:12,fontWeight:700}}>
            ✕
          </button>
        )}
      </div>

      {/* Two-column: Calendar | Table */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:20,alignItems:'start'}}>

        {/* LEFT — Mini calendar */}
        <div>
          <MiniCalendar
            appointments={apts}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          {selectedDate && (
            <div style={{marginTop:10,background:'#1e3a5f',borderRadius:10,padding:'8px 12px',
              fontSize:12,color:'white',fontWeight:600,textAlign:'center'}}>
              {fmtDate(selectedDate)} — {displayed.length} appointment{displayed.length!==1?'s':''}
            </div>
          )}
        </div>

        {/* RIGHT — Appointments table */}
        <div style={{background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid #f3f4f6',display:'flex',
            justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#111827'}}>
              {selectedDate ? `Appointments on ${fmtDate(selectedDate)}` : 'All Appointments'}
            </div>
            <span style={{fontSize:12,color:'#9ca3af'}}>{displayed.length} record{displayed.length!==1?'s':''}</span>
          </div>

          {displayed.length === 0 && (
            <div style={{padding:'60px 20px',textAlign:'center',color:'#9ca3af'}}>
              <FaCalendarAlt size={36} color="#e5e7eb" style={{marginBottom:12}}/>
              <div style={{fontSize:14,fontWeight:500,color:'#374151',marginBottom:4}}>
                {selectedDate ? 'No appointments on this date' : 'No appointments yet'}
              </div>
            </div>
          )}

          {displayed.map((apt, i) => {
            const sc = STATUS_CFG[apt.status]||STATUS_CFG.Pending;
            const isRef = apt.referralSource || apt.source === 'EyeClinicReferral';
            return (
              <div key={apt.appointmentId}
                style={{padding:'16px 20px',borderBottom:i<displayed.length-1?'1px solid #f3f4f6':'none',
                  borderLeft:`3px solid ${sc.color}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8,marginBottom:10}}>
                  {/* Patient info */}
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:'#111827',marginBottom:3}}>
                      {apt.patientName}
                    </div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                      <span style={{fontSize:11,fontFamily:'monospace',background:'#f0f9ff',color:'#0ea5e9',
                        padding:'2px 7px',borderRadius:5,fontWeight:700}}>
                        {apt.radiologyPatientId}
                      </span>
                      {isRef && (
                        <span style={{fontSize:10,background:'#f5f3ff',color:'#7c3aed',
                          padding:'2px 7px',borderRadius:5,fontWeight:600}}>
                          <FaHospital size={8} style={{marginRight:3}}/>{apt.referralSource||'Eye Clinic'}
                        </span>
                      )}
                      {!isRef && (
                        <span style={{fontSize:10,background:'#f0fdf4',color:'#059669',
                          padding:'2px 7px',borderRadius:5,fontWeight:600}}>
                          Walk-in
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Status */}
                  <span style={{fontSize:11,padding:'4px 12px',borderRadius:20,fontWeight:700,
                    background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>
                    {apt.status}
                  </span>
                </div>

                {/* Details grid */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',
                  gap:'6px 20px',background:'#f9fafb',borderRadius:8,padding:'10px 14px',marginBottom:10}}>
                  {[
                    [FaTag,           'Service',  apt.serviceName],
                    [FaCalendarAlt,   'Date',     fmtDate(apt.appointmentDate)],
                    [FaClock,         'Time',     fmtTime(apt.appointmentTime)],
                    [FaPhone,         'Phone',    apt.patientPhone],
                    [FaVenusMars,     'Gender',   apt.patientGender],
                    [FaMoneyBillWave, 'Price',    apt.servicePrice||'—'],
                    [FaIdCard,        'Ref',      apt.bookingReference],
                    [FaCalendarAlt,   'Booked',   fmtDateTime(apt.createdAt)],
                    ...(apt.completedAt?[[FaCheckCircle,'Completed',fmtDateTime(apt.completedAt)]]:[]),
                  ].map(([Icon,label,val])=>(
                    <div key={label}>
                      <div style={{fontSize:9,color:'#9ca3af',marginBottom:1,display:'flex',alignItems:'center',gap:2}}>
                        <Icon size={8}/>{label}
                      </div>
                      <div style={{fontSize:11,fontWeight:600,color:'#374151'}}>{val||'—'}</div>
                    </div>
                  ))}
                </div>

                {/* Uploaded files */}
                {apt.uploadedFiles?.length > 0 && (
                  <div style={{marginBottom:8,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
                    <span style={{fontSize:10,fontWeight:700,color:'#059669'}}>
                      <FaCheckCircle size={10} style={{marginRight:3}}/>{apt.uploadedFiles.length} result file(s)
                    </span>
                    {apt.uploadedFiles.map(f=>(
                      <a key={f.id} href={f.dataUrl} download={f.fileName}
                        style={{fontSize:10,padding:'2px 8px',background:'#eff6ff',color:'#2563eb',
                          borderRadius:5,textDecoration:'none',border:'1px solid #bfdbfe',fontWeight:500}}>
                        {f.fileName}
                      </a>
                    ))}
                  </div>
                )}

                {apt.rejectionReason && (
                  <div style={{fontSize:11,color:'#dc2626',background:'#fef2f2',borderRadius:6,
                    padding:'5px 10px',marginBottom:8}}>
                    Rejected: {apt.rejectionReason}
                  </div>
                )}

                {/* Reject reason input */}
                {rejectOpen[apt.appointmentId] && (
                  <input value={reasons[apt.appointmentId]||''} placeholder="Rejection reason (optional)"
                    onChange={e=>setReasons(p=>({...p,[apt.appointmentId]:e.target.value}))}
                    style={{width:'100%',padding:'7px 10px',border:'1px solid #fecaca',borderRadius:7,
                      fontSize:12,marginBottom:8,boxSizing:'border-box',outline:'none'}}/>
                )}

                {/* Actions */}
                <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                  {apt.status==='Pending' && (
                    <>
                      <button onClick={()=>handleAction(apt.appointmentId,'approve')}
                        style={{padding:'7px 16px',borderRadius:8,border:'none',background:'#059669',
                          color:'white',fontSize:12,fontWeight:600,cursor:'pointer',
                          display:'flex',alignItems:'center',gap:5}}>
                        <FaCheckCircle size={11}/> Approve
                      </button>
                      {rejectOpen[apt.appointmentId]
                        ? <button onClick={()=>handleAction(apt.appointmentId,'reject',reasons[apt.appointmentId]||'')}
                            style={{padding:'7px 14px',borderRadius:8,border:'none',background:'#dc2626',
                              color:'white',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                            Confirm Reject
                          </button>
                        : <button onClick={()=>setRejectOpen(p=>({...p,[apt.appointmentId]:true}))}
                            style={{padding:'7px 14px',borderRadius:8,border:'1px solid #fecaca',
                              background:'white',color:'#dc2626',fontSize:12,fontWeight:600,cursor:'pointer',
                              display:'flex',alignItems:'center',gap:5}}>
                            <FaTimesCircle size={11}/> Reject
                          </button>
                      }
                    </>
                  )}
                  {(apt.status==='Approved'||apt.status==='In Progress'||apt.status==='Completed') && (
                    <button onClick={()=>setUploadTarget(apt)}
                      style={{padding:'7px 16px',borderRadius:8,border:'none',
                        background:'#2563eb',color:'white',fontSize:12,fontWeight:600,cursor:'pointer',
                        display:'flex',alignItems:'center',gap:5}}>
                      <FaUpload size={11}/> Upload Results
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload modal */}
      {uploadTarget && (
        <UploadModal
          apt={uploadTarget}
          onClose={()=>setUploadTarget(null)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
}