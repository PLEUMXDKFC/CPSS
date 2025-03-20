<?php

    require("../conn.php");
    header("Content-Type: application/json; charset=UTF-8");

    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$conn) {
            echo json_encode(["status" => "error", "message" => "Database connection failed"]);
            exit;
        }

        if (isset($data['course_code'], $data['course_name'], $data['theory'], $data['comply'], $data['credit'])) {
            $stmt = $conn->prepare("UPDATE subject SET course_code = :course_code, course_name = :course_name, theory = :theory, comply = :comply, credit = :credit WHERE subject_id = :subject_id");
            $stmt->bindParam(":subject_id", $data['subject_id']);
            $stmt->bindParam(":course_code", $data['course_code']);
            $stmt->bindParam(":course_name", $data['course_name']);
            $stmt->bindParam(":theory", $data['theory']);
            $stmt->bindParam(":comply", $data['comply']);
            $stmt->bindParam(":credit", $data['credit']);

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