<?php
// api/config/jwt.php

class JWT {
    private static function getSecret(): string {
        $secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET');
        if (empty($secret)) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Server misconfiguration: JWT_SECRET is not set.']);
            exit;
        }
        return $secret;
    }

    public static function encode($payload, $expirySeconds = 86400 * 7) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iat'] = time();
        $payload['exp'] = time() + $expirySeconds;
        $payloadJson = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payloadJson);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::getSecret(), true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($token) {
        if (!$token) return null;
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        list($header, $payload, $signature) = $parts;
        $expectedSig = hash_hmac('sha256', $header . "." . $payload, self::getSecret(), true);
        $expectedBase64 = self::base64UrlEncode($expectedSig);

        if (!hash_equals($expectedBase64, $signature)) {
            return null;
        }

        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        if (!$payloadData) return null;

        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return null; // Expired
        }

        return $payloadData;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
