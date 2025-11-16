from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
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
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from io import BytesIO

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    """Only admins can access reports"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'

# ==================== TIME PERIOD FILTER UTILITY ====================

def get_date_range_from_period(period):
    """
    Get date range based on period parameter
    Returns (date_from, date_to) tuple
    """
    now = timezone.now()
    
    if period == 'today':
        date_from = now.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = now
    elif period == 'yesterday':
        yesterday = now - timedelta(days=1)
        date_from = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif period == 'this_week':
        # Start of current week (Monday)
        date_from = now - timedelta(days=now.weekday())
        date_from = date_from.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = now
    elif period == 'last_week':
        # Last week (Monday to Sunday)
        last_monday = now - timedelta(days=now.weekday() + 7)
        date_from = last_monday.replace(hour=0, minute=0, second=0, microsecond=0)
        date_to = (last_monday + timedelta(days=6)).replace(hour=23, minute=59, second=59, microsecond=999999)
    elif period == 'this_month':
        date_from = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        date_to = now
    elif period == 'last_month':
        # First day of last month
        first_of_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day_of_last_month = first_of_this_month - timedelta(days=1)
        date_from = last_day_of_last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        date_to = last_day_of_last_month.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif period == 'this_year':
        date_from = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        date_to = now
    elif period == 'last_year':
        last_year = now.year - 1
        date_from = now.replace(year=last_year, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        date_to = now.replace(year=last_year, month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
    elif period == 'last_7_days':
        date_from = now - timedelta(days=7)
        date_to = now
    elif period == 'last_30_days':
        date_from = now - timedelta(days=30)
        date_to = now
    elif period == 'last_90_days':
        date_from = now - timedelta(days=90)
        date_to = now
    else:
        # No period filter
        return None, None
    
    return date_from, date_to

def apply_date_filters(queryset, request, date_field='created_at'):
    """
    Apply date filters to queryset based on period or custom date range
    """
    period = request.query_params.get('period')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    # Priority: period parameter > custom date range
    if period:
        period_date_from, period_date_to = get_date_range_from_period(period)
        if period_date_from and period_date_to:
            queryset = queryset.filter(
                **{f'{date_field}__gte': period_date_from, f'{date_field}__lte': period_date_to}
            )
    elif date_from or date_to:
        # Use custom date range
        if date_from:
            queryset = queryset.filter(**{f'{date_field}__gte': date_from})
        if date_to:
            queryset = queryset.filter(**{f'{date_field}__lte': date_to})
    
    return queryset

# ==================== PDF GENERATION UTILITIES ====================

def create_pdf_header(story, styles, title, subtitle=None):
    """Create PDF header with title and subtitle"""
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        alignment=TA_CENTER
    )
    story.append(Paragraph(title, title_style))
    
    # Subtitle
    if subtitle:
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.grey,
            spaceAfter=20,
            alignment=TA_CENTER
        )
        story.append(Paragraph(subtitle, subtitle_style))
    
    # Date
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=30,
        alignment=TA_RIGHT
    )
    story.append(Paragraph(f"Generated on: {timezone.now().strftime('%B %d, %Y at %I:%M %p')}", date_style))

def create_summary_section(story, styles, summary_data):
    """Create summary statistics section"""
    summary_style = ParagraphStyle(
        'SummaryStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    story.append(Paragraph("Summary Statistics", summary_style))
    
    # Create summary table
    summary_table_data = [[k.replace('_', ' ').title(), str(v)] for k, v in summary_data.items()]
    summary_table = Table(summary_table_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f9fafb')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.white)
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 20))

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
    
    # Apply date filters (for products created within period)
    products = apply_date_filters(products, request, 'created_at')
    
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
    
    # Apply date filters
    products = apply_date_filters(products, request, 'created_at')
    
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
    """Get order summary statistics with period filters"""
    status_filter = request.query_params.get('status')
    payment_status = request.query_params.get('payment_status')
    
    orders = Order.objects.all()
    
    # Apply date/period filters
    orders = apply_date_filters(orders, request, 'created_at')
    
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
    
    # Daily sales for the filtered period
    daily_sales = orders.filter(
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
    """Sales breakdown by vendor with period filters"""
    order_items = OrderItem.objects.filter(
        order__payment_status='paid'
    ).select_related('vendor', 'order')
    
    # Apply date/period filters on related order
    period = request.query_params.get('period')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    if period:
        period_date_from, period_date_to = get_date_range_from_period(period)
        if period_date_from and period_date_to:
            order_items = order_items.filter(
                order__created_at__gte=period_date_from,
                order__created_at__lte=period_date_to
            )
    elif date_from or date_to:
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
    """Comprehensive vendor performance report with period filters"""
    vendors = User.objects.filter(user_type='vendor', is_vendor_approved=True)
    
    # Get date range for filtering order items
    period = request.query_params.get('period')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    date_filter_from = None
    date_filter_to = None
    
    if period:
        date_filter_from, date_filter_to = get_date_range_from_period(period)
    elif date_from:
        date_filter_from = date_from
    elif date_to:
        date_filter_to = date_to
    
    data = []
    for vendor in vendors:
        # Product stats
        total_products = Product.objects.filter(vendor=vendor).count()
        active_products = Product.objects.filter(vendor=vendor, is_active=True).count()
        
        # Order stats with date filtering
        vendor_items = OrderItem.objects.filter(vendor=vendor)
        
        # Apply date filters if provided
        if date_filter_from and date_filter_to:
            vendor_items = vendor_items.filter(
                order__created_at__gte=date_filter_from,
                order__created_at__lte=date_filter_to
            )
        elif date_filter_from:
            vendor_items = vendor_items.filter(order__created_at__gte=date_filter_from)
        elif date_filter_to:
            vendor_items = vendor_items.filter(order__created_at__lte=date_filter_to)
        
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
            'vendor_name': vendor.business_name or 'N/A',
            'email': vendor.email or 'N/A',
            'phone': vendor.phone or 'N/A',
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

# ==================== EXPORT REPORTS AS PDF ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_product_report_pdf(request):
    """Export product report as PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Create header
    create_pdf_header(story, styles, "Product Inventory Report", "Comprehensive product analysis")
    
    # Get products data
    products = Product.objects.select_related('category', 'brand', 'vendor').all()
    
    # Apply filters
    products = apply_date_filters(products, request, 'created_at')
    category = request.query_params.get('category')
    brand = request.query_params.get('brand')
    vendor = request.query_params.get('vendor')
    is_low_stock = request.query_params.get('is_low_stock')
    
    if category:
        products = products.filter(category_id=category)
    if brand:
        products = products.filter(brand_id=brand)
    if vendor:
        products = products.filter(vendor_id=vendor)
    if is_low_stock == 'true':
        products = products.filter(stock_quantity__lte=F('min_stock_level'))
    
    # Summary statistics
    total_products = products.count()
    active_products = products.filter(is_active=True).count()
    low_stock = products.filter(stock_quantity__lte=F('min_stock_level')).count()
    total_value = sum(float(p.price) * p.stock_quantity for p in products)
    
    summary_data = {
        'Total Products': total_products,
        'Active Products': active_products,
        'Low Stock Products': low_stock,
        'Total Inventory Value': f"Rs {total_value:,.2f}"
    }
    create_summary_section(story, styles, summary_data)
    
    # Products table
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    story.append(Paragraph("Product Details", section_style))
    
    # Table data
    data = [['SKU', 'Name', 'Category', 'Brand', 'Stock', 'Price', 'Value']]
    
    for product in products[:50]:  # Limit to 50 for PDF
        inventory_value = float(product.price) * product.stock_quantity
        data.append([
            product.sku,
            product.name[:30] + '...' if len(product.name) > 30 else product.name,
            product.category.name,
            product.brand.name,
            str(product.stock_quantity),
            f"Rs {float(product.price):,.0f}",
            f"Rs {inventory_value:,.0f}"
        ])
    
    # Create table
    table = Table(data, colWidths=[0.8*inch, 2*inch, 1*inch, 1*inch, 0.7*inch, 0.9*inch, 0.9*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (4, 1), (6, -1), 'RIGHT'),
    ]))
    
    story.append(table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="product_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    
    return response

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_order_report_pdf(request):
    """Export order report as PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Create header
    create_pdf_header(story, styles, "Order Sales Report", "Detailed order and revenue analysis")
    
    # Get orders data
    orders = Order.objects.select_related('user').all()
    
    # Apply filters
    orders = apply_date_filters(orders, request, 'created_at')
    status_filter = request.query_params.get('status')
    payment_status = request.query_params.get('payment_status')
    
    if status_filter:
        orders = orders.filter(status=status_filter)
    if payment_status:
        orders = orders.filter(payment_status=payment_status)
    
    # Summary statistics
    total_orders = orders.count()
    total_revenue = orders.filter(payment_status='paid').aggregate(
        total=Sum('final_amount'))['total'] or Decimal('0.00')
    avg_order = orders.aggregate(avg=Avg('final_amount'))['avg'] or Decimal('0.00')
    
    summary_data = {
        'Total Orders': total_orders,
        'Total Revenue': f"Rs {float(total_revenue):,.2f}",
        'Average Order Value': f"Rs {float(avg_order):,.2f}",
        'Paid Orders': orders.filter(payment_status='paid').count(),
        'Pending Orders': orders.filter(status='pending').count()
    }
    create_summary_section(story, styles, summary_data)
    
    # Orders table
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    story.append(Paragraph("Order Details", section_style))
    
    # Table data
    data = [['Order ID', 'Customer', 'Amount', 'Status', 'Payment', 'Date']]
    
    for order in orders[:50]:  # Limit to 50
        data.append([
            order.order_id[:10],
            order.user.email[:25],
            f"Rs {float(order.final_amount):,.0f}",
            order.status.title(),
            order.payment_status.title(),
            order.created_at.strftime('%Y-%m-%d')
        ])
    
    # Create table
    table = Table(data, colWidths=[1.2*inch, 2*inch, 1*inch, 1*inch, 1*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
    ]))
    
    story.append(table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="order_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    
    return response

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_vendor_report_pdf(request):
    """Export vendor report as PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Create header
    create_pdf_header(story, styles, "Vendor Performance Report", "Vendor sales and commission analysis")
    
    # Get vendors data
    vendors = User.objects.filter(user_type='vendor', is_vendor_approved=True)
    
    # Calculate totals
    total_vendors = vendors.count()
    total_products = Product.objects.filter(vendor__in=vendors).count()
    
    summary_data = {
        'Total Vendors': total_vendors,
        'Total Products': total_products,
        'Active Vendors': vendors.filter(is_active=True).count()
    }
    create_summary_section(story, styles, summary_data)
    
    # Vendor table
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    story.append(Paragraph("Vendor Performance Details", section_style))
    
    # Table data
    data = [['Vendor', 'Email', 'Products', 'Orders', 'Sales', 'Commission']]
    
    for vendor in vendors[:40]:  # Limit to 40
        total_products = Product.objects.filter(vendor=vendor).count()
        vendor_items = OrderItem.objects.filter(vendor=vendor)
        total_orders = vendor_items.values('order').distinct().count()
        total_sales = vendor_items.filter(
            order__payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
        
        commission_rate = float(vendor.vendor_commission_rate or 10.0)
        commission = float(total_sales) * (commission_rate / 100)
        
        # Safe handling of None values
        vendor_name = (vendor.business_name or 'N/A')[:25]
        vendor_email = (vendor.email or 'N/A')[:25]
        
        data.append([
            vendor_name,
            vendor_email,
            str(total_products),
            str(total_orders),
            "Rs {:,.0f}".format(float(total_sales)),
            "Rs {:,.0f}".format(commission)
        ])
    
    # Create table
    table = Table(data, colWidths=[1.5*inch, 1.8*inch, 0.8*inch, 0.8*inch, 1*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (2, 1), (5, -1), 'RIGHT'),
    ]))
    
    story.append(table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="vendor_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    
    return response

# ==================== REPORT LOGS ====================

class ReportLogListView(generics.ListAPIView):
    """View report generation history"""
    serializer_class = ReportLogSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return ReportLog.objects.all()[:50]  # Last 50 reports