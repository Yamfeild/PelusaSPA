from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import UserSerializer

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            
            # Verificar si el usuario ya existe
            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_409_CONFLICT
                )
            
            # Verificar si el email ya existe
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Email already registered'},
                    status=status.HTTP_409_CONFLICT
                )

            user = User.objects.create_user(
                username=username,
                email=email,
                password=request.data.get('password')
            )
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': 'An error occurred while creating the user'},
                status=status.HTTP_400_BAD_REQUEST
            )

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data.get('username'))
            response.data['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff
            }
        return response