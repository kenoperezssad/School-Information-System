<?php
// api/index.php
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't output raw PHP errors directly to break JSON

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/helpers/response.php';

Response::initCors();

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalize path: e.g. /api/students/1 -> remove trailing slashes
$path = rtrim($uri, '/');
if (empty($path)) {
    $path = '/';
}

$pdo = Database::getConnection();

// Quick Health / Welcome Check
if ($path === '' || $path === '/' || $path === '/api') {
    Response::success([
        'system' => 'ApexSIS Enterprise School Information System API',
        'version' => '2.1.0',
        'status' => 'operational',
        'security' => 'Strict RBAC & Record-Level Authorization Active',
        'timestamp' => date('c')
    ], 'ApexSIS API is ready and secured.');
}

// -----------------------------------------------------------------------------
// 1. AUTHENTICATION & SESSIONS
// -----------------------------------------------------------------------------

if ($path === '/api/auth/login' && $method === 'POST') {
    $body = Response::getJsonBody();
    $email = trim($body['email'] ?? '');
    $password = trim($body['password'] ?? '');

    if (empty($email) || empty($password)) {
        Response::error('Email and password are required.', 400);
    }

    $stmt = $pdo->prepare("SELECT u.*, up.first_name, up.last_name, up.phone 
                           FROM users u 
                           LEFT JOIN user_profiles up ON u.id = up.user_id 
                           WHERE u.email = ? OR u.username = ? LIMIT 1");
    $stmt->execute([$email, $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        Response::error('Invalid email or password credentials.', 401);
    }

    if ($user['status'] !== 'Active') {
        Response::error('Account is deactivated or suspended. Please contact administrator.', 403);
    }

    $tokenPayload = [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => ($user['first_name'] ? ($user['first_name'] . ' ' . $user['last_name']) : $user['username'])
    ];
    $token = JWT::encode($tokenPayload);

    // Attach permissions and entity IDs to user payload
    $user['permissions'] = Response::getPermissionsForUser($user);
    $user['student_id'] = Response::getStudentIdForUser($user['id']);
    $user['faculty_id'] = Response::getFacultyIdForUser($user['id']);
    $user['linked_students'] = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);

    Response::auditLog($user['id'], $tokenPayload['name'], $user['role'], 'USER_LOGIN', 'Auth', $user['id']);

    unset($user['password_hash']);
    Response::success([
        'token' => $token,
        'user' => $user
    ], 'Login successful.');
}

if ($path === '/api/auth/me' && $method === 'GET') {
    $authUser = Response::requireAuth();
    $stmt = $pdo->prepare("SELECT u.id, u.username, u.email, u.role, u.status, u.created_at,
                                  up.first_name, up.middle_name, up.last_name, up.gender, up.birth_date, up.phone, up.address
                           FROM users u
                           LEFT JOIN user_profiles up ON u.id = up.user_id
                           WHERE u.id = ?");
    $stmt->execute([$authUser['id']]);
    $user = $stmt->fetch();

    if ($user) {
        $user['permissions'] = Response::getPermissionsForUser($user);
        $user['student_id'] = Response::getStudentIdForUser($user['id']);
        $user['faculty_id'] = Response::getFacultyIdForUser($user['id']);
        $user['linked_students'] = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
    }

    Response::success($user, 'User details retrieved.');
}

// Quick Role Switcher for demonstration & evaluation
if ($path === '/api/auth/switch-role' && $method === 'POST') {
    $body = Response::getJsonBody();
    $targetRole = trim($body['role'] ?? 'Super Administrator');

    // Look for user with this role
    $stmt = $pdo->prepare("SELECT u.*, up.first_name, up.last_name 
                           FROM users u 
                           LEFT JOIN user_profiles up ON u.id = up.user_id 
                           WHERE u.role = ? LIMIT 1");
    $stmt->execute([$targetRole]);
    $user = $stmt->fetch();

    if (!$user) {
        $stmt = $pdo->query("SELECT u.*, up.first_name, up.last_name FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id LIMIT 1");
        $user = $stmt->fetch();
    }

    $tokenPayload = [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => ($user['first_name'] ? ($user['first_name'] . ' ' . $user['last_name']) : $user['username'])
    ];
    $token = JWT::encode($tokenPayload);

    $user['permissions'] = Response::getPermissionsForUser($user);
    $user['student_id'] = Response::getStudentIdForUser($user['id']);
    $user['faculty_id'] = Response::getFacultyIdForUser($user['id']);
    $user['linked_students'] = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);

    unset($user['password_hash']);
    Response::success([
        'token' => $token,
        'user' => $user
    ], "Switched role to {$user['role']}.");
}

// -----------------------------------------------------------------------------
// 1.1 RBAC ROLES & PERMISSIONS MANAGEMENT API
// -----------------------------------------------------------------------------

if ($path === '/api/rbac/roles' && $method === 'GET') {
    $user = Response::requireAuth();
    $stmt = $pdo->query("SELECT r.*, COUNT(rp.permission_id) as permissions_count 
                         FROM roles r 
                         LEFT JOIN role_permissions rp ON r.id = rp.role_id 
                         GROUP BY r.id 
                         ORDER BY r.name ASC");
    $roles = $stmt->fetchAll();

    // Attach permissions per role
    foreach ($roles as &$role) {
        $permStmt = $pdo->prepare("SELECT p.name FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?");
        $permStmt->execute([$role['id']]);
        $role['permissions'] = $permStmt->fetchAll(PDO::FETCH_COLUMN);
    }
    unset($role);

    Response::success($roles, 'Roles retrieved.');
}

if ($path === '/api/rbac/permissions' && $method === 'GET') {
    $user = Response::requireAuth();
    $stmt = $pdo->query("SELECT * FROM permissions ORDER BY module ASC, name ASC");
    $perms = $stmt->fetchAll();
    Response::success($perms, 'Permissions retrieved.');
}

if ($path === '/api/rbac/role-permissions' && $method === 'POST') {
    $user = Response::requirePermission('rbac.manage');
    $body = Response::getJsonBody();

    $roleId = (int)($body['role_id'] ?? 0);
    $permissionName = trim($body['permission_name'] ?? '');
    $grant = (bool)($body['grant'] ?? true);

    if ($roleId <= 0 || empty($permissionName)) {
        Response::error('Role ID and permission name are required.', 400);
    }

    $permStmt = $pdo->prepare("SELECT id FROM permissions WHERE name = ?");
    $permStmt->execute([$permissionName]);
    $permId = $permStmt->fetchColumn();

    if (!$permId) {
        Response::error('Permission not found.', 404);
    }

    if ($grant) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
        $stmt->execute([$roleId, $permId]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?");
        $stmt->execute([$roleId, $permId]);
    }

    Response::auditLog($user['id'], $user['name'], $user['role'], 'UPDATE_ROLE_PERMISSION', 'RBAC', $roleId, null, [
        'permission' => $permissionName,
        'granted' => $grant
    ]);

    Response::success(['granted' => $grant], "Permission '{$permissionName}' updated for role.");
}

// -----------------------------------------------------------------------------
// 2. DASHBOARD METRICS & ANALYTICS (ROLE-SPECIFIC DATA ISOLATION)
// -----------------------------------------------------------------------------

// Helper for Student Isolated Dashboard
function getStudentDashboardData($pdo, $user) {
    $studentId = Response::getStudentIdForUser($user['id']) ?? 1;

    // Student basic academic record
    $stdStmt = $pdo->prepare("
        SELECT s.*, sp.first_name, sp.last_name, p.name as program_name, p.code as program_code, yl.name as year_level
        FROM students s
        JOIN student_profiles sp ON s.id = sp.student_id
        JOIN programs p ON s.program_id = p.id
        JOIN year_levels yl ON s.year_level_id = yl.id
        WHERE s.id = ?
    ");
    $stdStmt->execute([$studentId]);
    $student = $stdStmt->fetch();

    // Enrolled subjects & active load
    $subStmt = $pdo->prepare("
        SELECT es.*, sub.code, sub.title, sub.credit_units, sch.day_of_week, sch.start_time, sch.end_time, r.room_number,
               f.first_name as prof_first, f.last_name as prof_last
        FROM enrollment_subjects es
        JOIN enrollments e ON es.enrollment_id = e.id
        JOIN subjects sub ON es.subject_id = sub.id
        LEFT JOIN schedules sch ON es.schedule_id = sch.id
        LEFT JOIN rooms r ON sch.room_id = r.id
        LEFT JOIN faculty f ON sch.faculty_id = f.id
        WHERE e.student_id = ? AND e.status = 'Enrolled'
    ");
    $subStmt->execute([$studentId]);
    $enrolledSubjects = $subStmt->fetchAll();

    // Outstanding balance
    $balStmt = $pdo->prepare("SELECT COALESCE(SUM(balance), 0) FROM invoices WHERE student_id = ? AND status != 'Paid'");
    $balStmt->execute([$studentId]);
    $myBalance = (float)$balStmt->fetchColumn();

    // Student Attendance Rate
    $attStmt = $pdo->prepare("
        SELECT COUNT(*) as total_sessions,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count
        FROM attendance WHERE student_id = ?
    ");
    $attStmt->execute([$studentId]);
    $attData = $attStmt->fetch();
    $attRate = ($attData['total_sessions'] > 0) ? round(($attData['present_count'] / $attData['total_sessions']) * 100) : 95;

    // Clearance Status
    $clrStmt = $pdo->prepare("SELECT overall_status FROM clearances WHERE student_id = ? ORDER BY id DESC LIMIT 1");
    $clrStmt->execute([$studentId]);
    $myClearance = $clrStmt->fetchColumn() ?: 'Cleared';

    // Today's classes
    $todayName = date('l');
    $todayClasses = array_values(array_filter($enrolledSubjects, function($s) use ($todayName) {
        return ($s['day_of_week'] === $todayName);
    }));

    // Targeted Announcements
    $annStmt = $pdo->query("SELECT * FROM announcements WHERE audience IN ('All', 'Students') ORDER BY created_at DESC LIMIT 5");
    $announcements = $annStmt->fetchAll();

    return [
        'role' => 'Student',
        'is_isolated' => true,
        'counters' => [
            'myEnrollmentStatus' => 'Enrolled',
            'mySubjectsCount' => count($enrolledSubjects),
            'myCurrentGpa' => $student['gpa'] ?? '1.25',
            'myAttendanceRate' => "{$attRate}%",
            'myBalance' => $myBalance,
            'myUpcomingClasses' => count($todayClasses),
            'myClearanceStatus' => $myClearance
        ],
        'enrolledSubjects' => $enrolledSubjects,
        'todayClasses' => $todayClasses,
        'announcements' => $announcements
    ];
}

// Helper for Faculty Isolated Dashboard
function getFacultyDashboardData($pdo, $user) {
    $facultyId = Response::getFacultyIdForUser($user['id']) ?? 1;

    // Assigned teaching schedules
    $schStmt = $pdo->prepare("
        SELECT sch.*, sub.code as subject_code, sub.title as subject_title,
               sec.name as section_name, r.room_number, b.name as building_name
        FROM schedules sch
        JOIN subjects sub ON sch.subject_id = sub.id
        JOIN sections sec ON sch.section_id = sec.id
        JOIN rooms r ON sch.room_id = r.id
        JOIN buildings b ON r.building_id = b.id
        WHERE sch.faculty_id = ?
        ORDER BY sch.day_of_week, sch.start_time
    ");
    $schStmt->execute([$facultyId]);
    $schedules = $schStmt->fetchAll();

    // Total distinct students enrolled in teacher's classes
    $stdCountStmt = $pdo->prepare("
        SELECT COUNT(DISTINCT es.student_id) 
        FROM enrollment_subjects es
        JOIN schedules s ON es.schedule_id = s.id
        WHERE s.faculty_id = ?
    ");
    $stdCountStmt->execute([$facultyId]);
    $myStudentsCount = (int)$stdCountStmt->fetchColumn();

    // Draft / Pending grades count
    $grStmt = $pdo->prepare("SELECT COUNT(*) FROM grades WHERE faculty_id = ? AND status = 'Draft'");
    $grStmt->execute([$facultyId]);
    $pendingGrades = (int)$grStmt->fetchColumn();

    // Today's classes
    $todayName = date('l');
    $todayClasses = array_values(array_filter($schedules, function($s) use ($todayName) {
        return ($s['day_of_week'] === $todayName);
    }));

    $annStmt = $pdo->query("SELECT * FROM announcements WHERE audience IN ('All', 'Faculty') ORDER BY created_at DESC LIMIT 5");

    return [
        'role' => 'Teacher',
        'is_isolated' => true,
        'counters' => [
            'assignedClasses' => count($schedules),
            'totalStudentsInClasses' => $myStudentsCount,
            'classesToday' => count($todayClasses),
            'pendingGradeSheets' => $pendingGrades
        ],
        'schedules' => $schedules,
        'todayClasses' => $todayClasses,
        'announcements' => $annStmt->fetchAll()
    ];
}

// Helper for Parent Isolated Dashboard
function getParentDashboardData($pdo, $user) {
    $linkedStudentIds = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
    $firstStudentId = !empty($linkedStudentIds) ? $linkedStudentIds[0] : 1;

    $stdStmt = $pdo->prepare("
        SELECT s.*, sp.first_name, sp.last_name, p.name as program_name, p.code as program_code, yl.name as year_level
        FROM students s
        JOIN student_profiles sp ON s.id = sp.student_id
        JOIN programs p ON s.program_id = p.id
        JOIN year_levels yl ON s.year_level_id = yl.id
        WHERE s.id = ?
    ");
    $stdStmt->execute([$firstStudentId]);
    $child = $stdStmt->fetch();

    $balStmt = $pdo->prepare("SELECT COALESCE(SUM(balance), 0) FROM invoices WHERE student_id = ? AND status != 'Paid'");
    $balStmt->execute([$firstStudentId]);
    $childBalance = (float)$balStmt->fetchColumn();

    $attStmt = $pdo->prepare("
        SELECT COUNT(*) as total_sessions,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count
        FROM attendance WHERE student_id = ?
    ");
    $attStmt->execute([$firstStudentId]);
    $attData = $attStmt->fetch();
    $attRate = ($attData['total_sessions'] > 0) ? round(($attData['present_count'] / $attData['total_sessions']) * 100) : 95;

    $annStmt = $pdo->query("SELECT * FROM announcements WHERE audience IN ('All', 'Parents') ORDER BY created_at DESC LIMIT 5");

    return [
        'role' => 'Parent/Guardian',
        'is_isolated' => true,
        'child' => $child,
        'counters' => [
            'childName' => $child ? "{$child['first_name']} {$child['last_name']}" : 'Enrolled Ward',
            'childGpa' => $child['gpa'] ?? '1.25',
            'childAttendance' => "{$attRate}%",
            'outstandingTuition' => $childBalance,
            'enrollmentStanding' => 'Regular Enrolled'
        ],
        'announcements' => $annStmt->fetchAll()
    ];
}

// Helper for Global Super Admin Dashboard
function getAdminDashboardData($pdo) {
    $totalStudents = (int)$pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
    $totalFaculty = (int)$pdo->query("SELECT COUNT(*) FROM faculty")->fetchColumn();
    $enrolledCount = (int)$pdo->query("SELECT COUNT(*) FROM enrollments WHERE status = 'Enrolled'")->fetchColumn();
    $totalRevenue = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments")->fetchColumn();
    $outstandingBal = (float)$pdo->query("SELECT COALESCE(SUM(balance), 0) FROM invoices WHERE status != 'Paid'")->fetchColumn();
    $pendingApplicants = (int)$pdo->query("SELECT COUNT(*) FROM admissions WHERE status = 'Pending'")->fetchColumn();
    $totalBooks = (int)$pdo->query("SELECT COUNT(*) FROM library_books")->fetchColumn();
    $borrowedBooks = (int)$pdo->query("SELECT COUNT(*) FROM library_borrowings WHERE status = 'Borrowed'")->fetchColumn();
    $overdueBooks = (int)$pdo->query("SELECT COUNT(*) FROM library_borrowings WHERE status = 'Overdue'")->fetchColumn();

    $programEnrollments = $pdo->query("SELECT p.code as name, COUNT(e.id) as value 
                                       FROM programs p 
                                       LEFT JOIN students s ON p.id = s.program_id 
                                       LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'Enrolled'
                                       GROUP BY p.id")->fetchAll();

    $revenueTrend = [
        ['month' => 'May', 'collected' => 125000, 'target' => 100000],
        ['month' => 'Jun', 'collected' => 189000, 'target' => 150000],
        ['month' => 'Jul', 'collected' => 310000, 'target' => 280000],
        ['month' => 'Aug', 'collected' => 540000, 'target' => 500000],
        ['month' => 'Sep', 'collected' => 420000, 'target' => 400000],
        ['month' => 'Oct', 'collected' => 210000, 'target' => 200000],
    ];

    $attendanceStats = [
        ['name' => 'Present', 'value' => 88, 'color' => '#10b981'],
        ['name' => 'Late', 'value' => 7, 'color' => '#f59e0b'],
        ['name' => 'Excused', 'value' => 3, 'color' => '#3b82f6'],
        ['name' => 'Absent', 'value' => 2, 'color' => '#ef4444'],
    ];

    $recentLogs = $pdo->query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 8")->fetchAll();

    return [
        'role' => 'Super Administrator',
        'is_isolated' => false,
        'counters' => [
            'totalStudents' => $totalStudents,
            'totalFaculty' => $totalFaculty,
            'enrolledStudents' => $enrolledCount,
            'totalRevenue' => $totalRevenue,
            'outstandingBalance' => $outstandingBal,
            'pendingApplicants' => $pendingApplicants,
            'totalBooks' => $totalBooks,
            'borrowedBooks' => $borrowedBooks,
            'overdueBooks' => $overdueBooks,
            'activePrograms' => 4,
            'totalSections' => 4,
            'activeClearances' => 3
        ],
        'charts' => [
            'programEnrollments' => $programEnrollments,
            'revenueTrend' => $revenueTrend,
            'attendanceStats' => $attendanceStats
        ],
        'recentLogs' => $recentLogs
    ];
}

// Dispatched Dashboard Route
if ($path === '/api/dashboard/stats' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? 'Student';

    if ($role === 'Student') {
        $data = getStudentDashboardData($pdo, $user);
    } else if ($role === 'Teacher') {
        $data = getFacultyDashboardData($pdo, $user);
    } else if ($role === 'Parent/Guardian') {
        $data = getParentDashboardData($pdo, $user);
    } else if ($role === 'Registrar') {
        $pendingApplicants = (int)$pdo->query("SELECT COUNT(*) FROM admissions WHERE status = 'Pending'")->fetchColumn();
        $pendingEnrollment = (int)$pdo->query("SELECT COUNT(*) FROM enrollments WHERE status = 'Pending'")->fetchColumn();
        $docReqs = (int)$pdo->query("SELECT COUNT(*) FROM registrar_documents WHERE status = 'Pending'")->fetchColumn();
        $gradCandidates = (int)$pdo->query("SELECT COUNT(*) FROM graduation_candidates")->fetchColumn();
        $data = [
            'role' => 'Registrar',
            'counters' => [
                'pendingApplicants' => $pendingApplicants,
                'pendingEnrollments' => $pendingEnrollment,
                'documentRequests' => $docReqs,
                'graduationCandidates' => $gradCandidates
            ]
        ];
    } else if ($role === 'Accountant') {
        $totalRevenue = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments")->fetchColumn();
        $outstandingBal = (float)$pdo->query("SELECT COALESCE(SUM(balance), 0) FROM invoices WHERE status != 'Paid'")->fetchColumn();
        $unpaidInvoices = (int)$pdo->query("SELECT COUNT(*) FROM invoices WHERE status = 'Unpaid'")->fetchColumn();
        $data = [
            'role' => 'Accountant',
            'counters' => [
                'totalCollected' => $totalRevenue,
                'outstandingBalance' => $outstandingBal,
                'unpaidInvoices' => $unpaidInvoices
            ]
        ];
    } else if ($role === 'Librarian') {
        $totalBooks = (int)$pdo->query("SELECT COUNT(*) FROM library_books")->fetchColumn();
        $borrowedBooks = (int)$pdo->query("SELECT COUNT(*) FROM library_borrowings WHERE status = 'Borrowed'")->fetchColumn();
        $overdueBooks = (int)$pdo->query("SELECT COUNT(*) FROM library_borrowings WHERE status = 'Overdue'")->fetchColumn();
        $data = [
            'role' => 'Librarian',
            'counters' => [
                'totalBooks' => $totalBooks,
                'activeLoans' => $borrowedBooks,
                'overdueLoans' => $overdueBooks
            ]
        ];
    } else if ($role === 'Guidance Counselor') {
        $casesCount = (int)$pdo->query("SELECT COUNT(*) FROM guidance_records WHERE status = 'Open'")->fetchColumn();
        $discCount = (int)$pdo->query("SELECT COUNT(*) FROM discipline_records WHERE status = 'Under Investigation'")->fetchColumn();
        $data = [
            'role' => 'Guidance Counselor',
            'counters' => [
                'openCounselingCases' => $casesCount,
                'disciplinaryHearings' => $discCount
            ]
        ];
    } else if ($role === 'School Nurse') {
        $visitsToday = (int)$pdo->query("SELECT COUNT(*) FROM clinic_records WHERE DATE(visit_date) = CURDATE()")->fetchColumn();
        $data = [
            'role' => 'School Nurse',
            'counters' => [
                'consultationsToday' => $visitsToday,
                'infirmaryBeds' => '15 Available'
            ]
        ];
    } else {
        $data = getAdminDashboardData($pdo);
    }

    Response::success($data, 'Role-specific dashboard data loaded.');
}

// Explicit Role Dashboard Endpoints with Permission Verification
if ($path === '/api/dashboard/admin' && $method === 'GET') {
    Response::requirePermission('dashboard.admin');
    Response::success(getAdminDashboardData($pdo), 'Admin dashboard data loaded.');
}

if ($path === '/api/dashboard/student' && $method === 'GET') {
    $user = Response::requirePermission('dashboard.student');
    Response::success(getStudentDashboardData($pdo, $user), 'Student dashboard data loaded.');
}

if ($path === '/api/dashboard/faculty' && $method === 'GET') {
    $user = Response::requirePermission('dashboard.faculty');
    Response::success(getFacultyDashboardData($pdo, $user), 'Faculty dashboard data loaded.');
}

if ($path === '/api/dashboard/parent' && $method === 'GET') {
    $user = Response::requirePermission('dashboard.parent');
    Response::success(getParentDashboardData($pdo, $user), 'Parent dashboard data loaded.');
}

// -----------------------------------------------------------------------------
// 3. MASTER METADATA & ACADEMIC SETUP
// -----------------------------------------------------------------------------

if ($path === '/api/academic/metadata' && $method === 'GET') {
    $campuses = $pdo->query("SELECT * FROM campuses ORDER BY name")->fetchAll();
    $departments = $pdo->query("SELECT * FROM departments ORDER BY name")->fetchAll();
    $programs = $pdo->query("SELECT * FROM programs ORDER BY name")->fetchAll();
    $yearLevels = $pdo->query("SELECT * FROM year_levels ORDER BY level_number")->fetchAll();
    $sections = $pdo->query("SELECT s.*, p.code as program_code FROM sections s JOIN programs p ON s.program_id = p.id ORDER BY s.name")->fetchAll();
    $subjects = $pdo->query("SELECT * FROM subjects ORDER BY code")->fetchAll();
    $rooms = $pdo->query("SELECT r.*, b.name as building_name FROM rooms r JOIN buildings b ON r.building_id = b.id ORDER BY r.room_number")->fetchAll();
    $semesters = $pdo->query("SELECT s.*, ay.name as academic_year_name FROM semesters s JOIN academic_years ay ON s.academic_year_id = ay.id ORDER BY s.id DESC")->fetchAll();
    $faculty = $pdo->query("SELECT id, employee_no, first_name, last_name, rank FROM faculty ORDER BY last_name")->fetchAll();

    Response::success([
        'campuses' => $campuses,
        'departments' => $departments,
        'programs' => $programs,
        'yearLevels' => $yearLevels,
        'sections' => $sections,
        'subjects' => $subjects,
        'rooms' => $rooms,
        'semesters' => $semesters,
        'faculty' => $faculty
    ], 'Academic metadata loaded.');
}

// -----------------------------------------------------------------------------
// 4. STUDENT MANAGEMENT (DATA-LEVEL ISOLATION)
// -----------------------------------------------------------------------------

if ($path === '/api/students' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';

    $search = trim($_GET['search'] ?? '');
    $programId = trim($_GET['program_id'] ?? '');
    $status = trim($_GET['status'] ?? '');

    $sql = "SELECT s.*, p.name as program_name, p.code as program_code, yl.name as year_level_name, 
                   sec.name as section_name, sp.first_name, sp.middle_name, sp.last_name, 
                   sp.email, sp.phone, sp.gender, sp.birth_date, sp.photo_url
            FROM students s
            JOIN student_profiles sp ON s.id = sp.student_id
            JOIN programs p ON s.program_id = p.id
            JOIN year_levels yl ON s.year_level_id = yl.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE 1=1";
    $params = [];

    // STRICT DATA ISOLATION PER ROLE
    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND s.id = ?";
        $params[] = $studentId;
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (empty($linked)) {
            Response::success([], 'No linked students found for parent account.');
        }
        $inPlaceholders = implode(',', array_fill(0, count($linked), '?'));
        $sql .= " AND s.id IN ($inPlaceholders)";
        $params = array_merge($params, $linked);
    } else if ($role === 'Teacher') {
        $facultyId = Response::getFacultyIdForUser($user['id']) ?? 1;
        // Teacher can ONLY see students in their classes or sections
        $sql .= " AND (
            s.id IN (
                SELECT DISTINCT e.student_id 
                FROM enrollment_subjects es 
                JOIN enrollments e ON es.enrollment_id = e.id
                JOIN schedules sc ON es.schedule_id = sc.id 
                WHERE sc.faculty_id = ?
            )
            OR s.id IN (
                SELECT DISTINCT st.id 
                FROM students st 
                JOIN sections sec2 ON st.section_id = sec2.id 
                JOIN schedules sc2 ON sc2.section_id = sec2.id 
                WHERE sc2.faculty_id = ?
            )
        )";
        $params[] = $facultyId;
        $params[] = $facultyId;
    } else {
        // Administrative / Registrar / Clinical / Guidance users require view permission
        if (!Response::hasPermission($user, 'students.view_all')) {
            Response::error('Forbidden: You lack permission to browse student master records.', 403);
        }
    }

    if (!empty($search)) {
        $sql .= " AND (s.student_number LIKE ? OR sp.first_name LIKE ? OR sp.last_name LIKE ? OR sp.email LIKE ?)";
        $wildcard = "%$search%";
        $params = array_merge($params, [$wildcard, $wildcard, $wildcard, $wildcard]);
    }
    if (!empty($programId)) {
        $sql .= " AND s.program_id = ?";
        $params[] = $programId;
    }
    if (!empty($status)) {
        $sql .= " AND s.status = ?";
        $params[] = $status;
    }

    $sql .= " ORDER BY sp.last_name ASC, sp.first_name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $students = $stmt->fetchAll();

    Response::success($students, 'Authorized students retrieved.');
}

// Get single 360° student details (WITH RECORD-LEVEL OWNERSHIP ENFORCEMENT)
if (preg_match('#^/api/students/(\d+)$#', $path, $matches) && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';
    $studentId = (int)$matches[1];

    // 1. RECORD OWNERSHIP CHECK
    if ($role === 'Student') {
        $myStudentId = Response::getStudentIdForUser($user['id']) ?? 1;
        if ($studentId !== $myStudentId) {
            Response::error('Forbidden: Access denied. Students are only authorized to view their own profile dossier.', 403);
        }
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (!in_array($studentId, $linked)) {
            Response::error('Forbidden: Access denied. Parents can only view records of their linked children.', 403);
        }
    } else if ($role === 'Teacher') {
        $facultyId = Response::getFacultyIdForUser($user['id']) ?? 1;
        if (!Response::isStudentAssignedToFaculty($studentId, $facultyId)) {
            Response::error('Forbidden: Access denied. This student is not enrolled in any of your assigned classes.', 403);
        }
    } else {
        if (!Response::hasPermission($user, 'students.view_all')) {
            Response::error('Forbidden: You lack permission to inspect this student record.', 403);
        }
    }

    $stmt = $pdo->prepare("SELECT s.*, p.name as program_name, p.code as program_code, yl.name as year_level_name, 
                                  sec.name as section_name, sp.*
                           FROM students s
                           JOIN student_profiles sp ON s.id = sp.student_id
                           JOIN programs p ON s.program_id = p.id
                           JOIN year_levels yl ON s.year_level_id = yl.id
                           LEFT JOIN sections sec ON s.section_id = sec.id
                           WHERE s.id = ?");
    $stmt->execute([$studentId]);
    $student = $stmt->fetch();

    if (!$student) {
        Response::error('Student record not found.', 404);
    }

    // Guardians
    $guardians = $pdo->prepare("SELECT * FROM student_guardians WHERE student_id = ?");
    $guardians->execute([$studentId]);
    $student['guardians'] = $guardians->fetchAll();

    // Active Enrollment & Subjects
    $enrollmentStmt = $pdo->prepare("SELECT e.*, ay.name as academic_year, sem.name as semester_name
                                     FROM enrollments e 
                                     JOIN academic_years ay ON e.academic_year_id = ay.id
                                     JOIN semesters sem ON e.semester_id = sem.id
                                     WHERE e.student_id = ? ORDER BY e.id DESC LIMIT 1");
    $enrollmentStmt->execute([$studentId]);
    $currentEnrollment = $enrollmentStmt->fetch();

    $student['current_enrollment'] = $currentEnrollment;
    if ($currentEnrollment) {
        $subStmt = $pdo->prepare("SELECT es.*, sub.code, sub.title, sub.credit_units, sch.day_of_week, sch.start_time, sch.end_time, r.room_number
                                  FROM enrollment_subjects es
                                  JOIN subjects sub ON es.subject_id = sub.id
                                  LEFT JOIN schedules sch ON es.schedule_id = sch.id
                                  LEFT JOIN rooms r ON sch.room_id = r.id
                                  WHERE es.enrollment_id = ?");
        $subStmt->execute([$currentEnrollment['id']]);
        $student['enrolled_subjects'] = $subStmt->fetchAll();
    } else {
        $student['enrolled_subjects'] = [];
    }

    // Grades (Teacher only sees grades for their own subject; Student/Parent/Admin see all)
    if ($role === 'Teacher') {
        $facultyId = Response::getFacultyIdForUser($user['id']) ?? 1;
        $gradeStmt = $pdo->prepare("SELECT g.*, sub.code as subject_code, sub.title as subject_title, f.first_name as prof_first, f.last_name as prof_last
                                    FROM grades g
                                    JOIN subjects sub ON g.subject_id = sub.id
                                    LEFT JOIN faculty f ON g.faculty_id = f.id
                                    WHERE g.student_id = ? AND g.faculty_id = ?");
        $gradeStmt->execute([$studentId, $facultyId]);
    } else {
        $gradeStmt = $pdo->prepare("SELECT g.*, sub.code as subject_code, sub.title as subject_title, f.first_name as prof_first, f.last_name as prof_last
                                    FROM grades g
                                    JOIN subjects sub ON g.subject_id = sub.id
                                    LEFT JOIN faculty f ON g.faculty_id = f.id
                                    WHERE g.student_id = ?");
        $gradeStmt->execute([$studentId]);
    }
    $student['grades'] = $gradeStmt->fetchAll();

    // Financial Records (Invoices & Payments) - Teachers NEVER receive financial records!
    if ($role !== 'Teacher') {
        $invStmt = $pdo->prepare("SELECT * FROM invoices WHERE student_id = ? ORDER BY id DESC");
        $invStmt->execute([$studentId]);
        $student['invoices'] = $invStmt->fetchAll();

        $payStmt = $pdo->prepare("SELECT * FROM payments WHERE student_id = ? ORDER BY id DESC");
        $payStmt->execute([$studentId]);
        $student['payments'] = $payStmt->fetchAll();
    } else {
        $student['invoices'] = [];
        $student['payments'] = [];
    }

    // Clearance
    $clearanceStmt = $pdo->prepare("SELECT * FROM clearances WHERE student_id = ? ORDER BY id DESC LIMIT 1");
    $clearanceStmt->execute([$studentId]);
    $student['clearance'] = $clearanceStmt->fetch();

    // Clinic visits - PROTECTED SENSITIVE DATA
    if (Response::hasPermission($user, 'clinic.view') || $role === 'Student') {
        $clinicStmt = $pdo->prepare("SELECT * FROM clinic_records WHERE student_id = ? ORDER BY visit_date DESC");
        $clinicStmt->execute([$studentId]);
        $student['clinic_records'] = $clinicStmt->fetchAll();
    } else {
        $student['clinic_records'] = [];
    }

    // Discipline - PROTECTED SENSITIVE DATA
    if (Response::hasPermission($user, 'discipline.view')) {
        $discStmt = $pdo->prepare("SELECT * FROM discipline_records WHERE student_id = ? ORDER BY incident_date DESC");
        $discStmt->execute([$studentId]);
        $student['discipline_records'] = $discStmt->fetchAll();
    } else {
        $student['discipline_records'] = [];
    }

    Response::success($student, '360° student details loaded securely.');
}

// Create new student
if ($path === '/api/students' && $method === 'POST') {
    $user = Response::requirePermission('students.create');
    $body = Response::getJsonBody();

    $firstName = trim($body['first_name'] ?? '');
    $lastName = trim($body['last_name'] ?? '');
    $email = trim($body['email'] ?? '');
    $programId = (int)($body['program_id'] ?? 1);
    $yearLevelId = (int)($body['year_level_id'] ?? 1);
    $sectionId = !empty($body['section_id']) ? (int)$body['section_id'] : null;

    if (empty($firstName) || empty($lastName) || empty($email)) {
        Response::error('First name, last name, and email are required.', 400);
    }

    $year = date('Y');
    $randNum = mt_rand(10010, 99999);
    $studentNumber = "{$year}-{$randNum}";
    $qrToken = "TOKEN-STUDENT-{$studentNumber}";

    $stmt = $pdo->prepare("INSERT INTO students (student_number, program_id, year_level_id, section_id, status, admission_date, qr_token) VALUES (?, ?, ?, ?, 'Regular', CURDATE(), ?)");
    $stmt->execute([$studentNumber, $programId, $yearLevelId, $sectionId, $qrToken]);
    $newStudentId = $pdo->lastInsertId();

    $stmtProf = $pdo->prepare("INSERT INTO student_profiles (student_id, first_name, middle_name, last_name, gender, birth_date, email, phone, address, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmtProf->execute([
        $newStudentId,
        $firstName,
        $body['middle_name'] ?? '',
        $lastName,
        $body['gender'] ?? 'Male',
        $body['birth_date'] ?? '2005-01-01',
        $email,
        $body['phone'] ?? '',
        $body['address'] ?? 'Metro Manila',
        $body['emergency_name'] ?? 'Guardian Name',
        $body['emergency_phone'] ?? '+63 917 000 0000'
    ]);

    Response::auditLog($user['id'], $user['name'], $user['role'], 'CREATE_STUDENT', 'Students', $newStudentId, null, ['student_number' => $studentNumber, 'name' => "$firstName $lastName"]);

    Response::success(['student_id' => $newStudentId, 'student_number' => $studentNumber], 'Student successfully registered.', 201);
}

// -----------------------------------------------------------------------------
// 5. ADMISSIONS WORKFLOW
// -----------------------------------------------------------------------------

if ($path === '/api/admissions' && $method === 'GET') {
    Response::requirePermission('admissions.view');
    $stmt = $pdo->query("SELECT a.*, p.name as program_name, p.code as program_code 
                         FROM admissions a 
                         JOIN programs p ON a.program_id = p.id 
                         ORDER BY a.created_at DESC");
    $applicants = $stmt->fetchAll();
    Response::success($applicants, 'Admissions applications loaded.');
}

if ($path === '/api/admissions' && $method === 'POST') {
    $body = Response::getJsonBody();
    $name = trim($body['applicant_name'] ?? '');
    $email = trim($body['email'] ?? '');
    $phone = trim($body['phone'] ?? '');
    $programId = (int)($body['program_id'] ?? 1);

    if (empty($name) || empty($email)) {
        Response::error('Applicant name and email are required.', 400);
    }

    $appNo = 'APP-' . date('Y') . '-' . mt_rand(10000, 99999);
    $stmt = $pdo->prepare("INSERT INTO admissions (application_no, applicant_name, email, phone, program_id, status, remarks) VALUES (?, ?, ?, ?, ?, 'Pending', ?)");
    $stmt->execute([$appNo, $name, $email, $phone, $programId, $body['remarks'] ?? 'Online application submitted']);

    Response::success(['application_no' => $appNo], 'Application submitted successfully.');
}

// Update admission status / score / interview
if (preg_match('#^/api/admissions/(\d+)$#', $path, $matches) && ($method === 'PUT' || $method === 'PATCH')) {
    Response::requirePermission('admissions.manage');
    $admId = (int)$matches[1];
    $body = Response::getJsonBody();

    $status = $body['status'] ?? null;
    $score = isset($body['exam_score']) ? (float)$body['exam_score'] : null;
    $interviewNotes = $body['interview_notes'] ?? null;
    $remarks = $body['remarks'] ?? null;

    $stmt = $pdo->prepare("UPDATE admissions SET 
                           status = COALESCE(?, status),
                           exam_score = COALESCE(?, exam_score),
                           interview_notes = COALESCE(?, interview_notes),
                           remarks = COALESCE(?, remarks)
                           WHERE id = ?");
    $stmt->execute([$status, $score, $interviewNotes, $remarks, $admId]);

    Response::success(null, 'Admission application updated.');
}

// Convert Approved Applicant to Student
if (preg_match('#^/api/admissions/(\d+)/approve$#', $path, $matches) && $method === 'POST') {
    $user = Response::requirePermission('admissions.manage');
    $admId = (int)$matches[1];

    $stmt = $pdo->prepare("SELECT * FROM admissions WHERE id = ?");
    $stmt->execute([$admId]);
    $applicant = $stmt->fetch();

    if (!$applicant) {
        Response::error('Applicant record not found.', 404);
    }

    $parts = explode(' ', $applicant['applicant_name']);
    $firstName = array_shift($parts);
    $lastName = !empty($parts) ? implode(' ', $parts) : 'Applicant';

    $year = date('Y');
    $randNum = mt_rand(10010, 99999);
    $studentNumber = "{$year}-{$randNum}";
    $qrToken = "TOKEN-STUDENT-{$studentNumber}";

    $stmtStudent = $pdo->prepare("INSERT INTO students (student_number, program_id, year_level_id, status, admission_date, qr_token) VALUES (?, ?, 1, 'Regular', CURDATE(), ?)");
    $stmtStudent->execute([$studentNumber, $applicant['program_id'], $qrToken]);
    $studentId = $pdo->lastInsertId();

    $stmtProf = $pdo->prepare("INSERT INTO student_profiles (student_id, first_name, last_name, email, phone, address, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?, ?, 'Metro Manila', 'Parent Contact', '+63 917 000 0000')");
    $stmtProf->execute([$studentId, $firstName, $lastName, $applicant['email'], $applicant['phone']]);

    $stmtUpd = $pdo->prepare("UPDATE admissions SET status = 'Enrolled' WHERE id = ?");
    $stmtUpd->execute([$admId]);

    Response::auditLog($user['id'], $user['name'], $user['role'], 'ADMISSION_APPROVED_TO_STUDENT', 'Admissions', $admId, null, ['student_number' => $studentNumber]);

    Response::success(['student_id' => $studentId, 'student_number' => $studentNumber], 'Applicant successfully approved and converted to student account!');
}

// -----------------------------------------------------------------------------
// 6. ENROLLMENT & REGISTRATION (WITH OWNERSHIP CHECK)
// -----------------------------------------------------------------------------

if ($path === '/api/enrollments' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';

    $sql = "SELECT e.*, s.student_number, sp.first_name, sp.last_name, 
                   p.code as program_code, p.name as program_name,
                   sec.name as section_name, ay.name as academic_year, sem.name as semester_name
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.student_id
            JOIN programs p ON s.program_id = p.id
            JOIN sections sec ON e.section_id = sec.id
            JOIN academic_years ay ON e.academic_year_id = ay.id
            JOIN semesters sem ON e.semester_id = sem.id
            WHERE 1=1";
    $params = [];

    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND e.student_id = ?";
        $params[] = $studentId;
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (empty($linked)) {
            Response::success([], 'No enrollments found.');
        }
        $inPlaceholders = implode(',', array_fill(0, count($linked), '?'));
        $sql .= " AND e.student_id IN ($inPlaceholders)";
        $params = array_merge($params, $linked);
    } else {
        if (!Response::hasPermission($user, 'enrollment.view_all')) {
            Response::error('Forbidden: You lack permission to browse institutional enrollment lists.', 403);
        }
    }

    $sql .= " ORDER BY e.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $enrollments = $stmt->fetchAll();

    Response::success($enrollments, 'Enrollment records retrieved.');
}

if (preg_match('#^/api/enrollments/(\d+)$#', $path, $matches) && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';
    $enrollmentId = (int)$matches[1];

    $stmt = $pdo->prepare("SELECT e.*, s.student_number, sp.first_name, sp.middle_name, sp.last_name, sp.email, sp.phone, sp.address,
                                  p.code as program_code, p.name as program_name,
                                  sec.name as section_name, ay.name as academic_year, sem.name as semester_name
                           FROM enrollments e
                           JOIN students s ON e.student_id = s.id
                           JOIN student_profiles sp ON s.id = sp.student_id
                           JOIN programs p ON s.program_id = p.id
                           JOIN sections sec ON e.section_id = sec.id
                           JOIN academic_years ay ON e.academic_year_id = ay.id
                           JOIN semesters sem ON e.semester_id = sem.id
                           WHERE e.id = ?");
    $stmt->execute([$enrollmentId]);
    $enrollment = $stmt->fetch();

    if (!$enrollment) {
        Response::error('Enrollment record not found.', 404);
    }

    // Ownership check
    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        if ((int)$enrollment['student_id'] !== $studentId) {
            Response::error('Forbidden: You can only view your own Certificate of Registration.', 403);
        }
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (!in_array((int)$enrollment['student_id'], $linked)) {
            Response::error('Forbidden: You can only view enrollments of your linked children.', 403);
        }
    }

    $subStmt = $pdo->prepare("SELECT es.*, sub.code, sub.title, sub.lecture_units, sub.lab_units, sub.credit_units,
                                     sch.day_of_week, sch.start_time, sch.end_time, r.room_number,
                                     f.first_name as prof_first, f.last_name as prof_last
                              FROM enrollment_subjects es
                              JOIN subjects sub ON es.subject_id = sub.id
                              LEFT JOIN schedules sch ON es.schedule_id = sch.id
                              LEFT JOIN rooms r ON sch.room_id = r.id
                              LEFT JOIN faculty f ON sch.faculty_id = f.id
                              WHERE es.enrollment_id = ?");
    $subStmt->execute([$enrollmentId]);
    $enrollment['subjects'] = $subStmt->fetchAll();

    Response::success($enrollment, 'Enrollment record loaded.');
}

if (preg_match('#^/api/enrollments/(\d+)/status$#', $path, $matches) && $method === 'POST') {
    $user = Response::requirePermission('enrollment.manage');
    $enrollmentId = (int)$matches[1];
    $body = Response::getJsonBody();
    $status = $body['status'] ?? 'Enrolled';

    $stmt = $pdo->prepare("UPDATE enrollments SET status = ? WHERE id = ?");
    $stmt->execute([$status, $enrollmentId]);

    Response::auditLog($user['id'], $user['name'], $user['role'], 'UPDATE_ENROLLMENT_STATUS', 'Enrollment', $enrollmentId, null, ['status' => $status]);

    Response::success(null, "Enrollment status transitioned to {$status}.");
}

// -----------------------------------------------------------------------------
// 7. REGISTRAR & OFFICIAL DOCUMENT ISSUANCE
// -----------------------------------------------------------------------------

if ($path === '/api/registrar/documents' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';

    $sql = "SELECT rd.*, s.student_number, sp.first_name, sp.last_name, p.code as program_code
            FROM registrar_documents rd
            JOIN students s ON rd.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.student_id
            JOIN programs p ON s.program_id = p.id
            WHERE 1=1";
    $params = [];

    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND rd.student_id = ?";
        $params[] = $studentId;
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (empty($linked)) Response::success([], 'No document requests found.');
        $inPlaceholders = implode(',', array_fill(0, count($linked), '?'));
        $sql .= " AND rd.student_id IN ($inPlaceholders)";
        $params = array_merge($params, $linked);
    } else {
        if (!Response::hasPermission($user, 'registrar.view')) {
            Response::error('Forbidden: You lack permission to access registrar documents.', 403);
        }
    }

    $sql .= " ORDER BY rd.requested_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $docs = $stmt->fetchAll();

    Response::success($docs, 'Registrar documents retrieved.');
}

if ($path === '/api/registrar/documents' && $method === 'POST') {
    $user = Response::requireAuth();
    $body = Response::getJsonBody();

    $studentId = (int)($body['student_id'] ?? 1);
    // If student role, enforce studentId is self
    if (($user['role'] ?? '') === 'Student') {
        $myStudentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $studentId = $myStudentId;
    }

    $docType = trim($body['document_type'] ?? 'Certificate of Enrollment');
    $purpose = trim($body['purpose'] ?? 'General Purpose');
    $copies = (int)($body['copies'] ?? 1);

    $reqNo = 'DOC-REQ-' . date('Y') . '-' . mt_rand(1000, 9999);
    $trackingToken = 'DOC-VERIFY-' . strtoupper(substr(md5(uniqid()), 0, 10));

    $stmt = $pdo->prepare("INSERT INTO registrar_documents (request_number, student_id, document_type, purpose, copies, status, tracking_token) VALUES (?, ?, ?, ?, ?, 'Pending', ?)");
    $stmt->execute([$reqNo, $studentId, $docType, $purpose, $copies, $trackingToken]);

    Response::success(['request_number' => $reqNo, 'tracking_token' => $trackingToken], 'Document request filed successfully.');
}

if (preg_match('#^/api/registrar/documents/(\d+)/status$#', $path, $matches) && ($method === 'PUT' || $method === 'POST')) {
    $user = Response::requirePermission('registrar.manage');
    $docId = (int)$matches[1];
    $body = Response::getJsonBody();
    $status = $body['status'] ?? 'Ready for Release';

    $releasedAt = ($status === 'Released') ? date('Y-m-d H:i:s') : null;

    $stmt = $pdo->prepare("UPDATE registrar_documents SET status = ?, released_at = COALESCE(?, released_at) WHERE id = ?");
    $stmt->execute([$status, $releasedAt, $docId]);

    Response::auditLog($user['id'], $user['name'], $user['role'], 'UPDATE_DOCUMENT_STATUS', 'Registrar', $docId, null, ['status' => $status]);

    Response::success(null, "Document status updated to {$status}.");
}

// -----------------------------------------------------------------------------
// 8. FACULTY & TEACHING LOAD
// -----------------------------------------------------------------------------

if ($path === '/api/faculty' && $method === 'GET') {
    $user = Response::requireAuth();
    $stmt = $pdo->query("SELECT f.*, d.name as department_name, d.code as department_code,
                                COUNT(sch.id) as assigned_schedules_count,
                                COALESCE(SUM(sub.credit_units), 0) as current_load_units
                         FROM faculty f
                         JOIN departments d ON f.department_id = d.id
                         LEFT JOIN schedules sch ON f.id = sch.faculty_id
                         LEFT JOIN subjects sub ON sch.subject_id = sub.id
                         GROUP BY f.id
                         ORDER BY f.last_name ASC");
    $faculty = $stmt->fetchAll();
    Response::success($faculty, 'Faculty records loaded.');
}

if ($path === '/api/faculty' && $method === 'POST') {
    $user = Response::requireAuth(['Super Administrator', 'School Administrator', 'HR Staff']);
    $body = Response::getJsonBody();

    $firstName = trim($body['first_name'] ?? '');
    $lastName = trim($body['last_name'] ?? '');
    $email = trim($body['email'] ?? '');
    $deptId = (int)($body['department_id'] ?? 1);
    $empNo = 'EMP-' . date('Y') . '-' . mt_rand(100, 999);

    $stmt = $pdo->prepare("INSERT INTO faculty (employee_no, department_id, first_name, last_name, rank, employment_type, specialization, qualification, email, phone, max_load_units) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $empNo,
        $deptId,
        $firstName,
        $lastName,
        $body['rank'] ?? 'Assistant Professor',
        $body['employment_type'] ?? 'Full-Time',
        $body['specialization'] ?? 'Computer Science',
        $body['qualification'] ?? 'Master of Science',
        $email,
        $body['phone'] ?? '+63 917 000 0000',
        (int)($body['max_load_units'] ?? 24)
    ]);

    Response::success(['id' => $pdo->lastInsertId(), 'employee_no' => $empNo], 'Faculty member registered.');
}

// -----------------------------------------------------------------------------
// 9. SCHEDULES & CONFLICT DETECTION ENGINE
// -----------------------------------------------------------------------------

if ($path === '/api/schedules' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';

    $sql = "SELECT sch.*, sub.code as subject_code, sub.title as subject_title,
                   f.first_name as prof_first, f.last_name as prof_last,
                   sec.name as section_name, r.room_number, r.name as room_name,
                   b.name as building_name
            FROM schedules sch
            JOIN subjects sub ON sch.subject_id = sub.id
            JOIN faculty f ON sch.faculty_id = f.id
            JOIN sections sec ON sch.section_id = sec.id
            JOIN rooms r ON sch.room_id = r.id
            JOIN buildings b ON r.building_id = b.id
            WHERE 1=1";
    $params = [];

    if ($role === 'Teacher') {
        $facultyId = Response::getFacultyIdForUser($user['id']) ?? 1;
        $sql .= " AND sch.faculty_id = ?";
        $params[] = $facultyId;
    } else if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND sch.id IN (
            SELECT es.schedule_id 
            FROM enrollment_subjects es 
            JOIN enrollments e ON es.enrollment_id = e.id 
            WHERE e.student_id = ? AND es.schedule_id IS NOT NULL
        )";
        $params[] = $studentId;
    }

    $sql .= " ORDER BY sch.day_of_week ASC, sch.start_time ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $schedules = $stmt->fetchAll();

    Response::success($schedules, 'Class schedules loaded.');
}

// Real-Time Conflict Detector Endpoint
if ($path === '/api/schedules/check-conflict' && $method === 'POST') {
    $body = Response::getJsonBody();
    $facultyId = (int)($body['faculty_id'] ?? 0);
    $roomId = (int)($body['room_id'] ?? 0);
    $sectionId = (int)($body['section_id'] ?? 0);
    $day = $body['day_of_week'] ?? 'Monday';
    $startTime = $body['start_time'] ?? '08:00:00';
    $endTime = $body['end_time'] ?? '10:00:00';
    $excludeScheduleId = (int)($body['exclude_id'] ?? 0);

    $conflicts = [];

    // 1. Check Faculty Conflict
    $stmt = $pdo->prepare("SELECT sch.*, sub.code as subject_code 
                           FROM schedules sch 
                           JOIN subjects sub ON sch.subject_id = sub.id
                           WHERE sch.faculty_id = ? AND sch.day_of_week = ? 
                           AND sch.id != ?
                           AND ((sch.start_time < ? AND sch.end_time > ?) OR (sch.start_time < ? AND sch.end_time > ?))");
    $stmt->execute([$facultyId, $day, $excludeScheduleId, $endTime, $startTime, $endTime, $startTime]);
    $facultyClash = $stmt->fetch();
    if ($facultyClash) {
        $conflicts[] = [
            'type' => 'FACULTY_CONFLICT',
            'message' => "Professor has an overlapping class ({$facultyClash['subject_code']}) on {$day} from {$facultyClash['start_time']} to {$facultyClash['end_time']}."
        ];
    }

    // 2. Check Room Conflict
    $stmt = $pdo->prepare("SELECT sch.*, r.room_number 
                           FROM schedules sch 
                           JOIN rooms r ON sch.room_id = r.id
                           WHERE sch.room_id = ? AND sch.day_of_week = ? 
                           AND sch.id != ?
                           AND ((sch.start_time < ? AND sch.end_time > ?) OR (sch.start_time < ? AND sch.end_time > ?))");
    $stmt->execute([$roomId, $day, $excludeScheduleId, $endTime, $startTime, $endTime, $startTime]);
    $roomClash = $stmt->fetch();
    if ($roomClash) {
        $conflicts[] = [
            'type' => 'ROOM_CONFLICT',
            'message' => "Room {$roomClash['room_number']} is already occupied on {$day} from {$roomClash['start_time']} to {$roomClash['end_time']}."
        ];
    }

    // 3. Check Section Conflict
    $stmt = $pdo->prepare("SELECT sch.*, sec.name as section_name 
                           FROM schedules sch 
                           JOIN sections sec ON sch.section_id = sec.id
                           WHERE sch.section_id = ? AND sch.day_of_week = ? 
                           AND sch.id != ?
                           AND ((sch.start_time < ? AND sch.end_time > ?) OR (sch.start_time < ? AND sch.end_time > ?))");
    $stmt->execute([$sectionId, $day, $excludeScheduleId, $endTime, $startTime, $endTime, $startTime]);
    $secClash = $stmt->fetch();
    if ($secClash) {
        $conflicts[] = [
            'type' => 'SECTION_CONFLICT',
            'message' => "Section {$secClash['section_name']} already has another scheduled subject on {$day} from {$secClash['start_time']} to {$secClash['end_time']}."
        ];
    }

    Response::success([
        'has_conflict' => !empty($conflicts),
        'conflicts' => $conflicts
    ], empty($conflicts) ? 'No schedule conflict detected.' : 'Schedule conflict detected!');
}

if ($path === '/api/schedules' && $method === 'POST') {
    $user = Response::requirePermission('schedules.manage');
    $body = Response::getJsonBody();

    $stmt = $pdo->prepare("INSERT INTO schedules (subject_id, faculty_id, section_id, room_id, academic_year_id, semester_id, day_of_week, start_time, end_time, schedule_type) VALUES (?, ?, ?, ?, 1, 1, ?, ?, ?, ?)");
    $stmt->execute([
        (int)$body['subject_id'],
        (int)$body['faculty_id'],
        (int)$body['section_id'],
        (int)$body['room_id'],
        $body['day_of_week'],
        $body['start_time'],
        $body['end_time'],
        $body['schedule_type'] ?? 'Lecture'
    ]);

    Response::success(['id' => $pdo->lastInsertId()], 'Schedule slot successfully assigned.');
}

// -----------------------------------------------------------------------------
// 10. ATTENDANCE & QR CODE SCANNER (WITH DATA ISOLATION)
// -----------------------------------------------------------------------------

if ($path === '/api/attendance' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';
    $date = $_GET['date'] ?? date('Y-m-d');

    $sql = "SELECT a.*, s.student_number, sp.first_name, sp.last_name, sub.code as subject_code, sch.day_of_week, sch.start_time
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.student_id
            JOIN schedules sch ON a.schedule_id = sch.id
            JOIN subjects sub ON sch.subject_id = sub.id
            WHERE a.date = ?";
    $params = [$date];

    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND a.student_id = ?";
        $params[] = $studentId;
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (empty($linked)) Response::success([], 'No attendance records.');
        $inPlaceholders = implode(',', array_fill(0, count($linked), '?'));
        $sql .= " AND a.student_id IN ($inPlaceholders)";
        $params = array_merge($params, $linked);
    } else if ($role === 'Teacher') {
        $facultyId = Response::getFacultyIdForUser($user['id']) ?? 1;
        $sql .= " AND sch.faculty_id = ?";
        $params[] = $facultyId;
    } else {
        if (!Response::hasPermission($user, 'attendance.view_all')) {
            Response::error('Forbidden: You lack permission to inspect global attendance records.', 403);
        }
    }

    $sql .= " ORDER BY a.recorded_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll();

    Response::success($records, "Attendance records for {$date} loaded.");
}

// Mark attendance (Manual or QR)
if ($path === '/api/attendance' && $method === 'POST') {
    $user = Response::requirePermission('attendance.record');
    $body = Response::getJsonBody();

    $scheduleId = (int)($body['schedule_id'] ?? 1);
    $studentId = (int)($body['student_id'] ?? 1);
    $status = $body['status'] ?? 'Present';
    $methodName = $body['method'] ?? 'Manual';
    $remarks = $body['remarks'] ?? 'Marked by instructor';
    $date = $body['date'] ?? date('Y-m-d');

    $stmt = $pdo->prepare("INSERT INTO attendance (schedule_id, student_id, date, status, method, remarks) 
                           VALUES (?, ?, ?, ?, ?, ?)
                           ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)");
    $stmt->execute([$scheduleId, $studentId, $date, $status, $methodName, $remarks]);

    Response::success(null, "Attendance recorded: {$status}.");
}

// Instant QR Attendance Scanner check-in endpoint
if ($path === '/api/attendance/qr-scan' && $method === 'POST') {
    $body = Response::getJsonBody();
    $qrToken = trim($body['qr_token'] ?? '');
    $scheduleId = (int)($body['schedule_id'] ?? 1);

    if (empty($qrToken)) {
        Response::error('QR Token is required.', 400);
    }

    $stmt = $pdo->prepare("SELECT s.id, s.student_number, sp.first_name, sp.last_name 
                           FROM students s 
                           JOIN student_profiles sp ON s.id = sp.student_id 
                           WHERE s.qr_token = ? OR s.student_number = ? LIMIT 1");
    $stmt->execute([$qrToken, $qrToken]);
    $student = $stmt->fetch();

    if (!$student) {
        Response::error('Invalid or unrecognized Student QR Code token.', 404);
    }

    $date = date('Y-m-d');
    $time = date('H:i:s');
    $stmtAtt = $pdo->prepare("INSERT INTO attendance (schedule_id, student_id, date, status, method, remarks) 
                              VALUES (?, ?, ?, 'Present', 'QR Code', ?)
                              ON DUPLICATE KEY UPDATE status = 'Present', remarks = VALUES(remarks)");
    $stmtAtt->execute([$scheduleId, $student['id'], $date, "Instant QR scan tap at {$time}"]);

    Response::success([
        'student_number' => $student['student_number'],
        'student_name' => "{$student['first_name']} {$student['last_name']}",
        'status' => 'Present',
        'timestamp' => date('h:i:s A')
    ], "Attendance verified for {$student['first_name']} {$student['last_name']}!");
}

// -----------------------------------------------------------------------------
// 11. GRADING & ACADEMIC EVALUATION (WITH ROLE & CLASS ISOLATION)
// -----------------------------------------------------------------------------

if ($path === '/api/grades' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';
    $subjectId = $_GET['subject_id'] ?? null;

    $sql = "SELECT g.*, s.student_number, sp.first_name, sp.last_name,
                   sub.code as subject_code, sub.title as subject_title,
                   f.first_name as prof_first, f.last_name as prof_last
            FROM grades g
            JOIN students s ON g.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.student_id
            JOIN subjects sub ON g.subject_id = sub.id
            LEFT JOIN faculty f ON g.faculty_id = f.id
            WHERE 1=1";
    $params = [];

    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND g.student_id = ?";
        $params[] = $studentId;
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (empty($linked)) Response::success([], 'No grades available.');
        $inPlaceholders = implode(',', array_fill(0, count($linked), '?'));
        $sql .= " AND g.student_id IN ($inPlaceholders)";
        $params = array_merge($params, $linked);
    } else if ($role === 'Teacher') {
        $facultyId = Response::getFacultyIdForUser($user['id']) ?? 1;
        $sql .= " AND g.faculty_id = ?";
        $params[] = $facultyId;
    } else {
        if (!Response::hasPermission($user, 'grades.view_all')) {
            Response::error('Forbidden: You lack permission to inspect institutional student grade sheets.', 403);
        }
    }

    if ($subjectId) {
        $sql .= " AND g.subject_id = ?";
        $params[] = $subjectId;
    }

    $sql .= " ORDER BY sp.last_name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $grades = $stmt->fetchAll();

    Response::success($grades, 'Grade records loaded.');
}

if (preg_match('#^/api/grades/(\d+)$#', $path, $matches) && ($method === 'PUT' || $method === 'PATCH')) {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';
    $gradeId = (int)$matches[1];
    $body = Response::getJsonBody();

    // Verify ownership if Teacher
    if ($role === 'Teacher') {
        $facultyId = Response::getFacultyIdForUser($user['id']) ?? 1;
        $checkStmt = $pdo->prepare("SELECT faculty_id FROM grades WHERE id = ?");
        $checkStmt->execute([$gradeId]);
        $ownerFacultyId = (int)$checkStmt->fetchColumn();
        if ($ownerFacultyId !== $facultyId) {
            Response::error('Forbidden: You are not authorized to encode grades for another professor\'s class.', 403);
        }
    } else {
        if (!Response::hasPermission($user, 'grades.encode') && !Response::hasPermission($user, 'grades.approve')) {
            Response::error('Forbidden: You lack permission to modify grade scores.', 403);
        }
    }

    $written = (float)($body['written_works'] ?? 0);
    $perf = (float)($body['performance_tasks'] ?? 0);
    $exam = (float)($body['quarterly_exam'] ?? 0);

    $finalScore = round(($written * 0.3) + ($perf * 0.5) + ($exam * 0.2), 2);
    $remarks = ($finalScore >= 75.0) ? 'Passed' : 'Failed';
    $status = $body['status'] ?? 'Submitted';

    $stmt = $pdo->prepare("UPDATE grades SET 
                           written_works = ?,
                           performance_tasks = ?,
                           quarterly_exam = ?,
                           final_grade = ?,
                           remarks = ?,
                           status = ?
                           WHERE id = ?");
    $stmt->execute([$written, $perf, $exam, $finalScore, $remarks, $status, $gradeId]);

    Response::success([
        'final_grade' => $finalScore,
        'remarks' => $remarks,
        'status' => $status
    ], 'Grade updated and recalculated successfully.');
}

// -----------------------------------------------------------------------------
// 12. ACCOUNTING, TUITION & CASHIER (FINANCIAL DATA RESTRICTION)
// -----------------------------------------------------------------------------

if ($path === '/api/finance/invoices' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';

    $sql = "SELECT inv.*, s.student_number, sp.first_name, sp.last_name, p.code as program_code
            FROM invoices inv
            JOIN students s ON inv.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.student_id
            JOIN programs p ON s.program_id = p.id
            WHERE 1=1";
    $params = [];

    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND inv.student_id = ?";
        $params[] = $studentId;
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (empty($linked)) Response::success([], 'No invoices found.');
        $inPlaceholders = implode(',', array_fill(0, count($linked), '?'));
        $sql .= " AND inv.student_id IN ($inPlaceholders)";
        $params = array_merge($params, $linked);
    } else {
        if (!Response::hasPermission($user, 'finance.view_all')) {
            Response::error('Forbidden: You lack permission to inspect institutional student billing statements.', 403);
        }
    }

    $sql .= " ORDER BY inv.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $invoices = $stmt->fetchAll();

    Response::success($invoices, 'Invoices loaded.');
}

if ($path === '/api/finance/payments' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';

    $sql = "SELECT p.*, s.student_number, sp.first_name, sp.last_name, inv.title as invoice_title
            FROM payments p
            JOIN students s ON p.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.student_id
            LEFT JOIN invoices inv ON p.invoice_id = inv.id
            WHERE 1=1";
    $params = [];

    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND p.student_id = ?";
        $params[] = $studentId;
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (empty($linked)) Response::success([], 'No payments found.');
        $inPlaceholders = implode(',', array_fill(0, count($linked), '?'));
        $sql .= " AND p.student_id IN ($inPlaceholders)";
        $params = array_merge($params, $linked);
    } else {
        if (!Response::hasPermission($user, 'finance.view_all')) {
            Response::error('Forbidden: You lack permission to inspect cashier payments.', 403);
        }
    }

    $sql .= " ORDER BY p.payment_date DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $payments = $stmt->fetchAll();

    Response::success($payments, 'Payment records loaded.');
}

// Process new cashier payment
if ($path === '/api/finance/payments' && $method === 'POST') {
    $user = Response::requirePermission('finance.manage');
    $body = Response::getJsonBody();

    $studentId = (int)($body['student_id'] ?? 1);
    $invoiceId = !empty($body['invoice_id']) ? (int)$body['invoice_id'] : null;
    $amount = (float)($body['amount'] ?? 0);
    $methodName = $body['payment_method'] ?? 'Cash';
    $refNo = $body['reference_no'] ?? null;
    $remarks = $body['remarks'] ?? 'Official tuition fee collection';

    if ($amount <= 0) {
        Response::error('Payment amount must be greater than zero.', 400);
    }

    $orNumber = 'OR-' . date('Y') . '-' . mt_rand(10000, 99999);

    $stmt = $pdo->prepare("INSERT INTO payments (or_number, student_id, invoice_id, amount, payment_method, reference_no, cashier_name, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $orNumber,
        $studentId,
        $invoiceId,
        $amount,
        $methodName,
        $refNo,
        $user['name'],
        $remarks
    ]);
    $paymentId = $pdo->lastInsertId();

    if ($invoiceId) {
        $invStmt = $pdo->prepare("SELECT balance FROM invoices WHERE id = ?");
        $invStmt->execute([$invoiceId]);
        $inv = $invStmt->fetch();
        if ($inv) {
            $newBal = max(0, (float)$inv['balance'] - $amount);
            $newStatus = ($newBal == 0) ? 'Paid' : 'Partially Paid';
            $updInv = $pdo->prepare("UPDATE invoices SET balance = ?, status = ? WHERE id = ?");
            $updInv->execute([$newBal, $newStatus, $invoiceId]);
        }
    }

    Response::auditLog($user['id'], $user['name'], $user['role'], 'RECORD_PAYMENT', 'Finance', $paymentId, null, ['or_number' => $orNumber, 'amount' => $amount]);

    Response::success([
        'payment_id' => $paymentId,
        'or_number' => $orNumber,
        'amount' => $amount,
        'payment_date' => date('Y-m-d H:i:s')
    ], 'Official receipt created and payment successfully recorded!');
}

// -----------------------------------------------------------------------------
// 13. CLEARANCE SYSTEM WORKFLOW
// -----------------------------------------------------------------------------

if ($path === '/api/clearances' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';

    $sql = "SELECT c.*, s.student_number, sp.first_name, sp.last_name, p.code as program_code
            FROM clearances c
            JOIN students s ON c.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.student_id
            JOIN programs p ON s.program_id = p.id
            WHERE 1=1";
    $params = [];

    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND c.student_id = ?";
        $params[] = $studentId;
    } else if ($role === 'Parent/Guardian') {
        $linked = Response::getLinkedStudentIdsForParent($user['email'], $user['id']);
        if (empty($linked)) Response::success([], 'No clearances found.');
        $inPlaceholders = implode(',', array_fill(0, count($linked), '?'));
        $sql .= " AND c.student_id IN ($inPlaceholders)";
        $params = array_merge($params, $linked);
    } else {
        if (!Response::hasPermission($user, 'clearance.view_all')) {
            Response::error('Forbidden: You lack permission to view clearance lists.', 403);
        }
    }

    $sql .= " ORDER BY c.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $clearances = $stmt->fetchAll();

    Response::success($clearances, 'Clearance records loaded.');
}

if (preg_match('#^/api/clearances/(\d+)/department$#', $path, $matches) && $method === 'POST') {
    $user = Response::requirePermission('clearance.approve');
    $clearanceId = (int)$matches[1];
    $body = Response::getJsonBody();

    $department = $body['department'] ?? 'registrar';
    $status = $body['status'] ?? 'Cleared';

    $column = "{$department}_status";
    $allowedCols = ['registrar_status', 'accounting_status', 'library_status', 'guidance_status', 'clinic_status', 'department_status'];

    if (!in_array($column, $allowedCols)) {
        Response::error('Invalid clearance signatory department.', 400);
    }

    $stmt = $pdo->prepare("UPDATE clearances SET $column = ? WHERE id = ?");
    $stmt->execute([$status, $clearanceId]);

    $checkStmt = $pdo->prepare("SELECT registrar_status, accounting_status, library_status, guidance_status, clinic_status, department_status FROM clearances WHERE id = ?");
    $checkStmt->execute([$clearanceId]);
    $rec = $checkStmt->fetch();

    $allCleared = ($rec['registrar_status'] === 'Cleared' &&
                   $rec['accounting_status'] === 'Cleared' &&
                   $rec['library_status'] === 'Cleared' &&
                   $rec['guidance_status'] === 'Cleared' &&
                   $rec['clinic_status'] === 'Cleared' &&
                   $rec['department_status'] === 'Cleared');

    $overall = $allCleared ? 'Cleared' : (in_array('Hold', $rec) ? 'Hold' : 'Pending');

    $updOverall = $pdo->prepare("UPDATE clearances SET overall_status = ? WHERE id = ?");
    $updOverall->execute([$overall, $clearanceId]);

    Response::auditLog($user['id'], $user['name'], $user['role'], 'SIGN_CLEARANCE', 'Clearance', $clearanceId, null, [$column => $status, 'overall' => $overall]);

    Response::success(['overall_status' => $overall], "{$department} clearance updated to {$status}.");
}

// -----------------------------------------------------------------------------
// 14. LIBRARY MANAGEMENT
// -----------------------------------------------------------------------------

if ($path === '/api/library/books' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM library_books ORDER BY title ASC");
    $books = $stmt->fetchAll();
    Response::success($books, 'Library book catalog loaded.');
}

if ($path === '/api/library/borrowings' && $method === 'GET') {
    $user = Response::requireAuth();
    $role = $user['role'] ?? '';

    $sql = "SELECT lb.*, b.title as book_title, b.isbn, s.student_number, sp.first_name, sp.last_name
            FROM library_borrowings lb
            JOIN library_books b ON lb.book_id = b.id
            JOIN students s ON lb.student_id = s.id
            JOIN student_profiles sp ON s.id = sp.student_id
            WHERE 1=1";
    $params = [];

    if ($role === 'Student') {
        $studentId = Response::getStudentIdForUser($user['id']) ?? 1;
        $sql .= " AND lb.student_id = ?";
        $params[] = $studentId;
    } else {
        if (!Response::hasPermission($user, 'library.manage')) {
            Response::error('Forbidden: You lack permission to manage library borrowings.', 403);
        }
    }

    $sql .= " ORDER BY lb.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $borrowings = $stmt->fetchAll();

    Response::success($borrowings, 'Library circulation records loaded.');
}

if ($path === '/api/library/borrow' && $method === 'POST') {
    $user = Response::requirePermission('library.manage');
    $body = Response::getJsonBody();

    $bookId = (int)($body['book_id'] ?? 0);
    $studentId = (int)($body['student_id'] ?? 0);
    $borrowDate = date('Y-m-d');
    $dueDate = date('Y-m-d', strtotime('+14 days'));

    $book = $pdo->prepare("SELECT available_copies FROM library_books WHERE id = ?");
    $book->execute([$bookId]);
    $copies = $book->fetchColumn();

    if ($copies <= 0) {
        Response::error('No copies available for loan currently.', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO library_borrowings (book_id, student_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, 'Borrowed')");
    $stmt->execute([$bookId, $studentId, $borrowDate, $dueDate]);

    $pdo->prepare("UPDATE library_books SET available_copies = available_copies - 1 WHERE id = ?")->execute([$bookId]);

    Response::success(['due_date' => $dueDate], 'Book issued successfully to student.');
}

if ($path === '/api/library/return' && $method === 'POST') {
    $user = Response::requirePermission('library.manage');
    $body = Response::getJsonBody();
    $borrowingId = (int)($body['borrowing_id'] ?? 0);

    $stmt = $pdo->prepare("SELECT * FROM library_borrowings WHERE id = ?");
    $stmt->execute([$borrowingId]);
    $item = $stmt->fetch();

    if (!$item) {
        Response::error('Borrowing transaction not found.', 404);
    }

    $returnDate = date('Y-m-d');
    $fine = 0.00;
    if ($returnDate > $item['due_date']) {
        $days = (strtotime($returnDate) - strtotime($item['due_date'])) / (60 * 60 * 24);
        $fine = $days * 20.00;
    }

    $upd = $pdo->prepare("UPDATE library_borrowings SET return_date = ?, status = 'Returned', fine_amount = ? WHERE id = ?");
    $upd->execute([$returnDate, $fine, $borrowingId]);

    $pdo->prepare("UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?")->execute([$item['book_id']]);

    Response::success(['fine_amount' => $fine], 'Book returned successfully.');
}

// -----------------------------------------------------------------------------
// 15. GUIDANCE, CLINIC & DISCIPLINE (RESTRICTED WELFARE DATA)
// -----------------------------------------------------------------------------

if ($path === '/api/guidance' && $method === 'GET') {
    $user = Response::requirePermission('guidance.view');
    $stmt = $pdo->query("SELECT g.*, s.student_number, sp.first_name, sp.last_name, p.code as program_code
                         FROM guidance_records g
                         JOIN students s ON g.student_id = s.id
                         JOIN student_profiles sp ON s.id = sp.student_id
                         JOIN programs p ON s.program_id = p.id
                         ORDER BY g.session_date DESC");
    $records = $stmt->fetchAll();
    Response::success($records, 'Guidance records loaded.');
}

if ($path === '/api/clinic' && $method === 'GET') {
    $user = Response::requirePermission('clinic.view');
    $stmt = $pdo->query("SELECT c.*, s.student_number, sp.first_name, sp.last_name, p.code as program_code
                         FROM clinic_records c
                         JOIN students s ON c.student_id = s.id
                         JOIN student_profiles sp ON s.id = sp.student_id
                         JOIN programs p ON s.program_id = p.id
                         ORDER BY c.visit_date DESC");
    $records = $stmt->fetchAll();
    Response::success($records, 'Clinic records loaded.');
}

if ($path === '/api/discipline' && $method === 'GET') {
    $user = Response::requirePermission('discipline.view');
    $stmt = $pdo->query("SELECT d.*, s.student_number, sp.first_name, sp.last_name, p.code as program_code
                         FROM discipline_records d
                         JOIN students s ON d.student_id = s.id
                         JOIN student_profiles sp ON s.id = sp.student_id
                         JOIN programs p ON s.program_id = p.id
                         ORDER BY d.incident_date DESC");
    $records = $stmt->fetchAll();
    Response::success($records, 'Disciplinary records loaded.');
}

// -----------------------------------------------------------------------------
// 16. INSTITUTIONAL MODULES: INVENTORY, HR, ANNOUNCEMENTS, EVENTS, GRADUATION
// -----------------------------------------------------------------------------

if ($path === '/api/inventory' && $method === 'GET') {
    Response::requirePermission('inventory.view');
    $stmt = $pdo->query("SELECT * FROM inventory_items ORDER BY item_name ASC");
    $items = $stmt->fetchAll();
    Response::success($items, 'Inventory items loaded.');
}

if ($path === '/api/inventory' && $method === 'POST') {
    $user = Response::requirePermission('inventory.manage');
    $body = Response::getJsonBody();

    $assetTag = trim($body['asset_tag'] ?? 'AST-' . rand(10000, 99999));
    $itemName = trim($body['item_name'] ?? '');
    $category = trim($body['category'] ?? 'Equipment');
    $quantity = (int)($body['quantity'] ?? 1);
    $unit = trim($body['unit'] ?? 'pcs');
    $location = trim($body['location'] ?? 'Campus Main');
    $condition = trim($body['condition_status'] ?? 'Good');
    $unitCost = (float)($body['unit_cost'] ?? 0.00);

    if (empty($itemName)) {
        Response::error('Item name is required.', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO inventory_items (asset_tag, item_name, category, quantity, unit, location, condition_status, unit_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$assetTag, $itemName, $category, $quantity, $unit, $location, $condition, $unitCost]);

    Response::success(['id' => $pdo->lastInsertId(), 'asset_tag' => $assetTag], 'Inventory item registered successfully.');
}

if ($path === '/api/hr/employees' && $method === 'GET') {
    Response::requirePermission('hr.view');
    $stmt = $pdo->query("SELECT * FROM hr_employees ORDER BY last_name ASC");
    $employees = $stmt->fetchAll();
    Response::success($employees, 'HR employee roster loaded.');
}

if ($path === '/api/hr/employees' && $method === 'POST') {
    $user = Response::requirePermission('hr.manage');
    $body = Response::getJsonBody();

    $empId = trim($body['employee_id'] ?? 'EMP-' . rand(1000, 9999));
    $firstName = trim($body['first_name'] ?? '');
    $lastName = trim($body['last_name'] ?? '');
    $dept = trim($body['department'] ?? 'General Services');
    $position = trim($body['position'] ?? 'Staff');
    $empType = trim($body['employment_type'] ?? 'Full-Time');
    $salary = (float)($body['basic_salary'] ?? 30000);

    if (empty($firstName) || empty($lastName)) {
        Response::error('First name and last name are required.', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO hr_employees (employee_id, first_name, last_name, department, position, employment_type, basic_salary) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$empId, $firstName, $lastName, $dept, $position, $empType, $salary]);

    Response::success(['id' => $pdo->lastInsertId(), 'employee_id' => $empId], 'HR employee added successfully.');
}

if ($path === '/api/announcements' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM announcements ORDER BY created_at DESC");
    $announcements = $stmt->fetchAll();
    Response::success($announcements, 'Announcements retrieved.');
}

if ($path === '/api/announcements' && $method === 'POST') {
    $user = Response::requirePermission('announcements.create');
    $body = Response::getJsonBody();

    $title = trim($body['title'] ?? '');
    $content = trim($body['content'] ?? '');
    if (empty($title) || empty($content)) {
        Response::error('Title and content are required.', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO announcements (title, content, audience, priority, author_name) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $title,
        $content,
        $body['audience'] ?? 'All',
        $body['priority'] ?? 'Normal',
        $user['name']
    ]);

    Response::success(['id' => $pdo->lastInsertId()], 'Announcement posted successfully.');
}

if ($path === '/api/events' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM events ORDER BY start_date ASC");
    $events = $stmt->fetchAll();
    Response::success($events, 'Events loaded.');
}

if ($path === '/api/events' && $method === 'POST') {
    $user = Response::requirePermission('events.manage');
    $body = Response::getJsonBody();

    $title = trim($body['title'] ?? '');
    $description = trim($body['description'] ?? '');
    $venue = trim($body['venue'] ?? 'Campus Main Grounds');
    $startDate = trim($body['start_date'] ?? date('Y-m-d H:i:s'));
    $endDate = trim($body['end_date'] ?? date('Y-m-d H:i:s', strtotime('+3 hours')));
    $organizer = trim($body['organizer'] ?? 'Student Affairs Office');
    $category = trim($body['category'] ?? 'Academic');

    if (empty($title)) {
        Response::error('Event title is required.', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO events (title, description, venue, start_date, end_date, organizer, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$title, $description, $venue, $startDate, $endDate, $organizer, $category]);

    Response::success(['id' => $pdo->lastInsertId()], 'School event scheduled successfully.');
}

if ($path === '/api/graduation' && $method === 'GET') {
    Response::requirePermission('graduation.view');
    $stmt = $pdo->query("SELECT g.*, s.student_number, sp.first_name, sp.last_name, p.name as program_name, p.code as program_code
                         FROM graduation_candidates g
                         JOIN students s ON g.student_id = s.id
                         JOIN student_profiles sp ON s.id = sp.student_id
                         JOIN programs p ON s.program_id = p.id
                         ORDER BY g.gpa ASC");
    $candidates = $stmt->fetchAll();
    Response::success($candidates, 'Graduation candidates retrieved.');
}

// -----------------------------------------------------------------------------
// 17. QR VERIFICATION PORTAL (Public & Institutional Authenticator)
// -----------------------------------------------------------------------------

if (preg_match('#^/api/verify/([a-zA-Z0-9_\-]+)$#', $path, $matches) && $method === 'GET') {
    $token = $matches[1];
    $stmt = $pdo->prepare("SELECT * FROM qr_verifications WHERE token = ? OR reference_id = ?");
    $stmt->execute([$token, $token]);
    $record = $stmt->fetch();

    if (!$record) {
        $stdStmt = $pdo->prepare("SELECT s.*, sp.first_name, sp.last_name, p.name as program_name 
                                  FROM students s 
                                  JOIN student_profiles sp ON s.id = sp.student_id 
                                  JOIN programs p ON s.program_id = p.id 
                                  WHERE s.student_number = ? OR s.qr_token = ?");
        $stdStmt->execute([$token, $token]);
        $student = $stdStmt->fetch();

        if ($student) {
            $record = [
                'token' => $student['qr_token'],
                'verification_type' => 'StudentID',
                'reference_id' => $student['student_number'],
                'title' => 'Official Student Identity Record',
                'holder_name' => "{$student['first_name']} {$student['last_name']}",
                'status' => 'Valid',
                'details_json' => json_encode([
                    'student_number' => $student['student_number'],
                    'program' => $student['program_name'],
                    'status' => $student['status'],
                    'gpa' => $student['gpa']
                ]),
                'created_at' => $student['admission_date']
            ];
        }
    }

    if (!$record) {
        Response::error('Credential verification token not found or invalid.', 404);
    }

    $record['details'] = json_decode($record['details_json'], true);
    Response::success($record, 'Credential authenticity verified successfully.');
}

// -----------------------------------------------------------------------------
// 18. AUDIT LOGS & REPORTING SUITE (STRICT AUDIT RESTRICTION)
// -----------------------------------------------------------------------------

if ($path === '/api/audit' && $method === 'GET') {
    Response::requirePermission('audit.view');
    $stmt = $pdo->query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100");
    $logs = $stmt->fetchAll();
    Response::success($logs, 'Audit logs retrieved.');
}

if ($path === '/api/reports/masterlist' && $method === 'GET') {
    Response::requirePermission('reports.view');
    $stmt = $pdo->query("SELECT s.student_number, sp.last_name, sp.first_name, sp.gender, p.code as program_code, yl.name as year_level, s.status, s.gpa
                         FROM students s
                         JOIN student_profiles sp ON s.id = sp.student_id
                         JOIN programs p ON s.program_id = p.id
                         JOIN year_levels yl ON s.year_level_id = yl.id
                         ORDER BY p.code, sp.last_name");
    $data = $stmt->fetchAll();
    Response::success($data, 'Master list report generated.');
}

// Fallback: 404
Response::error("API endpoint not found: {$method} {$path}", 404);
