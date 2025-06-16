// assets/js/main.js
class BudgetApp {
    constructor() {
        // Data utama aplikasi, diambil dari localStorage jika ada
        this.data = {
            income: JSON.parse(localStorage.getItem('budgetapp_income') || '[]'),
            budget: JSON.parse(localStorage.getItem('budgetapp_budget') || '[]'),
            expense: JSON.parse(localStorage.getItem('budgetapp_expense') || '[]')
        };
        
        this.currentEditId = null; // Menyimpan ID item yang sedang diedit
        this.chart = null; // Instance untuk Chart.js
        
        // Inisialisasi semua komponen aplikasi
        this.init();
    }

    // Fungsi inisialisasi utama
    init() {
        this.initSidebar();
        this.initForms();
        this.initDates();
        this.renderAllTables();
        this.updateDashboard();
        this.initChart();
    }

    // =====================================================================
    // BAGIAN SIDEBAR (Tetap sama, tidak ada perubahan)
    // =====================================================================
    initSidebar() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mainContent = document.getElementById('mainContent');
        this.footer = document.getElementById('footer');
        this.navbar = document.getElementById('navbar');
        this.overlay = document.getElementById('overlay');
        this.isMobile = window.innerWidth <= 768;

        if (this.isMobile) {
            this.sidebar.classList.add('collapsed');
        }
        this.updateSidebarUI();

        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        
        this.overlay.addEventListener('click', () => {
            if (this.isMobile) {
                this.collapseSidebar();
            }
        });

        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth <= 768;
            if (newIsMobile !== this.isMobile) {
                this.isMobile = newIsMobile;
                if (this.isMobile) {
                    this.collapseSidebar();
                } else {
                    this.overlay.classList.remove('active');
                    this.updateSidebarUI();
                }
            }
        });

        this.handleMenuClicks();
    }

    toggleSidebar() {
        if (this.sidebar.classList.contains('collapsed')) {
            this.expandSidebar();
        } else {
            this.collapseSidebar();
        }
    }

    expandSidebar() {
        this.sidebar.classList.remove('collapsed');
        if (this.isMobile) {
            this.overlay.classList.add('active');
        }
        this.updateSidebarUI();
    }

    collapseSidebar() {
        this.sidebar.classList.add('collapsed');
        if (this.isMobile) {
            this.overlay.classList.remove('active');
        }
        this.updateSidebarUI();
    }

    updateSidebarUI() {
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            this.sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
            if (!this.isMobile) {
                this.mainContent.classList.add('sidebar-collapsed');
                this.footer.classList.add('sidebar-collapsed');
                this.navbar.classList.add('sidebar-collapsed');
            }
        } else { 
            this.sidebarToggle.innerHTML = '<i class="fas fa-times"></i>';
            if (!this.isMobile) {
                this.mainContent.classList.remove('sidebar-collapsed');
                this.footer.classList.remove('sidebar-collapsed');
                this.navbar.classList.remove('sidebar-collapsed');
            }
        }
    }

    handleMenuClicks() {
        const menuItems = document.querySelectorAll('.sidebar-menu a');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    this.showPage(page);
                    menuItems.forEach(menuItem => menuItem.classList.remove('active'));
                    item.classList.add('active');
                    if (this.isMobile) {
                        this.collapseSidebar();
                    }
                }
            });
        });
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            if (pageId === 'dashboard') {
                this.updateDashboard();
                this.updateChart();
            } else if (pageId === 'history') {
                this.renderHistoryTable();
            }
        }
    }
    // =====================================================================
    // AKHIR BAGIAN SIDEBAR
    // =====================================================================

    // ... Sisa fungsi helper (formatCurrency, formatDate, dll) tetap sama ...
    initForms() {
        document.getElementById('incomeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIncome();
        });
        document.getElementById('budgetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBudget();
        });
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExpense();
        });
    }

    initDates() {
        const today = this.getCurrentDate();
        document.getElementById('incomeDate').value = today;
        document.getElementById('expenseDate').value = today;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }
    
    showAlert(title, message, type = 'success') {
        switch(type) {
            case 'success':
                AlertHandler.success(title, message);
                break;
            case 'error':
                AlertHandler.error(title, message);
                break;
            case 'warning':
                AlertHandler.warning(title, message);
                break;
            default:
                AlertHandler.info(title, message);
        }
    }

    deleteIncome(id) {
        AlertHandler.confirm('Konfirmasi', 'Apakah Anda yakin ingin menghapus data pemasukkan ini?', () => {
            this.data.income = this.data.income.filter(item => item.id !== id);
            this.saveData();
            this.renderIncomeTable();
            this.updateDashboard();
            this.updateChart();
            AlertHandler.success('Berhasil!', 'Data pemasukkan berhasil dihapus!');
        });
    }

    deleteBudget(id) {
        AlertHandler.confirm('Konfirmasi', 'Apakah Anda yakin ingin menghapus alokasi budget ini? Ini juga akan menghapus semua data pengeluaran yang terkait.', () => {
            this.data.expense = this.data.expense.filter(exp => exp.budgetAllocationId !== id);
            this.data.budget = this.data.budget.filter(item => item.id !== id);
            this.saveData();
            this.renderBudgetTable();
            this.renderExpenseTable();
            this.updateDashboard();
            this.updateChart();
            AlertHandler.success('Berhasil!', 'Alokasi budget berhasil dihapus!');
        });
    }

    deleteExpense(id) {
        AlertHandler.confirm('Konfirmasi', 'Apakah Anda yakin ingin menghapus data pengeluaran ini?', () => {
            const expense = this.data.expense.find(item => item.id === id);
            if (expense) {
                const budget = this.data.budget.find(b => b.id === expense.budgetAllocationId);
                if (budget) {
                    budget.spent -= expense.amount;
                }
            }
            
            this.data.expense = this.data.expense.filter(item => item.id !== id);
            this.saveData();
            this.renderExpenseTable();
            this.renderBudgetTable();
            this.updateDashboard();
            this.updateChart();
            AlertHandler.success('Berhasil!', 'Data pengeluaran berhasil dihapus!');
        });
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.remove('active');
        }
    }

    resetForm(formId) {
        const form = document.getElementById(formId);
        if(form) {
            form.reset();
            if (formId === 'incomeForm' || formId === 'expenseForm') {
                document.getElementById(formId.replace('Form', 'Date')).value = this.getCurrentDate();
            }
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    saveData() {
        localStorage.setItem('budgetapp_income', JSON.stringify(this.data.income));
        localStorage.setItem('budgetapp_budget', JSON.stringify(this.data.budget));
        localStorage.setItem('budgetapp_expense', JSON.stringify(this.data.expense));
    }


    // ------ MANAJEMEN PEMASUKKAN (INCOME) - Tidak ada perubahan ------
    saveIncome() {
        const income = {
            id: this.currentEditId || this.generateId(),
            date: document.getElementById('incomeDate').value,
            category: document.getElementById('incomeCategory').value.trim(),
            amount: parseFloat(document.getElementById('incomeAmount').value),
            description: document.getElementById('incomeDescription').value.trim()
        };

        if (this.currentEditId) {
            const index = this.data.income.findIndex(item => item.id === this.currentEditId);
            if (index !== -1) this.data.income[index] = income;
        } else {
            this.data.income.push(income);
        }

        this.saveData();
        this.renderIncomeTable();
        this.updateDashboard();
        this.updateChart();
        this.closeModal('incomeModal');
        this.showAlert('Berhasil!', 'Data pemasukkan berhasil disimpan!', 'success');
        this.resetForm('incomeForm');
        this.currentEditId = null;
    }

    showIncomeModal(id = null) {
        this.currentEditId = id;
        const modal = document.getElementById('incomeModal');
        const title = modal.querySelector('.modal-title');
        this.resetForm('incomeForm');
        
        if (id) {
            const income = this.data.income.find(item => item.id === id);
            if (income) {
                document.getElementById('incomeDate').value = income.date;
                document.getElementById('incomeCategory').value = income.category;
                document.getElementById('incomeAmount').value = income.amount;
                document.getElementById('incomeDescription').value = income.description;
                title.textContent = 'Edit Pemasukkan';
            }
        } else {
            title.textContent = 'Tambah Pemasukkan';
        }
        
        modal.classList.add('active');
    }

    renderIncomeTable() {
        const tbody = document.getElementById('incomeTableBody');
        tbody.innerHTML = '';
        if (this.data.income.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada data pemasukkan.</td></tr>';
            return;
        }
        this.data.income.forEach(income => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${this.formatDate(income.date)}</td>
                <td>${income.category}</td>
                <td>${this.formatCurrency(income.amount)}</td>
                <td>${income.description || '-'}</td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="app.showIncomeModal('${income.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteIncome('${income.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }

    // ------ MANAJEMEN BUDGET - Tidak ada perubahan ------
    saveBudget() {
        const budget = {
            id: this.currentEditId || this.generateId(),
            name: document.getElementById('budgetName').value.trim(),
            amount: parseFloat(document.getElementById('budgetAmount').value),
            description: document.getElementById('budgetDescription').value.trim()
        };

        if (this.currentEditId) {
            const index = this.data.budget.findIndex(item => item.id === this.currentEditId);
            if (index !== -1) {
                budget.spent = this.data.budget[index].spent; // Pertahankan nilai 'spent' yang sudah ada
                this.data.budget[index] = budget;
            }
        } else {
            budget.spent = 0; // Set 'spent' ke 0 untuk budget baru
            this.data.budget.push(budget);
        }

        this.saveData();
        this.renderBudgetTable();
        this.updateDashboard();
        this.updateChart();
        this.closeModal('budgetModal');
        this.showAlert('Berhasil!', 'Data alokasi budget berhasil disimpan!', 'success');
        this.resetForm('budgetForm');
        this.currentEditId = null;
    }

    showBudgetModal(id = null) {
        this.currentEditId = id;
        const modal = document.getElementById('budgetModal');
        const title = modal.querySelector('.modal-title');
        this.resetForm('budgetForm');
        
        if (id) {
            const budget = this.data.budget.find(item => item.id === id);
            if (budget) {
                document.getElementById('budgetName').value = budget.name;
                document.getElementById('budgetAmount').value = budget.amount;
                document.getElementById('budgetDescription').value = budget.description;
                title.textContent = 'Edit Alokasi Budget';
            }
        } else {
            title.textContent = 'Tambah Alokasi Budget';
        }
        
        modal.classList.add('active');
    }

    renderBudgetTable() {
        const tbody = document.getElementById('budgetTableBody');
        tbody.innerHTML = '';
        if (this.data.budget.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada alokasi budget.</td></tr>';
            return;
        }
        this.data.budget.forEach(budget => {
            const remaining = budget.amount - (budget.spent || 0);
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${budget.name}</td>
                <td>${this.formatCurrency(budget.amount)}</td>
                <td>${this.formatCurrency(budget.spent || 0)}</td>
                <td style="color: ${remaining >= 0 ? '#2dce89' : '#fb6340'}; font-weight: bold;">${this.formatCurrency(remaining)}</td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="app.showBudgetModal('${budget.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteBudget('${budget.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }

    // ------ MANAJEMEN PENGELUARAN (EXPENSE) - PERUBAHAN ------
    saveExpense() {
        const expenseAmount = parseFloat(document.getElementById('expenseAmount').value);
        const expense = {
            id: this.currentEditId || this.generateId(),
            date: document.getElementById('expenseDate').value,
            // PERUBAHAN: Kategori income dihapus
            budgetAllocationId: document.getElementById('expenseBudgetAllocation').value,
            budgetAllocationName: document.getElementById('expenseBudgetAllocation').selectedOptions[0].text,
            amount: expenseAmount,
            description: document.getElementById('expenseDescription').value.trim()
        };

        if (!expense.budgetAllocationId) {
            this.showAlert('Error!', 'Silakan pilih alokasi budget.', 'error');
            return;
        }

        // Logika untuk mengupdate budget.spent
        if (this.currentEditId) {
            const index = this.data.expense.findIndex(item => item.id === this.currentEditId);
            if (index !== -1) {
                const oldExpense = this.data.expense[index];
                const oldBudget = this.data.budget.find(b => b.id === oldExpense.budgetAllocationId);
                // Kembalikan amount lama ke budget lama
                if (oldBudget) oldBudget.spent -= oldExpense.amount;
                
                this.data.expense[index] = expense;
            }
        } else {
            this.data.expense.push(expense);
        }

        // Tambahkan amount baru ke budget yang sesuai
        const budget = this.data.budget.find(b => b.id === expense.budgetAllocationId);
        if (budget) {
             if (!budget.spent) budget.spent = 0;
            budget.spent += expense.amount;
        }

        this.saveData();
        this.renderExpenseTable();
        this.renderBudgetTable();
        this.updateDashboard();
        this.updateChart();
        this.closeModal('expenseModal');
        this.showAlert('Berhasil!', 'Data pengeluaran berhasil disimpan!', 'success');
        this.resetForm('expenseForm');
        this.currentEditId = null;
    }

    showExpenseModal(id = null) {
        this.currentEditId = id;
        const modal = document.getElementById('expenseModal');
        const title = modal.querySelector('.modal-title');
        this.resetForm('expenseForm');
        
        // PERUBAHAN: Populasi kategori income dihapus

        // Populate budget allocations
        const budgetSelect = document.getElementById('expenseBudgetAllocation');
        budgetSelect.innerHTML = '<option value="">Pilih Alokasi Budget</option>';
        this.data.budget.forEach(budget => {
            budgetSelect.innerHTML += `<option value="${budget.id}">${budget.name}</option>`;
        });
        
        if (id) {
            const expense = this.data.expense.find(item => item.id === id);
            if (expense) {
                document.getElementById('expenseDate').value = expense.date;
                document.getElementById('expenseBudgetAllocation').value = expense.budgetAllocationId;
                document.getElementById('expenseAmount').value = expense.amount;
                document.getElementById('expenseDescription').value = expense.description;
                title.textContent = 'Edit Pengeluaran';
            }
        } else {
            title.textContent = 'Tambah Pengeluaran';
        }
        
        modal.classList.add('active');
    }

    renderExpenseTable() {
        const tbody = document.getElementById('expenseTableBody');
        tbody.innerHTML = '';
        if (this.data.expense.length === 0) {
             // PERUBAHAN: Colspan disesuaikan dari 6 menjadi 5
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada data pengeluaran.</td></tr>';
            return;
        }
        this.data.expense.forEach(expense => {
            const row = tbody.insertRow();
            // PERUBAHAN: Kolom kategori income dihapus dari render
            row.innerHTML = `
                <td>${this.formatDate(expense.date)}</td>
                <td>${expense.budgetAllocationName}</td>
                <td>${this.formatCurrency(expense.amount)}</td>
                <td>${expense.description || '-'}</td>
                <td class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="app.showExpenseModal('${expense.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteExpense('${expense.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }

    // ------ MANAJEMEN RIWAYAT (HISTORY) - Tidak ada perubahan signifikan ------
    renderHistoryTable(filteredData = null) {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';

        let transactions = [];
        
        if (!filteredData) {
            this.data.income.forEach(income => {
                transactions.push({ date: income.date, type: 'income', category: income.category, amount: income.amount, description: income.description });
            });
            this.data.expense.forEach(expense => {
                transactions.push({ date: expense.date, type: 'expense', category: expense.budgetAllocationName, amount: expense.amount, description: expense.description });
            });
        } else {
            transactions = filteredData;
        }

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Tidak ada data transaksi yang cocok dengan filter.</td></tr>';
            return;
        }

        transactions.forEach(transaction => {
            const row = tbody.insertRow();
            const typeText = transaction.type === 'income' ? 'Pemasukkan' : 'Pengeluaran';
            const typeClass = transaction.type === 'income' ? 'text-success' : 'text-danger';
            const amountPrefix = transaction.type === 'income' ? '+' : '-';
            
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td><span class="badge ${typeClass}">${typeText}</span></td>
                <td>${transaction.category}</td>
                <td class="${typeClass}">${amountPrefix} ${this.formatCurrency(transaction.amount)}</td>
                <td>${transaction.description || '-'}</td>
            `;
        });
    }

    filterTransactions() {
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;
        const type = document.getElementById('filterType').value;

        let transactions = [];
        this.data.income.forEach(income => transactions.push({ ...income, type: 'income' }));
        // PERUBAHAN: 'category' untuk expense diambil dari budgetAllocationName
        this.data.expense.forEach(expense => transactions.push({ ...expense, type: 'expense', category: expense.budgetAllocationName }));

        if (startDate) transactions = transactions.filter(t => t.date >= startDate);
        if (endDate) transactions = transactions.filter(t => t.date <= endDate);
        if (type) transactions = transactions.filter(t => t.type === type);

        this.renderHistoryTable(transactions);
    }

    resetFilter() {
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        document.getElementById('filterType').value = '';
        this.renderHistoryTable();
    }
    
    // ------ DASHBOARD & CHART ------
    updateDashboard() {
        const totals = this.calculateTotals();
        document.getElementById('totalIncome').textContent = this.formatCurrency(totals.totalIncome);
        document.getElementById('totalBudget').textContent = this.formatCurrency(totals.totalBudget);
        document.getElementById('totalExpense').textContent = this.formatCurrency(totals.totalExpenses);
        document.getElementById('remainingBalance').textContent = this.formatCurrency(totals.remainingFunds);
        this.updateRecentActivities();
    }

    calculateTotals() {
        const totalIncome = this.data.income.reduce((sum, item) => sum + item.amount, 0);
        const totalBudget = this.data.budget.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = this.data.expense.reduce((sum, item) => sum + item.amount, 0);
        const remainingFunds = totalIncome - totalExpenses;
        return { totalIncome, totalBudget, totalExpenses, remainingFunds };
    }

    // PERUBAHAN: Fungsi ini diubah total untuk merender tabel
    updateRecentActivities() {
        const activities = [];
        this.data.income.forEach(i => activities.push({ 
            date: i.date, 
            type: 'income', 
            text: `${i.category}`,
            amount: i.amount 
        }));
        this.data.expense.forEach(e => activities.push({ 
            date: e.date, 
            type: 'expense', 
            text: `${e.budgetAllocationName}`,
            amount: e.amount
        }));

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const recentActivities = activities.slice(0, 5);
        const container = document.getElementById('recentActivitiesBody');
        container.innerHTML = ''; // Kosongkan isi tabel sebelumnya
        
        if (recentActivities.length === 0) {
            container.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #8898aa;">Belum ada aktivitas...</td></tr>';
        } else {
            container.innerHTML = recentActivities.map(activity => {
                const typeClass = activity.type === 'income' ? 'text-success' : 'text-danger';
                const typeText = activity.type === 'income' ? 'Pemasukkan' : 'Pengeluaran';
                const amountPrefix = activity.type === 'income' ? '+' : '-';

                return `
                    <tr>
                        <td><span class="badge ${typeClass}">${typeText}</span></td>
                        <td>${activity.text}</td>
                        <td>${this.formatDate(activity.date)}</td>
                        <td class="${typeClass}" style="text-align: right; font-weight: 500;">${amountPrefix} ${this.formatCurrency(activity.amount)}</td>
                    </tr>`;
            }).join('');
        }
    }


    // ... Sisa fungsi (initChart, updateChart, renderAllTables, downloadReportPDF) tetap sama ...
    initChart() {
        const ctx = document.getElementById('budgetChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [] }, // Data akan diisi oleh updateChart
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => this.formatCurrency(value) }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`
                        }
                    },
                    title: {
                        display: false // Judul dari chart.js dinonaktifkan
                    }
                }
            }
        });
        this.updateChart();
    }

    updateChart() {
        if (!this.chart) return;
        const labels = this.data.budget.map(b => b.name);
        this.chart.data.labels = labels;
        this.chart.data.datasets = [
            {
                label: 'Budget',
                data: this.data.budget.map(b => b.amount),
                backgroundColor: 'rgba(94, 114, 228, 0.8)',
                borderColor: 'rgba(94, 114, 228, 1)',
                borderWidth: 1
            }, {
                label: 'Pengeluaran',
                data: this.data.budget.map(b => b.spent || 0),
                backgroundColor: 'rgba(251, 99, 64, 0.8)',
                borderColor: 'rgba(251, 99, 64, 1)',
                borderWidth: 1
            }
        ];
        this.chart.update();
    }
    
    renderAllTables() {
        this.renderIncomeTable();
        this.renderBudgetTable();
        this.renderExpenseTable();
        this.renderHistoryTable();
    }
    
    async downloadReportPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            let yOffset = 10;
            const margin = 10;
            const pageWidth = doc.internal.pageSize.width;

            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text("Laporan Keuangan", pageWidth / 2, yOffset, { align: 'center' });
            yOffset += 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Tanggal Laporan: ${this.formatDate(this.getCurrentDate())}`, pageWidth / 2, yOffset, { align: 'center' });
            yOffset += 15;

            const totals = this.calculateTotals();
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text("Ringkasan Keuangan", margin, yOffset);
            yOffset += 8;
            
            doc.setFont(undefined, 'normal');
            doc.text(`Total Pemasukan: ${this.formatCurrency(totals.totalIncome)}`, margin + 2, yOffset);
            yOffset += 7;
            doc.text(`Total Pengeluaran: ${this.formatCurrency(totals.totalExpenses)}`, margin + 2, yOffset);
            yOffset += 7;
            
            const remainingColor = totals.remainingFunds >= 0 ? [45, 206, 137] : [251, 99, 64];
            doc.setTextColor(...remainingColor);
            doc.setFont(undefined, 'bold');
            doc.text(`Sisa Dana: ${this.formatCurrency(totals.remainingFunds)}`, margin + 2, yOffset);
            yOffset += 15;
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'normal');
            
            if (this.data.income.length > 0) {
                 doc.autoTable({
                    startY: yOffset,
                    head: [['Tanggal', 'Kategori', 'Keterangan', 'Jumlah']],
                    body: this.data.income.map(item => [this.formatDate(item.date), item.category, item.description || '-', this.formatCurrency(item.amount)]),
                    theme: 'striped',
                    headStyles: { fillColor: [94, 114, 228] }, // Biru
                    didDrawPage: data => yOffset = data.cursor.y,
                    columnStyles: { 3: { halign: 'right' } }
                });
                yOffset = doc.autoTable.previous.finalY + 10;
            }

            if (this.data.expense.length > 0) {
                 doc.autoTable({
                    startY: yOffset,
                    head: [['Tanggal', 'Alokasi Budget', 'Keterangan', 'Jumlah']],
                    body: this.data.expense.map(item => [this.formatDate(item.date), item.budgetAllocationName, item.description || '-', this.formatCurrency(item.amount)]),
                    theme: 'striped',
                    headStyles: { fillColor: [251, 99, 64] }, // Oranye
                    didDrawPage: data => yOffset = data.cursor.y,
                    columnStyles: { 3: { halign: 'right' } }
                });
                 yOffset = doc.autoTable.previous.finalY + 10;
            }
            
            const fileName = `Laporan_Keuangan_${this.getCurrentDate().replace(/-/g, '')}.pdf`;
            doc.save(fileName);
            this.showAlert('Berhasil!', 'Laporan PDF berhasil diunduh!');

        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showAlert('Error!', 'Terjadi kesalahan saat membuat laporan PDF. Silakan coba lagi.');
        }
    }
}

// Inisialisasi aplikasi setelah DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Pastikan pengguna sudah login sebelum inisialisasi aplikasi
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.app = new BudgetApp();
    }
});