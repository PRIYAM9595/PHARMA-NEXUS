document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
  });
  
  function initDashboard() {
    // Set up navigation
    setupNavigation();
    
    // Initialize all charts
    initCharts();
    
    // Load all data
    loadData();
  }
  
  // Remove all unrelated logic. Only keep DrugData dashboard logic.
  // Navigation: Only Dashboard and Drug Data
  function setupNavigation() {
      // Sidebar nav <li> elements with data-section
      const navLinks = document.querySelectorAll('.sidebar nav ul li[data-section]');
      navLinks.forEach(link => {
          link.addEventListener('click', function(e) {
              e.preventDefault();
              navLinks.forEach(l => l.classList.remove('active'));
              this.classList.add('active');
              const sectionId = this.getAttribute('data-section');
              showSection(sectionId);
          });
      });
  }
  
  function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
      section.style.display = 'none';
    });
    
    // Show the selected section
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('active');
      section.style.display = 'block';
    }
    
    // Load section-specific data if needed
    switch(sectionId) {
      case 'dashboard':
        loadData();
        break;
      case 'inventory':
        loadInventoryData();
        break;
      case 'monitoring':
        // initSensorMonitoring(); // Implement as needed
        break;
      case 'forecasting':
        // updateForecastData(); // Implement as needed
        break;
      case 'alerts':
        // loadAlertData(); // Implement as needed
        break;
    }
  }
  
  function initCharts() {
    // Consumption Chart
    const consumptionCtx = document.getElementById('consumptionChart').getContext('2d');
    const consumptionChart = new Chart(consumptionCtx, {
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
    const forecastChart = new Chart(forecastCtx, {
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
  
    // Store chart references for future updates
    window.dashboardCharts = {
      consumption: consumptionChart,
      forecast: forecastChart
    };
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
  
  function loadData() {
    // Load dashboard data from API or fallback
    fetch('/api/dashboard/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') || ''
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadStatsData(data.stats);
            loadRecentAlerts(data.alerts);
            updateCharts(data);
        } else {
            loadStatsData();
            loadRecentAlerts();
        }
    })
    .catch(() => {
        loadStatsData();
        loadRecentAlerts();
    });
  }
  
  function loadStatsData(apiStats = null) {
    let stats;
    if (apiStats) {
        stats = [
            { title: "Total Medicines", value: apiStats.total_medicines.toString(), icon: "fa-pills", color: "#4e73df" },
            { title: "Low Stock", value: apiStats.low_stock_items.toString(), icon: "fa-exclamation-triangle", color: "#1cc88a" },
            { title: "Expiring Soon", value: apiStats.expiring_soon.toString(), icon: "fa-calendar-times", color: "#f6c23e" },
            { title: "Total Sales", value: "₹" + apiStats.total_sales.toLocaleString(), icon: "fa-chart-line", color: "#e74a3b" }
        ];
    } else {
        stats = [
            { title: "Total Medicines", value: "1,254", icon: "fa-pills", color: "#4e73df" },
            { title: "Low Stock", value: "24", icon: "fa-exclamation-triangle", color: "#1cc88a" },
            { title: "Expiring Soon", value: "15", icon: "fa-calendar-times", color: "#f6c23e" },
            { title: "Storage Issues", value: "3", icon: "fa-temperature-high", color: "#e74a3b" }
        ];
    }
    const statsContainer = document.getElementById('statsGrid');
    if (!statsContainer) return;
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
  }
  
  function loadRecentAlerts(alerts = null) {
    // Use provided alerts or fallback
    const fallbackAlerts = [
        { type: "critical", title: "Critical: Paracetamol stock below threshold", time: "10 minutes ago" },
        { type: "warning", title: "Warning: Storage temperature exceeded limit", time: "2 hours ago" },
        { type: "info", title: "5 medicines expiring in 15 days", time: "5 hours ago" }
    ];
    const alertList = document.getElementById('recentAlerts');
    if (!alertList) return;
    alertList.innerHTML = '';
    (alerts || fallbackAlerts).forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${alert.type}`;
        alertItem.innerHTML = `
            <i class="fas ${getAlertIcon(alert.type)}"></i>
            <div class="alert-content">
                <span class="alert-title">${alert.title}</span>
                <span class="alert-time">${alert.time}</span>
            </div>
        `;
        alertList.appendChild(alertItem);
    });
  }
  
  function getAlertIcon(type) {
    switch(type) {
      case 'critical': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-bell';
    }
  }
  
  // Other data loading functions (loadInventoryData, initSensorMonitoring, etc.)
  // would be implemented similarly with actual data fetching logic

// --- DrugData Dashboard Stats & Charts ---
function updateDrugDataStatsAndCharts(summary) {
    document.getElementById('stat-total-drugs').textContent = summary.total_drugs;
    document.getElementById('stat-unique-categories').textContent = summary.unique_categories;
    document.getElementById('stat-unique-manufacturers').textContent = summary.unique_manufacturers;
    document.getElementById('stat-common-classification').textContent = summary.most_common_classification;
    renderCategoryPieChart(summary.category_count);
    renderClassificationBarChart(summary.classification_count);
}

function renderCategoryPieChart(categoryCount) {
    const ctx = document.getElementById('categoryPieChart').getContext('2d');
    if (window.categoryPieChart) window.categoryPieChart.destroy();
    window.categoryPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryCount),
            datasets: [{
                data: Object.values(categoryCount),
                backgroundColor: [
                    '#4e73df','#1cc88a','#36b9cc','#f6c23e','#e74a3b','#858796','#2e59d9','#17a673','#2c9faf'
                ]
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

function renderClassificationBarChart(classificationCount) {
    const ctx = document.getElementById('classificationBarChart').getContext('2d');
    if (window.classificationBarChart) window.classificationBarChart.destroy();
    window.classificationBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(classificationCount),
            datasets: [{
                label: 'Drugs',
                data: Object.values(classificationCount),
                backgroundColor: '#4e73df'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// Patch loadDrugData to use summary and data fields
function loadDrugData() {
    fetch('/api/drugdata/')
        .then(response => response.json())
        .then(result => {
            window.allDrugData = result.data;
            updateDrugDataStatsAndCharts(result.summary);
            renderDrugDataTable(result.data);
            populateDrugDataFilters(result.data);
        });
}

function renderDrugDataTable(data) {
    const tbody = document.querySelector('#drugdata-table tbody');
    tbody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.name}</td>
            <td>${row.category}</td>
            <td>${row.dosage_form}</td>
            <td>${row.strength}</td>
            <td>${row.manufacturer}</td>
            <td>${row.indication}</td>
            <td>${row.classification}</td>
        `;
        tbody.appendChild(tr);
    });
}

