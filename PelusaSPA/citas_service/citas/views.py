from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import ValidationError
from .models import Cita, Horario, Mascota, EstadoCita, Servicio
from .serializers import (
    CitaSerializer,
    CitaCreateSerializer,
    CitaDetailSerializer,
    HorarioSerializer,
    MascotaSerializer,
    ServicioSerializer
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


class ServicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar servicios.
    - GET: Acceso público (lista servicios activos)
    - POST/PUT/PATCH/DELETE: Solo ADMIN
    """
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdmin()]
    
    def get_queryset(self):
        # Verificar si el usuario es admin autenticado
        is_admin = (
            self.request.user.is_authenticated and 
            hasattr(self.request.user, 'rol') and 
            self.request.user.rol == 'ADMIN'
        )
        
        # Para admin, mostrar todos los servicios
        if is_admin:
            return Servicio.objects.all().order_by('-actualizado_en')
        
        # Para público (no autenticado) y otros roles, solo mostrar activos
        return Servicio.objects.filter(activo=True).order_by('nombre')


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
        # Si es ADMIN, mostrar todos los horarios (activos e inactivos)
        if self.request.user and hasattr(self.request.user, 'rol') and self.request.user.rol == 'ADMIN':
            queryset = Horario.objects.all()
        else:
            # Para otros usuarios, solo activos
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
        """Filtrar citas según el rol del usuario y auto-finalizar vencidas.

        Reglas de auto-finalización:
        - Si la fecha es anterior a hoy y estado en PENDIENTE/CONFIRMADA => FINALIZADA
        - Si la fecha es hoy y hora_fin < ahora y estado en PENDIENTE/CONFIRMADA => FINALIZADA
        Nota: Esto se ejecuta en cada listado para mantener consistencia sin tarea programada.
        """
        from django.utils import timezone
        now = timezone.localtime()

        # Citas vencidas por fecha pasada
        vencidas_fecha = Cita.objects.filter(
            estado__in=[EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA],
            fecha__lt=now.date()
        )

        # Citas de hoy que ya terminaron
        vencidas_hoy = Cita.objects.filter(
            estado__in=[EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA],
            fecha=now.date(),
            hora_fin__lt=now.time()
        )

        # Bulk update si hay alguna
        if vencidas_fecha.exists() or vencidas_hoy.exists():
            (vencidas_fecha | vencidas_hoy).update(estado=EstadoCita.FINALIZADA, actualizada_en=now)

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
        # DEBUG: Imprimir información del request
        print("=" * 60)
        print("🔍 DEBUG - perform_create CitaViewSet")
        print(f"📨 Request user: {self.request.user}")
        print(f"🔐 Is authenticated: {self.request.user.is_authenticated}")
        print(f"👤 User type: {type(self.request.user)}")
        print(f"📋 Has 'rol' attr: {hasattr(self.request.user, 'rol')}")
        if hasattr(self.request.user, 'rol'):
            print(f"🎭 Rol value: '{self.request.user.rol}'")
        if hasattr(self.request.user, '__dict__'):
            print(f"📦 User attrs: {self.request.user.__dict__}")
        print("=" * 60)
        
        # Verificar que el usuario está autenticado
        if not self.request.user.is_authenticated:
            print("❌ Usuario NO autenticado")
            raise ValidationError("Debes estar autenticado para agendar una cita")
        
        # Verificar que el usuario es cliente
        if not hasattr(self.request.user, 'rol'):
            print("❌ Usuario NO tiene atributo 'rol'")
            raise ValidationError("El usuario no tiene rol asignado. Contacta al administrador.")
        
        if self.request.user.rol != 'CLIENTE':
            print(f"❌ Rol incorrecto: '{self.request.user.rol}' (esperado: 'CLIENTE')")
            raise ValidationError(f"Solo los clientes pueden agendar citas. Tu rol es: {self.request.user.rol}")
        
        print("✅ Validación de rol exitosa - Usuario es CLIENTE")
        serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[IsPeluquero])
    def cancelar(self, request, pk=None):
        """Cancelar una cita.
        Solo el PELUQUERO asignado o un ADMIN (si se amplía verificación de rol) puede cancelar.
        Cambio de regla: el cliente ya NO cancela directamente.
        """
        cita = self.get_object()
        if request.user.rol == 'PELUQUERO' and cita.peluquero_id != request.user.id:
            return Response({"error": "No tienes permiso para cancelar esta cita"}, status=status.HTTP_403_FORBIDDEN)
        # Admin override opcional
        if request.user.rol == 'ADMIN':
            pass
        
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
        Solo el PELUQUERO asignado puede confirmar (cliente no modifica estados).
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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reagendar(self, request, pk=None):
        """
        Reagendar una cita a una nueva fecha y hora.
        El cliente puede reagendar sus propias citas.
        """
        cita = self.get_object()
        
        # Validar que sea el dueño de la mascota o admin
        if request.user.rol == 'CLIENTE' and cita.mascota.dueno_id != request.user.id:
            return Response(
                {"error": "No tienes permiso para reagendar esta cita"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar que la cita esté en estado PENDIENTE
        if cita.estado not in [EstadoCita.PENDIENTE]:
            return Response(
                {"error": "Solo se pueden reagendar citas en estado PENDIENTE"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener nueva fecha y hora
        fecha = request.data.get('fecha')
        hora_inicio = request.data.get('hora_inicio')
        hora_fin = request.data.get('hora_fin')
        
        if not fecha or not hora_inicio or not hora_fin:
            return Response(
                {"error": "Debe proporcionar fecha, hora_inicio y hora_fin"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar la cita
        try:
            from datetime import datetime
            cita.fecha = datetime.strptime(fecha, '%Y-%m-%d').date()
            cita.hora_inicio = datetime.strptime(hora_inicio, '%H:%M').time()
            cita.hora_fin = datetime.strptime(hora_fin, '%H:%M').time()
            cita.save()
            
            serializer = self.get_serializer(cita)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {"error": f"Formato de fecha u hora inválido: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], permission_classes=[IsPeluquero])
    def finalizar(self, request, pk=None):
        """Finalizar manualmente una cita (peluquero asignado). Normalmente se auto-finaliza cuando pasa hora_fin."""
        cita = self.get_object()
        if cita.peluquero_id != request.user.id:
            return Response({"error": "No tienes permiso para finalizar esta cita"}, status=status.HTTP_403_FORBIDDEN)

        try:
            cita.finalizar()
            return Response({"message": "Cita finalizada exitosamente"}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsPeluquero], url_path='dia')
    def citas_del_dia(self, request):
        """Listar todas las citas del peluquero autenticado para una fecha concreta.
        Uso: GET /api/citas/dia/?fecha=YYYY-MM-DD
        """
        fecha = request.query_params.get('fecha')
        if not fecha:
            return Response({"error": "Debe proporcionar el parámetro fecha=YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from datetime import datetime
            fecha_obj = datetime.strptime(fecha, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Formato de fecha inválido (usar YYYY-MM-DD)"}, status=status.HTTP_400_BAD_REQUEST)

        citas = Cita.objects.filter(peluquero_id=request.user.id, fecha=fecha_obj).select_related('mascota').order_by('hora_inicio')
        serializer = self.get_serializer(citas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsPeluquero], url_path='cambiar_estado')
    def cambiar_estado(self, request, pk=None):
        """Cambiar estado de la cita (peluquero asignado).
        Body: {"estado": "CONFIRMADA"|"CANCELADA"|"FINALIZADA"}
        - FINALIZADA sólo si ya pasó hora_fin (o estaba pendiente/confirmada y vencida)
        - CONFIRMADA desde PENDIENTE
        - CANCELADA desde PENDIENTE/CONFIRMADA
        """
        cita = self.get_object()
        if cita.peluquero_id != request.user.id:
            return Response({"error": "No tienes permiso sobre esta cita"}, status=status.HTTP_403_FORBIDDEN)
        estado_target = request.data.get('estado')
        if estado_target not in ['CONFIRMADA', 'CANCELADA', 'FINALIZADA']:
            return Response({"error": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if estado_target == 'CONFIRMADA':
                cita.confirmar()
            elif estado_target == 'CANCELADA':
                cita.cancelar()
            elif estado_target == 'FINALIZADA':
                cita.finalizar()
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(cita)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
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

