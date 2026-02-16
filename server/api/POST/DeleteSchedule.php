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

    if (!isset($data['field_id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing field_id']);
        exit();
    }

    try {
        $sql = "DELETE FROM create_study_table WHERE field_id = :field_id";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([':field_id' => $data['field_id']]);

        echo json_encode(['status' => 'success', 'message' => 'Schedule deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
}
?>
