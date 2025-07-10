document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
    
    // Check if this is a demo session
    const isDemo = localStorage.getItem('pharmaNexusToken') === 'demo_token';
    if(isDemo) {
        // Set up demo data refresh interval
        setInterval(updateDemoData, 5000);
    }
});

// Global variables
let inventoryData = [];
let alertData = [];
let currentPage = 1;
const itemsPerPage = 10;
let sortColumn = 'name';
let sortDirection = 'asc';

// Initialize dashboard
function initDashboard() {
    // Set up navigation
    setupNavigation();
    
    // Initialize all charts
    initCharts();
    
    // Load all data
    loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize real-time updates
    initRealTimeUpdates();
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar li');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the section to show
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Load section-specific data if needed
    switch(sectionId) {
        case 'inventory':
            loadInventoryData();
            break;
        case 'monitoring':
            initSensorMonitoring();
            break;
        case 'forecasting':
            updateForecastData();
            break;
        case 'alerts':
            loadAlertData();
            break;
    }
}

function setupEventListeners() {
    // Notification bell click
    document.getElementById('notificationBell').addEventListener('click', function() {
        showSection('alerts');
    });
    
    // Global search
    document.getElementById('globalSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        if(searchTerm.length > 2) {
            searchAllSections(searchTerm);
        }
    });
    
    // Alert filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterAlerts(this.getAttribute('data-filter'));
        });
    });
}

function initRealTimeUpdates() {
    // Simulate real-time data updates
    setInterval(() => {
        updateSensorData();
        updateAlertCount();
    }, 3000);
    
    // Check for expiring medicines every minute
    setInterval(checkExpiringMedicines, 60000);
}

function loadData() {
    // Load stats cards data
    loadStatsData();
    
    // Load initial inventory
    loadInventoryData();
    
    // Load initial alerts for dashboard
    loadRecentAlerts();
    
    // Update alert count
    updateAlertCount();
}

