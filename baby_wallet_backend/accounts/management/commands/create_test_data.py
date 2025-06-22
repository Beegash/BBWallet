from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User, Child
from investments.models import Investment, Transaction
from datetime import date, timedelta
from decimal import Decimal
from django.utils import timezone

class Command(BaseCommand):
    help = 'Creates comprehensive test data for the application'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Deleting old data...')
        # Delete in reverse order of dependency
        Transaction.objects.all().delete()
        Investment.objects.all().delete()
        Child.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

        self.stdout.write('Creating new data...')

        # Get or create superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        
        # Create test users
        user1, _ = User.objects.get_or_create(username='parent1', defaults={'email': 'parent1@example.com', 'first_name': 'Alice'})
        user1.set_password('test123')
        user1.save()

        user2, _ = User.objects.get_or_create(username='parent2', defaults={'email': 'parent2@example.com', 'first_name': 'Bob'})
        user2.set_password('test123')
        user2.save()

        # Create parent3 user
        user3, _ = User.objects.get_or_create(username='parent3', defaults={'email': 'parent3@example.com', 'first_name': 'Mehmet'})
        user3.set_password('test123')
        user3.save()

        # Create children and investments
        self.create_child_and_investments(user1, 'Emma', date(2018, 5, 15), 10000, 'pink', [(100, 'one_time'), (50, 'recurring')])
        self.create_child_and_investments(user1, 'Noah', date(2020, 8, 22), 15000, 'blue', [(200, 'one_time'), (75, 'recurring')])
        self.create_child_and_investments(user2, 'Olivia', date(2019, 1, 10), 12000, 'green', [(500, 'one_time')])
        
        # Create parent3's children (12 yaşında)
        self.create_child_and_investments(user3, 'Ugur', date(2012, 6, 15), 20000, 'purple', [(300, 'one_time'), (100, 'recurring')])
        self.create_child_and_investments(user3, 'Dogu', date(2012, 9, 22), 18000, 'orange', [(250, 'one_time'), (80, 'recurring')])

        self.stdout.write(self.style.SUCCESS('Successfully created comprehensive test data!'))
        self.stdout.write('Available users: admin, parent1, parent2, parent3 (password: test123)')

    def create_child_and_investments(self, user, name, dob, target, theme, investments_data):
        child = Child.objects.create(
            user=user,
            name=name,
            date_of_birth=dob,
            target_amount=target,
            current_balance=0,  # Will be calculated from transactions
            color_theme=theme
        )

        total_balance = Decimal('0')
        for amount, inv_type in investments_data:
            investment = Investment.objects.create(
                user=user,
                child=child,
                investment_type=inv_type,
                amount=Decimal(amount),
                frequency='monthly' if inv_type == 'recurring' else None,
                start_date=date.today() - timedelta(days=60),
                status='active'
            )
            
            # Create transactions for this investment
            for i in range(3): # Create 3 transactions for each investment
                trans_amount = Decimal(amount)
                if inv_type == 'recurring':
                    # Simulate some variation
                    trans_amount *= Decimal(f'1.0{i}')

                transaction = Transaction.objects.create(
                    user=user,
                    child=child,
                    investment=investment,
                    transaction_type='investment',
                    amount=trans_amount,
                    status='completed',
                    description=f"{inv_type.capitalize()} investment"
                )
                total_balance += transaction.amount
        
        # Update child's balance based on transactions
        child.current_balance = total_balance
        child.save()

        self.stdout.write(f"  - Created child '{name}' with investments for user '{user.username}'") 
 