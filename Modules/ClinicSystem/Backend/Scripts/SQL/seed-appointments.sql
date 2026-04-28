-- Seed Appointments for Egyptian Patients
-- With different dates (Jan 20-26, 2026) and statuses (Completed, Upcoming, Cancelled)
USE EyeClinicDB;
GO

-- Insert appointments for the Egyptian patients
-- Status: 0 = Upcoming, 1 = Completed, 2 = Cancelled

-- January 20, 2026 - Completed Appointments
INSERT INTO Appointments (PatientId, PatientName, PatientGender, Phone, Email, PatientBirthDate, Age, NationalId, Address, 
    DoctorId, AppointmentDate, AppointmentTime, DurationMinutes, Status, IsSurgery, AppointmentType, ReasonForVisit, Notes,
    ChronicDiseases, CurrentMedications, OtherAllergies, VisionSymptoms, FamilyEyeDiseases, OtherFamilyDiseases, 
    EyeAllergies, EyeSurgeries, OtherEyeSurgeries, InsuranceCompany, InsuranceId, PolicyNumber, Coverage, CoverageType,
    InsuranceExpiryDate, InsuranceContact, PaymentMethod, PaymentStatus, FinalPrice, EmergencyContactName, EmergencyContactPhone, CreatedAt, UpdatedAt)
VALUES 
-- Ahmed Mohamed - Completed
('P-001', 'Ahmed Mohamed Ali', 1, '01012345678', 'ahmed.mohamed@gmail.com', '1985-03-15', '41', '28503151234567', '12 El Gomhoria St, Downtown, Cairo',
    1, '2026-01-20', '09:00:00', 30, 1, 0, 'offline', 'Routine Eye Exam', 'Regular checkup',
    'Diabetes', 'Metformin, Eye Drops', 'None', 'Blurry Vision', 'Glaucoma', 'None',
    'Dust', 'None', '', 'Universal Health Insurance', 'INS-2024-001', 'POL-001', 'Full', 'Premium',
    '2026-12-31', '0800-111-222', 'insurance', 'Paid', 200, 'Fatma Mohamed', '01098765432', '2026-01-20 08:00:00', '2026-01-20 09:30:00'),

-- Mahmoud Hassan - Completed  
('P-002', 'Mahmoud Hassan Ibrahim', 1, '01123456789', 'mahmoud.hassan@yahoo.com', '1992-07-22', '34', '29207222345678', '45 El Haram St, Giza',
    1, '2026-01-20', '10:00:00', 30, 1, 0, 'offline', 'Eye Pain', 'Experiencing eye discomfort',
    'None', 'None', 'None', 'Eye Pain, Redness', 'None', 'None',
    'Pollen', 'None', '', 'Misr Insurance', 'INS-2024-002', 'POL-002', 'Partial', 'Basic',
    '2026-12-31', '0800-222-333', 'cash', 'Paid', 300, 'Sara Hassan', '01187654321', '2026-01-20 09:00:00', '2026-01-20 10:30:00'),

-- Sara Hassan - Completed
('P-012', 'Sara Hassan Ali', 0, '01109876543', 'sara.hassan@yahoo.com', '1988-05-12', '38', '28805123345678', '48 El Nile St, Zamalek, Cairo',
    1, '2026-01-20', '11:00:00', 30, 1, 0, 'offline', 'Vision Test', 'Annual vision screening',
    'Hypertension', 'Blood pressure medication', 'Penicillin', 'None', 'None', 'Hypertension',
    'None', 'None', '', 'Misr Insurance', 'INS-2024-012', 'POL-012', 'Full', 'Premium',
    '2026-12-31', '0800-333-444', 'insurance', 'Paid', 250, 'Hassan Ali', '01287654321', '2026-01-20 10:00:00', '2026-01-20 11:30:00');

-- January 21, 2026 - Mixed Status
INSERT INTO Appointments (PatientId, PatientName, PatientGender, Phone, Email, PatientBirthDate, Age, NationalId, Address, 
    DoctorId, AppointmentDate, AppointmentTime, DurationMinutes, Status, IsSurgery, AppointmentType, ReasonForVisit, Notes,
    ChronicDiseases, CurrentMedications, OtherAllergies, VisionSymptoms, FamilyEyeDiseases, OtherFamilyDiseases, 
    EyeAllergies, EyeSurgeries, OtherEyeSurgeries, InsuranceCompany, InsuranceId, PolicyNumber, Coverage, CoverageType,
    InsuranceExpiryDate, InsuranceContact, PaymentMethod, PaymentStatus, FinalPrice, EmergencyContactName, EmergencyContactPhone, CreatedAt, UpdatedAt)
