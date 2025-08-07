from django.urls import path
from . import views
from django.http import JsonResponse

app_name = 'users'

def users_home(request):
    return JsonResponse({"message": "Users API Root"})


urlpatterns = [
      path('', users_home), 
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
]