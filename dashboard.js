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
      case 'sensors':
        initSensorMonitoring();
        break;
      case 'forecast':
        updateForecastData();
        break;
      case 'alerts':
        loadAlertData();
        break;
      case 'suppliers':
        loadSupplierData();
        break;
      case 'reports':
        loadReportData();
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
    // Load stats cards data
    loadStatsData();
    
    // Load initial alerts for dashboard
    loadRecentAlerts();
  }
  
  function loadStatsData() {
    const stats = [
      {
        title: "Total Medicines",
        value: "1,254",
        icon: "fa-pills",
        color: "#4e73df"
      },
      {
        title: "Low Stock",
        value: "24",
        icon: "fa-exclamation-triangle",
        color: "#1cc88a"
      },
      {
        title: "Expiring Soon",
        value: "15",
        icon: "fa-calendar-times",
        color: "#f6c23e"
      },
      {
        title: "Storage Issues",
        value: "3",
        icon: "fa-temperature-high",
        color: "#e74a3b"
      }
    ];
  
    const statsContainer = document.querySelector('.stats-cards');
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
  
  function loadRecentAlerts() {
    const alerts = [
      {
        type: "critical",
        title: "Critical: Paracetamol stock below threshold",
        time: "10 minutes ago"
      },
      {
        type: "warning",
        title: "Warning: Storage temperature exceeded limit",
        time: "2 hours ago"
      },
      {
        type: "info",
        title: "5 medicines expiring in 15 days",
        time: "5 hours ago"
      }
    ];
  
    const alertList = document.querySelector('.recent-alerts .alert-list');
    alertList.innerHTML = '';
  
    alerts.forEach(alert => {
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