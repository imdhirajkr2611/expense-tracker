<?php
/**
 * Charts API Endpoint
 * Provides data for Chart.js visualizations
 */

require_once 'config.php';

$type = $_GET['type'] ?? 'category';
$month = $_GET['month'] ?? null;
$year = $_GET['year'] ?? date('Y');

switch ($type) {
    case 'category':
        getCategoryData($month, $year);
        break;
    case 'monthly':
        getMonthlyData($year);
        break;
    case 'summary':
        getSummaryData();
        break;
    default:
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid chart type'
        ]);
        break;
}

/**
 * Get spending data by category
 */
function getCategoryData($month = null, $year = null) {
    global $conn;
    
    $query = "SELECT category, SUM(amount) as total FROM expenses WHERE 1=1";
    
    if ($month && $year) {
        $query .= " AND MONTH(date) = $month AND YEAR(date) = $year";
    } elseif ($year) {
        $query .= " AND YEAR(date) = $year";
    }
    
    $query .= " GROUP BY category ORDER BY total DESC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Query failed: ' . $conn->error
        ]);
        return;
    }
    
    $categories = [];
    $totals = [];
    
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row['category'];
        $totals[] = floatval($row['total']);
    }
    
    echo json_encode([
        'success' => true,
        'labels' => $categories,
        'data' => $totals
    ]);
}

/**
 * Get monthly spending trends
 */
function getMonthlyData($year = null) {
    global $conn;
    
    if (!$year) {
        $year = date('Y');
    }
    
    $query = "SELECT MONTH(date) as month, SUM(amount) as total 
              FROM expenses 
              WHERE YEAR(date) = $year 
              GROUP BY MONTH(date) 
              ORDER BY month";
    
    $result = $conn->query($query);
    
    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Query failed: ' . $conn->error
        ]);
        return;
    }
    
    $monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    $months = [];
    $totals = [];
    
    // Initialize all months with 0
    for ($i = 1; $i <= 12; $i++) {
        $months[] = substr($monthNames[$i], 0, 3);
        $totals[] = 0;
    }
    
    // Fill in actual data
    while ($row = $result->fetch_assoc()) {
        $monthIndex = intval($row['month']) - 1;
        $totals[$monthIndex] = floatval($row['total']);
    }
    
    echo json_encode([
        'success' => true,
        'labels' => $months,
        'data' => $totals
    ]);
}

/**
 * Get summary statistics
 */
function getSummaryData() {
    global $conn;
    
    // Total expenses
    $totalResult = $conn->query("SELECT SUM(amount) as total FROM expenses");
    $totalRow = $totalResult->fetch_assoc();
    $total = floatval($totalRow['total'] ?? 0);
    
    // Count of expenses
    $countResult = $conn->query("SELECT COUNT(*) as count FROM expenses");
    $countRow = $countResult->fetch_assoc();
    $count = intval($countRow['count']);
    
    // Average expense
    $average = $count > 0 ? $total / $count : 0;
    
    // This month's total
    $monthResult = $conn->query("SELECT SUM(amount) as total FROM expenses WHERE MONTH(date) = MONTH(NOW()) AND YEAR(date) = YEAR(NOW())");
    $monthRow = $monthResult->fetch_assoc();
    $monthTotal = floatval($monthRow['total'] ?? 0);
    
    echo json_encode([
        'success' => true,
        'total' => $total,
        'count' => $count,
        'average' => $average,
        'monthTotal' => $monthTotal
    ]);
}
?>
