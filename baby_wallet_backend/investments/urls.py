from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvestmentViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'investments', InvestmentViewSet, basename='investment')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
] 
