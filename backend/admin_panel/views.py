from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from products.models import Product, Category, Brand
from orders.models import Order, OrderItem
from products.serializers import ProductListSerializer
from orders.serializers import OrderSerializer
from users.serializers import UserProfileSerializer

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'

class AdminDashboardView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get dashboard statistics
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        
        stats = {
            'total_products': Product.objects.count(),
            'total_users': User.objects.filter(user_type='customer').count(),
            'total_orders': Order.objects.count(),
            'total_revenue': Order.objects.filter(payment_status='paid').aggregate(
                total=Sum('final_amount'))['total'] or 0,
            'orders_today': Order.objects.filter(created_at__date=today).count(),
            'orders_this_month': Order.objects.filter(created_at__date__gte=last_30_days).count(),
            'low_stock_products': Product.objects.filter(stock_quantity__lte=5).count(),
            'pending_orders': Order.objects.filter(status='pending').count(),
        }
        
        # Recent orders
        recent_orders = Order.objects.all()[:10]
        recent_orders_data = OrderSerializer(recent_orders, many=True).data
        
        # Top selling products
        top_products = OrderItem.objects.values('product__name').annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:5]
        
        return Response({
            'stats': stats,
            'recent_orders': recent_orders_data,
            'top_products': list(top_products)
        })

class AdminProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    permission_classes = [IsAdminUser]

class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'order_id'

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.filter(user_type='customer')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]

class AdminAnalyticsView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Sales analytics for last 30 days
        last_30_days = timezone.now().date() - timedelta(days=30)
        
        daily_sales = Order.objects.filter(
            created_at__date__gte=last_30_days,
            payment_status='paid'
        ).extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(
            total_amount=Sum('final_amount'),
            order_count=Count('id')
        ).order_by('day')
        
        # Category-wise sales
        category_sales = OrderItem.objects.select_related('product__category').values(
            'product__category__name'
        ).annotate(
            total_amount=Sum('total_price'),
            total_quantity=Sum('quantity')
        ).order_by('-total_amount')
        
        return Response({
            'daily_sales': list(daily_sales),
            'category_sales': list(category_sales)
        })