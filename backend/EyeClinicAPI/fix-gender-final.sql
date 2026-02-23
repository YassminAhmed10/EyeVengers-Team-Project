-- Fix specific gender issues
USE EyeClinicDB;
GO

-- Fix Hoda Ibrahim in both tables
UPDATE Patients SET Gender = 'Female' WHERE FirstName = 'Hoda' AND LastName LIKE '%Ibrahim%';
UPDATE Appointments SET PatientGender = 0 WHERE PatientName LIKE '%Hoda%Ibrahim%';

-- Fix Yassmin Ahmed Hassan  
UPDATE Appointments SET PatientGender = 0 WHERE PatientName LIKE '%Yassmin%Ahmed%Hassan%';
UPDATE Appointments SET PatientGender = 0 WHERE PatientId = 'P-686098';

-- Double check all female names are correct in Appointments
UPDATE Appointments SET PatientGender = 0 WHERE 
    PatientName LIKE '%Fatma%' OR 
    PatientName LIKE '%Sara%' OR 
    PatientName LIKE '%Laila%' OR 
    PatientName LIKE '%Mona%' OR 
    PatientName LIKE '%Hoda%' OR 
    PatientName LIKE '%Nourhan%' OR 
    PatientName LIKE '%Dina%' OR 
    PatientName LIKE '%Rania%' OR 
    PatientName LIKE '%Yasmin%' OR 
    PatientName LIKE '%Yassmin%' OR 
    PatientName LIKE '%Reem%' OR 
    PatientName LIKE '%Heba%' OR 
    PatientName LIKE '%Noha%' OR 
    PatientName LIKE '%Shimaa%' OR 
    PatientName LIKE '%Iman%' OR 
    PatientName LIKE '%Amira%';

-- Double check all male names are correct
UPDATE Appointments SET PatientGender = 1 WHERE 
    PatientName LIKE '%Ahmed Mohamed%' OR 
    PatientName LIKE '%Mahmoud Hassan%' OR 
    PatientName LIKE '%Omar Khaled%' OR 
    PatientName LIKE '%Youssef Ahmed%' OR 
    PatientName LIKE '%Karim Mahmoud%' OR 
    PatientName LIKE '%Mostafa Abdelrahman%' OR 
    PatientName LIKE '%Hossam Eldin%' OR 
    PatientName LIKE '%Tarek Samir%' OR 
    PatientName LIKE '%Walid Hussein%' OR 
    PatientName LIKE '%Eslam Ramadan%';

-- Verify all genders are now correct
SELECT 
    PatientId,
    PatientName,
    PatientGender,
    CASE PatientGender 
        WHEN 1 THEN 'Male'
        WHEN 0 THEN 'Female'
        ELSE 'Unknown'
    END as GenderText,
    Phone
FROM Appointments
ORDER BY PatientName;

PRINT 'All gender issues fixed!';
GO
