<?php
require_once '../conn.php';

if (!isset($_GET['planid'])) {
    echo json_encode(["error" => "Missing planid"]);
    exit;
}

$planid = $_GET['planid'];

try {
    $stmt = $conn->prepare("SELECT * FROM group_information WHERE planid = :planid");
    $stmt->bindParam(':planid', $planid, PDO::PARAM_INT);
    $stmt->execute();
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($groups);
} catch (PDOException $e) {
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
}
?>
