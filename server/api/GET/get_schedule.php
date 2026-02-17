<?php
// server/api/GET/get_schedule.php
// GET /api/GET/get_schedule.php?planid=56&infoid=162&term=2&year=2568

require_once dirname(__FILE__) . '/../conn.php';

try {
    // ── บังคับให้ต้องส่ง planid และ infoid มาเสมอ ─────────────────────────
    if (empty($_GET['planid'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'planid is required']);
        exit;
    }
    if (empty($_GET['infoid'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'infoid is required']);
        exit;
    }

    $conditions = [];
    $params     = [];

    // ── planid — กรองจาก create_study_table ───────────────────────────────
    $conditions[] = "cst.planid = :planid";
    $params[':planid'] = (int) $_GET['planid'];

    // ── infoid — กรองจาก course_information (ระบุกลุ่มเรียน) ───────────────
    $conditions[] = "ci.infoid = :infoid";
    $params[':infoid'] = (int) $_GET['infoid'];

    // ── term ──────────────────────────────────────────────────────────────
    if (!empty($_GET['term'])) {
        $conditions[] = "cst.term = :term";
        $params[':term'] = $_GET['term'];
    }

    // ── year ──────────────────────────────────────────────────────────────
    if (!empty($_GET['year'])) {
        $conditions[] = "ci.year = :year";
        $params[':year'] = $_GET['year'];
    }

    $where = "WHERE " . implode(" AND ", $conditions);

    $sql = "
        SELECT
            cst.field_id,
            cst.teacher_id,
            t.prefix,
            t.fname,
            t.lname,
            CONCAT(t.prefix, t.fname, ' ', t.lname) AS teacher_name,
            cst.courseid,
            s.course_code,
            s.course_name,
            s.credit,
            cst.room_id,
            r.room_name,
            r.room_type,
            cst.planid,
            ci.infoid,
            gi.sublevel,
            gi.group_name   AS class_group,
            gi.year         AS class_year,
            cst.date,
            cst.start_time,
            cst.end_time,
            cst.table_split_status,
            cst.split_status,
            cst.group_name,
            cst.term
        FROM create_study_table       AS cst
        INNER JOIN course_information AS ci  ON ci.courseid  = cst.courseid
        INNER JOIN group_information  AS gi  ON gi.infoid    = ci.infoid
        LEFT  JOIN teacher_info       AS t   ON t.teacher_id = cst.teacher_id
        LEFT  JOIN subject            AS s   ON s.subject_id = ci.subject_id
        LEFT  JOIN room               AS r   ON r.room_id    = cst.room_id
        $where
        ORDER BY
            FIELD(cst.date, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'),
            cst.start_time ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = array_map(function ($row) {
        $row['field_id']   = (int) $row['field_id'];
        $row['teacher_id'] = (int) $row['teacher_id'];
        $row['courseid']   = (int) $row['courseid'];
        $row['room_id']    = (int) $row['room_id'];
        $row['planid']     = (int) $row['planid'];
        $row['infoid']     = (int) $row['infoid'];
        $row['start_time'] = (int) $row['start_time'];
        $row['end_time']   = (int) $row['end_time'];
        $row['credit']     = (int) $row['credit'];
        return $row;
    }, $rows);

    echo json_encode($result ?: []);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn = null;
