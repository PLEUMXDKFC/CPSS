<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once("../conn.php");

try {
    $planid = isset($_GET['planid']) ? intval($_GET['planid']) : 0;
    $infoid = isset($_GET['infoid']) ? intval($_GET['infoid']) : 0;

    if ($planid === 0 || $infoid === 0) {
        echo json_encode(["error" => "Missing or invalid planid/infoid"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 1. ดึง group_name ของ infoid นี้
    $groupStmt = $conn->prepare("SELECT group_name FROM group_information WHERE infoid = :infoid LIMIT 1");
    $groupStmt->bindParam(':infoid', $infoid, PDO::PARAM_INT);
    $groupStmt->execute();
    $groupName = $groupStmt->fetchColumn();

    if (!$groupName) {
        echo json_encode(["error" => "ไม่พบ group_name ของ infoid นี้"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. ดึง subject_id ที่ถูกเลือกไปแล้วในกลุ่มเดียวกันเท่านั้น
    $selectedStmt = $conn->prepare("
        SELECT ci.subject_id 
        FROM course_information ci
        INNER JOIN group_information gi ON ci.infoid = gi.infoid
        WHERE gi.group_name = :group_name
    ");
    $selectedStmt->bindParam(':group_name', $groupName, PDO::PARAM_STR);
    $selectedStmt->execute();
    $selectedSubjects = $selectedStmt->fetchAll(PDO::FETCH_COLUMN);

    // 3. ดึงวิชาทั้งหมดจากแผนการเรียน
    $sql = "SELECT subject_id, course_code, course_name, theory, comply, credit, subject_category, subject_groups 
            FROM subject 
            WHERE planid = :planid";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':planid', $planid, PDO::PARAM_INT);
    $stmt->execute();

    $subjects = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (in_array($row["subject_id"], $selectedSubjects)) {
            continue; // ข้ามเฉพาะวิชาที่ถูกเลือกใน "กลุ่มเดียวกัน"
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
