# Integration Guide - استخدام نظام معرّفات المرضى

## دليل التكامل الكامل لنظام RAD-##### ID

هذا الدليل يشرح كيفية استخدام معرّفات المرضى الجديدة في جميع أنحاء التطبيق.

---

## 1. Backend Integration (تطبيق الويب)

### 1.1 استخدام الـ Identifier في الحجوزات

#### قبل (القديم)
```csharp
// استخدام PatientId (رقم قاعدة البيانات) فقط
var appointment = new Appointment
{
    PatientId = 1,  // ❌ رقم داخلي
    RadiologyServiceId = 5,
    SlotId = 10
};
```

#### بعد (الجديد)
```csharp
// استخدام Identifier أيضاً للتتبع والربط
var patient = await _context.Patients
    .FirstOrDefaultAsync(p => p.Identifier == "RAD-00001");

var appointment = new Appointment
{
    PatientId = patient.Id,  // ✓ لا زال مطلوب للعلاقات
    RadiologyServiceId = 5,
    SlotId = 10,
    // يمكن إضافة حقل للتتبع
    // PatientIdentifier = patient.Identifier  // ✓ اختياري للتتبع
};

await _context.SaveChangesAsync();
```

### 1.2 البحث عن المريض - استخدام Identifier

```csharp
// بدلاً من البحث برقم قاعدة البيانات
// ✓ استخدم الـ Identifier (يراه المستخدم)

[HttpGet("by-identifier/{identifier}")]
public async Task<ActionResult> GetPatientByIdentifier(string identifier)
{
    var patient = await _context.Patients
        .FirstOrDefaultAsync(p => p.Identifier == identifier);
    
    if (patient == null)
        return NotFound(new { error = "Patient not found" });
    
    return Ok(new { 
        id = patient.Id,
        identifier = patient.Identifier,
        firstName = patient.FirstName,
        email = patient.Email
    });
}
```

### 1.3 تسجيل العمليات (Audit Log) مع الـ Identifier

```csharp
// عند كل عملية، سجل الـ Identifier بدلاً من PatientId
_logger.LogInformation(
    "Patient {Identifier} booked appointment {AppointmentId}", 
    patient.Identifier,  // ✓ استخدم Identifier
    appointment.Id
);

// أو في جدول Audit منفصل
auditLog = new AuditLog
{
    PatientIdentifier = patient.Identifier,  // ✓ استخدم Identifier
    Action = "BookAppointment",
    Timestamp = DateTime.UtcNow
};
```

---

## 2. Frontend Integration (تطبيق React)

### 2.1 حفظ ومعالجة الـ Identifier

```javascript
// RegisterPage.jsx - عند التسجيل الناجح
const handleRegistrationSuccess = async (radiologyData) => {
    // حفظ الـ Identifier
    localStorage.setItem("radiologyPatientIdentifier", radiologyData.identifier); // ✓ RAD-00001
    localStorage.setItem("radiologyPatientId", radiologyData.patientId);  // ✓ 1
    localStorage.setItem("radiologyPatientEmail", radiologyData.email);
    
    // تحديث Context/Redux إذا كنت تستخدمه
    setUser({
        id: radiologyData.patientId,
        identifier: radiologyData.identifier,  // ✓ RAD-00001
        email: radiologyData.email
    });
};
```

### 2.2 استخدام الـ Identifier في الطلبات

