from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Pharmacy(models.Model):
    """Pharmacy model to store pharmacy information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    email = models.EmailField(unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    license_number = models.CharField(max_length=50, unique=True)
    owner_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Pharmacies"

class Medicine(models.Model):
    """Medicine model to store medicine information"""
    MEDICINE_TYPES = [
        ('tablet', 'Tablet'),
        ('capsule', 'Capsule'),
        ('liquid', 'Liquid'),
        ('injection', 'Injection'),
        ('cream', 'Cream'),
        ('drops', 'Drops'),
        ('inhaler', 'Inhaler'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    medicine_type = models.CharField(max_length=20, choices=MEDICINE_TYPES)
    strength = models.CharField(max_length=50)
    manufacturer = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    requires_prescription = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.strength}"

    class Meta:
        unique_together = ['name', 'strength', 'manufacturer']

class Inventory(models.Model):
    """Inventory model to track medicine stock"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='inventories')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='inventories')
    batch_number = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField()
    manufacturing_date = models.DateField()
    supplier = models.CharField(max_length=200)
    location = models.CharField(max_length=100, blank=True)
    min_stock_level = models.PositiveIntegerField(default=10)
    max_stock_level = models.PositiveIntegerField(default=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.medicine.name} - {self.batch_number}"

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_stock_level

    @property
    def is_expired(self):
        from django.utils import timezone
        return self.expiry_date <= timezone.now().date()

    @property
    def is_expiring_soon(self):
        from django.utils import timezone
        from datetime import timedelta
        thirty_days_from_now = timezone.now().date() + timedelta(days=30)
        return self.expiry_date <= thirty_days_from_now

class SensorData(models.Model):
    """Sensor data model for environmental monitoring"""
    SENSOR_TYPES = [
        ('temperature', 'Temperature'),
        ('humidity', 'Humidity'),
        ('light', 'Light'),
        ('motion', 'Motion'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='sensor_data')
    sensor_type = models.CharField(max_length=20, choices=SENSOR_TYPES)
    value = models.FloatField()
    unit = models.CharField(max_length=20)
    location = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_alert = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sensor_type} - {self.value} {self.unit}"

    class Meta:
        ordering = ['-timestamp']

class Alert(models.Model):
    """Alert model for system notifications"""
    ALERT_TYPES = [
        ('low_stock', 'Low Stock'),
        ('expiry', 'Expiry Warning'),
        ('sensor', 'Sensor Alert'),
        ('system', 'System Alert'),
    ]

    ALERT_LEVELS = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    alert_level = models.CharField(max_length=20, choices=ALERT_LEVELS)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.alert_type} - {self.title}"

    class Meta:
        ordering = ['-created_at']

class Supplier(models.Model):
    """Supplier model for vendor management"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    contact_person = models.CharField(max_length=100)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=3
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    """Transaction model for sales and purchases"""
    TRANSACTION_TYPES = [
        ('sale', 'Sale'),
        ('purchase', 'Purchase'),
        ('return', 'Return'),
        ('adjustment', 'Stock Adjustment'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='transactions')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    customer_name = models.CharField(max_length=100, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    prescription_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.inventory.medicine.name}"

    def save(self, *args, **kwargs):
        if not self.total_amount:
            self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)

class UserProfile(models.Model):
    """Extended user profile for pharmacy staff"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='staff')
    role = models.CharField(max_length=50, default='Staff')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class DrugData(models.Model):
    """Model to store data imported from dataset.csv"""
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    dosage_form = models.CharField(max_length=100)
    strength = models.CharField(max_length=50)
    manufacturer = models.CharField(max_length=200)
    indication = models.CharField(max_length=100)
    classification = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} ({self.strength}) - {self.category}"
