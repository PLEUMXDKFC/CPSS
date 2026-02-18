<?php
// server/api/UPDATE/UpdateTeacher.php

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

// เชื่อมต่อฐานข้อมูล
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
    $data = json_decode(file_get_contents("php://input"));

    // ตรวจสอบข้อมูล (Validation)
    if (
        !isset($data->teacher_id) ||
        !isset($data->prefix) ||
        !isset($data->fname) ||
        !isset($data->lname) ||
        empty($data->teacher_id) ||
        empty($data->fname) ||
        empty($data->lname)
    ) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ครบถ้วน (กรุณาระบุ teacher_id, คำนำหน้า, ชื่อ, นามสกุล)']);
        exit();
    }

    // ตรวจสอบข้อมูลซ้ำ (ชื่อ + นามสกุล ยกเว้นตัวเอง)
    $checkSql = "SELECT COUNT(*) FROM teacher_info WHERE fname = :fname AND lname = :lname AND teacher_id != :teacher_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':fname', $data->fname);
    $checkStmt->bindParam(':lname', $data->lname);
    $checkStmt->bindParam(':teacher_id', $data->teacher_id, PDO::PARAM_INT);
    $checkStmt->execute();
    if ($checkStmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลครูผู้สอนนี้มีอยู่ในระบบแล้ว (ชื่อ-นามสกุลซ้ำ)']);
        exit();
    }

    // เตรียม SQL
    $sql = "UPDATE teacher_info 
            SET prefix = :prefix, fname = :fname, lname = :lname, department = :department
            WHERE teacher_id = :teacher_id";
    
    $stmt = $conn->prepare($sql);

    // Bind ค่า
    $department = !empty($data->department) ? $data->department : null;

    $stmt->bindParam(':teacher_id', $data->teacher_id, PDO::PARAM_INT);
    $stmt->bindParam(':prefix', $data->prefix);
    $stmt->bindParam(':fname', $data->fname);
    $stmt->bindParam(':lname', $data->lname);
    $stmt->bindParam(':department', $department);

    // Execute
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'อัปเดตข้อมูลครูผู้สอนสำเร็จ']);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'ไม่พบครูผู้สอนที่ต้องการอัปเดต']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถอัปเดตข้อมูลได้']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
}

$conn = null;
?>
