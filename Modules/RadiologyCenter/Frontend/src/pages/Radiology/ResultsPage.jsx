// src/pages/Radiology/RadiologyResultsPage.jsx
// Shows uploaded result files from localStorage (admin uploads these)

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDownload, FaWhatsapp, FaFilePdf, FaFileImage, FaFile,
  FaCalendarAlt, FaClock, FaCheckCircle, FaClock as FaPending,
  FaTimesCircle, FaArrowLeft, FaSync, FaEye, FaTimes,
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
  if (!t) return '';
  try {
    if (t.includes('T')) {
      const dt = new Date(t);
      return dt.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
    }
    const [h, m] = t.split(':'); const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  } catch { return t; }
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    const dt = new Date(iso);
    if (isNaN(dt)) return '—';
    return dt.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) +
           ' at ' + dt.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  } catch { return '—'; }
}

const STATUS = {
  Pending:      { bg:'#fef3c7', color:'#d97706', label:'Pending' },
  Approved:     { bg:'#dbeafe', color:'#2563eb', label:'Approved' },
  Completed:    { bg:'#d1fae5', color:'#059669', label:'Completed' },
  Rejected:     { bg:'#fee2e2', color:'#dc2626', label:'Rejected' },
  'In Progress':{ bg:'#ede9fe', color:'#7c3aed', label:'In Progress' },
};

function fileIcon(type) {
  if (!type) return <FaFile size={28} color="#64748b"/>;
  if (type.includes('pdf'))   return <FaFilePdf size={28} color="#dc2626"/>;
  if (type.includes('image')) return <FaFileImage size={28} color="#2563eb"/>;
  return <FaFile size={28} color="#64748b"/>;
}

// ── Read appointments + results from localStorage ─────────────────────────────
function readData() {
  const radId = localStorage.getItem('radiologyPatientId') || '';
  const email = localStorage.getItem('radiologyPatientEmail') || localStorage.getItem('userEmail') || '';
  const name  = localStorage.getItem('radiologyPatientName') || '';

  const aptKeys = ['radiologyAllAppointments', 'radiologyAdminPendingRequests'];
  const seen = new Set();
  const apts = [];

  for (const key of aptKeys) {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      for (const item of arr) {
        const uid = item.appointmentId || item.id || item.bookingReference;
        if (uid && seen.has(uid)) continue;
        if (uid) seen.add(uid);

        const iRad   = (item.radiologyPatientId || item.patientId || '').toLowerCase();
        const iEmail = (item.patientEmail || item.email || '').toLowerCase();
        const iName  = (item.patientName  || item.name  || '').toLowerCase();
        const ok = (radId && radId.startsWith('RAD-') && iRad === radId.toLowerCase())
                || (email && iEmail === email.toLowerCase())
                || (name  && iName  === name.toLowerCase());

        if (ok) apts.push({
          appointmentId:    item.appointmentId || item.id || uid,
          bookingReference: item.bookingReference || '—',
          radiologyPatientId: item.radiologyPatientId || item.patientId || '—',
          serviceName:      item.serviceName || item.service || '—',
          servicePrice:     item.servicePrice || '—',
          appointmentDate:  item.appointmentDate || '',
          appointmentTime:  item.appointmentTime || '',
          status:           item.status || 'Pending',
          investigationStatus: item.investigationStatus || '',
          uploadedFiles:    item.uploadedFiles || [],
          completedAt:      item.completedAt || item.updatedAt || '',
          createdAt:        item.createdAt || '',
          referralSource:   item.referralSource || null,
          orderNotes:       item.orderNotes || null,
          rejectionReason:  item.rejectionReason || null,
        });
      }
    } catch {}
  }

  return apts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ── File preview modal ────────────────────────────────────────────────────────
