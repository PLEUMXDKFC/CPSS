<?php
// server/api/Delete/DeleteRoom.php

// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
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

    $room_id = isset($data['room_id']) ? (int)$data['room_id'] : 0;

    if ($room_id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ไม่พบรหัสห้องที่ต้องการลบ']);
        exit;
    }

    $sql = "DELETE FROM room WHERE room_id = :room_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':room_id', $room_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(['status' => 'success', 'message' => 'ลบข้อมูลห้องเรียนสำเร็จ']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'ไม่พบห้องเรียนที่ต้องการลบ']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถลบข้อมูลได้']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn = null;
?>
