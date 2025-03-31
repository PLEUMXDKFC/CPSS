<?php

require("../conn.php");
header("Content-Type: application/json; charset=UTF-8");

try {
    $stmt = $conn->prepare("
        SELECT * FROM study_plans 
        ORDER BY 
            year DESC, 
            FIELD(course, 
                'หลักสูตรประกาศณียบัตรวิชาชีพ', 
                'หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง', 
                'หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง (ม.6)'
            ), 
            student_id DESC
    ");
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

?>
