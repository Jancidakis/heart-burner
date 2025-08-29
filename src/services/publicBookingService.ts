// SERVICIO DE RESERVAS PÚBLICAS - Para citas desde enlaces públicos sin auth
import { ref, push, set, get } from 'firebase/database';
import { db } from '../config/firebase';

export interface PublicBookingData {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  startTime: Date;
  endTime: Date;
  type: 'one-time' | 'recurring';
  notes?: string;
}

export class PublicBookingService {
  
  // Crear reserva pública (sin autenticación)
  static async createPublicBooking(
    bookingLink: string, 
    bookingData: PublicBookingData
  ): Promise<string> {
    try {
      // Crear la reserva en la sección pública
      const publicBookingsRef = ref(db, `public_bookings/${bookingLink}`);
      const newBookingRef = push(publicBookingsRef);
      
      const booking = {
        id: newBookingRef.key!,
        ...bookingData,
        startTime: bookingData.startTime.toISOString(),
        endTime: bookingData.endTime.toISOString(),
        status: 'pending', // El terapeuta debe confirmar
        createdAt: new Date().toISOString(),
        source: 'public_booking'
      };
      
      await set(newBookingRef, booking);
      
      return newBookingRef.key!;
    } catch (error) {
      console.error('Error creating public booking:', error);
      throw new Error('No se pudo crear la reserva');
    }
  }
  
  // Crear múltiples reservas recurrentes
  static async createRecurringPublicBooking(
    bookingLink: string,
    bookingData: PublicBookingData,
    weeks: number = 12
  ): Promise<string[]> {
    try {
      const bookingIds: string[] = [];
      const baseDate = new Date(bookingData.startTime);
      const baseDuration = bookingData.endTime.getTime() - bookingData.startTime.getTime();
      
      for (let i = 0; i < weeks; i++) {
        const weekStartTime = new Date(baseDate);
        weekStartTime.setDate(baseDate.getDate() + (i * 7));
        
        const weekEndTime = new Date(weekStartTime.getTime() + baseDuration);
        
        const weeklyBookingData: PublicBookingData = {
          ...bookingData,
          startTime: weekStartTime,
          endTime: weekEndTime,
          type: 'recurring'
        };
        
        const bookingId = await this.createPublicBooking(bookingLink, weeklyBookingData);
        bookingIds.push(bookingId);
      }
      
      return bookingIds;
    } catch (error) {
      console.error('Error creating recurring public booking:', error);
      throw new Error('No se pudo crear la reserva recurrente');
    }
  }
  
  // Verificar disponibilidad de un slot
  static async isSlotAvailable(
    bookingLink: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    try {
      const publicBookingsRef = ref(db, `public_bookings/${bookingLink}`);
      const snapshot = await get(publicBookingsRef);
      
      if (!snapshot.exists()) {
        return true; // No hay reservas, está disponible
      }
      
      const bookingsData = snapshot.val();
      
      // Verificar conflictos de horario
      for (const bookingId in bookingsData) {
        const booking = bookingsData[bookingId];
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        
        // Verificar solapamiento
        if (
          (startTime >= bookingStart && startTime < bookingEnd) ||
          (endTime > bookingStart && endTime <= bookingEnd) ||
          (startTime <= bookingStart && endTime >= bookingEnd)
        ) {
          return false; // Hay conflicto
        }
      }
      
      return true; // No hay conflictos
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false; // En caso de error, asumir no disponible
    }
  }
  
  // Obtener reservas públicas para un enlace (para el terapeuta)
  static async getPublicBookings(bookingLink: string) {
    try {
      const publicBookingsRef = ref(db, `public_bookings/${bookingLink}`);
      const snapshot = await get(publicBookingsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const bookingsData = snapshot.val();
      const bookings: any[] = [];
      
      Object.keys(bookingsData).forEach(key => {
        const data = bookingsData[key];
        bookings.push({
          ...data,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          createdAt: new Date(data.createdAt)
        });
      });
      
      return bookings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    } catch (error) {
      console.error('Error getting public bookings:', error);
      throw new Error('No se pudieron cargar las reservas públicas');
    }
  }
}

export default PublicBookingService;