// Stats Data
function loadStatsData() {
    // Simulate API call
    setTimeout(() => {
        const stats = [
            {
                title: "Total Medicines",
                value: "0",
                icon: "fa-pills",
                color: "#4e73df"
            },
            {
                title: "Low Stock",
                value: "0",
                icon: "fa-exclamation-triangle",
                color: "#e74a3b"
            },
            {
                title: "Expiring Soon",
                value: "0",
                icon: "fa-calendar-times",
                color: "#f6c23e"
            },
            {
                title: "Storage Issues",
                value: "0",
                icon: "fa-temperature-high",
                color: "#36b9cc"
            }
        ];
        
        // If demo, populate with demo data
        if(localStorage.getItem('pharmaNexusToken') === 'demo_token') {
            stats[0].value = "124";
            stats[1].value = "8";
            stats[2].value = "5";
            stats[3].value = "2";
        }
        
        const statsContainer = document.getElementById('statsGrid');
        statsContainer.innerHTML = '';
        
        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <div class="stat-icon" style="background-color: ${stat.color}">
                    <i class="fas ${stat.icon}"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-title">${stat.title}</span>
                    <span class="stat-value">${stat.value}</span>
                </div>
            `;
            statsContainer.appendChild(card);
        });
    }, 500);
}

// Inventory Management
function loadInventoryData() {
    // Simulate API call
    setTimeout(() => {
        // Demo data
        if(localStorage.getItem('pharmaNexusToken') === 'demo_token') {
            inventoryData = [
                {
                    id: 1,
                    name: "Paracetamol 500mg",
                    batch: "PC2023001",
                    category: "analgesic",
                    stock: 45,
                    threshold: 50,
                    expiry: "2023-12-15",
                    price: 0.25,
                    supplier: "MediCorp"
                },
                {
                    id: 2,
                    name: "Amoxicillin 250mg",
                    batch: "AM2023002",
                    category: "antibiotic",
                    stock: 12,
                    threshold: 20,
                    expiry: "2024-03-20",
                    price: 1.20,
                    supplier: "PharmaPlus"
                },
                {
                    id: 3,
                    name: "Loratadine 10mg",
                    batch: "LO2023003",
                    category: "antihistamine",
                    stock: 28,
                    threshold: 15,
                    expiry: "2023-11-30",
                    price: 0.75,
                    supplier: "Global Pharma"
                },
                {
                    id: 4,
                    name: "Ibuprofen 200mg",
                    batch: "IB2023004",
                    category: "analgesic",
                    stock: 62,
                    threshold: 30,
                    expiry: "2024-05-15",
                    price: 0.35,
                    supplier: "MediCorp"
                },
                {
                    id: 5,
                    name: "Cetirizine 10mg",
                    batch: "CE2023005",
                    category: "antihistamine",
                    stock: 8,
                    threshold: 10,
                    expiry: "2024-02-28",
                    price: 0.85,
                    supplier: "PharmaPlus"
                },
                {
                    id: 6,
                    name: "Omeprazole 20mg",
                    batch: "OM2023006",
                    category: "antacid",
                    stock: 35,
                    threshold: 20,
                    expiry: "2024-04-10",
                    price: 1.50,
                    supplier: "Global Pharma"
                },
                {
                    id: 7,
                    name: "Diazepam 5mg",
                    batch: "DZ2023007",
                    category: "sedative",
                    stock: 18,
                    threshold: 15,
                    expiry: "2023-10-31",
                    price: 2.25,
                    supplier: "MediCorp"
                },
                {
                    id: 8,
                    name: "Fluconazole 150mg",
                    batch: "FL2023008",
                    category: "antifungal",
                    stock: 22,
                    threshold: 10,
                    expiry: "2024-06-15",
                    price: 3.00,
                    supplier: "PharmaPlus"
                }
            ];
            
            // Update stats
            updateInventoryStats();
        }
        
        renderInventoryTable();
    }, 800);
}

function renderInventoryTable() {
    const tableBody = document.getElementById('inventoryBody');
    tableBody.innerHTML = '';
    
    // Sort data
    inventoryData.sort((a, b) => {
        if(a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if(a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = inventoryData.slice(startIndex, endIndex);
    
    // Update page info
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${Math.ceil(inventoryData.length / itemsPerPage)}`;
    
    // Disable/enable pagination buttons
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === Math.ceil(inventoryData.length / itemsPerPage);
    
    // Populate table
    paginatedData.forEach(item => {
        const status = getInventoryStatus(item.stock, item.threshold, item.expiry);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.batch}</td>
            <td>${formatCategory(item.category)}</td>
            <td>${item.stock}</td>
            <td>${item.threshold}</td>
            <td>${formatDate(item.expiry)}</td>
            <td><span class="status-badge status-${status.type}">${status.text}</span></td>
            <td>
                <button class="btn-action" onclick="editMedicine(${item.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-action" onclick="deleteMedicine(${item.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getInventoryStatus(stock, threshold, expiry) {
    const today = new Date();
    const expiryDate = new Date(expiry);
    const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if(stock <= 0) {
        return { type: 'critical', text: 'Out of Stock' };
    } else if(stock <= threshold * 0.3) {
        return { type: 'critical', text: 'Very Low' };
    } else if(stock <= threshold) {
        return { type: 'warning', text: 'Low' };
    } else if(daysToExpiry <= 30) {
        return { type: 'warning', text: 'Expiring Soon' };
    } else {
        return { type: 'normal', text: 'Normal' };
    }
}

function updateInventoryStats() {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const totalMedicines = inventoryData.length;
    const lowStock = inventoryData.filter(item => item.stock <= item.threshold).length;
    const expiringSoon = inventoryData.filter(item => {
        const expiryDate = new Date(item.expiry);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    }).length;
    
    // Update stats cards if they exist
    const statsCards = document.querySelectorAll('.stat-card');
    if(statsCards.length > 0) {
        statsCards[0].querySelector('.stat-value').textContent = totalMedicines;
        statsCards[1].querySelector('.stat-value').textContent = lowStock;
        statsCards[2].querySelector('.stat-value').textContent = expiringSoon;
    }
}

function sortInventory(column) {
    if(sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update sort indicators
    document.querySelectorAll('#inventoryTable th i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    const header = document.querySelector(`#inventoryTable th[onclick="sortInventory('${column}')"]`);
    if(header) {
        const icon = header.querySelector('i');
        icon.className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
    
    renderInventoryTable();
}

function filterInventory() {
    const filter = document.getElementById('inventoryFilter').value;
    let filteredData = [...inventoryData];
    
    switch(filter) {
        case 'low':
            filteredData = inventoryData.filter(item => item.stock <= item.threshold);
            break;
        case 'expiring':
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            filteredData = inventoryData.filter(item => {
                const expiryDate = new Date(item.expiry);
                return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
            });
            break;
        case 'category':
            const category = prompt('Enter category to filter by:');
            if(category) {
                filteredData = inventoryData.filter(item => 
                    item.category.toLowerCase().includes(category.toLowerCase())
                );
            }
            break;
    }
    
    inventoryData = filteredData;
    currentPage = 1;
    renderInventoryTable();
}

function searchInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    
    if(searchTerm.length === 0) {
        loadInventoryData(); // Reset to full data
        return;
    }
    
    const filteredData = inventoryData.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.batch.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    
    inventoryData = filteredData;
    currentPage = 1;
    renderInventoryTable();
}

function changePage(direction) {
    currentPage += direction;
    renderInventoryTable();
}

function showAddMedicineModal() {
    document.getElementById('addMedicineModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function addMedicine(e) {
    e.preventDefault();
    
    const newMedicine = {
        id: inventoryData.length > 0 ? Math.max(...inventoryData.map(item => item.id)) + 1 : 1,
        name: document.getElementById('medName').value,
        batch: document.getElementById('medBatch').value,
        category: document.getElementById('medCategory').value,
        stock: parseInt(document.getElementById('medStock').value),
        threshold: parseInt(document.getElementById('medThreshold').value),
        expiry: document.getElementById('medExpiry').value,
        price: parseFloat(document.getElementById('medPrice').value) || 0,
        supplier: document.getElementById('medSupplier').value || 'Unknown'
    };
    
    inventoryData.push(newMedicine);
    closeModal('addMedicineModal');
    renderInventoryTable();
    updateInventoryStats();
    
    // Reset form
    document.getElementById('medicineForm').reset();
    
    // Show success message
    showAlert('success', 'Medicine added successfully!');
}

function editMedicine(id) {
    const medicine = inventoryData.find(item => item.id === id);
    if(!medicine) return;
    
    // Populate modal
    document.getElementById('medName').value = medicine.name;
    document.getElementById('medBatch').value = medicine.batch;
    document.getElementById('medCategory').value = medicine.category;
    document.getElementById('medStock').value = medicine.stock;
    document.getElementById('medThreshold').value = medicine.threshold;
    document.getElementById('medExpiry').value = medicine.expiry;
    document.getElementById('medPrice').value = medicine.price;
    document.getElementById('medSupplier').value = medicine.supplier;
    
    // Change modal title and button
    document.querySelector('#addMedicineModal h2').innerHTML = '<i class="fas fa-pills"></i> Edit Medicine';
    document.querySelector('#addMedicineModal button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Save Changes';
    
    // Change form submit handler
    document.getElementById('medicineForm').onsubmit = function(e) {
        e.preventDefault();
        
        // Update medicine
        medicine.name = document.getElementById('medName').value;
        medicine.batch = document.getElementById('medBatch').value;
        medicine.category = document.getElementById('medCategory').value;
        medicine.stock = parseInt(document.getElementById('medStock').value);
        medicine.threshold = parseInt(document.getElementById('medThreshold').value);
        medicine.expiry = document.getElementById('medExpiry').value;
        medicine.price = parseFloat(document.getElementById('medPrice').value) || 0;
        medicine.supplier = document.getElementById('medSupplier').value || 'Unknown';
        
        closeModal('addMedicineModal');
        renderInventoryTable();
        updateInventoryStats();
        
        // Reset form and handler
        document.getElementById('medicineForm').reset();
        document.getElementById('medicineForm').onsubmit = addMedicine;
        document.querySelector('#addMedicineModal h2').innerHTML = '<i class="fas fa-pills"></i> Add New Medicine';
        document.querySelector('#addMedicineModal button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Save Medicine';
        
        // Show success message
        showAlert('success', 'Medicine updated successfully!');
    };
    
    showAddMedicineModal();
}

function deleteMedicine(id) {
    if(confirm('Are you sure you want to delete this medicine?')) {
        inventoryData = inventoryData.filter(item => item.id !== id);
        renderInventoryTable();
        updateInventoryStats();
        showAlert('success', 'Medicine deleted successfully!');
    }
}

function exportInventory() {
    // In a real app, this would generate a CSV or Excel file
    alert('Inventory export functionality would be implemented here');
}

// Sensor Monitoring
function initSensorMonitoring() {
    updateSensorData();
    
    // Initialize sensor charts
    initSensorCharts();
}

function initSensorCharts() {
    // Temperature Chart
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    window.tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: Array(12).fill().map((_, i) => `${i*5} mins ago`).reverse(),
            datasets: [{
                label: 'Temperature (°C)',
                data: Array(12).fill().map(() => Math.random() * 5 + 20),
                borderColor: '#e74a3b',
                backgroundColor: 'rgba(231, 74, 59, 0.05)',
                tension: 0.4,
                fill: true
            }]
        },
        options: getSensorChartOptions('Temperature History')
    });
    
    // Humidity Chart
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');
    window.humidityChart = new Chart(humidityCtx, {
        type: 'line',
        data: {
            labels: Array(12).fill().map((_, i) => `${i*5} mins ago`).reverse(),
            datasets: [{
                label: 'Humidity (%)',
                data: Array(12).fill().map(() => Math.random() * 20 + 40),
                borderColor: '#36b9cc',
                backgroundColor: 'rgba(54, 185, 204, 0.05)',
                tension: 0.4,
                fill: true
            }]
        },
        options: getSensorChartOptions('Humidity History')
    });
    
    // Light Chart
    const lightCtx = document.getElementById('lightChart').getContext('2d');
    window.lightChart = new Chart(lightCtx, {
        type: 'line',
        data: {
            labels: Array(12).fill().map((_, i) => `${i*5} mins ago`).reverse(),
            datasets: [{
                label: 'Light (lux)',
                data: Array(12).fill().map(() => Math.random() * 100 + 50),
                borderColor: '#f6c23e',
                backgroundColor: 'rgba(246, 194, 62, 0.05)',
                tension: 0.4,
                fill: true
            }]
        },
        options: getSensorChartOptions('Light Exposure History')
    });
    
    // Inventory Chart
    const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
    window.inventoryChart = new Chart(inventoryCtx, {
        type: 'line',
        data: {
            labels: Array(12).fill().map((_, i) => `${i} days ago`).reverse(),
            datasets: [{
                label: 'Inventory Count',
                data: Array(12).fill().map(() => Math.floor(Math.random() * 50) + 100),
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                tension: 0.4,
                fill: true
            }]
        },
        options: getSensorChartOptions('Inventory History')
    });
}

function getSensorChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: false
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    };
}

function updateSensorData() {
    // Simulate sensor data updates
    const temp = (Math.random() * 2 + 22).toFixed(1);
    const humidity = (Math.random() * 10 + 45).toFixed(0);
    const light = (Math.random() * 50 + 100).toFixed(0);
    const inventory = inventoryData.reduce((sum, item) => sum + item.stock, 0);
    
    document.getElementById('tempValue').textContent = `${temp}°C`;
    document.getElementById('humidityValue').textContent = `${humidity}%`;
    document.getElementById('lightValue').textContent = `${light} lux`;
    document.getElementById('inventoryCount').textContent = inventory.toLocaleString();
    
    // Update sensor status
    updateSensorStatus(temp, humidity, light);
    
    // Update charts if they exist
    if(window.tempChart) {
        updateChart(window.tempChart, parseFloat(temp));
    }
    if(window.humidityChart) {
        updateChart(window.humidityChart, parseFloat(humidity));
    }
    if(window.lightChart) {
        updateChart(window.lightChart, parseFloat(light));
    }
    if(window.inventoryChart) {
        updateChart(window.inventoryChart, inventory);
    }
    
    // Check for sensor alerts
    checkSensorAlerts(temp, humidity, light);
}

function updateChart(chart, newValue) {
    // Remove first data point and add new one
    chart.data.labels.shift();
    chart.data.labels.push('Now');
    
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(newValue);
    
    chart.update();
}

function updateSensorStatus(temp, humidity, light) {
    // Temperature status
    const tempStatus = temp > 25 ? 'critical' : temp > 23 ? 'warning' : 'normal';
    updateStatusElement('tempValue', tempStatus);
    
    // Humidity status
    const humidityStatus = humidity > 70 ? 'critical' : humidity > 60 ? 'warning' : 'normal';
    updateStatusElement('humidityValue', humidityStatus);
    
    // Light status
    const lightStatus = light > 200 ? 'warning' : 'normal';
    updateStatusElement('lightValue', lightStatus);
}

function updateStatusElement(elementId, status) {
    const element = document.getElementById(elementId);
    const statusElement = element.closest('.sensor-card').querySelector('.sensor-status');
    
    // Remove all status classes
    statusElement.classList.remove('normal', 'warning', 'critical');
    
    // Add new status class
    statusElement.classList.add(status);
    
    // Update icon and text
    const icon = statusElement.querySelector('i');
    const text = statusElement.querySelector('span');
    
    if(status === 'critical') {
        icon.className = 'fas fa-exclamation-circle';
        text.textContent = 'Critical';
    } else if(status === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
        text.textContent = 'Warning';
    } else {
        icon.className = 'fas fa-check-circle';
        text.textContent = 'Normal';
    }
}

function checkSensorAlerts(temp, humidity, light) {
    const alerts = [];
    const now = new Date().toLocaleTimeString();
    
    if(temp > 25) {
        alerts.push({
            type: 'critical',
            title: `High Temperature Alert: ${temp}°C in Main Storage`,
            message: `Temperature has exceeded safe threshold (25°C). Immediate action required.`,
            time: now
        });
    } else if(temp > 23) {
        alerts.push({
            type: 'warning',
            title: `Elevated Temperature: ${temp}°C in Main Storage`,
            message: `Temperature is approaching upper limit. Monitor closely.`,
            time: now
        });
    }
    
    if(humidity > 70) {
        alerts.push({
            type: 'critical',
            title: `High Humidity Alert: ${humidity}% in Main Storage`,
            message: `Humidity level has exceeded safe threshold (70%). Immediate action required.`,
            time: now
        });
    } else if(humidity > 60) {
        alerts.push({
            type: 'warning',
            title: `Elevated Humidity: ${humidity}% in Main Storage`,
            message: `Humidity is approaching upper limit. Monitor closely.`,
            time: now
        });
    }
    
    if(light > 200) {
        alerts.push({
            type: 'warning',
            title: `High Light Exposure: ${light} lux on Shelf A-12`,
            message: `Light exposure exceeds recommended levels for some medications.`,
            time: now
        });
    }
    
    // Add alerts if any
    alerts.forEach(alert => {
        addAlert(alert);
    });
}

function refreshSensorData() {
    updateSensorData();
    showAlert('success', 'Sensor data refreshed successfully!');
}

// Forecasting
function updateForecastData() {
    // Simulate API call
    setTimeout(() => {
        // Generate demo forecast data if in demo mode
        if(localStorage.getItem('pharmaNexusToken') === 'demo_token') {
            initForecastChart();
            loadForecastRecommendations();
            loadForecastTable();
        }
    }, 1000);
}

function initForecastChart() {
    const ctx = document.getElementById('aiForecastChart').getContext('2d');
    
    // Sample medicines for forecast
    const medicines = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Loratadine 10mg', 'Ibuprofen 200mg'];
    
    window.forecastChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Current', 'Next Month', '2 Months', '3 Months'],
            datasets: medicines.map((medicine, index) => {
                const colors = ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b'];
                return {
                    label: medicine,
                    data: Array(4).fill().map((_, i) => {
                        const base = [120, 80, 60, 90][index];
                        return Math.max(0, Math.floor(base * (1 - i * 0.2 + Math.random() * 0.1)));
                    }),
                    backgroundColor: colors[index],
                    borderColor: colors[index],
                    borderWidth: 1
                };
            })
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    stacked: false,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Projected Stock'
                    }
                }
            }
        }
    });
}

