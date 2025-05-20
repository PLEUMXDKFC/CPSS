<?php 
require_once '../conn.php';

$planid = isset($_GET['planid']) ? intval($_GET['planid']) : 0;
$group_name = isset($_GET['group_name']) ? $_GET['group_name'] : '';

if ($planid > 0 && !empty($group_name)) {
    try {
        // เริ่มการทำธุรกรรม
        $conn->beginTransaction();

        $stmt = $conn->prepare("DELETE FROM course_information WHERE subject_id IN (SELECT subject_id FROM subject WHERE planid = :planid)");
        $stmt->bindParam(":planid", $planid);
        $stmt->execute();

        // ลบข้อมูลจาก group_information หลังจากลบข้อมูลจาก course_information แล้ว
        $stmt2 = $conn->prepare("DELETE FROM group_information WHERE planid = :planid AND group_name = :group_name");
        $stmt2->bindParam(':planid', $planid, PDO::PARAM_INT);
        $stmt2->bindParam(':group_name', $group_name, PDO::PARAM_STR);
        $stmt2->execute();

        // คอนเฟิร์มการทำธุรกรรม
        $conn->commit();

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        // ถ้ามีข้อผิดพลาด ให้ย้อนกลับธุรกรรม
        $conn->rollBack();
        echo json_encode(["error" => "Deletion failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Invalid parameters"]);
}
?>
