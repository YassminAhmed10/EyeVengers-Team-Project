-- Cleanup Duplicate Patient Record Script
-- This removes the auto-created duplicate patient record (ID: 31)
-- and keeps only the doctor-created record (ID: 532756) for "Eman Salim"

-- BACKUP: First, let's see what we have
SELECT Id, FirstName, LastName, Email, CreatedAt 
FROM Patients 
WHERE Email = 'eman@gmail.com' 
ORDER BY CreatedAt;

-- Count how many records exist
SELECT COUNT(*) as PatientCount 
FROM Patients 
WHERE Email = 'eman@gmail.com';

-- ⚠️ BACKUP your database before running the DELETE below!

-- DELETE the newer (auto-created) duplicate record
-- Uncomment and run ONLY if you've backed up your database
-- DELETE FROM Patients 
-- WHERE Email = 'eman@gmail.com' 
-- AND Id = 31;

-- Verify the result (run after deletion)
-- SELECT Id, FirstName, LastName, Email, CreatedAt 
-- FROM Patients 
-- WHERE Email = 'eman@gmail.com';
