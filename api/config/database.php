<?php
// api/config/database.php

class Database {
    private static $host;
    private static $port;
    private static $db_name;
    private static $username;
    private static $password;
    private static $pdo = null;

    public static function getConnection() {
        // Read credentials from environment variables (loaded from .env)
        self::$host     = $_ENV['DB_HOST']  ?? '127.0.0.1';
        self::$port     = $_ENV['DB_PORT']  ?? '3306';
        self::$db_name  = $_ENV['DB_NAME']  ?? 'school_information_system';
        self::$username = $_ENV['DB_USER']  ?? 'root';
        self::$password = $_ENV['DB_PASS']  ?? '';

        if (self::$pdo === null) {
            try {
                // First ensure database exists
                $dsnWithoutDb = "mysql:host=" . self::$host . ";port=" . self::$port . ";charset=utf8mb4";
                $initPdo = new PDO($dsnWithoutDb, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                $initPdo->exec("CREATE DATABASE IF NOT EXISTS `" . self::$db_name . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

                // Now connect to the database
                $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$db_name . ";charset=utf8mb4";
                self::$pdo = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                header("Access-Control-Allow-Origin: *");
                header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
                header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'Database connection failed: ' . $e->getMessage() . '. Please verify MySQL is running in XAMPP.'
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }
        }
        return self::$pdo;
    }
}
