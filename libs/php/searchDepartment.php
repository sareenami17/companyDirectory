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

// Prepare the query to get department data along with location information
$query = $conn->prepare('
    SELECT d.id AS id, d.name AS name, l.name AS locationName
    FROM department d
    LEFT JOIN location l ON l.id = d.locationID
    WHERE d.name LIKE ? OR l.name LIKE ?
    ORDER BY d.name
');

// Prepare the LIKE parameter
$likeText = "%" . $conn->real_escape_string($searchText) . "%";

// Bind parameters
$query->bind_param("ss", $likeText, $likeText);

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

// Fetch results and include location name
while ($row = $result->fetch_assoc()) {
    // Prepare the response to include location info
    $row['location'] = $row['locationName'] ?? 'Unknown'; // Set the location field
    unset($row['locationName']); // Remove the raw location name if not needed
    $found[] = $row; // Use [] for cleaner syntax
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
