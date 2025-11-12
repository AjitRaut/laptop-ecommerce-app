from django.contrib import admin
from .models import ReportLog

@admin.register(ReportLog)
class ReportLogAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'generated_by', 'created_at')
    list_filter = ('report_type', 'created_at')
    search_fields = ('generated_by__email', 'generated_by__username')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)