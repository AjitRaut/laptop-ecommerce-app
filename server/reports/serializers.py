from rest_framework import serializers
from .models import ReportLog

class ReportLogSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReportLog
        fields = '__all__'
        read_only_fields = ('generated_by',)

class ProductReportSerializer(serializers.Serializer):
    """Filter parameters for product reports"""
    category = serializers.IntegerField(required=False)
    brand = serializers.IntegerField(required=False)
    vendor = serializers.IntegerField(required=False)
    is_low_stock = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)

class OrderReportSerializer(serializers.Serializer):
    """Filter parameters for order reports"""
    status = serializers.CharField(required=False)
    payment_status = serializers.CharField(required=False)
    vendor = serializers.IntegerField(required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)

class VendorReportSerializer(serializers.Serializer):
    """Filter parameters for vendor reports"""
    vendor = serializers.IntegerField(required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    min_sales = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)