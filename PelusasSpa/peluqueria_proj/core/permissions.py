from rest_framework.permissions import BasePermission

class IsPeluquero(BasePermission):
    """
    Permite acceso solo a usuarios del grupo 'peluqueros'
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name='peluqueros').exists()
        )
