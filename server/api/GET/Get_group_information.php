<?php
require_once '../conn.php';

try {
    $stmt = $conn->prepare("
        SELECT 
            gi.*,
            COALESCE(
                gi.sublevel,
                first_normal.sublevel
            ) AS sublevel,
            sp.student_id,
            sp.year AS plan_year
        FROM group_information gi
        LEFT JOIN study_plans sp ON gi.planid = sp.planid
        LEFT JOIN (
            SELECT g2.planid, g2.group_name, g2.sublevel
            FROM group_information g2
            INNER JOIN (
                SELECT planid, group_name, MIN(year) AS min_year
                FROM group_information
                WHERE summer IS NULL
                GROUP BY planid, group_name
            ) AS mins
                ON g2.planid = mins.planid
                AND g2.group_name = mins.group_name
                AND g2.year = mins.min_year
                AND g2.summer IS NULL
        ) AS first_normal
            ON gi.summer IS NOT NULL
            AND gi.planid = first_normal.planid
            AND gi.group_name = first_normal.group_name
    ");
    $stmt->execute();
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($groups);
} catch (PDOException $e) {
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
}
?>
