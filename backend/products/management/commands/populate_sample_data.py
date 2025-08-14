from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Brand, Product
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with sample data'
    
    def handle(self, *args, **options):
        # Create admin user
        if not User.objects.filter(email='admin@example.com').exists():
            User.objects.create_user(
                email='admin@example.com',
                username='admin',
                password='admin123',
                user_type='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write('Admin user created')
        
        # Create categories
        categories = ['Laptops', 'Gaming Laptops', 'Accessories', 'Monitors']
        for cat_name in categories:
            Category.objects.get_or_create(name=cat_name)
        
        # Create brands
        brands = ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Apple']
        for brand_name in brands:
            Brand.objects.get_or_create(name=brand_name)
        
        self.stdout.write('Sample data populated successfully!')