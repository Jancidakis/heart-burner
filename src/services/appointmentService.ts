// SERVICIO DE CITAS - Manejo de citas con Firebase Realtime Database
import { ref, push, set, get, query, orderByChild, remove, update } from 'firebase/database';
import { db } from '../config/firebase';
import { Appointment } from '../types';

export class AppointmentService {
  
  // Crear nueva cita
  static async createAppointment(therapistId: string, appointmentData: Omit<Appointment, 'id'>): Promise<string> {
    try {
      const appointmentsRef = ref(db, `appointments/${therapistId}`);
      const newAppointmentRef = push(appointmentsRef);
      
      const appointment: Appointment = {
        ...appointmentData,
        id: newAppointmentRef.key!,
        therapistId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await set(newAppointmentRef, {
        ...appointment,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString()
      });
      
      return newAppointmentRef.key!;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error('No se pudo crear la cita');
    }
  }
  
  // Obtener todas las citas de un terapeuta
  static async getAppointments(therapistId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = ref(db, `appointments/${therapistId}`);
      const snapshot = await get(appointmentsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const appointmentsData = snapshot.val();
      const appointments: Appointment[] = [];
      
      Object.keys(appointmentsData).forEach(key => {
        const data = appointmentsData[key];
        appointments.push({
          ...data,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        });
      });
      
      return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw new Error('No se pudieron cargar las citas');
    }
  }
  
  // Actualizar cita
  static async updateAppointment(therapistId: string, appointmentId: string, updates: Partial<Appointment>): Promise<void> {
    try {
      const appointmentRef = ref(db, `appointments/${therapistId}/${appointmentId}`);
      
      const updateData: any = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Convertir fechas a strings
      if (updates.startTime) {
        updateData.startTime = updates.startTime.toISOString();
      }
      if (updates.endTime) {
        updateData.endTime = updates.endTime.toISOString();
      }
      
      await update(appointmentRef, updateData);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw new Error('No se pudo actualizar la cita');
    }
  }
  
  // Eliminar cita
  static async deleteAppointment(therapistId: string, appointmentId: string): Promise<void> {
    try {
      const appointmentRef = ref(db, `appointments/${therapistId}/${appointmentId}`);
      await remove(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw new Error('No se pudo eliminar la cita');
    }
  }
  
  // Obtener citas por rango de fechas
  static async getAppointmentsByDateRange(
    therapistId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Appointment[]> {
    try {
      const appointments = await this.getAppointments(therapistId);
      
      return appointments.filter(appointment => {
        const appointmentDate = appointment.startTime;
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting appointments by date range:', error);
      throw new Error('No se pudieron cargar las citas para el rango de fechas');
    }
  }
  
  // Crear cita recurrente (múltiples citas)
  static async createRecurringAppointment(
    therapistId: string,
    appointmentData: Omit<Appointment, 'id'>,
    weeks: number = 12 // Por defecto crear para 12 semanas
  ): Promise<string[]> {
    try {
      const appointmentIds: string[] = [];
      const baseDate = new Date(appointmentData.startTime);
      const baseDuration = appointmentData.endTime.getTime() - appointmentData.startTime.getTime();
      
      for (let i = 0; i < weeks; i++) {
        const weekStartTime = new Date(baseDate);
        weekStartTime.setDate(baseDate.getDate() + (i * 7));
        
        const weekEndTime = new Date(weekStartTime.getTime() + baseDuration);
        
        const weeklyAppointment = {
          ...appointmentData,
          startTime: weekStartTime,
          endTime: weekEndTime,
          type: 'recurring' as const
        };
        
        const appointmentId = await this.createAppointment(therapistId, weeklyAppointment);
        appointmentIds.push(appointmentId);
      }
      
      return appointmentIds;
    } catch (error) {
      console.error('Error creating recurring appointment:', error);
      throw new Error('No se pudo crear la cita recurrente');
    }
  }
}

export default AppointmentService;