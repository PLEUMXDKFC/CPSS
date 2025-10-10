<?php
include '../conn.php';

$data = json_decode(file_get_contents("php://input"), true);

$infoid = isset($_GET['infoid']) ? intval($_GET['infoid']) : null;

if ($infoid === null || !isset($data['planid'], $data['year'], $data['term'], $data['subjects']) || !is_array($data['subjects'])) {
    echo json_encode(["error" => "ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง"]);
    exit;
}

$planid = $data['planid'];
$year = $data['year'];
$term = $data['term'];
$subjects = $data['subjects'];

try {
    // ตรวจสอบว่า infoid มีอยู่ใน group_information หรือไม่
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM group_information WHERE infoid = :infoid");
    $checkStmt->execute([":infoid" => $infoid]);
    $exists = $checkStmt->fetchColumn();

    if ($exists == 0) {
        echo json_encode(["error" => "ไม่พบ infoid ใน group_information"]);
        exit;
    }

    // เริ่ม Transaction
    $conn->beginTransaction();

    $stmt = $conn->prepare("INSERT INTO course_information (infoid, subject_id, year, term) VALUES (:infoid, :subject_id, :year, :term)");

    $insertCount = 0;
    foreach ($subjects as $subject_id) {
        $stmt->execute([
            ":infoid" => $infoid,
            ":subject_id" => $subject_id,
            ":year" => $year,
            ":term" => $term
        ]);
        $insertCount++;
    }

    // บันทึก Transaction
    $conn->commit();

    echo json_encode([
        "message" => "บันทึกข้อมูลสำเร็จ",
        "inserted" => $insertCount
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["error" => "เกิดข้อผิดพลาด: " . $e->getMessage()]);
}

?>
