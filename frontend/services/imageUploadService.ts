/**
 * Servicio para subir imágenes a Cloudinary
 * Cloudinary es un servicio gratuito que permite subir imágenes sin autenticación
 * usando la API de upload no autenticada (unsigned uploads)
 */

export const imageUploadService = {
  /**
   * Sube una imagen a Cloudinary y retorna la URL
   * @param file - Archivo de imagen a subir
   * @returns URL pública de la imagen
   */
  async uploadImage(file: File): Promise<string> {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar tamaño (máx 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('La imagen no puede pesar más de 10MB');
    }

    // Crear FormData para Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Preset por defecto de Cloudinary

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen a Cloudinary');
      }

      const data = await response.json();
      
      // Retornar URL de la imagen subida
      return data.secure_url;
    } catch (error) {
      console.error('Error en imageUploadService:', error);
      throw error;
    }
  },

  /**
   * Sube una imagen y retorna la URL de forma más optimizada
   * usando parámetros de transformación de Cloudinary
   */
  async uploadImageOptimized(file: File): Promise<string> {
    const imageUrl = await this.uploadImage(file);
    
    // Transformar la URL para optimizar: máx 600px de ancho, calidad auto
    const optimizedUrl = imageUrl.replace(
      '/upload/',
      '/upload/w_600,q_auto/'
    );
    
    return optimizedUrl;
  }
};
