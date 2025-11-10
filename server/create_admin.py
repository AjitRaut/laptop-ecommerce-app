import os
import django
from django.contrib.auth import get_user_model
from dotenv import load_dotenv

print("Loading .env file...")
load_dotenv()

print("Setting up Django...")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("Getting User model...")
User = get_user_model()

email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")

print("\nSuperuser Configuration:")
print(f"   Email   : {email}")
print(f"   Username: {username}")
print(f"   Password: [HIDDEN]")

if not password:
    raise ValueError("DJANGO_SUPERUSER_PASSWORD is required")

print("\nChecking if user already exists (by username or email)...")

if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
    print(f"Superuser already exists (username='{username}' or email='{email}')")
else:
    print(f"Creating superuser: {email}...")
    User.objects.create_superuser(
    username=username,
    email=email,
    password=password,
    user_type='admin'
)
    print(f"Superuser created successfully: {email}")

print("\ncreate_admin.py finished!")