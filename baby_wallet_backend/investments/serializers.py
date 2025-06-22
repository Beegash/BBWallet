from rest_framework import serializers
from .models import Investment, Transaction, InvestmentGoal, TaxReport

class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for the Transaction model."""
    child_name = serializers.CharField(source='child.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('user', 'child')

class InvestmentSerializer(serializers.ModelSerializer):
    """Serializer for the Investment model."""
    transactions = TransactionSerializer(many=True, read_only=True)
    child_name = serializers.CharField(source='child.name', read_only=True)
    
    class Meta:
        model = Investment
        fields = '__all__'
        read_only_fields = ('user', 'child', 'total_contributed') 
