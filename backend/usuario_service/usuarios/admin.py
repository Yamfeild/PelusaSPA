from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Cuenta, Persona, Cliente, Peluquero

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'rol', 'is_active')
    list_filter = ('rol', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'email', 'telefono', 'identificacion')}),
        ('Permisos', {'fields': ('rol', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'rol', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('username', 'first_name', 'last_name', 'email', 'identificacion')
    ordering = ('username',)

admin.site.register(User, CustomUserAdmin)
@admin.register(Cuenta)
class CuentaAdmin(admin.ModelAdmin):
    list_display = ("user", "correo")
    search_fields = ("correo", "user__username")


@admin.register(Persona)
class PersonaAdmin(admin.ModelAdmin):
    list_display = ("user", "nombre", "apellido", "telefono")
    search_fields = ("nombre", "apellido", "user__username")


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("persona", "direccion")
    search_fields = ("persona__nombre", "persona__apellido")


@admin.register(Peluquero)
class PeluqueroAdmin(admin.ModelAdmin):
    list_display = ("persona", "especialidad")
    search_fields = ("persona__nombre", "persona__apellido", "especialidad")
