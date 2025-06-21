from rest_framework import serializers
from .models import User, Child, UserProfile

class LoginSerializer(serializers.Serializer):
    """
    Serializer for login view.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True) # write_only means it won't be sent back in response

class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = [
            'id', 'name', 'age', 'progress_percentage', 'current_balance', 
            'profile_image', 'color_theme', 'projected_value_at_18'
        ]

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
