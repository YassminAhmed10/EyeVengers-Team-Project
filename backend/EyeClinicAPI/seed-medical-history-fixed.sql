-- ========================================
-- 🏥 إضافة سجلات طبية متعددة لنفس المريض (Reem Saeed Mahmoud - P-020)
-- ========================================
-- Updated to match actual database schema
-- ========================================

USE EyeClinicDB;
GO

DECLARE @PatientId INT = 20; -- Reem Saeed Mahmoud (P-020)

-- ========================================
-- 🗓️ الزيارة الأولى: 15 نوفمبر 2025
-- تشخيص: Conjunctivitis (التهاب الملتحمة)
-- ========================================

-- إضافة سجل طبي للزيارة الأولى
INSERT INTO MedicalRecords (PatientId, PatientIdentifier, VisitDate, CreatedAt, UpdatedAt)
VALUES (@PatientId, 'P-020', '2025-11-15', '2025-11-15 10:30:00', '2025-11-15 11:45:00');

DECLARE @Record1Id INT = SCOPE_IDENTITY();

-- شكوى المريض
INSERT INTO PatientComplaints (MedicalRecordId, Complaint, Duration, OriginalText, TranslatedText, CreatedAt, UpdatedAt, IsArchived)
VALUES (@Record1Id, 'Redness and itching in both eyes', '3 days', 'احمرار وحكة في كلتا العينين', 'Redness and itching in both eyes', '2025-11-15 10:35:00', '2025-11-15 10:35:00', 0);

-- التاريخ المرضي
INSERT INTO MedicalHistories (MedicalRecordId, PastMedicalHistory, FamilyHistory, Allergies, PreviousEye, CreatedAt, UpdatedAt, IsArchived)
VALUES (@Record1Id, 'No significant past history', 'Mother has diabetes', 'No known allergies', 'No previous eye conditions', '2025-11-15 10:40:00', '2025-11-15 10:40:00', 0);

-- فحص العين
INSERT INTO EyeExaminations (
    MedicalRecordId, VisualAcuity, IntraocularPressure, PupilReaction, 
    AnteriorSegment, PosteriorSegment, FundusObservation, 
    RightEye, LeftEye, EyePressure,
    CreatedAt, UpdatedAt, IsArchived
)
VALUES (
    @Record1Id, '20/25', '14-15 mmHg', 'Brisk',
    'Conjunctival injection bilaterally, mild papillary reaction', 
    'Normal', 'Optic disc normal, no hemorrhages',
    '20/25', '20/25', '14 OD / 15 OS',
    '2025-11-15 10:50:00', '2025-11-15 10:50:00', 0
);

-- الفحوصات
INSERT INTO Investigations (MedicalRecordId, TestName, Result, TestDate, Notes, CreatedAt, UpdatedAt)
VALUES 
    (@Record1Id, 'Visual Acuity Test', 'Normal - 20/25 both eyes', '2025-11-15', 'Slight reduction from baseline', '2025-11-15 11:00:00', '2025-11-15 11:00:00'),
    (@Record1Id, 'Slit Lamp Examination', 'Conjunctival inflammation', '2025-11-15', 'Bilateral conjunctivitis confirmed', '2025-11-15 11:10:00', '2025-11-15 11:10:00');

-- التشخيص
INSERT INTO Diagnoses (MedicalRecordId, DiagnosisText, DiagnosisName, ICD10Code, CheckupDate, Status, Severity, Notes, CreatedAt, UpdatedAt)
VALUES (@Record1Id, 'Acute bacterial conjunctivitis, bilateral', 'Bacterial Conjunctivitis', 'H10.023', '2025-11-15', 
        'Active', 'Moderate', 'Antibiotic eye drops prescribed, follow up in 1 week', '2025-11-15 11:20:00', '2025-11-15 11:20:00');

-- الوصفة الطبية
INSERT INTO Prescriptions (MedicalRecordId, PrescriptionDate, Instructions, Notes, CreatedAt, UpdatedAt)
VALUES (@Record1Id, '2025-11-15', 'Apply antibiotic drops 4 times daily for 7 days. Avoid eye rubbing.', 'Warm compresses recommended', '2025-11-15 11:25:00', '2025-11-15 11:25:00');

DECLARE @Prescription1Id INT = SCOPE_IDENTITY();

INSERT INTO PrescriptionItems (PrescriptionId, Medication, Dosage, Frequency, Duration, Notes)
VALUES 
    (@Prescription1Id, 'Tobramycin Eye Drops', '0.3%', '4 times daily', '7 days', 'One drop in each eye'),
    (@Prescription1Id, 'Artificial Tears', 'As needed', 'Every 2-4 hours', '7 days', 'For comfort and lubrication');

-- ========================================
-- 🗓️ الزيارة الثانية: 28 ديسمبر 2025
-- تشخيص: Refractive Error (خطأ انكساري - قصر نظر)
-- ========================================

