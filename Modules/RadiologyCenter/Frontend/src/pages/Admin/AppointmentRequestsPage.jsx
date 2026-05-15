// src/pages/Admin/AppointmentRequestsPage.jsx
// Reads from ALL localStorage keys — works regardless of which booking flow saved

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
  Pending:      { bg:'#fef3c7', color:'#d97706', border:'#fde68a' },
  Approved:     { bg:'#dbeafe', color:'#2563eb', border:'#bfdbfe' },
  Rejected:     { bg:'#fee2e2', color:'#dc2626', border:'#fecaca' },
  Completed:    { bg:'#d1fae5', color:'#059669', border:'#a7f3d0' },
  'In Progress':{ bg:'#ede9fe', color:'#7c3aed', border:'#ddd6fe' },
};

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.dcm,.dicom';

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
  catch { return d; }
}

// ── Read & normalise from every possible localStorage key ────────────────────
function readAll() {
  const keys = ['radiologyAllAppointments','radiologyAdminPendingRequests','bookings','appointments'];
  const seen = new Set();
  const all = [];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        const uid = item.appointmentId || item.id || item.bookingReference;
        if (uid && seen.has(uid)) continue;
        if (uid) seen.add(uid);
        all.push({
          appointmentId:      item.appointmentId || item.id || `APT-${Date.now()}-${Math.random()}`,
          bookingReference:   item.bookingReference || '—',
          radiologyPatientId: item.radiologyPatientId || item.patientId || '—',
          externalPatientId:  item.externalPatientId || item.eyeClinicId || null,
          patientName:        item.patientName  || item.name  || '—',
          patientPhone:       item.patientPhone || item.phone || '—',
          patientEmail:       item.patientEmail || item.email || '—',
          patientGender:      item.patientGender || item.gender || '—',
          serviceName:        item.serviceName || item.service || item.test || '—',
          servicePrice:       item.servicePrice || item.price || '—',
          appointmentDate:    item.appointmentDate || item.date || '',
          appointmentTime:    item.appointmentTime || item.time || '',
          status:             item.status || 'Pending',
          investigationStatus:item.investigationStatus || 'Pending',
          source:             item.source || item.appointmentType || 'DirectWalkIn',
          referralSource:     item.referralSource
                              || (item.source === 'EyeClinicReferral' ? item.clinicName : null)
                              || null,
          isDoctorOrder:      item.isDoctorOrder || false,
          doctorName:         item.doctorName || null,
          orderNotes:         item.orderNotes || null,
          uploadedFiles:      item.uploadedFiles || [],
          rejectionReason:    item.rejectionReason || null,
          createdAt:          item.createdAt || new Date().toISOString(),
        });
      }
    } catch { /* skip corrupt */ }
  }
  return all.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function writeAll(arr) {
  localStorage.setItem('radiologyAllAppointments', JSON.stringify(arr));
  const pending = arr.filter(a => a.status === 'Pending');
  localStorage.setItem('radiologyAdminPendingRequests', JSON.stringify(pending));
  window.dispatchEvent(new StorageEvent('storage', { key:'radiologyAllAppointments' }));
}

function Badge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>{status}</span>;
}

