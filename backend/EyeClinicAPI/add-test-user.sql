-- Insert test users for Eye Clinic
-- Password is stored as plain text (NOT recommended for production - should be hashed)

USE EyeClinicDB;
GO

-- Insert Doctor user
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'mohab@eyeclinic.com')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt)
    VALUES ('Dr. Mohab Khairy', 'mohab@eyeclinic.com', 'mohab123', 'Doctor', GETUTCDATE());
    PRINT 'Doctor user added successfully';
END
ELSE
BEGIN
    PRINT 'Doctor user already exists';
END

-- Insert Receptionist user
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'sarah@eyeclinic.com')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt)
    VALUES ('Sarah Johnson', 'sarah@eyeclinic.com', 'sarah123', 'Receptionist', GETUTCDATE());
    PRINT 'Receptionist user added successfully';
END
ELSE
BEGIN
    PRINT 'Receptionist user already exists';
END

-- Insert Patient user
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'john@patient.com')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, Role, CreatedAt)
    VALUES ('John Doe', 'john@patient.com', 'john123', 'Patient', GETUTCDATE());
    PRINT 'Patient user added successfully';
END
ELSE
BEGIN
    PRINT 'Patient user already exists';
END

-- Display all users
SELECT Id, Username, Email, Role, CreatedAt FROM Users;
GO
