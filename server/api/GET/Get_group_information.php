<?php 
require_once '../conn.php';

$planid = isset($_GET['planid']) ? intval($_GET['planid']) : 0;

if ($planid > 0) {
    try {
        // ปรับ SQL query เพื่อดึงเฉพาะ record ที่ sublevel ไม่เป็น null
        $stmt = $conn->prepare("SELECT * FROM group_information WHERE planid = :planid");
        $stmt->bindParam(':planid', $planid, PDO::PARAM_INT);
        $stmt->execute();
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($groups);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Invalid planid"]);
}
?>
