from rest_framework import generics, status, permissions
from decimal import Decimal
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .utils import send_invoice_email
from django.db import transaction
from .models import Cart, CartItem, Wishlist, WishlistItem, Order, OrderItem
from products.models import Product
from .serializers import (CartSerializer, CartItemSerializer, WishlistSerializer,
                         OrderSerializer, OrderCreateSerializer)

class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response({'message': 'Product added to cart'}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_cart_item(request, item_id):
    quantity = int(request.data.get('quantity', 1))
    
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        cart_item.quantity = quantity
        cart_item.save()
        return Response({'message': 'Cart updated'}, status=status.HTTP_200_OK)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_from_cart(request, item_id):
    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        cart_item.delete()
        return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

class WishlistView(generics.RetrieveAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_wishlist(request):
    product_id = request.data.get('product_id')
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product=product
        )
        
        if created:
            return Response({'message': 'Product added to wishlist'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Product already in wishlist'}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_order(request):
    serializer = OrderCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Get the user's cart
            cart = Cart.objects.get(user=request.user)
            cart_items = cart.items.all()

            if not cart_items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate totals
            total_amount = sum(item.total_price for item in cart_items)
            tax_amount = total_amount * Decimal('0.18')
            shipping_charges = 50 if total_amount < 500 else 0
            final_amount = total_amount + tax_amount + shipping_charges

            # Create the order
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                tax_amount=tax_amount,
                shipping_charges=shipping_charges,
                final_amount=final_amount,
                **serializer.validated_data
            )

            # Create order items and update stock
            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    product_price=cart_item.product.discounted_price,
                    quantity=cart_item.quantity,
                    total_price=cart_item.total_price
                )

                product = cart_item.product
                product.stock_quantity -= cart_item.quantity
                product.save()

            # Clear the cart
            cart_items.delete()

            # Try sending the invoice email
            invoice_sent = False
            try:
                send_invoice_email(order, "order_confirmation")
                invoice_sent = True
            except Exception as e:
                print(f"[Invoice Email Error] {str(e)}")

            return Response({
                'message': 'Order created successfully',
                'order_id': order.order_id,
                'final_amount': final_amount,
                'invoice_sent': invoice_sent
            }, status=status.HTTP_201_CREATED)

    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)