VALUES 
-- Omar Khaled - Completed
('P-003', 'Omar Khaled Abdullah', 1, '01234567890', 'omar.khaled@hotmail.com', '1988-11-30', '38', '28811302456789', '78 Faisal St, Dokki, Giza',
    1, '2026-01-21', '09:30:00', 30, 1, 0, 'offline', 'Dry Eyes', 'Chronic dry eye syndrome',
    'None', 'Artificial Tears', 'None', 'Dry Eyes, Itching', 'None', 'None',
    'Eye Drops', 'None', '', 'AXA Egypt', 'INS-2024-003', 'POL-003', 'Full', 'Premium',
    '2026-12-31', '0800-444-555', 'insurance', 'Paid', 280, 'Laila Khaled', '01276543210', '2026-01-21 08:30:00', '2026-01-21 10:00:00'),

-- Laila Mohamed - Cancelled
('P-013', 'Laila Mohamed Said', 0, '01198765432', 'laila.mohamed@hotmail.com', '1992-09-30', '34', '29209304456789', '63 El Shaheed St, Maadi, Cairo',
    1, '2026-01-21', '11:00:00', 30, 2, 0, 'offline', 'Checkup', 'Patient cancelled',
    'None', 'None', 'None', 'None', 'None', 'None',
    'None', 'None', '', 'AXA Egypt', 'INS-2024-013', 'POL-013', 'Full', 'Premium',
    '2026-12-31', '0800-555-666', 'cash', 'Unpaid', 0, 'Mohamed Said', '01176543210', '2026-01-21 09:00:00', '2026-01-21 11:00:00'),

-- Youssef Ahmed - Completed
('P-004', 'Youssef Ahmed El Sayed', 1, '01098765432', 'youssef.ahmed@outlook.com', '1995-05-18', '31', '29505183567890', '23 El Nasr St, Nasr City, Cairo',
    1, '2026-01-21', '14:00:00', 45, 1, 1, 'offline', 'Cataract Surgery', 'Left eye cataract removal',
    'None', 'Pain relievers', 'None', 'Blurry Vision', 'Cataracts', 'None',
    'None', 'None', '', 'Egyptian Health Insurance', 'INS-2024-004', 'POL-004', 'Partial', 'Basic',
    '2026-12-31', '0800-666-777', 'insurance', 'Partial', 2000, 'Mona Ahmed', '01165432109', '2026-01-21 13:00:00', '2026-01-21 14:45:00');

-- January 22, 2026 - Mixed Status  
INSERT INTO Appointments (PatientId, PatientName, PatientGender, Phone, Email, PatientBirthDate, Age, NationalId, Address, 
    DoctorId, AppointmentDate, AppointmentTime, DurationMinutes, Status, IsSurgery, AppointmentType, ReasonForVisit, Notes,
    ChronicDiseases, CurrentMedications, OtherAllergies, VisionSymptoms, FamilyEyeDiseases, OtherFamilyDiseases, 
    EyeAllergies, EyeSurgeries, OtherEyeSurgeries, InsuranceCompany, InsuranceId, PolicyNumber, Coverage, CoverageType,
    InsuranceExpiryDate, InsuranceContact, PaymentMethod, PaymentStatus, FinalPrice, EmergencyContactName, EmergencyContactPhone, CreatedAt, UpdatedAt)
VALUES 
-- Karim Mahmoud - Completed
('P-005', 'Karim Mahmoud Fathy', 1, '01187654321', 'karim.mahmoud@gmail.com', '1990-09-08', '36', '29009084678901', '56 El Thawra St, Maadi, Cairo',
    1, '2026-01-22', '10:00:00', 30, 1, 0, 'offline', 'Contact Lens Fitting', 'New contact lenses',
    'None', 'None', 'None', 'None', 'Myopia', 'None',
    'None', 'None', '', 'Mohandes Insurance', 'INS-2024-005', 'POL-005', 'Full', 'Premium',
    '2026-12-31', '0800-777-888', 'cash', 'Paid', 400, 'Hoda Mahmoud', '01254321098', '2026-01-22 09:00:00', '2026-01-22 10:30:00'),

