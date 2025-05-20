<?php
require '../conn.php'; // หรือ '../conn.php' แล้วแต่ที่อยู่จริง

$conn = require('../conn.php');

$planid = $_GET['planid'];
$infoid = $_GET['infoid'];

try {
    $sql = "SELECT * FROM more_plan WHERE planid = ? AND infoid = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$planid, $infoid]);

    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode($row);
    } else {
        echo json_encode(null);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
