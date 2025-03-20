<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");

// ตรวจสอบว่าค่า planid และ subject_groups ถูกส่งมาหรือไม่
if (!isset($_GET['planid']) || !isset($_GET['subject_groups'])) {
    echo json_encode(["status" => "error", "message" => "planid and subject_groups are required"]);
    exit();
}

// รับค่า planid และ subject_groups จาก query parameters
$planid = $_GET['planid'];
$subject_groups = $_GET['subject_groups'];
$subject_category = $_GET['subject_category'];

try {
    // เตรียมคำสั่ง SQL เพื่อดึงข้อมูลตาม planid และ subject_groups
    $stmt = $conn->prepare("SELECT * FROM subject WHERE planid = :planid AND subject_groups = :subject_groups AND subject_category = :subject_category");
    $stmt->bindParam(':planid', $planid);
    $stmt->bindParam(':subject_groups', $subject_groups);
    $stmt->bindParam(':subject_category', $subject_category);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (empty($result)) {
        echo json_encode([]); // ส่ง array ว่างหากไม่มีข้อมูล
    } else {
        echo json_encode($result); // ส่งข้อมูลกลับในรูปแบบ JSON
    }
} catch (Exception $e) {
    // จัดการข้อผิดพลาด
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>