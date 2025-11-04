from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Brand, Product
from .serializers import (CategorySerializer, BrandSerializer, ProductListSerializer, 
                         ProductDetailSerializer, ProductCreateUpdateSerializer)

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer

class BrandListCreateView(generics.ListCreateAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'product_type', 'is_featured']  # keep category out
    search_fields = ['name', 'description', 'short_description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        # --- Filter by category (ID or name) ---
        category = self.request.query_params.get('category')
        if category:
            if category.isdigit():
                queryset = queryset.filter(category_id=int(category))
            else:
                queryset = queryset.filter(category__name__icontains=category)

        # --- Filter by brand ---
        brand = self.request.query_params.get('brand')
        if brand:
            if brand.isdigit():
                queryset = queryset.filter(brand_id=int(brand))
            else:
                queryset = queryset.filter(brand__name__icontains=brand)

        # --- Price range filtering ---
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer

class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductCreateUpdateSerializer

class ProductUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductCreateUpdateSerializer

@api_view(['GET'])
def featured_products(request):
    products = Product.objects.filter(is_active=True, is_featured=True)[:8]
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)