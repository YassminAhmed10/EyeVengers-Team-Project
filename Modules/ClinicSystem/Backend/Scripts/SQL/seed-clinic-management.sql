-- ============================================
-- Clinic Management Database for Eye Clinic
-- Tables: Equipment, Supplies, Sanitization, Maintenance, WasteManagement
-- ============================================

USE EyeClinicDB;
GO

-- ============================================
-- 1. OPHTHALMIC EQUIPMENT TABLE
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Equipment')
BEGIN
    CREATE TABLE Equipment (
        EquipmentId INT PRIMARY KEY IDENTITY(1,1),
        EquipmentName NVARCHAR(200) NOT NULL,
        EquipmentType NVARCHAR(100) NOT NULL, -- Diagnostic, Refraction, Imaging, Surgical, etc.
        Manufacturer NVARCHAR(200),
        ModelNumber NVARCHAR(100),
        SerialNumber NVARCHAR(100),
        PurchaseDate DATE,
        WarrantyExpiryDate DATE,
        Status NVARCHAR(50) NOT NULL, -- Working, Needs Calibration, Under Repair, Out of Service
        Location NVARCHAR(100), -- Room/Area where equipment is located
        LastMaintenanceDate DATE,
        NextMaintenanceDate DATE,
        MaintenanceFrequencyDays INT, -- How often maintenance is needed
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
    PRINT 'Equipment table created successfully.';
END

-- ============================================
-- 2. MEDICAL SUPPLIES TABLE
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicalSupplies')
BEGIN
    CREATE TABLE MedicalSupplies (
        SupplyId INT PRIMARY KEY IDENTITY(1,1),
        SupplyName NVARCHAR(200) NOT NULL,
        Category NVARCHAR(100) NOT NULL, -- Eye Drops, Contact Lenses, Surgical Supplies, Diagnostic Supplies, etc.
        Unit NVARCHAR(50), -- Box, Bottle, Pack, Piece
        CurrentQuantity INT NOT NULL,
        ReorderLevel INT NOT NULL,
        MaxStockLevel INT,
        UnitPrice DECIMAL(10,2),
        Supplier NVARCHAR(200),
        SupplierContact NVARCHAR(100),
        LastRestockDate DATE,
        ExpiryDate DATE,
        BatchNumber NVARCHAR(100),
        StorageLocation NVARCHAR(100),
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
    PRINT 'MedicalSupplies table created successfully.';
END

-- ============================================
-- 3. SANITIZATION SCHEDULE TABLE
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SanitizationSchedule')
BEGIN
    CREATE TABLE SanitizationSchedule (
        SanitizationId INT PRIMARY KEY IDENTITY(1,1),
        AreaName NVARCHAR(200) NOT NULL,
        AreaType NVARCHAR(100), -- Exam Room, Waiting Room, Operating Room, Lab, etc.
        CleaningFrequency NVARCHAR(50) NOT NULL, -- Daily, Twice Daily, Weekly, After Each Patient
        LastCleanedDate DATETIME,
        LastCleanedBy NVARCHAR(200),
        NextScheduledCleaning DATETIME,
        Status NVARCHAR(50), -- Done, Pending, Overdue, Skipped
        CleaningMethod NVARCHAR(200), -- UV Sterilization, Chemical Disinfection, etc.
        ProductsUsed NVARCHAR(MAX),
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
    PRINT 'SanitizationSchedule table created successfully.';
END

-- ============================================
-- 4. MAINTENANCE TASKS TABLE
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MaintenanceTasks')
BEGIN
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
END

-- ============================================
-- 5. WASTE MANAGEMENT TABLE
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WasteManagement')
BEGIN
    CREATE TABLE WasteManagement (
        WasteId INT PRIMARY KEY IDENTITY(1,1),
        WasteType NVARCHAR(100) NOT NULL, -- Sharps, Pharmaceutical, Chemical, General, Infectious
        Quantity DECIMAL(10,2),
        Unit NVARCHAR(50), -- Kg, Liters, Bags, Containers
        GeneratedDate DATE,
        DisposalDate DATE,
        DisposalMethod NVARCHAR(200), -- Incineration, Autoclaving, Chemical Treatment, Recycling
        DisposalCompany NVARCHAR(200),
        Cost DECIMAL(10,2),
        Status NVARCHAR(50), -- Pending, Collected, Disposed
        CollectedBy NVARCHAR(200),
        CertificateNumber NVARCHAR(100), -- Disposal certificate
        Notes NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
    PRINT 'WasteManagement table created successfully.';
END

GO

-- ============================================
-- SEED DATA - EQUIPMENT
-- ============================================
SET IDENTITY_INSERT Equipment ON;

INSERT INTO Equipment (EquipmentId, EquipmentName, EquipmentType, Manufacturer, ModelNumber, SerialNumber, PurchaseDate, WarrantyExpiryDate, Status, Location, LastMaintenanceDate, NextMaintenanceDate, MaintenanceFrequencyDays, Notes)
VALUES
(1, 'Slit Lamp Biomicroscope', 'Diagnostic', 'Zeiss', 'SL 130', 'ZS-2024-001', '2024-01-15', '2027-01-15', 'Working', 'Exam Room 1', '2025-09-12', '2026-03-12', 180, 'High-quality imaging for anterior segment examination'),
(2, 'Phoropter', 'Refraction', 'Reichert', 'Phoroptor VRx', 'RH-2023-045', '2023-05-20', '2026-05-20', 'Needs Calibration', 'Exam Room 2', '2025-05-01', '2025-11-01', 180, 'Manual phoropter, requires calibration check'),
(3, 'OCT Machine (Optical Coherence Tomography)', 'Imaging', 'Heidelberg', 'Spectralis', 'HE-2024-078', '2024-03-10', '2029-03-10', 'Working', 'Imaging Suite', '2025-08-15', '2026-02-15', 180, 'Advanced retinal imaging system'),
(4, 'Autorefractor', 'Refraction', 'Topcon', 'KR-800', 'TP-2023-102', '2023-08-05', '2026-08-05', 'Working', 'Exam Room 1', '2025-10-01', '2026-04-01', 180, 'Automated refraction measurement'),
(5, 'Tonometer (NCT)', 'Diagnostic', 'Nidek', 'NT-530', 'ND-2024-033', '2024-02-18', '2027-02-18', 'Working', 'Exam Room 2', '2025-11-05', '2026-05-05', 180, 'Non-contact tonometer for IOP measurement'),
(6, 'Fundus Camera', 'Imaging', 'Canon', 'CR-2 Plus', 'CN-2023-089', '2023-11-22', '2026-11-22', 'Working', 'Imaging Suite', '2025-09-20', '2026-03-20', 180, 'Digital fundus photography system'),
(7, 'Visual Field Analyzer', 'Diagnostic', 'Zeiss', 'Humphrey HFA3', 'ZS-2024-112', '2024-04-08', '2029-04-08', 'Working', 'Testing Room', '2025-10-15', '2026-04-15', 180, 'Automated perimetry for glaucoma assessment'),
(8, 'Keratometer', 'Diagnostic', 'Topcon', 'KM-500', 'TP-2023-078', '2023-06-12', '2026-06-12', 'Working', 'Exam Room 1', '2025-08-22', '2026-02-22', 180, 'Measures corneal curvature'),
(9, 'Lensmeter', 'Refraction', 'Marco', 'LM-1800', 'MC-2022-156', '2022-09-30', '2025-09-30', 'Under Repair', 'Optical Lab', '2025-07-10', '2026-01-10', 180, 'Requires lens alignment repair'),
(10, 'Surgical Microscope', 'Surgical', 'Leica', 'M822 F40', 'LC-2024-044', '2024-05-15', '2029-05-15', 'Working', 'Operating Room', '2025-11-20', '2026-05-20', 180, 'High-precision surgical microscope'),
(11, 'Phacoemulsification System', 'Surgical', 'Alcon', 'Centurion', 'AL-2024-067', '2024-06-01', '2029-06-01', 'Working', 'Operating Room', '2025-10-25', '2026-04-25', 180, 'Cataract surgery system'),
(12, 'YAG Laser', 'Surgical', 'Ellex', 'Ultra Q Reflex', 'EL-2023-091', '2023-12-10', '2026-12-10', 'Working', 'Laser Room', '2025-09-05', '2026-03-05', 180, 'Posterior capsulotomy laser'),
(13, 'Ophthalmic Ultrasound', 'Diagnostic', 'Quantel Medical', 'Aviso', 'QM-2024-028', '2024-01-25', '2027-01-25', 'Working', 'Ultrasound Room', '2025-08-30', '2026-02-28', 180, 'A-scan and B-scan biometry'),
(14, 'Contact Lens Trial Set Cabinet', 'Equipment', 'Custom Made', 'N/A', 'CL-CABINET-001', '2023-03-15', NULL, 'Working', 'Exam Room 2', NULL, NULL, NULL, 'Contains trial contact lenses'),
(15, 'Sterilizer/Autoclave', 'Equipment', 'Tuttnauer', 'EZ10', 'TU-2023-045', '2023-07-20', '2026-07-20', 'Working', 'Sterilization Room', '2025-11-01', '2026-02-01', 90, 'Medical instrument sterilization');

SET IDENTITY_INSERT Equipment OFF;
GO

-- ============================================
-- SEED DATA - MEDICAL SUPPLIES
-- ============================================
SET IDENTITY_INSERT MedicalSupplies ON;

INSERT INTO MedicalSupplies (SupplyId, SupplyName, Category, Unit, CurrentQuantity, ReorderLevel, MaxStockLevel, UnitPrice, Supplier, SupplierContact, LastRestockDate, ExpiryDate, BatchNumber, StorageLocation)
VALUES
(1, 'Disposable Gloves (Nitrile)', 'PPE', 'Box (100 pcs)', 8, 5, 20, 45.00, 'MediSupply Egypt', '+20-2-1234567', '2025-10-15', '2027-10-15', 'GL-2025-455', 'Storage Room A'),
(2, 'Sterile Syringes 5ml', 'Surgical Supplies', 'Pack (50 pcs)', 1, 3, 10, 120.00, 'MedEx Supplies', '+20-2-7654321', '2025-09-20', '2027-09-20', 'SY-2025-789', 'Storage Room B'),
(3, 'Tropicamide Eye Drops 1%', 'Eye Drops', 'Bottle', 15, 8, 25, 85.00, 'Pharma Vision', '+20-2-3456789', '2025-11-10', '2026-05-10', 'TR-2025-123', 'Refrigerated Storage'),
(4, 'Fluorescein Sodium Strips', 'Diagnostic Supplies', 'Pack (100 strips)', 12, 6, 20, 180.00, 'OptiMed Supplies', '+20-2-8765432', '2025-10-01', '2027-10-01', 'FL-2025-456', 'Storage Room A'),
(5, 'Contact Lens Solution (Multipurpose)', 'Contact Lens Care', 'Bottle (360ml)', 20, 10, 35, 95.00, 'Lens Care Egypt', '+20-2-2345678', '2025-11-15', '2027-11-15', 'CS-2025-678', 'Storage Room C'),
(6, 'Proparacaine HCl 0.5% (Anesthetic)', 'Eye Drops', 'Bottle', 18, 10, 30, 65.00, 'Pharma Vision', '+20-2-3456789', '2025-10-25', '2026-04-25', 'PA-2025-890', 'Refrigerated Storage'),
(7, 'Surgical Drapes (Sterile)', 'Surgical Supplies', 'Pack (10 pcs)', 25, 15, 40, 320.00, 'SurgiCare Egypt', '+20-2-4567890', '2025-11-01', '2027-11-01', 'SD-2025-234', 'Storage Room B'),
(8, 'Lid Scrub Pads', 'Hygiene Supplies', 'Box (30 pads)', 8, 5, 15, 150.00, 'OptiMed Supplies', '+20-2-8765432', '2025-10-10', '2026-10-10', 'LS-2025-567', 'Storage Room A'),
(9, 'Antibiotic Eye Ointment (Erythromycin)', 'Medications', 'Tube', 22, 12, 35, 75.00, 'Pharma Vision', '+20-2-3456789', '2025-11-20', '2026-11-20', 'EO-2025-345', 'Medication Cabinet'),
(10, 'Artificial Tears (Lubricant)', 'Eye Drops', 'Bottle', 30, 15, 50, 55.00, 'Pharma Vision', '+20-2-3456789', '2025-11-05', '2027-05-05', 'AT-2025-789', 'Storage Room C'),
(11, 'Ophthalmic Sutures 10-0 Nylon', 'Surgical Supplies', 'Pack (12 pcs)', 10, 6, 18, 450.00, 'SurgiCare Egypt', '+20-2-4567890', '2025-09-15', '2028-09-15', 'SU-2025-456', 'Surgical Supply Room'),
(12, 'Alcohol Prep Pads', 'Hygiene Supplies', 'Box (200 pcs)', 15, 8, 25, 85.00, 'MediSupply Egypt', '+20-2-1234567', '2025-10-20', '2027-10-20', 'AP-2025-678', 'Storage Room A'),
(13, 'Cyclopentolate 1% Eye Drops', 'Eye Drops', 'Bottle', 10, 6, 18, 95.00, 'Pharma Vision', '+20-2-3456789', '2025-10-28', '2026-04-28', 'CY-2025-234', 'Refrigerated Storage'),
(14, 'Balanced Salt Solution (BSS)', 'Surgical Supplies', 'Bottle (500ml)', 20, 12, 30, 180.00, 'SurgiCare Egypt', '+20-2-4567890', '2025-11-12', '2027-11-12', 'BS-2025-890', 'Surgical Supply Room'),
(15, 'Cotton Swabs (Sterile)', 'Hygiene Supplies', 'Pack (100 pcs)', 18, 10, 30, 65.00, 'MediSupply Egypt', '+20-2-1234567', '2025-10-05', '2027-10-05', 'CS-2025-123', 'Storage Room A'),
(16, 'Phenylephrine 2.5% Eye Drops', 'Eye Drops', 'Bottle', 14, 8, 22, 88.00, 'Pharma Vision', '+20-2-3456789', '2025-11-08', '2026-05-08', 'PH-2025-567', 'Refrigerated Storage'),
(17, 'Eye Patches (Adhesive)', 'Patient Care', 'Box (50 pcs)', 12, 6, 20, 110.00, 'OptiMed Supplies', '+20-2-8765432', '2025-10-15', '2027-10-15', 'EP-2025-345', 'Storage Room C'),
(18, 'Intraocular Lens (IOL) - Standard', 'Surgical Supplies', 'Piece', 30, 15, 50, 850.00, 'Advanced Eye Imports', '+20-2-5678901', '2025-09-25', '2029-09-25', 'IOL-2025-789', 'Surgical Supply Room'),
(19, 'Betadine 5% Solution', 'Surgical Supplies', 'Bottle (120ml)', 16, 10, 25, 120.00, 'SurgiCare Egypt', '+20-2-4567890', '2025-11-02', '2027-11-02', 'BE-2025-456', 'Surgical Supply Room'),
(20, 'Timolol 0.5% Eye Drops', 'Medications', 'Bottle', 25, 15, 40, 95.00, 'Pharma Vision', '+20-2-3456789', '2025-10-30', '2026-10-30', 'TI-2025-234', 'Medication Cabinet');

SET IDENTITY_INSERT MedicalSupplies OFF;
GO

-- ============================================
-- SEED DATA - SANITIZATION SCHEDULE
-- ============================================
SET IDENTITY_INSERT SanitizationSchedule ON;

INSERT INTO SanitizationSchedule (SanitizationId, AreaName, AreaType, CleaningFrequency, LastCleanedDate, LastCleanedBy, NextScheduledCleaning, Status, CleaningMethod, ProductsUsed)
VALUES
(1, 'Exam Room 1', 'Exam Room', 'Daily', '2026-01-23 08:00', 'Fatma Hassan', '2026-01-24 08:00', 'Done', 'Chemical Disinfection', 'Hospital-grade disinfectant, Surface wipes'),
(2, 'Exam Room 2', 'Exam Room', 'Daily', '2026-01-23 08:30', 'Fatma Hassan', '2026-01-24 08:30', 'Done', 'Chemical Disinfection', 'Hospital-grade disinfectant, Surface wipes'),
(3, 'Waiting Room', 'Waiting Area', 'Twice Daily', '2026-01-23 07:30', 'Ahmed Ali', '2026-01-23 15:00', 'Pending', 'Chemical Disinfection + Mopping', 'Floor cleaner, Disinfectant spray'),
(4, 'Operating Room', 'Surgical Area', 'After Each Surgery', '2026-01-22 14:30', 'Sara Mohamed', '2026-01-23 10:00', 'Pending', 'UV Sterilization + Chemical', 'Surgical disinfectant, UV lamp'),
(5, 'Imaging Suite', 'Diagnostic Area', 'Daily', '2026-01-23 09:00', 'Ahmed Ali', '2026-01-24 09:00', 'Done', 'Chemical Disinfection', 'Surface disinfectant, Equipment wipes'),
(6, 'Laser Room', 'Treatment Room', 'Daily', '2026-01-23 09:30', 'Fatma Hassan', '2026-01-24 09:30', 'Done', 'Chemical Disinfection', 'Hospital-grade disinfectant'),
(7, 'Sterilization Room', 'Equipment Processing', 'Daily', '2026-01-23 07:00', 'Sara Mohamed', '2026-01-24 07:00', 'Done', 'Chemical Disinfection', 'Sterilization-safe disinfectant'),
(8, 'Restrooms (Patient)', 'Facilities', 'Three Times Daily', '2026-01-23 11:00', 'Ahmed Ali', '2026-01-23 15:00', 'Done', 'Chemical Disinfection + Mopping', 'Bathroom cleaner, Disinfectant'),
(9, 'Reception Area', 'Public Area', 'Daily', '2026-01-23 07:15', 'Fatma Hassan', '2026-01-24 07:15', 'Done', 'Surface Cleaning', 'Multi-surface cleaner'),
(10, 'Staff Break Room', 'Staff Area', 'Daily', '2026-01-23 13:00', 'Ahmed Ali', '2026-01-24 13:00', 'Done', 'Surface Cleaning', 'Multi-surface cleaner'),
(11, 'Optical Lab', 'Laboratory', 'Daily', '2026-01-23 10:00', 'Sara Mohamed', '2026-01-24 10:00', 'Done', 'Chemical Disinfection', 'Lab-safe disinfectant'),
(12, 'Testing Room', 'Diagnostic Area', 'Daily', '2026-01-23 08:45', 'Fatma Hassan', '2026-01-24 08:45', 'Done', 'Chemical Disinfection', 'Surface disinfectant');

SET IDENTITY_INSERT SanitizationSchedule OFF;
GO

-- ============================================
-- SEED DATA - MAINTENANCE TASKS
-- ============================================
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

-- ============================================
-- SEED DATA - WASTE MANAGEMENT
-- ============================================
SET IDENTITY_INSERT WasteManagement ON;

INSERT INTO WasteManagement (WasteId, WasteType, Quantity, Unit, GeneratedDate, DisposalDate, DisposalMethod, DisposalCompany, Cost, Status, CollectedBy, CertificateNumber, Notes)
VALUES
(1, 'Sharps (Needles & Syringes)', 5.5, 'Kg', '2026-01-20', '2026-01-22', 'Incineration', 'EcoWaste Medical Egypt', 450.00, 'Disposed', 'Ahmed Hassan', 'CERT-2026-0122-001', 'Collected from sharps containers'),
(2, 'Pharmaceutical Waste (Expired Eye Drops)', 2.3, 'Kg', '2026-01-18', NULL, 'Chemical Treatment', 'EcoWaste Medical Egypt', 280.00, 'Pending', NULL, NULL, 'Expired medications awaiting disposal'),
(3, 'Infectious Waste (Contaminated Materials)', 8.2, 'Kg', '2026-01-21', '2026-01-23', 'Autoclaving + Incineration', 'EcoWaste Medical Egypt', 620.00, 'Disposed', 'Mohamed Ali', 'CERT-2026-0123-002', 'From surgical procedures'),
(4, 'General Medical Waste', 15.0, 'Kg', '2026-01-19', '2026-01-21', 'Autoclaving', 'EcoWaste Medical Egypt', 320.00, 'Disposed', 'Ahmed Hassan', 'CERT-2026-0121-003', 'Non-hazardous medical waste'),
(5, 'Chemical Waste (Disinfectants)', 3.5, 'Liters', '2026-01-17', '2026-01-20', 'Chemical Treatment', 'SafeDispose Egypt', 380.00, 'Disposed', 'Sara Mahmoud', 'CERT-2026-0120-004', 'Expired disinfectant solutions'),
(6, 'Sharps (Surgical Blades)', 2.8, 'Kg', '2026-01-22', NULL, 'Incineration', 'EcoWaste Medical Egypt', 350.00, 'Collected', 'Ahmed Hassan', NULL, 'Collected, awaiting final disposal'),
(7, 'Paper & Cardboard (Recyclable)', 12.0, 'Kg', '2026-01-15', '2026-01-18', 'Recycling', 'Green Recycle Co.', 0.00, 'Disposed', 'Facility Staff', 'REC-2026-0118-001', 'Non-medical paper waste'),
(8, 'Plastic Waste (Non-contaminated)', 6.5, 'Kg', '2026-01-16', '2026-01-19', 'Recycling', 'Green Recycle Co.', 0.00, 'Disposed', 'Facility Staff', 'REC-2026-0119-002', 'Clean plastic packaging'),
(9, 'Pharmaceutical Waste (Broken Vials)', 1.8, 'Kg', '2026-01-21', NULL, 'Chemical Treatment', 'EcoWaste Medical Egypt', 220.00, 'Pending', NULL, NULL, 'Damaged medication containers'),
(10, 'Infectious Waste (Patient Care Items)', 4.5, 'Kg', '2026-01-23', NULL, 'Autoclaving + Incineration', 'EcoWaste Medical Egypt', 380.00, 'Pending', NULL, NULL, 'Awaiting next collection date');

SET IDENTITY_INSERT WasteManagement OFF;
GO

PRINT '============================================';
PRINT 'Clinic Management Database seeded successfully!';
PRINT 'Tables created: Equipment, MedicalSupplies, SanitizationSchedule, MaintenanceTasks, WasteManagement';
PRINT 'Total Equipment: 15 items';
PRINT 'Total Supplies: 20 items';
PRINT 'Total Sanitization Areas: 12 areas';
PRINT 'Total Maintenance Tasks: 15 tasks';
PRINT 'Total Waste Records: 10 records';
PRINT '============================================';
