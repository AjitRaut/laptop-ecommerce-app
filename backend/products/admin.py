from django.contrib import admin
from .models import Category, Brand, Product, ProductImage, ProductSpecification

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'price', 'stock_quantity', 'is_active', 'is_featured')
    list_filter = ('category', 'brand', 'product_type', 'is_active', 'is_featured')
    search_fields = ('name', 'sku')
    inlines = [ProductImageInline, ProductSpecificationInline]
    readonly_fields = ('created_at', 'updated_at')
