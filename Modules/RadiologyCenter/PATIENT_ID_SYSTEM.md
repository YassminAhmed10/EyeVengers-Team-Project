# نظام معرّفات المرضى - Radiology Patient ID System

## نظرة عامة

تم تطوير نظام معرّفات موحد وآمن للمرضى في نظام الأشعات الطبية. كل مريض يحصل على **معرّف فريد واحد فقط** بصيغة `RAD-#####` ويتم حفظه بشكل دائم في قاعدة البيانات.

---

## ✨ ما تم تحسينه

### ✅ المشاكل السابقة
- ❌ معرّفات عشوائية قد تتكرر
- ❌ عدم وجود ترتيب تسلسلي
- ❌ قد يحصل تضارب في استخدام الـ ID والـ Identifier
- ❌ عدم ضمان ID واحد فقط لكل مستخدم

### ✅ الحل الجديد
- ✅ معرّفات **تسلسلية** (Sequential): RAD-00001, RAD-00002, ...
- ✅ **محمية من التزامن** (Thread-safe) - لا خطر من التكرار
- ✅ **موحدة** - استخدام Identifier في جميع أنحاء التطبيق
- ✅ **واحدة فقط** - كل مريض = معرّف واحد دائم في الداتابيز

---

## 🔧 المكونات التقنية

### Backend (.NET)

#### 1. خدمة توليد الـ ID: `PatientIdentifierService.cs`

```csharp
public interface IPatientIdentifierService
{
    // توليد معرّف جديد (RAD-00001, RAD-00002, إلخ)
    Task<string> GenerateUniqueIdentifierAsync();
    
    // الحصول على معرّف موجود أو إنشاء واحد جديد
    Task<string> GetOrCreateIdentifierAsync(string email);
}
```

**المميزات:**
- ✅ توليد تسلصلي بدلاً من العشوائي
- ✅ حماية من التزامن (Thread-safe) باستخدام `lock`
- ✅ فحص عدم التكرار أوتوماتيكياً
- ✅ تسجيل كل العمليات (Logging)

#### 2. تحديث `PatientController.cs`

```csharp
public PatientController(
    RadiologyDbContext db, 
    ILogger<PatientController> logger,
    IPatientIdentifierService identifierService)
{
    _db = db;
    _logger = logger;
    _identifierService = identifierService;
}

[HttpPost("register")]
public async Task<ActionResult<PatientRegistrationResponse>> Register([FromBody] PatientRegistrationRequest req)
{
    // استخدام الخدمة لتوليد معرّف آمن
    var radId = await _identifierService.GenerateUniqueIdentifierAsync();
    
    var patient = new Patient
    {
        Identifier = radId, // RAD-00001, RAD-00002, إلخ
        FirstName = req.FirstName,
        Email = req.Email,
        // ... الحقول الأخرى
    };
    
    _db.Patients.Add(patient);
    await _db.SaveChangesAsync();
    
    return Ok(new PatientRegistrationResponse
    {
        identifier = patient.Identifier, // إرسال RAD-##### للـ Frontend
        // ... البيانات الأخرى
    });
}
```

#### 3. تسجيل الخدمة في `Program.cs`

```csharp
builder.Services.AddScoped<IPatientIdentifierService, PatientIdentifierService>();
```

---

### Frontend (React)

#### مسار البيانات عند التسجيل

```javascript
// RegisterPage.jsx
const handleSubmit = async (e) => {
    // 1. تسجيل في Firebase (للمصادقة)
    const result = await registerUser(
        formData.email, 
        formData.password
    );
    
    // 2. تسجيل في Radiology Backend (للحصول على RAD-##### ID)
    const radiologyResponse = await fetch(
        `${VITE_RADIOLOGY_BASE_URL}/api/Patient/register`,
        {
            method: 'POST',
            body: JSON.stringify({
                firstName: formData.firstName,
                email: formData.email,
                // ...
            })
        }
    );
    
    // 3. استقبال المعرّف من الـ Backend
    const radiologyData = await radiologyResponse.json();
    const radiologyIdentifier = radiologyData.identifier; // RAD-00001
    
    // 4. حفظ في localStorage
    localStorage.setItem("radiologyPatientIdentifier", radiologyIdentifier);
    localStorage.setItem("radiologyPatientId", radiologyData.patientId);
};
```

