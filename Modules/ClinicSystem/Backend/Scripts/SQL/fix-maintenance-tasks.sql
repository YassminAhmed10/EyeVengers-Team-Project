-- Fix MaintenanceTasks Table
USE EyeClinicDB;
GO

-- Drop existing table if it exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'MaintenanceTasks')
BEGIN
    DROP TABLE MaintenanceTasks;
    PRINT 'Dropped existing MaintenanceTasks table.';
END
GO

-- Create MaintenanceTasks table
CREATE TABLE MaintenanceTasks (
    TaskId INT PRIMARY KEY IDENTITY(1,1),
    EquipmentId INT, -- Foreign key to Equipment table
    TaskType NVARCHAR(100) NOT NULL, -- Calibration, Repair, Inspection, Cleaning
    TaskDescription NVARCHAR(MAX),
    Priority NVARCHAR(50), -- High, Medium, Low
    ScheduledDate DATE,
    CompletedDate DATE,
    Status NVARCHAR(50), -- Scheduled, In Progress, Completed, Cancelled
    AssignedTo NVARCHAR(200), -- Technician name
    EstimatedCost DECIMAL(10,2),
    ActualCost DECIMAL(10,2),
    ServiceProvider NVARCHAR(200), -- External service provider if applicable
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (EquipmentId) REFERENCES Equipment(EquipmentId)
);
PRINT 'MaintenanceTasks table created successfully.';
GO

-- Insert data
SET IDENTITY_INSERT MaintenanceTasks ON;

INSERT INTO MaintenanceTasks (TaskId, EquipmentId, TaskType, TaskDescription, Priority, ScheduledDate, CompletedDate, Status, AssignedTo, EstimatedCost, ActualCost, ServiceProvider, Notes)
VALUES
(1, 2, 'Calibration', 'Annual calibration check and adjustment of phoropter lenses', 'High', '2026-01-25', NULL, 'Scheduled', 'Hassan Mahmoud', 1200.00, NULL, 'Reichert Egypt Service', 'Requires manufacturer technician'),
(2, 9, 'Repair', 'Replace damaged lens alignment mechanism', 'High', '2026-01-24', NULL, 'In Progress', 'Mohamed Karim', 850.00, NULL, 'Marco Service Center', 'Parts ordered, awaiting delivery'),
(3, 1, 'Inspection', 'Routine 6-month inspection and cleaning', 'Medium', '2026-03-12', NULL, 'Scheduled', 'Hassan Mahmoud', 500.00, NULL, 'Zeiss Egypt', 'Standard maintenance check'),
(4, 3, 'Calibration', 'OCT calibration and software update', 'Medium', '2026-02-15', NULL, 'Scheduled', 'Ahmed Fathy', 2500.00, NULL, 'Heidelberg Engineering', 'Includes software license renewal'),
(5, 15, 'Inspection', 'Quarterly autoclave validation and spore testing', 'High', '2026-02-01', NULL, 'Scheduled', 'Sara Mohamed', 650.00, NULL, 'Tuttnauer Egypt', 'Biological indicator testing required'),
(6, 10, 'Cleaning', 'Deep cleaning and optical system check', 'Medium', '2026-02-20', NULL, 'Scheduled', 'Hassan Mahmoud', 800.00, NULL, 'Leica Egypt Service', 'Pre-scheduled maintenance'),
(7, 12, 'Calibration', 'YAG laser energy calibration', 'High', '2026-03-05', NULL, 'Scheduled', 'Ahmed Fathy', 1500.00, NULL, 'Ellex Egypt', 'Safety inspection included'),
(8, 7, 'Inspection', 'Visual field analyzer calibration check', 'Medium', '2026-04-15', NULL, 'Scheduled', 'Mohamed Karim', 900.00, NULL, 'Zeiss Egypt', 'Annual maintenance'),
(9, 11, 'Inspection', 'Phaco system tubing replacement and maintenance', 'Medium', '2026-04-25', NULL, 'Scheduled', 'Ahmed Fathy', 1800.00, NULL, 'Alcon Egypt', 'Consumables replacement'),
(10, 5, 'Calibration', 'Tonometer calibration and pressure check', 'Medium', '2026-05-05', NULL, 'Scheduled', 'Hassan Mahmoud', 600.00, NULL, 'Nidek Egypt', 'Standard calibration'),
(11, 1, 'Cleaning', 'Deep optical cleaning of slit lamp', 'Low', '2026-01-30', NULL, 'Scheduled', 'Sara Mohamed', 300.00, NULL, 'In-house', 'Regular maintenance'),
(12, 13, 'Inspection', 'Ultrasound probe inspection and calibration', 'Medium', '2026-02-28', NULL, 'Scheduled', 'Mohamed Karim', 1100.00, NULL, 'Quantel Medical Egypt', 'Annual service'),
(13, 6, 'Inspection', 'Fundus camera sensor cleaning and check', 'Low', '2026-03-20', NULL, 'Scheduled', 'Hassan Mahmoud', 700.00, NULL, 'Canon Egypt', 'Routine maintenance'),
(14, 4, 'Calibration', 'Autorefractor calibration check', 'Medium', '2026-04-01', NULL, 'Scheduled', 'Ahmed Fathy', 800.00, NULL, 'Topcon Egypt', 'Semi-annual maintenance'),
(15, 8, 'Inspection', 'Keratometer optical alignment check', 'Low', '2026-02-22', NULL, 'Scheduled', 'Mohamed Karim', 450.00, NULL, 'Topcon Egypt', 'Preventive maintenance');

SET IDENTITY_INSERT MaintenanceTasks OFF;
GO

PRINT 'MaintenanceTasks data inserted successfully (15 records).';
