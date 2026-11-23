-- ============================================================
--  ApexSIS - Password Reset Script
--  Run this if you get "Invalid email or password credentials"
--  after importing apexsis_database_export.sql
--
--  This sets ALL demo accounts to: Admin@123
-- ============================================================

USE `school_information_system`;

UPDATE `users` SET password_hash = '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK'
WHERE email IN (
    'admin@school.edu',
    'registrar@school.edu',
    'faculty@school.edu',
    'student@school.edu',
    'parent@school.edu',
    'accountant@school.edu',
    'librarian@school.edu',
    'guidance@school.edu',
    'nurse@school.edu'
);

-- Verify
SELECT email, role, 
       CASE WHEN password_hash = '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK'
            THEN 'OK - Admin@123' ELSE 'MISMATCH' END AS password_status
FROM `users`;
