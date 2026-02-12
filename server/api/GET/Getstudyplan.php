<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");

try {
    if (isset($_GET['mode']) && $_GET['mode'] === 'subjects' && isset($_GET['planid'])) {
        // ดึงรายวิชา (Subjects) สำหรับ Modal เลือก
        $planid = intval($_GET['planid']);
        $stmt = $conn->prepare("SELECT * FROM subject WHERE planid = ?");
        $stmt->execute([$planid]);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // ดึงแผนการเรียน (Plans) ตามปกติ
        $stmt = $conn->prepare("
            SELECT * FROM study_plans 
            ORDER BY 
                year DESC, 
                student_id DESC,
                FIELD(course, 
                    'หลักสูตรประกาศนียบัตรวิชาชีพ', 
                    'หลักสูตรประกาศนียบัตรวิชาชีพขั้นสูง', 
                    'หลักสูตรประกาศนียบัตรวิชาชีพขั้นสูง (ม.6)'
                )
        ");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
