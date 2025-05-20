<?php
require_once('../conn.php'); // เชื่อมต่อฐานข้อมูลผ่าน PDO

header('Content-Type: application/json');

try {
    // รับข้อมูลจาก React
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["username"]) || !isset($data["newPassword"])) {
        echo json_encode(["success" => false, "message" => "กรุณากรอกข้อมูลให้ครบ"]);
        exit();
    }

    $username = $data["username"];
    $newPassword = password_hash($data["newPassword"], PASSWORD_BCRYPT);

    // ตรวจสอบว่ามี user นี้อยู่หรือไม่
    $query = "SELECT * FROM tb_member WHERE member_code = :username";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "ไม่พบชื่อผู้ใช้นี้"]);
        exit();
    }

    // อัปเดตรหัสผ่านใหม่
    $updateQuery = "UPDATE tb_member SET member_password = :newPassword WHERE member_code = :username";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bindParam(":newPassword", $newPassword);
    $stmt->bindParam(":username", $username);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "เปลี่ยนรหัสผ่านสำเร็จ"]);
    } else {
        echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาด"]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาด: " . $e->getMessage()]);
}
?>
