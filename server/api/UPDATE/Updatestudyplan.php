<?php

    require("../conn.php");
    header("Content-Type: application/json; charset=UTF-8");

    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$conn) {
            echo json_encode(["status" => "error", "message" => "Database connection failed"]);
            exit;
        }

        if (isset($data['planid'], $data['course'], $data['year'], $data['student_id'])) {
            $stmt = $conn->prepare("UPDATE study_plans SET course = :course, year = :year, student_id = :student_id  WHERE planid = :planid");
            $stmt->bindParam(":planid", $data['planid']);
            $stmt->bindParam(":course", $data['course']);
            $stmt->bindParam(":year", $data['year']);
            $stmt->bindParam(":student_id", $data['student_id']);

            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Data updated successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error updating data"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid data received"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }

    exit;

?>