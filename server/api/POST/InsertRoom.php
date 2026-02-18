<?php
// server/api/POST/InsertRoom.php

// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once dirname(__FILE__) . '/../conn.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'รูปแบบข้อมูลไม่ถูกต้อง']);
        exit;
    }

    $room_name = trim($data['room_name'] ?? '');
    $room_type = trim($data['room_type'] ?? 'Lecture');

    if ($room_name === '') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'กรุณาระบุชื่อห้องเรียน']);
        exit;
    }

    // ตรวจสอบข้อมูลซ้ำ (ชื่อห้อง + ประเภทห้อง)
    $checkSql = "SELECT COUNT(*) FROM room WHERE room_name = :room_name AND room_type = :room_type";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':room_name', $room_name);
    $checkStmt->bindParam(':room_type', $room_type);
    $checkStmt->execute();
    if ($checkStmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลห้องเรียนนี้มีอยู่ในระบบแล้ว (ชื่อห้องและประเภทห้องซ้ำ)']);
        exit();
    }

    $sql = "INSERT INTO room (room_name, room_type)
            VALUES (:room_name, :room_type)";
    $stmt = $conn->prepare($sql);

    $stmt->bindParam(':room_name', $room_name);
    $stmt->bindParam(':room_type', $room_type);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'บันทึกข้อมูลห้องเรียนสำเร็จ']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถบันทึกข้อมูลได้']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn = null;
?>
