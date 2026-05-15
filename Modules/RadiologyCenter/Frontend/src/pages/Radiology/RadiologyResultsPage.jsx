// src/pages/Radiology/RadiologyResultsPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDownload, FaWhatsapp, FaFilePdf, FaFileImage, FaFile,
  FaCalendarAlt, FaClock, FaCheckCircle, FaEye, FaTimes,
  FaIdCard, FaTag, FaMoneyBillWave, FaHospital,
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
    if (t.includes('T')) return new Date(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    const [h,m]=t.split(':'); const hr=parseInt(h);
    return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}`;
  } catch { return t; }
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    const dt = new Date(iso);
    if (isNaN(dt)) return '—';
    return dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) +
           ' at ' + dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  } catch { return '—'; }
}

const SERVICE_COLORS = {
  'MRI Scan':           'linear-gradient(135deg,#1f6bff,#06b6d4)',
  'CT Scan':            'linear-gradient(135deg,#00b8a8,#059669)',
  'X-Ray':              'linear-gradient(135deg,#28a745,#84cc16)',
  'OCT':                'linear-gradient(135deg,#8b5cf6,#a855f7)',
  'Ultrasound':         'linear-gradient(135deg,#14b8a6,#06b6d4)',
  'Blood Sugar':        'linear-gradient(135deg,#f59e0b,#f97316)',
  'CBC':                'linear-gradient(135deg,#ef4444,#ec4899)',
  'Visual Field Test':  'linear-gradient(135deg,#7c3aed,#6366f1)',
  'Corneal Topography': 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
  'Specular Microscopy':'linear-gradient(135deg,#0284c7,#0ea5e9)',
  'ERG':                'linear-gradient(135deg,#f97316,#fbbf24)',
  'EOG':                'linear-gradient(135deg,#fb923c,#f59e0b)',
  'Genetic Testing':    'linear-gradient(135deg,#a855f7,#ec4899)',
};
const getGrad = (name) => SERVICE_COLORS[name] || 'linear-gradient(135deg,#1e3a5f,#0ea5e9)';

const STATUS = {
  Pending:      {bg:'#fef3c7',color:'#d97706'},
  Approved:     {bg:'#dbeafe',color:'#2563eb'},
  Completed:    {bg:'#d1fae5',color:'#059669'},
  Rejected:     {bg:'#fee2e2',color:'#dc2626'},
  'In Progress':{bg:'#ede9fe',color:'#7c3aed'},
};

function FileIcon({type, size=40}) {
  if (type?.includes('pdf'))   return <FaFilePdf   size={size} color="#dc2626"/>;
  if (type?.includes('image')) return <FaFileImage size={size} color="#2563eb"/>;
  return <FaFile size={size} color="#64748b"/>;
}

// ── Read from localStorage ────────────────────────────────────────────────────
function readData() {
  const radId = localStorage.getItem('radiologyPatientId') || '';
  const email = localStorage.getItem('radiologyPatientEmail') || localStorage.getItem('userEmail') || '';
  const name  = localStorage.getItem('radiologyPatientName') || '';
  const seen  = new Set();
  const apts  = [];

  for (const key of ['radiologyAllAppointments','radiologyAdminPendingRequests']) {
    try {
      const arr = JSON.parse(localStorage.getItem(key)||'[]');
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
        if (ok) apts.push({
          appointmentId:      item.appointmentId||item.id||uid,
          bookingReference:   item.bookingReference||'—',
          radiologyPatientId: item.radiologyPatientId||item.patientId||'—',
          serviceName:        item.serviceName||item.service||'—',
          servicePrice:       item.servicePrice||item.price||null,
          appointmentDate:    item.appointmentDate||'',
          appointmentTime:    item.appointmentTime||'',
          status:             item.status||'Pending',
          uploadedFiles:      item.uploadedFiles||[],
          completedAt:        item.completedAt||item.updatedAt||null,
          createdAt:          item.createdAt||'',
          referralSource:     item.referralSource||null,
          orderNotes:         item.orderNotes||null,
          rejectionReason:    item.rejectionReason||null,
        });
      }
    } catch {}
  }
  return apts.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({ file, onClose }) {
  const isImg = file.fileType?.includes('image');
  const isPdf = file.fileType?.includes('pdf');
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9999,
        display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <motion.div initial={{scale:0.92}} animate={{scale:1}}
        onClick={e=>e.stopPropagation()}
        style={{background:'white',borderRadius:16,width:'92%',maxWidth:960,
          maxHeight:'92vh',overflow:'hidden',display:'flex',flexDirection:'column',
          boxShadow:'0 24px 64px rgba(0,0,0,0.5)'}}>
        <div style={{padding:'14px 20px',borderBottom:'1px solid #e5e7eb',background:'#f9fafb',
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#111827'}}>{file.fileName}</div>
            <div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>Uploaded {fmtDateTime(file.uploadedAt)}</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <a href={file.dataUrl} download={file.fileName}
              style={{padding:'7px 16px',borderRadius:8,background:'#1e3a5f',color:'white',
                fontSize:12,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:5}}>
              <FaDownload size={11}/> Download
            </a>
            <button onClick={onClose}
              style={{width:32,height:32,borderRadius:8,border:'1px solid #e5e7eb',
                background:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <FaTimes size={13} color="#6b7280"/>
            </button>
          </div>
        </div>
        <div style={{flex:1,overflow:'auto',padding:24,background:'#111827',
          display:'flex',alignItems:'center',justifyContent:'center',minHeight:420}}>
          {isImg && <img src={file.dataUrl} alt={file.fileName}
            style={{maxWidth:'100%',maxHeight:'75vh',borderRadius:8,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}/>}
          {isPdf && <iframe src={file.dataUrl} title={file.fileName}
            style={{width:'100%',height:'75vh',border:'none',borderRadius:8}}/>}
          {!isImg && !isPdf && (
            <div style={{textAlign:'center',color:'white'}}>
              <FileIcon type={file.fileType} size={64}/>
              <div style={{fontSize:14,marginTop:16,marginBottom:24}}>{file.fileName}</div>
              <a href={file.dataUrl} download={file.fileName}
                style={{padding:'10px 24px',borderRadius:10,background:'white',color:'#1e3a5f',
                  fontSize:14,fontWeight:700,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6}}>
                <FaDownload size={14}/> Download File
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RadiologyResultsPage({ setPage }) {
  const [apts,     setApts]     = useState([]);
  // selected is now only changed by user click, never auto-switched
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [preview,  setPreview]  = useState(null);

  const radId = localStorage.getItem('radiologyPatientId') || '—';
  const pname = localStorage.getItem('radiologyPatientName') || 'Patient';

  const load = useCallback(() => {
    setLoading(true);
    const data = readData();
    setApts(data);
    // Only set initial selection once — never auto-switch after that
    setSelected(prev => {
      if (prev) {
        // keep existing selection if still present
        const stillExists = data.find(a => a.appointmentId === prev.appointmentId);
        return stillExists || (data[0] ?? null);
      }
      return data[0] ?? null;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 8000);
    window.addEventListener('storage', load);
    return () => { clearInterval(iv); window.removeEventListener('storage', load); };
  }, [load]);

  const shareWhatsApp = (apt) => {
    const text = `*Radiology Result*\nPatient: ${pname} (${apt.radiologyPatientId})\nTest: ${apt.serviceName}\nDate: ${fmtDate(apt.appointmentDate)}\nRef: ${apt.bookingReference}\n\n_Nile Radiology Center_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const completed = apts.filter(a => a.uploadedFiles?.length > 0);
  const others    = apts.filter(a => !a.uploadedFiles?.length);

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',paddingTop:28,paddingBottom:48}}>
      <div style={{maxWidth:1140,margin:'0 auto',padding:'0 24px'}}>

        {/* Header */}
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>My Results</h1>
          <div style={{fontSize:13,color:'#6b7280'}}>
            {pname} ·{' '}
            <span style={{fontFamily:'monospace',color:'#0ea5e9',fontWeight:700}}>{radId}</span>
          </div>
        </div>

        {loading && <div style={{textAlign:'center',color:'#9ca3af',padding:60}}>Loading…</div>}

        {!loading && apts.length === 0 && (
          <div style={{background:'white',borderRadius:20,padding:'80px 20px',textAlign:'center',
            boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
            <FaFile size={48} color="#e5e7eb" style={{marginBottom:16}}/>
            <div style={{fontSize:18,fontWeight:600,color:'#374151',marginBottom:6}}>No appointments yet</div>
            <div style={{fontSize:13,color:'#9ca3af',marginBottom:24}}>Book an appointment to get started.</div>
            <button onClick={()=>setPage?.('patient-book-appointment')}
              style={{padding:'11px 28px',borderRadius:10,border:'none',background:'#1e3a5f',
                color:'white',fontSize:14,fontWeight:600,cursor:'pointer'}}>
              Book Appointment
            </button>
          </div>
        )}

        {!loading && apts.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:20,alignItems:'start'}}>

            {/* ── LEFT LIST ──────────────────────────────────────────────── */}
            <div style={{background:'white',borderRadius:16,overflow:'hidden',
              boxShadow:'0 1px 4px rgba(0,0,0,0.07)',position:'sticky',top:88}}>

              {completed.length > 0 && (
                <>
                  <div style={{padding:'10px 16px',background:'#f0fdf4',borderBottom:'1px solid #e5e7eb'}}>
                    <div style={{fontSize:10,fontWeight:800,color:'#059669',
                      textTransform:'uppercase',letterSpacing:0.8,display:'flex',alignItems:'center',gap:5}}>
                      <FaCheckCircle size={10}/> Results Ready ({completed.length})
                    </div>
                  </div>
                  {completed.map(apt => {
                    const sel = selected?.appointmentId === apt.appointmentId;
                    return (
                      <div key={apt.appointmentId}
                        onClick={() => setSelected(apt)}
                        style={{padding:'12px 16px',borderBottom:'1px solid #f3f4f6',cursor:'pointer',
                          background:sel?'#eff6ff':'white',
                          borderLeft:`3px solid ${sel?'#2563eb':'transparent'}`,transition:'all 0.15s'}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#111827',marginBottom:2}}>{apt.serviceName}</div>
                        <div style={{fontSize:11,color:'#6b7280'}}>{fmtDate(apt.appointmentDate)}</div>
                        <div style={{fontSize:10,color:'#059669',marginTop:3,display:'flex',alignItems:'center',gap:3}}>
                          <FaCheckCircle size={9}/> {apt.uploadedFiles.length} file(s)
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {others.length > 0 && (
                <>
                  <div style={{padding:'10px 16px',background:'#f9fafb',
                    borderBottom:'1px solid #e5e7eb',borderTop:completed.length?'1px solid #e5e7eb':'none'}}>
                    <div style={{fontSize:10,fontWeight:800,color:'#6b7280',
                      textTransform:'uppercase',letterSpacing:0.8}}>
                      Appointments ({others.length})
                    </div>
                  </div>
                  {others.map(apt => {
                    const sc  = STATUS[apt.status]||STATUS.Pending;
                    const sel = selected?.appointmentId === apt.appointmentId;
                    return (
                      <div key={apt.appointmentId}
                        onClick={() => setSelected(apt)}
                        style={{padding:'12px 16px',borderBottom:'1px solid #f3f4f6',cursor:'pointer',
                          background:sel?'#f9fafb':'white',
                          borderLeft:`3px solid ${sel?'#9ca3af':'transparent'}`,transition:'all 0.15s'}}>
                        <div style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:2}}>{apt.serviceName}</div>
                        <div style={{fontSize:11,color:'#6b7280',marginBottom:4}}>{fmtDate(apt.appointmentDate)}</div>
                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:600,
                          background:sc.bg,color:sc.color}}>{apt.status}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* ── RIGHT DETAIL ───────────────────────────────────────────── */}
            {selected && (
              <motion.div key={selected.appointmentId}
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                style={{background:'white',borderRadius:16,overflow:'hidden',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>

                {/* Colorful header */}
                <div style={{background:getGrad(selected.serviceName),padding:'24px 28px',color:'white'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                    <div>
                      <div style={{fontSize:26,fontWeight:800,marginBottom:8,letterSpacing:-0.3}}>
                        {selected.serviceName}
                      </div>
                      <div style={{display:'flex',gap:18,fontSize:12,opacity:0.9,flexWrap:'wrap',alignItems:'center'}}>
                        <span style={{display:'flex',alignItems:'center',gap:4}}>
                          <FaCalendarAlt size={11}/>{fmtDate(selected.appointmentDate)}
                        </span>
                        <span style={{display:'flex',alignItems:'center',gap:4}}>
                          <FaClock size={11}/>{fmtTime(selected.appointmentTime)}
                        </span>
                        {selected.referralSource && (
                          <span style={{display:'flex',alignItems:'center',gap:4}}>
                            <FaHospital size={11}/>{selected.referralSource}
                          </span>
                        )}
                      </div>
                    </div>
                    {(() => { const sc=STATUS[selected.status]||STATUS.Pending; return (
                      <span style={{fontSize:12,padding:'5px 16px',borderRadius:20,fontWeight:700,
                        background:'rgba(255,255,255,0.25)',color:'white',backdropFilter:'blur(4px)',
                        whiteSpace:'nowrap'}}>
                        {selected.status}
                      </span>
                    );})()}
                  </div>
                </div>

                {/* Meta row — all 5 fields in one row */}
                <div style={{padding:'14px 28px',background:'#f9fafb',borderBottom:'1px solid #e5e7eb',
                  display:'flex',gap:'24px',flexWrap:'wrap',alignItems:'flex-start'}}>
                  {[
                    {Icon:FaIdCard,        label:'Radiology ID',    val:selected.radiologyPatientId, color:'#0ea5e9', mono:true},
                    {Icon:FaTag,           label:'Booking Ref',     val:selected.bookingReference,   color:'#374151', mono:true},
                    {Icon:FaMoneyBillWave, label:'Price',           val:selected.servicePrice,       color:'#374151', mono:false},
                    {Icon:FaCalendarAlt,   label:'Booked on',       val:fmtDateTime(selected.createdAt), color:'#374151', mono:false},
                    ...(selected.completedAt ? [{Icon:FaCheckCircle, label:'Results uploaded', val:fmtDateTime(selected.completedAt), color:'#059669', mono:false}] : []),
                  ].map(({Icon,label,val,color,mono}) => (
                    <div key={label} style={{minWidth:100}}>
                      <div style={{fontSize:10,color:'#9ca3af',marginBottom:3,
                        display:'flex',alignItems:'center',gap:3}}>
                        <Icon size={9} color="#9ca3af"/>{label}
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color,
                        fontFamily:mono?'monospace':'inherit'}}>
                        {val && val !== '—' && val !== null ? val : '—'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Content area */}
                <div style={{padding:'24px 28px'}}>

                  {selected.orderNotes && (
                    <div style={{fontSize:12,color:'#92400e',background:'#fffbeb',borderRadius:8,
                      padding:'8px 14px',marginBottom:20,borderLeft:'3px solid #f59e0b'}}>
                      {selected.orderNotes}
                    </div>
                  )}
                  {selected.rejectionReason && (
                    <div style={{fontSize:12,color:'#dc2626',background:'#fef2f2',borderRadius:8,
                      padding:'8px 14px',marginBottom:20}}>
                      Rejected: {selected.rejectionReason}
                    </div>
                  )}

                  {/* Files */}
                  {selected.uploadedFiles?.length > 0 ? (
                    <>
                      <div style={{fontSize:14,fontWeight:700,color:'#111827',
                        marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                        <FaCheckCircle size={14} color="#059669"/>
                        {selected.uploadedFiles.length} Result file{selected.uploadedFiles.length>1?'s':''}
                        {selected.completedAt && (
                          <span style={{fontSize:11,color:'#6b7280',fontWeight:400}}>
                            · {fmtDateTime(selected.completedAt)}
                          </span>
                        )}
                      </div>

                      {/* Centered files — max 2 columns, cards are wide */}
                      <div style={{
                        display:'flex',
                        flexWrap:'wrap',
                        gap:24,
                        justifyContent:'center',
                      }}>
                        {selected.uploadedFiles.map((f, i) => {
                          const isImg = f.fileType?.includes('image');
                          return (
                            <motion.div key={f.id||i}
                              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                              style={{
                                width:320,
                                borderRadius:16,
                                overflow:'hidden',
                                border:'1px solid #e5e7eb',
                                boxShadow:'0 4px 16px rgba(0,0,0,0.08)',
                                background:'white',
                              }}>

                              {/* Image / file preview */}
                              <div
                                onClick={()=>setPreview(f)}
                                style={{
                                  height:240,
                                  background:'#111827',
                                  cursor:'pointer',
                                  display:'flex',
                                  alignItems:'center',
                                  justifyContent:'center',
                                  overflow:'hidden',
                                  position:'relative',
                                }}>
                                {isImg
                                  ? <img src={f.dataUrl} alt={f.fileName}
                                      style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                                  : <div style={{textAlign:'center',padding:32}}>
                                      <FileIcon type={f.fileType} size={64}/>
                                      <div style={{color:'rgba(255,255,255,0.7)',fontSize:13,marginTop:12}}>
                                        {f.fileName}
                                      </div>
                                    </div>
                                }
                                {/* Click-to-preview overlay */}
                                <div style={{
                                  position:'absolute',bottom:10,right:10,
                                  background:'rgba(0,0,0,0.55)',borderRadius:8,
                                  padding:'4px 10px',display:'flex',alignItems:'center',gap:5,
                                  fontSize:11,color:'white',pointerEvents:'none',
                                }}>
                                  <FaEye size={10}/> Click to preview
                                </div>
                              </div>

                              {/* File info */}
                              <div style={{padding:'14px 16px'}}>
                                <div style={{
                                  fontSize:13,fontWeight:700,color:'#111827',
                                  marginBottom:3,
                                  wordBreak:'break-word',lineHeight:1.3,
                                }}>
                                  {f.fileName}
                                </div>
                                <div style={{fontSize:11,color:'#9ca3af',marginBottom:14}}>
                                  Uploaded {fmtDateTime(f.uploadedAt)}
                                </div>

                                {/* Action buttons — clear and labeled */}
                                <div style={{display:'flex',gap:8}}>
                                  <button
                                    onClick={()=>setPreview(f)}
                                    style={{
                                      flex:1,padding:'9px 0',borderRadius:9,
                                      border:'1px solid #e5e7eb',background:'#f9fafb',
                                      cursor:'pointer',display:'flex',alignItems:'center',
                                      justifyContent:'center',gap:6,
                                      fontSize:12,fontWeight:600,color:'#374151',
                                    }}>
                                    <FaEye size={13}/> View
                                  </button>
                                  <a
                                    href={f.dataUrl} download={f.fileName}
                                    style={{
                                      flex:1,padding:'9px 0',borderRadius:9,
                                      border:'none',background:'#1e3a5f',
                                      cursor:'pointer',display:'flex',alignItems:'center',
                                      justifyContent:'center',gap:6,
                                      fontSize:12,fontWeight:600,color:'white',
                                      textDecoration:'none',
                                    }}>
                                    <FaDownload size={13}/> Download
                                  </a>
                                  <button
                                    onClick={()=>shareWhatsApp(selected)}
                                    style={{
                                      flex:1,padding:'9px 0',borderRadius:9,
                                      border:'none',background:'#25d366',
                                      cursor:'pointer',display:'flex',alignItems:'center',
                                      justifyContent:'center',gap:6,
                                      fontSize:12,fontWeight:600,color:'white',
                                    }}>
                                    <FaWhatsapp size={13}/> Share
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{textAlign:'center',padding:'56px 20px',color:'#9ca3af'}}>
                      <FaClock size={44} color="#e5e7eb" style={{marginBottom:14}}/>
                      <div style={{fontSize:15,fontWeight:600,color:'#374151',marginBottom:6}}>
                        {selected.status==='Rejected' ? 'Appointment rejected' : 'Results not yet available'}
                      </div>
                      <div style={{fontSize:13}}>
                        {selected.status==='Rejected'
                          ? 'Please book a new appointment.'
                          : 'Your results will appear here once the radiologist uploads them.'}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {preview && <PreviewModal file={preview} onClose={()=>setPreview(null)}/>}
    </div>
  );
}