#!/usr/bin/env node

/**
 * 🧪 Test Script: Patient Orders Dummy Data Fix
 * 
 * هذا السكريبت يختبر أن البيانات الوهمية قد تم إصلاحها بشكل صحيح
 * تشغيل التعليمات:
 * 1. انسخ هذا الكود
 * 2. افتح DevTools في المتصفح (F12)
 * 3. انتقل إلى Console
 * 4. الصق الكود وشغله
 */

// 1️⃣ فحص localStorage
console.log("=".repeat(60));
console.log("🔍 فحص localStorage");
console.log("=".repeat(60));

const checks = {
  "patientId": localStorage.getItem("patientId"),
  "patientIdentifier": localStorage.getItem("patientIdentifier"),
  "patientName": localStorage.getItem("patientName"),
  "patientEmail": localStorage.getItem("patientEmail"),
  "userName": localStorage.getItem("userName"),
  "userEmail": localStorage.getItem("userEmail"),
};

console.log("📦 بيانات localStorage الحالية:");
console.table(checks);

// 2️⃣ فحص patientId
console.log("\n" + "=".repeat(60));
console.log("🔑 فحص patientId");
console.log("=".repeat(60));

const patientId = localStorage.getItem("patientId");
const expectedBadPatientId = "31"; // ❌ المريض القديم (P-532756)

if (!patientId) {
  console.warn("⚠️ تحذير: patientId غير موجود في localStorage!");
  console.log("💡 الحل: قم بتسجيل الدخول أولاً");
} else {
  console.log(`✓ patientId موجود: ${patientId}`);
  
  if (patientId === expectedBadPatientId) {
    console.error("❌ خطأ: هذا هو patientId المريض القديم (P-532756)!");
    console.log("💡 الحل: امسح localStorage وسجل دخول مريض جديد");
  } else {
    console.log("✅ صحيح: patientId ليس بيانات وهمية قديمة");
  }
}

// 3️⃣ فحص كائن patient
console.log("\n" + "=".repeat(60));
console.log("👤 فحص كائن patient");
console.log("=".repeat(60));

try {
  const patientData = localStorage.getItem("patient");
  if (patientData) {
    const patient = JSON.parse(patientData);
    console.log("✓ كائن patient موجود:");
    console.table({
      id: patient.id || patient.Id || "لا يوجد",
      name: patient.name || `${patient.firstName} ${patient.lastName}` || "لا يوجد",
      email: patient.email || patient.Email || "لا يوجد",
    });
  } else {
    console.warn("⚠️ كائن patient غير موجود في localStorage");
  }
} catch (e) {
  console.error("❌ خطأ في فحص patient:", e);
}

// 4️⃣ فحص عام شامل
console.log("\n" + "=".repeat(60));
console.log("✅ خلاصة الفحص");
console.log("=".repeat(60));

const summary = {
  "patientId موجود": !!patientId,
  "patientId ليس 31 (بيانات وهمية)": patientId !== "31",
  "patientName موجود": !!localStorage.getItem("patientName"),
  "userEmail موجود": !!localStorage.getItem("userEmail"),
  "كائن patient موجود": !!localStorage.getItem("patient"),
};

console.table(summary);

const allGood = Object.values(summary).every(v => v === true);
if (allGood) {
  console.log("\n✅ جميع الفحوصات نجحت! البيانات صحيحة");
  console.log("🚀 انتقل إلى /patient/orders لترى البيانات الصحيحة");
} else {
  console.log("\n❌ بعض الفحوصات فشلت. تحقق من localStorage");
}

// 5️⃣ معلومات المريض الكامل
console.log("\n" + "=".repeat(60));
console.log("📋 معلومات المريض الكاملة");
console.log("=".repeat(60));

const userName = localStorage.getItem("userName") || "غير معروف";
const userEmail = localStorage.getItem("userEmail") || "غير معروف";
const currentPatientId = localStorage.getItem("patientId") || "غير معروف";

console.log(`
المريض الحالي:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 الاسم:      ${userName}
📧 البريد:     ${userEmail}
🔑 ID:         ${currentPatientId}

⚠️ إذا كان ID = 31 و الاسم = "Eman Sallm" أو "Khadeja":
   هذا يعني أن المشكلة لم تُصلح بعد ❌
   
✅ إذا كان ID مختلفاً واسم مختلفاً:
   المشكلة تم إصلاحها ✓
`);
