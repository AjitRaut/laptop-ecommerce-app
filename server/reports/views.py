from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from products.models import Product, Category, Brand
from orders.models import Order, OrderItem
from django.contrib.auth import get_user_model
from .models import ReportLog
from .serializers import (
    ReportLogSerializer,
    ProductReportSerializer,
    OrderReportSerializer,
    VendorReportSerializer
)
import csv
from django.http import HttpResponse

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    """Only admins can access reports"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'

# ==================== PRODUCT REPORTS ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def product_report_summary(request):
    """Get product summary statistics"""
    filters = {}
    
    # Apply filters
    category = request.query_params.get('category')
    brand = request.query_params.get('brand')
    vendor = request.query_params.get('vendor')
    is_low_stock = request.query_params.get('is_low_stock')
    
    products = Product.objects.all()
    
    if category:
        products = products.filter(category_id=category)
    if brand:
        products = products.filter(brand_id=brand)
    if vendor:
        products = products.filter(vendor_id=vendor)
    if is_low_stock == 'true':
        products = products.filter(stock_quantity__lte=F('min_stock_level'))
    
    # Calculate stats
    total_products = products.count()
    active_products = products.filter(is_active=True).count()
    inactive_products = products.filter(is_active=False).count()
    low_stock = products.filter(stock_quantity__lte=F('min_stock_level')).count()
    out_of_stock = products.filter(stock_quantity=0).count()
    
    total_inventory_value = sum(
        float(p.price) * p.stock_quantity for p in products
    )
    
    # Category breakdown
    category_stats = products.values('category__name').annotate(
        count=Count('id'),
        total_value=Sum(F('price') * F('stock_quantity'))
    ).order_by('-count')
    
    # Brand breakdown
    brand_stats = products.values('brand__name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Vendor breakdown
    vendor_stats = products.values('vendor__business_name', 'vendor__id').annotate(
        count=Count('id'),
        total_stock=Sum('stock_quantity')
    ).order_by('-count')
    
    data = {
        'summary': {
            'total_products': total_products,
            'active_products': active_products,
            'inactive_products': inactive_products,
            'low_stock_products': low_stock,
            'out_of_stock_products': out_of_stock,
            'total_inventory_value': round(total_inventory_value, 2)
        },
        'category_breakdown': list(category_stats),
        'brand_breakdown': list(brand_stats),
        'vendor_breakdown': list(vendor_stats)
    }
    
    # Log report generation
    ReportLog.objects.create(
        report_type='product',
        generated_by=request.user,
        filters=request.query_params.dict()
    )
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def product_stock_report(request):
    """Detailed stock report"""
    products = Product.objects.select_related('category', 'brand', 'vendor').all()
    
    # Apply filters
    is_low_stock = request.query_params.get('is_low_stock')
    if is_low_stock == 'true':
        products = products.filter(stock_quantity__lte=F('min_stock_level'))
    
    data = []
    for product in products:
        data.append({
            'id': product.id,
            'name': product.name,
            'sku': product.sku,
            'category': product.category.name,
            'brand': product.brand.name,
            'vendor': product.vendor.business_name if product.vendor else 'N/A',
            'stock_quantity': product.stock_quantity,
            'min_stock_level': product.min_stock_level,
            'is_low_stock': product.is_low_stock,
            'price': float(product.price),
            'inventory_value': float(product.price) * product.stock_quantity
        })
    
    return Response(data)

# ==================== ORDER REPORTS ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def order_report_summary(request):
    """Get order summary statistics"""
    # Date filters
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    status_filter = request.query_params.get('status')
    payment_status = request.query_params.get('payment_status')
    
    orders = Order.objects.all()
    
    if date_from:
        orders = orders.filter(created_at__gte=date_from)
    if date_to:
        orders = orders.filter(created_at__lte=date_to)
    if status_filter:
        orders = orders.filter(status=status_filter)
    if payment_status:
        orders = orders.filter(payment_status=payment_status)
    
    # Calculate stats
    total_orders = orders.count()
    total_revenue = orders.filter(payment_status='paid').aggregate(
        total=Sum('final_amount')
    )['total'] or Decimal('0.00')
    
    avg_order_value = orders.aggregate(avg=Avg('final_amount'))['avg'] or Decimal('0.00')
    
    # Status breakdown
    status_breakdown = orders.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Payment status breakdown
    payment_breakdown = orders.values('payment_status').annotate(
        count=Count('id'),
        total=Sum('final_amount')
    ).order_by('-count')
    
    # Daily sales (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    daily_sales = orders.filter(
        created_at__gte=thirty_days_ago,
        payment_status='paid'
    ).extra(
        select={'date': 'DATE(created_at)'}
    ).values('date').annotate(
        orders=Count('id'),
        revenue=Sum('final_amount')
    ).order_by('date')
    
    # Top selling products
    top_products = OrderItem.objects.filter(
        order__in=orders
    ).values('product__name').annotate(
        quantity_sold=Sum('quantity'),
        revenue=Sum('total_price')
    ).order_by('-quantity_sold')[:10]
    
    data = {
        'summary': {
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'average_order_value': float(avg_order_value),
        },
        'status_breakdown': list(status_breakdown),
        'payment_breakdown': list(payment_breakdown),
        'daily_sales': list(daily_sales),
        'top_products': list(top_products)
    }
    
    # Log report
    ReportLog.objects.create(
        report_type='order',
        generated_by=request.user,
        filters=request.query_params.dict()
    )
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def sales_by_vendor_report(request):
    """Sales breakdown by vendor"""
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    order_items = OrderItem.objects.filter(
        order__payment_status='paid'
    ).select_related('vendor', 'order')
    
    if date_from:
        order_items = order_items.filter(order__created_at__gte=date_from)
    if date_to:
        order_items = order_items.filter(order__created_at__lte=date_to)
    
    # Group by vendor
    vendor_sales = order_items.values(
        'vendor__id',
        'vendor__business_name',
        'vendor__email'
    ).annotate(
        total_orders=Count('order', distinct=True),
        total_items_sold=Sum('quantity'),
        total_sales=Sum('total_price'),
        avg_order_value=Avg('total_price')
    ).order_by('-total_sales')
    
    # Calculate commission for each vendor
    data = []
    for vendor in vendor_sales:
        vendor_obj = User.objects.get(id=vendor['vendor__id'])
        commission_rate = float(vendor_obj.vendor_commission_rate or 10.0)
        total_sales = float(vendor['total_sales'])
        commission = total_sales * (commission_rate / 100)
        admin_share = total_sales - commission
        
        data.append({
            'vendor_id': vendor['vendor__id'],
            'vendor_name': vendor['vendor__business_name'],
            'vendor_email': vendor['vendor__email'],
            'total_orders': vendor['total_orders'],
            'total_items_sold': vendor['total_items_sold'],
            'total_sales': total_sales,
            'commission_rate': commission_rate,
            'vendor_commission': round(commission, 2),
            'admin_revenue': round(admin_share, 2)
        })
    
    return Response(data)

# ==================== VENDOR REPORTS ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def vendor_performance_report(request):
    """Comprehensive vendor performance report"""
    vendors = User.objects.filter(user_type='vendor', is_vendor_approved=True)
    
    data = []
    for vendor in vendors:
        # Product stats
        total_products = Product.objects.filter(vendor=vendor).count()
        active_products = Product.objects.filter(vendor=vendor, is_active=True).count()
        
        # Order stats
        vendor_items = OrderItem.objects.filter(vendor=vendor)
        total_orders = vendor_items.values('order').distinct().count()
        total_sales = vendor_items.filter(
            order__payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
        
        commission_rate = float(vendor.vendor_commission_rate or 10.0)
        commission = float(total_sales) * (commission_rate / 100)
        
        # Pending orders
        pending_items = vendor_items.filter(vendor_status='pending').count()
        
        data.append({
            'vendor_id': vendor.id,
            'vendor_name': vendor.business_name,
            'email': vendor.email,
            'phone': vendor.phone,
            'total_products': total_products,
            'active_products': active_products,
            'total_orders': total_orders,
            'pending_orders': pending_items,
            'total_sales': float(total_sales),
            'commission_rate': commission_rate,
            'vendor_commission': round(commission, 2),
            'joined_date': vendor.created_at.strftime('%Y-%m-%d')
        })
    
    return Response(data)

# ==================== EXPORT REPORTS ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_product_report_csv(request):
    """Export product report as CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="product_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Product ID', 'Name', 'SKU', 'Category', 'Brand', 'Vendor',
        'Price', 'Stock', 'Min Stock', 'Status', 'Created At'
    ])
    
    products = Product.objects.select_related('category', 'brand', 'vendor').all()
    
    for product in products:
        writer.writerow([
            product.id,
            product.name,
            product.sku,
            product.category.name,
            product.brand.name,
            product.vendor.business_name if product.vendor else 'N/A',
            float(product.price),
            product.stock_quantity,
            product.min_stock_level,
            'Active' if product.is_active else 'Inactive',
            product.created_at.strftime('%Y-%m-%d')
        ])
    
    return response

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_order_report_csv(request):
    """Export order report as CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="order_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Order ID', 'Customer', 'Email', 'Total Amount', 'Status',
        'Payment Status', 'Created At'
    ])
    
    orders = Order.objects.select_related('user').all()
    
    for order in orders:
        writer.writerow([
            order.order_id,
            order.user.get_full_name(),
            order.user.email,
            float(order.final_amount),
            order.status,
            order.payment_status,
            order.created_at.strftime('%Y-%m-%d %H:%M')
        ])
    
    return response

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_vendor_report_csv(request):
    """Export vendor report as CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="vendor_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Vendor ID', 'Business Name', 'Email', 'Phone', 'Total Products',
        'Active Products', 'Total Orders', 'Total Sales', 'Commission Rate',
        'Vendor Commission', 'Joined Date'
    ])
    
    vendors = User.objects.filter(user_type='vendor', is_vendor_approved=True)
    
    for vendor in vendors:
        total_products = Product.objects.filter(vendor=vendor).count()
        active_products = Product.objects.filter(vendor=vendor, is_active=True).count()
        
        vendor_items = OrderItem.objects.filter(vendor=vendor)
        total_orders = vendor_items.values('order').distinct().count()
        total_sales = vendor_items.filter(
            order__payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
        
        commission_rate = float(vendor.vendor_commission_rate or 10.0)
        commission = float(total_sales) * (commission_rate / 100)
        
        writer.writerow([
            vendor.id,
            vendor.business_name,
            vendor.email,
            vendor.phone or 'N/A',
            total_products,
            active_products,
            total_orders,
            float(total_sales),
            commission_rate,
            round(commission, 2),
            vendor.created_at.strftime('%Y-%m-%d')
        ])
    
    return response

# ==================== REPORT LOGS ====================

class ReportLogListView(generics.ListAPIView):
    """View report generation history"""
    serializer_class = ReportLogSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return ReportLog.objects.all()[:50]  # Last 50 reports