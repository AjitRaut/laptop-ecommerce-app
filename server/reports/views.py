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
# Replace existing SHOP_NAME and SHOP_TAGLINE with this:
SHOP_NAME = "LaptopWorld"
SHOP_TAGLINE = "Premium Laptops & Accessories"
SHOP_LOGO_PATH = "assets/laptopWorld_Logo.png" 
SHOP_ADDRESS = "123 Tech Street, Electronic City, Bangalore - 560100"
SHOP_EMAIL = "info@laptopworld.com"
SHOP_CONTACT = "+91 98765 43210"

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
    """Create PDF header with shop name, logo, contact info and title"""
    
    # Create a table for header layout (Logo + Shop Info)
    header_data = []
    
    # Try to add logo if exists
    try:
        from reportlab.platypus import Image
        logo = Image(SHOP_LOGO_PATH, width=1*inch, height=1*inch)
        
        # Shop info text
        shop_info = f"""
        <b><font size="20" color="#1e40af">{SHOP_NAME}</font></b><br/>
        <font size="9" color="grey">{SHOP_TAGLINE}</font><br/>
        <font size="8" color="grey">{SHOP_ADDRESS}</font><br/>
        <font size="8" color="grey">Email: {SHOP_EMAIL} | Phone: {SHOP_CONTACT}</font>
        """
        shop_para = Paragraph(shop_info, styles['Normal'])
        
        header_table = Table([[logo, shop_para]], colWidths=[1.2*inch, 5*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(header_table)
    except:
        # If logo not found, show text header only
        shop_style = ParagraphStyle(
            'ShopName',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=5,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        story.append(Paragraph(SHOP_NAME, shop_style))
        
        tagline_style = ParagraphStyle(
            'Tagline',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey,
            spaceAfter=5,
            alignment=TA_CENTER
        )
        story.append(Paragraph(SHOP_TAGLINE, tagline_style))
        
        # Contact info
        contact_style = ParagraphStyle(
            'Contact',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            spaceAfter=5,
            alignment=TA_CENTER
        )
        story.append(Paragraph(SHOP_ADDRESS, contact_style))
        story.append(Paragraph(f"Email: {SHOP_EMAIL} | Phone: {SHOP_CONTACT}", contact_style))
    
    story.append(Spacer(1, 15))
    
    # Separator line
    from reportlab.platypus import HRFlowable
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
    story.append(Spacer(1, 15))
    
    # Report Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    story.append(Paragraph(title, title_style))
    
    # Subtitle
    if subtitle:
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.grey,
            spaceAfter=15,
            alignment=TA_CENTER
        )
        story.append(Paragraph(subtitle, subtitle_style))
    
    # Date
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.grey,
        spaceAfter=20,
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

def add_footer(canvas, doc):
    """Add footer to each page with shop contact info"""
    canvas.saveState()
    
    # Footer line
    canvas.setStrokeColor(colors.HexColor('#e5e7eb'))
    canvas.setLineWidth(1)
    canvas.line(0.5*inch, 0.5*inch, doc.width + inch, 0.5*inch)
    
    # Footer contact info (left side)
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(colors.grey)
    canvas.drawString(0.5*inch, 0.35*inch, f"{SHOP_NAME} | {SHOP_EMAIL} | {SHOP_CONTACT}")
    
    # Footer address (left side, second line)
    canvas.setFont('Helvetica', 7)
    canvas.drawString(0.5*inch, 0.22*inch, SHOP_ADDRESS)
    
    # Page number (right side)
    canvas.setFont('Helvetica-Bold', 8)
    canvas.drawRightString(doc.width + inch, 0.35*inch, f"Page {canvas.getPageNumber()}")
    
    canvas.restoreState()

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
# ==================== USER REPORTS ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_report_summary(request):
    """Get user summary statistics"""
    users = User.objects.all()
    
    # Apply date filters (for users created within period)
    users = apply_date_filters(users, request, 'created_at')
    
    # Apply filters
    user_type = request.query_params.get('user_type')
    is_active = request.query_params.get('is_active')
    
    if user_type:
        users = users.filter(user_type=user_type)
    if is_active:
        users = users.filter(is_active=is_active == 'true')
    
    # Calculate stats
    total_users = users.count()
    active_users = users.filter(is_active=True).count()
    inactive_users = users.filter(is_active=False).count()
    
    # User type breakdown
    customer_count = users.filter(user_type='customer').count()
    vendor_count = users.filter(user_type='vendor').count()
    admin_count = users.filter(user_type='admin').count()
    
    # Customer stats
    customers_with_orders = User.objects.filter(
        user_type='customer',
        orders__isnull=False
    ).distinct().count()
    
    # Get date range for order filtering
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
    
    # Top customers by orders
    customer_orders = Order.objects.filter(user__user_type='customer')
    
    if date_filter_from and date_filter_to:
        customer_orders = customer_orders.filter(
            created_at__gte=date_filter_from,
            created_at__lte=date_filter_to
        )
    elif date_filter_from:
        customer_orders = customer_orders.filter(created_at__gte=date_filter_from)
    elif date_filter_to:
        customer_orders = customer_orders.filter(created_at__lte=date_filter_to)
    
    top_customers = customer_orders.values(
        'user__id',
        'user__email',
        'user__first_name',
        'user__last_name'
    ).annotate(
        total_orders=Count('id'),
        total_spent=Sum('final_amount')
    ).order_by('-total_spent')[:10]
    
    data = {
        'summary': {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'customers': customer_count,
            'vendors': vendor_count,
            'admins': admin_count,
            'customers_with_orders': customers_with_orders
        },
        'top_customers': list(top_customers)
    }
    
    # Log report generation
    ReportLog.objects.create(
        report_type='user',
        generated_by=request.user,
        filters=request.query_params.dict()
    )
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_user_report_pdf(request):
    """Export user report as PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Create header
    create_pdf_header(story, styles, "User Report", "User registration and activity analysis")
    
    # Get users data
    users = User.objects.all()
    
    # Apply filters
    users = apply_date_filters(users, request, 'created_at')
    user_type = request.query_params.get('user_type')
    
    if user_type:
        users = users.filter(user_type=user_type)
    
    # Summary statistics
    total_users = users.count()
    active_users = users.filter(is_active=True).count()
    customer_count = users.filter(user_type='customer').count()
    vendor_count = users.filter(user_type='vendor').count()
    
    summary_data = {
        'Total Users': total_users,
        'Active Users': active_users,
        'Customers': customer_count,
        'Vendors': vendor_count,
        'Admins': users.filter(user_type='admin').count()
    }
    create_summary_section(story, styles, summary_data)
    
    # Users table
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    story.append(Paragraph("User Details", section_style))
    
    # Table data
    data = [['Name', 'Email', 'Type', 'Status', 'Joined Date']]
    
    for user in users[:50]:  # Limit to 50
        full_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or 'N/A'
        data.append([
            full_name[:30],
            (user.email or 'N/A')[:35],
            user.user_type.title(),
            'Active' if user.is_active else 'Inactive',
            user.created_at.strftime('%Y-%m-%d')
        ])
    
    # Create table
    table = Table(data, colWidths=[1.5*inch, 2.2*inch, 1*inch, 1*inch, 1.2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
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
    ]))
    
    story.append(table)
    
    # Build PDF
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="user_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    
    return response

# ==================== INDIVIDUAL VENDOR REPORT ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def individual_vendor_report(request, vendor_id):
    """Detailed report for a specific vendor"""
    try:
        vendor = User.objects.get(id=vendor_id, user_type='vendor')
    except User.DoesNotExist:
        return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get date range for filtering
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
    
    # Product statistics
    all_products = Product.objects.filter(vendor=vendor)
    total_products = all_products.count()
    active_products = all_products.filter(is_active=True).count()
    low_stock_products = all_products.filter(stock_quantity__lte=F('min_stock_level')).count()
    
    # Category breakdown
    category_breakdown = all_products.values('category__name').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Order statistics with date filtering
    vendor_items = OrderItem.objects.filter(vendor=vendor)
    
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
    total_items_sold = vendor_items.aggregate(total=Sum('quantity'))['total'] or 0
    
    total_sales = vendor_items.filter(
        order__payment_status='paid'
    ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
    
    # Commission calculation
    commission_rate = float(vendor.vendor_commission_rate or 10.0)
    vendor_commission = float(total_sales) * (commission_rate / 100)
    admin_share = float(total_sales) - vendor_commission
    
    # Order status breakdown
    status_breakdown = vendor_items.values('vendor_status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Top selling products
    top_products = vendor_items.values(
        'product__name',
        'product__sku'
    ).annotate(
        quantity_sold=Sum('quantity'),
        revenue=Sum('total_price')
    ).order_by('-quantity_sold')[:10]
    
    # Recent orders
    recent_orders = vendor_items.select_related('order', 'product').order_by('-order__created_at')[:20]
    
    recent_orders_data = []
    for item in recent_orders:
        recent_orders_data.append({
            'order_id': item.order.order_id,
            'product_name': item.product.name,
            'quantity': item.quantity,
            'price': float(item.product_price),
            'total': float(item.total_price),
            'status': item.vendor_status,
            'order_date': item.order.created_at.strftime('%Y-%m-%d')
        })
    
    data = {
        'vendor_info': {
            'id': vendor.id,
            'business_name': vendor.business_name or 'N/A',
            'email': vendor.email,
            'phone': vendor.phone or 'N/A',
            'commission_rate': commission_rate,
            'joined_date': vendor.created_at.strftime('%Y-%m-%d'),
            'is_active': vendor.is_active
        },
        'product_summary': {
            'total_products': total_products,
            'active_products': active_products,
            'low_stock_products': low_stock_products,
            'category_breakdown': list(category_breakdown)
        },
        'sales_summary': {
            'total_orders': total_orders,
            'total_items_sold': total_items_sold,
            'total_sales': float(total_sales),
            'vendor_commission': round(vendor_commission, 2),
            'admin_share': round(admin_share, 2),
            'status_breakdown': list(status_breakdown)
        },
        'top_products': list(top_products),
        'recent_orders': recent_orders_data
    }
    
    # Log report generation
    ReportLog.objects.create(
        report_type='vendor',
        generated_by=request.user,
        filters={'vendor_id': vendor_id, **request.query_params.dict()}
    )
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_individual_vendor_pdf(request, vendor_id):
    """Export individual vendor report as PDF"""
    try:
        vendor = User.objects.get(id=vendor_id, user_type='vendor')
    except User.DoesNotExist:
        return Response({'error': 'Vendor not found'}, status=status.HTTP_404_NOT_FOUND)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Create header
    vendor_name = vendor.business_name or vendor.email
    create_pdf_header(
        story, styles, 
        f"Vendor Report: {vendor_name}", 
        "Detailed performance and sales analysis"
    )
    
    # Get date range for filtering
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
    
    # Vendor Info Section
    info_style = ParagraphStyle(
        'InfoStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    story.append(Paragraph("Vendor Information", info_style))
    
    vendor_info_data = [
        ['Business Name', vendor.business_name or 'N/A'],
        ['Email', vendor.email or 'N/A'],
        ['Phone', vendor.phone or 'N/A'],
        ['Commission Rate', f"{vendor.vendor_commission_rate or 10.0}%"],
        ['Joined Date', vendor.created_at.strftime('%Y-%m-%d')],
        ['Status', 'Active' if vendor.is_active else 'Inactive']
    ]
    
    info_table = Table(vendor_info_data, colWidths=[2*inch, 3*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f9fafb')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.white)
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # Calculate statistics
    all_products = Product.objects.filter(vendor=vendor)
    vendor_items = OrderItem.objects.filter(vendor=vendor)
    
    if date_filter_from and date_filter_to:
        vendor_items = vendor_items.filter(
            order__created_at__gte=date_filter_from,
            order__created_at__lte=date_filter_to
        )
    elif date_filter_from:
        vendor_items = vendor_items.filter(order__created_at__gte=date_filter_from)
    elif date_filter_to:
        vendor_items = vendor_items.filter(order__created_at__lte=date_filter_to)
    
    total_products = all_products.count()
    total_orders = vendor_items.values('order').distinct().count()
    total_sales = vendor_items.filter(
        order__payment_status='paid'
    ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
    
    commission_rate = float(vendor.vendor_commission_rate or 10.0)
    vendor_commission = float(total_sales) * (commission_rate / 100)
    
    # Summary Statistics
    summary_data = {
        'Total Products': total_products,
        'Active Products': all_products.filter(is_active=True).count(),
        'Total Orders': total_orders,
        'Total Sales': f"Rs {float(total_sales):,.2f}",
        'Vendor Commission': f"Rs {vendor_commission:,.2f}",
        'Admin Share': f"Rs {(float(total_sales) - vendor_commission):,.2f}"
    }
    create_summary_section(story, styles, summary_data)
    
    # Top Products Section
    story.append(Paragraph("Top Selling Products", info_style))
    
    top_products = vendor_items.values(
        'product__name',
        'product__sku'
    ).annotate(
        quantity_sold=Sum('quantity'),
        revenue=Sum('total_price')
    ).order_by('-quantity_sold')[:10]
    
    products_data = [['Product Name', 'SKU', 'Qty Sold', 'Revenue']]
    
    for product in top_products:
        products_data.append([
            product['product__name'][:35],
            product['product__sku'],
            str(product['quantity_sold']),
            f"Rs {float(product['revenue']):,.0f}"
        ])
    
    products_table = Table(products_data, colWidths=[2.5*inch, 1.2*inch, 1*inch, 1.2*inch])
    products_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8b5cf6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ALIGN', (2, 1), (3, -1), 'RIGHT'),
    ]))
    
    story.append(products_table)
    
    # Build PDF
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="vendor_{vendor_id}_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    
    return response

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
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="product_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    
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
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="order_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    
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
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="vendor_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    
    return response

# ==================== REPORT LOGS ====================
# ==================== SALES REPORT (Detailed Revenue Analysis) ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def sales_report_summary(request):
    """Detailed sales and revenue analysis"""
    orders = Order.objects.filter(payment_status='paid')
    
    # Apply date filters
    orders = apply_date_filters(orders, request, 'created_at')
    
    # Revenue calculations
    total_revenue = orders.aggregate(total=Sum('final_amount'))['total'] or Decimal('0.00')
    total_orders = orders.count()
    avg_order_value = orders.aggregate(avg=Avg('final_amount'))['avg'] or Decimal('0.00')
    
    # Tax and shipping revenue
    total_tax = orders.aggregate(total=Sum('tax_amount'))['total'] or Decimal('0.00')
    total_shipping = orders.aggregate(total=Sum('shipping_charges'))['total'] or Decimal('0.00')
    total_discount = orders.aggregate(total=Sum('discount_amount'))['total'] or Decimal('0.00')
    
    # Payment method breakdown
    payment_methods = orders.values('payment_method').annotate(
        count=Count('id'),
        revenue=Sum('final_amount')
    ).order_by('-revenue')
    
    # Daily revenue trend
    daily_revenue = orders.extra(
        select={'date': 'DATE(created_at)'}
    ).values('date').annotate(
        orders=Count('id'),
        revenue=Sum('final_amount')
    ).order_by('date')
    
    # Monthly revenue (for current year)
    monthly_revenue = orders.extra(
        select={'month': 'EXTRACT(month FROM created_at)'}
    ).values('month').annotate(
        orders=Count('id'),
        revenue=Sum('final_amount')
    ).order_by('month')
    
    # Top revenue generating products
    top_revenue_products = OrderItem.objects.filter(
        order__in=orders
    ).values('product__name', 'product__sku').annotate(
        quantity=Sum('quantity'),
        revenue=Sum('total_price')
    ).order_by('-revenue')[:15]
    
    data = {
        'summary': {
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'average_order_value': float(avg_order_value),
            'total_tax_collected': float(total_tax),
            'total_shipping_revenue': float(total_shipping),
            'total_discounts_given': float(total_discount),
            'net_revenue': float(total_revenue - total_discount)
        },
        'payment_methods': list(payment_methods),
        'daily_revenue': list(daily_revenue),
        'monthly_revenue': list(monthly_revenue),
        'top_revenue_products': list(top_revenue_products)
    }
    
    # Log report
    ReportLog.objects.create(
        report_type='sales',
        generated_by=request.user,
        filters=request.query_params.dict()
    )
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_sales_report_pdf(request):
    """Export sales report as PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    create_pdf_header(story, styles, "Sales & Revenue Report", "Comprehensive revenue and sales analysis")
    
    # Get orders
    orders = Order.objects.filter(payment_status='paid')
    orders = apply_date_filters(orders, request, 'created_at')
    
    # Summary
    total_revenue = orders.aggregate(total=Sum('final_amount'))['total'] or Decimal('0.00')
    total_orders = orders.count()
    avg_order = orders.aggregate(avg=Avg('final_amount'))['avg'] or Decimal('0.00')
    total_tax = orders.aggregate(total=Sum('tax_amount'))['total'] or Decimal('0.00')
    total_discount = orders.aggregate(total=Sum('discount_amount'))['total'] or Decimal('0.00')
    
    summary_data = {
        'Total Revenue': f"Rs {float(total_revenue):,.2f}",
        'Total Orders': total_orders,
        'Average Order Value': f"Rs {float(avg_order):,.2f}",
        'Tax Collected': f"Rs {float(total_tax):,.2f}",
        'Discounts Given': f"Rs {float(total_discount):,.2f}",
        'Net Revenue': f"Rs {float(total_revenue - total_discount):,.2f}"
    }
    create_summary_section(story, styles, summary_data)
    
    # Top products by revenue
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    story.append(Paragraph("Top Revenue Products", section_style))
    
    top_products = OrderItem.objects.filter(
        order__in=orders
    ).values('product__name', 'product__sku').annotate(
        quantity=Sum('quantity'),
        revenue=Sum('total_price')
    ).order_by('-revenue')[:20]
    
    data = [['Product', 'SKU', 'Qty', 'Revenue']]
    for item in top_products:
        data.append([
            item['product__name'][:35],
            item['product__sku'],
            str(item['quantity']),
            f"Rs {float(item['revenue']):,.0f}"
        ])
    
    table = Table(data, colWidths=[2.5*inch, 1.2*inch, 0.8*inch, 1.3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
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
        ('ALIGN', (2, 1), (3, -1), 'RIGHT'),
    ]))
    story.append(table)
    
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="sales_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    return response

# ==================== CUSTOMER REPORT ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def customer_report_summary(request):
    """Customer behavior and purchase analysis"""
    customers = User.objects.filter(user_type='customer')
    
    # Apply date filters
    customers = apply_date_filters(customers, request, 'created_at')
    
    # Get date range for orders
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
    
    # Customer statistics
    total_customers = customers.count()
    active_customers = customers.filter(is_active=True).count()
    verified_customers = customers.filter(is_verified=True).count()
    
    # Customers with orders
    customer_orders = Order.objects.filter(user__user_type='customer')
    
    if date_filter_from and date_filter_to:
        customer_orders = customer_orders.filter(
            created_at__gte=date_filter_from,
            created_at__lte=date_filter_to
        )
    elif date_filter_from:
        customer_orders = customer_orders.filter(created_at__gte=date_filter_from)
    elif date_filter_to:
        customer_orders = customer_orders.filter(created_at__lte=date_filter_to)
    
    customers_with_orders = customer_orders.values('user').distinct().count()
    
    # Top customers by spending
    top_customers = customer_orders.filter(
        payment_status='paid'
    ).values(
        'user__id',
        'user__email',
        'user__first_name',
        'user__last_name'
    ).annotate(
        total_orders=Count('id'),
        total_spent=Sum('final_amount'),
        avg_order_value=Avg('final_amount')
    ).order_by('-total_spent')[:20]
    
    # Customer segmentation by order count
    order_counts = customer_orders.values('user').annotate(
        order_count=Count('id')
    )
    
    one_time_buyers = sum(1 for item in order_counts if item['order_count'] == 1)
    repeat_customers = sum(1 for item in order_counts if item['order_count'] >= 2)
    loyal_customers = sum(1 for item in order_counts if item['order_count'] >= 5)
    
    # Location breakdown
    location_stats = customers.exclude(city__isnull=True).exclude(city='').values('city', 'state').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    data = {
        'summary': {
            'total_customers': total_customers,
            'active_customers': active_customers,
            'verified_customers': verified_customers,
            'customers_with_orders': customers_with_orders,
            'one_time_buyers': one_time_buyers,
            'repeat_customers': repeat_customers,
            'loyal_customers': loyal_customers
        },
        'top_customers': list(top_customers),
        'location_breakdown': list(location_stats)
    }
    
    # Log report
    ReportLog.objects.create(
        report_type='customer',
        generated_by=request.user,
        filters=request.query_params.dict()
    )
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_customer_report_pdf(request):
    """Export customer report as PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    create_pdf_header(story, styles, "Customer Analysis Report", "Customer behavior and purchase patterns")
    
    customers = User.objects.filter(user_type='customer')
    customers = apply_date_filters(customers, request, 'created_at')
    
    # Summary
    total_customers = customers.count()
    active_customers = customers.filter(is_active=True).count()
    
    summary_data = {
        'Total Customers': total_customers,
        'Active Customers': active_customers,
        'Verified Customers': customers.filter(is_verified=True).count()
    }
    create_summary_section(story, styles, summary_data)
    
    # Top customers
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    story.append(Paragraph("Top Customers by Spending", section_style))
    
    top_customers = Order.objects.filter(
        user__user_type='customer',
        payment_status='paid'
    ).values(
        'user__email',
        'user__first_name',
        'user__last_name'
    ).annotate(
        orders=Count('id'),
        total_spent=Sum('final_amount')
    ).order_by('-total_spent')[:20]
    
    data = [['Customer', 'Email', 'Orders', 'Total Spent']]
    for customer in top_customers:
        name = f"{customer['user__first_name'] or ''} {customer['user__last_name'] or ''}".strip() or 'N/A'
        data.append([
            name[:25],
            customer['user__email'][:30],
            str(customer['orders']),
            f"Rs {float(customer['total_spent']):,.0f}"
        ])
    
    table = Table(data, colWidths=[1.5*inch, 2*inch, 0.8*inch, 1.3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
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
        ('ALIGN', (2, 1), (3, -1), 'RIGHT'),
    ]))
    story.append(table)
    
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="customer_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    return response

# ==================== CATEGORY & BRAND REPORT ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def category_brand_report(request):
    """Product performance by category and brand"""
    
    # Get date range for orders
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
    
    # Category performance
    categories = Category.objects.all()
    category_data = []
    
    for category in categories:
        products = Product.objects.filter(category=category)
        total_products = products.count()
        active_products = products.filter(is_active=True).count()
        total_stock = products.aggregate(total=Sum('stock_quantity'))['total'] or 0
        
        # Sales data
        order_items = OrderItem.objects.filter(product__category=category)
        
        if date_filter_from and date_filter_to:
            order_items = order_items.filter(
                order__created_at__gte=date_filter_from,
                order__created_at__lte=date_filter_to
            )
        elif date_filter_from:
            order_items = order_items.filter(order__created_at__gte=date_filter_from)
        elif date_filter_to:
            order_items = order_items.filter(order__created_at__lte=date_filter_to)
        
        units_sold = order_items.aggregate(total=Sum('quantity'))['total'] or 0
        revenue = order_items.filter(
            order__payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
        
        category_data.append({
            'category_id': category.id,
            'category_name': category.name,
            'total_products': total_products,
            'active_products': active_products,
            'total_stock': total_stock,
            'units_sold': units_sold,
            'revenue': float(revenue)
        })
    
    # Brand performance
    brands = Brand.objects.all()
    brand_data = []
    
    for brand in brands:
        products = Product.objects.filter(brand=brand)
        total_products = products.count()
        active_products = products.filter(is_active=True).count()
        
        # Sales data
        order_items = OrderItem.objects.filter(product__brand=brand)
        
        if date_filter_from and date_filter_to:
            order_items = order_items.filter(
                order__created_at__gte=date_filter_from,
                order__created_at__lte=date_filter_to
            )
        elif date_filter_from:
            order_items = order_items.filter(order__created_at__gte=date_filter_from)
        elif date_filter_to:
            order_items = order_items.filter(order__created_at__lte=date_filter_to)
        
        units_sold = order_items.aggregate(total=Sum('quantity'))['total'] or 0
        revenue = order_items.filter(
            order__payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
        
        brand_data.append({
            'brand_id': brand.id,
            'brand_name': brand.name,
            'total_products': total_products,
            'active_products': active_products,
            'units_sold': units_sold,
            'revenue': float(revenue)
        })
    
    data = {
        'category_performance': sorted(category_data, key=lambda x: x['revenue'], reverse=True),
        'brand_performance': sorted(brand_data, key=lambda x: x['revenue'], reverse=True)
    }
    
    # Log report
    ReportLog.objects.create(
        report_type='analytics',
        generated_by=request.user,
        filters=request.query_params.dict()
    )
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_category_brand_pdf(request):
    """Export category/brand report as PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    create_pdf_header(story, styles, "Category & Brand Performance", "Product analytics by category and brand")
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=10
    )
    
    # Category Performance
    story.append(Paragraph("Category Performance", section_style))
    
    categories = Category.objects.all()
    cat_data = [['Category', 'Products', 'Active', 'Units Sold', 'Revenue']]
    
    for category in categories[:15]:
        products = Product.objects.filter(category=category)
        order_items = OrderItem.objects.filter(product__category=category)
        units_sold = order_items.aggregate(total=Sum('quantity'))['total'] or 0
        revenue = order_items.filter(
            order__payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
        
        cat_data.append([
            category.name[:25],
            str(products.count()),
            str(products.filter(is_active=True).count()),
            str(units_sold),
            f"Rs {float(revenue):,.0f}"
        ])
    
    cat_table = Table(cat_data, colWidths=[1.8*inch, 0.9*inch, 0.9*inch, 1*inch, 1.2*inch])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
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
        ('ALIGN', (1, 1), (4, -1), 'RIGHT'),
    ]))
    story.append(cat_table)
    story.append(Spacer(1, 20))
    
    # Brand Performance
    story.append(Paragraph("Brand Performance", section_style))
    
    brands = Brand.objects.all()
    brand_data = [['Brand', 'Products', 'Active', 'Units Sold', 'Revenue']]
    
    for brand in brands[:15]:
        products = Product.objects.filter(brand=brand)
        order_items = OrderItem.objects.filter(product__brand=brand)
        units_sold = order_items.aggregate(total=Sum('quantity'))['total'] or 0
        revenue = order_items.filter(
            order__payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or Decimal('0.00')
        
        brand_data.append([
            brand.name[:25],
            str(products.count()),
            str(products.filter(is_active=True).count()),
            str(units_sold),
            f"Rs {float(revenue):,.0f}"
        ])
    
    brand_table = Table(brand_data, colWidths=[1.8*inch, 0.9*inch, 0.9*inch, 1*inch, 1.2*inch])
    brand_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ec4899')),
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
        ('ALIGN', (1, 1), (4, -1), 'RIGHT'),
    ]))
    story.append(brand_table)
    
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="category_brand_report_{timezone.now().strftime("%Y%m%d")}.pdf"'
    return response

class ReportLogListView(generics.ListAPIView):
    """View report generation history"""
    serializer_class = ReportLogSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return ReportLog.objects.all()[:50]  # Last 50 reports