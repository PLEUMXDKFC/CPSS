<?php
require_once '../conn.php';

try {
    $planid = $_GET['planid'] ?? null; // ดึง planid จาก query string

    $sql = "
    SELECT 
        ci.courseid AS course_info_id,
        ci.term,
        ci.infoid,
        ci.planid,
        gi.group_name,
        s.subject_id,
        s.course_code,
        s.course_name,
        s.credit,
        s.comply,
        s.subject_category,
        s.subject_groups
    FROM course_information ci
    JOIN subject s ON ci.subject_id = s.subject_id
    JOIN group_information gi ON ci.infoid = gi.infoid
    " . ($planid ? "WHERE ci.planid = :planid" : "");
    
    $stmt = $conn->prepare($sql);

    if ($planid) {
        $stmt->bindParam(':planid', $planid);
    }
    
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // คำนวณหน่วยกิตรวมตาม group_name, subject_category และ subject_groups
    $groupedCredits = [];

    foreach ($results as $row) {
        $groupKey = $row['group_name'] . '-' . $row['subject_category'] . '-' . $row['subject_groups'] . '-' . $row['planid'];
        if (!isset($groupedCredits[$groupKey])) {
            $groupedCredits[$groupKey] = 0;
        }
        $groupedCredits[$groupKey] += (int)$row['credit'];
    }

    // เตรียมข้อมูลออกมา
    $formatted = [];

    foreach ($results as $row) {
        $groupKey = $row['group_name'] . '-' . $row['subject_category'] . '-' . $row['subject_groups'] . '-' . $row['planid'];
        $formatted[] = [
            "planid" => $row['planid'],
            "group_name" => $row['group_name'],
            "term" => $row['term'],
            "subject" => [
                "subject_id" => $row['subject_id'],
                "course_code" => $row['course_code'],
                "course_name" => $row['course_name'],
                "credit" => (int)$row['credit'],
                "comply" => (int)$row['comply'],
                "subject_category" => $row['subject_category'],
                "subject_groups" => $row['subject_groups'],
            ],
            "total_credit_by_group" => $groupedCredits[$groupKey],
        ];
    }

    echo json_encode($formatted, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
