from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import date
from decimal import Decimal


class User(AbstractUser):
    """Custom User model for Baby Wallet"""
    email = models.EmailField(unique=True)
    wallet_address = models.CharField(max_length=42, blank=True, null=True)
    wallet_connected = models.BooleanField(default=False)
    wallet_type = models.CharField(max_length=50, blank=True, null=True)  # MetaMask, WalletConnect, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def total_savings(self):
        """Calculate total savings across all children"""
        return sum(child.current_balance for child in self.children.all())


class Child(models.Model):
    """Child profile model"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children')
    name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    target_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    unlock_age = models.IntegerField(default=18)
    profile_image = models.ImageField(upload_to='child_profiles/', blank=True, null=True)
    color_theme = models.CharField(max_length=20, default='pink')  # For UI customization
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.email})"

    @property
    def age(self):
        """Calculate current age"""
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def years_until_unlock(self):
        """Calculate years until funds can be unlocked"""
        return max(0, self.unlock_age - self.age)

    @property
    def progress_percentage(self):
        """Calculate savings progress percentage"""
        if self.target_amount == 0:
            return 0
        return min(100, (self.current_balance / self.target_amount) * 100)

    @property
    def projected_value_at_18(self):
        """Calculate projected value at age 18"""
        if self.years_until_unlock <= 0:
            return self.current_balance
        
        # Simple compound interest calculation (6% annual return)
        annual_rate = Decimal('0.06')
        monthly_rate = annual_rate / 12
        months = self.years_until_unlock * 12
        
        # Assume monthly contributions of $100 (can be made configurable)
        monthly_contribution = Decimal('100')
        
        future_value = self.current_balance
        for _ in range(months):
            future_value = (future_value + monthly_contribution) * (1 + monthly_rate)
        
        return round(future_value, 2)


class UserProfile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    preferred_currency = models.CharField(max_length=3, default='USD')
    notification_preferences = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.email}"


class WalletConnection(models.Model):
    """Track wallet connection history"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_connections')
    wallet_type = models.CharField(max_length=50)  # MetaMask, WalletConnect, etc.
    wallet_address = models.CharField(max_length=42)
    connected_at = models.DateTimeField(auto_now_add=True)
    disconnected_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-connected_at']

    def __str__(self):
        return f"{self.wallet_type} - {self.wallet_address[:10]}..."

    def disconnect(self):
        self.is_active = False
        self.disconnected_at = timezone.now()
        self.save()
