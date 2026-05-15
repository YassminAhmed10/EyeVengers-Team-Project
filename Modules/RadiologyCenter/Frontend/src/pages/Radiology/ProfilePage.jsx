// src/pages/Radiology/ProfilePage.jsx — No Firebase, no patientStatsService
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt,
  FaEdit, FaSave, FaHistory, FaStethoscope, FaFileMedical,
  FaSignOutAlt, FaTimes,
} from 'react-icons/fa';

function readPatientAppointments() {
  const radId = localStorage.getItem('radiologyPatientId') || '';
  const email = localStorage.getItem('radiologyPatientEmail') || localStorage.getItem('userEmail') || '';
  const name  = localStorage.getItem('radiologyPatientName') || '';
  const keys  = ['radiologyAllAppointments','radiologyAdminPendingRequests'];
  const seen  = new Set();
  const all   = [];
  for (const key of keys) {
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
          appointmentId:   item.appointmentId||item.id||uid,
          bookingReference:item.bookingReference||'—',
          serviceName:     item.serviceName||item.service||'—',
          servicePrice:    item.servicePrice||'—',
          appointmentDate: item.appointmentDate||'',
          appointmentTime: item.appointmentTime||'',
          status:          item.status||'Pending',
          uploadedFiles:   item.uploadedFiles||[],
          createdAt:       item.createdAt||new Date().toISOString(),
        });
      }
    } catch {}
  }
  return all.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
  catch { return d; }
}
function fmtTime(t) {
  if (!t) return '';
  const [h,m]=t.split(':'); const hr=parseInt(h);
  return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}`;
}

const SC = {
  Pending:      {bg:'#fef3c7',color:'#d97706'},
  Approved:     {bg:'#dbeafe',color:'#2563eb'},
  Rejected:     {bg:'#fee2e2',color:'#dc2626'},
  Completed:    {bg:'#d1fae5',color:'#059669'},
  'In Progress':{bg:'#ede9fe',color:'#7c3aed'},
};

export default function ProfilePage({ setPage, onLogout }) {
  const [pat, setPat] = useState({
    name:        localStorage.getItem('radiologyPatientName')         || '',
    email:       localStorage.getItem('radiologyPatientEmail')        || localStorage.getItem('userEmail') || '',
    phone:       localStorage.getItem('radiologyPatientPhone')        || '',
    radId:       localStorage.getItem('radiologyPatientId')           || '—',
    gender:      localStorage.getItem('radiologyPatientGender')       || '',
    dateOfBirth: localStorage.getItem('radiologyPatientDateOfBirth')  || '',
    nationalId:  localStorage.getItem('radiologyPatientNationalId')   || '',
    address:     localStorage.getItem('radiologyPatientAddress')      || '',
  });
  const [apts, setApts]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit]       = useState({ name:pat.name, email:pat.email, phone:pat.phone });

  const load = useCallback(() => {
    setLoading(true);
    setApts(readPatientAppointments());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 10000);
    window.addEventListener('storage', load);
    return () => { clearInterval(iv); window.removeEventListener('storage', load); };
  }, [load]);

  const save = () => {
    localStorage.setItem('radiologyPatientName',  edit.name);
    localStorage.setItem('radiologyPatientEmail', edit.email);
    localStorage.setItem('radiologyPatientPhone', edit.phone);
    setPat(p => ({ ...p, ...edit }));
    setEditing(false);
  };

  const stats = {
    total:     apts.length,
    pending:   apts.filter(a=>a.status==='Pending').length,
    approved:  apts.filter(a=>a.status==='Approved').length,
    completed: apts.filter(a=>a.status==='Completed').length,
  };

  const initials = pat.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', padding:'32px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:'#1f2937', margin:'0 0 4px' }}>My Profile</h1>
        <p style={{ fontSize:13, color:'#6b7280', marginBottom:24 }}>Manage your information and appointment history</p>

        <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:24, alignItems:'start' }}>

          {/* ── LEFT: Profile card ─────────────────────────────────────────── */}
          <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.07)' }}>
            {/* Blue header */}
            <div style={{ background:'linear-gradient(135deg,#1e3a5f,#0ea5e9)', padding:'28px 20px', textAlign:'center', color:'white' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, margin:'0 auto 12px' }}>
                {initials}
              </div>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{pat.name||'Patient'}</div>
              <div style={{ fontSize:11, opacity:0.8, marginBottom:4 }}>Radiology Patient ID</div>
              <div style={{ fontSize:16, fontWeight:700, fontFamily:'monospace' }}>{pat.radId}</div>
            </div>

            {/* Info / Edit */}
            <div style={{ padding:'20px' }}>
              {editing ? (
                <>
                  {[['Name','name','text'],['Email','email','email'],['Phone','phone','tel']].map(([l,k,t])=>(
                    <div key={k} style={{ marginBottom:14 }}>
                      <label style={{ fontSize:11, fontWeight:600, color:'#64748b', display:'block', marginBottom:5 }}>{l}</label>
                      <input type={t} value={edit[k]} onChange={e=>setEdit(p=>({...p,[k]:e.target.value}))}
                        style={{ width:'100%', padding:'9px 12px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:13, boxSizing:'border-box', outline:'none' }}/>
                    </div>
                  ))}
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={save} style={{ flex:1, padding:'9px', borderRadius:8, border:'none', background:'#1e3a5f', color:'white', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                      <FaSave size={12}/> Save
                    </button>
                    <button onClick={()=>setEditing(false)} style={{ flex:1, padding:'9px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#64748b', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {[
                    [FaEnvelope,'Email',        pat.email||'—'],
                    [FaPhone,   'Phone',        pat.phone||'—'],
                    [FaIdCard,  'Radiology ID', pat.radId],
                  ].map(([Icon,label,val])=>(
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
                      <Icon size={14} style={{ color:'#94a3b8', flexShrink:0 }}/>
                      <div>
                        <div style={{ fontSize:10, color:'#94a3b8' }}>{label}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#1e3a5f', fontFamily:label==='Radiology ID'?'monospace':'inherit' }}>{val}</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>{ setEdit({name:pat.name,email:pat.email,phone:pat.phone}); setEditing(true); }}
                    style={{ width:'100%', marginTop:14, padding:'9px', borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#334155', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    <FaEdit size={12}/> Edit Profile
                  </button>
                  <button onClick={onLogout}
                    style={{ width:'100%', marginTop:8, padding:'9px', borderRadius:8, border:'1px solid #fecaca', background:'white', color:'#dc2626', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    <FaSignOutAlt size={12}/> Sign Out
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT ─────────────────────────────────────────────────────── */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              {[
                {label:'Total',     value:stats.total,     color:'#1e3a5f', bg:'#e0f2fe'},
                {label:'Pending',   value:stats.pending,   color:'#d97706', bg:'#fef3c7'},
                {label:'Approved',  value:stats.approved,  color:'#2563eb', bg:'#dbeafe'},
                {label:'Completed', value:stats.completed, color:'#059669', bg:'#d1fae5'},
              ].map(({label,value,color,bg},i)=>(
                <motion.div key={label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                  style={{ background:'white', borderRadius:14, padding:'16px 14px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', textAlign:'center' }}>
                  <div style={{ fontSize:28, fontWeight:700, color, marginBottom:4 }}>{value}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>{label}</div>
                </motion.div>
              ))}
            </div>

            {/* Appointment history */}
            <div style={{ background:'white', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', overflow:'hidden' }}>
              <div style={{ padding:'18px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#1f2937', margin:0, display:'flex', alignItems:'center', gap:8 }}>
                  <FaHistory size={14} style={{ color:'#1e3a5f' }}/> Appointment History
                </h3>
                {apts.length > 0 && (
                  <button onClick={()=>setPage?.('patient-appointments')}
                    style={{ background:'none', border:'none', color:'#2563eb', fontSize:12, cursor:'pointer', fontWeight:500 }}>
                    View all →
                  </button>
                )}
              </div>
              <div style={{ padding:'16px 20px' }}>
                {loading && <div style={{ textAlign:'center', color:'#94a3b8', padding:'20px' }}>Loading…</div>}
                {!loading && apts.length === 0 && (
                  <div style={{ textAlign:'center', padding:'40px 20px', color:'#94a3b8' }}>
                    <FaCalendarAlt size={36} style={{ opacity:0.3, marginBottom:12 }}/>
                    <div style={{ fontSize:15, fontWeight:500, marginBottom:6 }}>No appointments yet</div>
                    <button onClick={()=>setPage?.('patient-book-appointment')}
                      style={{ marginTop:10, padding:'9px 20px', borderRadius:10, border:'none', background:'#1e3a5f', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      Book Your First Appointment
                    </button>
                  </div>
                )}
                {!loading && apts.slice(0,5).map((apt,i)=>{
                  const sc = SC[apt.status]||SC.Pending;
                  return (
                    <div key={apt.appointmentId||i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:i<Math.min(apts.length,5)-1?'1px solid #f8fafc':'none', flexWrap:'wrap', gap:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:'#1e3a5f', marginBottom:2 }}>{apt.serviceName}</div>
                        <div style={{ fontSize:12, color:'#64748b' }}>
                          {fmtDate(apt.appointmentDate)} {apt.appointmentTime && `at ${fmtTime(apt.appointmentTime)}`}
                        </div>
                        <div style={{ fontSize:11, color:'#94a3b8', fontFamily:'monospace' }}>{apt.bookingReference}</div>
                        {apt.uploadedFiles?.length>0 && (
                          <div style={{ marginTop:4, display:'flex', gap:5, flexWrap:'wrap' }}>
                            {apt.uploadedFiles.map(f=>(
                              <a key={f.id} href={f.dataUrl||f.url} download={f.fileName} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize:10, padding:'2px 8px', background:'#eff6ff', color:'#2563eb', borderRadius:4, textDecoration:'none' }}>
                                📎 {f.fileName}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600, background:sc.bg, color:sc.color }}>
                        {apt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background:'white', borderRadius:16, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#1f2937', margin:'0 0 14px', display:'flex', alignItems:'center', gap:8 }}>
                <FaStethoscope size={14} style={{ color:'#1e3a5f' }}/> Quick Actions
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <button onClick={()=>setPage?.('patient-book-appointment')}
                  style={{ padding:'12px', borderRadius:10, border:'none', background:'#e0f2fe', color:'#1e3a5f', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <FaCalendarAlt size={13}/> Book Appointment
                </button>
                <button onClick={()=>setPage?.('patient-results')}
                  style={{ padding:'12px', borderRadius:10, border:'none', background:'#d1fae5', color:'#065f46', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  <FaFileMedical size={13}/> View Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}