from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, timedelta
from pharmacy.models import *

class Command(BaseCommand):
    help = 'Create sample data for testing the pharmacy system'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create a sample pharmacy
        pharmacy, created = Pharmacy.objects.get_or_create(
            name='Sample Pharmacy',
            defaults={
                'email': 'sample@pharmacy.com',
                'address': '123 Main Street, City, State 12345',
                'phone': '+1234567890',
                'license_number': 'PHAR123456',
                'owner_name': 'John Doe'
            }
        )
        
        if created:
            self.stdout.write(f'Created pharmacy: {pharmacy.name}')
        
        # Create a user for the pharmacy
        user, created = User.objects.get_or_create(
            username='sample@pharmacy.com',
            defaults={
                'email': 'sample@pharmacy.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'is_active': True
            }
        )
        
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(f'Created user: {user.username}')
        
        # Create user profile
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'pharmacy': pharmacy,
                'role': 'Owner',
                'phone': '+1234567890'
            }
        )
        
        if created:
            self.stdout.write(f'Created user profile for: {user.username}')
        
        # Create sample medicines
        medicines = [
            {
                'name': 'Paracetamol',
                'generic_name': 'Acetaminophen',
                'medicine_type': 'tablet',
                'strength': '500mg',
                'manufacturer': 'ABC Pharmaceuticals',
                'description': 'Pain reliever and fever reducer',
                'requires_prescription': False
            },
            {
                'name': 'Amoxicillin',
                'generic_name': 'Amoxicillin',
                'medicine_type': 'capsule',
                'strength': '250mg',
                'manufacturer': 'XYZ Pharmaceuticals',
                'description': 'Antibiotic for bacterial infections',
                'requires_prescription': True
            },
            {
                'name': 'Omeprazole',
                'generic_name': 'Omeprazole',
                'medicine_type': 'capsule',
                'strength': '20mg',
                'manufacturer': 'DEF Pharmaceuticals',
                'description': 'Proton pump inhibitor for acid reflux',
                'requires_prescription': True
            }
        ]
        
        created_medicines = []
        for med_data in medicines:
            medicine, created = Medicine.objects.get_or_create(
                name=med_data['name'],
                strength=med_data['strength'],
                manufacturer=med_data['manufacturer'],
                defaults=med_data
            )
            if created:
                self.stdout.write(f'Created medicine: {medicine.name}')
            created_medicines.append(medicine)
        
        # Create sample inventory
        for i, medicine in enumerate(created_medicines):
            inventory, created = Inventory.objects.get_or_create(
                pharmacy=pharmacy,
                medicine=medicine,
                batch_number=f'BATCH{i+1:03d}',
                defaults={
                    'quantity': 100 - (i * 20),
                    'unit_price': 5.00 + (i * 2.50),
                    'expiry_date': date.today() + timedelta(days=365),
                    'manufacturing_date': date.today() - timedelta(days=30),
                    'supplier': 'Sample Supplier',
                    'location': 'Shelf A',
                    'min_stock_level': 10,
                    'max_stock_level': 1000
                }
            )
            if created:
                self.stdout.write(f'Created inventory for: {medicine.name}')
        
        # Create sample sensor data
        sensor_types = ['temperature', 'humidity', 'light']
        for sensor_type in sensor_types:
            sensor_data, created = SensorData.objects.get_or_create(
                pharmacy=pharmacy,
                sensor_type=sensor_type,
                timestamp=timezone.now(),
                defaults={
                    'value': 25.0 if sensor_type == 'temperature' else (60.0 if sensor_type == 'humidity' else 500.0),
                    'unit': '°C' if sensor_type == 'temperature' else ('%' if sensor_type == 'humidity' else 'lux'),
                    'location': 'Storage Room',
                    'is_alert': False
                }
            )
            if created:
                self.stdout.write(f'Created sensor data for: {sensor_type}')
        
        # Create sample alerts
        alerts_data = [
            {
                'alert_type': 'low_stock',
                'alert_level': 'warning',
                'title': 'Low Stock Alert',
                'message': 'Paracetamol 500mg is running low on stock. Current quantity: 15 units.'
            },
            {
                'alert_type': 'expiry',
                'alert_level': 'critical',
                'title': 'Expiry Warning',
                'message': 'Amoxicillin 250mg will expire in 30 days. Batch: BATCH002'
            },
            {
                'alert_type': 'sensor',
                'alert_level': 'info',
                'title': 'Temperature Alert',
                'message': 'Storage room temperature is optimal: 22°C'
            }
        ]
        
        for alert_data in alerts_data:
            alert, created = Alert.objects.get_or_create(
                pharmacy=pharmacy,
                title=alert_data['title'],
                defaults={
                    'alert_type': alert_data['alert_type'],
                    'alert_level': alert_data['alert_level'],
                    'message': alert_data['message'],
                    'is_read': False,
                    'is_resolved': False
                }
            )
            if created:
                self.stdout.write(f'Created alert: {alert.title}')
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write('You can now login with:')
        self.stdout.write('Email: sample@pharmacy.com')
        self.stdout.write('Password: password123') 