<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173"); // อนุญาตเฉพาะโดเมนนี้
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // อนุญาต method ที่ใช้
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // อนุญาต headers ที่ใช้
header("Content-Type: application/json; charset=UTF-8");

try {
    // รับข้อมูลจาก client ในรูปแบบ JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // ตรวจสอบการเชื่อมต่อฐานข้อมูล
    if (!$conn) {
        echo json_encode(["status" => "error", "message" => "Database connection failed"]);
        exit;  // หยุดการทำงานหากเชื่อมต่อฐานข้อมูลไม่สำเร็จ
    }

    // ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งมาครบถ้วนหรือไม่
    if (isset($data['course_code'], $data['course_name'], $data['theory'], $data['comply'], $data['credit'], $data['subject_category'], $data['planid'], $data['subject_groups'])) {
        
        // ตรวจสอบว่ามีชื่อวิชาซ้ำในหลักสูตรเดียวกันหรือไม่
        $checkStmt = $conn->prepare("SELECT COUNT(*) FROM subject WHERE course_name = :course_name AND planid = :planid");
        $checkStmt->bindParam(":course_name", $data['course_name']);
        $checkStmt->bindParam(":planid", $data['planid']);
        $checkStmt->execute();
        
        if ($checkStmt->fetchColumn() > 0) {
            http_response_code(409); // Conflict
            echo json_encode(["status" => "error", "message" => "ชื่อวิชาซ้ำกันในหลักสูตรนี่้"]);
            exit;
        }

        // เตรียมคำสั่ง SQL สำหรับเพิ่มข้อมูล
        $stmt = $conn->prepare("INSERT INTO subject (course_code, course_name, theory, comply, credit, subject_category, planid, subject_groups) VALUES (:course_code, :course_name, :theory, :comply, :credit, :subject_category, :planid, :subject_groups)");

        // ผูกค่าตัวแปรกับ placeholder
        $stmt->bindParam(":course_code", $data['course_code']);
        $stmt->bindParam(":course_name", $data['course_name']);
        $stmt->bindParam(":theory", $data['theory']);
        $stmt->bindParam(":comply", $data['comply']);
        $stmt->bindParam(":credit", $data['credit']);
        $stmt->bindParam(":subject_category", $data['subject_category']);
        $stmt->bindParam(":subject_groups", $data['subject_groups']);
        $stmt->bindParam(":planid", $data['planid']);

        // ดำเนินการเพิ่มข้อมูล
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Data inserted successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error inserting data"]);
        }
    } else {
        // ส่งข้อความผิดพลาดหากข้อมูลไม่ครบถ้วน
        echo json_encode(["status" => "error", "message" => "Invalid data received"]);
    }
} catch (Exception $e) {
    // จัดการข้อผิดพลาดที่เกิดขึ้น
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

exit; // หยุดการทำงานเพื่อป้องกันการส่ง output เพิ่มเติม
?>