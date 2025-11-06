from django.contrib.auth import get_user_model

User = get_user_model()

email = "admin@example.com"
password = "Admin@123"

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password)
    print("Superuser created successfully ✅")
else:
    print("Superuser already exists ✅")
