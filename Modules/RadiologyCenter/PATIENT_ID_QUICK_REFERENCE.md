# Quick Reference - نظام معرّفات المرضى

## 📋 المرجع السريع للـ Radiology Patient ID System

---

## 🚀 البدء السريع

### 1. تثبيت الخدمة (تم بالفعل)
```csharp
// في Program.cs
builder.Services.AddScoped<IPatientIdentifierService, PatientIdentifierService>();
```

### 2. استخدام الخدمة في PatientController

```csharp
// في constructor
public PatientController(..., IPatientIdentifierService identifierService)
{
    _identifierService = identifierService;
}

// في دالة Register
var radId = await _identifierService.GenerateUniqueIdentifierAsync();
```

### 3. حفظ واستخدام الـ Identifier

```javascript
// في React Component
localStorage.setItem("radiologyPatientIdentifier", radiologyData.identifier);
```

---

## 🔑 الـ Key Points

| المفهوم | الشرح | مثال |
|--------|-------|------|
| **Identifier** | معرّف عام يراه المستخدم | `RAD-00001` |
| **PatientId** | رقم قاعدة البيانات | `1`, `2`, `3` |
| **Sequential** | يزداد بالترتيب | `RAD-00001 → RAD-00002 → RAD-00003` |
| **Thread-safe** | آمن من التضارب | استخدام `lock` |
| **Unique** | فريد لكل مريض | لا تكرار |

---

## 🔄 التدفق الأساسي

```
1. User Registration (React)
   ↓
2. Firebase Auth
   ↓
3. POST /api/Patient/register (Backend)
   ↓
4. PatientIdentifierService.GenerateUniqueIdentifierAsync()
   ↓
5. Save to Database (RAD-00001)
   ↓
6. Return to Frontend
   ↓
7. Save to localStorage
   ↓
8. Display in ProfilePage
```

---

## 📱 API Endpoints

### تسجيل مريض
```http
POST /api/Patient/register
Content-Type: application/json

{
    "firstName": "Ahmed",
    "email": "ahmed@email.com",
    "phone": "01012345678"
}

✓ Response:
{
    "identifier": "RAD-00001",
    "patientId": 1,
    "email": "ahmed@email.com"
}
```

### البحث بـ Identifier
```http
GET /api/Patient/by-identifier/RAD-00001

✓ Response:
{
    "id": 1,
    "identifier": "RAD-00001",
    "firstName": "Ahmed",
    "email": "ahmed@email.com"
}
```

### البحث بـ Email
```http
GET /api/Patient/by-email/ahmed@email.com

✓ Response: (نفس البيانات أعلاه)
```

---

## 💾 localStorage Keys

```javascript
// حفظ بعد التسجيل
localStorage.setItem("radiologyPatientIdentifier", "RAD-00001");  // ✓
localStorage.setItem("radiologyPatientId", "1");                  // رقم DB
localStorage.setItem("radiologyPatientEmail", "m@gmail.com");    // البريد
localStorage.setItem("radiologyPatientName", "Mayar Mohamed");   // الاسم

// استرجاع
const identifier = localStorage.getItem("radiologyPatientIdentifier");
```

---

## 🔍 البحث والتصفية

### بـ Identifier (الأفضل)
```javascript
const patient = await fetch(`/api/Patient/by-identifier/${identifier}`);
// مثال: /api/Patient/by-identifier/RAD-00001
```

### بـ Email
```javascript
const patient = await fetch(`/api/Patient/by-email/${email}`);
// مثال: /api/Patient/by-email/m@gmail.com
```

### بـ Database ID
```javascript
const patient = await fetch(`/api/Patient/${id}`);
// مثال: /api/Patient/1
```

---

## 🧪 سيناريوهات الاختبار

### ✅ السيناريو 1: تسجيل جديد
```
Input:  firstName="Ahmed", email="ahmed@email.com"
Output: identifier="RAD-00001", patientId=1
Status: ✓ Pass
```

