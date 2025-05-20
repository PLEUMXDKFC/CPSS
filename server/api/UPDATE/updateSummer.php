<?php
require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");

// รับข้อมูล JSON จาก POST
$data = json_decode(file_get_contents('php://input'), true);

// ตรวจสอบว่า `summerData` มาจากคำขอหรือไม่
if (!isset($data['summerData']) || empty($data['summerData'])) {
    echo json_encode(["status" => "error", "message" => "Invalid or missing summerData"]);
    exit;
}

$summerData = $data['summerData'];

try {
    $conn->beginTransaction();

    foreach ($summerData as $group) {
        $stmt = $conn->prepare("UPDATE group_information SET summer = :summer WHERE infoid = :infoid AND planid = :planid");
        $stmt->bindParam(":infoid", $group['infoid'], PDO::PARAM_INT);
        $stmt->bindParam(":planid", $group['planid'], PDO::PARAM_INT);
        $stmt->bindParam(":summer", $group['summer'], PDO::PARAM_STR);
        $stmt->execute();
    }

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Summer updated successfully"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
