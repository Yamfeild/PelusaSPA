from rest_framework import serializers
from .models import Cita, Horario, Mascota, EstadoCita, Servicio
from datetime import datetime, timedelta
import requests
from django.conf import settings


class ServicioSerializer(serializers.ModelSerializer):
    """Serializer para servicios de peluquería."""
    
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion', 'duracion_minutos', 'precio', 'activo', 'creado_en', 'actualizado_en']
        read_only_fields = ['creado_en', 'actualizado_en']


class MascotaSerializer(serializers.ModelSerializer):
    """Serializer para gestión de mascotas del cliente."""
    
    class Meta:
        model = Mascota
        fields = ['id', 'dueno_id', 'nombre', 'raza', 'edad', 'creada_en', 'actualizada_en']
        read_only_fields = ['dueno_id', 'creada_en', 'actualizada_en']
    
    def validate_edad(self, value):
        if value < 0:
            raise serializers.ValidationError("La edad no puede ser negativa")
        if value > 30:
            raise serializers.ValidationError("La edad parece incorrecta")
        return value


class HorarioSerializer(serializers.ModelSerializer):
    """Serializer para gestión de horarios de peluqueros."""
    
    class Meta:
        model = Horario
        fields = ['id', 'peluquero_id', 'dia', 'hora_inicio', 'hora_fin', 'activo']
    
    def validate(self, attrs):
        # Validar que hora_fin sea mayor que hora_inicio
        if attrs.get('hora_inicio') and attrs.get('hora_fin'):
            if attrs['hora_inicio'] >= attrs['hora_fin']:
                raise serializers.ValidationError({
                    "hora_fin": "La hora de fin debe ser posterior a la hora de inicio"
                })
        return attrs


class CitaSerializer(serializers.ModelSerializer):
    """Serializer base para Cita."""
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    # cliente_id se expone como campo derivado: proviene de mascota.dueno_id.
    # No existe relación directa con un modelo Cliente local porque ese usuario vive
    # en el microservicio usuario_service. Así evitamos dependencias fuertes entre BDs.
    cliente_id = serializers.IntegerField(source='mascota.dueno_id', read_only=True)
    mascota_nombre = serializers.CharField(source='mascota.nombre', read_only=True)
    
    class Meta:
        model = Cita
        fields = [
            'id', 'mascota', 'mascota_nombre', 'cliente_id', 'peluquero_id', 'fecha', 
            'hora_inicio', 'hora_fin', 'estado', 'estado_display',
            'notas', 'creada_en', 'actualizada_en'
        ]
        read_only_fields = ['creada_en', 'actualizada_en']


class CitaCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear citas con validaciones de disponibilidad.
    Valida que el peluquero exista, tenga horario disponible y que la mascota pertenezca al cliente.
    """
    
    class Meta:
        model = Cita
        fields = [
            'mascota', 'peluquero_id', 'fecha', 
            'hora_inicio', 'hora_fin', 'notas'
        ]
    
    def validate_mascota(self, value):
        """Validar que la mascota pertenece al cliente autenticado."""
        request = self.context.get('request')
        if request and hasattr(request.user, 'id'):
            if value.dueno_id != request.user.id:
                raise serializers.ValidationError("La mascota no pertenece a este cliente")
        return value
    
    def validate_peluquero_id(self, value):
        """Validar que el peluquero existe y tiene rol PELUQUERO en usuario_service."""
        # En producción, hacer request a usuario_service
        # Por ahora validamos que sea un ID válido
        if value <= 0:
            raise serializers.ValidationError("ID de peluquero inválido")
        
        # TODO: Descomentar cuando usuario_service esté en producción
        # try:
        #     response = requests.get(
        #         f"{settings.USUARIO_SERVICE_URL}/usuarios/{value}/",
        #         headers={'Authorization': f'Bearer {self.context.get("token")}'}
        #     )
        #     if response.status_code != 200:
        #         raise serializers.ValidationError("Peluquero no encontrado")
        #     
        #     user_data = response.json()
        #     if user_data.get('rol') != 'PELUQUERO':
        #         raise serializers.ValidationError("El usuario no es un peluquero")
        # except requests.RequestException:
        #     raise serializers.ValidationError("Error al validar peluquero")
        
        return value
    
    def validate_fecha(self, value):
        """No permitir citas en fechas pasadas."""
        from django.utils import timezone
        if value < timezone.now().date():
            raise serializers.ValidationError("No se pueden crear citas en fechas pasadas")
        return value
    
    def validate(self, attrs):
        """Validaciones adicionales de negocio."""
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"CitaCreateSerializer.validate() - attrs received: {attrs}")
        
        hora_inicio = attrs.get('hora_inicio')
        hora_fin = attrs.get('hora_fin')
        fecha = attrs.get('fecha')
        peluquero_id = attrs.get('peluquero_id')
        mascota = attrs.get('mascota')
        
        # Validar que hora_fin > hora_inicio
        if hora_inicio >= hora_fin:
            raise serializers.ValidationError({
                "hora_fin": "La hora de fin debe ser posterior a la hora de inicio"
            })
        
        # Validar duración mínima (30 minutos en lugar de 1 hora)
        duracion = datetime.combine(datetime.today(), hora_fin) - datetime.combine(datetime.today(), hora_inicio)
        if duracion < timedelta(minutes=30):
            raise serializers.ValidationError({
                "hora_fin": "La cita debe durar al menos 30 minutos"
            })
        
        # Validar disponibilidad del peluquero en ese horario
        if fecha and peluquero_id:
            dia_nombre = fecha.strftime('%A')  # Nombre del día en inglés
            dias_es = {
                'Monday': 'Lunes', 'Tuesday': 'Martes', 'Wednesday': 'Miércoles',
                'Thursday': 'Jueves', 'Friday': 'Viernes', 'Saturday': 'Sábado', 'Sunday': 'Domingo'
            }
            dia_es = dias_es.get(dia_nombre, dia_nombre)
            
            # TODO: Descomentar validación de horarios cuando estén configurados
            # # Buscar horario del peluquero para ese día
            # horarios = Horario.objects.filter(
            #     peluquero_id=peluquero_id,
            #     dia=dia_es,
            #     activo=True
            # )
            # 
            # if not horarios.exists():
            #     raise serializers.ValidationError({
            #         "fecha": f"El peluquero no trabaja los {dia_es}"
            #     })
            # 
            # # Validar que la hora esté dentro del horario laboral
            # horario_valido = False
            # for horario in horarios:
            #     if horario.hora_inicio <= hora_inicio and hora_fin <= horario.hora_fin:
            #         horario_valido = True
            #         break
            # 
            # if not horario_valido:
            #     raise serializers.ValidationError({
            #         "hora_inicio": "La hora solicitada no está dentro del horario laboral del peluquero"
            #     })
            
            # Validar que no haya conflicto con otras citas confirmadas
            citas_conflicto = Cita.objects.filter(
                peluquero_id=peluquero_id,
                fecha=fecha,
                estado__in=[EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA]
            ).exclude(pk=self.instance.pk if self.instance else None)
            
            for cita in citas_conflicto:
                # Verificar solapamiento de horarios
                if not (hora_fin <= cita.hora_inicio or hora_inicio >= cita.hora_fin):
                    raise serializers.ValidationError({
                        "hora_inicio": "El peluquero ya tiene una cita en ese horario"
                    })

        # Regla: una misma mascota no puede tener más de una cita (pendiente o confirmada) en el mismo día
        if fecha and mascota:
            existe_cita_dia = Cita.objects.filter(
                mascota=mascota,
                fecha=fecha,
                estado__in=[EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA]
            ).exists()
            if existe_cita_dia:
                raise serializers.ValidationError({
                    "fecha": "La mascota ya tiene una cita pendiente o confirmada para este día"
                })
        
        return attrs


class CitaDetailSerializer(serializers.ModelSerializer):
    """
    Serializer extendido con información adicional de la mascota, cliente y peluquero.
    """
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    mascota_info = MascotaSerializer(source='mascota', read_only=True)
    cliente_id = serializers.IntegerField(source='mascota.dueno_id', read_only=True)
    peluquero_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Cita
        fields = [
            'id', 'mascota', 'mascota_info', 'cliente_id', 'peluquero_id', 'fecha', 
            'hora_inicio', 'hora_fin', 'estado', 'estado_display',
            'notas', 'creada_en', 'actualizada_en', 'peluquero_info'
        ]
    
    def get_peluquero_info(self, obj):
        """Obtener info básica del peluquero desde usuario_service."""
        # TODO: Implementar llamada a usuario_service
        return {
            "id": obj.peluquero_id,
            "nombre": "Peluquero"  # Placeholder
        }

