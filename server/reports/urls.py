from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # Product Reports
    path('products/summary/', views.product_report_summary, name='product-summary'),
    path('products/stock/', views.product_stock_report, name='product-stock'),
    path('products/export/pdf/', views.export_product_report_pdf, name='product-export-pdf'),
    
    # Order Reports
    path('orders/summary/', views.order_report_summary, name='order-summary'),
    path('orders/by-vendor/', views.sales_by_vendor_report, name='sales-by-vendor'),
    path('orders/export/pdf/', views.export_order_report_pdf, name='order-export-pdf'),
    
    # Vendor Reports
    path('vendors/performance/', views.vendor_performance_report, name='vendor-performance'),
    path('vendors/export/pdf/', views.export_vendor_report_pdf, name='vendor-export-pdf'),
    
    # Report History
    path('logs/', views.ReportLogListView.as_view(), name='report-logs'),
]