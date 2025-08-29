// SERVICIO DE TERAPEUTAS - Manejo de perfiles de terapeutas
import { ref, set, get, update } from 'firebase/database';
import { db } from '../config/firebase';
import { TherapistProfile } from '../types';

export class TherapistService {
  
  // Crear perfil de terapeuta
  static async createTherapistProfile(userId: string, profileData: Omit<TherapistProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const therapistRef = ref(db, `therapists/${userId}`);
      
      const profile: TherapistProfile = {
        id: userId,
        userId,
        ...profileData,
        bookingLink: this.generateBookingLink(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await set(therapistRef, {
        ...profile,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString()
      });
    } catch (error) {
      console.error('Error creating therapist profile:', error);
      throw new Error('No se pudo crear el perfil del terapeuta');
    }
  }
  
  // Obtener perfil de terapeuta
  static async getTherapistProfile(userId: string): Promise<TherapistProfile | null> {
    try {
      const therapistRef = ref(db, `therapists/${userId}`);
      const snapshot = await get(therapistRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const data = snapshot.val();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      };
    } catch (error) {
      console.error('Error getting therapist profile:', error);
      throw new Error('No se pudo cargar el perfil del terapeuta');
    }
  }
  
  // Actualizar perfil de terapeuta
  static async updateTherapistProfile(userId: string, updates: Partial<TherapistProfile>): Promise<void> {
    try {
      const therapistRef = ref(db, `therapists/${userId}`);
      
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(therapistRef, updateData);
    } catch (error) {
      console.error('Error updating therapist profile:', error);
      throw new Error('No se pudo actualizar el perfil del terapeuta');
    }
  }
  
  // Obtener terapeuta por enlace de reserva
  static async getTherapistByBookingLink(bookingLink: string): Promise<TherapistProfile | null> {
    try {
      // En una implementación real, necesitarías indexar por bookingLink
      // Por simplicidad, esto no está optimizado
      const therapistsRef = ref(db, 'therapists');
      const snapshot = await get(therapistsRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      const therapistsData = snapshot.val();
      
      for (const userId in therapistsData) {
        const therapist = therapistsData[userId];
        if (therapist.bookingLink === bookingLink) {
          return {
            ...therapist,
            createdAt: new Date(therapist.createdAt),
            updatedAt: new Date(therapist.updatedAt)
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting therapist by booking link:', error);
      throw new Error('No se pudo encontrar el terapeuta');
    }
  }
  
  // Generar enlace único de reserva
  static generateBookingLink(): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  
  // Regenerar enlace de reserva
  static async regenerateBookingLink(userId: string): Promise<string> {
    try {
      const newBookingLink = this.generateBookingLink();
      await this.updateTherapistProfile(userId, { bookingLink: newBookingLink });
      return newBookingLink;
    } catch (error) {
      console.error('Error regenerating booking link:', error);
      throw new Error('No se pudo regenerar el enlace de reserva');
    }
  }
  
  // Verificar si el terapeuta existe y está configurado
  static async isTherapistSetup(userId: string): Promise<boolean> {
    try {
      const profile = await this.getTherapistProfile(userId);
      return profile !== null && profile.name && profile.email && profile.sessionDuration > 0;
    } catch (error) {
      console.error('Error checking therapist setup:', error);
      return false;
    }
  }
  
  // Crear perfil inicial básico si no existe
  static async ensureTherapistProfile(userId: string, email: string, displayName?: string): Promise<TherapistProfile> {
    try {
      let profile = await this.getTherapistProfile(userId);
      
      if (!profile) {
        // Crear perfil básico
        const basicProfile = {
          name: displayName || 'Terapeuta',
          email: email,
          sessionDuration: 60, // 60 minutos por defecto
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          workingDays: [1, 2, 3, 4, 5], // Lunes a viernes
          timeZone: 'America/Mexico_City',
          googleCalendarIntegrated: false,
          calendlyIntegrated: false
        };
        
        await this.createTherapistProfile(userId, basicProfile);
        profile = await this.getTherapistProfile(userId);
      }
      
      return profile!;
    } catch (error) {
      console.error('Error ensuring therapist profile:', error);
      throw new Error('No se pudo crear o cargar el perfil del terapeuta');
    }
  }
}

export default TherapistService;