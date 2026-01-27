import axios from 'axios';
/** * CONFIGURACIÓN DE REDES
 * Solo quita el comentario (//) a la que vayas a usar:
 */

//const BASE_URL = 'http://192.168.1.86:8000';    // 🏠 Casa
//const BASE_URL = 'http://10.20.138.84:8000';     // 🎓 Universidad (según tu captura)
 const BASE_URL = 'http://172.20.10.10:8000';    // 📱 Datos Móviles
 

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});