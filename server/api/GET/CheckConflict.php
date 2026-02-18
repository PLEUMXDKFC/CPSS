<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../conn.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit();
}

// Get parameters
$teacher_id = $_GET['teacher_id'] ?? null;
$room_id = $_GET['room_id'] ?? 0;
$planid = $_GET['planid'] ?? null;
$group_name = $_GET['group_name'] ?? null;
$date = $_GET['date'] ?? null;
$start_time = $_GET['start_time'] ?? null; // Start Period
$end_time = $_GET['end_time'] ?? null;     // End Period
$term = $_GET['term'] ?? null;

// Validation
if (!$planid || !$date || !$start_time || !$end_time || !$term) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameters']);
    exit();
}

try {
    // 1. Get user's Year and Student ID from planid
    $stmtPlan = $conn->prepare("SELECT year, student_id FROM study_plans WHERE planid = :planid");
    $stmtPlan->execute([':planid' => $planid]);
    $planRow = $stmtPlan->fetch(PDO::FETCH_ASSOC);

    if (!$planRow) {
        throw new Exception("Invalid planid: Plan not found");
    }
    $year = $planRow['year'];
    $student_id = $planRow['student_id'];

    // 2. Check overlap
    // Overlap Condition: (ExistingStart <= NewEnd) AND (ExistingEnd >= NewStart)
    $sql = "
        SELECT 
            cst.teacher_id, cst.room_id, cst.group_name, cst.planid,
            sp.student_id,
            t.prefix, t.fname, t.lname,
            r.room_name,
            s.course_code, s.course_name
        FROM create_study_table cst
        JOIN study_plans sp ON cst.planid = sp.planid
        LEFT JOIN teacher_info t ON cst.teacher_id = t.teacher_id
        LEFT JOIN room r ON cst.room_id = r.room_id
        LEFT JOIN course_information ci ON cst.courseid = ci.courseid
        LEFT JOIN subject s ON ci.subject_id = s.subject_id
        WHERE 
            sp.year = :year
            AND cst.term = :term
            AND cst.date = :date
            AND (cst.start_time <= :end_time AND cst.end_time >= :start_time)
            AND (
                (cst.teacher_id = :teacher_id) OR
                (cst.room_id = :room_id AND :room_id_check != 0) OR
                (
                     (cst.planid = :planid AND cst.group_name = :group_name)
                     OR
                     (sp.student_id = :student_id AND cst.group_name = :group_name_check)
                )
            )
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':year' => $year,
        ':term' => $term,
        ':date' => $date,
        ':start_time' => $start_time,
        ':end_time' => $end_time,
        ':teacher_id' => $teacher_id,
        ':room_id' => $room_id,
        ':room_id_check' => $room_id,
        ':planid' => $planid,
        ':group_name' => $group_name,
        ':student_id' => $student_id,
        ':group_name_check' => $group_name
    ]);

    $conflicts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($conflicts) > 0) {
        // Categorize conflicts
        $messages = [];
        foreach ($conflicts as $c) {
            $subjectInfo = ($c['course_code'] ?? '?') . ' ' . ($c['course_name'] ?? '');
            
            if ($c['teacher_id'] == $teacher_id) {
                $prefix = $c['prefix'] ?? '';
                $fname = $c['fname'] ?? '';
                $lname = $c['lname'] ?? '';
                $tName = trim("$prefix $fname $lname");
                $messages[] = "ครู ($tName) ติดสอนวิชา $subjectInfo (กลุ่ม {$c['group_name']})";
            }
            if ($c['room_id'] == $room_id && $room_id != 0) {
                $rName = $c['room_name'] ?? $c['room_id'];
                $messages[] = "ห้อง ($rName) ถูกใช้งานสอนวิชา $subjectInfo (กลุ่ม {$c['group_name']})";
            }
            
            // Check Group Conflict
            // Conflict if: Exact match OR (Student ID match AND Group Check match)
            if ( ($c['planid'] == $planid && $c['group_name'] == $group_name) ||
                 ($c['student_id'] == $student_id && $c['group_name'] == $group_name) ) {
                $messages[] = "กลุ่มเรียน ($group_name) มีเรียนวิชา $subjectInfo แล้ว";
            }
        }
        
        $messages = array_unique($messages);
        
        echo json_encode([
            'status' => 'conflict',
            'message' => implode("<br>", $messages),
            'details' => $conflicts
        ]);
    } else {
        echo json_encode(['status' => 'success']);
    }

} catch (Exception $e) {
    error_log("CheckConflict Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
