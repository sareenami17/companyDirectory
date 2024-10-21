<?php
// Enable error reporting (remove these lines in production)
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Include the database configuration
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

// Create a new database connection
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check for connection errors
if ($conn->connect_errno) {
    echo json_encode([
        'status' => [
            'code' => "300",
            'name' => "failure",
            'description' => "Database unavailable: " . $conn->connect_error,
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ]);
    exit;
}

// Retrieve the POST variable and sanitize input
$searchText = isset($_POST['txt']) ? trim($_POST['txt']) : '';

// Prepare the SQL query to get employee data
$query = $conn->prepare('
    SELECT p.id, p.firstName, p.lastName, p.email, p.jobTitle, 
           d.id AS departmentID, d.name AS department, 
           l.id AS locationID, l.name AS location
    FROM personnel p
    LEFT JOIN department d ON d.id = p.departmentID
    LEFT JOIN location l ON l.id = d.locationID
    WHERE p.firstName LIKE ? OR p.lastName LIKE ? OR p.email LIKE ? OR p.jobTitle LIKE ? OR d.name LIKE ? OR l.name LIKE ?
    ORDER BY p.lastName, p.firstName
');

// Prepare the LIKE parameter
$likeText = "%" . $conn->real_escape_string($searchText) . "%";

// Bind parameters (6 parameters for the query)
$query->bind_param("ssssss", $likeText, $likeText, $likeText, $likeText, $likeText, $likeText);

// Execute the query
if (!$query->execute()) {
    echo json_encode([
        'status' => [
            'code' => "400",
            'name' => "error",
            'description' => "Query execution failed: " . $query->error,
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ]);
    exit;
}

// Get the result
$result = $query->get_result();
$found = [];

// Fetch results
while ($row = $result->fetch_assoc()) {
    // Ensure department and location are set properly
    $row['department'] = $row['department'] ?? 'No Department';
    $row['location'] = $row['location'] ?? 'No Location';
    $found[] = $row; // Using [] instead of array_push for cleaner code
}

// Prepare the output
$output = [
    'status' => [
        'code' => "200",
        'name' => "ok",
        'description' => "success",
        'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
    ],
    'data' => [
        'found' => $found
    ]
];

// Close the statement and connection
$query->close();
$conn->close();

// Return the JSON output
echo json_encode($output);
?>