function AptCard({ apt, onAction, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason]     = useState('');
  const [uploadErr, setUploadErr] = useState('');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50*1024*1024) { setUploadErr('File too large (max 50MB)'); return; }
    setUploading(true); setUploadErr('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpload(apt.appointmentId, { id:`FILE-${Date.now()}`, fileName:file.name, fileType:file.type, uploadedAt:new Date().toISOString(), dataUrl:ev.target.result });
      setUploading(false);
    };
    reader.onerror = () => { setUploadErr('Read failed'); setUploading(false); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const c = STATUS_COLORS[apt.status] || STATUS_COLORS.Pending;

  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      style={{ background:'white', borderRadius:16, padding:20, boxShadow:'0 2px 10px rgba(0,0,0,0.06)', border:`1.5px solid ${c.border}`, borderLeft:`4px solid ${c.color}`, marginBottom:14 }}>

      {/* Top */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:12 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1e3a5f', marginBottom:4 }}>{apt.patientName}</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:12, fontFamily:'monospace', background:'#f0f9ff', color:'#0ea5e9', padding:'2px 8px', borderRadius:6, fontWeight:700 }}>
              {apt.radiologyPatientId}
            </span>
            {apt.externalPatientId && (
              <span style={{ fontSize:11, fontFamily:'monospace', background:'#f5f3ff', color:'#7c3aed', padding:'2px 8px', borderRadius:6 }}>
                EYE: {apt.externalPatientId}
              </span>
            )}
            {apt.referralSource && (
              <span style={{ fontSize:11, background:'#fef3c7', color:'#d97706', padding:'2px 8px', borderRadius:6 }}>
                From: {apt.referralSource}
              </span>
            )}
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <Badge status={apt.status}/>
          {apt.investigationStatus && apt.investigationStatus !== 'Pending' && (
            <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:500, background:'#f1f5f9', color:'#64748b' }}>
              Inv: {apt.investigationStatus}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'8px 16px', marginBottom:12, background:'#f8fafc', borderRadius:10, padding:'10px 14px' }}>
        {[
          ['Service', apt.serviceName],
          ['Date',    fmtDate(apt.appointmentDate)],
          ['Time',    fmtTime(apt.appointmentTime)],
          ['Phone',   apt.patientPhone],
          ['Gender',  apt.patientGender],
          ['Price',   apt.servicePrice],
          ['Source',  apt.source === 'EyeClinicReferral' || apt.referralSource ? `Referred${apt.referralSource ? ` · ${apt.referralSource}` : ''}` : 'Walk-in'],
          ['Ref',     apt.bookingReference],
        ].map(([l,v]) => (
          <div key={l}>
            <div style={{ fontSize:10, color:'#94a3b8' }}>{l}</div>
            <div style={{ fontSize:12, fontWeight:600, color:'#334155' }}>{v||'—'}</div>
          </div>
        ))}
      </div>

      {apt.orderNotes && (
        <div style={{ fontSize:12, color:'#92400e', background:'#fffbeb', borderLeft:'3px solid #f59e0b', padding:'7px 12px', borderRadius:6, marginBottom:10 }}>
          📝 Doctor notes: {apt.orderNotes}
        </div>
      )}
      {apt.rejectionReason && (
        <div style={{ fontSize:12, color:'#dc2626', background:'#fef2f2', borderLeft:'3px solid #fecaca', padding:'7px 12px', borderRadius:6, marginBottom:10 }}>
          ✕ Rejected: {apt.rejectionReason}
        </div>
      )}

      {/* Uploaded files */}
      {apt.uploadedFiles?.length > 0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#64748b', marginBottom:5 }}>Files ({apt.uploadedFiles.length})</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {apt.uploadedFiles.map(f => (
              <a key={f.id} href={f.dataUrl} download={f.fileName} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:11, padding:'4px 10px', background:'#eff6ff', color:'#2563eb', borderRadius:6, border:'1px solid #bfdbfe', textDecoration:'none', fontWeight:500 }}>
                📎 {f.fileName}
              </a>
            ))}
          </div>
        </div>
      )}

      {uploadErr && <div style={{ fontSize:11, color:'#dc2626', marginBottom:8, background:'#fef2f2', padding:'6px 10px', borderRadius:6 }}>⚠ {uploadErr}</div>}

      {/* Reject input */}
      <AnimatePresence>
        {rejectOpen && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} style={{ overflow:'hidden', marginBottom:8 }}>
            <input type="text" placeholder="Rejection reason (optional)" value={reason} onChange={e=>setReason(e.target.value)}
              style={{ width:'100%', padding:'9px 12px', border:'1px solid #fecaca', borderRadius:8, fontSize:13, background:'white', color:'#1e293b', outline:'none', boxSizing:'border-box' }}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        {apt.status === 'Pending' && (
          <>
            <button onClick={() => onAction(apt.appointmentId,'approve')}
              style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'#059669', color:'white', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              ✓ Approve
            </button>
            {rejectOpen
              ? <button onClick={() => { onAction(apt.appointmentId,'reject',reason); setRejectOpen(false); setReason(''); }}
                  style={{ padding:'8px 14px', borderRadius:8, border:'none', background:'#dc2626', color:'white', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  Confirm Reject
                </button>
              : <button onClick={() => setRejectOpen(true)}
                  style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #fecaca', background:'white', color:'#dc2626', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  ✕ Reject
                </button>
            }
          </>
        )}

        {(apt.status==='Approved'||apt.status==='In Progress') && (
          <label style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #bfdbfe', background:'#eff6ff', color:'#2563eb', fontSize:12, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>
            {uploading ? '⏳ Uploading…' : '📁 Upload Result / File'}
            <input type="file" accept={ACCEPTED} onChange={handleFile} style={{ display:'none' }} disabled={uploading}/>
          </label>
        )}

        {apt.status==='Completed' && apt.uploadedFiles?.length > 0 && (
          <span style={{ fontSize:12, color:'#059669', fontWeight:500 }}>✓ Results uploaded</span>
        )}
      </div>
    </motion.div>
  );
}

