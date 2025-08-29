// PÁGINA DE RESERVA PÚBLICA - Para que los pacientes agenden citas
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, User, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { BookingSlot, TherapistProfile } from '../types';
import { TherapistService } from '../services/therapistService';
import { PublicBookingService } from '../services/publicBookingService';

export const BookingPage: React.FC = () => {
  const { bookingLink } = useParams<{ bookingLink: string }>();
  const [searchParams] = useSearchParams();
  const forceRecurring = searchParams.get('type') === 'recurring';

  const [step, setStep] = useState<'slots' | 'details' | 'confirmation'>('slots');
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [appointmentType, setAppointmentType] = useState<'one-time' | 'recurring'>(
    forceRecurring ? 'recurring' : 'one-time'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [therapistData, setTherapistData] = useState<TherapistProfile | null>(null);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  
  // Cargar datos del terapeuta
  useEffect(() => {
    const loadTherapistData = async () => {
      if (!bookingLink) return;
      
      try {
        setDataLoading(true);
        const therapist = await TherapistService.getTherapistByBookingLink(bookingLink);
        
        if (!therapist) {
          setDataError('No se encontró el terapeuta');
          return;
        }
        
        setTherapistData(therapist);
        
        // Generar slots disponibles (mock por ahora)
        const slots = generateAvailableSlots(therapist);
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error loading therapist:', err);
        setDataError('Error al cargar la información del terapeuta');
      } finally {
        setDataLoading(false);
      }
    };
    
    loadTherapistData();
  }, [bookingLink]);
  
  // Generar slots disponibles basados en la configuración del terapeuta
  const generateAvailableSlots = (therapist: TherapistProfile): BookingSlot[] => {
    const slots: BookingSlot[] = [];
    const today = new Date();
    const sessionDuration = therapist.sessionDuration;
    
    // Generar slots para las próximas 2 semanas
    for (let day = 1; day <= 14; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      
      // Verificar si es día laborable
      if (!therapist.workingDays.includes(currentDate.getDay())) {
        continue;
      }
      
      const [startHour, startMinute] = therapist.workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = therapist.workingHours.end.split(':').map(Number);
      
      let currentTime = new Date(currentDate);
      currentTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(currentDate);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      // Generar slots por hora
      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(currentTime.getMinutes() + sessionDuration);
        
        if (slotEnd <= endTime) {
          slots.push({
            startTime: new Date(currentTime),
            endTime: slotEnd,
            available: true // TODO: Verificar disponibilidad real
          });
        }
        
        currentTime.setHours(currentTime.getHours() + 1);
      }
    }
    
    return slots;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupSlotsByDate = (slots: BookingSlot[]) => {
    const groups: { [key: string]: BookingSlot[] } = {};
    
    slots.forEach(slot => {
      const dateKey = slot.startTime.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
    });
    
    return groups;
  };

  const handleSlotSelect = (slot: BookingSlot) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedSlot) {
        throw new Error('No se ha seleccionado un horario');
      }

      // Validaciones
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!formData.email.trim()) {
        throw new Error('El email es requerido');
      }

      if (!therapistData) {
        throw new Error('No se encontró la información del terapeuta');
      }
      
      // Preparar datos para el servicio público
      const publicBookingData = {
        patientName: formData.name.trim(),
        patientEmail: formData.email.trim(),
        patientPhone: formData.phone.trim() || undefined,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: appointmentType,
        notes: formData.notes.trim() || undefined
      };
      
      if (!bookingLink) {
        throw new Error('Enlace de reserva no válido');
      }
      
      if (appointmentType === 'recurring') {
        await PublicBookingService.createRecurringPublicBooking(bookingLink, publicBookingData);
      } else {
        await PublicBookingService.createPublicBooking(bookingLink, publicBookingData);
      }

      setStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const renderSlotSelection = () => {
    const groupedSlots = groupSlotsByDate(availableSlots);
    const sortedDates = Object.keys(groupedSlots).sort();

    return (
      <div className="space-y-6">
        {/* Selector de tipo de cita */}
        {!forceRecurring && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de cita</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAppointmentType('one-time')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  appointmentType === 'one-time'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">Cita única</div>
                <div className="text-sm text-gray-600">Una sesión individual</div>
              </button>
              <button
                onClick={() => setAppointmentType('recurring')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  appointmentType === 'recurring'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">Cita recurrente</div>
                <div className="text-sm text-gray-600">Misma hora cada semana</div>
              </button>
            </div>
          </div>
        )}

        {/* Horarios disponibles */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios disponibles</h3>
          <div className="space-y-4">
            {sortedDates.map(dateKey => {
              const date = new Date(dateKey);
              const slotsForDate = groupedSlots[dateKey];
              
              return (
                <div key={dateKey} className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-3">
                    {formatDate(date)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {slotsForDate.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                        className="p-2 text-sm border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsForm = () => (
    <div>
      <button
        onClick={() => setStep('slots')}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Cambiar horario</span>
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900">Resumen de tu cita</h3>
        <div className="text-sm text-blue-800 mt-1">
          <div>📅 {selectedSlot && formatDate(selectedSlot.startTime)}</div>
          <div>🕐 {selectedSlot && formatTime(selectedSlot.startTime)} - {selectedSlot && formatTime(selectedSlot.endTime)}</div>
          <div>🔄 {appointmentType === 'recurring' ? 'Cita recurrente (semanal)' : 'Cita única'}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Nombre completo *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Correo electrónico *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Cualquier información adicional que consideres importante..."
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg transition-colors font-medium"
        >
          {loading ? 'Agendando...' : 'Confirmar Cita'}
        </button>
      </form>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cita confirmada!</h2>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="font-medium text-green-900 mb-4">Detalles de tu cita</h3>
        <div className="text-sm text-green-800 space-y-2">
          <div><strong>Fecha:</strong> {selectedSlot && formatDate(selectedSlot.startTime)}</div>
          <div><strong>Hora:</strong> {selectedSlot && formatTime(selectedSlot.startTime)} - {selectedSlot && formatTime(selectedSlot.endTime)}</div>
          <div><strong>Tipo:</strong> {appointmentType === 'recurring' ? 'Cita recurrente (semanal)' : 'Cita única'}</div>
          <div><strong>Paciente:</strong> {formData.name}</div>
          <div><strong>Email:</strong> {formData.email}</div>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-6">
        <p>✅ Recibirás un email de confirmación con el enlace de Google Meet</p>
        <p>📅 La cita se ha agregado automáticamente al calendario del terapeuta</p>
        {appointmentType === 'recurring' && (
          <p>🔄 Esta cita se repetirá automáticamente cada semana</p>
        )}
      </div>

      <button
        onClick={() => window.close()}
        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Cerrar
      </button>
    </div>
  );

  // Mostrar error si hay problemas con los datos
  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <h2 className="font-semibold">Error</h2>
            <p>{dataError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras carga
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center py-12">
              <div className="text-gray-500">Cargando información del terapeuta...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Agenda tu sesión
            </h1>
            {therapistData && (
              <div className="text-gray-600">
                <div className="font-medium">{therapistData.name}</div>
                <div className="text-sm">{therapistData.specialization || 'Terapia'}</div>
                <div className="text-sm">Duración: {therapistData.sessionDuration} minutos</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {step === 'slots' && renderSlotSelection()}
          {step === 'details' && renderDetailsForm()}
          {step === 'confirmation' && renderConfirmation()}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6">
          Powered by Heart Burner
        </div>
      </div>
    </div>
  );
};