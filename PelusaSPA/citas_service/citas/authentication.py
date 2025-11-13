"""
Autenticación personalizada para microservicios.
Extrae información del usuario desde el token JWT sin necesidad de base de datos.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth.models import AnonymousUser


class JWTUser:
    """
    Usuario virtual que contiene la información del token JWT.
    No requiere acceso a la base de datos.
    """
    def __init__(self, token_payload):
        self.id = token_payload.get('user_id')
        self.username = token_payload.get('username', '')
        self.rol = token_payload.get('rol', '')
        self.email = token_payload.get('email', '')
        self.is_authenticated = True
        self.is_active = True
        self.is_staff = self.rol == 'ADMIN'
        self.is_superuser = self.rol == 'ADMIN'
    
    def __str__(self):
        return f"{self.username} ({self.rol})"
    
    def __repr__(self):
        return f"<JWTUser: {self.username} - {self.rol}>"


class MicroserviceJWTAuthentication(JWTAuthentication):
    """
    Autenticación JWT personalizada para microservicios.
    Crea un usuario virtual desde el payload del token sin consultar la BD.
    """
    
    def get_user(self, validated_token):
        """
        Retorna un usuario virtual creado desde el token JWT.
        No requiere consultar la base de datos.
        """
        try:
            # Extraer información del token
            user_id = validated_token.get('user_id')
            
            if user_id is None:
                raise InvalidToken('Token no contiene user_id')
            
            # Crear usuario virtual desde el payload del token
            return JWTUser(validated_token)
            
        except Exception as e:
            raise InvalidToken(f'Error al obtener usuario del token: {str(e)}')