```javascript
// appointmentService.js
export const appointmentService = {
    // ✓ استخدم Identifier للبحث والربط
    async getPatientAppointments(patientIdentifier) {
        const response = await fetch(
            `/api/Patient/by-identifier/${patientIdentifier}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const patient = await response.json();
        
        // ثم استخدم PatientId للحصول على الحجوزات
        return fetch(`/api/Appointment/patient/${patient.id}`);
    },
    
    // عند الحجز الجديد
    async bookAppointment(appointmentData) {
        return fetch('/api/Appointment', {
            method: 'POST',
            body: JSON.stringify({
                patientIdentifier: appointmentData.identifier,  // ✓ RAD-00001
                serviceId: appointmentData.serviceId,
                slotId: appointmentData.slotId
            })
        });
    }
};
```

### 2.3 عرض الـ Identifier في الواجهة

```javascript
// ProfilePage.jsx
export default function ProfilePage() {
    const [patient, setPatient] = useState({
        identifier: localStorage.getItem('radiologyPatientIdentifier'),  // ✓ RAD-00001
        name: localStorage.getItem('radiologyPatientName')
    });
    
    return (
        <div>
            <h1>My Profile</h1>
            {/* عرض الـ Identifier للمستخدم */}
            <p>Your Radiology ID: <strong>{patient.identifier}</strong></p>
            {/* ✓ يجب أن يرى المستخدم RAD-00001 وليس رقم قاعدة البيانات */}
        </div>
    );
}
```

### 2.4 البحث والتصفية بـ Identifier

```javascript
// PatientSearchComponent.jsx
export default function PatientSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        // ✓ البحث بـ Identifier (RAD-00001)
        if (term.startsWith('RAD-')) {
            const response = await fetch(`/api/Patient/by-identifier/${term}`);
            const patient = await response.json();
            setSearchResult(patient);
        }
        // أو بـ Email
        else if (term.includes('@')) {
            const response = await fetch(`/api/Patient/by-email/${term}`);
            const patient = await response.json();
            setSearchResult(patient);
        }
    };
    
    return (
        <input 
            placeholder="Search by ID (RAD-00001) or Email"
            onChange={handleSearch}
            value={searchTerm}
        />
    );
}
```

---

## 3. FHIR/HL7 Integration

### 3.1 استخدام الـ Identifier في FHIR Mapping

```csharp
// FhirMappingService.cs
public FhirPatient MapToFhir(Patient patient)
{
    return new FhirPatient
    {
        ResourceType = "Patient",
        Id = patient.Id.ToString(),
        
        // ✓ استخدم الـ Identifier
        Identifier = new List<Identifier>
        {
            new Identifier
            {
                System = "http://radiology.example.com/identifier",
                Value = patient.Identifier  // ✓ RAD-00001
            }
        },
        
        Name = new List<HumanName>
        {
            new HumanName
            {
                Given = new[] { patient.FirstName },
                Family = patient.LastName
            }
        },
        
        // ... حقول أخرى
    };
}

// عند إرسال بيانات للعيادة
public async Task SendToClinicSystem(Patient patient)
{
    var fhirPatient = MapToFhir(patient);
    
    var hl7Message = GenerateHL7Message(
        patientIdentifier: patient.Identifier,  // ✓ RAD-00001
        patientName: patient.FirstName,
        appointmentId: appointment.Id
    );
    
    // إرسال لنظام العيادة
    await SendToClinicAPI(hl7Message);
}
```

### 3.2 مثال HL7 Segment مع الـ Identifier

```
MSH|^~\&|RADIOLOGY|RAD_CENTER|CLINIC|CLINIC_SYS|20260515||ORU^R01|12345|P|2.5
PID|||1||Mohamed^Mayar||19900101|F|||Cairo, Egypt||01012345678
OBX|1|RAD||RAD-00001^Patient Radiology ID||RAD-00001||||||F
OBX|2|NM|Test^Result||Value||Units||||||F
```

---

## 4. تحديثات قاعدة البيانات (Migrations)

### إضافة Unique Constraint

```csharp
// Migration File
protected override void Up(MigrationBuilder migrationBuilder)
{
    // جعل الـ Identifier فريد
    migrationBuilder.CreateIndex(
        name: "IX_Patients_Identifier_Unique",
        table: "Patients",
        column: "Identifier",
        unique: true);
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.DropIndex(
        name: "IX_Patients_Identifier_Unique",
        table: "Patients");
}
```

### تحديث البيانات الموجودة

```sql
-- SQL Script لتحديث البيانات القديمة
UPDATE Patients
SET Identifier = 'RAD-' + RIGHT('00000' + CAST(Id AS VARCHAR(5)), 5)
WHERE Identifier IS NULL OR Identifier = ''
```

---

## 5. أفضل الممارسات (Best Practices)

### ✅ افعل:

```javascript
// ✅ استخدم الـ Identifier عند الحجز
const bookAppointment = async (identifier) => {
    // البحث عن المريض بـ Identifier أولاً
    const patient = await fetch(`/api/Patient/by-identifier/${identifier}`);
    // ...
};

// ✅ اعرض الـ Identifier للمستخدم
<p>Your ID: {patient.identifier}</p>

// ✅ استخدم الـ Identifier في السجلات
console.log(`Patient ${patient.identifier} booked appointment`);

// ✅ اجعل الـ Identifier قابل للنسخ
<span onDoubleClick={() => copyToClipboard(identifier)}>
    {identifier}
</span>
```

### ❌ لا تفعل:

```javascript
// ❌ لا تعرض رقم قاعدة البيانات للمستخدم
<p>Your ID: {patient.id}</p>

// ❌ لا تستخدم PatientId في الطلبات الخارجية
POST /api/Appointment
{
    patientId: 1,  // ❌ خطر! رقم داخلي
    // يجب استخدام identifier بدلاً منه
}

// ❌ لا تحزر الـ ID
const guessedId = `RAD-${Math.random() * 100000}`;  // ❌ خطر!

// ❌ لا تدع المستخدم يعدل الـ Identifier
<input value={identifier} onChange={...} />  // ❌ يجب أن يكون read-only
```

---

## 6. الاختبار والتحقق

### Test Cases

```javascript
describe('Patient Identifier System', () => {
    test('Generate sequential identifiers', async () => {
        const patient1 = await registerPatient('ahmed@email.com');
        const patient2 = await registerPatient('sara@email.com');
        
        expect(patient1.identifier).toBe('RAD-00001');
        expect(patient2.identifier).toBe('RAD-00002');
    });
    
    test('Prevent duplicate identifiers', async () => {
        const patient1 = await registerPatient('test@email.com');
        const patient2 = await registerPatient('test@email.com');
        
        expect(patient2.error).toBeDefined();
        expect(patient2.identifier).toBe(patient1.identifier);
    });
    
    test('Get patient by identifier', async () => {
        const patient = await registerPatient('test@email.com');
        const found = await getPatientByIdentifier(patient.identifier);
        
        expect(found.email).toBe('test@email.com');
        expect(found.identifier).toBe(patient.identifier);
    });
    
    test('Identifier is immutable', async () => {
        const patient = await registerPatient('test@email.com');
        const originalId = patient.identifier;
        
        await updatePatient(patient.id, { email: 'new@email.com' });
        const updated = await getPatient(patient.id);
        
        expect(updated.identifier).toBe(originalId); // لم يتغير
    });
});
```

### Manual Testing Checklist

- [ ] تسجيل مريض جديد → الحصول على RAD-00001
- [ ] تسجيل مريض ثاني → الحصول على RAD-00002
- [ ] عرض الـ ID في الملف الشخصي بشكل صحيح
- [ ] البحث عن المريض بـ ID يعطي النتيجة الصحيحة
- [ ] إعادة تحديث الصفحة → احتفاظ الـ ID
- [ ] حجز موعد → ربطه بـ ID الصحيح
- [ ] عرض السجلات → عرض الـ ID بشكل صحيح
- [ ] لا يمكن تعديل الـ ID
- [ ] لا يمكن نسخ نفس الـ ID لشخص آخر

---

## 7. استكشاف الأخطاء

### مشكلة: الـ Identifier فارغ أو مفقود

```csharp
// الحل: فحص وإصلاح البيانات
var patientsWithoutIdentifier = _context.Patients
    .Where(p => string.IsNullOrEmpty(p.Identifier))
    .ToList();

foreach (var patient in patientsWithoutIdentifier)
{
    patient.Identifier = await _identifierService
        .GenerateUniqueIdentifierAsync();
}

await _context.SaveChangesAsync();
```

### مشكلة: تكرار الـ Identifiers

```sql
-- البحث عن التكرارات
SELECT Identifier, COUNT(*) as Count
FROM Patients
GROUP BY Identifier
HAVING COUNT(*) > 1

-- الإصلاح: إعادة توليد للمكررات
UPDATE Patients
SET Identifier = 'RAD-' + RIGHT('00000' + CAST(ROW_NUMBER() OVER (ORDER BY CreatedAt) AS VARCHAR(5)), 5)
WHERE Identifier IN (
    SELECT Identifier FROM Patients
    GROUP BY Identifier HAVING COUNT(*) > 1
)
```

### مشكلة: الـ localStorage محذوف

```javascript
// الحل: استعادة البيانات من Backend
useEffect(() => {
    if (!localStorage.getItem('radiologyPatientIdentifier')) {
        // استعادة من Backend
        const patient = await fetch(
            `/api/Patient/by-email/${email}`
        );
        localStorage.setItem(
            'radiologyPatientIdentifier', 
            patient.identifier
        );
    }
}, []);
```

---

## 8. الملخص

| العنصر | القديم | الجديد |
|------|--------|--------|
| **صيغة الـ ID** | عشوائي | تسلصلي (RAD-00001) |
| **الأمان** | قد تتكرر | محمية من التزامن |
| **استخدام** | PatientId فقط | Identifier + PatientId |
| **عرض للمستخدم** | رقم قاعدة البيانات | RAD-##### |
| **البحث** | بواسطة ID | بواسطة Identifier/Email |
| **FHIR** | لم يُستخدم | في Identifier mapping |

---

**آخر تحديث:** مايو 2026  
**الإصدار:** 1.0
