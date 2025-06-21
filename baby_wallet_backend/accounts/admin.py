from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Child, UserProfile, WalletConnection


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'wallet_connected', 'wallet_type', 'is_staff', 'is_active')
    list_filter = ('wallet_connected', 'wallet_type', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Wallet Information', {
            'fields': ('wallet_address', 'wallet_connected', 'wallet_type')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Wallet Information', {
            'fields': ('wallet_address', 'wallet_connected', 'wallet_type')
        }),
    )


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'age', 'current_balance', 'target_amount', 'progress_percentage', 'years_until_unlock', 'is_active')
    list_filter = ('gender', 'is_active', 'created_at', 'unlock_age')
    search_fields = ('name', 'user__email', 'user__first_name', 'user__last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'date_of_birth', 'gender', 'color_theme')
        }),
        ('Financial Information', {
            'fields': ('target_amount', 'current_balance', 'unlock_age')
        }),
        ('Media', {
            'fields': ('profile_image',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ('age', 'progress_percentage', 'years_until_unlock', 'projected_value_at_18')
    
    def progress_percentage(self, obj):
        return f"{obj.progress_percentage:.1f}%"
    progress_percentage.short_description = 'Progress %'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'preferred_currency', 'created_at')
    list_filter = ('preferred_currency', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'phone_number')
    ordering = ('-created_at',)


@admin.register(WalletConnection)
class WalletConnectionAdmin(admin.ModelAdmin):
    list_display = ('user', 'wallet_type', 'wallet_address', 'connected_at', 'is_active')
    list_filter = ('wallet_type', 'is_active', 'connected_at')
    search_fields = ('user__email', 'wallet_address')
    ordering = ('-connected_at',)
    
    readonly_fields = ('connected_at', 'disconnected_at')
