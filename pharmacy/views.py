from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta
import json
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# Authentication Views
@csrf_exempt
def login_view(request):
    """Handle pharmacy login"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pharmacy_name = data.get('pharmacyName')
            email = data.get('email')
            password = data.get('password')
            remember_me = data.get('rememberMe', False)
            
            # First try to authenticate with email
            user = authenticate(request, username=email, password=password)
            
            if user is None:
                # Try with pharmacy name as username
                user = authenticate(request, username=pharmacy_name, password=password)
            
            if user is not None and user.is_active:
                login(request, user)
                
                # Get pharmacy details
                try:
                    pharmacy = Pharmacy.objects.get(name=pharmacy_name, email=email)
                    response_data = {
                        'success': True,
                        'message': 'Login successful',
                        'pharmacy_id': str(pharmacy.id),
                        'pharmacy_name': pharmacy.name,
                        'user_id': user.id,
                        'username': user.username
                    }
                except Pharmacy.DoesNotExist:
                    response_data = {
                        'success': True,
                        'message': 'Login successful',
                        'user_id': user.id,
                        'username': user.username
                    }
                
                return JsonResponse(response_data)
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid credentials'
                }, status=401)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

@csrf_exempt
def logout_view(request):
    """Handle logout"""
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logout successful'})

@csrf_exempt
def register_view(request):
    """Handle pharmacy registration"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Check if pharmacy already exists
            if Pharmacy.objects.filter(name=data.get('pharmacyName')).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Pharmacy name already exists'
                }, status=400)
            
            if Pharmacy.objects.filter(email=data.get('email')).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)
            
            # Create pharmacy
            pharmacy = Pharmacy.objects.create(
                name=data.get('pharmacyName'),
                email=data.get('email'),
                address=data.get('address', ''),
                phone=data.get('phone', ''),
                license_number=data.get('licenseNumber', ''),
                owner_name=data.get('ownerName', '')
            )
            
            # Create user account
            user = User.objects.create_user(
                username=data.get('email'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('ownerName', ''),
                last_name=data.get('pharmacyName', '')
            )
            
            # Create user profile
            UserProfile.objects.create(
                user=user,
                pharmacy=pharmacy,
                role='Owner',
                phone=data.get('phone', '')
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Registration successful',
                'pharmacy_id': str(pharmacy.id)
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

# Dashboard Views
@login_required
def dashboard_data(request):
    """Get dashboard overview data"""
    try:
        user_profile = request.user.profile
        pharmacy = user_profile.pharmacy
        
        # Get current date
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)
        
        # Statistics
        total_medicines = Inventory.objects.filter(pharmacy=pharmacy).count()
        low_stock_items = Inventory.objects.filter(pharmacy=pharmacy, quantity__lte=models.F('min_stock_level')).count()
        expiring_soon = Inventory.objects.filter(
            pharmacy=pharmacy,
            expiry_date__lte=today + timedelta(days=30),
            expiry_date__gt=today
        ).count()
        total_sales = 0  # We'll implement this later when we have transactions
        
        # Recent alerts
        recent_alerts = Alert.objects.filter(
            pharmacy=pharmacy,
            is_read=False
        ).order_by('-created_at')[:5]
        
        # Sensor data (latest)
        latest_sensors = SensorData.objects.filter(
            pharmacy=pharmacy
        ).order_by('sensor_type', '-timestamp').distinct('sensor_type')
        
        # Chart data - Medicine consumption trend (placeholder for now)
        consumption_data = []
        
        # Chart data - Stock levels
        stock_data = Inventory.objects.filter(
            pharmacy=pharmacy
        ).values('medicine__name').annotate(
            total_quantity=Sum('quantity')
        ).order_by('-total_quantity')[:10]
        
        response_data = {
            'success': True,
            'stats': {
                'total_medicines': total_medicines,
                'low_stock_items': low_stock_items,
                'expiring_soon': expiring_soon,
                'total_sales': float(total_sales)
            },
            'alerts': [
                {
                    'id': str(alert.id),
                    'type': alert.alert_type,
                    'level': alert.alert_level,
                    'title': alert.title,
                    'message': alert.message,
                    'created_at': alert.created_at.isoformat()
                } for alert in recent_alerts
            ],
            'sensors': [
                {
                    'type': sensor.sensor_type,
                    'value': sensor.value,
                    'unit': sensor.unit,
                    'location': sensor.location,
                    'timestamp': sensor.timestamp.isoformat(),
                    'is_alert': sensor.is_alert
                } for sensor in latest_sensors
            ],
            'consumption_trend': [
                {
                    'date': item['created_at__date'].isoformat(),
                    'quantity': item['total_quantity']
                } for item in consumption_data
            ],
            'stock_levels': [
                {
                    'medicine': item['medicine__name'],
                    'quantity': item['total_quantity']
                } for item in stock_data
            ]
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

# Inventory Views
@login_required
def inventory_list(request):
    """Get inventory list"""
    try:
        user_profile = request.user.profile
        pharmacy = user_profile.pharmacy
        
        search = request.GET.get('search', '')
        filter_type = request.GET.get('filter', 'all')
        
        queryset = Inventory.objects.filter(pharmacy=pharmacy)
        
        if search:
            queryset = queryset.filter(
                Q(medicine__name__icontains=search) |
                Q(medicine__generic_name__icontains=search) |
                Q(batch_number__icontains=search)
            )
        
        if filter_type == 'low_stock':
            queryset = queryset.filter(quantity__lte=models.F('min_stock_level'))
        elif filter_type == 'expiring_soon':
            thirty_days_from_now = timezone.now().date() + timedelta(days=30)
            queryset = queryset.filter(expiry_date__lte=thirty_days_from_now)
        elif filter_type == 'expired':
            queryset = queryset.filter(expiry_date__lte=timezone.now().date())
        
        inventory_data = []
        for item in queryset:
            inventory_data.append({
                'id': str(item.id),
                'medicine_name': item.medicine.name,
                'generic_name': item.medicine.generic_name,
                'medicine_type': item.medicine.medicine_type,
                'strength': item.medicine.strength,
                'batch_number': item.batch_number,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'expiry_date': item.expiry_date.isoformat(),
                'manufacturing_date': item.manufacturing_date.isoformat(),
                'supplier': item.supplier,
                'location': item.location,
                'min_stock_level': item.min_stock_level,
                'max_stock_level': item.max_stock_level,
                'is_low_stock': item.is_low_stock,
                'is_expired': item.is_expired,
                'is_expiring_soon': item.is_expiring_soon,
                'created_at': item.created_at.isoformat()
            })
        
        return JsonResponse({
            'success': True,
            'inventory': inventory_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@csrf_exempt
@login_required
def add_inventory(request):
    """Add new inventory item"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_profile = request.user.profile
            pharmacy = user_profile.pharmacy
            
            # Get or create medicine
            medicine, created = Medicine.objects.get_or_create(
                name=data.get('medicine_name'),
                strength=data.get('strength'),
                manufacturer=data.get('manufacturer'),
                defaults={
                    'generic_name': data.get('generic_name', ''),
                    'medicine_type': data.get('medicine_type', 'tablet'),
                    'description': data.get('description', ''),
                    'requires_prescription': data.get('requires_prescription', False)
                }
            )
            
            # Create inventory item
            inventory = Inventory.objects.create(
                pharmacy=pharmacy,
                medicine=medicine,
                batch_number=data.get('batch_number'),
                quantity=data.get('quantity'),
                unit_price=data.get('unit_price'),
                expiry_date=data.get('expiry_date'),
                manufacturing_date=data.get('manufacturing_date'),
                supplier=data.get('supplier'),
                location=data.get('location', ''),
                min_stock_level=data.get('min_stock_level', 10),
                max_stock_level=data.get('max_stock_level', 1000)
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Inventory item added successfully',
                'inventory_id': str(inventory.id)
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

# Sensor Views
@login_required
def sensor_data(request):
    """Get sensor data"""
    try:
        user_profile = request.user.profile
        pharmacy = user_profile.pharmacy
        
        sensor_type = request.GET.get('type', '')
        limit = int(request.GET.get('limit', 50))
        
        queryset = SensorData.objects.filter(pharmacy=pharmacy)
        
        if sensor_type:
            queryset = queryset.filter(sensor_type=sensor_type)
        
        queryset = queryset.order_by('-timestamp')[:limit]
        
        sensor_data = []
        for sensor in queryset:
            sensor_data.append({
                'id': str(sensor.id),
                'type': sensor.sensor_type,
                'value': sensor.value,
                'unit': sensor.unit,
                'location': sensor.location,
                'timestamp': sensor.timestamp.isoformat(),
                'is_alert': sensor.is_alert
            })
        
        return JsonResponse({
            'success': True,
            'sensors': sensor_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@csrf_exempt
@login_required
def add_sensor_data(request):
    """Add new sensor data"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_profile = request.user.profile
            pharmacy = user_profile.pharmacy
            
            sensor = SensorData.objects.create(
                pharmacy=pharmacy,
                sensor_type=data.get('sensor_type'),
                value=data.get('value'),
                unit=data.get('unit'),
                location=data.get('location'),
                is_alert=data.get('is_alert', False)
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Sensor data added successfully',
                'sensor_id': str(sensor.id)
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

# Alert Views
@login_required
def alerts_list(request):
    """Get alerts list"""
    try:
        user_profile = request.user.profile
        pharmacy = user_profile.pharmacy
        
        alert_type = request.GET.get('type', '')
        is_read = request.GET.get('read', '')
        
        queryset = Alert.objects.filter(pharmacy=pharmacy)
        
        if alert_type:
            queryset = queryset.filter(alert_type=alert_type)
        
        if is_read == 'true':
            queryset = queryset.filter(is_read=True)
        elif is_read == 'false':
            queryset = queryset.filter(is_read=False)
        
        alerts_data = []
        for alert in queryset:
            alerts_data.append({
                'id': str(alert.id),
                'type': alert.alert_type,
                'level': alert.alert_level,
                'title': alert.title,
                'message': alert.message,
                'is_read': alert.is_read,
                'is_resolved': alert.is_resolved,
                'created_at': alert.created_at.isoformat(),
                'resolved_at': alert.resolved_at.isoformat() if alert.resolved_at else None
            })
        
        return JsonResponse({
            'success': True,
            'alerts': alerts_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@csrf_exempt
@login_required
def mark_alert_read(request, alert_id):
    """Mark alert as read"""
    if request.method == 'POST':
        try:
            user_profile = request.user.profile
            pharmacy = user_profile.pharmacy
            
            alert = Alert.objects.get(id=alert_id, pharmacy=pharmacy)
            alert.is_read = True
            alert.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Alert marked as read'
            })
            
        except Alert.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Alert not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

# Frontend Views
def login_page(request):
    """Serve login page"""
    return render(request, 'login.html')

def dashboard_page(request):
    """Serve dashboard page"""
    return render(request, 'dashboard.html')

def signup_page(request):
    """Serve signup page"""
    return render(request, 'Signup.html')

def index_page(request):
    """Serve index page"""
    return render(request, 'index.html')

class DrugDataList(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        queryset = DrugData.objects.all()
        serializer = DrugDataSerializer(queryset, many=True)
        data = serializer.data
        # Compute summary stats
        categories = [d['category'] for d in data if d['category']]
        manufacturers = [d['manufacturer'] for d in data if d['manufacturer']]
        classifications = [d['classification'] for d in data if d['classification']]
        unique_categories = set(categories)
        unique_manufacturers = set(manufacturers)
        class_count = {}
        for c in classifications:
            class_count[c] = class_count.get(c, 0) + 1
        most_common_classification = max(class_count, key=class_count.get) if class_count else '-'
        # Category counts for pie chart
        category_count = {}
        for c in categories:
            category_count[c] = category_count.get(c, 0) + 1
        summary = {
            'total_drugs': len(data),
            'unique_categories': len(unique_categories),
            'unique_manufacturers': len(unique_manufacturers),
            'most_common_classification': most_common_classification,
            'category_count': category_count,
            'classification_count': class_count,
        }
        return Response({'data': data, 'summary': summary})
