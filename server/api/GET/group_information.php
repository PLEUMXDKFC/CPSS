<?php
require_once '../conn.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$planid = isset($_GET['planid']) ? intval($_GET['planid']) : 0;

try {
    if ($planid > 0) {
        $stmt = $conn->prepare("SELECT * FROM group_information WHERE planid = :planid");
        $stmt->bindParam(':planid', $planid, PDO::PARAM_INT);
    } else {
        // ดึงข้อมูลทั้งหมดถ้าไม่มี planid
        $stmt = $conn->prepare("SELECT * FROM group_information");
    }

    $stmt->execute();
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($groups);
} catch (PDOException $e) {
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
}
?>
