// PÁGINA DASHBOARD - Página principal después del login
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Settings, Calendar, Users, Link, Plus } from 'lucide-react';
import { CalendarView } from '../components/calendar/CalendarView';
import { AppointmentModal } from '../components/appointments/AppointmentModal';
import { BookingLinkManager } from '../components/booking/BookingLinkManager';
import { PendingBookings } from '../components/booking/PendingBookings';
import { Appointment, TherapistProfile } from '../types';
import { useAppointments } from '../hooks/useAppointments';
import { TherapistService } from '../services/therapistService';

export const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  
  // Estados para la gestión de citas y modales
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>();
  const [initialTime, setInitialTime] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'calendar' | 'booking' | 'patients'>('calendar');
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Usar el hook de citas
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    createAppointment,
    updateAppointment,
    createRecurringAppointment,
    getStats
  } = useAppointments(currentUser?.uid || null);
  
  const stats = getStats();

  const handleLogout = async () => {
    try {
      await logout();
      // La redirección se maneja automáticamente por el AuthContext
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  const handleCreateAppointment = (date: Date, time: string) => {
    setSelectedAppointment(null);
    setInitialDate(date);
    setInitialTime(time);
    setIsAppointmentModalOpen(true);
  };
  
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setInitialDate(undefined);
    setInitialTime(undefined);
    setIsAppointmentModalOpen(true);
  };
  
  // Cargar perfil del terapeuta
  useEffect(() => {
    const loadTherapistProfile = async () => {
      if (!currentUser) return;
      
      try {
        setProfileLoading(true);
        const profile = await TherapistService.ensureTherapistProfile(
          currentUser.uid,
          currentUser.email || '',
          currentUser.displayName || undefined
        );
        setTherapistProfile(profile);
      } catch (error) {
        console.error('Error loading therapist profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadTherapistProfile();
  }, [currentUser]);
  
  const handleSaveAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      if (appointmentData.id) {
        // Editar cita existente
        await updateAppointment(appointmentData.id, appointmentData);
      } else {
        // Crear nueva cita
        const newAppointmentData = {
          patientName: appointmentData.patientName || '',
          patientEmail: appointmentData.patientEmail || '',
          startTime: appointmentData.startTime || new Date(),
          endTime: appointmentData.endTime || new Date(),
          type: appointmentData.type || 'one-time' as const,
          status: 'scheduled' as const,
          notes: appointmentData.notes
        };
        
        if (appointmentData.type === 'recurring') {
          await createRecurringAppointment(newAppointmentData);
        } else {
          await createAppointment(newAppointmentData);
        }
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER CON NAVEGACIÓN */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Heart Burner
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BIENVENIDA */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido de vuelta!
          </h2>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu actividad
          </p>
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendario</span>
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'booking'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Enlaces</span>
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'patients'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pacientes</span>
          </button>
        </div>
        
        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Citas Hoy
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.today}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Total Pacientes
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalPatients}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Esta Semana
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.thisWeek}
                </p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* MENSAJES DE ERROR */}
        {appointmentsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {appointmentsError}
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        {activeTab === 'calendar' && (
          <>
            {appointmentsLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center py-12">
                  <div className="text-gray-500">Cargando calendario...</div>
                </div>
              </div>
            ) : (
              <CalendarView
                appointments={appointments}
                onCreateAppointment={handleCreateAppointment}
                onEditAppointment={handleEditAppointment}
              />
            )}
          </>
        )}
        
        {activeTab === 'booking' && therapistProfile && (
          <div className="space-y-6">
            <PendingBookings
              therapistId={currentUser?.uid || ''}
              bookingLink={therapistProfile.bookingLink}
            />
            <BookingLinkManager
              therapistId={currentUser?.uid || ''}
              currentBookingLink={therapistProfile.bookingLink}
            />
          </div>
        )}
        
        {activeTab === 'booking' && !therapistProfile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center py-12">
              <div className="text-gray-500">Cargando perfil...</div>
            </div>
          </div>
        )}
        
        {activeTab === 'patients' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Gestión de Pacientes
              </h3>
              <button
                onClick={() => handleCreateAppointment(new Date(), '09:00')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Cita</span>
              </button>
            </div>
            
            <div className="text-center py-12 text-gray-500">
              Lista de pacientes - Por implementar
              <br />
              <small>Mostrará todos los pacientes con sus citas recurrentes y historial</small>
            </div>
          </div>
        )}
        
        {/* MODAL DE CITAS */}
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          onSave={handleSaveAppointment}
          appointment={selectedAppointment}
          initialDate={initialDate}
          initialTime={initialTime}
        />
      </main>
    </div>
  );
};
