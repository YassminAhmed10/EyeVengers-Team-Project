-- ========================================
-- 🏥 إضافة سجلات طبية متعددة لنفس المريض (Reem Saeed Mahmoud - P-020)
-- ========================================
-- هذا الملف يضيف 3 زيارات مختلفة بتواريخ مختلفة وتشخيصات مختلفة
-- لاختبار عرض التاريخ الطبي في صفحة EMR
-- ========================================

USE EyeClinicDB;
GO

DECLARE @PatientId INT = 20; -- Reem Saeed Mahmoud (P-020)

-- ========================================
-- 🗓️ الزيارة الأولى: 15 نوفمبر 2025
-- تشخيص: Conjunctivitis (التهاب الملتحمة)
-- ========================================

-- إضافة سجل طبي للزيارة الأولى
INSERT INTO MedicalRecords (PatientId, DoctorId, VisitDate, RecordStatus, CreatedAt, UpdatedAt)
VALUES (@PatientId, 2, '2025-11-15', 'Active', '2025-11-15 10:30:00', '2025-11-15 11:45:00');

DECLARE @Record1Id INT = SCOPE_IDENTITY();

-- شكوى المريض
INSERT INTO PatientComplaints (RecordId, Complaint, Duration, Severity, CreatedAt)
VALUES (@Record1Id, 'Redness and itching in both eyes', '3 days', 'Moderate', '2025-11-15 10:35:00');

-- التاريخ المرضي
INSERT INTO MedicalHistories (RecordId, PastMedicalHistory, FamilyHistory, Allergies, ChronicDiseases, CreatedAt)
VALUES (@Record1Id, 'No significant past history', 'Mother has diabetes', 'No known allergies', 'None', '2025-11-15 10:40:00');

-- فحص العين
INSERT INTO EyeExaminations (
    RecordId, VisualAcuity, IntraocularPressure, PupilReaction, 
    AnteriorSegment, PosteriorSegment, FundusObservation, CreatedAt
)
VALUES (
    @Record1Id, '20/25 OD, 20/25 OS', '14 mmHg OD, 15 mmHg OS', 'Brisk',
    'Conjunctival injection bilaterally, mild papillary reaction', 
    'Normal', 'Optic disc normal, no hemorrhages', '2025-11-15 10:50:00'
);

-- الفحوصات
INSERT INTO Investigations (RecordId, TestName, Result, TestDate, Notes, CreatedAt)
VALUES 
    (@Record1Id, 'Visual Acuity Test', 'Normal - 20/25 both eyes', '2025-11-15', 'Slight reduction from baseline', '2025-11-15 11:00:00'),
    (@Record1Id, 'Slit Lamp Examination', 'Conjunctival inflammation', '2025-11-15', 'Bilateral conjunctivitis confirmed', '2025-11-15 11:10:00');

-- التشخيص
INSERT INTO Diagnoses (RecordId, DiagnosisText, ICD10Code, CheckupDate, TreatmentPlan, CreatedAt)
VALUES (@Record1Id, 'Acute bacterial conjunctivitis, bilateral', 'H10.023', '2025-11-15', 
        'Antibiotic eye drops, warm compresses, follow up in 1 week', '2025-11-15 11:20:00');

-- الوصفة الطبية
INSERT INTO Prescriptions (RecordId, PrescriptionDate, Instructions, CreatedAt)
VALUES (@Record1Id, '2025-11-15', 'Apply antibiotic drops 4 times daily for 7 days. Avoid eye rubbing.', '2025-11-15 11:25:00');

DECLARE @Prescription1Id INT = SCOPE_IDENTITY();

INSERT INTO PrescriptionItems (PrescriptionId, Medication, Dosage, Frequency, Duration, Notes)
VALUES 
    (@Prescription1Id, 'Tobramycin Eye Drops', '0.3%', '4 times daily', '7 days', 'One drop in each eye'),
    (@Prescription1Id, 'Artificial Tears', 'As needed', 'Every 2-4 hours', '7 days', 'For comfort and lubrication');

-- ========================================
-- 🗓️ الزيارة الثانية: 28 ديسمبر 2025
-- تشخيص: Refractive Error (خطأ انكساري - قصر نظر)
-- ========================================

