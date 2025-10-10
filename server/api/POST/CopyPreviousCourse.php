<?php
include '../conn.php'; // เชื่อมต่อฐานข้อมูลผ่าน PDO

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['currentPlanid'])) {
    echo json_encode(["success" => false, "message" => "ไม่มีข้อมูลแผนปัจจุบัน"]);
    exit;
}

$currentPlanid = intval($data['currentPlanid']);

try {
    // ดึงปีและหลักสูตรของแผนปัจจุบัน
    $stmt = $conn->prepare("SELECT year, course FROM study_plans WHERE planid = ?");
    $stmt->execute([$currentPlanid]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["success" => false, "message" => "ไม่พบข้อมูลแผนปัจจุบัน"]);
        exit;
    }

    $currentYear = intval($row['year']);
    $currentCourse = $row['course'];
    $previousYear = $currentYear - 1;

    // หา planid ของปีที่แล้วที่มี course ตรงกัน
    $stmt = $conn->prepare("SELECT planid FROM study_plans WHERE year = ? AND course = ?");
    $stmt->execute([$previousYear, $currentCourse]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["success" => false, "message" => "ไม่พบข้อมูลปีที่แล้วที่มีหลักสูตรเดียวกัน"]);
        exit;
    }

    $previousPlanid = intval($row['planid']);

    // คัดลอกข้อมูลรายวิชาจากปีที่แล้ว
    $stmt = $conn->prepare("
        INSERT INTO subject (course_code, course_name, theory, comply, credit, subject_category, subject_groups, planid)
        SELECT course_code, course_name, theory, comply, credit, subject_category, subject_groups, ?
        FROM subject WHERE planid = ?
    ");
    
    $success = $stmt->execute([$currentPlanid, $previousPlanid]);

    if ($success) {
        echo json_encode(["success" => true, "message" => "คัดลอกข้อมูลสำเร็จ"]);
    } else {
        echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาดในการคัดลอกข้อมูล"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาด: " . $e->getMessage()]);
}

$conn = null; // ปิดการเชื่อมต่อฐานข้อมูล
?>
