-- Fix old appointments - any date before today should NOT be Upcoming
USE EyeClinicDB;
GO

-- Get today's date
DECLARE @Today DATE = CAST(GETDATE() AS DATE);

-- Update appointments before today from Upcoming (0) to Completed (1)
UPDATE Appointments 
SET Status = 1, UpdatedAt = GETDATE()
WHERE CAST(AppointmentDate AS DATE) < @Today 
  AND Status = 0; -- Only update Upcoming ones

-- Show summary
SELECT 
    CAST(AppointmentDate AS DATE) as Date,
    Status,
    COUNT(*) as Count,
    CASE Status 
        WHEN 0 THEN 'Upcoming'
        WHEN 1 THEN 'Completed'
        WHEN 2 THEN 'Cancelled'
    END as StatusText
FROM Appointments
GROUP BY CAST(AppointmentDate AS DATE), Status
ORDER BY CAST(AppointmentDate AS DATE), Status;

PRINT 'Old appointments status fixed!';
PRINT 'All appointments before today are now Completed or Cancelled';
GO
