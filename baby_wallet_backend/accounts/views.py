from rest_framework.authtoken.models import Token
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import User, Child
from .serializers import UserSerializer, ChildSerializer, LoginSerializer

# Create your views here.

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows users to be viewed.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChildViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows children to be viewed or edited.
    """
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the children
        for the currently authenticated user.
        """
        return self.request.user.children.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    Custom login view.
    Accepts username and password, returns an auth token.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if user:
            # Delete old token and create a new one
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            return Response({'token': token.key})
        
        return Response(
            {'error': 'Invalid Credentials'},
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginTemplateView(TemplateView):
    template_name = "login.html"


class DashboardStatsView(APIView):
    """
    Provides statistics for the user's dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from decimal import Decimal
        from investments.models import Investment
        
        user = request.user
        children = user.children.all()
        
        # Calculate total savings (wallet balances + investment values)
        total_wallet_balances = sum(child.current_balance for child in children)
        total_investment_values = sum(
            investment.total_contributed 
            for investment in Investment.objects.filter(user=user, status='active')
        )
        
        total_savings = total_wallet_balances + total_investment_values
        child_count = children.count()
        
        # TODO: Implement percentage change calculation
        # For now, we'll use 0% as placeholder
        # Future implementation will use daily snapshots for accurate calculation
        percentage_change = Decimal('0.00')
        
        # You can add more stats here, e.g., total investments, growth percentage, etc.
        
        stats = {
            'total_savings': float(total_savings),  # Convert to float for JSON serialization
            'total_wallet_balances': float(total_wallet_balances),
            'total_investment_values': float(total_investment_values),
            'percentage_change': float(percentage_change),
            'child_count': child_count,
            'active_investments': user.investments.filter(status='active').count(),
        }
        
        return Response(stats)
