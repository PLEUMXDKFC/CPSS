<?php
require '../conn.php'; // หรือ '../conn.php' แล้วแต่ path ของคุณ

$conn = require('../conn.php');
$data = json_decode(file_get_contents("php://input"), true);

$planid = $data['planid'];
$infoid = $data['infoid'];
$desc1 = $data['descriptionterm1'];
$desc2 = $data['descriptionterm2'];
$head = $data['Headofdepartment'];
$curr = $data['HeadofCurriculum'];
$deputy = $data['DeputyDirector'];
$dir = $data['Director'];

try {
    // ตรวจสอบว่ามีอยู่แล้วหรือไม่
    $sql_check = "SELECT * FROM more_plan WHERE planid = ? AND infoid = ?";
    $stmt = $conn->prepare($sql_check);
    $stmt->execute([$planid, $infoid]);

    if ($stmt->rowCount() > 0) {
        // UPDATE
        $sql = "UPDATE more_plan SET 
            descriptionterm1 = ?, 
            descriptionterm2 = ?, 
            Headofdepartment = ?, 
            HeadofCurriculum = ?, 
            DeputyDirector = ?, 
            Director = ?
            WHERE planid = ? AND infoid = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$desc1, $desc2, $head, $curr, $deputy, $dir, $planid, $infoid]);
    } else {
        // INSERT
        $sql = "INSERT INTO more_plan 
            (planid, infoid, descriptionterm1, descriptionterm2, Headofdepartment, HeadofCurriculum, DeputyDirector, Director)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$planid, $infoid, $desc1, $desc2, $head, $curr, $deputy, $dir]);
    }

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
