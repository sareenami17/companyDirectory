<?php
// Enable error reporting for development (remove these for production)
ini_set('display_errors', 'On');
error_reporting(E_ALL);

// Include the database configuration file
include("config.php");

// Set the content type to JSON
header('Content-Type: application/json; charset=UTF-8');

// Create a new database connection
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check for connection errors
if ($conn->connect_errno) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Retrieve POST variables for adding employee
$first_name = $_POST['firstName'] ?? null;
$last_name = $_POST['lastName'] ?? null;
$job_title = $_POST['jobTitle'] ?? null;
$email = $_POST['email'] ?? null;
$dept_id = $_POST['departmentID'] ?? null;

// Prepare the insert query for employee
$query = $conn->prepare('INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES (?, ?, ?, ?, ?)');

// Check if preparation was successful
if ($query === false) {
    echo json_encode(['status' => 'error', 'message' => 'Query preparation failed: ' . $conn->error]);
    $conn->close();
    exit;
}

// Bind parameters and execute the insert query
$query->bind_param("ssssi", $first_name, $last_name, $job_title, $email, $dept_id);
$query->execute();

// Check for execution success
if ($query->errno) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to add employee record: ' . $query->error]);
} else {
    echo json_encode(['status' => 'success', 'message' => 'Employee record added successfully']);
}

// Close the statement and connection
$query->close();
$conn->close();
?>