-- إضافة سجل طبي للزيارة الثانية
INSERT INTO MedicalRecords (PatientId, DoctorId, VisitDate, RecordStatus, CreatedAt, UpdatedAt)
VALUES (@PatientId, 3, '2025-12-28', 'Active', '2025-12-28 14:00:00', '2025-12-28 15:30:00');

DECLARE @Record2Id INT = SCOPE_IDENTITY();

-- شكوى المريض
INSERT INTO PatientComplaints (RecordId, Complaint, Duration, Severity, CreatedAt)
VALUES (@Record2Id, 'Blurry vision when looking at distant objects, frequent squinting', '2 months', 'Moderate', '2025-12-28 14:05:00');

-- التاريخ المرضي
INSERT INTO MedicalHistories (RecordId, PastMedicalHistory, FamilyHistory, Allergies, ChronicDiseases, CreatedAt)
VALUES (@Record2Id, 'Recent conjunctivitis (resolved)', 'Mother: diabetes, Father: myopia', 'No known allergies', 'None', '2025-12-28 14:10:00');

-- فحص العين
INSERT INTO EyeExaminations (
    RecordId, VisualAcuity, IntraocularPressure, PupilReaction, 
    AnteriorSegment, PosteriorSegment, FundusObservation, CreatedAt
)
VALUES (
    @Record2Id, '20/80 OD, 20/100 OS (uncorrected), 20/20 with -2.50 correction', 
    '16 mmHg OD, 15 mmHg OS', 'Brisk',
    'Clear cornea, normal anterior chamber', 
    'Normal retina, no pathology', 
    'Optic disc healthy, cup-to-disc ratio 0.3', '2025-12-28 14:25:00'
);

-- الفحوصات
INSERT INTO Investigations (RecordId, TestName, Result, TestDate, Notes, CreatedAt)
VALUES 
    (@Record2Id, 'Refraction Test', 'OD: -2.50 DS, OS: -2.75 DS', '2025-12-28', 'Moderate myopia both eyes', '2025-12-28 14:35:00'),
    (@Record2Id, 'Auto-Refractometry', 'OD: -2.50 DS, OS: -2.75 DS', '2025-12-28', 'Confirms manual refraction', '2025-12-28 14:40:00'),
    (@Record2Id, 'Keratometry', 'Normal corneal curvature', '2025-12-28', 'No astigmatism detected', '2025-12-28 14:45:00');

-- التشخيص
INSERT INTO Diagnoses (RecordId, DiagnosisText, ICD10Code, CheckupDate, TreatmentPlan, CreatedAt)
VALUES (@Record2Id, 'Myopia, bilateral (moderate)', 'H52.13', '2025-12-28', 
        'Prescription glasses recommended. Annual eye exams advised.', '2025-12-28 15:00:00');

-- الوصفة الطبية (نظارة طبية)
INSERT INTO Prescriptions (RecordId, PrescriptionDate, Instructions, CreatedAt)
VALUES (@Record2Id, '2025-12-28', 'Wear corrective glasses full-time. Follow up in 6 months or if vision changes.', '2025-12-28 15:10:00');

DECLARE @Prescription2Id INT = SCOPE_IDENTITY();

INSERT INTO PrescriptionItems (PrescriptionId, Medication, Dosage, Frequency, Duration, Notes)
VALUES 
    (@Prescription2Id, 'Eyeglasses Prescription', 'OD: -2.50 DS, OS: -2.75 DS', 'Full-time wear', 'Indefinite', 'Single vision distance correction'),
    (@Prescription2Id, 'Blue Light Filter (optional)', 'Add to lenses', 'As needed', 'Indefinite', 'For digital screen use');

-- ========================================
-- 🗓️ الزيارة الثالثة: 25 يناير 2026 (زيارة مستقبلية)
-- تشخيص: Dry Eye Syndrome (متلازمة جفاف العين)
-- ========================================

-- إضافة سجل طبي للزيارة الثالثة
INSERT INTO MedicalRecords (PatientId, DoctorId, VisitDate, RecordStatus, CreatedAt, UpdatedAt)
VALUES (@PatientId, 2, '2026-01-25', 'Active', '2026-01-25 09:00:00', '2026-01-25 10:15:00');

DECLARE @Record3Id INT = SCOPE_IDENTITY();

