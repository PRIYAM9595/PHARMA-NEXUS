from django.urls import path
from . import views

urlpatterns = [
    # Frontend Pages
    path('', views.index_page, name='index'),
    path('login/', views.login_page, name='login_page'),
    path('dashboard/', views.dashboard_page, name='dashboard_page'),
    path('signup/', views.signup_page, name='signup_page'),
    
    # Authentication API
    path('api/login/', views.login_view, name='api_login'),
    path('api/logout/', views.logout_view, name='api_logout'),
    path('api/register/', views.register_view, name='api_register'),
    
    # Dashboard API
    path('api/dashboard/', views.dashboard_data, name='api_dashboard'),
    
    # Inventory API
    path('api/inventory/', views.inventory_list, name='api_inventory_list'),
    path('api/inventory/add/', views.add_inventory, name='api_add_inventory'),
    
    # Sensor API
    path('api/sensors/', views.sensor_data, name='api_sensor_data'),
    path('api/sensors/add/', views.add_sensor_data, name='api_add_sensor_data'),
    
    # Alert API
    path('api/alerts/', views.alerts_list, name='api_alerts_list'),
    path('api/alerts/<str:alert_id>/read/', views.mark_alert_read, name='api_mark_alert_read'),

    path('api/drugdata/', views.DrugDataList.as_view(), name='api_drugdata'),
] 