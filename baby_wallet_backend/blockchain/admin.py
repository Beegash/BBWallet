from django.contrib import admin
from .models import SmartContract, NFT, BlockchainTransaction, GasTracker


@admin.register(SmartContract)
class SmartContractAdmin(admin.ModelAdmin):
    list_display = ('contract_type', 'child', 'user', 'contract_address', 'network', 'status', 'deployed_at')
    list_filter = ('contract_type', 'network', 'status', 'deployed_at', 'created_at')
    search_fields = ('contract_address', 'child__name', 'user__email')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'child', 'investment', 'contract_type', 'network')
        }),
        ('Contract Details', {
            'fields': ('contract_address', 'status', 'deployment_hash')
        }),
        ('Blockchain Data', {
            'fields': ('block_number', 'gas_used', 'gas_price')
        }),
        ('Contract Data', {
            'fields': ('contract_abi', 'contract_bytecode', 'constructor_args')
        }),
        ('Timestamps', {
            'fields': ('deployed_at',)
        }),
    )
    
    readonly_fields = ('deployed_at', 'created_at', 'updated_at')


@admin.register(NFT)
class NFTAdmin(admin.ModelAdmin):
    list_display = ('nft_type', 'child', 'user', 'token_id', 'status', 'minted_at')
    list_filter = ('nft_type', 'status', 'minted_at', 'created_at')
    search_fields = ('token_id', 'child__name', 'user__email', 'smart_contract__contract_address')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'child', 'smart_contract', 'nft_type', 'token_id')
        }),
        ('NFT Details', {
            'fields': ('token_uri', 'status', 'mint_hash')
        }),
        ('Blockchain Data', {
            'fields': ('block_number',)
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
        ('Timestamps', {
            'fields': ('minted_at',)
        }),
    )
    
    readonly_fields = ('minted_at', 'created_at', 'updated_at')


@admin.register(BlockchainTransaction)
class BlockchainTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_type', 'user', 'transaction_hash', 'network', 'status', 'gas_cost_eth', 'confirmed_at')
    list_filter = ('transaction_type', 'network', 'status', 'confirmed_at', 'created_at')
    search_fields = ('transaction_hash', 'user__email', 'from_address', 'to_address')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'transaction_type', 'transaction_hash', 'network')
        }),
        ('Transaction Details', {
            'fields': ('status', 'from_address', 'to_address', 'value')
        }),
        ('Blockchain Data', {
            'fields': ('block_number', 'gas_used', 'gas_price', 'data')
        }),
        ('Receipt', {
            'fields': ('receipt',)
        }),
        ('Timestamps', {
            'fields': ('confirmed_at',)
        }),
    )
    
    readonly_fields = ('gas_cost_eth', 'confirmed_at', 'created_at', 'updated_at')


@admin.register(GasTracker)
class GasTrackerAdmin(admin.ModelAdmin):
    list_display = ('network', 'gas_price_gwei', 'gas_price_eth', 'block_number', 'timestamp')
    list_filter = ('network', 'timestamp')
    search_fields = ('network', 'block_number')
    ordering = ('-timestamp',)
    
    fieldsets = (
        ('Gas Information', {
            'fields': ('network', 'gas_price_gwei', 'gas_price_eth', 'block_number')
        }),
    )
    
    readonly_fields = ('timestamp',)
