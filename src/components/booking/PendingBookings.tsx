// COMPONENTE DE RESERVAS PENDIENTES - Para mostrar reservas públicas pendientes
import React, { useState, useEffect } from 'react';
import { Clock, User, Mail, Check, X, Calendar } from 'lucide-react';
import { PublicBookingService } from '../../services/publicBookingService';
import { AppointmentService } from '../../services/appointmentService';

interface PendingBooking {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  startTime: Date;
  endTime: Date;
  type: 'one-time' | 'recurring';
  notes?: string;
  status: string;
  createdAt: Date;
}

interface PendingBookingsProps {
  therapistId: string;
  bookingLink: string;
}

export const PendingBookings: React.FC<PendingBookingsProps> = ({
  therapistId,
  bookingLink
}) => {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar reservas pendientes
  useEffect(() => {
    const loadPendingBookings = async () => {
      try {
        setLoading(true);
        const bookings = await PublicBookingService.getPublicBookings(bookingLink);
        setPendingBookings(bookings.filter(booking => booking.status === 'pending'));
      } catch (err) {
        console.error('Error loading pending bookings:', err);
        setError('Error al cargar las reservas pendientes');
      } finally {
        setLoading(false);
      }
    };

    if (bookingLink) {
      loadPendingBookings();
    }
  }, [bookingLink]);

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

  const handleApproveBooking = async (booking: PendingBooking) => {
    try {
      // Crear cita oficial en el sistema del terapeuta
      const appointmentData = {
        patientName: booking.patientName,
        patientEmail: booking.patientEmail,
        startTime: booking.startTime,
        endTime: booking.endTime,
        type: booking.type,
        status: 'scheduled' as const,
        notes: booking.notes
      };

      if (booking.type === 'recurring') {
        await AppointmentService.createRecurringAppointment(therapistId, appointmentData as any);
      } else {
        await AppointmentService.createAppointment(therapistId, appointmentData as any);
      }

      // Remover de la lista de pendientes
      setPendingBookings(prev => prev.filter(b => b.id !== booking.id));
      
      // TODO: Actualizar el estado en Firebase y enviar email de confirmación
      
    } catch (err) {
      console.error('Error approving booking:', err);
      setError('Error al aprobar la reserva');
    }
  };

  const handleRejectBooking = async (booking: PendingBooking) => {
    try {
      // TODO: Marcar como rechazada en Firebase y enviar email
      setPendingBookings(prev => prev.filter(b => b.id !== booking.id));
    } catch (err) {
      console.error('Error rejecting booking:', err);
      setError('Error al rechazar la reserva');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reservas Pendientes
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Cargando reservas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reservas Pendientes
        </h3>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Reservas Pendientes
        </h3>
        <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
          {pendingBookings.length}
        </div>
      </div>

      {pendingBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay reservas pendientes
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBookings.map(booking => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {booking.patientName}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.type === 'recurring' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {booking.type === 'recurring' ? 'Recurrente' : 'Única'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{booking.patientEmail}</span>
                    </div>
                    {booking.patientPhone && (
                      <div className="flex items-center space-x-1">
                        <span>📱</span>
                        <span>{booking.patientPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(booking.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      <strong>Notas:</strong> {booking.notes}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleApproveBooking(booking)}
                    className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                    title="Aprobar reserva"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRejectBooking(booking)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                    title="Rechazar reserva"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingBookings;