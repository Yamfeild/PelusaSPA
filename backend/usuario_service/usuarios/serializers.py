from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User, Cuenta, Persona, Cliente, Peluquero
from .tokens import get_tokens_for_user


class PersonaSerializer(serializers.ModelSerializer):
    """Serializer para el perfil de Persona."""
    class Meta:
        model = Persona
        fields = ('nombre', 'apellido', 'fecha_nacimiento', 'telefono')


class ClienteSerializer(serializers.ModelSerializer):
    """Serializer para el perfil de Cliente."""
    persona = PersonaSerializer(read_only=True)
    
    class Meta:
        model = Cliente
        fields = ('persona', 'direccion')


class PeluqueroSerializer(serializers.ModelSerializer):
    """Serializer para el perfil de Peluquero."""
    persona = PersonaSerializer(read_only=True)
    
    class Meta:
        model = Peluquero
        fields = ('persona', 'especialidad', 'experiencia')


class RegistroSerializer(serializers.Serializer):
    """
    Serializer para registro completo de usuarios.
    Crea User, Cuenta, Persona y Cliente/Peluquero según el rol.
    """
    # Datos de cuenta
    username = serializers.CharField(max_length=150)
    correo = serializers.EmailField()
    clave = serializers.CharField(write_only=True, validators=[validate_password], style={'input_type': 'password'})
    clave_confirmacion = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    # Datos de persona
    nombre = serializers.CharField(max_length=120)
    apellido = serializers.CharField(max_length=120)
    fecha_nacimiento = serializers.DateField(required=True)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    identificacion = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    # Rol
    rol = serializers.ChoiceField(choices=User.Rol.choices, default=User.Rol.CLIENTE)
    
    # Campos específicos según rol
    direccion = serializers.CharField(max_length=255, required=False, allow_blank=True)  # Para cliente
    especialidad = serializers.CharField(max_length=120, required=False, allow_blank=True)  # Para peluquero
    experiencia = serializers.CharField(required=False, allow_blank=True)  # Para peluquero

    def validate(self, attrs):
        # Validar contraseñas coincidan
        if attrs.get('clave') != attrs.get('clave_confirmacion'):
            raise serializers.ValidationError({"clave": "Las contraseñas no coinciden"})
        
        # Validar username único
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Este nombre de usuario ya existe"})
        
        # Validar correo único
        if Cuenta.objects.filter(correo=attrs['correo']).exists():
            raise serializers.ValidationError({"correo": "Este correo ya está registrado"})
        
        # Validar identificación única si se proporciona
        identificacion = attrs.get('identificacion')
        if identificacion and User.objects.filter(identificacion=identificacion).exists():
            raise serializers.ValidationError({"identificacion": "Esta identificación ya está registrada"})
        
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        # Extraer datos específicos
        clave = validated_data.pop('clave')
        validated_data.pop('clave_confirmacion')
        
        nombre = validated_data.pop('nombre')
        apellido = validated_data.pop('apellido')
        fecha_nacimiento = validated_data.pop('fecha_nacimiento', None)
        telefono_persona = validated_data.pop('telefono', '')
        
        correo = validated_data.pop('correo')
        rol = validated_data.pop('rol', User.Rol.CLIENTE)
        
        direccion = validated_data.pop('direccion', '')
        especialidad = validated_data.pop('especialidad', '')
        experiencia = validated_data.pop('experiencia', '')
        
        # Crear User
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=correo,
            password=clave,
            rol=rol,
            identificacion=validated_data.get('identificacion') or None
        )
        
        # Crear Cuenta
        cuenta = Cuenta.objects.create(
            user=user,
            correo=correo,
            clave=user.password  # Ya hasheada por create_user
        )
        
        # Crear Persona
        persona = Persona.objects.create(
            user=user,
            nombre=nombre,
            apellido=apellido,
            fecha_nacimiento=fecha_nacimiento,
            telefono=telefono_persona
        )
        
        # Crear perfil específico según rol
        if rol == User.Rol.CLIENTE:
            Cliente.objects.create(
                persona=persona,
                direccion=direccion
            )
        elif rol == User.Rol.PELUQUERO:
            Peluquero.objects.create(
                persona=persona,
                especialidad=especialidad,
                experiencia=experiencia
            )
        
        return user

    def to_representation(self, instance):
        """Devolver datos del usuario creado con tokens JWT."""
        tokens = get_tokens_for_user(instance)
        
        # Obtener datos del perfil
        persona_data = None
        perfil_especifico = None
        
        if hasattr(instance, 'persona'):
            persona_data = PersonaSerializer(instance.persona).data
            
            if instance.rol == User.Rol.CLIENTE and hasattr(instance.persona, 'cliente'):
                perfil_especifico = ClienteSerializer(instance.persona.cliente).data
            elif instance.rol == User.Rol.PELUQUERO and hasattr(instance.persona, 'peluquero'):
                perfil_especifico = PeluqueroSerializer(instance.persona.peluquero).data
        
        return {
            'user': {
                'id': instance.id,
                'username': instance.username,
                'email': instance.email,
                'rol': instance.rol,
            },
            'persona': persona_data,
            'perfil': perfil_especifico,
            'tokens': tokens
        }


class LoginSerializer(serializers.Serializer):
    """Serializer para login con username/email y contraseña."""
    usuario = serializers.CharField()  # Puede ser username o email
    clave = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        usuario = attrs.get('usuario')
        clave = attrs.get('clave')
        
        # Intentar buscar por username o por email
        user = None
        
        # Primero intentar por username
        try:
            user = User.objects.get(username=usuario)
        except User.DoesNotExist:
            # Intentar por email
            try:
                cuenta = Cuenta.objects.get(correo=usuario)
                user = cuenta.user
            except Cuenta.DoesNotExist:
                pass
        
        if user is None:
            raise serializers.ValidationError({
                "error": f"No existe ningún usuario con el identificador '{usuario}'. Verifica el email o nombre de usuario."
            })
        
        # Verificar contraseña
        if not user.check_password(clave):
            raise serializers.ValidationError({
                "error": f"La contraseña es incorrecta para el usuario '{user.username}'. Intenta de nuevo."
            })
        
        # Verificar que el usuario esté activo
        if not user.is_active:
            raise serializers.ValidationError({
                "error": f"La cuenta '{user.username}' está desactivada. Contacta al administrador."
            })
        
        attrs['user'] = user
        return attrs
    
    def to_representation(self, instance):
        """Devolver solo datos básicos del usuario con tokens JWT."""
        user = self.validated_data['user']
        tokens = get_tokens_for_user(user)
        
        return {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'rol': user.rol,
            },
            'tokens': tokens
        }

