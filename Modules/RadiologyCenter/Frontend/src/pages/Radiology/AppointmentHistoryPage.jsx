// src/pages/Radiology/AppointmentHistoryPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle,
  FaHourglassHalf, FaFileAlt, FaDownload, FaEye,
  FaHospital, FaUserMd, FaMoneyBillWave, FaIdCard,
  FaTag, FaFileMedical, FaSync,
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
    if (t.includes('T')) return new Date(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    const [h,m]=t.split(':'); const hr=parseInt(h);
    return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}`;
  } catch { return t; }
}
function fmtDateTime(iso) {
  if (!iso) return null;
  try {
    const dt = new Date(iso);
    if (isNaN(dt)) return null;
    return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) +
           ' at ' + dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  } catch { return null; }
}

const STATUS_CFG = {
  Pending:      { bg:'#fef3c7', color:'#d97706', Icon:FaHourglassHalf, border:'#fcd34d' },
  Approved:     { bg:'#dbeafe', color:'#2563eb', Icon:FaCheckCircle,   border:'#93c5fd' },
  Completed:    { bg:'#d1fae5', color:'#059669', Icon:FaCheckCircle,   border:'#6ee7b7' },
  Rejected:     { bg:'#fee2e2', color:'#dc2626', Icon:FaTimesCircle,   border:'#fca5a5' },
  'In Progress':{ bg:'#ede9fe', color:'#7c3aed', Icon:FaHourglassHalf, border:'#c4b5fd' },
};

const SERVICE_COLORS = {
  'MRI Scan':           '#1f6bff',
  'CT Scan':            '#00b8a8',
  'X-Ray':              '#28a745',
  'OCT':                '#8b5cf6',
  'Ultrasound':         '#14b8a6',
  'Blood Sugar':        '#f59e0b',
  'CBC':                '#ef4444',
  'Visual Field Test':  '#7c3aed',
  'Corneal Topography': '#0ea5e9',
  'Specular Microscopy':'#0284c7',
  'ERG':                '#f97316',
  'EOG':                '#fb923c',
  'Genetic Testing':    '#a855f7',
};
const getSvcColor = (name) => SERVICE_COLORS[name] || '#1e3a5f';

// ── Read all patient appointments ─────────────────────────────────────────────
function readAppointments() {
  const radId = localStorage.getItem('radiologyPatientId') || '';
  const email = localStorage.getItem('radiologyPatientEmail') || localStorage.getItem('userEmail') || '';
  const name  = localStorage.getItem('radiologyPatientName') || '';
  const seen  = new Set();
  const all   = [];

  for (const key of ['radiologyAllAppointments','radiologyAdminPendingRequests']) {
    try {
      const arr = JSON.parse(localStorage.getItem(key)||'[]');
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        const uid = item.appointmentId||item.id||item.bookingReference;
        if (uid && seen.has(uid)) continue;
        if (uid) seen.add(uid);
        const iRad   = (item.radiologyPatientId||item.patientId||'').toLowerCase();
        const iEmail = (item.patientEmail||item.email||'').toLowerCase();
        const iName  = (item.patientName||item.name||'').toLowerCase();
        const ok = (radId&&radId.startsWith('RAD-')&&iRad===radId.toLowerCase())
                ||(email&&iEmail===email.toLowerCase())
                ||(name&&iName===name.toLowerCase());
        if (ok) all.push({
          appointmentId:      item.appointmentId||item.id||uid,
          bookingReference:   item.bookingReference||'—',
          radiologyPatientId: item.radiologyPatientId||item.patientId||'—',
          serviceName:        item.serviceName||item.service||'—',
          servicePrice:       item.servicePrice||item.price||null,
          serviceDuration:    item.serviceDuration||item.duration||null,
          appointmentDate:    item.appointmentDate||item.date||'',
          appointmentTime:    item.appointmentTime||item.time||'',
          status:             item.status||'Pending',
          investigationStatus:item.investigationStatus||null,
          referralSource:     item.referralSource||item.clinicName||null,
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

// ── Info cell ─────────────────────────────────────────────────────────────────
function Cell({ icon:Icon, label, value, mono, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <div style={{fontSize:10,color:'#9ca3af',marginBottom:2,display:'flex',alignItems:'center',gap:3}}>
        <Icon size={9}/>{label}
      </div>
      <div style={{fontSize:12,fontWeight:700,color:highlight||'#111827',
        fontFamily:mono?'monospace':'inherit',wordBreak:'break-word'}}>
        {value}
      </div>
    </div>
  );
}

// ── Single appointment card ───────────────────────────────────────────────────
function AptCard({ apt, i }) {
  const sc      = STATUS_CFG[apt.status] || STATUS_CFG.Pending;
  const StatusIcon = sc.Icon;
  const svcColor   = getSvcColor(apt.serviceName);

  return (
    <motion.div
      initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
      style={{background:'white',borderRadius:16,overflow:'hidden',marginBottom:16,
        boxShadow:'0 2px 12px rgba(0,0,0,0.07)',border:`1px solid ${sc.border}`}}>

      {/* ── Header strip ─────────────────────────────────────────────────── */}
      <div style={{
        background:`linear-gradient(135deg,${svcColor}18,${svcColor}08)`,
        borderBottom:`2px solid ${svcColor}30`,
        padding:'16px 20px',
        display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {/* Color dot */}
          <div style={{width:10,height:10,borderRadius:'50%',background:svcColor,flexShrink:0}}/>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:'#111827'}}>{apt.serviceName}</div>
            <div style={{display:'flex',gap:14,fontSize:11,color:'#6b7280',marginTop:3,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{display:'flex',alignItems:'center',gap:3}}>
                <FaCalendarAlt size={10}/>{fmtDate(apt.appointmentDate)}
              </span>
              <span style={{display:'flex',alignItems:'center',gap:3}}>
                <FaClock size={10}/>{fmtTime(apt.appointmentTime)}
              </span>
              {apt.referralSource && (
                <span style={{display:'flex',alignItems:'center',gap:3}}>
                  <FaHospital size={10}/>{apt.referralSource}
                </span>
              )}
              {apt.doctorName && (
                <span style={{display:'flex',alignItems:'center',gap:3}}>
                  <FaUserMd size={10}/>{apt.doctorName}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Status badge */}
        <div style={{display:'flex',alignItems:'center',gap:6,
          background:sc.bg,borderRadius:20,padding:'5px 14px'}}>
          <StatusIcon size={11} color={sc.color}/>
          <span style={{fontSize:12,fontWeight:700,color:sc.color}}>{apt.status}</span>
        </div>
      </div>

      {/* ── Details grid ─────────────────────────────────────────────────── */}
      <div style={{padding:'14px 20px',display:'flex',gap:'20px 32px',flexWrap:'wrap',
        borderBottom:'1px solid #f3f4f6',background:'#fafafa'}}>
        <Cell icon={FaIdCard}        label="Radiology ID"  value={apt.radiologyPatientId} mono highlight="#0ea5e9"/>
        <Cell icon={FaTag}           label="Booking Ref"   value={apt.bookingReference}   mono/>
        <Cell icon={FaMoneyBillWave} label="Price"         value={apt.servicePrice}/>
        <Cell icon={FaClock}         label="Duration"      value={apt.serviceDuration ? `${apt.serviceDuration} min` : null}/>
        <Cell icon={FaCalendarAlt}   label="Booked on"     value={fmtDateTime(apt.createdAt)}/>
        {apt.approvedAt && <Cell icon={FaCheckCircle} label="Approved on" value={fmtDateTime(apt.approvedAt)}/>}
        {apt.completedAt && <Cell icon={FaCheckCircle} label="Completed on" value={fmtDateTime(apt.completedAt)} highlight="#059669"/>}
        {apt.investigationStatus && apt.investigationStatus !== apt.status && (
          <Cell icon={FaFileMedical} label="Investigation" value={apt.investigationStatus}/>
        )}
      </div>

      {/* ── Notes / rejection ────────────────────────────────────────────── */}
      {(apt.orderNotes || apt.rejectionReason) && (
        <div style={{padding:'10px 20px',borderBottom:'1px solid #f3f4f6'}}>
          {apt.orderNotes && (
            <div style={{fontSize:12,color:'#92400e',background:'#fffbeb',borderRadius:7,
              padding:'7px 12px',marginBottom:6,borderLeft:'3px solid #f59e0b',
              display:'flex',alignItems:'flex-start',gap:6}}>
              <FaUserMd size={11} style={{marginTop:1,flexShrink:0}}/> {apt.orderNotes}
            </div>
          )}
          {apt.rejectionReason && (
            <div style={{fontSize:12,color:'#dc2626',background:'#fef2f2',borderRadius:7,
              padding:'7px 12px',borderLeft:'3px solid #dc2626',
              display:'flex',alignItems:'flex-start',gap:6}}>
              <FaTimesCircle size={11} style={{marginTop:1,flexShrink:0}}/> {apt.rejectionReason}
            </div>
          )}
        </div>
      )}

      {/* ── Uploaded result files ─────────────────────────────────────────── */}
      {apt.uploadedFiles?.length > 0 && (
        <div style={{padding:'12px 20px'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#059669',marginBottom:8,
            display:'flex',alignItems:'center',gap:5}}>
            <FaFileAlt size={11}/>
            {apt.uploadedFiles.length} Result file{apt.uploadedFiles.length>1?'s':''}
            {apt.completedAt && (
              <span style={{fontSize:10,color:'#6b7280',fontWeight:400}}>
                · sent {fmtDateTime(apt.completedAt)}
              </span>
            )}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {apt.uploadedFiles.map((f,j) => (
              <div key={f.id||j} style={{display:'flex',alignItems:'center',gap:6,
                background:'#f0fdf4',border:'1px solid #6ee7b7',borderRadius:8,
                padding:'6px 12px'}}>
                <FaFileAlt size={12} color="#059669"/>
                <span style={{fontSize:12,fontWeight:600,color:'#065f46',
                  maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {f.fileName}
                </span>
                <a href={f.dataUrl||f.url} download={f.fileName} target="_blank" rel="noopener noreferrer"
                  title="Download"
                  style={{color:'#2563eb',display:'flex',alignItems:'center',marginLeft:4}}>
                  <FaDownload size={12}/>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AppointmentHistoryPage({ setPage }) {
  const [apts,      setApts]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const patientName = localStorage.getItem('radiologyPatientName') || 'Patient';
  const radId       = localStorage.getItem('radiologyPatientId')   || '—';

  const load = useCallback(() => {
    setLoading(true);
    setApts(readAppointments());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 10000);
    window.addEventListener('storage', load);
    return () => { clearInterval(iv); window.removeEventListener('storage', load); };
  }, [load]);

  const counts = {
    all:       apts.length,
    Pending:   apts.filter(a=>a.status==='Pending').length,
    Approved:  apts.filter(a=>a.status==='Approved').length,
    Completed: apts.filter(a=>a.status==='Completed').length,
    Rejected:  apts.filter(a=>a.status==='Rejected').length,
  };

  const TABS = [
    { key:'all',       label:`All (${counts.all})` },
    { key:'Pending',   label:`Pending (${counts.Pending})` },
    { key:'Approved',  label:`Approved (${counts.Approved})` },
    { key:'Completed', label:`Completed (${counts.Completed})` },
    { key:'Rejected',  label:`Rejected (${counts.Rejected})` },
  ];

  const filtered = activeTab==='all' ? apts : apts.filter(a=>a.status===activeTab);

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',paddingTop:28,paddingBottom:48}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 28px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          marginBottom:24,flexWrap:'wrap',gap:10}}>
          <div>
            <h1 style={{fontSize:24,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>
              My Appointments
            </h1>
            <div style={{fontSize:13,color:'#6b7280'}}>
              {patientName} ·{' '}
              <span style={{fontFamily:'monospace',color:'#0ea5e9',fontWeight:700}}>{radId}</span>
              <span style={{marginLeft:12,color:'#9ca3af'}}>· {counts.all} total</span>
            </div>
          </div>
          <button onClick={load}
            style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',
              borderRadius:10,border:'1px solid #e5e7eb',background:'white',
              color:'#6b7280',fontSize:12,fontWeight:600,cursor:'pointer'}}>
            <FaSync size={11}/> Refresh
          </button>
        </div>

        {/* Summary stat cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
          {[
            {label:'Total',     val:counts.all,       color:'#1e3a5f', bg:'#e0f2fe'},
            {label:'Pending',   val:counts.Pending,   color:'#d97706', bg:'#fef3c7'},
            {label:'Approved',  val:counts.Approved,  color:'#2563eb', bg:'#dbeafe'},
            {label:'Completed', val:counts.Completed, color:'#059669', bg:'#d1fae5'},
            {label:'Rejected',  val:counts.Rejected,  color:'#dc2626', bg:'#fee2e2'},
          ].map(s=>(
            <div key={s.label} style={{background:'white',borderRadius:12,padding:'12px 16px',
              boxShadow:'0 1px 4px rgba(0,0,0,0.06)',borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div>
              <div style={{fontSize:11,color:'#6b7280',fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
          {TABS.map(tab=>(
            <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
              style={{padding:'7px 16px',borderRadius:20,border:'none',fontSize:12,
                fontWeight:600,cursor:'pointer',transition:'all 0.15s',
                background:activeTab===tab.key?'#1e3a5f':'white',
                color:activeTab===tab.key?'white':'#6b7280',
                boxShadow:activeTab===tab.key?'0 2px 8px rgba(30,58,95,0.25)':'0 1px 3px rgba(0,0,0,0.06)'}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div style={{textAlign:'center',color:'#9ca3af',padding:60}}>Loading appointments…</div>
        )}

        {!loading && filtered.length===0 && (
          <div style={{background:'white',borderRadius:16,padding:'60px 20px',textAlign:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
            <FaCalendarAlt size={40} color="#e5e7eb" style={{marginBottom:12}}/>
            <div style={{fontSize:16,fontWeight:600,color:'#374151',marginBottom:6}}>
              {activeTab==='all'?'No appointments yet':`No ${activeTab} appointments`}
            </div>
            {activeTab==='all' && (
              <>
                <div style={{fontSize:13,color:'#9ca3af',marginBottom:20}}>
                  Your booked appointments will appear here automatically.
                </div>
                <button onClick={()=>setPage?.('patient-book-appointment')}
                  style={{padding:'10px 24px',borderRadius:10,border:'none',
                    background:'#1e3a5f',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                  Book an Appointment
                </button>
              </>
            )}
          </div>
        )}

        {!loading && filtered.map((apt,i)=>(
          <AptCard key={apt.appointmentId||i} apt={apt} i={i}/>
        ))}
      </div>
    </div>
  );
}