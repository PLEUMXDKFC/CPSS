<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents('php://input'), true);
$subject_id = $data['subject_id'];

try {
    // เริ่ม Transaction
    $conn->beginTransaction();

    // ลบข้อมูลในตาราง course_information ก่อน
    $stmt1 = $conn->prepare("DELETE FROM course_information WHERE subject_id = :subject_id");
    $stmt1->bindParam(":subject_id", $subject_id);
    $stmt1->execute();

    // ลบข้อมูลในตาราง subject
    $stmt2 = $conn->prepare("DELETE FROM subject WHERE subject_id = :subject_id");
    $stmt2->bindParam(":subject_id", $subject_id);
    $stmt2->execute();

    // Commit Transaction
    $conn->commit();

    echo json_encode(["status" => "success", "message" => "Data deleted successfully"]);
} catch (Exception $e) {
    // Rollback Transaction หากเกิดข้อผิดพลาด
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
