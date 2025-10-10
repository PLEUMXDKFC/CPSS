<?php 
require_once '../conn.php';

$planid = isset($_GET['planid']) ? intval($_GET['planid']) : 0;

if ($planid > 0) {
    try {
        $stmt = $conn->prepare("DELETE FROM group_information WHERE planid = :planid");
        $stmt->bindParam(':planid', $planid, PDO::PARAM_INT);
        $stmt->execute();
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Deletion failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Invalid planid"]);
}
?>
