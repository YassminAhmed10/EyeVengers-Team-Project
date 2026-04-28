-- Egyptian Patients Data Seeding
-- Seed realistic Egyptian patient data
USE EyeClinicDB;
GO

-- Delete old data if you want to start fresh (optional)
-- DELETE FROM Patients;
-- GO

-- Male Patients
INSERT INTO Patients (FirstName, LastName, DateOfBirth, Gender, Phone, Email, Address, NationalId, InsuranceCompany, InsuranceId, EmergencyContactName, EmergencyContactPhone, CreatedAt)
VALUES 
-- 1. Ahmed Mohamed
('Ahmed', 'Mohamed Ali', '1985-03-15', 'Male', '01012345678', 'ahmed.mohamed@gmail.com', '12 El Gomhoria St, Downtown, Cairo', '28503151234567', 'Universal Health Insurance', 'INS-2024-001', 'Fatma Mohamed', '01098765432', '2024-01-15 10:30:00'),

-- 2. Mahmoud Hassan
('Mahmoud', 'Hassan Ibrahim', '1992-07-22', 'Male', '01123456789', 'mahmoud.hassan@yahoo.com', '45 El Haram St, Giza', '29207222345678', 'Misr Insurance', 'INS-2024-002', 'Sara Hassan', '01187654321', '2024-02-10 14:20:00'),

-- 3. Omar Khaled
('Omar', 'Khaled Abdullah', '1988-11-30', 'Male', '01234567890', 'omar.khaled@hotmail.com', '78 Faisal St, Dokki, Giza', '28811302456789', 'AXA Egypt', 'INS-2024-003', 'Laila Khaled', '01276543210', '2024-03-05 09:15:00'),

-- 4. Youssef Ahmed
('Youssef', 'Ahmed El Sayed', '1995-05-18', 'Male', '01098765432', 'youssef.ahmed@outlook.com', '23 El Nasr St, Nasr City, Cairo', '29505183567890', 'Egyptian Health Insurance', 'INS-2024-004', 'Mona Ahmed', '01165432109', '2024-03-20 11:45:00'),

-- 5. Karim Mahmoud
('Karim', 'Mahmoud Fathy', '1990-09-08', 'Male', '01187654321', 'karim.mahmoud@gmail.com', '56 El Thawra St, Maadi, Cairo', '29009084678901', 'Mohandes Insurance', 'INS-2024-005', 'Hoda Mahmoud', '01254321098', '2024-04-12 15:30:00'),

-- 6. Mostafa Abdelrahman
('Mostafa', 'Abdelrahman Said', '1987-12-25', 'Male', '01276543210', 'mostafa.abdelrahman@yahoo.com', '89 El Hegaz St, Heliopolis, Cairo', '28712255789012', 'Allianz Egypt', 'INS-2024-006', 'Nourhan Abdelrahman', '01143210987', '2024-05-08 08:20:00'),

-- 7. Hossam Eldin
('Hossam', 'Eldin Mohamed', '1993-04-10', 'Male', '01165432109', 'hossam.eldin@gmail.com', '34 El Sudan St, Mohandessin, Giza', '29304106890123', 'Universal Health Insurance', 'INS-2024-007', 'Dina Mohamed', '01032109876', '2024-06-15 13:10:00'),

-- 8. Tarek Samir
('Tarek', 'Samir Abdullah', '1991-08-17', 'Male', '01254321098', 'tarek.samir@hotmail.com', '67 Arab League St, Mohandessin, Giza', '29108177901234', 'Misr Insurance', 'INS-2024-008', 'Rania Samir', '01121098765', '2024-07-22 16:40:00'),

-- 9. Walid Hussein
('Walid', 'Hussein Ali', '1989-02-28', 'Male', '01143210987', 'walid.hussein@outlook.com', '90 El Merghany St, Heliopolis, Cairo', '28902288012345', 'AXA Egypt', 'INS-2024-009', 'Yasmin Hussein', '01210987654', '2024-08-18 10:55:00'),

-- 10. Eslam Ramadan
('Eslam', 'Ramadan Mohamed', '1994-06-05', 'Male', '01032109876', 'eslam.ramadan@gmail.com', '12 Abbas El Akkad St, Nasr City, Cairo', '29406059123456', 'Egyptian Health Insurance', 'INS-2024-010', 'Reem Ramadan', '01109876543', '2024-09-25 12:25:00');

-- Female Patients
INSERT INTO Patients (FirstName, LastName, DateOfBirth, Gender, Phone, Email, Address, NationalId, InsuranceCompany, InsuranceId, EmergencyContactName, EmergencyContactPhone, CreatedAt)
VALUES 
-- 11. Fatma Ahmed
('Fatma', 'Ahmed Mahmoud', '1990-01-20', 'Female', '01021098765', 'fatma.ahmed@gmail.com', '25 Mohamed Farid St, Downtown, Cairo', '29001202234567', 'Universal Health Insurance', 'INS-2024-011', 'Ahmed Mahmoud', '01198765432', '2024-01-20 09:30:00'),

-- 12. Sara Hassan
('Sara', 'Hassan Ali', '1988-05-12', 'Female', '01109876543', 'sara.hassan@yahoo.com', '48 El Nile St, Zamalek, Cairo', '28805123345678', 'Misr Insurance', 'INS-2024-012', 'Hassan Ali', '01287654321', '2024-02-14 11:20:00'),

