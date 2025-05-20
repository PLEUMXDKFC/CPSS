<?php
require '../conn.php';

$rawData = file_get_contents("php://input");
error_log("Raw input data: " . $rawData);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode($rawData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("ข้อมูล JSON ไม่ถูกต้อง: " . json_last_error_msg());
        }
        
        error_log("Decoded data: " . print_r($data, true));
        
        // ตรวจสอบว่าข้อมูลมีโครงสร้างแบบเดิมหรือไม่
        if (isset($data['planid']) && isset($data['records'])) {
            // กรณีโครงสร้างเดิม
            $planid = $data['planid'];
            $records = $data['records'];
        } else {
            // กรณีข้อมูลเป็นรายการเดียว
            // ตรวจสอบว่ามี planid หรือไม่
            if (!isset($data['planid'])) {
                throw new Exception("ไม่พบข้อมูล planid");
            }
            
            // สร้าง records จากข้อมูลที่ส่งมา
            $planid = $data['planid'];
            $records = [$data]; // แปลงเป็น array ที่มีข้อมูลเดียว
        }
        
        // ตรวจสอบว่า records เป็น array หรือไม่
        if (!is_array($records)) {
            throw new Exception("records ต้องเป็น array");
        }
        
        if (empty($records)) {
            throw new Exception("records ต้องไม่ว่าง");
        }
        
        // ส่วนที่เหลือเหมือนเดิม...
        $conn->beginTransaction();
        
        $sql = "INSERT INTO group_information (planid, sublevel, group_name, term, subterm, summer, year)
                VALUES (:planid, :sublevel, :group_name, :term, :subterm, :summer, :year)";
        $stmt = $conn->prepare($sql);
        
        foreach ($records as $index => $record) {
            if (empty($record['group_name'])) {
                throw new Exception("ข้อมูล group_name ในรายการที่ " . ($index + 1) . " ไม่ถูกต้อง");
            }
            
            if (empty($record['subterm'])) {
                throw new Exception("ข้อมูล subterm ในรายการที่ " . ($index + 1) . " ไม่ถูกต้อง");
            }
            
            if (empty($record['term'])) {
                throw new Exception("ข้อมูล term ในรายการที่ " . ($index + 1) . " ไม่ถูกต้อง");
            }
            
            if (empty($record['year'])) {
                throw new Exception("ข้อมูล year ในรายการที่ " . ($index + 1) . " ไม่ถูกต้อง");
            }
            
            $stmt->execute([
                ':planid' => $planid,
                ':sublevel' => $record['sublevel'] ?? null,
                ':group_name' => $record['group_name'],
                ':term' => $record['term'],
                ':subterm' => $record['subterm'],
                ':summer' => $record['summer'] ?? null,
                ':year' => $record['year']
            ]);
        }
        
        $conn->commit();
        
        echo json_encode([
            "status" => "success", 
            "message" => "บันทึกข้อมูลเรียบร้อยแล้ว", 
            "count" => count($records)
        ]);
        
    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        
        error_log("Error: " . $e->getMessage());
        
        echo json_encode([
            "status" => "error", 
            "message" => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Method Not Allowed"
    ]);
}
?>