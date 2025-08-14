from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductSpecification


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"http://localhost:8000{obj.image.url}"
        return None


class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = '__all__'


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    primary_image = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    discounted_price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
        
    class Meta:
        model = Product
        fields = (
            'id', 'name', 'short_description', 'category_name', 'brand_name',
            'price', 'discount_percentage', 'discounted_price', 'is_in_stock',
            'is_featured', 'primary_image', 'image', 'warranty_months'
        )
        
    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return f"http://localhost:8000{primary_image.image.url}"
        return None
    
    def get_image(self, obj):
        request = self.context.get('request')
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return f"http://localhost:8000{primary_image.image.url}"
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    discounted_price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
        
    class Meta:
        model = Product
        fields = '__all__'


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
