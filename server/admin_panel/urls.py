from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    # Existing routes
    path('dashboard/', views.AdminDashboardView.as_view(), name='dashboard'),
    path('products/', views.AdminProductListView.as_view(), name='admin-products'),
    path('orders/', views.AdminOrderListView.as_view(), name='admin-orders'),
    path('orders/<str:order_id>/', views.AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('analytics/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
    
    # 🆕 NEW VENDOR MANAGEMENT ROUTES
    path('vendors/', views.AdminVendorListView.as_view(), name='admin-vendors'),
    path('vendors/<int:pk>/', views.AdminVendorDetailView.as_view(), name='admin-vendor-detail'),
    path('vendors/<int:vendor_id>/approve/', views.approve_vendor, name='admin-vendor-approve'),
    path('vendors/<int:vendor_id>/reject/', views.reject_vendor, name='admin-vendor-reject'),
    path('vendors/pending/', views.pending_vendors, name='admin-pending-vendors'),
]