-- Mona Khaled - Completed
('P-014', 'Mona Khaled Abdullah', 0, '01287654321', 'mona.khaled@outlook.com', '1995-03-25', '31', '29503255567890', '71 El Tahrir St, Dokki, Giza',
    1, '2026-01-22', '13:00:00', 30, 1, 0, 'offline', 'Eye Infection', 'Bacterial conjunctivitis',
    'None', 'Antibiotic eye drops', 'Sulfa drugs', 'Redness, Discharge', 'None', 'None',
    'None', 'None', '', 'Egyptian Health Insurance', 'INS-2024-014', 'POL-014', 'Full', 'Premium',
    '2026-12-31', '0800-888-999', 'insurance', 'Paid', 350, 'Khaled Abdullah', '01165432109', '2026-01-22 12:00:00', '2026-01-22 13:30:00'),

-- Fatma Ahmed - Cancelled
('P-011', 'Fatma Ahmed Mahmoud', 0, '01021098765', 'fatma.ahmed@gmail.com', '1990-01-20', '36', '29001202234567', '25 Mohamed Farid St, Downtown, Cairo',
    1, '2026-01-22', '15:00:00', 30, 2, 0, 'offline', 'Follow-up', 'Rescheduled',
    'Diabetes', 'Insulin', 'None', 'None', 'Diabetic Retinopathy', 'Diabetes',
    'None', 'None', '', 'Universal Health Insurance', 'INS-2024-011', 'POL-011', 'Full', 'Premium',
    '2026-12-31', '0800-999-000', 'insurance', 'Unpaid', 0, 'Ahmed Mahmoud', '01198765432', '2026-01-22 14:00:00', '2026-01-22 15:00:00');

-- January 23, 2026 - Mostly Upcoming
INSERT INTO Appointments (PatientId, PatientName, PatientGender, Phone, Email, PatientBirthDate, Age, NationalId, Address, 
    DoctorId, AppointmentDate, AppointmentTime, DurationMinutes, Status, IsSurgery, AppointmentType, ReasonForVisit, Notes,
    ChronicDiseases, CurrentMedications, OtherAllergies, VisionSymptoms, FamilyEyeDiseases, OtherFamilyDiseases, 
    EyeAllergies, EyeSurgeries, OtherEyeSurgeries, InsuranceCompany, InsuranceId, PolicyNumber, Coverage, CoverageType,
    InsuranceExpiryDate, InsuranceContact, PaymentMethod, PaymentStatus, FinalPrice, EmergencyContactName, EmergencyContactPhone, CreatedAt, UpdatedAt)
VALUES 
-- Mostafa Abdelrahman - Upcoming
('P-006', 'Mostafa Abdelrahman Said', 1, '01276543210', 'mostafa.abdelrahman@yahoo.com', '1987-12-25', '39', '28712255789012', '89 El Hegaz St, Heliopolis, Cairo',
    1, '2026-01-23', '09:00:00', 30, 0, 0, 'offline', 'Glaucoma Screening', 'Family history of glaucoma',
    'None', 'None', 'None', 'None', 'Glaucoma', 'None',
    'None', 'None', '', 'Allianz Egypt', 'INS-2024-006', 'POL-006', 'Full', 'Premium',
    '2026-12-31', '0800-000-111', 'insurance', 'Pending', 300, 'Nourhan Abdelrahman', '01143210987', '2026-01-23 08:00:00', '2026-01-23 08:00:00'),

-- Hoda Ibrahim - Upcoming
('P-015', 'Hoda Ibrahim Mahmoud', 0, '01176543210', 'hoda.ibrahim@gmail.com', '1987-11-18', '39', '28711186678901', '39 El Giza St, Giza',
    1, '2026-01-23', '10:30:00', 30, 0, 0, 'offline', 'Vision Problems', 'Difficulty reading',
    'None', 'None', 'None', 'Blurry Vision', 'Presbyopia', 'None',
    'None', 'None', '', 'Mohandes Insurance', 'INS-2024-015', 'POL-015', 'Full', 'Premium',
    '2026-12-31', '0800-111-222', 'cash', 'Pending', 250, 'Ibrahim Mahmoud', '01254321098', '2026-01-23 09:00:00', '2026-01-23 09:00:00'),

