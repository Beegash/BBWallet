from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User, Child
from datetime import date

class Command(BaseCommand):
    help = 'Creates test data for the application'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Deleting old data...')
        User.objects.all().delete()
        Child.objects.all().delete()

        self.stdout.write('Creating new data...')

        # Create superuser
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        
        # Create test users
        user1 = User.objects.create_user('parent1', 'parent1@example.com', 'test123')
        user1.first_name = 'Alice'
        user1.save()

        user2 = User.objects.create_user('parent2', 'parent2@example.com', 'test123')
        user2.first_name = 'Bob'
        user2.save()

        # Create children for users
        Child.objects.create(
            user=user1,
            name='Emma',
            date_of_birth=date(2018, 5, 15),
            target_amount=10000,
            current_balance=1250,
            color_theme='pink'
        )

        Child.objects.create(
            user=user1,
            name='Noah',
            date_of_birth=date(2020, 8, 22),
            target_amount=15000,
            current_balance=850,
            color_theme='blue'
        )

        Child.objects.create(
            user=user2,
            name='Olivia',
            date_of_birth=date(2019, 1, 10),
            target_amount=12000,
            current_balance=2500,
            color_theme='green'
        )

        self.stdout.write(self.style.SUCCESS('Successfully created test data!'))
        self.stdout.write('Available users: admin, parent1, parent2 (password: test123)') 
