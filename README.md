# Expense Tracker Web App

A full-stack web application for tracking personal expenses with interactive charts showing spending by category.

## Features

- ✅ Add, edit, and delete expenses
- ✅ Categorize expenses (Food, Transport, Entertainment, etc.)
- ✅ Interactive pie/bar charts using Chart.js
- ✅ Monthly expense summary
- ✅ Filter expenses by category and date
- ✅ Responsive design
- ✅ Data persistence with MySQL database

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Bootstrap)
- JavaScript (Vanilla)
- Chart.js for data visualization

**Backend:**
- PHP 7.4+
- MySQL 5.7+

## Project Structure

```
expense-tracker/
├── index.html              # Main frontend
├── css/
│   └── style.css          # Custom styles
├── js/
│   └── app.js             # Frontend logic
├── api/
│   ├── config.php         # Database connection
│   ├── expenses.php       # Expense CRUD operations
│   └── charts.php         # Chart data endpoints
├── database/
│   └── schema.sql         # Database schema
└── README.md
```

## Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL Server
- A local development server (XAMPP, WAMP, or LAMP)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/imdhirajkr2611/expense-tracker.git
   cd expense-tracker
   ```

2. **Import the database schema**
   - Open phpMyAdmin
   - Create a new database named `expense_tracker`
   - Import `database/schema.sql`

3. **Configure database connection**
   - Edit `api/config.php`
   - Update database credentials

4. **Start your local server**
   ```bash
   # If using XAMPP, place files in htdocs/
   # Then access: http://localhost/expense-tracker/
   ```

5. **Open in browser**
   - Navigate to `http://localhost/expense-tracker/index.html`

## API Endpoints

### Add Expense
```
POST /api/expenses.php
{
  "action": "add",
  "category": "Food",
  "amount": 25.50,
  "description": "Lunch",
  "date": "2024-06-27"
}
```

### Get All Expenses
```
GET /api/expenses.php?action=get_all
```

### Get Chart Data
```
GET /api/charts.php?type=category&month=06&year=2024
```

### Delete Expense
```
POST /api/expenses.php
{
  "action": "delete",
  "id": 1
}
```

## Usage

1. Fill in the expense form with category, amount, description, and date
2. Click "Add Expense" to save
3. View your expenses in the table below
4. Check out the charts to visualize spending by category
5. Filter by category or date range as needed

## Screenshots

(Add screenshots here)

## Contributing

Feel free to fork and submit pull requests!

## License

MIT License
