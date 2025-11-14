from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from .models import User, Persona, Cliente, Peluquero
from .serializers import (
    RegistroSerializer, 
    LoginSerializer,
    PersonaSerializer,
    ClienteSerializer,
    PeluqueroSerializer
)
from drf_spectacular.utils import extend_schema, OpenApiTypes


class RegistroView(generics.CreateAPIView):
    """
    Endpoint para registro de nuevos usuarios.
    - CLIENTES: Pueden auto-registrarse (sin autenticación)
    - PELUQUEROS y ADMIN: Solo pueden ser registrados por un ADMIN
    """
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        rol_solicitado = request.data.get('rol', 'CLIENTE')
        
        # Si intenta registrar PELUQUERO o ADMIN, debe estar autenticado como ADMIN
        if rol_solicitado in ['PELUQUERO', 'ADMIN']:
            if not request.user.is_authenticated:
                return Response(
                    {"error": "Solo los administradores pueden registrar peluqueros y administradores"},
                    status=status.HTTP_403_FORBIDDEN
                )
            if request.user.rol != User.Rol.ADMIN:
                return Response(
                    {"error": "No tienes permisos para registrar este tipo de usuario"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response(
            serializer.to_representation(user),
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    Endpoint para login de usuarios.
    Acepta username o email + contraseña.
    Devuelve tokens JWT y datos del usuario.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Login de usuarios",
        description="Acepta username o email + contraseña. Devuelve tokens JWT y datos del usuario.",
        request=LoginSerializer,
        responses={200: OpenApiTypes.OBJECT},
        tags=["auth"],
        auth=[]  # importante: sin autenticación requerida para este endpoint
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        return Response(
            serializer.to_representation(None),
            status=status.HTTP_200_OK
        )


class PerfilView(APIView):
    """
    Endpoint para obtener el perfil del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Datos base del usuario
        data = {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'rol': user.rol,
            }
        }
        
        # Agregar datos de persona si existen
        if hasattr(user, 'persona'):
            data['persona'] = PersonaSerializer(user.persona).data
            
            # Agregar perfil específico
            if user.rol == User.Rol.CLIENTE and hasattr(user.persona, 'cliente'):
                data['perfil'] = ClienteSerializer(user.persona.cliente).data
            elif user.rol == User.Rol.PELUQUERO and hasattr(user.persona, 'peluquero'):
                data['perfil'] = PeluqueroSerializer(user.persona.peluquero).data
        
        return Response(data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consulta de usuarios (para otros microservicios).
    Solo lectura, requiere autenticación.
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def _serialize_user(self, user: User):
        """Serialización consistente para list/retrieve."""
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'rol': user.rol,
        }
        if hasattr(user, 'persona'):
            data['persona'] = PersonaSerializer(user.persona).data
            if user.rol == User.Rol.CLIENTE and hasattr(user.persona, 'cliente'):
                data['perfil'] = ClienteSerializer(user.persona.cliente).data
            elif user.rol == User.Rol.PELUQUERO and hasattr(user.persona, 'peluquero'):
                data['perfil'] = PeluqueroSerializer(user.persona.peluquero).data
        return data

    def list(self, request):
        """
        Lista de usuarios con filtro opcional por rol.
        Ej: /api/usuarios/?rol=PELUQUERO
        """
        rol = request.query_params.get('rol')
        qs = self.get_queryset()
        if rol:
            qs = qs.filter(rol=rol)

        # Optimización básica de relaciones
        qs = qs.select_related('persona').all()
        results = [self._serialize_user(u) for u in qs]
        return Response(results, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        """Obtener información de un usuario por ID."""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(self._serialize_user(user), status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener información del usuario actual."""
        return PerfilView.as_view()(request._request)

    @action(detail=False, methods=['get'])
    def peluqueros(self, request):
        """Atajo para listar únicamente usuarios con rol PELUQUERO."""
        qs = self.get_queryset().filter(rol=User.Rol.PELUQUERO).select_related('persona')
        results = [self._serialize_user(u) for u in qs]
        return Response(results, status=status.HTTP_200_OK)

