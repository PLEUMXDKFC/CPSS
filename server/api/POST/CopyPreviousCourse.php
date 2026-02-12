<?php
include '../conn.php';
header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['currentPlanid'])) {
    echo json_encode(["success" => false, "message" => "ไม่มีข้อมูลแผนปัจจุบัน"]);
    exit;
}

$currentPlanid = intval($data['currentPlanid']);
$selectedSubjects = isset($data['selectedSubjects']) ? $data['selectedSubjects'] : [];

try {
    if (!empty($selectedSubjects)) {
        // กรณีมีการเลือกวิชา (Interactive Mode)
        $placeholders = implode(',', array_fill(0, count($selectedSubjects), '?'));
        
        $sql = "INSERT INTO subject (course_code, course_name, theory, comply, credit, subject_category, subject_groups, planid)
                SELECT course_code, course_name, theory, comply, credit, subject_category, subject_groups, ? 
                FROM subject 
                WHERE subject_id IN ($placeholders)";
                
        $stmt = $conn->prepare($sql);
        $params = array_merge([$currentPlanid], $selectedSubjects);
        $success = $stmt->execute($params);

        if ($success) {
            echo json_encode(["success" => true, "message" => "คัดลอกข้อมูลรายวิชาเรียบร้อยแล้ว"]);
        } else {
            echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาดในการบันทึกข้อมูล"]);
        }

    } else {
        // กรณีไม่มีการเลือกวิชา (Fallback / Auto Mode) - ใช้ Logic student_id
        
        // 1. ดึงข้อมูลแผนปัจจุบันเพื่อหา student_id
        $stmt = $conn->prepare("SELECT student_id, course FROM study_plans WHERE planid = ?");
        $stmt->execute([$currentPlanid]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            echo json_encode(["success" => false, "message" => "ไม่พบข้อมูลแผนปัจจุบัน"]);
            exit;
        }

        $currentStudentId = intval($row['student_id']);
        $currentCourse = $row['course'];
        $previousStudentId = $currentStudentId - 1;

        // 2. หา planid ของปีที่แล้ว (student_id - 1)
        $stmt = $conn->prepare("SELECT planid FROM study_plans WHERE student_id = ? AND course = ?");
        $stmt->execute([$previousStudentId, $currentCourse]);
        $prevRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$prevRow) {
            echo json_encode(["success" => false, "message" => "ไม่พบข้อมูลปีที่แล้วที่มีหลักสูตรเดียวกัน"]);
            exit;
        }

        $previousPlanid = intval($prevRow['planid']);

        // 3. คัดลอกข้อมูลทั้งหมด
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
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาด: " . $e->getMessage()]);
}

$conn = null;
?>