-- Hossam Eldin - Upcoming
('P-007', 'Hossam Eldin Mohamed', 1, '01165432109', 'hossam.eldin@gmail.com', '1993-04-10', '33', '29304106890123', '34 El Sudan St, Mohandessin, Giza',
    1, '2026-01-23', '13:00:00', 30, 0, 0, 'offline', 'Eye Strain', 'Computer vision syndrome',
    'None', 'None', 'None', 'Eye Strain, Headache', 'None', 'None',
    'None', 'None', '', 'Universal Health Insurance', 'INS-2024-007', 'POL-007', 'Full', 'Premium',
    '2026-12-31', '0800-222-333', 'cash', 'Pending', 200, 'Dina Mohamed', '01032109876', '2026-01-23 12:00:00', '2026-01-23 12:00:00'),

-- Nourhan Samir - Upcoming
('P-016', 'Nourhan Samir Hassan', 0, '01165432109', 'nourhan.samir@yahoo.com', '1991-07-08', '35', '29107087789012', '82 Lebanon St, Mohandessin, Giza',
    1, '2026-01-23', '14:30:00', 30, 0, 0, 'offline', 'Allergy Issues', 'Seasonal eye allergies',
    'None', 'Antihistamines', 'None', 'Itching, Redness', 'None', 'None',
    'Pollen, Dust', 'None', '', 'Allianz Egypt', 'INS-2024-016', 'POL-016', 'Full', 'Premium',
    '2026-12-31', '0800-333-444', 'insurance', 'Pending', 220, 'Samir Hassan', '01143210987', '2026-01-23 13:00:00', '2026-01-23 13:00:00');

-- January 24, 2026 - Mixed
INSERT INTO Appointments (PatientId, PatientName, PatientGender, Phone, Email, PatientBirthDate, Age, NationalId, Address, 
    DoctorId, AppointmentDate, AppointmentTime, DurationMinutes, Status, IsSurgery, AppointmentType, ReasonForVisit, Notes,
    ChronicDiseases, CurrentMedications, OtherAllergies, VisionSymptoms, FamilyEyeDiseases, OtherFamilyDiseases, 
    EyeAllergies, EyeSurgeries, OtherEyeSurgeries, InsuranceCompany, InsuranceId, PolicyNumber, Coverage, CoverageType,
    InsuranceExpiryDate, InsuranceContact, PaymentMethod, PaymentStatus, FinalPrice, EmergencyContactName, EmergencyContactPhone, CreatedAt, UpdatedAt)
VALUES 
-- Tarek Samir - Upcoming
('P-008', 'Tarek Samir Abdullah', 1, '01254321098', 'tarek.samir@hotmail.com', '1991-08-17', '35', '29108177901234', '67 Arab League St, Mohandessin, Giza',
    1, '2026-01-24', '09:00:00', 30, 0, 0, 'offline', 'Routine Checkup', 'Annual eye exam',
    'None', 'None', 'None', 'None', 'None', 'None',
    'None', 'None', '', 'Misr Insurance', 'INS-2024-008', 'POL-008', 'Partial', 'Basic',
    '2026-12-31', '0800-444-555', 'cash', 'Pending', 180, 'Rania Samir', '01121098765', '2026-01-24 08:00:00', '2026-01-24 08:00:00'),

-- Dina Mohamed - Upcoming
('P-017', 'Dina Mohamed Abdelrahman', 0, '01254321098', 'dina.mohamed@hotmail.com', '1993-02-14', '33', '29302148890123', '55 El Merghany St, Heliopolis, Cairo',
    1, '2026-01-24', '11:00:00', 30, 0, 0, 'offline', 'Pink Eye', 'Possible conjunctivitis',
    'None', 'None', 'None', 'Redness, Tearing', 'None', 'None',
    'None', 'None', '', 'Universal Health Insurance', 'INS-2024-017', 'POL-017', 'Full', 'Premium',
    '2026-12-31', '0800-555-666', 'insurance', 'Pending', 280, 'Mohamed Abdelrahman', '01032109876', '2026-01-24 10:00:00', '2026-01-24 10:00:00'),