export default function AppointmentRequestsPage({ setPage }) {
  const [apts, setApts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const all = readAll();
    setApts(all);
    writeAll(all); // normalise keys
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 10000);
    window.addEventListener('storage', load);
    return () => { clearInterval(iv); window.removeEventListener('storage', load); };
  }, [load]);

  const handleAction = (appointmentId, action, reason='') => {
    const now = new Date().toISOString();
    setApts(prev => {
      const next = prev.map(a => {
        if (a.appointmentId !== appointmentId) return a;
        if (action==='approve') return { ...a, status:'Approved', investigationStatus:'Active', approvedAt:now, updatedAt:now };
        if (action==='reject')  return { ...a, status:'Rejected', rejectionReason:reason, updatedAt:now };
        return a;
      });
      writeAll(next);
      return next;
    });
  };

  const handleUpload = (appointmentId, fileRecord) => {
    const now = new Date().toISOString();
    setApts(prev => {
      const next = prev.map(a => {
        if (a.appointmentId !== appointmentId) return a;
        const files = [...(a.uploadedFiles||[]), fileRecord];
        return { ...a, uploadedFiles:files, status:'Completed', investigationStatus:'Completed', completedAt:now, updatedAt:now };
      });
      writeAll(next);
      // Save to patient results
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
      }
      return next;
    });
  };

  const counts = {
    all: apts.length,
    Pending: apts.filter(a=>a.status==='Pending').length,
    Approved: apts.filter(a=>a.status==='Approved').length,
    Completed: apts.filter(a=>a.status==='Completed').length,
    Rejected: apts.filter(a=>a.status==='Rejected').length,
  };

  const TABS = [
    { key:'all',       label:`All (${counts.all})` },
    { key:'Pending',   label:`⏳ Pending (${counts.Pending})` },
    { key:'Approved',  label:`✓ Approved (${counts.Approved})` },
    { key:'Completed', label:`✅ Completed (${counts.Completed})` },
    { key:'Rejected',  label:`✕ Rejected (${counts.Rejected})` },
  ];

  const filtered = apts.filter(a => {
    const matchFilter = filter==='all' || a.status===filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (a.patientName||'').toLowerCase().includes(q)
      || (a.radiologyPatientId||'').toLowerCase().includes(q)
      || (a.externalPatientId||'').toLowerCase().includes(q)
      || (a.serviceName||'').toLowerCase().includes(q)
      || (a.bookingReference||'').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ padding:'32px', background:'#f3f4f6', minHeight:'100vh' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:'#1f2937', margin:'0 0 4px' }}>Appointment Requests</h1>
        <p style={{ fontSize:13, color:'#6b7280' }}>Approve, reject, and upload results for all radiology appointments</p>
      </div>

      {/* Search + refresh */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        <input type="text" placeholder="Search name, RAD ID, service, booking ref…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{ flex:1, minWidth:220, maxWidth:400, padding:'10px 14px', border:'1px solid #d1d5db', borderRadius:10, fontSize:13, background:'white', color:'#1e293b', outline:'none', boxSizing:'border-box' }}/>
        <button onClick={load}
          style={{ padding:'10px 18px', borderRadius:10, border:'1px solid #e2e8f0', background:'white', color:'#64748b', fontSize:12, cursor:'pointer' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={()=>setFilter(tab.key)}
            style={{ padding:'7px 14px', borderRadius:20, border:'none', fontSize:12, fontWeight:600, cursor:'pointer',
              background: filter===tab.key ? '#1e3a5f' : 'white',
              color:      filter===tab.key ? 'white'   : '#64748b',
              boxShadow:  filter===tab.key ? '0 2px 8px rgba(30,58,95,0.2)' : 'none' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign:'center', color:'#94a3b8', padding:'40px' }}>Loading…</div>}

      {!loading && filtered.length===0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', background:'white', borderRadius:16, color:'#94a3b8' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:16, fontWeight:500, marginBottom:6 }}>
            {search ? 'No results found' : filter==='all' ? 'No appointments yet' : `No ${filter} appointments`}
          </div>
          <div style={{ fontSize:13 }}>
            {!search && filter==='all' && 'Appointments will appear here automatically once patients book.'}
          </div>
        </div>
      )}

      {!loading && filtered.map(apt => (
        <AptCard key={apt.appointmentId} apt={apt} onAction={handleAction} onUpload={handleUpload}/>
      ))}
    </div>
  );
}