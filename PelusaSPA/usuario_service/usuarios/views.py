from rest_framework import viewsets
from .models import Peluquero
from .serializers import PeluqueroSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class PeluqueroViewSet(viewsets.ModelViewSet):
    queryset = Peluquero.objects.all()
    serializer_class = PeluqueroSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
