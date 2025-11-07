# create_admin.py
import os
import django
from django.contrib.auth import get_user_model

# Fix 1: Tell Django where settings are
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()

email = "admin@example.com"
password = "Admin@123"
username = "admin"  # <-- This was missing!

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        username=username,   # REQUIRED
        email=email,
        password=password
    )
    print("Superuser created successfully")
else:
    print("Superuser already exists")