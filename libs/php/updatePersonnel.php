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

// Retrieve POST variables for employee update
$first_name = $_POST['firstName'] ?? null;
$last_name = $_POST['lastName'] ?? null;
$job_title = $_POST['jobTitle'] ?? null;
$email = $_POST['email'] ?? null;
$dept_id = $_POST['departmentID'] ?? null;
$id = $_POST['id'] ?? null; // Employee ID

// Validate input
if (empty($first_name) || empty($last_name) || empty($job_title) || empty($email) || empty($dept_id) || empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

// Prepare the update query for employee
$query = $conn->prepare('UPDATE personnel SET firstName = ?, lastName = ?, jobTitle = ?, email = ?, departmentID = ? WHERE id = ?');

// Check if preparation was successful
if ($query === false) {
    echo json_encode(['status' => 'error', 'message' => 'Query preparation failed: ' . $conn->error]);
    $conn->close();
    exit;
}

// Bind parameters and execute the employee update query
$query->bind_param("ssssii", $first_name, $last_name, $job_title, $email, $dept_id, $id);
$query->execute();

// Check for execution success
if ($query->errno) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to update employee record: ' . $query->error]);
} else {
    echo json_encode(['status' => 'success', 'message' => 'Employee record updated successfully']);
}

// Close the statement and connection
$query->close();
$conn->close();
?>
