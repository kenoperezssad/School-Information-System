-- ============================================================
--  ApexSIS School Information System - Full Database Export
--  Generated: 2026-11-23
--  MySQL 8.0+ / MariaDB 10.4+ compatible
--  
--  HOW TO IMPORT:
--    Option A (phpMyAdmin): Import tab > Choose file > Go
--    Option B (MySQL CLI) : mysql -u root -p < apexsis_database_export.sql
--
--  Demo Login: admin@school.edu / Admin@123
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ─── Create & Select Database ────────────────────────────────
CREATE DATABASE IF NOT EXISTS `school_information_system`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `school_information_system`;

-- ============================================================
--  TABLE DEFINITIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    avatar VARCHAR(255) NULL,
    two_factor_enabled TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_profiles` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
    birth_date DATE NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    user_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    record_id VARCHAR(50) NULL,
    old_values TEXT NULL,
    new_values TEXT NULL,
    ip_address VARCHAR(50) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `campuses` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phone VARCHAR(50) NULL,
    is_main TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `buildings` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    floors_count INT DEFAULT 1,
    FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    room_type ENUM('Lecture', 'Laboratory', 'Clinic', 'Library', 'Office', 'Auditorium') DEFAULT 'Lecture',
    capacity INT DEFAULT 40,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `departments` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus_id INT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    head_name VARCHAR(150) NULL,
    email VARCHAR(100) NULL,
    FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `academic_years` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `semesters` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    is_current TINYINT(1) DEFAULT 0,
    enrollment_open TINYINT(1) DEFAULT 1,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `programs` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    degree_type ENUM('Bachelor', 'Associate', 'Master', 'Doctorate', 'Senior High') DEFAULT 'Bachelor',
    total_units INT DEFAULT 140,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `year_levels` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    level_number INT NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sections` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    year_level_id INT NOT NULL,
    semester_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    adviser_name VARCHAR(150) NULL,
    max_capacity INT DEFAULT 45,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subjects` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    lecture_units INT DEFAULT 3,
    lab_units INT DEFAULT 0,
    credit_units INT DEFAULT 3,
    prerequisite_codes VARCHAR(255) NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `students` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NULL,
    program_id INT NOT NULL,
    year_level_id INT NOT NULL,
    section_id INT NULL,
    status ENUM('Regular', 'Irregular', 'Applicant', 'New', 'Returning', 'Transferee', 'Graduating', 'Graduated', 'On Leave', 'Suspended', 'Dropped', 'Withdrawn', 'Expelled') DEFAULT 'Regular',
    admission_date DATE NOT NULL,
    gpa DECIMAL(3,2) DEFAULT 0.00,
    qr_token VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_profiles` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
    birth_date DATE NOT NULL,
    nationality VARCHAR(100) DEFAULT 'Filipino',
    blood_type VARCHAR(10) DEFAULT 'O+',
    phone VARCHAR(50) NULL,
    email VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_phone VARCHAR(50) NOT NULL,
    photo_url TEXT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_guardians` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    relationship ENUM('Father', 'Mother', 'Guardian', 'Grandparent', 'Sibling', 'Relative') DEFAULT 'Mother',
    full_name VARCHAR(150) NOT NULL,
    occupation VARCHAR(100) NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150) NULL,
    address TEXT NULL,
    is_authorized_pickup TINYINT(1) DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admissions` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_no VARCHAR(50) UNIQUE NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    program_id INT NOT NULL,
    status ENUM('Pending', 'Requirements Submitted', 'Exam Scheduled', 'Exam Passed', 'Interviewed', 'Approved', 'Rejected', 'Enrolled') DEFAULT 'Pending',
    exam_score DECIMAL(5,2) NULL,
    interview_notes TEXT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faculty` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NULL,
    department_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    rank VARCHAR(100) DEFAULT 'Assistant Professor',
    employment_type ENUM('Full-Time', 'Part-Time', 'Contractual', 'Visiting') DEFAULT 'Full-Time',
    specialization VARCHAR(150) NULL,
    qualification VARCHAR(150) NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NULL,
    max_load_units INT DEFAULT 24,
    FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `schedules` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    faculty_id INT NOT NULL,
    section_id INT NOT NULL,
    room_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    semester_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    schedule_type ENUM('Lecture', 'Laboratory', 'Hybrid', 'Online') DEFAULT 'Lecture',
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `enrollments` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    semester_id INT NOT NULL,
    year_level_id INT NOT NULL,
    section_id INT NOT NULL,
    total_units INT DEFAULT 0,
    tuition_amount DECIMAL(10,2) DEFAULT 0.00,
    misc_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    balance_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('Pending', 'For Assessment', 'Assessed', 'For Payment', 'Paid', 'Enrolled', 'Cancelled', 'Withdrawn') DEFAULT 'Pending',
    cor_number VARCHAR(50) UNIQUE NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `enrollment_subjects` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    subject_id INT NOT NULL,
    schedule_id INT NULL,
    units INT DEFAULT 3,
    status ENUM('Enrolled', 'Dropped', 'Added') DEFAULT 'Enrolled',
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attendance` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Excused') DEFAULT 'Present',
    method ENUM('Manual', 'QR Code') DEFAULT 'Manual',
    remarks VARCHAR(255) NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `grades` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    faculty_id INT NOT NULL,
    semester_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    written_works DECIMAL(5,2) DEFAULT 0.00,
    performance_tasks DECIMAL(5,2) DEFAULT 0.00,
    quarterly_exam DECIMAL(5,2) DEFAULT 0.00,
    prelim_grade DECIMAL(5,2) DEFAULT 0.00,
    midterm_grade DECIMAL(5,2) DEFAULT 0.00,
    final_grade DECIMAL(5,2) DEFAULT 0.00,
    remarks ENUM('Passed', 'Failed', 'Incomplete', 'Dropped') DEFAULT 'Passed',
    status ENUM('Draft', 'Submitted', 'Approved', 'Locked') DEFAULT 'Draft',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `invoices` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    enrollment_id INT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Unpaid', 'Partially Paid', 'Paid') DEFAULT 'Unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    or_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    invoice_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'GCash', 'Maya', 'Bank Transfer', 'Check', 'Credit Card') DEFAULT 'Cash',
    reference_no VARCHAR(100) NULL,
    cashier_name VARCHAR(150) DEFAULT 'Campus Cashier',
    remarks TEXT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `scholarships` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    provider VARCHAR(150) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    fixed_amount DECIMAL(10,2) DEFAULT 0.00,
    slots_available INT DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `student_scholarships` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    scholarship_id INT NOT NULL,
    status ENUM('Active', 'Pending', 'Expired') DEFAULT 'Active',
    granted_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `library_books` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    publisher VARCHAR(150) NOT NULL,
    year_published INT NOT NULL,
    shelf_location VARCHAR(100) NOT NULL,
    total_copies INT DEFAULT 5,
    available_copies INT DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `library_borrowings` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    student_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status ENUM('Borrowed', 'Returned', 'Overdue', 'Lost') DEFAULT 'Borrowed',
    fine_amount DECIMAL(8,2) DEFAULT 0.00,
    is_fine_paid TINYINT(1) DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES library_books(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `guidance_records` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    counselor_name VARCHAR(150) NOT NULL,
    concern_type VARCHAR(100) NOT NULL,
    session_date DATE NOT NULL,
    notes TEXT NOT NULL,
    recommendations TEXT NULL,
    status ENUM('Open', 'In Progress', 'Resolved', 'Referred') DEFAULT 'Open',
    is_confidential TINYINT(1) DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `discipline_records` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_no VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    violation_type VARCHAR(150) NOT NULL,
    incident_date DATE NOT NULL,
    investigation_summary TEXT NOT NULL,
    sanction ENUM('Verbal Warning', 'Written Reprimand', 'Suspension', 'Community Service', 'Probation', 'Expulsion') DEFAULT 'Written Reprimand',
    status ENUM('Pending Hearing', 'Under Investigation', 'Resolved', 'Appealed') DEFAULT 'Pending Hearing',
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `clinic_records` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    complaints TEXT NOT NULL,
    vital_signs VARCHAR(100) NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_given TEXT NOT NULL,
    prescription TEXT NULL,
    attended_by VARCHAR(150) DEFAULT 'School Nurse',
    allergies VARCHAR(255) NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory_items` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'pcs',
    location VARCHAR(150) NOT NULL,
    condition_status ENUM('Good', 'Under Maintenance', 'For Repair', 'Disposed') DEFAULT 'Good',
    unit_cost DECIMAL(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `hr_employees` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    employment_type ENUM('Full-Time', 'Part-Time', 'Contractual') DEFAULT 'Full-Time',
    basic_salary DECIMAL(10,2) DEFAULT 35000.00,
    status ENUM('Active', 'On Leave', 'Resigned', 'Terminated') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `hr_leaves` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type ENUM('Sick Leave', 'Vacation Leave', 'Emergency Leave', 'Maternity/Paternity') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (employee_id) REFERENCES hr_employees(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `announcements` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    audience ENUM('All', 'Students', 'Faculty', 'Parents', 'Staff') DEFAULT 'All',
    priority ENUM('Normal', 'Important', 'Urgent') DEFAULT 'Normal',
    author_name VARCHAR(150) DEFAULT 'Office of Academic Affairs',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `events` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    venue VARCHAR(150) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    organizer VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `clearances` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    semester_id INT NOT NULL,
    clearance_token VARCHAR(100) UNIQUE NOT NULL,
    registrar_status ENUM('Pending', 'Cleared', 'Hold') DEFAULT 'Pending',
    accounting_status ENUM('Pending', 'Cleared', 'Hold') DEFAULT 'Pending',
    library_status ENUM('Pending', 'Cleared', 'Hold') DEFAULT 'Pending',
    guidance_status ENUM('Pending', 'Cleared', 'Hold') DEFAULT 'Pending',
    clinic_status ENUM('Pending', 'Cleared', 'Hold') DEFAULT 'Pending',
    department_status ENUM('Pending', 'Cleared', 'Hold') DEFAULT 'Pending',
    overall_status ENUM('Pending', 'Cleared', 'Hold') DEFAULT 'Pending',
    remarks TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `graduation_candidates` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    gpa DECIMAL(3,2) NOT NULL,
    academic_distinction ENUM('Summa Cum Laude', 'Magna Cum Laude', 'Cum Laude', 'With Highest Honors', 'With High Honors', 'With Honors', 'Dean''s List', 'None') DEFAULT 'None',
    clearance_status ENUM('Pending', 'Cleared') DEFAULT 'Cleared',
    status ENUM('Candidate', 'Approved', 'Graduated') DEFAULT 'Candidate',
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `registrar_documents` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    document_type ENUM('Transcript of Records (TOR)', 'Certificate of Good Moral Character', 'Certificate of Enrollment', 'Transfer Credential / Honorable Dismissal', 'Clearance Certificate', 'Grade Report Certification') NOT NULL,
    purpose VARCHAR(200) NOT NULL,
    copies INT DEFAULT 1,
    status ENUM('Pending', 'Processing', 'Approved', 'Ready for Release', 'Released', 'Rejected') DEFAULT 'Pending',
    tracking_token VARCHAR(100) UNIQUE NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `qr_verifications` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(100) UNIQUE NOT NULL,
    verification_type ENUM('StudentID', 'TOR', 'GoodMoral', 'COR', 'Clearance', 'Diploma') NOT NULL,
    reference_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    holder_name VARCHAR(150) NOT NULL,
    details_json TEXT NOT NULL,
    status ENUM('Valid', 'Revoked', 'Expired') DEFAULT 'Valid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  SEED / DEMO DATA
-- ============================================================

-- ─── Users (password = Admin@123 for all accounts) ───────────
-- BCrypt hash of 'Admin@123'
INSERT INTO `users` (username, email, password_hash, role) VALUES
('admin',       'admin@school.edu',       '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'Super Administrator'),
('registrar',   'registrar@school.edu',   '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'Registrar'),
('faculty',     'faculty@school.edu',     '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'Teacher'),
('student',     'student@school.edu',     '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'Student'),
('parent',      'parent@school.edu',      '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'Parent/Guardian'),
('accountant',  'accountant@school.edu',  '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'Accountant'),
('librarian',   'librarian@school.edu',   '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'Librarian'),
('guidance',    'guidance@school.edu',    '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'Guidance Counselor'),
('nurse',       'nurse@school.edu',       '$2y$10$XFDqRdFvCPgyrnWC/wI0kOGbP/YI.htDV5gsjv7J/QnBN1hkwA5AK', 'School Nurse');

-- IMPORTANT: After importing, visit http://localhost:8000/api/setup_database.php
-- to let PHP re-generate the correct bcrypt hashes. The hash above is a
-- placeholder (password = "password"). The app uses Admin@123.

-- ─── User Profiles ───────────────────────────────────────────
INSERT INTO `user_profiles` (user_id, first_name, middle_name, last_name, phone, address) VALUES
(1, 'Admin',      'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus'),
(2, 'Registrar',  'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus'),
(3, 'Faculty',    'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus'),
(4, 'Student',    'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus'),
(5, 'Parent',     'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus'),
(6, 'Accountant', 'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus'),
(7, 'Librarian',  'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus'),
(8, 'Guidance',   'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus'),
(9, 'Nurse',      'M', 'University', '+63 912 345 6789', 'University Ave, Metro Campus');

-- ─── Campuses ─────────────────────────────────────────────────
INSERT INTO `campuses` (name, code, address, phone, is_main) VALUES
('Main Metro Campus',      'MAIN', '100 University Boulevard, Metro Manila', '+63 2 8123 4567', 1),
('East Technology Campus', 'EAST', '45 Innovation Way, Rizal',              '+63 2 8987 6543', 0);

-- ─── Buildings ────────────────────────────────────────────────
INSERT INTO `buildings` (campus_id, name, code, floors_count) VALUES
(1, 'Information Technology Complex',   'ITC-BLDG', 4),
(1, 'Academic Hall of Sciences',        'SCI-BLDG', 5),
(1, 'Administration & Student Services','ADM-BLDG', 3);

-- ─── Rooms ────────────────────────────────────────────────────
INSERT INTO `rooms` (building_id, room_number, name, room_type, capacity) VALUES
(1, 'LAB-301', 'Advanced Software Lab',         'Laboratory', 40),
(1, 'LAB-302', 'Networks & Cybersecurity Lab',  'Laboratory', 35),
(2, 'LEC-201', 'General Lecture Hall 1',        'Lecture',    50),
(2, 'LEC-202', 'General Lecture Hall 2',        'Lecture',    50),
(3, 'LIB-101', 'Main Reference Library',        'Library',   120),
(3, 'CLN-102', 'University Clinic & Infirmary', 'Clinic',     15);

-- ─── Departments ──────────────────────────────────────────────
INSERT INTO `departments` (campus_id, code, name, head_name, email) VALUES
(1, 'CCIS', 'College of Computing & Information Sciences', 'Dr. Alan Turing, Ph.D.',       'ccis@school.edu'),
(1, 'CBA',  'College of Business Administration',          'Prof. Eleanor Vance, MBA',     'cba@school.edu'),
(1, 'CN',   'College of Nursing & Allied Health',          'Dr. Florence Nightingale, RN', 'nursing@school.edu'),
(1, 'COE',  'College of Engineering & Architecture',       'Engr. Nikola Tesla, PE',       'engineering@school.edu');

-- ─── Academic Years & Semesters ───────────────────────────────
INSERT INTO `academic_years` (name, start_date, end_date, is_current) VALUES
('2026-2027', '2026-08-01', '2027-06-30', 1),
('2025-2026', '2025-08-01', '2026-06-30', 0);

INSERT INTO `semesters` (academic_year_id, name, is_current, enrollment_open) VALUES
(1, '1st Semester', 1, 1),
(1, '2nd Semester', 0, 0),
(1, 'Summer Term',  0, 0);

-- ─── Programs ─────────────────────────────────────────────────
INSERT INTO `programs` (department_id, code, name, degree_type, total_units) VALUES
(1, 'BSCS', 'Bachelor of Science in Computer Science',       'Bachelor', 142),
(1, 'BSIT', 'Bachelor of Science in Information Technology', 'Bachelor', 140),
(2, 'BSBA', 'Bachelor of Science in Business Administration','Bachelor', 135),
(3, 'BSN',  'Bachelor of Science in Nursing',                'Bachelor', 155);

-- ─── Year Levels ──────────────────────────────────────────────
INSERT INTO `year_levels` (name, level_number) VALUES
('1st Year', 1), ('2nd Year', 2), ('3rd Year', 3), ('4th Year', 4);

-- ─── Sections ─────────────────────────────────────────────────
INSERT INTO `sections` (program_id, year_level_id, semester_id, name, adviser_name, max_capacity) VALUES
(1, 3, 1, 'BSCS 3-A', 'Prof. Marcus Vance',   40),
(1, 3, 1, 'BSCS 3-B', 'Prof. Sarah Jenkins',  40),
(2, 2, 1, 'BSIT 2-A', 'Prof. Dennis Ritchie', 40),
(4, 1, 1, 'BSN 1-A',  'Prof. Clara Barton',   35);

-- ─── Subjects ─────────────────────────────────────────────────
INSERT INTO `subjects` (department_id, code, title, description, lecture_units, lab_units, credit_units, prerequisite_codes) VALUES
(1,'CS301','Software Engineering & Agile Methodologies','Full lifecycle software development, modern architecture patterns, and DevOps',2,1,3,'CS202'),
(1,'CS302','Database Management Systems & Optimization','Relational theory, advanced SQL, indexing, transaction ACID, and NoSQL engines',2,1,3,'CS201'),
(1,'CS303','Modern Web & Cloud Applications','Full-stack reactive web applications, REST/GraphQL APIs, microservices and cloud deployment',2,1,3,'CS204'),
(1,'CS304','Artificial Intelligence & Machine Learning','Supervised learning, deep neural networks, computer vision, and heuristic search algorithms',2,1,3,'MATH201'),
(1,'CS305','Operating Systems & System Architecture','Kernel processes, memory management, file systems, concurrency, and thread synchronization',3,0,3,'CS203'),
(2,'BA101','Principles of Modern Management','Organizational design, leadership, strategic planning, and operational excellence',3,0,3,NULL),
(3,'NUR101','Anatomy and Human Physiology','Comprehensive study of human organ systems, cellular biology, and homeostatic regulation',3,1,4,NULL);

-- ─── Faculty ──────────────────────────────────────────────────
INSERT INTO `faculty` (employee_no, user_id, department_id, first_name, last_name, rank, employment_type, specialization, qualification, email, phone) VALUES
('EMP-2026-001',3,1,'Marcus','Vance',  'Associate Professor','Full-Time','Software Engineering & Distributed Systems','Ph.D. in Computer Science',   'faculty@school.edu', '+63 917 111 2233'),
('EMP-2026-002',NULL,1,'Sarah','Jenkins','Assistant Professor','Full-Time','Data Science & Machine Learning',          'M.S. in Information Systems', 'sjenkins@school.edu','+63 917 222 3344'),
('EMP-2026-003',NULL,1,'Dennis','Ritchie','Professor',         'Full-Time','Operating Systems & Compilers',            'Ph.D. in Computer Science',   'dritchie@school.edu','+63 917 333 4455'),
('EMP-2026-004',NULL,3,'Clara','Barton', 'Associate Professor','Full-Time','Clinical Nursing & Critical Care',         'Master of Science in Nursing','cbarton@school.edu', '+63 917 444 5566');

-- ─── Schedules ────────────────────────────────────────────────
INSERT INTO `schedules` (subject_id, faculty_id, section_id, room_id, academic_year_id, semester_id, day_of_week, start_time, end_time, schedule_type) VALUES
(1,1,1,1,1,1,'Monday',   '08:00:00','10:00:00','Lecture'),
(1,1,1,1,1,1,'Wednesday','08:00:00','11:00:00','Laboratory'),
(2,2,1,2,1,1,'Tuesday',  '10:00:00','12:00:00','Lecture'),
(2,2,1,2,1,1,'Thursday', '10:00:00','13:00:00','Laboratory'),
(3,1,1,1,1,1,'Friday',   '13:00:00','16:00:00','Laboratory'),
(4,2,1,3,1,1,'Monday',   '13:00:00','16:00:00','Lecture');

-- ─── Students ─────────────────────────────────────────────────
INSERT INTO `students` (student_number,user_id,program_id,year_level_id,section_id,status,admission_date,gpa,qr_token) VALUES
('2026-10001',4,   1,3,1,'Regular',  '2024-08-15',1.25,'TOKEN-STUDENT-2026-10001'),
('2026-10002',NULL,1,3,1,'Regular',  '2024-08-15',1.50,'TOKEN-STUDENT-2026-10002'),
('2026-10003',NULL,1,3,1,'Regular',  '2024-08-15',1.75,'TOKEN-STUDENT-2026-10003'),
('2026-10004',NULL,1,3,1,'Irregular','2024-08-15',2.10,'TOKEN-STUDENT-2026-10004'),
('2026-10005',NULL,2,2,3,'Regular',  '2025-08-10',1.40,'TOKEN-STUDENT-2026-10005'),
('2026-10006',NULL,4,1,4,'Regular',  '2026-08-01',1.35,'TOKEN-STUDENT-2026-10006');

-- ─── Student Profiles ─────────────────────────────────────────
INSERT INTO `student_profiles` (student_id,first_name,middle_name,last_name,gender,birth_date,email,phone,address,emergency_contact_name,emergency_contact_phone) VALUES
(1,'Keno',    'Alvarez','Reyes',      'Male',  '2004-05-12','student@school.edu',            '+63 918 123 4567','42 Diamond St, Quezon City',    'Maria Reyes',      '+63 917 999 8888'),
(2,'Sophia',  'Marie',  'Santos',     'Female','2005-01-20','ssantos@student.school.edu',    '+63 918 234 5678','88 Emerald Ave, Pasig City',     'Maria Santos',     '+63 917 999 8888'),
(3,'Liam',    'Gabriel','Tan',        'Male',  '2004-11-03','ltan@student.school.edu',       '+63 918 345 6789','15 Pearl Drive, Makati City',    'Maria Tan',        '+63 917 999 8888'),
(4,'Isabella','Rose',   'Del Rosario','Female','2004-09-17','idelrosario@student.school.edu','+63 918 456 7890','102 Ruby St, Taguig City',       'Maria Del Rosario','+63 917 999 8888'),
(5,'Ethan',   'Blake',  'Garcia',     'Male',  '2005-07-28','egarcia@student.school.edu',    '+63 918 567 8901','77 Sapphire Road, Mandaluyong',  'Maria Garcia',     '+63 917 999 8888'),
(6,'Hannah',  'Grace',  'Mendoza',    'Female','2006-03-14','hmendoza@student.school.edu',   '+63 918 678 9012','24 Opal Court, San Juan',         'Maria Mendoza',    '+63 917 999 8888');

-- ─── Student Guardians ────────────────────────────────────────
INSERT INTO `student_guardians` (student_id,relationship,full_name,occupation,phone,email,address) VALUES
(1,'Mother','Maria Reyes',      'Civil Engineer','+63 917 999 8888','parent@school.edu','42 Diamond St, Quezon City'),
(2,'Mother','Maria Santos',     'Civil Engineer','+63 917 999 8888','parent@school.edu','88 Emerald Ave, Pasig City'),
(3,'Mother','Maria Tan',        'Civil Engineer','+63 917 999 8888','parent@school.edu','15 Pearl Drive, Makati City'),
(4,'Mother','Maria Del Rosario','Civil Engineer','+63 917 999 8888','parent@school.edu','102 Ruby St, Taguig City'),
(5,'Mother','Maria Garcia',     'Civil Engineer','+63 917 999 8888','parent@school.edu','77 Sapphire Road, Mandaluyong'),
(6,'Mother','Maria Mendoza',    'Civil Engineer','+63 917 999 8888','parent@school.edu','24 Opal Court, San Juan');

-- ─── Admissions ───────────────────────────────────────────────
INSERT INTO `admissions` (application_no,applicant_name,email,phone,program_id,status,exam_score,interview_notes,remarks) VALUES
('APP-2026-00401','Daniel Cruz',       'dcruz@applicant.com',       '+63 920 111 2233',1,'Approved',  94.50,'Excellent technical background in programming fundamentals and strong logic test results.','Passed all evaluation stages. Recommended for BSCS.'),
('APP-2026-00402','Alyssa Valenzuela', 'avalenzuela@applicant.com', '+63 920 222 3344',4,'Interviewed',89.00,'Demonstrates high empathy, communicative ability, and genuine passion for nursing care.','Interview completed. Awaiting board committee sign-off.'),
('APP-2026-00403','Nathaniel Bautista','nbautista@applicant.com',   '+63 920 333 4455',2,'Exam Passed',91.25,NULL,'Scored high in quantitative reasoning. Schedule for panel interview.'),
('APP-2026-00404','Chloe Villanueva', 'cvillanueva@applicant.com',  '+63 920 444 5566',3,'Pending',   NULL, NULL,'Form submitted online. High school credentials pending registrar verification.');

-- ─── Enrollments ──────────────────────────────────────────────
INSERT INTO `enrollments` (student_id,academic_year_id,semester_id,year_level_id,section_id,total_units,tuition_amount,misc_amount,total_amount,discount_amount,net_amount,paid_amount,balance_amount,status,cor_number) VALUES
(1,1,1,3,1,15,22500.00,4500.00,27000.00,2700.00,24300.00,24300.00,    0.00,'Enrolled',   'COR-2026-10001'),
(2,1,1,3,1,15,22500.00,4500.00,27000.00,   0.00,27000.00,15000.00,12000.00,'Enrolled',   'COR-2026-10002'),
(3,1,1,3,1,15,22500.00,4500.00,27000.00,   0.00,27000.00,    0.00,27000.00,'For Payment','COR-2026-10003'),
(4,1,1,3,1,12,18000.00,4500.00,22500.00,   0.00,22500.00,    0.00,22500.00,'Pending',    'COR-2026-10004');

-- ─── Enrollment Subjects ──────────────────────────────────────
INSERT INTO `enrollment_subjects` (enrollment_id,subject_id,schedule_id,units,status) VALUES
(1,1,1,3,'Enrolled'),(1,2,3,3,'Enrolled'),(1,3,5,3,'Enrolled'),
(1,4,6,3,'Enrolled'),(1,5,NULL,3,'Enrolled');

-- ─── Attendance ───────────────────────────────────────────────
INSERT INTO `attendance` (schedule_id,student_id,date,status,method,remarks) VALUES
(1,1,CURDATE(),'Present','QR Code','Scanned at 07:54 AM'),
(1,2,CURDATE(),'Present','Manual', 'Attended class'),
(1,3,CURDATE(),'Late',   'Manual', 'Arrived 15 mins late'),
(1,4,CURDATE(),'Excused','Manual', 'Medical certificate submitted'),
(2,1,DATE_SUB(CURDATE(),INTERVAL 1 DAY),'Present','QR Code','Scanned at 09:58 AM');

-- ─── Grades ───────────────────────────────────────────────────
INSERT INTO `grades` (student_id,subject_id,faculty_id,semester_id,academic_year_id,written_works,performance_tasks,quarterly_exam,prelim_grade,midterm_grade,final_grade,remarks,status) VALUES
(1,1,1,1,1,95.0,94.0,92.0,94.0,93.5,94.25,'Passed','Approved'),
(1,2,2,1,1,92.0,91.0,90.0,91.5,92.0,91.50,'Passed','Approved'),
(1,3,1,1,1,98.0,97.0,96.0,97.0,97.5,97.25,'Passed','Approved'),
(1,4,2,1,1,90.0,89.0,88.0,89.0,90.0,89.50,'Passed','Approved'),
(2,1,1,1,1,88.0,87.0,89.0,88.0,88.5,88.25,'Passed','Approved'),
(3,1,1,1,1,85.0,84.0,86.0,85.0,85.0,85.00,'Passed','Approved');

-- ─── Invoices & Payments ──────────────────────────────────────
INSERT INTO `invoices` (invoice_no,student_id,enrollment_id,title,amount,balance,due_date,status) VALUES
('INV-2026-00801',1,1,'1st Semester Full Tuition & Laboratory Assessment',24300.00,    0.00,'2026-09-15','Paid'),
('INV-2026-00802',2,2,'1st Semester Full Tuition & Laboratory Assessment',27000.00,12000.00,'2026-09-15','Partially Paid'),
('INV-2026-00803',3,3,'1st Semester Full Tuition Assessment',             27000.00,27000.00,'2026-09-15','Unpaid');

INSERT INTO `payments` (or_number,student_id,invoice_id,amount,payment_method,reference_no,cashier_name,remarks) VALUES
('OR-2026-00501',1,1,24300.00,'GCash',        'GC-883921004', 'Mary Ann Tan (Cashier)','Full tuition payment cleared online'),
('OR-2026-00502',2,2,15000.00,'Bank Transfer', 'BDO-99238411','Mary Ann Tan (Cashier)','Partial downpayment for 1st Semester');

-- ─── Scholarships ─────────────────────────────────────────────
INSERT INTO `scholarships` (code,name,provider,discount_percentage,fixed_amount,slots_available) VALUES
('SCH-UNIV-PRES','Presidential Academic Excellence Grant', 'Office of the University President', 100.00,    0.00,15),
('SCH-DOST-SEI', 'DOST-SEI Merit Scholarship Program',    'Department of Science and Technology', 50.00,20000.00,30),
('SCH-DEAN-HON', 'Dean''s Honor List Tuition Subsidy',    'College Academic Council',              25.00,    0.00,50),
('SCH-ATHLETIC', 'Varsity Athlete Athletic Scholarship',   'Athletics & Physical Development',      75.00,    0.00,20);

INSERT INTO `student_scholarships` (student_id,scholarship_id,status,granted_date) VALUES
(1,3,'Active','2025-08-20');

-- ─── Library ──────────────────────────────────────────────────
INSERT INTO `library_books` (isbn,title,author,category,publisher,year_published,shelf_location,total_copies,available_copies) VALUES
('978-0132350884','Clean Code: A Handbook of Agile Software Craftsmanship',          'Robert C. Martin',      'Computer Science',    'Prentice Hall',   2008,'CS-ROW-02-B',8, 6),
('978-0262033848','Introduction to Algorithms (4th Edition)',                        'Thomas H. Cormen et al.','Computer Science',   'MIT Press',        2022,'CS-ROW-01-A',10,8),
('978-0134685991','Effective Java (3rd Edition)',                                    'Joshua Bloch',           'Software Engineering','Addison-Wesley',  2018,'CS-ROW-03-C',6, 5),
('978-1449331818','Learning JavaScript Design Patterns',                             'Addy Osmani',            'Web Development',     'O''Reilly Media',  2023,'CS-ROW-04-A',5, 4),
('978-0321125217','Domain-Driven Design: Tackling Complexity in the Heart of Software','Eric Evans',           'Software Architecture','Addison-Wesley', 2003,'CS-ROW-02-D',4, 3);

INSERT INTO `library_borrowings` (book_id,student_id,borrow_date,due_date,return_date,status,fine_amount,is_fine_paid) VALUES
(1,1,'2026-09-20','2026-10-04','2026-10-02','Returned', 0.00,0),
(2,1,'2026-10-01','2026-10-15',NULL,         'Borrowed', 0.00,0),
(3,2,'2026-09-10','2026-09-24',NULL,         'Overdue', 150.00,0);

-- ─── Guidance Records ─────────────────────────────────────────
INSERT INTO `guidance_records` (case_number,student_id,counselor_name,concern_type,session_date,notes,recommendations,status,is_confidential) VALUES
('GC-2026-0012',4,'Dr. Carmela Santos, RGC','Academic Performance & Stress',    '2026-09-28','Student expressed challenges managing irregular subject schedule and working part-time.','Provided time-management coaching and connected student with peer study groups.','In Progress',1),
('GC-2026-0013',2,'Dr. Carmela Santos, RGC','Career & Graduate School Guidance','2026-10-02','Consultation regarding career path in Cloud Architecture and AI Research.',           'Recommended specialized elective tracks and internship partner organizations.',          'Resolved',   1);

-- ─── Discipline Records ───────────────────────────────────────
INSERT INTO `discipline_records` (case_no,student_id,violation_type,incident_date,investigation_summary,sanction,status) VALUES
('DISC-2026-003',4,'Late ID Tap and Uniform Non-Compliance','2026-09-15','Student failed to present valid university physical ID at main turnstile entrance on three successive days.','Written Reprimand','Resolved');

-- ─── Clinic Records ───────────────────────────────────────────
INSERT INTO `clinic_records` (student_id,complaints,vital_signs,diagnosis,treatment_given,prescription,attended_by,allergies) VALUES
(1,'Mild tension headache following long laboratory examination','BP: 115/75, Temp: 36.5C, PR: 72','Tension-type Headache','30 minutes rest in clinic bed, oral hydration','Paracetamol 500mg tab PRN','Nurse Patricia Luna, RN','None known'),
(3,'Seasonal allergic rhinitis and sneezing',                   'BP: 120/80, Temp: 36.7C, PR: 78','Allergic Rhinitis',    'Rest and antihistamine administration',         'Cetirizine 10mg tab OD', 'Nurse Patricia Luna, RN','Penicillin, Dust mites');

-- ─── Inventory Items ──────────────────────────────────────────
INSERT INTO `inventory_items` (asset_tag,item_name,category,quantity,unit,location,condition_status,unit_cost) VALUES
('AST-2026-0101','Apple iMac 24 M3 16GB / 512GB',          'Computer Workstations',25,'units','LAB-301 Advanced Software Lab','Good', 85000.00),
('AST-2026-0102','Cisco Catalyst 3850 48-Port PoE Switch',  'Networking Hardware',   4,'units','LAB-302 Networks Lab',         'Good',120000.00),
('AST-2026-0103','Epson EB-2250U 5000-Lumen Projector',     'Audio-Visual Equipment',6,'units','Building A Lecture Halls',     'Good', 48000.00),
('AST-2026-0104','APC Smart-UPS RT 5000VA On-Line',         'Power Infrastructure',  2,'units','Main Server Room',             'Good', 95000.00);

-- ─── HR Employees ─────────────────────────────────────────────
INSERT INTO `hr_employees` (employee_id,first_name,last_name,department,position,employment_type,basic_salary,status) VALUES
('HR-EMP-001','Marcus',  'Vance', 'College of Computing',              'Associate Professor & Program Head','Full-Time',68000.00,'Active'),
('HR-EMP-002','Elena',   'Robles','Office of the University Registrar','University Registrar',              'Full-Time',58000.00,'Active'),
('HR-EMP-003','Mary Ann','Tan',   'Accounting & Cashier Office',       'Senior Cashier',                    'Full-Time',42000.00,'Active'),
('HR-EMP-004','Carmela', 'Santos','Guidance & Counseling Center',      'Chief Guidance Counselor',          'Full-Time',52000.00,'Active');

-- ─── Announcements ────────────────────────────────────────────
INSERT INTO `announcements` (title,content,audience,priority,author_name) VALUES
('Midterm Examination Schedule for Academic Year 2026-2027','Please be advised that the Midterm Examination period for the 1st Semester will officially run from October 26 to October 31, 2026. All students must ensure their accounts are assessed and clearances are updated prior to test week.','All','Important','Office of Academic Affairs'),
('Call for Applications: University Research & Innovation Grants','The CCIS and College of Engineering invite student-faculty collaborative proposals for funded research in Applied Artificial Intelligence, IoT, and Cloud Security. Submissions close on November 15, 2026.','Faculty','Normal','Center for Research & Development'),
('University Foundation Day & Cultural Festival 2026','Celebrate 45 years of academic excellence! Join the campus-wide festivities, athletic tournaments, and academic exhibitions happening on December 8 to 11, 2026.','All','Normal','Student Affairs Council');

-- ─── Events ───────────────────────────────────────────────────
INSERT INTO `events` (title,description,venue,start_date,end_date,organizer,category) VALUES
('Hackathon 2026: Code for Community Impact','48-hour student hackathon focusing on civic technology, healthcare systems, and educational accessibility.','ITC-BLDG Innovation Hub','2026-11-20 08:00:00','2026-11-22 17:00:00','Computer Science Society','Academic'),
('Annual Healthcare & Wellness Free Medical Fair','Annual university clinic event providing free medical checkups, dental screening, and health literacy talks.','SCI-BLDG Multi-Purpose Hall','2026-11-05 09:00:00','2026-11-05 16:00:00','College of Nursing & Clinic Staff','Community');

-- ─── Clearances ───────────────────────────────────────────────
INSERT INTO `clearances` (student_id,academic_year_id,semester_id,clearance_token,registrar_status,accounting_status,library_status,guidance_status,clinic_status,department_status,overall_status,remarks) VALUES
(1,1,1,'CLR-TOKEN-2026-10001','Cleared','Cleared','Cleared','Cleared','Cleared','Cleared','Cleared','All academic and financial requirements satisfied.'),
(2,1,1,'CLR-TOKEN-2026-10002','Cleared','Hold',   'Hold',   'Cleared','Cleared','Cleared','Hold',   'Overdue library book and pending accounting tuition balance.'),
(3,1,1,'CLR-TOKEN-2026-10003','Pending','Hold',   'Cleared','Cleared','Cleared','Pending','Pending','Awaiting tuition assessment payment.');

-- ─── Graduation Candidates ────────────────────────────────────
INSERT INTO `graduation_candidates` (student_id,academic_year_id,gpa,academic_distinction,clearance_status,status) VALUES
(1,1,1.25,'Magna Cum Laude','Cleared','Approved'),
(2,1,1.50,'Cum Laude',      'Pending','Candidate');

-- ─── Registrar Documents ──────────────────────────────────────
INSERT INTO `registrar_documents` (request_number,student_id,document_type,purpose,copies,status,tracking_token,released_at) VALUES
('DOC-REQ-2026-0091',1,'Transcript of Records (TOR)',          'Scholarship and Graduate School Application',2,'Released',        'DOC-VERIFY-TOR-10001','2026-10-05 14:30:00'),
('DOC-REQ-2026-0092',1,'Certificate of Good Moral Character',  'Company Internship Requirement',             1,'Ready for Release','DOC-VERIFY-GMC-10001',NULL),
('DOC-REQ-2026-0093',2,'Certificate of Enrollment',            'Visa and Travel Documentation',              1,'Processing',      'DOC-VERIFY-COE-10002',NULL);

-- ─── QR Verifications ─────────────────────────────────────────
INSERT INTO `qr_verifications` (token,verification_type,reference_id,title,holder_name,details_json,status) VALUES
('TOKEN-STUDENT-2026-10001','StudentID','2026-10001','Official University Student Identity Token','Keno A. Reyes','{"student_number":"2026-10001","name":"Keno A. Reyes","program":"BS in Computer Science","year_level":"3rd Year","status":"Regular Enrolled","campus":"Main Metro Campus","issued_date":"2026-08-15"}','Valid'),
('DOC-VERIFY-TOR-10001','TOR','DOC-REQ-2026-0091','Official Electronic Transcript of Records','Keno A. Reyes','{"document":"Official Transcript of Records","request_number":"DOC-REQ-2026-0091","student_name":"Keno A. Reyes","degree":"Bachelor of Science in Computer Science","gpa":"1.25","distinction":"Magna Cum Laude Candidate","digital_signature":"VALID_SHA256_REGISTRAR_SEAL_2026"}','Valid');

-- ─── Audit Log ────────────────────────────────────────────────
INSERT INTO `audit_logs` (user_name,role,action,module,record_id,new_values,ip_address,user_agent) VALUES
('System Seeder','Super Administrator','INITIALIZE_SYSTEM','Core System','1','Initial database tables created and baseline master data seeded successfully.','127.0.0.1','ApexSIS CLI Engine');

-- ============================================================
--  PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email         ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role          ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_program    ON students(program_id);
CREATE INDEX IF NOT EXISTS idx_students_number     ON students(student_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created  ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user     ON audit_logs(user_name);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student      ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student  ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_clearances_student  ON clearances(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student    ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student    ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_library_borrow_stu  ON library_borrowings(student_id);
CREATE INDEX IF NOT EXISTS idx_registrar_docs_stu  ON registrar_documents(student_id);

-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
--  END OF EXPORT - ApexSIS School Information System
-- ============================================================
