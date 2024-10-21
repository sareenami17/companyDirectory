<?php

// example use from browser
// http://localhost/companydirectory/libs/php/getPersonnelByID.php?id=<id>

// remove next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');


$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check for connection errors
if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Prepare and execute SQL statement for personnel
$query = $conn->prepare('SELECT id, firstName, lastName, email, jobTitle, departmentID FROM personnel WHERE id = ?');
$query->bind_param("i", $_REQUEST['id']);
$query->execute();

// Check if the query was successful
if (false === $query) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";	
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output); 
    exit;
}

$result = $query->get_result();
$personnel = [];

// Fetch personnel data
while ($row = mysqli_fetch_assoc($result)) {
    array_push($personnel, $row);
}

// Second query - fetch department data
$query = 'SELECT id, name FROM department ORDER BY name';
$result = $conn->query($query);

// Check if the department query was successful
if (!$result) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";	
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output); 
    exit;
}

$department = [];

// Fetch department data
while ($row = mysqli_fetch_assoc($result)) {
    array_push($department, $row);
}

// Build the output
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['personnel'] = $personnel;
$output['data']['department'] = $department;

mysqli_close($conn);

echo json_encode($output); 

?>
