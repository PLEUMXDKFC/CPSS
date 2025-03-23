<?php
    require("../conn.php");
    header("Content-Type: application/json; charset=UTF-8");

        $data = json_decode(file_get_contents('php://input'), true);
        $subject_id = $data['subject_id'];

        try {
            $stmt = $conn->prepare("DELETE FROM subject WHERE subject_id = :subject_id");
            $stmt->bindParam(":subject_id", $subject_id);
            $stmt->execute();

            echo json_encode(["status" => "success", "message" => "Data deleted successfully"]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }

?>

