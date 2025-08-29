// MODAL DE CITAS - Componente para crear y editar citas
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Mail, Repeat, Video } from 'lucide-react';
import { Appointment } from '../../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>) => Promise<void>;
  appointment?: Appointment | null;
  initialDate?: Date;
  initialTime?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  initialDate,
  initialTime
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'one-time' as 'one-time' | 'recurring',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointment) {
      // Editar cita existente
      const startDate = new Date(appointment.startTime);
      const endDate = new Date(appointment.endTime);
      
      setFormData({
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        type: appointment.type,
        notes: appointment.notes || ''
      });
    } else if (initialDate && initialTime) {
      // Nueva cita con fecha/hora inicial
      const endTime = new Date();
      const [hours, minutes] = initialTime.split(':');
      endTime.setHours(parseInt(hours) + 1, parseInt(minutes), 0, 0);
      
      setFormData({
        patientName: '',
        patientEmail: '',
        date: initialDate.toISOString().split('T')[0],
        startTime: initialTime,
        endTime: endTime.toTimeString().slice(0, 5),
        type: 'one-time',
        notes: ''
      });
    } else {
      // Reset form
      setFormData({
        patientName: '',
        patientEmail: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'one-time',
        notes: ''
      });
    }
  }, [appointment, initialDate, initialTime, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (!formData.patientName.trim()) {
        throw new Error('El nombre del paciente es requerido');
      }
      if (!formData.patientEmail.trim()) {
        throw new Error('El email del paciente es requerido');
      }
      if (!formData.date) {
        throw new Error('La fecha es requerida');
      }
      if (!formData.startTime) {
        throw new Error('La hora de inicio es requerida');
      }
      if (!formData.endTime) {
        throw new Error('La hora de fin es requerida');
      }

      // Crear objetos Date
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio');
      }

      const appointmentData: Partial<Appointment> = {
        patientName: formData.patientName.trim(),
        patientEmail: formData.patientEmail.trim(),
        startTime: startDateTime,
        endTime: endDateTime,
        type: formData.type,
        notes: formData.notes.trim() || undefined,
        status: 'scheduled',
        updatedAt: new Date()
      };

      if (appointment) {
        appointmentData.id = appointment.id;
      } else {
        appointmentData.createdAt = new Date();
      }

      await onSave(appointmentData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      setLoading(true);
      try {
        await onSave({ 
          ...appointment, 
          status: 'cancelled',
          updatedAt: new Date()
        });
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar la cita');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Nombre del paciente */}
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Nombre del paciente
            </label>
            <input
              type="text"
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre completo"
              required
            />
          </div>

          {/* Email del paciente */}
          <div>
            <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email del paciente
            </label>
            <input
              type="email"
              id="patientEmail"
              value={formData.patientEmail}
              onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@ejemplo.com"
              required
            />
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Hora inicio
              </label>
              <input
                type="time"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Hora fin
              </label>
              <input
                type="time"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Tipo de cita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Repeat className="inline w-4 h-4 mr-1" />
              Tipo de cita
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'one-time' })}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  formData.type === 'one-time'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cita única
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'recurring' })}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  formData.type === 'recurring'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Recurrente semanal
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Notas adicionales sobre la cita..."
            />
          </div>

          {/* Información adicional para citas existentes */}
          {appointment && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Video className="w-4 h-4 mr-1" />
                Google Meet: {appointment.googleMeetLink ? 'Configurado' : 'Se generará automáticamente'}
              </div>
              <div className="text-xs text-gray-500">
                Estado: {appointment.status === 'scheduled' ? 'Programada' : appointment.status}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-between pt-4">
            {appointment && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
            
            <div className="flex space-x-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                {loading ? 'Guardando...' : (appointment ? 'Actualizar' : 'Crear Cita')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};