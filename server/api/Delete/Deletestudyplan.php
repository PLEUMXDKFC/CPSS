<?php
    require("../conn.php");
    header("Content-Type: application/json; charset=UTF-8");

        $data = json_decode(file_get_contents('php://input'), true);
        $planid = $data['planid'];

        try {
            $stmt = $conn->prepare("DELETE FROM study_plans WHERE planid = :planid");
            $stmt->bindParam(":planid", $planid);
            $stmt->execute();

            echo json_encode(value: ["status" => "success", "message" => "Data deleted successfully"]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
?>