-- Walid Hussein - Upcoming
('P-009', 'Walid Hussein Ali', 1, '01143210987', 'walid.hussein@outlook.com', '1989-02-28', '37', '28902288012345', '90 El Merghany St, Heliopolis, Cairo',
    1, '2026-01-24', '15:00:00', 45, 0, 1, 'offline', 'LASIK Consultation', 'Considering laser surgery',
    'None', 'None', 'None', 'None', 'Myopia', 'None',
    'None', 'None', '', 'AXA Egypt', 'INS-2024-009', 'POL-009', 'Partial', 'Premium',
    '2026-12-31', '0800-666-777', 'cash', 'Pending', 500, 'Yasmin Hussein', '01210987654', '2026-01-24 14:00:00', '2026-01-24 14:00:00');

-- January 25, 2026 - Upcoming
INSERT INTO Appointments (PatientId, PatientName, PatientGender, Phone, Email, PatientBirthDate, Age, NationalId, Address, 
    DoctorId, AppointmentDate, AppointmentTime, DurationMinutes, Status, IsSurgery, AppointmentType, ReasonForVisit, Notes,
    ChronicDiseases, CurrentMedications, OtherAllergies, VisionSymptoms, FamilyEyeDiseases, OtherFamilyDiseases, 
    EyeAllergies, EyeSurgeries, OtherEyeSurgeries, InsuranceCompany, InsuranceId, PolicyNumber, Coverage, CoverageType,
    InsuranceExpiryDate, InsuranceContact, PaymentMethod, PaymentStatus, FinalPrice, EmergencyContactName, EmergencyContactPhone, CreatedAt, UpdatedAt)
VALUES 
-- Rania Ahmed - Upcoming
('P-018', 'Rania Ahmed Ali', 0, '01143210987', 'rania.ahmed@gmail.com', '1989-12-03', '37', '28912039901234', '27 El Sudan St, Mohandessin, Giza',
    1, '2026-01-25', '10:00:00', 30, 0, 0, 'offline', 'Eye Floaters', 'Seeing spots',
    'None', 'None', 'None', 'Floaters', 'None', 'None',
    'None', 'None', '', 'Misr Insurance', 'INS-2024-018', 'POL-018', 'Full', 'Premium',
    '2026-12-31', '0800-777-888', 'insurance', 'Pending', 250, 'Ahmed Ali', '01121098765', '2026-01-25 09:00:00', '2026-01-25 09:00:00'),

-- Eslam Ramadan - Upcoming
('P-010', 'Eslam Ramadan Mohamed', 1, '01032109876', 'eslam.ramadan@gmail.com', '1994-06-05', '32', '29406059123456', '12 Abbas El Akkad St, Nasr City, Cairo',
    1, '2026-01-25', '13:00:00', 30, 0, 0, 'offline', 'Astigmatism Check', 'Blurred vision',
    'None', 'None', 'None', 'Blurry Vision', 'Astigmatism', 'None',
    'None', 'None', '', 'Egyptian Health Insurance', 'INS-2024-010', 'POL-010', 'Full', 'Premium',
    '2026-12-31', '0800-888-999', 'cash', 'Pending', 200, 'Reem Ramadan', '01109876543', '2026-01-25 12:00:00', '2026-01-25 12:00:00'),

-- Yasmin Hussein - Upcoming
('P-019', 'Yasmin Hussein Khaled', 0, '01032109876', 'yasmin.hussein@outlook.com', '1994-10-22', '32', '29410228012345', '44 Abbas El Akkad St, Nasr City, Cairo',
    1, '2026-01-25', '14:30:00', 30, 0, 0, 'offline', 'Glasses Prescription', 'Need new glasses',
    'None', 'None', 'None', 'None', 'Myopia', 'None',
    'None', 'None', '', 'AXA Egypt', 'INS-2024-019', 'POL-019', 'Full', 'Premium',
    '2026-12-31', '0800-999-000', 'insurance', 'Pending', 300, 'Hussein Khaled', '01210987654', '2026-01-25 13:00:00', '2026-01-25 13:00:00');

