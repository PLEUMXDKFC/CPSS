<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=UTF-8');

require_once '../conn.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['infoid'])) {
    $infoid = $_GET['infoid'];

    try {
        $sql = "SELECT 
                    cst.field_id,
                    cst.teacher_id,
                    cst.courseid,
                    cst.room_id,
                    cst.planid,
                    cst.date,
                    cst.start_time,
                    cst.end_time,
                    cst.table_split_status,
                    cst.split_status,
                    cst.group_name,
                    cst.term,
                    s.course_code,
                    s.course_name,
                    CONCAT(t.prefix, t.fname, ' ', t.lname) as teacher_name,
                    r.room_name
                FROM create_study_table cst
                JOIN course_information ci ON cst.courseid = ci.courseid
                JOIN subject s ON ci.subject_id = s.subject_id
                LEFT JOIN teacher_info t ON cst.teacher_id = t.teacher_id
                LEFT JOIN room r ON cst.room_id = r.room_id
                WHERE ci.infoid = :infoid
                ORDER BY cst.field_id DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':infoid', $infoid, PDO::PARAM_INT);
        $stmt->execute();
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($schedules, JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
}
?>