function populateDrugDataFilters(data) {
    const categorySet = new Set();
    const classificationSet = new Set();
    data.forEach(row => {
        if (row.category) categorySet.add(row.category);
        if (row.classification) classificationSet.add(row.classification);
    });
    const categoryFilter = document.getElementById('category-filter');
    const classificationFilter = document.getElementById('classification-filter');
    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        Array.from(categorySet).map(c => `<option value="${c}">${c}</option>`).join('');
    classificationFilter.innerHTML = '<option value="">All Classifications</option>' +
        Array.from(classificationSet).map(c => `<option value="${c}">${c}</option>`).join('');
}

function filterDrugData() {
    let data = window.allDrugData || [];
    const search = document.getElementById('drug-search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const classification = document.getElementById('classification-filter').value;
    data = data.filter(row => {
        const matchesSearch = row.name.toLowerCase().includes(search) || row.manufacturer.toLowerCase().includes(search);
        const matchesCategory = !category || row.category === category;
        const matchesClassification = !classification || row.classification === classification;
        return matchesSearch && matchesCategory && matchesClassification;
    });
    renderDrugDataTable(data);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomDate(start, end) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}
function getStatus(stock, threshold, expiry) {
    const today = new Date();
    const exp = new Date(expiry);
    if (stock <= threshold) return 'Low Stock';
    if ((exp - today) / (1000 * 60 * 60 * 24) < 30) return 'Expiring Soon';
    return 'Normal';
}
function loadInventoryData() {
    fetch('dataset.csv')
        .then(response => response.text())
        .then(csv => {
            const lines = csv.split('\n');
            const headers = lines[0].split(',');
            const data = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',');
                const row = {};
                headers.forEach((h, i) => row[h.trim()] = values[i]?.trim() || '');
                // Fill missing fields with random data
                row['Batch'] = 'B' + getRandomInt(1000, 9999);
                row['CurrentStock'] = getRandomInt(0, 500);
                row['Threshold'] = getRandomInt(10, 100);
                row['Expiry'] = getRandomDate(new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 2)));
                row['Status'] = getStatus(row['CurrentStock'], row['Threshold'], row['Expiry']);
                return row;
            });
            renderInventoryTable(data);
        });
}
function renderInventoryTable(data) {
    const tbody = document.getElementById('inventoryBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row['Name']}</td>
            <td>${row['Batch']}</td>
            <td>${row['Category']}</td>
            <td>${row['CurrentStock']}</td>
            <td>${row['Threshold']}</td>
            <td>${row['Expiry']}</td>
            <td>${row['Status']}</td>
            <td><button class='btn btn-sm btn-primary'>Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    // Show dashboard by default
    showSection('dashboard');
    // Load dashboard data
    loadData();
});