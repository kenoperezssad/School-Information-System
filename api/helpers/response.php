<?php
// api/helpers/response.php

require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/database.php';

class Response {
    private static $cachedPermissions = [];

    public static function initCors() {
        $defaultOrigins = 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174';
        $allowedOrigins = array_map('trim', explode(',', $_ENV['CORS_ORIGINS'] ?? $defaultOrigins));
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (in_array($origin, $allowedOrigins, true) || preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)) {
            header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
            header("Access-Control-Allow-Credentials: true");
        }
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        header('Content-Type: application/json; charset=UTF-8');
    }

    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($data = null, $message = 'Operation successful', $statusCode = 200) {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    public static function error($message = 'An error occurred', $statusCode = 400, $errors = null) {
        self::json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);
    }

    public static function getJsonBody() {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }

    public static function getAuthUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $decoded = JWT::decode($token);
            if ($decoded) {
                return $decoded;
            }
        }
        return null;
    }

    public static function requireAuth($allowedRoles = []) {
        $user = self::getAuthUser();
        if (!$user) {
            self::error('Unauthorized: Please log in to continue.', 401);
        }
        if (!empty($allowedRoles)) {
            $userRole = $user['role'] ?? '';
            // Super Admin always allowed
            if ($userRole !== 'Super Administrator' && !in_array($userRole, $allowedRoles)) {
                self::error('Forbidden: Your role (' . $userRole . ') is not authorized for this action.', 403);
            }
        }
        return $user;
    }

    public static function getPermissionsForUser($user) {
        if (!$user) return [];
        $role = $user['role'] ?? '';
        if (isset(self::$cachedPermissions[$role])) {
            return self::$cachedPermissions[$role];
        }

        $pdo = Database::getConnection();
        if ($role === 'Super Administrator') {
            // Super Admin gets all permissions
            $stmt = $pdo->query("SELECT name FROM permissions");
            $perms = $stmt->fetchAll(PDO::FETCH_COLUMN);
            self::$cachedPermissions[$role] = $perms;
            return $perms;
        }

        $stmt = $pdo->prepare("
            SELECT p.name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN roles r ON rp.role_id = r.id
            WHERE r.name = ?
        ");
        $stmt->execute([$role]);
        $perms = $stmt->fetchAll(PDO::FETCH_COLUMN);
        self::$cachedPermissions[$role] = $perms;
        return $perms;
    }

    public static function hasPermission($user, $permissionName) {
        if (!$user) return false;
        if (($user['role'] ?? '') === 'Super Administrator') return true;
        $perms = self::getPermissionsForUser($user);
        return in_array($permissionName, $perms);
    }

    public static function requirePermission($permissionName) {
        $user = self::requireAuth();
        if (!self::hasPermission($user, $permissionName)) {
            self::error("Forbidden: You lack the required permission ('$permissionName') to access this resource.", 403);
        }
        return $user;
    }

    // -------------------------------------------------------------------------
    // RECORD-LEVEL & DATA-LEVEL AUTHORIZATION HELPERS
    // -------------------------------------------------------------------------

    public static function getStudentIdForUser($userId) {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id FROM students WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $res = $stmt->fetch();
        return $res ? (int)$res['id'] : null;
    }

    public static function getFacultyIdForUser($userId) {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id FROM faculty WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $res = $stmt->fetch();
        return $res ? (int)$res['id'] : null;
    }

    public static function getLinkedStudentIdsForParent($userEmail, $userId = null) {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT student_id FROM student_guardians WHERE email = ?");
        $stmt->execute([$userEmail]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public static function isStudentAssignedToFaculty($studentId, $facultyId) {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as cnt 
            FROM enrollment_subjects es
            JOIN enrollments e ON es.enrollment_id = e.id
            JOIN schedules s ON es.schedule_id = s.id
            WHERE e.student_id = ? AND s.faculty_id = ?
        ");
        $stmt->execute([$studentId, $facultyId]);
        $res = $stmt->fetch();
        if ($res && (int)$res['cnt'] > 0) return true;

        // Also check if teacher advises section or teaches any subject in student's section
        $stmt2 = $pdo->prepare("
            SELECT COUNT(*) as cnt
            FROM students st
            JOIN schedules sc ON st.section_id = sc.section_id
            WHERE st.id = ? AND sc.faculty_id = ?
        ");
        $stmt2->execute([$studentId, $facultyId]);
        $res2 = $stmt2->fetch();
        return ($res2 && (int)$res2['cnt'] > 0);
    }

    public static function auditLog($userId, $userName, $role, $action, $module, $recordId = null, $oldValues = null, $newValues = null) {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO audit_logs (user_id, user_name, role, action, module, record_id, old_values, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
            $stmt->execute([
                $userId,
                $userName,
                $role,
                $action,
                $module,
                $recordId ? (string)$recordId : null,
                is_array($oldValues) ? json_encode($oldValues) : (string)$oldValues,
                is_array($newValues) ? json_encode($newValues) : (string)$newValues,
                $ip,
                $ua
            ]);
        } catch (Exception $e) {
            // Fail silently so audit log failure does not break core business flow
        }
    }
}
