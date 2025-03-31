<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");

if (!isset($_GET['planid']) || empty($_GET['planid'])) {
    echo json_encode(["status" => "error", "message" => "Missing or empty planid"]);
    exit();
}

$planid = $_GET['planid'];

try {
    // ดึงข้อมูลที่ต้องการจากตาราง study_plans
    $stmt = $conn->prepare("SELECT course, student_id FROM study_plans WHERE planid = ?");
    $stmt->execute([$planid]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        echo json_encode(["status" => "error", "message" => "No data found"]);
    } else {
        // ส่งกลับข้อมูล plan_name และ plan_code
        echo json_encode([
            "plan_name" => $result['course'],  // ชื่อแผนการเรียน
            "plan_code" => $result['student_id']   // รหัสแผนการเรียน
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
