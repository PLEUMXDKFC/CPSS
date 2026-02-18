<?php
// server/api/POST/InsertTeacher.php

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

// เชื่อมต่อฐานข้อมูล
require_once dirname(__FILE__) . '/../conn.php'; 

try {
    // รับข้อมูล JSON
    $data = json_decode(file_get_contents("php://input"));

    // ตรวจสอบข้อมูล (Validation)
    if (
        !isset($data->prefix) ||
        !isset($data->fname) ||
        !isset($data->lname) ||
        empty($data->fname) ||
        empty($data->lname)
    ) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลไม่ครบถ้วน (กรุณาระบุ คำนำหน้า, ชื่อ, นามสกุล)']);
        exit();
    }

    // ตรวจสอบข้อมูลซ้ำ (ชื่อ + นามสกุล)
    $checkSql = "SELECT COUNT(*) FROM teacher_info WHERE fname = :fname AND lname = :lname";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bindParam(':fname', $data->fname);
    $checkStmt->bindParam(':lname', $data->lname);
    $checkStmt->execute();
    if ($checkStmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลครูผู้สอนนี้มีอยู่ในระบบแล้ว (ชื่อ-นามสกุลซ้ำ)']);
        exit();
    }

    // เตรียม SQL
    $sql = "INSERT INTO teacher_info (prefix, fname, lname, department) 
            VALUES (:prefix, :fname, :lname, :department)";
    
    $stmt = $conn->prepare($sql);

    // Bind ค่า (จัดการค่าว่างเป็น NULL)
    $department = !empty($data->department) ? $data->department : null;

    $stmt->bindParam(':prefix', $data->prefix);
    $stmt->bindParam(':fname', $data->fname);
    $stmt->bindParam(':lname', $data->lname);
    $stmt->bindParam(':department', $department);

    // Execute
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'บันทึกข้อมูลครูผู้สอนสำเร็จ']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถบันทึกข้อมูลได้']);
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