INSERT INTO MedicalRecords (PatientId, PatientIdentifier, VisitDate, CreatedAt, UpdatedAt)
VALUES (@PatientId, 'P-020', '2025-12-28', '2025-12-28 14:00:00', '2025-12-28 15:30:00');

DECLARE @Record2Id INT = SCOPE_IDENTITY();

INSERT INTO PatientComplaints (MedicalRecordId, Complaint, Duration, OriginalText, TranslatedText, CreatedAt, UpdatedAt, IsArchived)
VALUES (@Record2Id, 'Blurry vision when looking at distant objects, frequent squinting', '2 months', 'رؤية ضبابية عند النظر للأشياء البعيدة', 'Blurry vision when looking at distant objects', '2025-12-28 14:05:00', '2025-12-28 14:05:00', 0);

INSERT INTO MedicalHistories (MedicalRecordId, PastMedicalHistory, FamilyHistory, Allergies, PreviousEye, CreatedAt, UpdatedAt, IsArchived)
VALUES (@Record2Id, 'Recent conjunctivitis (resolved)', 'Mother: diabetes, Father: myopia', 'No known allergies', 'Conjunctivitis in Nov 2025', '2025-12-28 14:10:00', '2025-12-28 14:10:00', 0);

INSERT INTO EyeExaminations (
    MedicalRecordId, VisualAcuity, IntraocularPressure, PupilReaction, 
    AnteriorSegment, PosteriorSegment, FundusObservation,
    RightEye, LeftEye, EyePressure,
    CreatedAt, UpdatedAt, IsArchived
)
VALUES (
    @Record2Id, '20/80 uncorrected, 20/20 with -2.50 correction', '16 OD / 15 OS mmHg', 'Brisk',
    'Clear cornea, normal anterior chamber', 
    'Normal retina, no pathology', 
    'Optic disc healthy, C/D ratio 0.3',
    '20/80', '20/100', '16 OD / 15 OS',
    '2025-12-28 14:25:00', '2025-12-28 14:25:00', 0
);

INSERT INTO Investigations (MedicalRecordId, TestName, Result, TestDate, Notes, CreatedAt, UpdatedAt)
VALUES 
    (@Record2Id, 'Refraction Test', 'OD: -2.50 DS, OS: -2.75 DS', '2025-12-28', 'Moderate myopia both eyes', '2025-12-28 14:35:00', '2025-12-28 14:35:00'),
    (@Record2Id, 'Auto-Refractometry', 'OD: -2.50 DS, OS: -2.75 DS', '2025-12-28', 'Confirms manual refraction', '2025-12-28 14:40:00', '2025-12-28 14:40:00'),
    (@Record2Id, 'Keratometry', 'Normal corneal curvature', '2025-12-28', 'No astigmatism detected', '2025-12-28 14:45:00', '2025-12-28 14:45:00');

INSERT INTO Diagnoses (MedicalRecordId, DiagnosisText, DiagnosisName, ICD10Code, CheckupDate, Status, Severity, Notes, CreatedAt, UpdatedAt)
VALUES (@Record2Id, 'Myopia, bilateral (moderate)', 'Myopia', 'H52.13', '2025-12-28', 
        'Active', 'Moderate', 'Prescription glasses recommended. Annual exams advised.', '2025-12-28 15:00:00', '2025-12-28 15:00:00');

INSERT INTO Prescriptions (MedicalRecordId, PrescriptionDate, Instructions, Notes, CreatedAt, UpdatedAt)
VALUES (@Record2Id, '2025-12-28', 'Wear corrective glasses full-time. Follow up in 6 months or if vision changes.', 'Eyeglasses prescription provided', '2025-12-28 15:10:00', '2025-12-28 15:10:00');

DECLARE @Prescription2Id INT = SCOPE_IDENTITY();

INSERT INTO PrescriptionItems (PrescriptionId, Medication, Dosage, Frequency, Duration, Notes)
VALUES 
    (@Prescription2Id, 'Eyeglasses Prescription', 'OD: -2.50 DS, OS: -2.75 DS', 'Full-time wear', 'Indefinite', 'Single vision distance correction'),
    (@Prescription2Id, 'Blue Light Filter', 'Add to lenses', 'As needed', 'Indefinite', 'Optional for digital screen use');

-- ========================================
-- 🗓️ الزيارة الثالثة: 25 يناير 2026
-- تشخيص: Dry Eye Syndrome (متلازمة جفاف العين)
-- ========================================

INSERT INTO MedicalRecords (PatientId, PatientIdentifier, VisitDate, CreatedAt, UpdatedAt)
VALUES (@PatientId, 'P-020', '2026-01-25', '2026-01-25 09:00:00', '2026-01-25 10:15:00');

DECLARE @Record3Id INT = SCOPE_IDENTITY();

