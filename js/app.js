// Expense Tracker App
class ExpenseTracker {
    constructor() {
        this.expenses = [];
        this.filteredExpenses = [];
        this.categoryChart = null;
        this.monthlyChart = null;
        this.currentFilter = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExpenses();
        this.setTodayDate();
    }

    setupEventListeners() {
        document.getElementById('expenseForm').addEventListener('submit', (e) => this.handleAddExpense(e));
        document.getElementById('filterCategory').addEventListener('change', (e) => this.handleFilter(e));
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    async loadExpenses() {
        try {
            this.showLoading(true);
            const response = await fetch('api/expenses.php?action=get_all');
            const data = await response.json();
            
            if (data.success) {
                this.expenses = data.expenses || [];
                this.filteredExpenses = [...this.expenses];
                this.render();
                this.updateCharts();
                this.updateStats();
            } else {
                this.showAlert(data.message || 'Failed to load expenses', 'danger');
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
            // Use mock data for demo
            this.useMockData();
        } finally {
            this.showLoading(false);
        }
    }

    useMockData() {
        this.expenses = [
            {
                id: 1,
                category: 'Food',
                amount: 25.50,
                description: 'Lunch at cafe',
                date: '2024-06-27'
            },
            {
                id: 2,
                category: 'Transport',
                amount: 15.00,
                description: 'Uber ride',
                date: '2024-06-26'
            },
            {
                id: 3,
                category: 'Shopping',
                amount: 45.99,
                description: 'New shoes',
                date: '2024-06-25'
            },
            {
                id: 4,
                category: 'Entertainment',
                amount: 30.00,
                description: 'Movie tickets',
                date: '2024-06-24'
            },
            {
                id: 5,
                category: 'Bills',
                amount: 100.00,
                description: 'Internet bill',
                date: '2024-06-20'
            }
        ];
        this.filteredExpenses = [...this.expenses];
        this.render();
        this.updateCharts();
        this.updateStats();
    }

    async handleAddExpense(e) {
        e.preventDefault();

        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;

        if (!category || !amount || !description || !date) {
            this.showAlert('Please fill in all fields', 'danger');
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch('api/expenses.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'add',
                    category,
                    amount,
                    description,
                    date
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Expense added successfully!', 'success');
                document.getElementById('expenseForm').reset();
                this.setTodayDate();
                this.loadExpenses();
            } else {
                this.showAlert(data.message || 'Failed to add expense', 'danger');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            // Add to mock data for demo
            const newExpense = {
                id: Math.max(...this.expenses.map(e => e.id), 0) + 1,
                category,
                amount,
                description,
                date
            };
            this.expenses.push(newExpense);
            this.filteredExpenses = [...this.expenses];
            this.showAlert('Expense added (demo mode)', 'success');
            document.getElementById('expenseForm').reset();
            this.setTodayDate();
            this.render();
            this.updateCharts();
            this.updateStats();
        } finally {
            this.showLoading(false);
        }
    }

    async deleteExpense(id) {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch('api/expenses.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'delete',
                    id
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Expense deleted successfully!', 'success');
                this.loadExpenses();
            } else {
                this.showAlert(data.message || 'Failed to delete expense', 'danger');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            // Delete from mock data for demo
            this.expenses = this.expenses.filter(e => e.id !== id);
            this.filteredExpenses = this.filteredExpenses.filter(e => e.id !== id);
            this.showAlert('Expense deleted (demo mode)', 'success');
            this.render();
            this.updateCharts();
            this.updateStats();
        } finally {
            this.showLoading(false);
        }
    }

    handleFilter(e) {
        const category = e.target.value;
        this.currentFilter = category;

        if (category) {
            this.filteredExpenses = this.expenses.filter(expense => expense.category === category);
        } else {
            this.filteredExpenses = [...this.expenses];
        }

        this.render();
        this.updateCharts();
        this.updateStats();
    }

    clearFilters() {
        document.getElementById('filterCategory').value = '';
        this.currentFilter = null;
        this.filteredExpenses = [...this.expenses];
        this.render();
        this.updateCharts();
        this.updateStats();
    }

    render() {
        this.renderExpenseTable();
        document.getElementById('expenseCount').textContent = this.filteredExpenses.length;
    }

    renderExpenseTable() {
        const tbody = document.getElementById('expenseTable');

        if (this.filteredExpenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No expenses found.</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredExpenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(expense => `
                <tr>
                    <td>${this.formatDate(expense.date)}</td>
                    <td><span class="category-badge category-${expense.category.toLowerCase()}">${expense.category}</span></td>
                    <td>${expense.description}</td>
                    <td><span class="amount-text">$${parseFloat(expense.amount).toFixed(2)}</span></td>
                    <td>
                        <button class="btn-delete" onclick="app.deleteExpense(${expense.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    updateStats() {
        const total = this.filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const count = this.filteredExpenses.length;
        const average = count > 0 ? total / count : 0;

        // Update navbar
        document.getElementById('totalExpenses').textContent = `$${total.toFixed(2)}`;

        // Update statistics cards
        document.getElementById('statTotal').textContent = `$${total.toFixed(2)}`;
        document.getElementById('statCount').textContent = count;
        document.getElementById('statAverage').textContent = `$${average.toFixed(2)}`;
    }

    updateCharts() {
        this.updateCategoryChart();
        this.updateMonthlyChart();
    }

    updateCategoryChart() {
        const categoryData = {};

        this.filteredExpenses.forEach(expense => {
            if (!categoryData[expense.category]) {
                categoryData[expense.category] = 0;
            }
            categoryData[expense.category] += parseFloat(expense.amount);
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#ffeaa7',
                        '#74b9ff',
                        '#fd79a8',
                        '#fab1a0',
                        '#a29bfe',
                        '#90ee90',
                        '#81ecec',
                        '#dfe6e9'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateMonthlyChart() {
        const monthlyData = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize all months with 0
        monthNames.forEach(month => {
            monthlyData[month] = 0;
        });

        // Sum expenses by month
        this.filteredExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthIndex = date.getMonth();
            const monthName = monthNames[monthIndex];
            monthlyData[monthName] += parseFloat(expense.amount);
        });

        const labels = Object.keys(monthlyData);
        const data = Object.values(monthlyData);

        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
        }

        this.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Spending',
                    data: data,
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    showLoading(show) {
        document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ExpenseTracker();
});
