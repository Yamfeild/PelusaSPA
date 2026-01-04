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
    Endpoint para obtener y actualizar el perfil del usuario autenticado.
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
    
    def put(self, request):
        """Actualizar los datos de persona del usuario autenticado."""
        user = request.user
        
        if not hasattr(user, 'persona'):
            return Response(
                {"error": "El usuario no tiene un perfil de persona asociado"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar los datos de persona
        persona = user.persona
        serializer = PersonaSerializer(persona, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
            # Si es cliente, actualizar datos de cliente
            if user.rol == User.Rol.CLIENTE and hasattr(persona, 'cliente'):
                direccion = request.data.get('direccion')
                if direccion is not None:
                    persona.cliente.direccion = direccion
                    persona.cliente.save()
            
            # Devolver el perfil actualizado
            return self.get(request)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):
        """Alias para actualización parcial."""
        return self.put(request)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios.
    - GET: Requiere autenticación
    - PUT/PATCH/DELETE: Solo ADMIN
    """
    queryset = User.objects.all()
    
    def get_permissions(self):
        # Permitir IsAuthenticated para lectura y para listar peluqueros (necesario para CLIENTE)
        if self.action in ['list', 'retrieve', 'peluqueros']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def _serialize_user(self, user: User):
        """Serialización consistente para list/retrieve."""
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'rol': user.rol,
            'is_active': user.is_active,
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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def peluqueros(self, request):
        """Atajo para listar únicamente usuarios con rol PELUQUERO que tengan persona y perfil de peluquero.
        Accesible para todos los usuarios autenticados (CLIENTE necesita ver la lista para agendar).
        """
        qs = self.get_queryset().filter(
            rol=User.Rol.PELUQUERO
        ).select_related('persona', 'persona__peluquero')
        
        # Filtrar solo los que tienen persona y perfil de peluquero completos
        results = []
        for u in qs:
            if hasattr(u, 'persona') and u.persona and hasattr(u.persona, 'peluquero') and u.persona.peluquero:
                user_data = self._serialize_user(u)
                # Agregar información específica del peluquero
                if 'persona' in user_data:
                    user_data['persona']['peluquero'] = {
                        'especialidad': u.persona.peluquero.especialidad,
                        'experiencia': u.persona.peluquero.experiencia
                    }
                results.append(user_data)
        
        return Response(results, status=status.HTTP_200_OK)
    
    def update(self, request, pk=None):
        """Actualizar un usuario (solo ADMIN)."""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # Actualizar datos básicos del usuario
        if 'email' in request.data:
            user.email = request.data['email']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        user.save()
        
        # Actualizar persona si existe
        if hasattr(user, 'persona') and request.data.get('persona'):
            persona_data = request.data['persona']
            persona = user.persona
            if 'nombre' in persona_data:
                persona.nombre = persona_data['nombre']
            if 'apellido' in persona_data:
                persona.apellido = persona_data['apellido']
            if 'telefono' in persona_data:
                persona.telefono = persona_data['telefono']
            persona.save()
            
            # Actualizar perfil de peluquero si existe
            if user.rol == User.Rol.PELUQUERO and hasattr(persona, 'peluquero') and request.data.get('perfil'):
                perfil_data = request.data['perfil']
                peluquero = persona.peluquero
                if 'especialidad' in perfil_data:
                    peluquero.especialidad = perfil_data['especialidad']
                if 'experiencia' in perfil_data:
                    peluquero.experiencia = perfil_data['experiencia']
                peluquero.save()
        
        return Response(self._serialize_user(user), status=status.HTTP_200_OK)
    
    def partial_update(self, request, pk=None):
        """Actualización parcial."""
        return self.update(request, pk)
    
    def destroy(self, request, pk=None):
        """
        Desactivar usuario (alternar estado).
        Si ya está desactivado y envías force_delete=true, lo elimina permanentemente.
        """
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # No permitir eliminar el propio usuario admin
        if user.id == request.user.id:
            return Response({"error": "No puedes eliminar tu propio usuario"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar si se solicita eliminación permanente
        force_delete = request.query_params.get('force_delete', 'false').lower() == 'true'
        
        if force_delete:
            # Eliminar permanentemente solo si está desactivado
            if not user.is_active:
                user.delete()
                return Response({
                    "message": "Usuario eliminado permanentemente",
                    "is_active": None
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Solo puedes eliminar permanentemente usuarios desactivados"
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Alternar estado activo/inactivo
            user.is_active = not user.is_active
            user.save()
            
            estado = "activado" if user.is_active else "desactivado"
            return Response({
                "message": f"Usuario {estado} correctamente",
                "is_active": user.is_active
            }, status=status.HTTP_200_OK)

