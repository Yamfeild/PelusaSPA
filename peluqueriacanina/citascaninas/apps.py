from django.apps import AppConfig


class CitascaninasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'citascaninas'

    def ready(self):
        pass

