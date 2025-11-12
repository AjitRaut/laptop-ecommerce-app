from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # Product Reports
    path('products/summary/', views.product_report_summary, name='product-summary'),
    path('products/stock/', views.product_stock_report, name='product-stock'),
    path('products/export/', views.export_product_report_csv, name='product-export'),
    
    # Order Reports
    path('orders/summary/', views.order_report_summary, name='order-summary'),
    path('orders/by-vendor/', views.sales_by_vendor_report, name='sales-by-vendor'),
    path('orders/export/', views.export_order_report_csv, name='order-export'),
    
    # Vendor Reports
    path('vendors/performance/', views.vendor_performance_report, name='vendor-performance'),
    path('vendors/export/', views.export_vendor_report_csv, name='vendor-export'),
    
    # Report History
    path('logs/', views.ReportLogListView.as_view(), name='report-logs'),
]