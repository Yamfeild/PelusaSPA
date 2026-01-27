export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  type: 'Perro' | 'Gato' | 'Otro';
  photoUrl: string;
  notes?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  image: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  petId: string;
  date: string; // ISO string or specific format
  time: string;
  status: 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Completada';
  totalPrice: number;
}
