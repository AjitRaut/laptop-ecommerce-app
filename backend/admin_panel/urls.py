from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    path('dashboard/', views.AdminDashboardView.as_view(), name='dashboard'),
    path('products/', views.AdminProductListView.as_view(), name='admin-products'),
    path('orders/', views.AdminOrderListView.as_view(), name='admin-orders'),
    path('orders/<uuid:pk>/', views.AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('analytics/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
]