### ✅ السيناريو 2: منع التكرار
```
Input:  نفس البريد "ahmed@email.com"
Output: error="Patient already exists", identifier="RAD-00001"
Status: ✓ Pass
```

### ✅ السيناريو 3: البحث
```
Input:  /api/Patient/by-identifier/RAD-00001
Output: Patient data with correct identifier
Status: ✓ Pass
```

---

## 🛠 استكشاف الأخطاء

### مشكلة: Identifier مفقود
```csharp
// الحل
var patient = _context.Patients.FirstOrDefault(p => p.Email == email);
if (string.IsNullOrEmpty(patient.Identifier))
{
    patient.Identifier = await _identifierService
        .GenerateUniqueIdentifierAsync();
    await _context.SaveChangesAsync();
}
```

### مشكلة: Identifier متطابق
```sql
-- البحث عن التكرارات
SELECT Identifier, COUNT(*) 
FROM Patients 
GROUP BY Identifier 
HAVING COUNT(*) > 1
```

### مشكلة: localStorage محذوف
```javascript
// استعادة من Backend
const response = await fetch(`/api/Patient/by-email/${email}`);
const patient = await response.json();
localStorage.setItem("radiologyPatientIdentifier", patient.identifier);
```

---

## 📊 الإحصائيات

```javascript
// عدد المرضى المسجلين
// يساوي أكبر رقم في الـ Identifier
// مثال: إذا كان أخر ID هو RAD-00050
// فهناك 50 مريض مسجل
```

---

## ✅ Checklist للتحقق

- [ ] الخدمة مسجلة في Program.cs
- [ ] PatientController يستخدم الخدمة
- [ ] Identifier يتم حفظه في localStorage
- [ ] عرض الـ Identifier في ProfilePage
- [ ] API يرجع الـ Identifier الصحيح
- [ ] عدم وجود Identifiers مكررة
- [ ] البحث بـ Identifier يعمل بشكل صحيح

---

## 🔗 الملفات المعنية

```
Backend:
├── Services/PatientIdentifierService.cs      ✓ جديد
├── Controllers/PatientController.cs           ✓ محدث
├── Program.cs                                 ✓ محدث
└── Models/Patient.cs                         (بدون تغيير)

Frontend:
├── pages/RegisterPage.jsx
├── pages/ProfilePage.jsx
├── services/appointmentService.js
└── localStorage keys

Documentation:
├── PATIENT_ID_SYSTEM.md                      ✓ نظام شامل
├── PATIENT_ID_INTEGRATION_GUIDE.md           ✓ دليل التكامل
└── PATIENT_ID_QUICK_REFERENCE.md             ✓ هذا الملف
```

---

## 📞 الأسئلة الشائعة

**س: هل يمكن تغيير الـ ID بعد الإنشاء؟**  
ج: لا، الـ ID دائم وفريد

**س: ماذا إذا احتجت رقم أعلى من 99999؟**  
ج: غير الصيغة في `GenerateUniqueIdentifierAsync()`:
```csharp
var identifier = $"RAD-{nextNumber:D6}"; // RAD-000001
```

**س: هل يمكن استخدام Identifier في كل مكان؟**  
ج: نعم، لكن يجب فك رابطه إلى PatientId للعلاقات

**س: كيف أستعيد Identifier المفقود؟**  
ج: استخدم `/api/Patient/by-email/{email}`

---

## 🚀 الخطوات التالية

1. **اختبار الكامل** - تشغيل جميع test cases
2. **تحديث البيانات القديمة** - إذا كانت هناك بيانات موجودة
3. **إضافة Unique Constraint** - في قاعدة البيانات
4. **توثيق في FHIR** - استخدام Identifier في HL7
5. **تدريب الفريق** - على استخدام النظام الجديد

---

**تاريخ الإنشاء:** مايو 2026  
**الإصدار:** 1.0  
**آخر تحديث:** مايو 2026
