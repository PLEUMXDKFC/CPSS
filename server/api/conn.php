<?php  
    $servername = "localhost";
    $username="root";
    $password="";
    $dbname="cpss";

    try{
        $conn =new PDO("mysql:host=$servername;dbname=$dbname",$username,$password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: Content-Type");
        header("Content-Type: application/json");
        header("Access-Control-Allow-Methods: DELETE, GET, POST,PUT");
    }
    catch(PDOException $e){
        echo "Connection failed: ".$e->getMessage();
    }

    return $conn;
?>