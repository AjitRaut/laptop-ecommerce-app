from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ReportLog(models.Model):
    """Track report generation history"""
    REPORT_TYPES = (
        ('product', 'Product Report'),
        ('order', 'Order Report'),
        ('vendor', 'Vendor Report'),
        ('sales', 'Sales Report'),
    )
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    filters = models.JSONField(null=True, blank=True)  # Store filter criteria
    file_path = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'report_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"