function PreviewModal({ file, onClose }) {
  const isImage = file.fileType?.includes('image');
  const isPdf   = file.fileType?.includes('pdf');

  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9999,
          display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
          onClick={e=>e.stopPropagation()}
          style={{background:'white',borderRadius:16,width:'90%',maxWidth:900,maxHeight:'90vh',
            overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {/* Header */}
          <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:'#111827'}}>{file.fileName}</div>
              <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>Uploaded {fmtDateTime(file.uploadedAt)}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <a href={file.dataUrl} download={file.fileName}
                style={{padding:'7px 14px',borderRadius:8,background:'#1e3a5f',color:'white',fontSize:12,fontWeight:600,
                  textDecoration:'none',display:'flex',alignItems:'center',gap:5}}>
                <FaDownload size={11}/> Download
              </a>
              <button onClick={onClose}
                style={{width:32,height:32,borderRadius:8,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                <FaTimes size={14} color="#6b7280"/>
              </button>
            </div>
          </div>
          {/* Content */}
          <div style={{flex:1,overflow:'auto',padding:20,background:'#f9fafb',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {isImage && <img src={file.dataUrl} alt={file.fileName} style={{maxWidth:'100%',maxHeight:'70vh',borderRadius:8,boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>}
            {isPdf && <iframe src={file.dataUrl} title={file.fileName} style={{width:'100%',height:'70vh',border:'none',borderRadius:8}}/>}
            {!isImage && !isPdf && (
              <div style={{textAlign:'center',padding:40}}>
                <FaFile size={48} color="#9ca3af" style={{marginBottom:12}}/>
                <div style={{fontSize:14,color:'#6b7280',marginBottom:16}}>{file.fileName}</div>
                <a href={file.dataUrl} download={file.fileName}
                  style={{padding:'10px 24px',borderRadius:10,background:'#1e3a5f',color:'white',fontSize:14,fontWeight:600,textDecoration:'none'}}>
                  Download File
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RadiologyResultsPage({ setPage }) {
  const [apts,       setApts]       = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [preview,    setPreview]    = useState(null);

  const radId = localStorage.getItem('radiologyPatientId') || '—';
  const name  = localStorage.getItem('radiologyPatientName') || 'Patient';

  const load = useCallback(() => {
    setLoading(true);
    const data = readData();
    setApts(data);
    if (!selected && data.length > 0) setSelected(data[0]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 8000);
    window.addEventListener('storage', load);
    return () => { clearInterval(iv); window.removeEventListener('storage', load); };
  }, [load]);

  const shareWhatsApp = (apt, file) => {
    const text = `*Radiology Result*\nPatient: ${name} (${apt.radiologyPatientId})\nTest: ${apt.serviceName}\nDate: ${fmtDate(apt.appointmentDate)}\nRef: ${apt.bookingReference}\n\n_Nile Radiology Center_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const completedApts = apts.filter(a => a.uploadedFiles?.length > 0);
  const otherApts     = apts.filter(a => !a.uploadedFiles?.length);

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',paddingTop:32,paddingBottom:40}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24,flexWrap:'wrap'}}>
          <button onClick={()=>setPage?.('home')}
            style={{background:'white',border:'1px solid #e5e7eb',borderRadius:10,padding:'8px 14px',
              cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#374151'}}>
            <FaArrowLeft size={11}/> Back
          </button>
          <div style={{flex:1}}>
            <h1 style={{fontSize:22,fontWeight:700,color:'#111827',margin:0}}>My Results</h1>
            <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>
              {name} · <span style={{fontFamily:'monospace',color:'#0ea5e9',fontWeight:700}}>{radId}</span>
            </div>
          </div>
          <button onClick={load}
            style={{background:'white',border:'1px solid #e5e7eb',borderRadius:10,padding:'8px 14px',
              cursor:'pointer',fontSize:12,color:'#6b7280',display:'flex',alignItems:'center',gap:5}}>
            <FaSync size={11}/> Refresh
          </button>
        </div>

        {loading && <div style={{textAlign:'center',color:'#9ca3af',padding:40}}>Loading…</div>}

        {!loading && apts.length === 0 && (
          <div style={{background:'white',borderRadius:16,padding:'60px 20px',textAlign:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <div style={{fontSize:16,fontWeight:600,color:'#374151',marginBottom:6}}>No appointments yet</div>
            <div style={{fontSize:13,color:'#9ca3af',marginBottom:20}}>Book an appointment to get started.</div>
            <button onClick={()=>setPage?.('patient-book-appointment')}
              style={{padding:'10px 24px',borderRadius:10,border:'none',background:'#1e3a5f',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>
              Book Appointment
            </button>
          </div>
        )}

        {!loading && apts.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20,alignItems:'start'}}>

            {/* LEFT list */}
            <div style={{background:'white',borderRadius:16,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
              {completedApts.length > 0 && (
                <>
                  <div style={{padding:'12px 16px',background:'#f0fdf4',borderBottom:'1px solid #e5e7eb'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#059669',textTransform:'uppercase',letterSpacing:0.5}}>
                      ✓ Results Ready ({completedApts.length})
                    </div>
                  </div>
                  {completedApts.map(apt => (
                    <div key={apt.appointmentId} onClick={()=>setSelected(apt)}
                      style={{padding:'14px 16px',borderBottom:'1px solid #f3f4f6',cursor:'pointer',
                        background:selected?.appointmentId===apt.appointmentId?'#eff6ff':'white',
                        borderLeft:`3px solid ${selected?.appointmentId===apt.appointmentId?'#2563eb':'transparent'}`}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#111827',marginBottom:3}}>{apt.serviceName}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>{fmtDate(apt.appointmentDate)}</div>
                      <div style={{fontSize:11,color:'#059669',marginTop:2}}>📎 {apt.uploadedFiles.length} file(s)</div>
                    </div>
                  ))}
                </>
              )}
              {otherApts.length > 0 && (
                <>
                  <div style={{padding:'12px 16px',background:'#f9fafb',borderBottom:'1px solid #e5e7eb',borderTop:completedApts.length?'1px solid #e5e7eb':'none'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:0.5}}>
                      Appointments ({otherApts.length})
                    </div>
                  </div>
                  {otherApts.map(apt => {
                    const sc = STATUS[apt.status] || STATUS.Pending;
                    return (
                      <div key={apt.appointmentId} onClick={()=>setSelected(apt)}
                        style={{padding:'14px 16px',borderBottom:'1px solid #f3f4f6',cursor:'pointer',
                          background:selected?.appointmentId===apt.appointmentId?'#f9fafb':'white',
                          borderLeft:`3px solid ${selected?.appointmentId===apt.appointmentId?'#9ca3af':'transparent'}`}}>
                        <div style={{fontSize:13,fontWeight:600,color:'#374151',marginBottom:3}}>{apt.serviceName}</div>
                        <div style={{fontSize:11,color:'#6b7280'}}>{fmtDate(apt.appointmentDate)}</div>
                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:600,background:sc.bg,color:sc.color,marginTop:4,display:'inline-block'}}>
                          {apt.status}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* RIGHT detail */}
            {selected && (
              <motion.div key={selected.appointmentId} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}}
                style={{background:'white',borderRadius:16,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>

                {/* Appointment info */}
                <div style={{marginBottom:20,paddingBottom:16,borderBottom:'1px solid #f3f4f6'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
                    <div>
                      <h2 style={{fontSize:20,fontWeight:700,color:'#111827',margin:'0 0 6px'}}>{selected.serviceName}</h2>
                      <div style={{display:'flex',gap:16,fontSize:12,color:'#6b7280',flexWrap:'wrap'}}>
                        <span style={{display:'flex',alignItems:'center',gap:4}}><FaCalendarAlt size={11}/>{fmtDate(selected.appointmentDate)}</span>
                        <span style={{display:'flex',alignItems:'center',gap:4}}><FaClock size={11}/>{fmtTime(selected.appointmentTime)}</span>
                        {selected.referralSource&&<span>🏥 {selected.referralSource}</span>}
                      </div>
                    </div>
                    {(() => { const sc=STATUS[selected.status]||STATUS.Pending; return (
                      <span style={{fontSize:11,padding:'4px 12px',borderRadius:20,fontWeight:700,background:sc.bg,color:sc.color}}>{sc.label}</span>
                    ); })()}
                  </div>

                  {/* Meta */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px 16px',marginTop:12,
                    background:'#f9fafb',borderRadius:10,padding:'10px 14px'}}>
                    {[
                      ['Radiology ID', selected.radiologyPatientId, true],
                      ['Booking Ref',  selected.bookingReference,   true],
                      ['Price',        selected.servicePrice,       false],
                      ['Booked on',    fmtDateTime(selected.createdAt), false],
                      selected.completedAt?['Results uploaded', fmtDateTime(selected.completedAt), false]:null,
                    ].filter(Boolean).map(([l,v,mono])=>(
                      <div key={l}>
                        <div style={{fontSize:10,color:'#9ca3af'}}>{l}</div>
                        <div style={{fontSize:12,fontWeight:600,color:l==='Radiology ID'?'#0ea5e9':'#374151',fontFamily:mono?'monospace':'inherit'}}>{v||'—'}</div>
                      </div>
                    ))}
                  </div>

                  {selected.orderNotes&&<div style={{marginTop:10,fontSize:12,color:'#92400e',background:'#fffbeb',borderRadius:6,padding:'7px 12px',borderLeft:'3px solid #f59e0b'}}>📝 {selected.orderNotes}</div>}
                  {selected.rejectionReason&&<div style={{marginTop:10,fontSize:12,color:'#dc2626',background:'#fef2f2',borderRadius:6,padding:'7px 12px'}}>✕ Rejected: {selected.rejectionReason}</div>}
                </div>

                {/* Result files */}
                {selected.uploadedFiles?.length > 0 ? (
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:'#111827',marginBottom:14,display:'flex',alignItems:'center',gap:6}}>
                      <FaCheckCircle size={14} color="#059669"/> Results ({selected.uploadedFiles.length} file{selected.uploadedFiles.length>1?'s':''})
                      {selected.completedAt && (
                        <span style={{fontSize:11,color:'#6b7280',fontWeight:400,marginLeft:4}}>
                          — uploaded {fmtDateTime(selected.completedAt)}
                        </span>
                      )}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
                      {selected.uploadedFiles.map((f, i) => (
                        <motion.div key={f.id||i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                          style={{border:'1px solid #e5e7eb',borderRadius:12,padding:16,background:'#fafafa',
                            display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center'}}>
                          {/* Thumbnail */}
                          <div style={{width:80,height:80,borderRadius:10,overflow:'hidden',background:'#f3f4f6',
                            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,cursor:'pointer'}}
                            onClick={()=>setPreview(f)}>
                            {f.fileType?.includes('image')
                              ? <img src={f.dataUrl} alt={f.fileName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                              : fileIcon(f.fileType)
                            }
                          </div>
                          <div style={{fontSize:11,fontWeight:600,color:'#374151',wordBreak:'break-word',lineHeight:1.3}}>{f.fileName}</div>
                          <div style={{fontSize:10,color:'#9ca3af'}}>{fmtDateTime(f.uploadedAt)}</div>
                          {/* Action icons */}
                          <div style={{display:'flex',gap:12,marginTop:4}}>
                            <button onClick={()=>setPreview(f)} title="Preview"
                              style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',padding:4}}>
                              <FaEye size={16}/>
                            </button>
                            <a href={f.dataUrl} download={f.fileName} title="Download"
                              style={{color:'#2563eb',padding:4,display:'flex',alignItems:'center'}}>
                              <FaDownload size={16}/>
                            </a>
                            <button onClick={()=>shareWhatsApp(selected, f)} title="Share on WhatsApp"
                              style={{background:'none',border:'none',cursor:'pointer',color:'#25d366',padding:4}}>
                              <FaWhatsapp size={16}/>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign:'center',padding:'40px 20px',color:'#9ca3af'}}>
                    <div style={{fontSize:36,marginBottom:10}}>⏳</div>
                    <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>
                      {selected.status==='Rejected' ? 'Appointment rejected' : 'Results not yet available'}
                    </div>
                    <div style={{fontSize:12}}>
                      {selected.status==='Rejected'
                        ? 'Please book a new appointment.'
                        : 'The radiologist will upload your results after the investigation is completed.'}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && <PreviewModal file={preview} onClose={()=>setPreview(null)}/>}
    </div>
  );
}