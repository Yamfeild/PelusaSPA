from django.contrib import admin
from .models import Cita, Horario


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente_id', 'peluquero_id', 'fecha', 'hora_inicio', 'hora_fin', 'estado')
    list_filter = ('estado', 'fecha')
    search_fields = ('cliente_id', 'peluquero_id')
    ordering = ('-fecha', '-hora_inicio')


@admin.register(Horario)
class HorarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'peluquero_id', 'dia_semana', 'hora_inicio', 'hora_fin', 'activo')
    list_filter = ('dia_semana', 'activo')
    search_fields = ('peluquero_id',)
    ordering = ('peluquero_id', 'dia_semana', 'hora_inicio')

