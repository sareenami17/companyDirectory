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

// Retrieve POST variable for personnel deletion
$id = $_POST['id'] ?? null; // Personnel ID to delete

// Prepare the delete query for personnel
$query = $conn->prepare('DELETE FROM personnel WHERE id = ?');

// Check if preparation was successful
if ($query === false) {
    echo json_encode(['status' => 'error', 'message' => 'Query preparation failed: ' . $conn->error]);
    $conn->close();
    exit;
}

// Bind parameters and execute the delete query
$query->bind_param("i", $id);
$query->execute();

// Check for execution success
if ($query->errno) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete personnel record: ' . $query->error]);
} else {
    echo json_encode(['status' => 'success', 'message' => 'Personnel record deleted successfully']);
}

// Close the statement and connection
$query->close();
$conn->close();
?>