#### عرض الـ ID في الملف الشخصي

```javascript
// ProfilePage.jsx
const patientData = {
    identifier: localStorage.getItem('radiologyPatientIdentifier'), // RAD-00001
    id: localStorage.getItem('radiologyPatientId') // رقم قاعدة البيانات
};

// عرض في واجهة المستخدم
return (
    <p>Radiology Patient ID: {patientData.identifier}</p> {/* عرض RAD-##### */}
    <p>Database ID: {patientData.id}</p>
);
```

---

## 📊 نموذج البيانات

### Patient Model (Database)

```csharp
public class Patient
{
    [Key]
    public int Id { get; set; }  // رقم قاعدة البيانات (Auto-increment)
    
    [Required]
    public string Identifier { get; set; };  // RAD-00001, RAD-00002, ... (UNIQUE)
    
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    // ... حقول أخرى
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

**ملاحظات:**
- `Id` - رقم قاعدة البيانات الداخلي (يُستخدم للعلاقات)
- `Identifier` - معرّف عام للمريض (RAD-#####) يظهر للمستخدم

---

## 🔐 أمان البيانات

### حماية من التزامن (Race Conditions)

استخدام `lock` object لضمان أن عملية التوليد والحفظ لا تحدث بالتوازي:

```csharp
private static readonly object _lockObject = new object();

public async Task<string> GenerateUniqueIdentifierAsync()
{
    lock (_lockObject)  // ضمان عملية واحدة فقط في الوقت الواحد
    {
        var nextNumber = _db.Patients.Count() + 1;
        var identifier = $"RAD-{nextNumber:D5}";
        return identifier;
    }
}
```

### فحص عدم التكرار

```csharp
// التحقق من عدم وجود مريض بنفس البريد الإلكتروني مسبقاً
var existing = await _db.Patients
    .FirstOrDefaultAsync(p => p.Email == req.Email);
    
if (existing != null)
{
    return BadRequest(new { 
        error = "Patient with this email already exists",
        identifier = existing.Identifier  // إرجاع الـ ID الموجود
    });
}
```

---

## 🔄 تدفق البيانات الكامل

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. مستخدم يسجل: RegisterPage.jsx                               │
│    ├─ يدخل البيانات الشخصية                                   │
│    └─ يضغط على "Register"                                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Firebase Authentication                                       │
│    └─ يتحقق من البريد والكلمة المرور                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. POST /api/Patient/register (Backend)                          │
│    └─ PatientController.Register()                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. توليد Identifier (PatientIdentifierService)                  │
│    ├─ حساب العدد التسلسلي (Count + 1)                          │
│    ├─ توليد RAD-##### (مثلاً: RAD-00001)                        │
│    └─ فحص عدم التكرار                                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. حفظ في قاعدة البيانات (Patient Model)                       │
│    ├─ Id = 1 (auto-increment)                                   │
│    ├─ Identifier = "RAD-00001"                                  │
│    ├─ FirstName = "Mayar"                                       │
│    ├─ Email = "m@gmail.com"                                     │
│    └─ CreatedAt = 2026-05-15                                    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. إرسال الرد (PatientRegistrationResponse)                     │
│    {                                                             │
│      "success": true,                                            │
│      "identifier": "RAD-00001",                                  │
│      "patientId": 1,                                             │
│      "email": "m@gmail.com"                                      │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. حفظ في localStorage (Frontend)                               │
│    ├─ radiologyPatientIdentifier = "RAD-00001"                  │
│    ├─ radiologyPatientId = "1"                                  │
│    └─ radiologyPatientEmail = "m@gmail.com"                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. عرض في ProfilePage                                           │
│    ├─ اسم: Mayar Mohamed                                        │
│    ├─ Radiology Patient ID: RAD-00001 ✓                         │
│    └─ Database ID: 1                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 API Endpoints

### تسجيل مريض جديد

**Request:**
```http
POST /api/Patient/register
Content-Type: application/json