-- 13. Laila Mohamed
('Laila', 'Mohamed Said', '1992-09-30', 'Female', '01198765432', 'laila.mohamed@hotmail.com', '63 El Shaheed St, Maadi, Cairo', '29209304456789', 'AXA Egypt', 'INS-2024-013', 'Mohamed Said', '01176543210', '2024-03-10 14:45:00'),

-- 14. Mona Khaled
('Mona', 'Khaled Abdullah', '1995-03-25', 'Female', '01287654321', 'mona.khaled@outlook.com', '71 El Tahrir St, Dokki, Giza', '29503255567890', 'Egyptian Health Insurance', 'INS-2024-014', 'Khaled Abdullah', '01165432109', '2024-04-05 10:15:00'),

-- 15. Hoda Ibrahim
('Hoda', 'Ibrahim Mahmoud', '1987-11-18', 'Female', '01176543210', 'hoda.ibrahim@gmail.com', '39 El Giza St, Giza', '28711186678901', 'Mohandes Insurance', 'INS-2024-015', 'Ibrahim Mahmoud', '01254321098', '2024-05-12 13:30:00'),

-- 16. Nourhan Samir
('Nourhan', 'Samir Hassan', '1991-07-08', 'Female', '01165432109', 'nourhan.samir@yahoo.com', '82 Lebanon St, Mohandessin, Giza', '29107087789012', 'Allianz Egypt', 'INS-2024-016', 'Samir Hassan', '01143210987', '2024-06-20 15:50:00'),

-- 17. Dina Mohamed
('Dina', 'Mohamed Abdelrahman', '1993-02-14', 'Female', '01254321098', 'dina.mohamed@hotmail.com', '55 El Merghany St, Heliopolis, Cairo', '29302148890123', 'Universal Health Insurance', 'INS-2024-017', 'Mohamed Abdelrahman', '01032109876', '2024-07-15 08:40:00'),

-- 18. Rania Ahmed
('Rania', 'Ahmed Ali', '1989-12-03', 'Female', '01143210987', 'rania.ahmed@gmail.com', '27 El Sudan St, Mohandessin, Giza', '28912039901234', 'Misr Insurance', 'INS-2024-018', 'Ahmed Ali', '01121098765', '2024-08-22 12:10:00'),

-- 19. Yasmin Hussein
('Yasmin', 'Hussein Khaled', '1994-10-22', 'Female', '01032109876', 'yasmin.hussein@outlook.com', '44 Abbas El Akkad St, Nasr City, Cairo', '29410228012345', 'AXA Egypt', 'INS-2024-019', 'Hussein Khaled', '01210987654', '2024-09-18 16:25:00'),

-- 20. Reem Saeed
('Reem', 'Saeed Mahmoud', '1996-04-15', 'Female', '01121098765', 'reem.saeed@gmail.com', '58 El Nasr St, Nasr City, Cairo', '29604159123456', 'Egyptian Health Insurance', 'INS-2024-020', 'Saeed Mahmoud', '01109876543', '2024-10-10 11:35:00'),

-- 21. Heba Abdullah
('Heba', 'Abdullah Hassan', '1986-08-09', 'Female', '01210987654', 'heba.abdullah@yahoo.com', '91 El Haram St, Giza', '28608092234567', 'Mohandes Insurance', 'INS-2024-021', 'Abdullah Hassan', '01198765432', '2024-11-05 09:20:00'),

-- 22. Noha Mahmoud
('Noha', 'Mahmoud Fathy', '1990-06-27', 'Female', '01109876543', 'noha.mahmoud@hotmail.com', '36 El Gomhoria St, Downtown, Cairo', '29006273345678', 'Allianz Egypt', 'INS-2024-022', 'Mahmoud Fathy', '01287654321', '2024-12-12 14:55:00'),

-- 23. Shimaa Ramadan
('Shimaa', 'Ramadan Said', '1992-11-11', 'Female', '01198765432', 'shimaa.ramadan@gmail.com', '73 Faisal St, Dokki, Giza', '29211114456789', 'Universal Health Insurance', 'INS-2024-023', 'Ramadan Said', '01176543210', '2025-01-08 10:45:00'),

-- 24. Iman Khaled
('Iman', 'Khaled Ibrahim', '1988-03-19', 'Female', '01287654321', 'iman.khaled@outlook.com', '22 El Tahrir St, Dokki, Giza', '28803195567890', 'Misr Insurance', 'INS-2024-024', 'Khaled Ibrahim', '01165432109', '2025-02-14 13:15:00'),

-- 25. Amira Mohamed
('Amira', 'Mohamed Hassan', '1995-09-06', 'Female', '01176543210', 'amira.mohamed@gmail.com', '68 El Thawra St, Maadi, Cairo', '29509066678901', 'AXA Egypt', 'INS-2024-025', 'Mohamed Hassan', '01254321098', '2025-03-20 15:40:00');

-- Display added data
SELECT 
    Id,
    CONCAT(FirstName, ' ', LastName) AS FullName,
    Gender,
    Phone,
    Email,
    YEAR(GETDATE()) - YEAR(DateOfBirth) AS Age,
    CreatedAt
FROM Patients
ORDER BY CreatedAt DESC;

PRINT 'Successfully added 25 Egyptian patients (10 males and 15 females)';
GO
