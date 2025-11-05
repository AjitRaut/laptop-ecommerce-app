from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from products.models import Product, Category, Brand
from orders.models import Order, OrderItem
from .serializers import (
    VendorRegistrationSerializer,
    VendorProfileSerializer,
    VendorProductSerializer,
    VendorProductCreateSerializer,
    VendorOrderSerializer
)

User = get_user_model()

class IsVendorUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.user_type == 'vendor' and
                request.user.is_vendor_approved)

class VendorRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = VendorRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Vendor registration successful. Waiting for admin approval.',
            'user': VendorProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class VendorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = VendorProfileSerializer
    permission_classes = [IsVendorUser]
    
    def get_object(self):
        return self.request.user

class VendorDashboardView(generics.GenericAPIView):
    permission_classes = [IsVendorUser]
    
    def get(self, request):
        vendor = request.user
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        
        # Vendor's products
        total_products = Product.objects.filter(vendor=vendor).count()
        active_products = Product.objects.filter(vendor=vendor, is_active=True).count()
        low_stock_products = Product.objects.filter(
            vendor=vendor, 
            stock_quantity__lte=5
        ).count()
        
        # Vendor's orders (items from their products)
        vendor_order_items = OrderItem.objects.filter(vendor=vendor)
        total_orders = vendor_order_items.values('order').distinct().count()
        pending_orders = vendor_order_items.filter(
            vendor_status='pending'
        ).values('order').distinct().count()
        
        # Revenue calculation (only from paid orders)
        total_revenue = vendor_order_items.filter(
            order__payment_status='paid'
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        # Recent orders
        recent_order_ids = vendor_order_items.values_list('order_id', flat=True).distinct()[:10]
        recent_orders = Order.objects.filter(id__in=recent_order_ids)
        recent_orders_data = VendorOrderSerializer(
            recent_orders, 
            many=True, 
            context={'vendor_id': vendor.id}
        ).data
        
        # Top selling products
        top_products = vendor_order_items.values('product__name').annotate(
            total_sold=Sum('quantity')
        ).order_by('-total_sold')[:5]
        
        stats = {
            'total_products': total_products,
            'active_products': active_products,
            'low_stock_products': low_stock_products,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'total_revenue': float(total_revenue),
            'commission_rate': float(vendor.vendor_commission_rate),
        }
        
        return Response({
            'stats': stats,
            'recent_orders': recent_orders_data,
            'top_products': list(top_products)
        })

class VendorProductListView(generics.ListAPIView):
    serializer_class = VendorProductSerializer
    permission_classes = [IsVendorUser]
    
    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user)

class VendorProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VendorProductSerializer
    permission_classes = [IsVendorUser]
    
    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user)

class VendorProductCreateView(generics.CreateAPIView):
    serializer_class = VendorProductCreateSerializer
    permission_classes = [IsVendorUser]
    
    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

class VendorOrderListView(generics.ListAPIView):
    serializer_class = VendorOrderSerializer
    permission_classes = [IsVendorUser]
    
    def get_queryset(self):
        # Get orders that contain this vendor's products
        vendor = self.request.user
        order_ids = OrderItem.objects.filter(
            vendor=vendor
        ).values_list('order_id', flat=True).distinct()
        return Order.objects.filter(id__in=order_ids)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['vendor_id'] = self.request.user.id
        return context

class VendorOrderDetailView(generics.RetrieveAPIView):
    serializer_class = VendorOrderSerializer
    permission_classes = [IsVendorUser]
    lookup_field = 'order_id'
    
    def get_queryset(self):
        vendor = self.request.user
        order_ids = OrderItem.objects.filter(
            vendor=vendor
        ).values_list('order_id', flat=True).distinct()
        return Order.objects.filter(id__in=order_ids)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['vendor_id'] = self.request.user.id
        return context

@api_view(['PATCH'])
@permission_classes([IsVendorUser])
def update_order_item_status(request, item_id):
    """Update vendor's order item status (pending -> accepted -> shipped)"""
    try:
        order_item = OrderItem.objects.get(
            id=item_id, 
            vendor=request.user
        )
        new_status = request.data.get('vendor_status')
        
        if new_status not in ['pending', 'accepted', 'shipped']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order_item.vendor_status = new_status
        order_item.save()
        
        return Response({
            'message': 'Order item status updated',
            'vendor_status': new_status
        })
    except OrderItem.DoesNotExist:
        return Response(
            {'error': 'Order item not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PATCH'])
@permission_classes([IsVendorUser])
def update_product_stock(request, product_id):
    """Quick stock update"""
    try:
        product = Product.objects.get(id=product_id, vendor=request.user)
        stock_quantity = request.data.get('stock_quantity')
        
        if stock_quantity is not None:
            product.stock_quantity = int(stock_quantity)
            product.save()
            return Response({
                'message': 'Stock updated',
                'stock_quantity': product.stock_quantity
            })
        return Response(
            {'error': 'stock_quantity required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )