<?php
require_once("../conn.php");

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['infoid'])) { // เปลี่ยนจาก planid เป็น infoid
    $infoid = $_GET['infoid'];

    try {
        $sql = "SELECT ci.infoid, ci.courseid, ci.year, ci.term, s.subject_id, s.course_code, s.course_name, 
        s.theory, s.comply, s.credit, s.subject_category, s.subject_groups
FROM course_information ci
JOIN subject s ON ci.subject_id = s.subject_id
WHERE ci.infoid = :infoid  
ORDER BY 
    CASE 
        WHEN s.subject_category = '1.หมวดวิชาสมรรถนะแกนกลาง' THEN 1
        WHEN s.subject_category = '2.หมวดวิชาสมรรถนะวิชาชีพ' THEN 2
        WHEN s.subject_category = '3.หมวดวิชาเลือกเสรี' THEN 3
        WHEN s.subject_category = '4.กิจกรรมเสริมหลักสูตร' THEN 4
        ELSE 99
    END,
    CASE 
        WHEN s.subject_groups = '1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร' THEN 1
        WHEN s.subject_groups = '1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา' THEN 2
        WHEN s.subject_groups = '1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต' THEN 3
        WHEN s.subject_groups = 'รายวิชาปรับพื้นฐาน' THEN 4
        WHEN s.subject_groups = '2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน' THEN 5
        WHEN s.subject_groups = '2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ' THEN 6
        ELSE 99
    END,
    ci.year, 
    CASE 
        WHEN ci.term = 'summer' THEN 999
        ELSE ci.term 
    END ASC, 
    ci.infoid ASC";


        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':infoid', $infoid, PDO::PARAM_INT); // เปลี่ยนเป็น infoid
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
