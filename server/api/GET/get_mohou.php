<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");

// ตรวจสอบว่ามีการส่งค่า planid มาหรือไม่
if (!isset($_GET['planid']) || empty($_GET['planid'])) {
    echo json_encode(["status" => "error", "message" => "planid not provided"]);
    exit;
}

$planid = $_GET['planid'];

try {
    // เตรียมคำสั่ง SQL โดยใช้ prepared statement เพื่อลดความเสี่ยงจาก SQL Injection
    $stmt = $conn->prepare("SELECT * FROM subject WHERE planid = :planid");
    $stmt->bindParam(":planid", $planid, PDO::PARAM_STR);
    $stmt->execute();

    // ดึงข้อมูลทั้งหมดในรูปแบบ associative array
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
