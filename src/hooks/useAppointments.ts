// HOOK PERSONALIZADO - Para manejo de citas con Firebase
import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../config/firebase';
import { Appointment } from '../types';
import { AppointmentService } from '../services/appointmentService';

export const useAppointments = (therapistId: string | null) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar citas en tiempo real
  useEffect(() => {
    if (!therapistId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const appointmentsRef = ref(db, `appointments/${therapistId}`);
    
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const appointmentsData = snapshot.val();
        const loadedAppointments: Appointment[] = [];

        Object.keys(appointmentsData).forEach(key => {
          const data = appointmentsData[key];
          loadedAppointments.push({
            ...data,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
          });
        });

        // Ordenar por fecha
        loadedAppointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        
        setAppointments(loadedAppointments);
        setLoading(false);
      } catch (err) {
        console.error('Error processing appointments:', err);
        setError('Error al cargar las citas');
        setLoading(false);
      }
    }, (err) => {
      console.error('Error listening to appointments:', err);
      setError('Error al conectar con la base de datos');
      setLoading(false);
    });

    return () => off(appointmentsRef, 'value', unsubscribe);
  }, [therapistId]);

  // Crear cita
  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'therapistId' | 'createdAt' | 'updatedAt'>) => {
    if (!therapistId) throw new Error('No hay terapeuta seleccionado');
    
    try {
      const appointmentId = await AppointmentService.createAppointment(therapistId, appointmentData);
      return appointmentId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cita';
      setError(errorMessage);
      throw err;
    }
  }, [therapistId]);

  // Actualizar cita
  const updateAppointment = useCallback(async (appointmentId: string, updates: Partial<Appointment>) => {
    if (!therapistId) throw new Error('No hay terapeuta seleccionado');
    
    try {
      await AppointmentService.updateAppointment(therapistId, appointmentId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la cita';
      setError(errorMessage);
      throw err;
    }
  }, [therapistId]);

  // Eliminar cita
  const deleteAppointment = useCallback(async (appointmentId: string) => {
    if (!therapistId) throw new Error('No hay terapeuta seleccionado');
    
    try {
      await AppointmentService.deleteAppointment(therapistId, appointmentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la cita';
      setError(errorMessage);
      throw err;
    }
  }, [therapistId]);

  // Crear cita recurrente
  const createRecurringAppointment = useCallback(async (
    appointmentData: Omit<Appointment, 'id' | 'therapistId' | 'createdAt' | 'updatedAt'>,
    weeks: number = 12
  ) => {
    if (!therapistId) throw new Error('No hay terapeuta seleccionado');
    
    try {
      const appointmentIds = await AppointmentService.createRecurringAppointment(therapistId, appointmentData, weeks);
      return appointmentIds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cita recurrente';
      setError(errorMessage);
      throw err;
    }
  }, [therapistId]);

  // Obtener citas para una fecha específica
  const getAppointmentsForDate = useCallback((date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate.toDateString() === date.toDateString();
    });
  }, [appointments]);

  // Obtener citas para un rango de fechas
  const getAppointmentsForWeek = useCallback((date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Lunes
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
    endOfWeek.setHours(23, 59, 59, 999);

    return appointments.filter(appointment => {
      const appointmentDate = appointment.startTime;
      return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
    });
  }, [appointments]);

  // Estadísticas
  const getStats = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay() + 1);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    return {
      total: appointments.length,
      today: appointments.filter(apt => {
        const aptDate = new Date(apt.startTime.getFullYear(), apt.startTime.getMonth(), apt.startTime.getDate());
        return aptDate.getTime() === today.getTime();
      }).length,
      thisWeek: appointments.filter(apt => apt.startTime >= thisWeekStart && apt.startTime <= thisWeekEnd).length,
      totalPatients: new Set(appointments.map(apt => apt.patientEmail)).size,
      recurring: appointments.filter(apt => apt.type === 'recurring').length,
      oneTime: appointments.filter(apt => apt.type === 'one-time').length
    };
  }, [appointments]);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    createRecurringAppointment,
    getAppointmentsForDate,
    getAppointmentsForWeek,
    getStats
  };
};

export default useAppointments;