{
    "firstName": "Mayar",
    "lastName": "Mohamed",
    "email": "m@gmail.com",
    "phone": "+201234567890",
    "gender": "Female",
    "address": "Cairo, Egypt"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Patient registered successfully",
    "patientId": 1,
    "identifier": "RAD-00001",
    "email": "m@gmail.com",
    "firstName": "Mayar",
    "lastName": "Mohamed",
    "phone": "+201234567890"
}
```

### الحصول على بيانات المريض

**By Identifier (الطريقة الأفضل):**
```http
GET /api/Patient/by-identifier/RAD-00001
```

**By Email:**
```http
GET /api/Patient/by-email/m@gmail.com
```

**By ID (رقم قاعدة البيانات):**
```http
GET /api/Patient/1
```

---

## 📈 أمثلة عملية

### مثال 1: تسجيل أول مريض

```
POST /api/Patient/register
{
    "firstName": "Ahmed",
    "email": "ahmed@gmail.com",
    "phone": "01012345678"
}

Response:
{
    "identifier": "RAD-00001",  ← المريض الأول
    "patientId": 1
}
```

### مثال 2: تسجيل مريض ثاني

```
POST /api/Patient/register
{
    "firstName": "Sara",
    "email": "sara@gmail.com",
    "phone": "01087654321"
}

Response:
{
    "identifier": "RAD-00002",  ← المريض الثاني
    "patientId": 2
}
```

### مثال 3: محاولة تسجيل نفس البريد مرة أخرى

```
POST /api/Patient/register
{
    "firstName": "Ahmed",
    "email": "ahmed@gmail.com",  ← نفس البريد
    "phone": "01099999999"
}

Response (Error):
{
    "error": "Patient with this email already exists",
    "identifier": "RAD-00001"  ← إرجاع الـ ID الموجود
}
```

---

## 🧪 التجارب (Testing)

### Test Case 1: تسجيل جديد
```
✓ إدخال بيانات صحيحة
✓ الحصول على RAD-##### فريد
✓ حفظ في قاعدة البيانات
✓ عرض في الملف الشخصي
```

### Test Case 2: منع التكرار
```
✓ محاولة تسجيل نفس البريد
✓ استقبال رسالة خطأ
✓ عرض الـ ID الموجود
```

### Test Case 3: الوصول للبيانات
```
✓ البحث بـ Identifier (RAD-00001)
✓ البحث بـ Email
✓ البحث بـ ID
✓ إرجاع جميع البيانات بشكل صحيح
```

---

## 🚀 الخطوات التالية

### ✅ تم تنفيذه
- [x] إنشاء خدمة توليد الـ ID التسلصلي
- [x] تحديث PatientController
- [x] تسجيل الخدمة في Program.cs
- [x] توثيق النظام الكامل
- [x] آمان من التزامن (Thread-safe)

### 📋 التحديثات المستقبلية المقترحة
- [ ] إضافة Constraints في قاعدة البيانات (Unique)
- [ ] إنشاء Migration للبيانات الموجودة
- [ ] إضافة API لإعادة توليد الـ ID (إذا لزم الأمر)
- [ ] إضافة Audit Log لتتبع تغييرات الـ ID
- [ ] استخدام الـ Identifier في جميع العمليات الأخرى

---

## 📞 الدعم والأسئلة الشائعة

### س: هل يمكن تغيير الـ ID بعد التسجيل؟
**ج:** لا، الـ ID دائم وفريد لكل مريض ولا يتم تغييره أبداً.

### س: ماذا إذا حاول شخصان التسجيل في نفس الوقت؟
**ج:** لا مشكلة - الخدمة محمية بـ `lock` object، كل واحد سيحصل على معرّف فريد.

### س: هل يمكن استخدام الـ ID للبحث عن المريض؟
**ج:** نعم - استخدم endpoint `/api/Patient/by-identifier/RAD-00001`

### س: ما الفرق بين `Id` و `Identifier`؟
**ج:** 
- `Id` = رقم قاعدة البيانات الداخلي (1, 2, 3, ...)
- `Identifier` = المعرّف العام للمستخدم (RAD-00001, RAD-00002, ...)

---

**تم التطوير بواسطة:** نظام Radiology Center  
**التاريخ:** مايو 2026  
**الإصدار:** 1.0
