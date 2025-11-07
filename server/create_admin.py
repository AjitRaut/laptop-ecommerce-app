# create_admin.py
import os
import django
from django.contrib.auth import get_user_model
from dotenv import load_dotenv

print("Loading .env file...")
load_dotenv()  # Loads from .env in project root

print("Setting up Django...")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("Getting User model...")
User = get_user_model()

# Read from .env with defaults
email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")

# Console: Show what values are being used
print("\nSuperuser Configuration:")
print(f"   Email   : {email}")
print(f"   Username: {username}")
print(f"   Password: {'*' * len(password) if password else 'MISSING'}")

# Validate password
if not password:
    raise ValueError("DJANGO_SUPERUSER_PASSWORD is required in .env")

print("\nChecking if user already exists...")
if not User.objects.filter(email=email).exists():
    print(f"Creating superuser: {email}...")
    User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print(f"Superuser created successfully: {email}")
else:
    print(f"Superuser already exists: {email}")

print("\ncreate_admin.py finished!")