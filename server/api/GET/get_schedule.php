<?php
// server/api/GET/get_schedule.php
// GET /api/GET/get_schedule.php?planid=27&infoid=98&term=1&year=2568

require_once dirname(__FILE__) . '/../conn.php';

try {
    $planid = isset($_GET['planid']) ? $_GET['planid'] : '';
    $infoid = isset($_GET['infoid']) ? $_GET['infoid'] : '';
    $term   = isset($_GET['term'])   ? $_GET['term']   : '';
    $year   = isset($_GET['year'])   ? $_GET['year']   : '';

    if (empty($planid)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'planid is required']);
        exit;
    }
    // if (empty($infoid)) {
    //     http_response_code(400);
    //     echo json_encode(['status' => 'error', 'message' => 'infoid is required']);
    //     exit;
    // }

    // Debug log
    error_log("DEBUG get_schedule.php: planid=$planid, infoid=$infoid, term=$term, year=$year");

    $conditions = [];
    $params     = [];

    // ── planid — กรองจาก create_study_table ───────────────────────────────
    $conditions[] = "cst.planid = :planid";
    $params[':planid'] = (int) $planid;

    // ── infoid — กรองจาก course_information (ระบุกลุ่มเรียน) ───────────────
    if (!empty($infoid)) {
        $conditions[] = "ci.infoid = :infoid";
        $params[':infoid'] = (int) $infoid;
    }

    // ── term — กรองจาก course_information (ภาคเรียน) ──────────────────────
    if (!empty($term)) {
        $conditions[] = "ci.term = :term";
        $params[':term'] = $term;
    }

    // ── year ──────────────────────────────────────────────────────────────
    if (!empty($year)) {
        $conditions[] = "ci.year = :year";
        $params[':year'] = $year;
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
            LOWER(cst.date) AS date,
            cst.start_time,
            cst.end_time,
            cst.table_split_status,
            cst.split_status,
            cst.group_name,
            ci.term
        FROM create_study_table       AS cst
        INNER JOIN course_information AS ci  ON ci.courseid  = cst.courseid
        INNER JOIN group_information  AS gi  ON gi.infoid    = ci.infoid
        LEFT  JOIN teacher_info       AS t   ON t.teacher_id = cst.teacher_id
        LEFT  JOIN subject            AS s   ON s.subject_id = ci.subject_id
        LEFT  JOIN room               AS r   ON r.room_id   = cst.room_id
        $where
        ORDER BY cst.split_status ASC, LOWER(cst.date) DESC, cst.start_time ASC
    ";

    // Debug SQL
    error_log("DEBUG SQL: $sql");
    error_log("DEBUG Params: " . print_r($params, true));

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("DEBUG Result count: " . count($rows));

    $result = array_map(function ($row) {
        $row['field_id']     = (int) $row['field_id'];
        $row['teacher_id']   = (int) $row['teacher_id'];
        $row['courseid']     = (int) $row['courseid'];
        $row['room_id']      = (int) $row['room_id'];
        $row['planid']       = (int) $row['planid'];
        $row['infoid']       = (int) $row['infoid'];
        $row['start_time']   = (int) $row['start_time'];
        $row['end_time']     = (int) $row['end_time'];
        $row['credit']       = isset($row['credit']) ? (int) $row['credit'] : 0;
        $row['split_status'] = (int) $row['split_status'];
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
