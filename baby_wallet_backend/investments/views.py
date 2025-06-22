from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Investment, Transaction
from .serializers import InvestmentSerializer, TransactionSerializer

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
        # Automatically associate the investment with the logged-in user.
        serializer.save(user=self.request.user)

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
