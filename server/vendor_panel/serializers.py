from rest_framework import serializers
from django.contrib.auth import get_user_model
from products.models import Product, Category, Brand, ProductImage, ProductSpecification
from products.serializers import ProductImageSerializer, ProductSpecificationSerializer
from orders.models import Order, OrderItem

User = get_user_model()

class VendorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'first_name', 
                 'last_name', 'phone', 'business_name', 'gst_number', 'address', 
                 'city', 'state', 'pincode')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create(
            user_type='vendor',
            is_vendor_approved=False,  # Needs admin approval
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'phone', 
                 'business_name', 'gst_number', 'address', 'city', 'state', 'pincode',
                 'is_vendor_approved', 'vendor_commission_rate', 'created_at')
        read_only_fields = ('id', 'email', 'is_vendor_approved', 'vendor_commission_rate', 'created_at')

class VendorProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    discounted_price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('vendor',)  # Auto-set to current vendor

class VendorProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        exclude = ('vendor',)  # Will be set automatically

class VendorOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_price', 'product_image', 
                 'quantity', 'total_price', 'vendor_status')

class VendorOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = ('order_id', 'customer_name', 'customer_email', 'total_amount', 
                 'final_amount', 'status', 'payment_status', 'shipping_name', 
                 'shipping_phone', 'shipping_address', 'shipping_city', 'shipping_state', 
                 'shipping_pincode', 'created_at', 'items')
    
    def get_items(self, obj):
        # Only show items belonging to this vendor
        vendor_id = self.context.get('vendor_id')
        items = obj.items.filter(vendor_id=vendor_id)
        return VendorOrderItemSerializer(items, many=True).data