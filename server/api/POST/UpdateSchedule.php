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

    // Only allow updating: teacher_id, room_id, date, start_time, end_time
    if (!isset($data['field_id']) || !isset($data['teacher_id']) || !isset($data['room_id']) || 
        !isset($data['date']) || !isset($data['start_time']) || !isset($data['end_time'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit();
    }

    try {
        $sql = "UPDATE create_study_table 
                SET teacher_id = :teacher_id,
                    room_id = :room_id,
                    date = :date,
                    start_time = :start_time,
                    end_time = :end_time
                WHERE field_id = :field_id";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':field_id' => $data['field_id'],
            ':teacher_id' => $data['teacher_id'],
            ':room_id' => $data['room_id'],
            ':date' => $data['date'],
            ':start_time' => $data['start_time'],
            ':end_time' => $data['end_time']
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Schedule updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
}
?>
