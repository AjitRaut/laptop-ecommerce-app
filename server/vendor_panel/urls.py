from django.urls import path
from . import views

app_name = 'vendor_panel'

urlpatterns = [
    # Vendor Registration & Profile
    path('register/', views.VendorRegistrationView.as_view(), name='vendor-register'),
    path('profile/', views.VendorProfileView.as_view(), name='vendor-profile'),
    
    # Dashboard
    path('dashboard/', views.VendorDashboardView.as_view(), name='vendor-dashboard'),
    
    # Products Management
    path('products/', views.VendorProductListView.as_view(), name='vendor-products'),
    path('products/create/', views.VendorProductCreateView.as_view(), name='vendor-product-create'),
    path('products/<int:pk>/', views.VendorProductDetailView.as_view(), name='vendor-product-detail'),
    path('products/<int:product_id>/stock/', views.update_product_stock, name='vendor-product-stock'),
    
    # Orders Management
    path('orders/', views.VendorOrderListView.as_view(), name='vendor-orders'),
    path('orders/<str:order_id>/', views.VendorOrderDetailView.as_view(), name='vendor-order-detail'),
    path('order-items/<int:item_id>/status/', views.update_order_item_status, name='vendor-order-item-status'),
]