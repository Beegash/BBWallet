from django.db import models
from django.conf import settings
from accounts.models import Child
from decimal import Decimal


class Investment(models.Model):
    """Investment model for tracking investments"""
    INVESTMENT_TYPES = [
        ('one_time', 'One Time'),
        ('recurring', 'Recurring'),
    ]
    
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investments')
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='investments')
    investment_type = models.CharField(max_length=20, choices=INVESTMENT_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_payment_date = models.DateField(null=True, blank=True)
    total_contributed = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    smart_contract_address = models.CharField(max_length=42, blank=True, null=True)
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.child.name} - {self.amount}"

    @property
    def is_recurring(self):
        return self.investment_type == 'recurring'

    @property
    def total_investments(self):
        """Calculate total number of investments made"""
        return self.transactions.filter(transaction_type='investment').count()

    def calculate_next_payment_date(self):
        """Calculate next payment date for recurring investments"""
        if not self.is_recurring:
            return None
        
        from datetime import timedelta
        from django.utils import timezone
        
        if self.frequency == 'weekly':
            return timezone.now().date() + timedelta(days=7)
        elif self.frequency == 'monthly':
            return timezone.now().date() + timedelta(days=30)
        elif self.frequency == 'quarterly':
            return timezone.now().date() + timedelta(days=90)
        elif self.frequency == 'yearly':
            return timezone.now().date() + timedelta(days=365)
        
        return None


class Transaction(models.Model):
    """Transaction model for tracking all financial transactions"""
    TRANSACTION_TYPES = [
        ('investment', 'Investment'),
        ('withdrawal', 'Withdrawal'),
        ('interest', 'Interest'),
        ('fee', 'Fee'),
        ('refund', 'Refund'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TOKEN_CHOICES = [
        ('USDC', 'USDC'),
        ('USDT', 'USDT'),
        ('ETH', 'Ethereum'),
        ('BTC', 'Bitcoin'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='transactions')
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    token = models.CharField(max_length=10, choices=TOKEN_CHOICES, default='USDC')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)
    block_number = models.BigIntegerField(null=True, blank=True)
    gas_used = models.BigIntegerField(null=True, blank=True)
    gas_price = models.BigIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)  # Additional transaction data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.transaction_type} - {self.amount} {self.token}"

    @property
    def is_credit(self):
        """Check if transaction adds to balance"""
        return self.transaction_type in ['investment', 'interest', 'refund']

    @property
    def is_debit(self):
        """Check if transaction reduces balance"""
        return self.transaction_type in ['withdrawal', 'fee']

    def save(self, *args, **kwargs):
        """Override save to update child balance"""
        is_new = self.pk is None
        old_status = None
        
        if not is_new:
            old_transaction = Transaction.objects.get(pk=self.pk)
            old_status = old_transaction.status
        
        super().save(*args, **kwargs)
        
        # Update child balance when transaction status changes
        if is_new or old_status != self.status:
            self.update_child_balance()

    def update_child_balance(self):
        """Update child's current balance based on transaction"""
        if self.status == 'completed':
            if self.is_credit:
                self.child.current_balance += self.amount
            elif self.is_debit:
                self.child.current_balance -= self.amount
            
            self.child.save()


class InvestmentGoal(models.Model):
    """Investment goals for children"""
    child = models.OneToOneField(Child, on_delete=models.CASCADE, related_name='investment_goal')
    target_amount = models.DecimalField(max_digits=15, decimal_places=2)
    target_date = models.DateField()
    monthly_contribution = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.child.name} - {self.target_amount} by {self.target_date}"

    @property
    def progress_percentage(self):
        """Calculate progress towards goal"""
        if self.target_amount == 0:
            return 0
        return min(100, (self.child.current_balance / self.target_amount) * 100)

    @property
    def months_remaining(self):
        """Calculate months remaining until target date"""
        from datetime import date
        today = date.today()
        if self.target_date <= today:
            return 0
        
        months = (self.target_date.year - today.year) * 12 + (self.target_date.month - today.month)
        return max(0, months)


class TaxReport(models.Model):
    """Tax reports for users"""
    REPORT_TYPES = [
        ('annual', 'Annual Statement'),
        ('transaction', 'Transaction History'),
        ('gains', 'Gains Report'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tax_reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    year = models.IntegerField()
    file_path = models.FileField(upload_to='tax_reports/', blank=True, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    is_downloaded = models.BooleanField(default=False)

    class Meta:
        ordering = ['-generated_at']
        unique_together = ['user', 'report_type', 'year']

    def __str__(self):
        return f"{self.user.email} - {self.report_type} - {self.year}"
