<?php
require_once("../conn.php");

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['infoid'])) {
    $infoid = $_GET['infoid'];

    try {
        $sql = "SELECT ci.infoid, ci.courseid, ci.year, ci.term, s.subject_id, s.course_code, s.course_name, 
                    s.theory, s.comply, s.credit, s.subject_category, s.subject_groups
                FROM course_information ci
                JOIN subject s ON ci.subject_id = s.subject_id
                WHERE ci.infoid = :infoid
                ORDER BY ci.year, 
                    CASE 
                        WHEN ci.term = 'summer' THEN 999 -- กำหนดค่าภาคฤดูร้อนให้มาอยู่ท้ายสุด
                        ELSE ci.term 
                    END ASC, 
                    ci.infoid ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':infoid', $infoid, PDO::PARAM_INT);
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($courses) {
            echo json_encode($courses, JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => "Database error: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
} else {
    echo json_encode(["error" => "Invalid request"], JSON_UNESCAPED_UNICODE);
}
?>
