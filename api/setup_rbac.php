<?php
// api/setup_rbac.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/env.php';          // Load .env secrets first
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getConnection();

    // 1. Create RBAC tables
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            module VARCHAR(100) NOT NULL,
            description VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;

        CREATE TABLE IF NOT EXISTS role_permissions (
            role_id INT NOT NULL,
            permission_id INT NOT NULL,
            PRIMARY KEY (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ");

    // 2. Define standard institutional roles
    $roles = [
        ['Super Administrator', 'Institutional command, full system access and audit authority'],
        ['Registrar', 'Student records, admissions, enrollment, credentials, and graduation'],
        ['Teacher', 'Classroom instruction, class rosters, attendance encoding, and grades'],
        ['Student', 'Personal learner dossier, schedule, grades, balance, and clearance'],
        ['Parent/Guardian', 'Ward oversight, attendance alerts, quarterly marks, and tuition'],
        ['Accountant', 'Tuition billing, assessment items, cashier drawer, and official receipts'],
        ['Librarian', 'Book cataloging, borrowing circulation, returns, and overdue fines'],
        ['Guidance Counselor', 'Confidential psychological files, counseling, and behavioral cases'],
        ['School Nurse', 'Medical consultations, vital signs, allergy logs, and prescriptions'],
        ['HR Staff', 'Employee personnel records, employment contracts, and leave requests'],
    ];

    $stmtRole = $pdo->prepare("INSERT INTO roles (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)");
    foreach ($roles as $r) {
        $stmtRole->execute($r);
    }

    // 3. Define granular permissions
    $permissions = [
        // Dashboard
        ['dashboard.admin', 'Dashboard', 'Access Super Administrator command dashboard'],
        ['dashboard.registrar', 'Dashboard', 'Access Registrar operations dashboard'],
        ['dashboard.faculty', 'Dashboard', 'Access Faculty instruction dashboard'],
        ['dashboard.student', 'Dashboard', 'Access Student personal portal dashboard'],
        ['dashboard.parent', 'Dashboard', 'Access Parent/Guardian oversight dashboard'],
        ['dashboard.accounting', 'Dashboard', 'Access Finance & cashier dashboard'],
        ['dashboard.librarian', 'Dashboard', 'Access Library circulation dashboard'],
        ['dashboard.guidance', 'Dashboard', 'Access Guidance & counseling dashboard'],
        ['dashboard.clinic', 'Dashboard', 'Access School clinic dashboard'],

        // Student Management
        ['students.view_all', 'Students', 'View all student records across all programs and sections'],
        ['students.view_assigned', 'Students', 'View only students enrolled in assigned classes or sections'],
        ['students.view_own', 'Students', 'View only own student record or linked child profile'],
        ['students.create', 'Students', 'Register new student matriculations'],
        ['students.update', 'Students', 'Edit student demographic and academic profile details'],
        ['students.delete', 'Students', 'Archive or delete student record'],

        // Admissions
        ['admissions.view', 'Admissions', 'View candidate admission applications and entrance scores'],
        ['admissions.manage', 'Admissions', 'Evaluate applicant candidates and convert to active students'],

        // Enrollment
        ['enrollment.view_all', 'Enrollment', 'View all student enrollment records across the university'],
        ['enrollment.view_own', 'Enrollment', 'View only own enrollment record and Certificate of Registration'],
        ['enrollment.manage', 'Enrollment', 'Assess tuition, approve enrollments, and issue COR'],

        // Grades
        ['grades.view_all', 'Grades', 'View grade records for all students university-wide'],
        ['grades.view_assigned', 'Grades', 'View grades for assigned classes and subjects only'],
        ['grades.view_own', 'Grades', 'View own quarterly grades, GPA, and performance remarks'],
        ['grades.encode', 'Grades', 'Input, calculate, and submit class grade components'],
        ['grades.approve', 'Grades', 'Approve submitted class grade sheets'],

        // Schedules
        ['schedules.view_all', 'Schedules', 'View master class and room schedules across all departments'],
        ['schedules.view_assigned', 'Schedules', 'View assigned teaching load and class schedules only'],
        ['schedules.view_own', 'Schedules', 'View own enrolled class timetable only'],
        ['schedules.manage', 'Schedules', 'Create, update, and manage timetable assignments'],

        // Attendance
        ['attendance.view_all', 'Attendance', 'View attendance records for all sections and campus gates'],
        ['attendance.view_assigned', 'Attendance', 'View and manage attendance for assigned classes'],
        ['attendance.view_own', 'Attendance', 'View own attendance history and punctuality logs'],
        ['attendance.record', 'Attendance', 'Record manual attendance and operate QR scanner terminal'],

        // Accounting / Finance
        ['finance.view_all', 'Finance', 'View institutional revenue, billing assessments, and payments'],
        ['finance.view_own', 'Finance', 'View own statement of account, balance, and official receipts'],
        ['finance.manage', 'Finance', 'Assess fees, operate cashier drawer, and issue Official Receipts'],

        // Registrar
        ['registrar.view', 'Registrar', 'View transcript requests, certifications, and credentials'],
        ['registrar.manage', 'Registrar', 'Process and release official documents (TOR, Good Moral, Certs)'],
        ['registrar.request_own', 'Registrar', 'Request documents and track processing status'],

        // Clearance
        ['clearance.view_all', 'Clearance', 'View clearance tracking for all students'],
        ['clearance.view_own', 'Clearance', 'View personal departmental clearance status'],
        ['clearance.approve', 'Clearance', 'Sign off and approve departmental clearance items'],

        // Library
        ['library.view', 'Library', 'Browse library book catalog and availability'],
        ['library.manage', 'Library', 'Circulate loans, process book returns, and assess overdue fines'],
        ['library.borrow_own', 'Library', 'View personal borrowed books and due dates'],

        // Student Welfare (Confidential)
        ['guidance.view', 'Welfare', 'View confidential guidance counseling cases'],
        ['guidance.manage', 'Welfare', 'Create and manage psychological counseling records'],
        ['clinic.view', 'Welfare', 'View protected health consultations and allergy records'],
        ['clinic.manage', 'Welfare', 'Log student clinic visits, vital signs, and prescriptions'],
        ['discipline.view', 'Welfare', 'View disciplinary incident reports and student sanctions'],
        ['discipline.manage', 'Welfare', 'Investigate student violations and impose sanctions'],

        // Operations
        ['inventory.view', 'Operations', 'View fixed campus inventory assets and equipment'],
        ['inventory.manage', 'Operations', 'Register and audit university physical assets'],
        ['hr.view', 'Operations', 'View employee roster and staff employment profiles'],
        ['hr.manage', 'Operations', 'Manage staff records and leave requests'],
        ['events.view', 'Operations', 'View campus activities and event calendar'],
        ['events.manage', 'Operations', 'Schedule and manage institutional events'],
        ['announcements.view', 'Operations', 'Read campus announcements and notices'],
        ['announcements.create', 'Operations', 'Publish campus-wide announcements'],
        ['graduation.view', 'Operations', 'View graduation candidates and Latin Honors distinctions'],
        ['graduation.manage', 'Operations', 'Evaluate and approve candidates for academic degree conferment'],

        // Reports & Analytics
        ['reports.view', 'Reports', 'Access student directories and academic statistics'],
        ['reports.export', 'Reports', 'Export institutional data and print reports'],

        // System Administration & RBAC
        ['users.view', 'Administration', 'View user accounts, statuses, and profiles'],
        ['users.manage', 'Administration', 'Create, update, and manage user accounts'],
        ['audit.view', 'Administration', 'Inspect immutable audit logs and security events'],
        ['rbac.manage', 'Administration', 'Configure roles and modify role-based permissions matrix'],
    ];

    $stmtPerm = $pdo->prepare("INSERT INTO permissions (name, module, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE module = VALUES(module), description = VALUES(description)");
    foreach ($permissions as $p) {
        $stmtPerm->execute($p);
    }

    // 4. Map Permissions to Roles
    // Helper to get role ID
    $roleIds = [];
    $stmt = $pdo->query("SELECT id, name FROM roles");
    while ($row = $stmt->fetch()) {
        $roleIds[$row['name']] = $row['id'];
    }

    // Helper to get perm ID
    $permIds = [];
    $stmt = $pdo->query("SELECT id, name FROM permissions");
    while ($row = $stmt->fetch()) {
        $permIds[$row['name']] = $row['id'];
    }

    $assignStmt = $pdo->prepare("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)");

    // Super Administrator has ALL permissions
    if (isset($roleIds['Super Administrator'])) {
        $adminId = $roleIds['Super Administrator'];
        foreach ($permIds as $pId) {
            $assignStmt->execute([$adminId, $pId]);
        }
    }

    // Registrar permissions
    $registrarPerms = [
        'dashboard.registrar',
        'students.view_all', 'students.create', 'students.update',
        'admissions.view', 'admissions.manage',
        'enrollment.view_all', 'enrollment.manage',
        'grades.view_all', 'grades.approve',
        'schedules.view_all',
        'attendance.view_all',
        'registrar.view', 'registrar.manage',
        'clearance.view_all', 'clearance.approve',
        'graduation.view', 'graduation.manage',
        'events.view', 'announcements.view', 'announcements.create',
        'reports.view', 'reports.export'
    ];
    if (isset($roleIds['Registrar'])) {
        foreach ($registrarPerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['Registrar'], $permIds[$perm]]);
        }
    }

    // Teacher permissions
    $teacherPerms = [
        'dashboard.faculty',
        'students.view_assigned',
        'schedules.view_assigned',
        'attendance.view_assigned', 'attendance.record',
        'grades.view_assigned', 'grades.encode',
        'events.view', 'announcements.view'
    ];
    if (isset($roleIds['Teacher'])) {
        foreach ($teacherPerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['Teacher'], $permIds[$perm]]);
        }
    }

    // Student permissions
    $studentPerms = [
        'dashboard.student',
        'students.view_own',
        'enrollment.view_own',
        'schedules.view_own',
        'grades.view_own',
        'attendance.view_own',
        'finance.view_own',
        'clearance.view_own',
        'registrar.request_own',
        'library.view', 'library.borrow_own',
        'events.view', 'announcements.view'
    ];
    if (isset($roleIds['Student'])) {
        foreach ($studentPerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['Student'], $permIds[$perm]]);
        }
    }

    // Parent/Guardian permissions
    $parentPerms = [
        'dashboard.parent',
        'students.view_own',
        'enrollment.view_own',
        'schedules.view_own',
        'grades.view_own',
        'attendance.view_own',
        'finance.view_own',
        'clearance.view_own',
        'events.view', 'announcements.view'
    ];
    if (isset($roleIds['Parent/Guardian'])) {
        foreach ($parentPerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['Parent/Guardian'], $permIds[$perm]]);
        }
    }

    // Accountant permissions
    $accountantPerms = [
        'dashboard.accounting',
        'finance.view_all', 'finance.manage',
        'students.view_all',
        'clearance.view_all', 'clearance.approve',
        'reports.view', 'reports.export',
        'announcements.view'
    ];
    if (isset($roleIds['Accountant'])) {
        foreach ($accountantPerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['Accountant'], $permIds[$perm]]);
        }
    }

    // Librarian permissions
    $librarianPerms = [
        'dashboard.librarian',
        'library.view', 'library.manage',
        'clearance.view_all', 'clearance.approve',
        'events.view', 'announcements.view'
    ];
    if (isset($roleIds['Librarian'])) {
        foreach ($librarianPerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['Librarian'], $permIds[$perm]]);
        }
    }

    // Guidance Counselor permissions
    $guidancePerms = [
        'dashboard.guidance',
        'guidance.view', 'guidance.manage',
        'discipline.view', 'discipline.manage',
        'students.view_all',
        'clearance.view_all', 'clearance.approve',
        'events.view', 'announcements.view'
    ];
    if (isset($roleIds['Guidance Counselor'])) {
        foreach ($guidancePerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['Guidance Counselor'], $permIds[$perm]]);
        }
    }

    // School Nurse permissions
    $nursePerms = [
        'dashboard.clinic',
        'clinic.view', 'clinic.manage',
        'students.view_all',
        'clearance.view_all', 'clearance.approve',
        'events.view', 'announcements.view'
    ];
    if (isset($roleIds['School Nurse'])) {
        foreach ($nursePerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['School Nurse'], $permIds[$perm]]);
        }
    }

    // HR Staff permissions
    $hrPerms = [
        'dashboard.admin',
        'hr.view', 'hr.manage',
        'events.view', 'announcements.view'
    ];
    if (isset($roleIds['HR Staff'])) {
        foreach ($hrPerms as $perm) {
            if (isset($permIds[$perm])) $assignStmt->execute([$roleIds['HR Staff'], $permIds[$perm]]);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'RBAC tables created and permissions successfully seeded!',
        'roles_count' => count($roles),
        'permissions_count' => count($permissions)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
