from django.db import models
from django.conf import settings
from accounts.models import Child
from investments.models import Investment


class SmartContract(models.Model):
    """Smart contract model for blockchain integration"""
    CONTRACT_TYPES = [
        ('savings', 'Savings Contract'),
        ('investment', 'Investment Contract'),
        ('nft', 'NFT Contract'),
    ]
    
    STATUS_CHOICES = [
        ('deployed', 'Deployed'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
        ('paused', 'Paused'),
    ]
    
    NETWORK_CHOICES = [
        ('mainnet', 'Ethereum Mainnet'),
        ('sepolia', 'Sepolia Testnet'),
        ('goerli', 'Goerli Testnet'),
        ('polygon', 'Polygon'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='smart_contracts')
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='smart_contracts')
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='smart_contracts', null=True, blank=True)
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPES)
    contract_address = models.CharField(max_length=42, unique=True)
    network = models.CharField(max_length=20, choices=NETWORK_CHOICES, default='sepolia')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    deployment_hash = models.CharField(max_length=66, blank=True, null=True)
    block_number = models.BigIntegerField(null=True, blank=True)
    gas_used = models.BigIntegerField(null=True, blank=True)
    gas_price = models.BigIntegerField(null=True, blank=True)
    contract_abi = models.JSONField(default=list)  # Contract ABI
    contract_bytecode = models.TextField(blank=True)  # Contract bytecode
    constructor_args = models.JSONField(default=list)  # Constructor arguments
    deployed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.contract_type} - {self.contract_address[:10]}... ({self.child.name})"

    @property
    def is_active(self):
        return self.status == 'deployed'

    @property
    def total_value_locked(self):
        """Get total value locked in the contract"""
        if not self.is_active:
            return 0
        
        # This would typically call the blockchain to get TVL
        # For now, return the child's current balance
        return self.child.current_balance

    def deploy(self):
        """Deploy the smart contract to blockchain"""
        # This would contain the actual deployment logic
        # For now, just update the status
        self.status = 'deployed'
        self.deployed_at = models.DateTimeField(auto_now=True)
        self.save()


class NFT(models.Model):
    """NFT model representing child's savings account"""
    NFT_TYPES = [
        ('savings', 'Savings Account NFT'),
        ('achievement', 'Achievement NFT'),
        ('milestone', 'Milestone NFT'),
    ]
    
    STATUS_CHOICES = [
        ('minted', 'Minted'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
        ('burned', 'Burned'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nfts')
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='nfts')
    smart_contract = models.ForeignKey(SmartContract, on_delete=models.CASCADE, related_name='nfts')
    nft_type = models.CharField(max_length=20, choices=NFT_TYPES)
    token_id = models.BigIntegerField()
    token_uri = models.URLField(blank=True)
    metadata = models.JSONField(default=dict)  # NFT metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    mint_hash = models.CharField(max_length=66, blank=True, null=True)
    block_number = models.BigIntegerField(null=True, blank=True)
    minted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['smart_contract', 'token_id']

    def __str__(self):
        return f"{self.nft_type} - Token #{self.token_id} ({self.child.name})"

    @property
    def is_transferable(self):
        """Check if NFT can be transferred to child"""
        return self.child.age >= self.child.unlock_age

    def mint(self):
        """Mint the NFT on blockchain"""
        # This would contain the actual minting logic
        # For now, just update the status
        self.status = 'minted'
        self.minted_at = models.DateTimeField(auto_now=True)
        self.save()

    def transfer_to_child(self):
        """Transfer NFT ownership to child when they reach unlock age"""
        if not self.is_transferable:
            raise ValueError("Child has not reached unlock age")
        
        # This would contain the actual transfer logic
        # For now, just update the metadata
        self.metadata['transferred_to_child'] = True
        self.metadata['transfer_date'] = models.DateTimeField(auto_now=True)
        self.save()


class BlockchainTransaction(models.Model):
    """Model for tracking blockchain transactions"""
    TRANSACTION_TYPES = [
        ('deploy', 'Contract Deployment'),
        ('mint', 'NFT Minting'),
        ('transfer', 'Token Transfer'),
        ('withdraw', 'Fund Withdrawal'),
        ('deposit', 'Fund Deposit'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
        ('reverted', 'Reverted'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blockchain_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    transaction_hash = models.CharField(max_length=66, unique=True)
    block_number = models.BigIntegerField(null=True, blank=True)
    gas_used = models.BigIntegerField(null=True, blank=True)
    gas_price = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    network = models.CharField(max_length=20, choices=SmartContract.NETWORK_CHOICES, default='sepolia')
    from_address = models.CharField(max_length=42)
    to_address = models.CharField(max_length=42, blank=True, null=True)
    value = models.DecimalField(max_digits=20, decimal_places=18, null=True, blank=True)  # ETH amount
    data = models.TextField(blank=True)  # Transaction data
    receipt = models.JSONField(default=dict)  # Transaction receipt
    confirmed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_hash[:10]}..."

    @property
    def gas_cost_eth(self):
        """Calculate gas cost in ETH"""
        if self.gas_used and self.gas_price:
            return (self.gas_used * self.gas_price) / (10 ** 18)
        return 0

    @property
    def is_confirmed(self):
        return self.status == 'confirmed'

    def confirm(self, block_number, gas_used, gas_price, receipt):
        """Confirm the transaction"""
        self.status = 'confirmed'
        self.block_number = block_number
        self.gas_used = gas_used
        self.gas_price = gas_price
        self.receipt = receipt
        self.confirmed_at = models.DateTimeField(auto_now=True)
        self.save()


class GasTracker(models.Model):
    """Model for tracking gas prices"""
    network = models.CharField(max_length=20, choices=SmartContract.NETWORK_CHOICES)
    gas_price_gwei = models.BigIntegerField()
    gas_price_eth = models.DecimalField(max_digits=20, decimal_places=18)
    block_number = models.BigIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.network} - {self.gas_price_gwei} Gwei - Block {self.block_number}"

    @classmethod
    def get_latest_gas_price(cls, network='sepolia'):
        """Get the latest gas price for a network"""
        return cls.objects.filter(network=network).first()
