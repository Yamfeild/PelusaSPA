# Imagen base
FROM python:3.11-slim

# Configuración del entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copiar dependencias
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . /app/

# Exponer el puerto
EXPOSE 8001

# Comando para iniciar el servidor
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
