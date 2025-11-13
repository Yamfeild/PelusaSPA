"""
Tokens JWT personalizados que incluyen información adicional del usuario.
"""
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_user(user):
    """
    Genera tokens JWT con información adicional del usuario.
    Incluye: user_id, username, email, rol
    """
    refresh = RefreshToken.for_user(user)
    
    # Agregar claims personalizados al token
    refresh['username'] = user.username
    refresh['email'] = user.email
    refresh['rol'] = user.rol
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer personalizado para tokens JWT.
    Agrega información adicional del usuario al payload del token.
    """
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agregar claims personalizados
        token['username'] = user.username
        token['email'] = user.email
        token['rol'] = user.rol
        
        return token
