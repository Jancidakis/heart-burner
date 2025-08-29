// COMPONENTE CALENDARIO - Vista principal del calendario para terapeutas
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarView as CalendarViewType, Appointment } from '../../types';

interface CalendarViewProps {
  appointments: Appointment[];
  onCreateAppointment: (date: Date, time: string) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  onCreateAppointment,
  onEditAppointment
}) => {
  const [calendar, setCalendar] = useState<CalendarViewType>({
    current: new Date(),
    view: 'week'
  });

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendar.current);
    
    if (calendar.view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendar.view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCalendar({ ...calendar, current: newDate });
  };

  const changeView = (view: 'day' | 'week' | 'month') => {
    setCalendar({ ...calendar, view });
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Lunes como primer día
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(calendar.current);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8AM a 8PM

    return (
      <div className="grid grid-cols-8 gap-1">
        {/* Header con días */}
        <div className="p-2 text-center font-medium text-gray-500">Hora</div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-2 text-center">
            <div className="text-sm font-medium text-gray-900">
              {day.toLocaleDateString('es-ES', { weekday: 'short' })}
            </div>
            <div className="text-lg font-bold text-gray-700">
              {day.getDate()}
            </div>
          </div>
        ))}

        {/* Grid de horas */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="p-2 text-right text-sm text-gray-500 border-t">
              {hour}:00
            </div>
            {weekDays.map(day => {
              const dayAppointments = getAppointmentsForDate(day).filter(apt => 
                new Date(apt.startTime).getHours() === hour
              );
              
              return (
                <div 
                  key={`${day.toISOString()}-${hour}`} 
                  className="min-h-16 border border-gray-200 p-1 relative group hover:bg-gray-50 cursor-pointer"
                  onClick={() => onCreateAppointment(day, `${hour}:00`)}
                >
                  {dayAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className={`absolute inset-1 p-1 rounded text-xs cursor-pointer ${
                        appointment.type === 'recurring' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAppointment(appointment);
                      }}
                    >
                      <div className="font-medium truncate">
                        {appointment.patientName}
                      </div>
                      <div className="text-xs opacity-75">
                        {formatTime(new Date(appointment.startTime))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);
    const dayAppointments = getAppointmentsForDate(calendar.current);

    return (
      <div className="space-y-1">
        {hours.map(hour => {
          const hourAppointments = dayAppointments.filter(apt => 
            new Date(apt.startTime).getHours() === hour
          );

          return (
            <div key={hour} className="flex">
              <div className="w-20 p-2 text-right text-sm text-gray-500">
                {hour}:00
              </div>
              <div 
                className="flex-1 min-h-16 border border-gray-200 p-2 relative group hover:bg-gray-50 cursor-pointer"
                onClick={() => onCreateAppointment(calendar.current, `${hour}:00`)}
              >
                {hourAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`p-2 rounded mb-1 cursor-pointer ${
                      appointment.type === 'recurring' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAppointment(appointment);
                    }}
                  >
                    <div className="font-medium">{appointment.patientName}</div>
                    <div className="text-sm opacity-75">
                      {formatTime(new Date(appointment.startTime))} - {formatTime(new Date(appointment.endTime))}
                    </div>
                  </div>
                ))}
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header del calendario */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateCalendar('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {formatDate(calendar.current)}
          </h2>
          
          <button
            onClick={() => navigateCalendar('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map(viewType => (
              <button
                key={viewType}
                onClick={() => changeView(viewType)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  calendar.view === viewType
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewType === 'day' ? 'Día' : viewType === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCalendar({ ...calendar, current: new Date() })}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-600">Cita única</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
            <span className="text-sm text-gray-600">Cita recurrente</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Haz clic en cualquier espacio para crear una nueva cita
        </div>
      </div>

      {/* Contenido del calendario */}
      <div className="p-6">
        {calendar.view === 'day' && renderDayView()}
        {calendar.view === 'week' && renderWeekView()}
        {calendar.view === 'month' && (
          <div className="text-center py-12 text-gray-500">
            Vista mensual - Por implementar
          </div>
        )}
      </div>
    </div>
  );
};