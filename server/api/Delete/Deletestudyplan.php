<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'DELETE') {
    $planid = $_POST['planid'];

    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("DELETE FROM course_information WHERE subject_id IN (SELECT subject_id FROM subject WHERE planid = :planid)");
        $stmt->bindParam(":planid", $planid);
        $stmt->execute();

        $stmt = $conn->prepare("DELETE FROM subject WHERE planid = :planid");
        $stmt->bindParam(":planid", $planid);
        $stmt->execute();

        $stmt = $conn->prepare("DELETE FROM group_information WHERE planid = :planid");
        $stmt->bindParam(":planid", $planid);
        $stmt->execute();

        $stmt = $conn->prepare("DELETE FROM study_plans WHERE planid = :planid");
        $stmt->bindParam(":planid", $planid);
        $stmt->execute();

        $conn->commit();

        echo json_encode(["status" => "success", "message" => "Data deleted successfully"]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

?>
