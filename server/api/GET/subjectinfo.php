<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once("../conn.php");

try {
    $planid = isset($_GET['planid']) ? intval($_GET['planid']) : 0;

    if ($planid === 0) {
        echo json_encode(["error" => "Missing or invalid planid"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ดึงวิชาที่ถูกเลือกไว้แล้ว โดยไม่สนใจ infoid
    $selectedStmt = $conn->prepare("SELECT DISTINCT subject_id FROM course_information");
    $selectedStmt->execute();
    $selectedSubjects = $selectedStmt->fetchAll(PDO::FETCH_COLUMN);

    // ดึงข้อมูลรายวิชาตามแผนการเรียน
    $sql = "SELECT subject_id, course_code, course_name, theory, comply, credit, subject_category, subject_groups 
            FROM subject 
            WHERE planid = :planid";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':planid', $planid, PDO::PARAM_INT);
    $stmt->execute();

    $subjects = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (in_array($row["subject_id"], $selectedSubjects)) {
            continue; // ❌ ข้ามวิชาที่ถูกเลือกไปแล้ว (ไม่สนใจ infoid)
        }

        $category = $row["subject_category"] ?: "ไม่ระบุหมวดหมู่";
        $group = $row["subject_groups"] ?: "ไม่ระบุกลุ่ม";

        if (!isset($subjects[$category])) {
            $subjects[$category] = [];
        }
        if (!isset($subjects[$category][$group])) {
            $subjects[$category][$group] = [];
        }

        $subjects[$category][$group][] = [
            "subject_id" => (int) $row["subject_id"],
            "course_code" => $row["course_code"],
            "course_name" => $row["course_name"],
            "theory" => (int) $row["theory"],
            "comply" => (int) $row["comply"],
            "credit" => (int) $row["credit"]
        ];
    }

    echo json_encode($subjects, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
