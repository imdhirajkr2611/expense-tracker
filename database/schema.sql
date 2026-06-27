-- Create Database
CREATE DATABASE IF NOT EXISTS `expense_tracker`;
USE `expense_tracker`;

-- Create Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier',
  `category` VARCHAR(50) NOT NULL COMMENT 'Expense category (Food, Transport, etc.)',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT 'Expense amount',
  `description` VARCHAR(255) NOT NULL COMMENT 'Expense description',
  `date` DATE NOT NULL COMMENT 'Date of expense',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
  INDEX `idx_category` (`category`),
  INDEX `idx_date` (`date`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores user expenses';

-- Insert Sample Data
INSERT INTO `expenses` (`category`, `amount`, `description`, `date`) VALUES
('Food', 25.50, 'Lunch at cafe', '2024-06-27'),
('Transport', 15.00, 'Uber ride to office', '2024-06-26'),
('Shopping', 45.99, 'New shoes', '2024-06-25'),
('Entertainment', 30.00, 'Movie tickets', '2024-06-24'),
('Bills', 100.00, 'Internet bill', '2024-06-20'),
('Food', 12.75, 'Coffee and breakfast', '2024-06-23'),
('Transport', 8.50, 'Bus fare', '2024-06-22'),
('Health', 50.00, 'Gym membership', '2024-06-21'),
('Education', 35.00, 'Online course', '2024-06-19'),
('Entertainment', 20.00, 'Concert ticket', '2024-06-18');
