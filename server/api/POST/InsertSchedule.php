<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=UTF-8');

require_once '../conn.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate required fields
    if (
        !isset($data['teacher_id']) || 
        !isset($data['courseid']) || 
        !isset($data['room_id']) || 
        !isset($data['planid']) || 
        !isset($data['date']) || 
        !isset($data['start_time']) || 
        !isset($data['end_time'])
    ) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit();
    }

    // Log received data for debugging
    error_log("InsertSchedule received: " . json_encode($data));

    try {
        $sql = "INSERT INTO create_study_table 
                (teacher_id, courseid, room_id, planid, date, start_time, end_time, table_split_status, split_status, group_name, term) 
                VALUES 
                (:teacher_id, :courseid, :room_id, :planid, :date, :start_time, :end_time, :table_split_status, :split_status, :group_name, :term)";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':teacher_id' => $data['teacher_id'],
            ':courseid' => $data['courseid'],
            ':room_id' => $data['room_id'],
            ':planid' => $data['planid'],
            ':date' => $data['date'], // Day e.g., 'จันทร์'
            ':start_time' => $data['start_time'],
            ':end_time' => $data['end_time'],
            ':table_split_status' => (!empty($data['table_split_status']) && $data['table_split_status'] !== 'false') ? 'true' : 'false',
            ':split_status' => $data['split_status'] ?? 0,
            ':group_name' => $data['group_name'] ?? null,
            ':term' => $data['term'] ?? null
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Schedule created successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
}
?>
