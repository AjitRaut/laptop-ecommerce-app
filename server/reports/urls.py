from django.urls import path
from . import views

urlpatterns = [
    # ==================== PRODUCT REPORTS ====================
    path('products/summary/', views.product_report_summary, name='product-report-summary'),
    path('products/stock/', views.product_stock_report, name='product-stock-report'),
    path('products/export/pdf/', views.export_product_report_pdf, name='export-product-report-pdf'),
    
    # ==================== ORDER REPORTS ====================
    path('orders/summary/', views.order_report_summary, name='order-report-summary'),
    path('orders/by-vendor/', views.sales_by_vendor_report, name='sales-by-vendor-report'),
    path('orders/export/pdf/', views.export_order_report_pdf, name='export-order-report-pdf'),
    
    # ==================== VENDOR REPORTS ====================
    path('vendors/performance/', views.vendor_performance_report, name='vendor-performance-report'),
    path('vendors/export/pdf/', views.export_vendor_report_pdf, name='export-vendor-report-pdf'),
    
    # Individual Vendor Report
    path('vendors/<int:vendor_id>/', views.individual_vendor_report, name='individual-vendor-report'),
    path('vendors/<int:vendor_id>/export/pdf/', views.export_individual_vendor_pdf, name='export-individual-vendor-pdf'),
    
    # ==================== USER REPORTS ====================
    path('users/summary/', views.user_report_summary, name='user-report-summary'),
    path('users/export/pdf/', views.export_user_report_pdf, name='export-user-report-pdf'),
    
    # ==================== SALES REPORTS ====================
    path('sales/summary/', views.sales_report_summary, name='sales-report-summary'),
    path('sales/export/pdf/', views.export_sales_report_pdf, name='export-sales-report-pdf'),
    
    # ==================== CUSTOMER REPORTS ====================
    path('customers/summary/', views.customer_report_summary, name='customer-report-summary'),
    path('customers/export/pdf/', views.export_customer_report_pdf, name='export-customer-report-pdf'),
    
    # ==================== CATEGORY & BRAND REPORTS ====================
    path('analytics/category-brand/', views.category_brand_report, name='category-brand-report'),
    path('analytics/category-brand/export/pdf/', views.export_category_brand_pdf, name='export-category-brand-pdf'),
    
    # ==================== REPORT LOGS ====================
    path('logs/', views.ReportLogListView.as_view(), name='report-logs'),
]