INSERT INTO PatientComplaints (MedicalRecordId, Complaint, Duration, OriginalText, TranslatedText, CreatedAt, UpdatedAt, IsArchived)
VALUES (@Record3Id, 'Persistent dry, gritty feeling in eyes, especially after computer work. Eyes feel tired.', 
        '4 weeks', 'شعور بالجفاف والحكة المستمرة', 'Persistent dry, gritty feeling in eyes', '2026-01-25 09:05:00', '2026-01-25 09:05:00', 0);

INSERT INTO MedicalHistories (MedicalRecordId, PastMedicalHistory, FamilyHistory, Allergies, PreviousEye, CreatedAt, UpdatedAt, IsArchived)
VALUES (@Record3Id, 'Conjunctivitis (Nov 2025), Myopia (Dec 2025)', 'Mother: diabetes, Father: myopia', 
        'No known allergies', 'Recent myopia diagnosis', '2026-01-25 09:10:00', '2026-01-25 09:10:00', 0);

INSERT INTO EyeExaminations (
    MedicalRecordId, VisualAcuity, IntraocularPressure, PupilReaction, 
    AnteriorSegment, PosteriorSegment, FundusObservation,
    RightEye, LeftEye, EyePressure,
    CreatedAt, UpdatedAt, IsArchived
)
VALUES (
    @Record3Id, '20/20 with correction', '14 OD / 15 OS mmHg', 'Normal',
    'Tear film break-up time reduced (5 seconds), mild conjunctival injection', 
    'Normal', 'Healthy optic nerve and retina',
    '20/20', '20/20', '14 OD / 15 OS',
    '2026-01-25 09:25:00', '2026-01-25 09:25:00', 0
);

INSERT INTO Investigations (MedicalRecordId, TestName, Result, TestDate, Notes, CreatedAt, UpdatedAt)
VALUES 
    (@Record3Id, 'Schirmer Test', 'OD: 8mm, OS: 7mm (reduced)', '2026-01-25', 'Below normal (>10mm)', '2026-01-25 09:35:00', '2026-01-25 09:35:00'),
    (@Record3Id, 'Tear Break-Up Time (TBUT)', '5 seconds (abnormal)', '2026-01-25', 'Normal is >10 seconds', '2026-01-25 09:40:00', '2026-01-25 09:40:00'),
    (@Record3Id, 'Corneal Staining', 'Mild punctate staining inferior cornea', '2026-01-25', 'Indicates dry eye damage', '2026-01-25 09:45:00', '2026-01-25 09:45:00');

INSERT INTO Diagnoses (MedicalRecordId, DiagnosisText, DiagnosisName, ICD10Code, CheckupDate, Status, Severity, Notes, CreatedAt, UpdatedAt)
VALUES (@Record3Id, 'Dry eye syndrome (keratoconjunctivitis sicca), bilateral', 'Dry Eye Syndrome', 'H04.123', '2026-01-25', 
        'Active', 'Moderate', 'Artificial tears and lifestyle modifications recommended', '2026-01-25 09:55:00', '2026-01-25 09:55:00');

INSERT INTO Prescriptions (MedicalRecordId, PrescriptionDate, Instructions, Notes, CreatedAt, UpdatedAt)
VALUES (@Record3Id, '2026-01-25', 'Use artificial tears 4x daily. Warm compress twice daily. Follow 20-20-20 rule for screen use.', 'Lifestyle modifications important', '2026-01-25 10:00:00', '2026-01-25 10:00:00');

DECLARE @Prescription3Id INT = SCOPE_IDENTITY();

INSERT INTO PrescriptionItems (PrescriptionId, Medication, Dosage, Frequency, Duration, Notes)
VALUES 
    (@Prescription3Id, 'Systane Ultra Eye Drops', 'Preservative-free', '4 times daily', 'Ongoing', 'Use as needed for comfort'),
    (@Prescription3Id, 'Omega-3 Fish Oil', '1000mg', 'Twice daily with meals', 'Ongoing', 'For tear film improvement'),
    (@Prescription3Id, 'Warm Eye Compress', 'Apply warm compress', 'Twice daily', 'Ongoing', '5-10 minutes per session');

-- ========================================
-- ✅ تم إضافة 3 زيارات مختلفة بنجاح!
-- ========================================

SELECT 
    COUNT(*) AS TotalRecords,
    MIN(VisitDate) AS FirstVisit,
    MAX(VisitDate) AS LastVisit
FROM MedicalRecords 
WHERE PatientId = @PatientId;

PRINT '';
PRINT '✅ Successfully added 3 medical records for patient P-020 (Reem Saeed Mahmoud)';
PRINT 'Visit 1: Conjunctivitis (Nov 15, 2025)';
PRINT 'Visit 2: Myopia (Dec 28, 2025)';
PRINT 'Visit 3: Dry Eye Syndrome (Jan 25, 2026)';
PRINT '';

GO
