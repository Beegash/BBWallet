from django.contrib import admin
from .models import Investment, Transaction, InvestmentGoal, TaxReport


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'child', 'investment_type', 'amount', 'frequency', 'status', 'total_contributed', 'created_at')
    list_filter = ('investment_type', 'frequency', 'status', 'created_at')
    search_fields = ('user__email', 'child__name', 'smart_contract_address')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'child', 'investment_type', 'amount', 'frequency')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'next_payment_date')
        }),
        ('Status', {
            'fields': ('status', 'total_contributed')
        }),
        ('Blockchain', {
            'fields': ('smart_contract_address', 'transaction_hash')
        }),
    )
    
    readonly_fields = ('total_contributed',)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'child', 'transaction_type', 'amount', 'token', 'status', 'created_at')
    list_filter = ('transaction_type', 'token', 'status', 'created_at')
    search_fields = ('user__email', 'child__name', 'transaction_hash')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'child', 'investment', 'transaction_type', 'amount', 'token')
        }),
        ('Status', {
            'fields': ('status', 'description')
        }),
        ('Blockchain', {
            'fields': ('transaction_hash', 'block_number', 'gas_used', 'gas_price')
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(InvestmentGoal)
class InvestmentGoalAdmin(admin.ModelAdmin):
    list_display = ('child', 'target_amount', 'target_date', 'monthly_contribution', 'progress_percentage', 'months_remaining', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('child__name', 'child__user__email')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Goal Information', {
            'fields': ('child', 'target_amount', 'target_date', 'monthly_contribution')
        }),
        ('Details', {
            'fields': ('description', 'is_active')
        }),
    )
    
    readonly_fields = ('progress_percentage', 'months_remaining')


@admin.register(TaxReport)
class TaxReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'report_type', 'year', 'generated_at', 'is_downloaded')
    list_filter = ('report_type', 'year', 'is_downloaded', 'generated_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    ordering = ('-generated_at',)
    
    fieldsets = (
        ('Report Information', {
            'fields': ('user', 'report_type', 'year')
        }),
        ('File', {
            'fields': ('file_path', 'is_downloaded')
        }),
    )
    
    readonly_fields = ('generated_at',)
