<?php

    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "CPSS"; // เปลี่ยนเป็นชื่อฐานข้อมูลของคุณ

    try {
        $conn = new mysqli($servername, $username, $password, $dbname);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    }
    
?>