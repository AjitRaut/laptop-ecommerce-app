from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'user_type', 'is_active', 'is_staff')
    list_filter = ('user_type', 'is_active', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'address', 'city', 'state', 'pincode', 'is_verified')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('email', 'user_type', 'phone')}),
    )

admin.site.register(User, CustomUserAdmin)


# ✅ Auto-create hardcoded admin when server starts
def create_default_admin():
    try:
        if not User.objects.filter(email='admin@gmail.com').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@gmail.com',
                password='Admin@123',
                user_type='admin',
            )
            print("✅ Default admin created: admin@gmail.com / Admin@123")
        else:
            # Fix existing admin if locked out
            user = User.objects.get(email='admin@gmail.com')
            if not user.is_superuser or not user.is_staff:
                user.is_staff = True
                user.is_superuser = True
                user.user_type = 'admin'
                user.is_active = True
                user.save()
                print("✅ Admin permissions restored for admin@gmail.com")
    except Exception as e:
        pass  # DB not ready yet (during migrations)

create_default_admin()