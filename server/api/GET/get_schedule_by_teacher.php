<?php
// server/api/GET/get_schedule_by_teacher.php
// GET /api/GET/get_schedule_by_teacher.php?teacher_id=5&term=1&year=2568

require_once dirname(__FILE__) . '/../conn.php';

try {
    $teacher_id = isset($_GET['teacher_id']) ? $_GET['teacher_id'] : '';
    $term       = isset($_GET['term'])       ? $_GET['term']       : '';
    $year       = isset($_GET['year'])       ? $_GET['year']       : '';
    $planid     = isset($_GET['planid'])     ? $_GET['planid']     : '';
    $infoid     = isset($_GET['infoid'])     ? $_GET['infoid']     : '';
    $group_name = isset($_GET['group_name']) ? $_GET['group_name'] : '';

    if (empty($teacher_id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'teacher_id is required']);
        exit;
    }

    $conditions = [];
    $params     = [];

    $conditions[] = "cst.teacher_id = :teacher_id";
    $params[':teacher_id'] = (int) $teacher_id;

    if (!empty($term)) {
        $conditions[] = "ci.term = :term";
        $params[':term'] = $term;
    }
    if (!empty($year)) {
        $conditions[] = "ci.year = :year";
        $params[':year'] = $year;
    }
    if (!empty($planid)) {
        $conditions[] = "cst.planid = :planid";
        $params[':planid'] = (int) $planid;
    }
    if (!empty($infoid)) {
        $conditions[] = "ci.infoid = :infoid";
        $params[':infoid'] = (int) $infoid;
    }
    if (!empty($group_name)) {
        $conditions[] = "cst.group_name = :group_name";
        $params[':group_name'] = $group_name;
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
        ORDER BY
            FIELD(LOWER(cst.date), 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'),
            cst.start_time ASC,
            cst.split_status ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