function loadForecastRecommendations() {
    const recommendations = [
        "Increase Paracetamol 500mg stock by 30% to meet projected demand",
        "Reorder Amoxicillin 250mg within 2 weeks to prevent shortage",
        "Monitor Loratadine 10mg usage closely - demand is increasing",
        "Ibuprofen 200mg stock is sufficient for the next 3 months"
    ];
    
    const container = document.getElementById('aiRecommendations');
    container.innerHTML = '';
    
    recommendations.forEach((rec, index) => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${rec}</span>
        `;
        container.appendChild(item);
    });
}

function loadForecastTable() {
    const tableBody = document.getElementById('forecastDataBody');
    tableBody.innerHTML = '';
    
    const medicines = [
        {
            name: "Paracetamol 500mg",
            currentStock: 45,
            monthlyUsage: 35,
            projectedShortfall: 60,
            recommendedOrder: 50,
            urgency: "high"
        },
        {
            name: "Amoxicillin 250mg",
            currentStock: 12,
            monthlyUsage: 15,
            projectedShortfall: 33,
            recommendedOrder: 30,
            urgency: "high"
        },
        {
            name: "Loratadine 10mg",
            currentStock: 28,
            monthlyUsage: 12,
            projectedShortfall: 8,
            recommendedOrder: 15,
            urgency: "medium"
        },
        {
            name: "Ibuprofen 200mg",
            currentStock: 62,
            monthlyUsage: 20,
            projectedShortfall: -2,
            recommendedOrder: 0,
            urgency: "low"
        }
    ];
    
    medicines.forEach(med => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${med.name}</td>
            <td>${med.currentStock}</td>
            <td>${med.monthlyUsage}</td>
            <td>${med.projectedShortfall > 0 ? med.projectedShortfall : 'None'}</td>
            <td>${med.recommendedOrder}</td>
            <td class="urgency-${med.urgency}">${med.urgency.charAt(0).toUpperCase() + med.urgency.slice(1)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function generateForecast() {
    // Simulate forecast generation
    showAlert('info', 'Generating AI forecast...');
    
    setTimeout(() => {
        updateForecastData();
        showAlert('success', 'Forecast generated successfully!');
    }, 2000);
}

function exportForecast() {
    alert('Forecast export functionality would be implemented here');
}

function createPurchaseOrder() {
    alert('Purchase order creation would be implemented here');
}

function adjustInventoryLevels() {
    alert('Inventory level adjustment would be implemented here');
}

// Alerts Management
function loadRecentAlerts() {
    // Simulate API call
    setTimeout(() => {
        // Demo data
        if(localStorage.getItem('pharmaNexusToken') === 'demo_token') {
            alertData = [
                {
                    id: 1,
                    type: 'critical',
                    title: 'Critical: Paracetamol stock below threshold',
                    message: 'Current stock (45) is below reorder threshold (50). Immediate action required.',
                    time: '10 minutes ago',
                    read: false
                },
                {
                    id: 2,
                    type: 'warning',
                    title: 'Warning: Storage temperature exceeded limit',
                    message: 'Temperature in Main Storage reached 24.5°C (threshold: 23°C). Monitor closely.',
                    time: '2 hours ago',
                    read: false
                },
                {
                    id: 3,
                    type: 'info',
                    title: '5 medicines expiring in 15 days',
                    message: 'Check expiry report for details on medicines expiring soon.',
                    time: '5 hours ago',
                    read: false
                },
                {
                    id: 4,
                    type: 'critical',
                    title: 'Critical: Amoxicillin stock very low',
                    message: 'Current stock (12) is well below reorder threshold (20). Urgent reorder needed.',
                    time: '1 day ago',
                    read: true
                },
                {
                    id: 5,
                    type: 'warning',
                    title: 'Light exposure warning on Shelf A-12',
                    message: 'Light levels (120 lux) exceed recommended limits for some medications.',
                    time: '2 days ago',
                    read: true
                }
            ];
        }
        
        renderRecentAlerts();
        updateAlertCount();
    }, 500);
}

function renderRecentAlerts() {
    const container = document.getElementById('recentAlerts');
    container.innerHTML = '';
    
    // Get 3 most recent unread alerts
    const recentAlerts = [...alertData]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 3);
    
    recentAlerts.forEach(alert => {
        const item = document.createElement('div');
        item.className = `alert-item ${alert.type}`;
        item.innerHTML = `
            <i class="fas ${getAlertIcon(alert.type)}"></i>
            <div class="alert-content">
                <span class="alert-title">${alert.title}</span>
                <span class="alert-time">${alert.time}</span>
            </div>
        `;
        item.addEventListener('click', () => showAlertDetails(alert.id));
        container.appendChild(item);
    });
}

function loadAlertData() {
    // Data is already loaded in loadRecentAlerts()
    renderAllAlerts();
}

function renderAllAlerts() {
    const container = document.getElementById('allAlerts');
    container.innerHTML = '';
    
    alertData.forEach(alert => {
        const item = document.createElement('div');
        item.className = `alert-item-detailed ${alert.type} ${alert.read ? '' : 'active'}`;
        item.dataset.id = alert.id;
        item.innerHTML = `
            <div class="alert-item-header">
                <span class="alert-item-title">${alert.title}</span>
                <span class="alert-item-time">${alert.time}</span>
            </div>
            <div class="alert-item-message">${alert.message}</div>
        `;
        item.addEventListener('click', () => showAlertDetails(alert.id));
        container.appendChild(item);
    });
}

function showAlertDetails(id) {
    const alert = alertData.find(a => a.id === id);
    if(!alert) return;
    
    // Mark as read
    alert.read = true;
    updateAlertCount();
    
    // Update active state in list
    document.querySelectorAll('.alert-item-detailed').forEach(item => {
        item.classList.remove('active');
        if(parseInt(item.dataset.id) === id) {
            item.classList.add('active');
        }
    });
    
    // Show details
    const detailsContainer = document.getElementById('alertDetails');
    detailsContainer.innerHTML = `
        <div class="alert-detail-content">
            <h3>${alert.title}</h3>
            <div class="alert-detail-meta">
                <div class="alert-detail-meta-item">
                    <i class="fas ${getAlertIcon(alert.type)}"></i>
                    <span>${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</span>
                </div>
                <div class="alert-detail-meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${alert.time}</span>
                </div>
            </div>
            <div class="alert-detail-body">
                <p>${alert.message}</p>
            </div>
            <div class="alert-detail-actions">
                <button class="btn btn-primary" onclick="resolveAlert(${alert.id})">
                    <i class="fas fa-check"></i> Mark as Resolved
                </button>
                <button class="btn btn-secondary" onclick="dismissAlert(${alert.id})">
                    <i class="fas fa-times"></i> Dismiss
                </button>
            </div>
        </div>
    `;
}

function filterAlerts(filter) {
    const container = document.getElementById('allAlerts');
    const items = container.querySelectorAll('.alert-item-detailed');
    
    items.forEach(item => {
        if(filter === 'all' || item.classList.contains(filter)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function resolveAlert(id) {
    alertData = alertData.filter(alert => alert.id !== id);
    renderAllAlerts();
    renderRecentAlerts();
    updateAlertCount();
    document.getElementById('alertDetails').innerHTML = `
        <div class="alert-detail-placeholder">
            <i class="fas fa-bell-slash"></i>
            <p>Select an alert to view details</p>
        </div>
    `;
    showAlert('success', 'Alert marked as resolved!');
}

function dismissAlert(id) {
    const alert = alertData.find(a => a.id === id);
    if(alert) {
        alert.read = true;
        renderAllAlerts();
        updateAlertCount();
        showAlert('info', 'Alert dismissed!');
    }
}

function markAllAsRead() {
    alertData.forEach(alert => alert.read = true);
    renderAllAlerts();
    renderRecentAlerts();
    updateAlertCount();
    showAlert('success', 'All alerts marked as read!');
}

function updateAlertCount() {
    const unreadCount = alertData.filter(alert => !alert.read).length;
    document.getElementById('alertCount').textContent = unreadCount;
}

function getAlertIcon(type) {
    switch(type) {
        case 'critical': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

function addAlert(alert) {
    // Check if similar alert already exists
    const existingAlert = alertData.find(a => 
        a.title === alert.title && 
        a.type === alert.type && 
        !a.read
    );
    
    if(existingAlert) return;
    
    // Generate ID
    alert.id = alertData.length > 0 ? Math.max(...alertData.map(a => a.id)) + 1 : 1;
    alert.read = false;
    
    // Add to beginning of array
    alertData.unshift(alert);
    
    // Update UI
    if(document.getElementById('alerts').classList.contains('active')) {
        renderAllAlerts();
    } else {
        renderRecentAlerts();
    }
    
    updateAlertCount();
    
    // Show notification
    if(Notification.permission === 'granted') {
        new Notification(alert.title, {
            body: alert.message,
            icon: 'https://ui-avatars.com/api/?name=PN&background=00638e&color=fff'
        });
    }
}

function checkExpiringMedicines() {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiringMedicines = inventoryData.filter(item => {
        const expiryDate = new Date(item.expiry);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    });
    
    if(expiringMedicines.length > 0) {
        const medicineNames = expiringMedicines.map(m => m.name).join(', ');
        
        addAlert({
            type: 'warning',
            title: `${expiringMedicines.length} Medicine(s) Expiring Soon`,
            message: `The following medicines are expiring within 30 days: ${medicineNames}. Please review inventory.`,
            time: new Date().toLocaleTimeString()
        });
    }
}

// Utility Functions
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas ${getAlertIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function searchAllSections(term) {
    // This would search across all sections in a real app
    console.log(`Searching for: ${term}`);
    // For now, just show an alert
    showAlert('info', `Searching for "${term}" across all sections`);
}

function logout() {
    localStorage.removeItem('pharmaNexusToken');
    window.location.href = 'index.html';
}

// Demo-specific functions
function updateDemoData() {
    // Randomly update some inventory data
    if(inventoryData.length > 0 && Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * inventoryData.length);
        const change = Math.floor(Math.random() * 10) - 3; // -3 to +6
        inventoryData[randomIndex].stock = Math.max(0, inventoryData[randomIndex].stock + change);
        
        // If we're on the inventory page, update the table
        if(document.getElementById('inventory').classList.contains('active')) {
            renderInventoryTable();
        }
        
        // Update stats
        updateInventoryStats();
        
        // Generate low stock alert if needed
        if(inventoryData[randomIndex].stock <= inventoryData[randomIndex].threshold) {
            addAlert({
                type: inventoryData[randomIndex].stock === 0 ? 'critical' : 'warning',
                title: `${inventoryData[randomIndex].stock === 0 ? 'Critical: ' : ''}${inventoryData[randomIndex].name} stock ${inventoryData[randomIndex].stock === 0 ? 'out' : 'low'}`,
                message: `Current stock (${inventoryData[randomIndex].stock}) is ${inventoryData[randomIndex].stock === 0 ? 'out' : 'below threshold (${inventoryData[randomIndex].threshold})'}.`,
                time: new Date().toLocaleTimeString()
            });
        }
    }
    
    // Randomly add some alerts
    if(Math.random() > 0.8) {
        const alertTypes = ['info', 'warning', 'critical'];
        const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const messages = {
            info: [
                'Scheduled inventory audit due next week',
                'New software update available',
                'Monthly report generated successfully'
            ],
            warning: [
                'Temperature fluctuation detected in storage room B',
                'Humidity levels approaching threshold in main storage',
                'Increased demand detected for Painkillers'
            ],
            critical: [
                'Emergency stock required for Antibiotics',
                'Power outage detected in cold storage',
                'Critical shortage of Antivirals'
            ]
        };
        
        addAlert({
            type: randomType,
            title: `Demo ${randomType.charAt(0).toUpperCase() + randomType.slice(1)} Alert`,
            message: messages[randomType][Math.floor(Math.random() * messages[randomType].length)],
            time: new Date().toLocaleTimeString()
        });
    }
}

// Initialize charts for dashboard
function initCharts() {
    // Consumption Chart
    const consumptionCtx = document.getElementById('consumptionChart').getContext('2d');
    window.consumptionChart = new Chart(consumptionCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Paracetamol 500mg',
                    data: [120, 190, 170, 210, 180, 200, 230],
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Amoxicillin 250mg',
                    data: [80, 100, 120, 90, 110, 95, 105],
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.05)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: getChartOptions('Medicine Consumption (units)')
    });

    // Forecast Chart
    const forecastCtx = document.getElementById('forecastChart').getContext('2d');
    window.forecastChart = new Chart(forecastCtx, {
        type: 'bar',
        data: {
            labels: ['Current', 'Next Month', '2 Months', '3 Months'],
            datasets: [
                {
                    label: 'Paracetamol 500mg',
                    data: [230, 210, 190, 180],
                    backgroundColor: 'rgba(78, 115, 223, 0.8)'
                },
                {
                    label: 'Amoxicillin 250mg',
                    data: [105, 110, 115, 120],
                    backgroundColor: 'rgba(28, 200, 138, 0.8)'
                }
            ]
        },
        options: getChartOptions('Stock Level Forecast (units)')
    });
}

function getChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 14
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Quantity'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Time Period'
                }
            }
        }
    };
}

// Request notification permission
if('Notification' in window) {
    Notification.requestPermission();
}