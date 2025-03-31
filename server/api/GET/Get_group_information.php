<?php
require_once '../conn.php';

try {
    $stmt = $conn->prepare("SELECT * FROM group_information ");
    $stmt->execute();
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($groups);
} catch (PDOException $e) {
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
}
?>
