from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ChildViewSet, LoginView, DashboardStatsView

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'children', ChildViewSet, basename='child')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('', include(router.urls)),
] 
