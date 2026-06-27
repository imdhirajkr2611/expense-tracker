<?php
/**
 * Expense API Endpoints
 * Handles CRUD operations for expenses
 */

require_once 'config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? null;

switch ($action) {
    case 'get_all':
        getExpenses();
        break;
    case 'add':
        addExpense();
        break;
    case 'delete':
        deleteExpense();
        break;
    case 'update':
        updateExpense();
        break;
    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
        break;
}

/**
 * Get all expenses
 */
function getExpenses() {
    global $conn;
    
    $query = "SELECT id, category, amount, description, date FROM expenses ORDER BY date DESC";
    $result = $conn->query($query);
    
    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Query failed: ' . $conn->error
        ]);
        return;
    }
    
    $expenses = [];
    while ($row = $result->fetch_assoc()) {
        $row['amount'] = floatval($row['amount']);
        $expenses[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'expenses' => $expenses
    ]);
}

/**
 * Add new expense
 */
function addExpense() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!isset($data['category'], $data['amount'], $data['description'], $data['date'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields'
        ]);
        return;
    }
    
    $category = $conn->real_escape_string($data['category']);
    $amount = floatval($data['amount']);
    $description = $conn->real_escape_string($data['description']);
    $date = $conn->real_escape_string($data['date']);
    
    // Validate amount
    if ($amount <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Amount must be greater than 0'
        ]);
        return;
    }
    
    // Insert expense
    $query = "INSERT INTO expenses (category, amount, description, date, created_at) 
              VALUES ('$category', $amount, '$description', '$date', NOW())";
    
    if ($conn->query($query)) {
        echo json_encode([
            'success' => true,
            'message' => 'Expense added successfully',
            'id' => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add expense: ' . $conn->error
        ]);
    }
}

/**
 * Delete expense
 */
function deleteExpense() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Expense ID required'
        ]);
        return;
    }
    
    $id = intval($data['id']);
    
    $query = "DELETE FROM expenses WHERE id = $id";
    
    if ($conn->query($query)) {
        echo json_encode([
            'success' => true,
            'message' => 'Expense deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete expense: ' . $conn->error
        ]);
    }
}

/**
 * Update expense
 */
function updateExpense() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Expense ID required'
        ]);
        return;
    }
    
    $id = intval($data['id']);
    $updates = [];
    
    if (isset($data['category'])) {
        $updates[] = "category = '" . $conn->real_escape_string($data['category']) . "'";
    }
    if (isset($data['amount'])) {
        $updates[] = "amount = " . floatval($data['amount']);
    }
    if (isset($data['description'])) {
        $updates[] = "description = '" . $conn->real_escape_string($data['description']) . "'";
    }
    if (isset($data['date'])) {
        $updates[] = "date = '" . $conn->real_escape_string($data['date']) . "'";
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        return;
    }
    
    $query = "UPDATE expenses SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = $id";
    
    if ($conn->query($query)) {
        echo json_encode([
            'success' => true,
            'message' => 'Expense updated successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update expense: ' . $conn->error
        ]);
    }
}
?>
