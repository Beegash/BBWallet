from rest_framework import serializers
from .models import User, Child, UserProfile

class LoginSerializer(serializers.Serializer):
    """
    Serializer for login view.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True) # write_only means it won't be sent back in response

class ChildSerializer(serializers.ModelSerializer):
    """
    Serializer for Child model. Includes all fields for creation and updates,
    with calculated fields being read-only.
    """
    age = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    projected_value_at_18 = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = Child
        fields = [
            'id', 'name', 'date_of_birth', 'gender', 
            'target_amount', 'current_balance', 'unlock_age', 
            'profile_image', 'color_theme', 'is_active',
            # Read-only fields
            'age', 'progress_percentage', 'projected_value_at_18'
        ]
        read_only_fields = ['user', 'current_balance']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    children = ChildSerializer(many=True, read_only=True)
    profile = UserProfileSerializer(read_only=True)
    total_savings = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'wallet_address', 'wallet_connected', 'total_savings',
            'children', 'profile'
        ] 
