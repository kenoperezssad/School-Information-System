<?php
// api/helpers/response.php

require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/database.php';

class Response {
    public static function initCors() {
        // Allow CORS for local dev
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
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
            self::error('Unauthorized. Please log in.', 401);
        }
        if (!empty($allowedRoles)) {
            $userRole = $user['role'] ?? '';
            // Super Admin always allowed
            if ($userRole !== 'Super Administrator' && !in_array($userRole, $allowedRoles)) {
                self::error('Forbidden: You do not have permission to perform this action.', 403);
            }
        }
        return $user;
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
