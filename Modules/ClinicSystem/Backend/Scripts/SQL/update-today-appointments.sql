-- Update today's appointments based on current time
USE EyeClinicDB;
GO

DECLARE @Today DATE = CAST(GETDATE() AS DATE);
DECLARE @CurrentTime TIME = CAST(GETDATE() AS TIME);

PRINT 'Today: ' + CAST(@Today AS VARCHAR(20));
PRINT 'Current Time: ' + CAST(@CurrentTime AS VARCHAR(20));

-- Update today's appointments that have passed to Completed (if they were Upcoming)
UPDATE Appointments 
SET Status = 1, -- Completed
    UpdatedAt = GETDATE()
WHERE CAST(AppointmentDate AS DATE) = @Today 
  AND Status = 0 -- Only update Upcoming
  AND CAST(AppointmentTime AS TIME) < @CurrentTime;

PRINT 'Updated past appointments for today to Completed';

-- Keep future appointments today as Upcoming
-- (no need to update, they're already Upcoming)

-- Summary for today
SELECT 
    AppointmentTime,
    PatientName,
    Status,
    CASE Status 
        WHEN 0 THEN 'Upcoming'
        WHEN 1 THEN 'Completed'
        WHEN 2 THEN 'Cancelled'
    END as StatusText,
    CASE 
        WHEN CAST(AppointmentTime AS TIME) < @CurrentTime THEN 'PAST'
        ELSE 'FUTURE'
    END as TimeStatus
FROM Appointments
WHERE CAST(AppointmentDate AS DATE) = @Today
ORDER BY AppointmentTime;

PRINT '';
PRINT 'Today appointments updated based on current time!';
GO
