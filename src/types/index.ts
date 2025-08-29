// TIPOS TYPESCRIPT - Define las interfaces y tipos para toda la aplicación

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // AGREGAR MÁS CAMPOS DEL USUARIO SEGÚN NECESIDADES
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  // AGREGAR MÁS MÉTODOS DE AUTENTICACIÓN SI ES NECESARIO
}

// INTERFACES PARA HEART BURNER - SCHEDULING APP

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isRecurrent: boolean;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  therapistId: string;
  patientId?: string;
  patientName: string;
  patientEmail: string;
  startTime: Date;
  endTime: Date;
  type: 'one-time' | 'recurring';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  googleCalendarId?: string;
  googleMeetLink?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapistProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization?: string;
  sessionDuration: number; // en minutos
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  workingDays: number[]; // [1,2,3,4,5] para lun-vie
  timeZone: string;
  googleCalendarIntegrated: boolean;
  calendlyIntegrated: boolean;
  bookingLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export interface CalendarView {
  current: Date;
  view: 'day' | 'week' | 'month';
}
