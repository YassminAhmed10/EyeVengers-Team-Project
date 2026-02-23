-- Fix Gender field in Appointments and Patients tables
USE EyeClinicDB;
GO

-- Update Patients table - make sure Gender is consistent
UPDATE Patients SET Gender = 'Male' WHERE Gender IN ('ذكر', 'male', 'MALE', '1');
UPDATE Patients SET Gender = 'Female' WHERE Gender IN ('أنثى', 'female', 'FEMALE', '0');

-- Check current gender values in Appointments
SELECT DISTINCT PatientGender, PatientName FROM Appointments;

-- Update PatientGender in Appointments to match the correct values
-- PatientGender should be: 1 = Male, 0 = Female
UPDATE Appointments SET PatientGender = 1 WHERE PatientName LIKE '%Ahmed%' OR PatientName LIKE '%Mahmoud%' OR PatientName LIKE '%Omar%' OR PatientName LIKE '%Youssef%' OR PatientName LIKE '%Karim%' OR PatientName LIKE '%Mostafa%' OR PatientName LIKE '%Hossam%' OR PatientName LIKE '%Tarek%' OR PatientName LIKE '%Walid%' OR PatientName LIKE '%Eslam%';

UPDATE Appointments SET PatientGender = 0 WHERE PatientName LIKE '%Fatma%' OR PatientName LIKE '%Sara%' OR PatientName LIKE '%Laila%' OR PatientName LIKE '%Mona%' OR PatientName LIKE '%Hoda%' OR PatientName LIKE '%Nourhan%' OR PatientName LIKE '%Dina%' OR PatientName LIKE '%Rania%' OR PatientName LIKE '%Yasmin%' OR PatientName LIKE '%Reem%' OR PatientName LIKE '%Heba%' OR PatientName LIKE '%Noha%' OR PatientName LIKE '%Shimaa%' OR PatientName LIKE '%Iman%' OR PatientName LIKE '%Amira%';

-- Verify the changes
SELECT 
    PatientId,
    PatientName,
    PatientGender,
    CASE PatientGender 
        WHEN 1 THEN 'Male'
        WHEN 0 THEN 'Female'
        ELSE 'Unknown'
    END as GenderText,
    Phone,
    Email
FROM Appointments
ORDER BY PatientId;

PRINT 'Gender fields fixed successfully';
GO
