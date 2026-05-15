// src/components/PatientMedicalRecord.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d) || d.getFullYear() < 1900) return null;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtGender(g) {
  // Handle various gender formats
  if (g === 0 || g === "0" || /^m/i.test(g) || g === "Male") return "Male";
  if (g === 1 || g === "1" || /^f/i.test(g) || g === "Female") return "Female";
  return g || null;
}

function calcAge(dob) {
  if (!dob) return null;
  const b = new Date(dob), t = new Date();
  if (isNaN(b)) return null;
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a > 0 ? a : null;
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function getPatientIdentifier() {
  const pi = localStorage.getItem("patientIdentifier") || localStorage.getItem("PatientIdentifier");
  if (pi) return pi;
  const pid = localStorage.getItem("patientId") || localStorage.getItem("PatientId");
  if (pid && /^P-/i.test(String(pid).trim())) return pid.trim();
  return pid || null;
}

function isLoggedIn() {
  return !!(localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("isAuthenticated") === "true");
}

function tryParseInvestigations(str) {
  try { const r = JSON.parse(str || "[]"); return Array.isArray(r) ? r : []; }
  catch { return []; }
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5201";

// ─── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .pmr-root *, .pmr-root *::before, .pmr-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .pmr-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #eef1f6;
    min-height: 100vh;
    color: #111827;
  }

  /* ─ Topbar ─ */
  .pmr-top {
    background: linear-gradient(120deg, #0b1f3a 0%, #0d3060 55%, #0a4a8c 100%);
    padding: 28px 48px 90px;
    position: relative; overflow: hidden;
  }
  .pmr-top::after {
    content:''; position:absolute; inset:0;
    background: repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,.015) 40px, rgba(255,255,255,.015) 80px);
  }
  .pmr-top-glow1 { position:absolute; right:-60px; top:-60px; width:320px; height:320px; border-radius:50%; background:radial-gradient(circle,rgba(56,189,248,.12) 0%,transparent 70%); }
  .pmr-top-glow2 { position:absolute; left:25%; bottom:-80px; width:260px; height:260px; border-radius:50%; background:radial-gradient(circle,rgba(99,179,237,.07) 0%,transparent 70%); }
  .pmr-top-inner { position:relative; z-index:2; display:flex; align-items:center; gap:20px; max-width:1140px; margin:0 auto; }

  .pmr-back {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2);
    color:rgba(255,255,255,.85); padding:7px 14px; border-radius:8px;
    font-size:.75rem; font-weight:600; cursor:pointer; letter-spacing:.3px;
    transition:background .2s; text-transform:uppercase; backdrop-filter:blur(4px);
  }
  .pmr-back:hover { background:rgba(255,255,255,.18); }

  .pmr-avatar {
    width:68px; height:68px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,#60a5fa,#2563eb);
    border:3px solid rgba(255,255,255,.3);
    display:flex; align-items:center; justify-content:center;
    font-family:'Playfair Display',serif;
    font-size:1.7rem; font-weight:600; color:#fff;
    box-shadow:0 8px 28px rgba(0,0,0,.25);
  }

  .pmr-top-name {
    font-family:'Playfair Display',serif;
    font-size:1.9rem; color:#fff; font-weight:600; line-height:1.1; margin-bottom:8px;
  }
  .pmr-top-name i { font-style:italic; color:#93c5fd; }
  .pmr-meta-row { display:flex; gap:8px; flex-wrap:wrap; }
  .pmr-meta-pill {
    display:inline-flex; align-items:center; gap:5px;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
    color:rgba(255,255,255,.85); padding:4px 11px; border-radius:999px;
    font-size:.73rem; font-weight:500; backdrop-filter:blur(4px);
  }
  .pmr-ro-badge {
    margin-left:auto; align-self:flex-start;
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22);
    color:rgba(255,255,255,.65); padding:6px 14px; border-radius:8px;
    font-size:.65rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
  }

  /* ─ Stat strip ─ */
  .pmr-strip {
    max-width:1140px; margin:-52px auto 0;
    padding:0 48px; display:grid; grid-template-columns:repeat(4,1fr); gap:14px;
    position:relative; z-index:10;
  }
  .pmr-stat {
    background:#fff; border-radius:14px; padding:16px 18px;
    box-shadow:0 4px 20px rgba(0,0,0,.08); border:1px solid rgba(0,0,0,.05);
    display:flex; align-items:center; gap:12px; transition:transform .2s;
  }
  .pmr-stat:hover { transform:translateY(-2px); }
  .pmr-stat-ico { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
  .pmr-stat-lbl { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:#9ca3af; margin-bottom:2px; }
  .pmr-stat-val { font-size:.92rem; font-weight:700; color:#111827; }

  /* ─ Body ─ */
  .pmr-body { max-width:1140px; margin:0 auto; padding:30px 48px 60px; }

  /* ─ Tabs nav ─ */
  .pmr-tabs-nav {
    display:flex; gap:0; background:#fff; border-radius:14px;
    padding:6px; margin-bottom:20px;
    box-shadow:0 2px 12px rgba(0,0,0,.06); border:1px solid rgba(0,0,0,.05);
    overflow-x:auto;
  }
  .pmr-tab-btn {
    flex:1; min-width:100px; display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:10px 8px; border-radius:10px; border:none; background:none;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:.68rem; font-weight:600;
    color:#6b7280; cursor:pointer; transition:all .2s; letter-spacing:.2px;
    white-space:nowrap;
  }
  .pmr-tab-btn svg { margin-bottom:1px; }
  .pmr-tab-btn.active { color:#1d4ed8; background:#eff6ff; }
  .pmr-tab-btn.active svg { color:#1d4ed8; }
  .pmr-tab-btn:hover:not(.active) { background:#f9fafb; color:#374151; }
  .pmr-tab-dot {
    width:6px; height:6px; border-radius:50%; background:currentColor;
    opacity:.6; position:absolute; top:6px; right:8px;
  }
  .pmr-tab-btn { position:relative; }

  /* ─ Panel card ─ */
  .pmr-panel {
    background:#fff; border-radius:18px;
    box-shadow:0 2px 16px rgba(0,0,0,.06); border:1px solid rgba(0,0,0,.05);
    overflow:hidden;
    animation:slideUp .3s ease both;
  }
  @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  .pmr-panel-head {
    padding:20px 28px; border-bottom:1px solid #f3f4f6;
    display:flex; align-items:center; justify-content:space-between;
  }
  .pmr-panel-title {
    display:flex; align-items:center; gap:10px;
    font-size:.92rem; font-weight:700; color:#111827;
  }
  .pmr-panel-icon {
    width:34px; height:34px; border-radius:9px;
    display:flex; align-items:center; justify-content:center; font-size:.85rem;
  }
  .pmr-count-badge {
    font-size:.68rem; font-weight:700; padding:2px 8px; border-radius:999px;
  }
  .pmr-panel-body { padding:24px 28px; }

  /* ─ Info grid ─ */
  .pmr-info-grid {
    display:grid; grid-template-columns:repeat(3,1fr);
    gap:1px; background:#f3f4f6; border-radius:12px; overflow:hidden;
  }
  .pmr-field {
    background:#fff; padding:14px 18px;
    transition:background .15s;
  }
  .pmr-field:hover { background:#fafbff; }
  .pmr-field-lbl {
    font-size:.62rem; font-weight:700; text-transform:uppercase;
    letter-spacing:.9px; color:#9ca3af; margin-bottom:5px;
  }
  .pmr-field-val { font-size:.86rem; font-weight:600; color:#111827; }
  .pmr-field-val.empty { color:#d1d5db; font-style:italic; font-weight:400; font-size:.82rem; }

  /* ─ Section divider ─ */
  .pmr-hr { height:1px; background:#f3f4f6; margin:20px 0; }
  .pmr-sub { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.9px; color:#9ca3af; margin-bottom:14px; }

  /* ─ Complaint ─ */
  .pmr-complaint {
    background:linear-gradient(135deg,#fff5f5,#fff);
    border:1px solid #fecaca; border-left:4px solid #f87171;
    border-radius:12px; padding:18px 22px;
    font-size:.9rem; line-height:1.85; color:#374151; font-style:italic;
  }
  .pmr-complaint::before { content:'"'; font-size:2rem; color:#fca5a5; line-height:.5; vertical-align:-.25em; margin-right:4px; font-family:'Playfair Display',serif; }

  /* ─ History ─ */
  .pmr-hist-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .pmr-hist-item {
    background:#f8faff; border:1px solid #e0e7ff;
    border-radius:10px; padding:14px 16px;
  }
  .pmr-hist-lbl { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:#3b82f6; margin-bottom:5px; }
  .pmr-hist-val { font-size:.84rem; color:#374151; line-height:1.55; }

  /* ─ Eye exam ─ */
  .pmr-eye-wrap { margin-bottom:14px; border:1px solid #a7f3d0; border-radius:12px; overflow:hidden; }
  .pmr-eye-head {
    background:linear-gradient(135deg,#ecfdf5,#f0fdf4);
    padding:10px 18px; font-size:.65rem; font-weight:700; text-transform:uppercase;
    letter-spacing:.8px; color:#065f46; border-bottom:1px solid #a7f3d0;
    display:flex; justify-content:space-between; align-items:center;
  }
  .pmr-eye-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:#a7f3d0; }
  .pmr-eye-cell { background:#fff; padding:12px 16px; }
  .pmr-eye-cell-lbl { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:#059669; margin-bottom:4px; }
  .pmr-eye-cell-val { font-size:.84rem; font-weight:600; color:#111827; }
  .pmr-eye-cell-val.empty { color:#9ca3af; font-weight:400; font-style:italic; }

  /* ─ Investigations ─ */
  .pmr-inv-list { display:flex; flex-direction:column; gap:0; }
  .pmr-inv-item {
    display:flex; gap:16px; align-items:flex-start;
    padding:14px 0; border-bottom:1px solid #f3f4f6;
  }
  .pmr-inv-item:last-child { border-bottom:none; padding-bottom:0; }
  .pmr-inv-timeline { display:flex; flex-direction:column; align-items:center; padding-top:4px; }
  .pmr-inv-dot { width:10px; height:10px; border-radius:50%; background:#8b5cf6; box-shadow:0 0 0 3px #ede9fe; flex-shrink:0; }
  .pmr-inv-line { width:2px; flex:1; background:#ede9fe; margin-top:4px; min-height:20px; }
  .pmr-inv-item:last-child .pmr-inv-line { display:none; }
  .pmr-inv-date { font-size:.7rem; color:#9ca3af; font-weight:500; margin-bottom:6px; }
  .pmr-chips { display:flex; flex-wrap:wrap; gap:5px; }
  .pmr-chip {
    display:inline-flex; align-items:center;
    background:#ede9fe; color:#5b21b6; font-size:.72rem; font-weight:700;
    padding:3px 10px; border-radius:999px; border:1px solid #ddd6fe;
  }
  .pmr-inv-note { font-size:.78rem; color:#6b7280; margin-top:6px; line-height:1.5; }

  /* ─ Rx ─ */
  .pmr-rx-card {
    background:linear-gradient(135deg,#f0fdf4,#fff);
    border:1px solid #bbf7d0; border-radius:14px; padding:18px 22px;
    margin-bottom:12px;
  }
  .pmr-rx-drug {
    font-family:'Playfair Display',serif;
    font-size:1.1rem; color:#065f46; font-weight:600; margin-bottom:14px;
    display:flex; align-items:baseline; gap:10px;
  }
  .pmr-rx-form {
    font-family:'Plus Jakarta Sans',sans-serif;
    font-size:.73rem; font-weight:700; color:#16a34a;
    background:#dcfce7; padding:2px 9px; border-radius:6px;
  }
  .pmr-rx-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .pmr-rx-lbl { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:#16a34a; margin-bottom:3px; }
  .pmr-rx-val { font-size:.84rem; font-weight:600; color:#111827; }
  .pmr-rx-val.empty { color:#9ca3af; font-style:italic; font-weight:400; }
  .pmr-rx-note { margin-top:12px; background:#f0fdf4; border-radius:8px; padding:8px 12px; font-size:.78rem; color:#6b7280; }

  /* ─ Operations ─ */
  .pmr-op-card {
    background:#fff8f5; border:1px solid #fed7aa; border-left:4px solid #f97316;
    border-radius:12px; padding:16px 20px; margin-bottom:10px;
    display:flex; justify-content:space-between; align-items:flex-start; gap:16px;
  }
  .pmr-op-name { font-weight:700; color:#c2410c; font-size:.9rem; margin-bottom:4px; }
  .pmr-op-meta { font-size:.78rem; color:#78716c; }
  .pmr-op-date { font-size:.72rem; color:#f97316; font-weight:700; background:#ffedd5; padding:4px 10px; border-radius:8px; white-space:nowrap; }

  /* ─ Diagnoses ─ */
  .pmr-dx-card {
    background:#faf5ff; border:1px solid #e9d5ff; border-radius:12px;
    padding:16px 20px; margin-bottom:10px;
    display:flex; justify-content:space-between; align-items:flex-start; gap:16px;
  }
  .pmr-dx-name { font-weight:700; color:#4c1d95; font-size:.9rem; margin-bottom:4px; }
  .pmr-dx-note { font-size:.8rem; color:#7c3aed; }
  .pmr-dx-badges { display:flex; gap:6px; flex-wrap:wrap; flex-shrink:0; }
  .pmr-badge { font-size:.68rem; font-weight:700; padding:3px 10px; border-radius:999px; }
  .pmr-badge-mild     { background:#dcfce7; color:#16a34a; border:1px solid #bbf7d0; }
  .pmr-badge-moderate { background:#fef9c3; color:#a16207; border:1px solid #fde047; }
  .pmr-badge-severe   { background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; }
  .pmr-badge-status   { background:#ede9fe; color:#5b21b6; border:1px solid #ddd6fe; }
  .pmr-badge-neutral  { background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; }

  /* ─ Images ─ */
  .pmr-img-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
  .pmr-img-card {
    background:#f8faff; border:1px solid #e0e7ff; border-radius:12px;
    padding:16px; text-align:center;
  }
  .pmr-img-ico { font-size:1.8rem; margin-bottom:8px; }
  .pmr-img-name { font-size:.78rem; font-weight:600; color:#374151; margin-bottom:4px; word-break:break-word; }
  .pmr-img-date { font-size:.68rem; color:#9ca3af; margin-bottom:8px; }
  .pmr-img-link {
    display:inline-block; font-size:.72rem; font-weight:700; color:#3b82f6;
    text-decoration:none; background:#eff6ff; padding:4px 10px; border-radius:6px;
  }

  /* ─ Empty ─ */
  .pmr-empty {
    text-align:center; padding:50px 24px; color:#9ca3af;
  }
  .pmr-empty-ico { font-size:2.5rem; margin-bottom:12px; opacity:.4; }
  .pmr-empty-lbl { font-weight:600; color:#6b7280; margin-bottom:4px; }
  .pmr-empty-sub { font-size:.8rem; }

  /* ─ Loading ─ */
  .pmr-loading {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    min-height:70vh; gap:16px;
  }
  .pmr-spinner {
    width:44px; height:44px; border-radius:50%;
    border:3px solid #dbeafe; border-top-color:#3b82f6;
    animation:spin .7s linear infinite;
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  @media(max-width:900px) {
    .pmr-top { padding:20px 20px 80px; }
    .pmr-strip { grid-template-columns:repeat(2,1fr); padding:0 20px; }
    .pmr-body { padding:24px 20px 40px; }
    .pmr-info-grid { grid-template-columns:repeat(2,1fr); }
    .pmr-rx-grid { grid-template-columns:repeat(2,1fr); }
    .pmr-eye-grid { grid-template-columns:repeat(2,1fr); }
    .pmr-hist-grid { grid-template-columns:1fr; }
  }
`;

// ─── SVG icons ─────────────────────────────────────────────────────────────
const Ico = {
  back:  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>,
  user:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  id:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h.01M8 14h8M12 10h4"/></svg>,
  cal:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  phone: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.72-3.11 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.11-8.72A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mail:  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  pin:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  shield:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  note:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  hist:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  eye:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  flask: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2v6l-4 9a1 1 0 0 0 .9 1.5h14.2a1 1 0 0 0 .9-1.5L14 8V2"/><line x1="6" y1="2" x2="18" y2="2"/></svg>,
  pill:  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  op:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  dx:    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  img:   <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>,
};

// ─── Tab definition ────────────────────────────────────────────────────────
const TABS = [
  { id:"info",      label:"Patient Info",    ico: Ico.user  },
  { id:"complaint", label:"Complaint",       ico: Ico.note  },
  { id:"history",   label:"History",         ico: Ico.hist  },
  { id:"eye",       label:"Eye Exam",        ico: Ico.eye   },
  { id:"inv",       label:"Investigations",  ico: Ico.flask },
  { id:"rx",        label:"Prescriptions",   ico: Ico.pill  },
  { id:"ops",       label:"Operations",      ico: Ico.op    },
  { id:"dx",        label:"Diagnoses",       ico: Ico.dx    },
  { id:"images",    label:"Images",          ico: Ico.img   },
];

// ─── Field component ──────────────────────────────────────────────────────
const F = ({ label, value }) => (
  <div className="pmr-field">
    <div className="pmr-field-lbl">{label}</div>
    <div className={`pmr-field-val${value ? "" : " empty"}`}>{value || "Not recorded"}</div>
  </div>
);

// ─── Panel header ─────────────────────────────────────────────────────────
const PanelHead = ({ ico, bg, color, title, count }) => (
  <div className="pmr-panel-head">
    <div className="pmr-panel-title">
      <div className="pmr-panel-icon" style={{ background: bg, color }}>{ico}</div>
      {title}
      {count != null && count > 0 && (
        <span className="pmr-count-badge" style={{ background: bg, color }}>{count} record{count !== 1 ? "s" : ""}</span>
      )}
    </div>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────
export default function PatientMedicalRecord() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("info");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const patientIdentifier = getPatientIdentifier();
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!isLoggedIn() && !patientIdentifier) { navigate("/login"); return; }
    load();
  }, [patientIdentifier, navigate]);

  const load = async () => {
    try {
      setLoading(true); setError("");
      const idToUse = patientIdentifier;
      if (!idToUse) { setData(localFallback()); return; }

      // Step 1: Check record
      let checkData = { exists: false, recordId: null, patientIdentifier: null };
      try {
        const { data: chk } = await axios.get(
          `${API_BASE}/api/MedicalRecord/check/${encodeURIComponent(idToUse)}`,
          { headers }
        );
        checkData = chk;
      } catch { 
        setData(localFallback()); 
        setError("Could not reach the server."); 
        return; 
      }

      if (checkData.exists) {
        const fetchId = checkData.patientIdentifier || idToUse;
        try {
          const { data: rec } = await axios.get(
            `${API_BASE}/api/MedicalRecord/patient/${encodeURIComponent(fetchId)}`,
            { headers }
          );
          const pi = rec.patientInfo || rec.PatientInfo || {};
          
          setData({
            patientIdentifier: checkData.patientIdentifier || idToUse,
            name: rec.name || pi.name || rec.patientName,
            patientId: rec.patientId || pi.patientId,
            phone: rec.phone || pi.phone || rec.contactNumber,
            email: rec.email || pi.email,
            address: rec.address || pi.address,
            gender: rec.gender ?? pi.gender,
            birthDate: rec.birthDate || pi.birthDate || rec.dateOfBirth,
            age: rec.age || pi.age,
            nationalId: rec.nationalId || pi.nationalId,
            insuranceCompany: rec.insuranceCompany || pi.insuranceCompany,
            insuranceId: rec.insuranceId || pi.insuranceId,
            policyNumber: rec.policyNumber || pi.policyNumber,
            coverage: rec.coverage || pi.coverage,
            coverageType: rec.coverageType || pi.coverageType,
            emergencyContactName: rec.emergencyContactName || pi.emergencyContactName,
            emergencyContactPhone: rec.emergencyContactPhone || pi.emergencyContactPhone,
            complaints: rec.complaints || [],
            histories: rec.histories || [],
            eyeExaminations: rec.eyeExaminations || [],
            investigations: rec.investigations || [],
            prescriptions: rec.prescriptions || [],
            operations: rec.operations || [],
            diagnoses: rec.diagnoses || [],
            medicalTestFiles: rec.medicalTestFiles || [],
            visitDate: rec.createdAt || rec.visitDate
          });
          
          if (checkData.patientIdentifier) 
            localStorage.setItem("patientIdentifier", checkData.patientIdentifier);
            
        } catch (err) { 
          console.error("Error loading full record:", err);
          setError("Could not load full record."); 
          setData(localFallback()); 
        }
      } else {
        try {
          const { data: info } = await axios.get(
            `${API_BASE}/api/MedicalRecord/appointment-info/${encodeURIComponent(idToUse)}`,
            { headers }
          );
          
          console.log("[PatientEMRPage] Raw API Response:", info);
          
          const mappedData = {
            patientIdentifier: idToUse,
            name: info.name || info.patientName || info.PatientName || "Patient",
            patientId: info.patientId || info.PatientId,
            phone: info.phone || info.Phone || info.contactNumber,
            email: info.email || info.Email,
            address: info.address || info.Address,
            gender: info.gender !== undefined ? info.gender : 
                   (info.patientGender !== undefined ? fmtGender(info.patientGender) : null),
            birthDate: info.birthDate || info.patientBirthDate || info.PatientBirthDate,
            age: info.age || info.Age,
            nationalId: info.nationalId || info.NationalId,
            insuranceCompany: info.insuranceCompany || info.InsuranceCompany,
            insuranceId: info.insuranceId || info.InsuranceId,
            policyNumber: info.policyNumber || info.PolicyNumber,
            coverage: info.coverage || info.Coverage,
            coverageType: info.coverageType || info.CoverageType,
            emergencyContactName: info.emergencyContactName || info.EmergencyContactName,
            emergencyContactPhone: info.emergencyContactPhone || info.EmergencyContactPhone,
            complaints: [],
            histories: [],
            eyeExaminations: [],
            investigations: [],
            prescriptions: [],
            operations: [],
            diagnoses: [],
            medicalTestFiles: [],
            visitDate: info.appointmentDate || info.createdAt
          };
          
          console.log("[PatientEMRPage] Mapped Data:", mappedData);
          console.log("[PatientEMRPage] ✓ Gender:", mappedData.gender);
          console.log("[PatientEMRPage] ✓ National ID:", mappedData.nationalId);
          console.log("[PatientEMRPage] ✓ Address:", mappedData.address);
          console.log("[PatientEMRPage] ✓ Insurance Company:", mappedData.insuranceCompany);
          console.log("[PatientEMRPage] ✓ Insurance ID:", mappedData.insuranceId);
          
          setData(mappedData);
          
        } catch (err) { 
          console.error("[PatientEMRPage] Error fetching appointment-info:", err);
          setData(localFallback()); 
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setData(localFallback()); 
      setError("Could not load medical record."); 
    }
    finally { setLoading(false); }
  };

  const localFallback = () => ({
    patientIdentifier,
    name: localStorage.getItem("patientName") || localStorage.getItem("userName") || "Patient",
    email: localStorage.getItem("patientEmail") || localStorage.getItem("userEmail") || "",
    phone: localStorage.getItem("patientPhone") || "",
    address: localStorage.getItem("patientAddress") || "",
    birthDate: localStorage.getItem("patientDateOfBirth") || null,
    gender: localStorage.getItem("patientGender") || null,
    nationalId: localStorage.getItem("patientNationalId") || "",
    insuranceCompany: localStorage.getItem("patientInsuranceCompany") || "",
    insuranceId: localStorage.getItem("patientInsuranceId") || "",
    policyNumber: localStorage.getItem("patientPolicyNumber") || "",
    emergencyContactName: localStorage.getItem("emergencyContactName") || "",
    emergencyContactPhone: localStorage.getItem("emergencyContactPhone") || "",
    complaints: [], histories: [], investigations: [], eyeExaminations: [],
    operations: [], prescriptions: [], diagnoses: [], medicalTestFiles: [],
  });

  if (loading) return (
    <div className="pmr-root">
      <style>{GLOBAL_CSS}</style>
      <div className="pmr-loading">
        <div className="pmr-spinner" />
        <span style={{ color:"#6b7280", fontSize:".85rem" }}>Loading your medical record…</span>
      </div>
    </div>
  );

  const d = data || localFallback();
  const name = d.name || d.patientName || "Patient";

  const displayId = d.patientIdentifier || patientIdentifier || "—";
  const ageVal = d.age || calcAge(d.birthDate || d.dateOfBirth);
  const gender = fmtGender(d.gender);
  const phone = d.contactNumber || d.phone || "";
  const email = d.email || "";
  const address = d.address || "";
  const dob = d.birthDate || d.dateOfBirth;
  const insurance = d.insuranceCompany || "";
  const insId = d.insuranceId || d.insuranceNumber || "";
  const policy = d.policyNumber || "";
  const coverage = d.coverage ? `${d.coverage}%` : "";
  const natId = d.nationalId || "";
  const emgName = d.emergencyContactName || "";
  const emgPhone = d.emergencyContactPhone || "";
  const visitDate = d.visitDate || d.createdAt;

  const complaints = d.complaints || [];
  const histories = d.histories || [];
  const eyeExams = d.eyeExaminations || [];
  const investigations = d.investigations || [];
  const prescriptions = d.prescriptions || [];
  const operations = d.operations || [];
  const diagnoses = d.diagnoses || [];
  const images = d.medicalTestFiles || [];

  const complaintText = complaints.map(c => c.originalText || c.complaint || c.OriginalText).filter(Boolean).join("; ");

  const counts = { 
    complaint: complaints.length, 
    history: histories.length, 
    eye: eyeExams.length, 
    inv: investigations.length, 
    rx: prescriptions.length, 
    ops: operations.length, 
    dx: diagnoses.length, 
    images: images.length 
  };

  return (
    <div className="pmr-root">
      <style>{GLOBAL_CSS}</style>

      <div className="pmr-top">
        <div className="pmr-top-glow1" /><div className="pmr-top-glow2" />
        <div className="pmr-top-inner">
          <button className="pmr-back" onClick={() => navigate("/patient")}>
            {Ico.back} Back
          </button>
          <div className="pmr-avatar">{initials(name)}</div>
          <div style={{ flex:1 }}>
            <h1 className="pmr-top-name">
              <i>{name.split(" ")[0]}</i> {name.split(" ").slice(1).join(" ")}
            </h1>
            <div className="pmr-meta-row">
              <span className="pmr-meta-pill">{Ico.id} {displayId}</span>
              {gender    && <span className="pmr-meta-pill">{Ico.user} {gender}</span>}
              {ageVal    && <span className="pmr-meta-pill">{Ico.cal} {ageVal} yrs</span>}
              {fmtDate(dob) && <span className="pmr-meta-pill">{Ico.cal} Born {fmtDate(dob)}</span>}
              {visitDate && <span className="pmr-meta-pill">{Ico.cal} {fmtDate(visitDate)}</span>}
            </div>
          </div>
          <div className="pmr-ro-badge">Read-Only View</div>
        </div>
      </div>

      <div className="pmr-strip">
        {[
          { label:"Investigations", val:investigations.length, bg:"#ede9fe", color:"#7c3aed" },
          { label:"Eye Exams",      val:eyeExams.length,       bg:"#d1fae5", color:"#059669" },
          { label:"Prescriptions",  val:prescriptions.length,  bg:"#dcfce7", color:"#16a34a" },
          { label:"Diagnoses",      val:diagnoses.length,      bg:"#faf5ff", color:"#7c3aed" },
        ].map(({ label, val, bg, color }) => (
          <div className="pmr-stat" key={label}>
            <div className="pmr-stat-ico" style={{ background:bg, color }}>
              {label === "Investigations" ? Ico.flask : label === "Eye Exams" ? Ico.eye : label === "Prescriptions" ? Ico.pill : Ico.dx}
            </div>
            <div>
              <div className="pmr-stat-lbl">{label}</div>
              <div className="pmr-stat-val">{val} record{val !== 1 ? "s" : ""}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pmr-body">
        {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:".82rem", color:"#dc2626" }}>{error}</div>}

        <div className="pmr-tabs-nav">
          {TABS.map(t => (
            <button key={t.id} className={`pmr-tab-btn${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.ico}
              {t.label}
              {counts[t.id] > 0 && <div className="pmr-tab-dot" />}
            </button>
          ))}
        </div>

        {/* Tab: Patient Info */}
        {tab === "info" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.user} bg="#dbeafe" color="#2563eb" title="Patient Information" />
            <div className="pmr-panel-body">
              <div className="pmr-sub">Basic Information</div>
              <div className="pmr-info-grid">
                <F label="Patient ID"    value={displayId} />
                <F label="Full Name"     value={name} />
                <F label="Age"           value={ageVal ? `${ageVal} years old` : null} />
                <F label="Gender"        value={gender} />
                <F label="Date of Birth" value={fmtDate(dob)} />
                <F label="National ID"   value={natId} />
              </div>
              <div className="pmr-hr" />
              <div className="pmr-sub">Contact Information</div>
              <div className="pmr-info-grid">
                <F label="Phone Number"  value={phone} />
                <F label="Email Address" value={email} />
                <F label="Home Address"  value={address} />
              </div>
              
              {(insurance || insId || policy || coverage) && (
                <>
                  <div className="pmr-hr" />
                  <div className="pmr-sub">Insurance Information</div>
                  <div className="pmr-info-grid">
                    {insurance && <F label="Insurance Company" value={insurance} />}
                    {insId && <F label="Insurance ID" value={insId} />}
                    {policy && <F label="Policy Number" value={policy} />}
                    {coverage && <F label="Coverage" value={coverage} />}
                  </div>
                </>
              )}
              
              {(emgName || emgPhone) && (
                <>
                  <div className="pmr-hr" />
                  <div className="pmr-sub">Emergency Contacts</div>
                  <div className="pmr-info-grid">
                    {emgName && <F label="Emergency Contact" value={emgName} />}
                    {emgPhone && <F label="Emergency Phone" value={emgPhone} />}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab: Complaint */}
        {tab === "complaint" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.note} bg="#fee2e2" color="#ef4444" title="Patient Complaint" count={complaints.length} />
            <div className="pmr-panel-body">
              {complaintText
                ? <div className="pmr-complaint">{complaintText}</div>
                : <div className="pmr-empty"><div className="pmr-empty-ico">📋</div><div className="pmr-empty-lbl">No complaint recorded</div><div className="pmr-empty-sub">Your doctor hasn't recorded a complaint yet.</div></div>}
            </div>
          </div>
        )}

        {/* Tab: History */}
        {tab === "history" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.hist} bg="#dbeafe" color="#2563eb" title="Medical History" count={histories.length} />
            <div className="pmr-panel-body">
              {histories.length > 0 ? histories.map((h, i) => {
                const fields = [
                  ["Allergies",           h.allergies         || h.Allergies],
                  ["Chronic Diseases",    h.chronicDiseases   || h.ChronicDiseases],
                  ["Current Medications", h.currentMedications || h.CurrentMedications],
                  ["Family History",      h.familyHistory     || h.familyEyeDiseases],
                  ["Eye Surgeries",       h.eyeSurgeries      || h.EyeSurgeries || h.previousEye],
                  ["Vision Symptoms",     h.visionSymptoms    || h.VisionSymptoms],
                ].filter(([, v]) => v);
                return (
                  <div key={i}>
                    {i > 0 && <div className="pmr-hr" />}
                    {fields.length > 0
                      ? <div className="pmr-hist-grid">{fields.map(([label, value]) => (
                          <div className="pmr-hist-item" key={label}>
                            <div className="pmr-hist-lbl">{label}</div>
                            <div className="pmr-hist-val">{value}</div>
                          </div>
                        ))}</div>
                      : <div className="pmr-empty"><div className="pmr-empty-ico">📂</div><div className="pmr-empty-lbl">No history details recorded</div></div>}
                  </div>
                );
              }) : <div className="pmr-empty"><div className="pmr-empty-ico">📂</div><div className="pmr-empty-lbl">No medical history recorded</div><div className="pmr-empty-sub">Your doctor hasn't added any history entries yet.</div></div>}
            </div>
          </div>
        )}

        {/* Tab: Eye Exam */}
        {tab === "eye" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.eye} bg="#d1fae5" color="#059669" title="Eye Examination" count={eyeExams.length} />
            <div className="pmr-panel-body">
              {eyeExams.length > 0 ? eyeExams.map((ex, i) => {
                const fields = [
                  ["Right Eye (OD)",     ex.rightEye || ex.RightEye],
                  ["Left Eye (OS)",      ex.leftEye  || ex.LeftEye],
                  ["Eye Pressure",       ex.eyePressure || ex.EyePressure],
                  ["Pupil Reaction",     ex.pupilReaction || ex.PupilReaction],
                  ["Eye Alignment",      ex.eyeAlignment  || ex.EyeAlignment],
                  ["Eye Movements",      ex.eyeMovements  || ex.EyeMovements],
                  ["Anterior Segment",   ex.anteriorSegment  || ex.AnteriorSegment],
                  ["Fundus / Retina",    ex.fundusObservation || ex.FundusObservation],
                  ["Posterior Segment",  ex.posteriorSegment  || ex.PostriorSegment],
                  ["Visual Acuity",      ex.visualAcuity || ex.VisualAcuity],
                  ["Notes",              ex.otherNotes || ex.OtherNotes],
                ].filter(([, v]) => v);
                return (
                  <div className="pmr-eye-wrap" key={i}>
                    <div className="pmr-eye-head">
                      <span>Examination #{i + 1}</span>
                      <span>{fmtDate(ex.createdAt) || "No date"}</span>
                    </div>
                    <div className="pmr-eye-grid">
                      {fields.map(([label, val]) => (
                        <div className="pmr-eye-cell" key={label}>
                          <div className="pmr-eye-cell-lbl">{label}</div>
                          <div className={`pmr-eye-cell-val${val ? "" : " empty"}`}>{val || "—"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }) : <div className="pmr-empty"><div className="pmr-empty-ico">👁️</div><div className="pmr-empty-lbl">No eye examinations recorded</div></div>}
            </div>
          </div>
        )}

        {/* Tab: Investigations */}
        {tab === "inv" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.flask} bg="#ede9fe" color="#7c3aed" title="Investigations" count={investigations.length} />
            <div className="pmr-panel-body">
              {investigations.length > 0
                ? <div className="pmr-inv-list">
                    {investigations.map((inv, i) => {
                      const tests = tryParseInvestigations(inv.selectedInvestigations);
                      return (
                        <div className="pmr-inv-item" key={i}>
                          <div className="pmr-inv-timeline">
                            <div className="pmr-inv-dot" />
                            <div className="pmr-inv-line" />
                          </div>
                          <div style={{ flex:1, paddingBottom:8 }}>
                            <div className="pmr-inv-date">{fmtDate(inv.createdAt) || "No date"}</div>
                            <div className="pmr-chips">
                              {tests.length > 0
                                ? tests.map((t, ti) => <span className="pmr-chip" key={ti}>{t}</span>)
                                : <span className="pmr-chip">{inv.type || inv.investigationType || "Investigation"}</span>}
                            </div>
                            {inv.notes && <div className="pmr-inv-note">{inv.notes}</div>}
                            {inv.result && <div className="pmr-inv-note"><strong>Result:</strong> {inv.result}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                : <div className="pmr-empty"><div className="pmr-empty-ico">🔬</div><div className="pmr-empty-lbl">No investigations ordered</div></div>}
            </div>
          </div>
        )}

        {/* Tab: Prescriptions */}
        {tab === "rx" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.pill} bg="#dcfce7" color="#16a34a" title="Prescriptions" count={prescriptions.length} />
            <div className="pmr-panel-body">
              {prescriptions.length > 0
                ? prescriptions.map((pres, pi2) => {
                    const items = pres.items || pres.Items || [];
                    if (items.length === 0) return null;
                    return items.map((item, ii) => {
                      const drug = item.drug || item.Drug || item.medication || "";
                      const form = item.form || item.Form || "";
                      const dose = item.dose || item.Dose || item.customDose || item.CustomDose || "";
                      const freq = item.frequency || item.Frequency || item.customFrequency || item.CustomFrequency || "";
                      const dur  = item.duration || item.Duration || "";
                      const note = item.notes || item.Notes || pres.notes || pres.Notes || "";
                      return (
                        <div className="pmr-rx-card" key={`${pi2}-${ii}`}>
                          <div className="pmr-rx-drug">
                            {drug || "Medication"}
                            {form && <span className="pmr-rx-form">{form}</span>}
                          </div>
                          <div className="pmr-rx-grid">
                            <div>
                              <div className="pmr-rx-lbl">Dose</div>
                              <div className={`pmr-rx-val${dose ? "" : " empty"}`}>{dose || "Not specified"}</div>
                            </div>
                            <div>
                              <div className="pmr-rx-lbl">Frequency</div>
                              <div className={`pmr-rx-val${freq ? "" : " empty"}`}>{freq || "Not specified"}</div>
                            </div>
                            <div>
                              <div className="pmr-rx-lbl">Duration</div>
                              <div className={`pmr-rx-val${dur ? "" : " empty"}`}>{dur || "Not specified"}</div>
                            </div>
                          </div>
                          {note && <div className="pmr-rx-note">📝 {note}</div>}
                        </div>
                      );
                    });
                  })
                : <div className="pmr-empty"><div className="pmr-empty-ico">💊</div><div className="pmr-empty-lbl">No prescriptions recorded</div></div>}
            </div>
          </div>
        )}

        {/* Tab: Operations */}
        {tab === "ops" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.op} bg="#ffedd5" color="#ea580c" title="Operations" count={operations.length} />
            <div className="pmr-panel-body">
              {operations.length > 0
                ? operations.map((op, i) => (
                    <div className="pmr-op-card" key={i}>
                      <div>
                        <div className="pmr-op-name">{op.operationName || op.name || op.OperationName || "Operation"}</div>
                        <div className="pmr-op-meta">
                          {[op.eye || op.Eye, op.surgeon || op.Surgeon, op.anesthesia, op.status || op.Status].filter(Boolean).join(" · ")}
                        </div>
                        {(op.notes || op.Notes) && <div className="pmr-op-meta" style={{ marginTop:4 }}>{op.notes || op.Notes}</div>}
                      </div>
                      {fmtDate(op.date || op.Date || op.operationDate || op.createdAt) && (
                        <div className="pmr-op-date">{fmtDate(op.date || op.Date || op.operationDate || op.createdAt)}</div>
                      )}
                    </div>
                  ))
                : <div className="pmr-empty"><div className="pmr-empty-ico">🏥</div><div className="pmr-empty-lbl">No operations recorded</div></div>}
            </div>
          </div>
        )}

        {/* Tab: Diagnoses */}
        {tab === "dx" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.dx} bg="#faf5ff" color="#7c3aed" title="Diagnoses" count={diagnoses.length} />
            <div className="pmr-panel-body">
              {diagnoses.length > 0
                ? diagnoses.map((d2, i) => {
                    const sev = d2.severity || d2.Severity;
                    const sevCls = sev === "Mild" ? "pmr-badge-mild" : sev === "Moderate" ? "pmr-badge-moderate" : sev === "Severe" ? "pmr-badge-severe" : "pmr-badge-neutral";
                    return (
                      <div className="pmr-dx-card" key={i}>
                        <div>
                          <div className="pmr-dx-name">{d2.diagnosisName || d2.diagnosis || d2.Diagnosis || d2.diagnosisText || "—"}</div>
                          {(d2.icd10Code || d2.ICD10Code) && <div className="pmr-dx-note">ICD-10: {d2.icd10Code || d2.ICD10Code}</div>}
                          {(d2.notes || d2.Notes) && <div className="pmr-dx-note">{d2.notes || d2.Notes}</div>}
                        </div>
                        <div className="pmr-dx-badges">
                          {sev && <span className={`pmr-badge ${sevCls}`}>{sev}</span>}
                          {(d2.status || d2.Status) && <span className="pmr-badge pmr-badge-status">{d2.status || d2.Status}</span>}
                        </div>
                      </div>
                    );
                  })
                : <div className="pmr-empty"><div className="pmr-empty-ico">📋</div><div className="pmr-empty-lbl">No diagnoses recorded</div></div>}
            </div>
          </div>
        )}

        {/* Tab: Images */}
        {tab === "images" && (
          <div className="pmr-panel">
            <PanelHead ico={Ico.img} bg="#e0e7ff" color="#4338ca" title="Medical Images & Files" count={images.length} />
            <div className="pmr-panel-body">
              {images.length > 0
                ? <div className="pmr-img-grid">{images.map((file, i) => (
                    <div className="pmr-img-card" key={file.id || i}>
                      <div className="pmr-img-ico">🗂️</div>
                      <div className="pmr-img-name">{file.fileName || "File"}</div>
                      <div className="pmr-img-date">{fmtDate(file.createdAt || file.uploadDate)}</div>
                      {file.filePath && <a href={`${API_BASE}/${file.filePath}`} target="_blank" rel="noopener noreferrer" className="pmr-img-link">View File</a>}
                    </div>
                  ))}</div>
                : <div className="pmr-empty"><div className="pmr-empty-ico">🖼️</div><div className="pmr-empty-lbl">No images or files uploaded</div></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}