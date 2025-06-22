from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework import serializers
from .models import Investment, Transaction
from .serializers import InvestmentSerializer, TransactionSerializer
from accounts.models import Child

# Create your views here.

class InvestmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows investments to be viewed or edited.
    """
    serializer_class = InvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the investments
        for the currently authenticated user.
        """
        return self.request.user.investments.all()

    def perform_create(self, serializer):
        # Get child ID from request data
        child_id = self.request.data.get('child')
        if not child_id:
            raise serializers.ValidationError({'child': 'Child ID is required'})
        
        try:
            # Verify that the child belongs to the current user
            child = Child.objects.get(id=child_id, user=self.request.user)
        except Child.DoesNotExist:
            raise serializers.ValidationError({'child': 'Invalid child ID or child does not belong to you'})
        
        # Automatically associate the investment with the logged-in user and selected child
        serializer.save(user=self.request.user, child=child)

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows transactions to be viewed.
    Transactions are read-only as they are created by other processes (e.g., investments).
    """
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the transactions
        for the currently authenticated user.
        """
        return self.request.user.transactions.all()