-- شكوى المريض
INSERT INTO PatientComplaints (RecordId, Complaint, Duration, Severity, CreatedAt)
VALUES (@Record3Id, 'Persistent dry, gritty feeling in eyes, especially after computer work. Eyes feel tired.', 
        '4 weeks', 'Moderate', '2026-01-25 09:05:00');

-- التاريخ المرضي
INSERT INTO MedicalHistories (RecordId, PastMedicalHistory, FamilyHistory, Allergies, ChronicDiseases, CreatedAt)
VALUES (@Record3Id, 'Conjunctivitis (Nov 2025), Myopia (Dec 2025)', 'Mother: diabetes, Father: myopia', 
        'No known allergies', 'None', '2026-01-25 09:10:00');

-- فحص العين
INSERT INTO EyeExaminations (
    RecordId, VisualAcuity, IntraocularPressure, PupilReaction, 
    AnteriorSegment, PosteriorSegment, FundusObservation, CreatedAt
)
VALUES (
    @Record3Id, '20/20 with correction (wearing prescribed glasses)', 
    '14 mmHg OD, 15 mmHg OS', 'Normal',
    'Tear film break-up time reduced (5 seconds), mild conjunctival injection', 
    'Normal', 'Healthy optic nerve and retina', '2026-01-25 09:25:00'
);

-- الفحوصات
INSERT INTO Investigations (RecordId, TestName, Result, TestDate, Notes, CreatedAt)
VALUES 
    (@Record3Id, 'Schirmer Test', 'OD: 8mm, OS: 7mm (reduced tear production)', '2026-01-25', 'Below normal (normal >10mm)', '2026-01-25 09:35:00'),
    (@Record3Id, 'Tear Break-Up Time (TBUT)', '5 seconds (abnormal)', '2026-01-25', 'Normal is >10 seconds', '2026-01-25 09:40:00'),
    (@Record3Id, 'Corneal Staining', 'Mild punctate staining inferior cornea', '2026-01-25', 'Indicates dry eye damage', '2026-01-25 09:45:00');

-- التشخيص
INSERT INTO Diagnoses (RecordId, DiagnosisText, ICD10Code, CheckupDate, TreatmentPlan, CreatedAt)
VALUES (@Record3Id, 'Dry eye syndrome (keratoconjunctivitis sicca), bilateral', 'H04.123', '2026-01-25', 
        'Artificial tears 4x daily, omega-3 supplements, reduce screen time, follow up in 4 weeks', '2026-01-25 09:55:00');

-- الوصفة الطبية
INSERT INTO Prescriptions (RecordId, PrescriptionDate, Instructions, CreatedAt)
VALUES (@Record3Id, '2026-01-25', 'Use artificial tears regularly. Apply warm compress to eyes for 5-10 minutes twice daily. Follow 20-20-20 rule for screen use.', '2026-01-25 10:00:00');

DECLARE @Prescription3Id INT = SCOPE_IDENTITY();

INSERT INTO PrescriptionItems (PrescriptionId, Medication, Dosage, Frequency, Duration, Notes)
VALUES 
    (@Prescription3Id, 'Systane Ultra Eye Drops', 'Preservative-free', '4 times daily', 'Ongoing', 'Use as needed for comfort'),
    (@Prescription3Id, 'Omega-3 Fish Oil', '1000mg', 'Twice daily with meals', 'Ongoing', 'For tear film improvement'),
    (@Prescription3Id, 'Warm Eye Compress', 'Apply warm compress', 'Twice daily', 'Ongoing', '5-10 minutes per session'),
    (@Prescription3Id, 'Computer Glasses (optional)', 'With blue light filter', 'During screen use', 'Ongoing', 'Already have prescription glasses');

-- ========================================
-- ✅ تم إضافة 3 زيارات مختلفة بنجاح!
-- ========================================

PRINT '✅ تم إضافة 3 سجلات طبية مختلفة للمريضة Reem Saeed Mahmoud (P-020)';
PRINT 'الزيارة 1: Conjunctivitis (15 نوفمبر 2025)';
PRINT 'الزيارة 2: Myopia (28 ديسمبر 2025)';
PRINT 'الزيارة 3: Dry Eye Syndrome (25 يناير 2026)';

GO
