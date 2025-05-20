<?php
require_once '../conn.php';

try {
    $stmt = $conn->prepare("
        SELECT 
            gi.*,
            COALESCE(gi.sublevel, fallback.sublevel) AS sublevel
        FROM group_information gi
        LEFT JOIN group_information fallback
            ON gi.summer IS NOT NULL 
            AND gi.group_name = fallback.group_name 
            AND gi.year = fallback.year 
            AND fallback.summer IS NULL
    ");
    $stmt->execute();
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($groups);
} catch (PDOException $e) {
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
}

?>
