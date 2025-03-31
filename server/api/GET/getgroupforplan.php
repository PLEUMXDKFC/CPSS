<?php
require_once '../conn.php';

header('Content-Type: application/json; charset=UTF-8');

if (isset($_GET['infoid'])) {
    $infoid = $_GET['infoid'];

    try {
        $stmt = $conn->prepare("SELECT * FROM group_information WHERE infoid = ?");
        $stmt->execute([$infoid]);
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($groups)) {
            echo json_encode(["error" => "ไม่พบข้อมูลแผนการเรียนสำหรับ infoid: $infoid"]);
        } else {
            echo json_encode($groups);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Missing infoid parameter"]);
}
?>