-- January 26, 2026 - Mixed
INSERT INTO Appointments (PatientId, PatientName, PatientGender, Phone, Email, PatientBirthDate, Age, NationalId, Address, 
    DoctorId, AppointmentDate, AppointmentTime, DurationMinutes, Status, IsSurgery, AppointmentType, ReasonForVisit, Notes,
    ChronicDiseases, CurrentMedications, OtherAllergies, VisionSymptoms, FamilyEyeDiseases, OtherFamilyDiseases, 
    EyeAllergies, EyeSurgeries, OtherEyeSurgeries, InsuranceCompany, InsuranceId, PolicyNumber, Coverage, CoverageType,
    InsuranceExpiryDate, InsuranceContact, PaymentMethod, PaymentStatus, FinalPrice, EmergencyContactName, EmergencyContactPhone, CreatedAt, UpdatedAt)
VALUES 
-- Reem Saeed - Upcoming
('P-020', 'Reem Saeed Mahmoud', 0, '01121098765', 'reem.saeed@gmail.com', '1996-04-15', '30', '29604159123456', '58 El Nasr St, Nasr City, Cairo',
    1, '2026-01-26', '09:30:00', 30, 0, 0, 'offline', 'Eye Twitching', 'Involuntary eyelid spasms',
    'None', 'None', 'None', 'Eye Twitching', 'None', 'None',
    'None', 'None', '', 'Egyptian Health Insurance', 'INS-2024-020', 'POL-020', 'Full', 'Premium',
    '2026-12-31', '0800-000-111', 'cash', 'Pending', 200, 'Saeed Mahmoud', '01109876543', '2026-01-26 08:30:00', '2026-01-26 08:30:00'),

-- Heba Abdullah - Cancelled
('P-021', 'Heba Abdullah Hassan', 0, '01210987654', 'heba.abdullah@yahoo.com', '1986-08-09', '40', '28608092234567', '91 El Haram St, Giza',
    1, '2026-01-26', '11:00:00', 30, 2, 0, 'offline', 'Emergency Cancellation', 'Patient unable to attend',
    'Asthma', 'Inhaler', 'None', 'None', 'None', 'Asthma',
    'None', 'None', '', 'Mohandes Insurance', 'INS-2024-021', 'POL-021', 'Full', 'Premium',
    '2026-12-31', '0800-111-222', 'insurance', 'Unpaid', 0, 'Abdullah Hassan', '01198765432', '2026-01-26 10:00:00', '2026-01-26 11:00:00'),

-- Noha Mahmoud - Upcoming
('P-022', 'Noha Mahmoud Fathy', 0, '01109876543', 'noha.mahmoud@hotmail.com', '1990-06-27', '36', '29006273345678', '36 El Gomhoria St, Downtown, Cairo',
    1, '2026-01-26', '14:00:00', 30, 0, 0, 'offline', 'Double Vision', 'Seeing double',
    'None', 'None', 'None', 'Double Vision', 'None', 'None',
    'None', 'None', '', 'Allianz Egypt', 'INS-2024-022', 'POL-022', 'Full', 'Premium',
    '2026-12-31', '0800-222-333', 'insurance', 'Pending', 350, 'Mahmoud Fathy', '01287654321', '2026-01-26 13:00:00', '2026-01-26 13:00:00'),

-- Shimaa Ramadan - Upcoming
('P-023', 'Shimaa Ramadan Said', 0, '01198765432', 'shimaa.ramadan@gmail.com', '1992-11-11', '34', '29211114456789', '73 Faisal St, Dokki, Giza',
    1, '2026-01-26', '15:30:00', 30, 0, 0, 'offline', 'Night Blindness', 'Difficulty seeing at night',
    'None', 'Vitamin A supplements', 'None', 'Night Blindness', 'None', 'None',
    'None', 'None', '', 'Universal Health Insurance', 'INS-2024-023', 'POL-023', 'Full', 'Premium',
    '2026-12-31', '0800-333-444', 'cash', 'Pending', 250, 'Ramadan Said', '01176543210', '2026-01-26 14:30:00', '2026-01-26 14:30:00');

-- Display summary
SELECT 
    AppointmentDate,
    Status,
    COUNT(*) as Count,
    CASE Status 
        WHEN 0 THEN 'Upcoming'
        WHEN 1 THEN 'Completed'
        WHEN 2 THEN 'Cancelled'
    END as StatusText
FROM Appointments
WHERE AppointmentDate BETWEEN '2026-01-20' AND '2026-01-26'
GROUP BY AppointmentDate, Status
ORDER BY AppointmentDate, Status;

PRINT 'Successfully added appointments from Jan 20-26, 2026';
PRINT 'Statuses: Completed, Upcoming, Cancelled';
GO
