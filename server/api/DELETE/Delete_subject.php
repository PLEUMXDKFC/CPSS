<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../conn.php'; // เรียกใช้ไฟล์เชื่อมต่อฐานข้อมูล

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->courseid)) {
    echo json_encode(["success" => false, "message" => "Missing courseid"]);
    exit();
}

$courseid = $data->courseid;

try {
    $query = "DELETE FROM course_information WHERE courseid = :courseid";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":courseid", $courseid, PDO::PARAM_INT);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
