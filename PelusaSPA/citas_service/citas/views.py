from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import ValidationError
from .models import Cita, Horario, Mascota, EstadoCita
from .serializers import (
    CitaSerializer,
    CitaCreateSerializer,
    CitaDetailSerializer,
    HorarioSerializer,
    MascotaSerializer
)


class IsAdmin(IsAuthenticated):
    """Permiso: solo usuarios con rol ADMIN."""
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return hasattr(request.user, 'rol') and request.user.rol == 'ADMIN'


class IsCliente(IsAuthenticated):
    """Permiso: solo usuarios con rol CLIENTE."""
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        # Asumir que el JWT contiene el rol en el payload
        # En producción, verificar request.user.rol o claims del token
        return hasattr(request.user, 'rol') and request.user.rol == 'CLIENTE'


class IsPeluquero(IsAuthenticated):
    """Permiso: solo usuarios con rol PELUQUERO."""
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return hasattr(request.user, 'rol') and request.user.rol == 'PELUQUERO'


class MascotaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar mascotas.
    - CLIENTE puede crear, ver, editar y eliminar sus propias mascotas.
    - Otros roles pueden ver pero no modificar.
    """
    serializer_class = MascotaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Solo mostrar mascotas del cliente autenticado."""
        if hasattr(self.request.user, 'rol') and self.request.user.rol == 'CLIENTE':
            return Mascota.objects.filter(dueno_id=self.request.user.id)
        # Admin puede ver todas
        elif hasattr(self.request.user, 'rol') and self.request.user.rol == 'ADMIN':
            return Mascota.objects.all()
        return Mascota.objects.none()
    
    def perform_create(self, serializer):
        """Asignar automáticamente el dueño al cliente autenticado."""
        if not hasattr(self.request.user, 'rol') or self.request.user.rol != 'CLIENTE':
            raise ValidationError("Solo los clientes pueden registrar mascotas")
        serializer.save(dueno_id=self.request.user.id)
    
    def get_permissions(self):
        """Solo clientes pueden crear/modificar/eliminar mascotas."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [IsAuthenticated()]


class HorarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar horarios de peluqueros.
    - Solo ADMIN puede crear/editar/eliminar horarios.
    - Todos los usuarios autenticados pueden ver horarios.
    """
    queryset = Horario.objects.filter(activo=True)
    serializer_class = HorarioSerializer
    
    def get_permissions(self):
        """Permisos según la acción."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Solo administradores pueden modificar horarios
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filtrar horarios según consulta."""
        queryset = Horario.objects.filter(activo=True)
        
        # Filtrar por peluquero_id si se pasa como query param
        peluquero_id = self.request.query_params.get('peluquero_id')
        if peluquero_id:
            queryset = queryset.filter(peluquero_id=peluquero_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Al crear, el admin debe especificar el peluquero_id en el body.
        """
        serializer.save()

    def perform_update(self, serializer):
        """Solo ADMIN actualiza horarios."""
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        """Solo ADMIN elimina horarios; respuesta clara."""
        return super().destroy(request, *args, **kwargs)


class CitaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar citas.
    
    Permisos por acción:
    - CLIENTE: puede agendar (create), ver sus citas (list), cancelar (cancel action)
    - PELUQUERO: puede ver sus citas asignadas, confirmar (confirm action)
    - ADMIN: acceso total
    """
    queryset = Cita.objects.all()
    
    def get_serializer_class(self):
        """Usar serializer adecuado según la acción."""
        if self.action == 'create':
            return CitaCreateSerializer
        elif self.action == 'retrieve':
            return CitaDetailSerializer
        return CitaSerializer
    
    def get_permissions(self):
        """Permisos según la acción."""
        if self.action == 'create':
            # Solo clientes pueden crear citas (rol verificado en perform_create)
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Actualizar/eliminar citas solo ADMIN
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Filtrar citas según el rol del usuario."""
        queryset = Cita.objects.all().select_related('mascota').order_by('-fecha', '-hora_inicio')
        
        # Si es cliente, solo ve citas de sus mascotas
        if hasattr(self.request.user, 'rol') and self.request.user.rol == 'CLIENTE':
            queryset = queryset.filter(mascota__dueno_id=self.request.user.id)
        
        # Si es peluquero, solo ve las citas asignadas a él
        elif hasattr(self.request.user, 'rol') and self.request.user.rol == 'PELUQUERO':
            queryset = queryset.filter(peluquero_id=self.request.user.id)
        
        # Filtros opcionales por query params
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)
        
        fecha = self.request.query_params.get('fecha')
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Al crear cita, validar que el cliente solo pueda agendar para sus propias mascotas.
        """
        if not hasattr(self.request.user, 'rol') or self.request.user.rol != 'CLIENTE':
            raise ValidationError("Solo los clientes pueden agendar citas")
        
        serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancelar(self, request, pk=None):
        """
        Cancelar una cita.
        - CLIENTE: puede cancelar citas de sus mascotas
        - PELUQUERO: puede cancelar citas asignadas a él
        """
        cita = self.get_object()
        
        # Validar permisos
        if hasattr(request.user, 'rol'):
            if request.user.rol == 'CLIENTE' and cita.mascota.dueno_id != request.user.id:
                return Response(
                    {"error": "No tienes permiso para cancelar esta cita"},
                    status=status.HTTP_403_FORBIDDEN
                )
            elif request.user.rol == 'PELUQUERO' and cita.peluquero_id != request.user.id:
                return Response(
                    {"error": "No tienes permiso para cancelar esta cita"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Cancelar
        try:
            cita.cancelar()
            return Response(
                {"message": "Cita cancelada exitosamente"},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsPeluquero])
    def confirmar(self, request, pk=None):
        """
        Confirmar una cita.
        Solo PELUQUERO puede confirmar citas asignadas a él.
        """
        cita = self.get_object()
        
        # Validar que la cita esté asignada al peluquero autenticado
        if cita.peluquero_id != request.user.id:
            return Response(
                {"error": "No tienes permiso para confirmar esta cita"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Confirmar
        try:
            cita.confirmar()
            return Response(
                {"message": "Cita confirmada exitosamente"},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mis_citas(self, request):
        """
        Obtener las citas del usuario autenticado.
        - CLIENTE: citas de sus mascotas
        - PELUQUERO: sus citas como peluquero
        """
        if hasattr(request.user, 'rol'):
            if request.user.rol == 'CLIENTE':
                citas = Cita.objects.filter(mascota__dueno_id=request.user.id).select_related('mascota').order_by('-fecha', '-hora_inicio')
            elif request.user.rol == 'PELUQUERO':
                citas = Cita.objects.filter(peluquero_id=request.user.id).select_related('mascota').order_by('-fecha', '-hora_inicio')
            else:
                citas = Cita.objects.none()
        else:
            citas = Cita.objects.none()
        
        serializer = self.get_serializer(citas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def disponibilidad(self, request):
        """
        Consultar disponibilidad de un peluquero en una fecha específica.
        Query params: peluquero_id, fecha
        """
        peluquero_id = request.query_params.get('peluquero_id')
        fecha = request.query_params.get('fecha')
        
        if not peluquero_id or not fecha:
            return Response(
                {"error": "Se requieren parámetros: peluquero_id y fecha"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener citas ocupadas
        citas_ocupadas = Cita.objects.filter(
            peluquero_id=peluquero_id,
            fecha=fecha,
            estado__in=[EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA]
        ).values('hora_inicio', 'hora_fin')
        
        # Obtener horarios laborales del día
        from datetime import datetime
        fecha_obj = datetime.strptime(fecha, '%Y-%m-%d')
        dia_nombre = fecha_obj.strftime('%A')
        dias_es = {
            'Monday': 'Lunes', 'Tuesday': 'Martes', 'Wednesday': 'Miércoles',
            'Thursday': 'Jueves', 'Friday': 'Viernes', 'Saturday': 'Sábado', 'Sunday': 'Domingo'
        }
        dia_es = dias_es.get(dia_nombre, dia_nombre)
        
        horarios = Horario.objects.filter(
            peluquero_id=peluquero_id,
            dia=dia_es,
            activo=True
        ).values('hora_inicio', 'hora_fin')
        
        return Response({
            "peluquero_id": peluquero_id,
            "fecha": fecha,
            "dia": dia_es,
            "horarios_laborales": list(horarios),
            "citas_ocupadas": list(citas_ocupadas)
        })

