<?php
// server/api/UPDATE/UpdateRoom.php

// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: PUT, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once dirname(__FILE__) . '/../conn.php';

try {
    // รองรับทั้ง PUT และ POST
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed'
        ]);
        exit();
    }

    // รับข้อมูล JSON
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'รูปแบบข้อมูลไม่ถูกต้อง']);
        exit;
    }

    $room_id = isset($data['room_id']) ? (int)$data['room_id'] : 0;
    $room_name = trim($data['room_name'] ?? '');
    $room_type = trim($data['room_type'] ?? 'Lecture');

    // Validation
    if ($room_id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ไม่พบรหัสห้องที่ต้องการแก้ไข']);
        exit;
    }

    if ($room_name === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'กรุณาระบุชื่อห้องเรียน']);
        exit;
    }

    // เตรียม SQL
    $sql = "UPDATE room 
            SET room_name = :room_name, room_type = :room_type
            WHERE room_id = :room_id";
    
    $stmt = $conn->prepare($sql);

    $stmt->bindParam(':room_id', $room_id, PDO::PARAM_INT);
    $stmt->bindParam(':room_name', $room_name);
    $stmt->bindParam(':room_type', $room_type);

    // Execute
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'อัปเดตข้อมูลห้องเรียนสำเร็จ']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'ไม่พบห้องเรียนที่ต้องการอัปเดต']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถอัปเดตข้อมูลได้']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn = null;
?>
