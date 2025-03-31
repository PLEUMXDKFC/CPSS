<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");

try {
    $data = json_decode(file_get_contents('php://input'), true);


    if (!$conn) {
        echo json_encode(["status" => "error", "message" => "Database connection failed"]);
        exit;  // exit หลังจากส่งค่าแล้ว เพื่อไม่ให้ส่งค่าซ้ำ
    }

    if (isset($data['course'], $data['year'], $data['student_id'])) {
        $stmt = $conn->prepare("INSERT INTO study_plans (course, year, student_id) VALUES (:course, :year, :student_id)");
        $stmt->bindParam(":course", $data['course']);
        $stmt->bindParam(":year", $data['year']);
        $stmt->bindParam(":student_id", $data['student_id']);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Data inserted successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error inserting data"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid data received"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

exit; // 🚀 ป้องกัน PHP ส่ง output เพิ่มเติม
?>