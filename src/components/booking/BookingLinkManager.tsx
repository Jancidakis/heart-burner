// GESTOR DE ENLACES DE RESERVA - Componente para generar y compartir enlaces
import React, { useState } from 'react';
import { Copy, Share2, ExternalLink, Settings } from 'lucide-react';

interface BookingLinkManagerProps {
  therapistId: string;
  currentBookingLink: string;
}

export const BookingLinkManager: React.FC<BookingLinkManagerProps> = ({
  therapistId,
  currentBookingLink
}) => {
  const [copied, setCopied] = useState(false);
  const [linkType, setLinkType] = useState<'general' | 'recurring'>('general');

  const baseUrl = window.location.origin;
  const generalLink = `${baseUrl}/book/${currentBookingLink}`;
  const recurringLink = `${baseUrl}/book/${currentBookingLink}?type=recurring`;

  const currentLink = linkType === 'general' ? generalLink : recurringLink;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
    }
  };

  const shareLink = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Heart Burner - Reserva tu cita',
          text: 'Reserva tu sesión de terapia usando este enlace',
          url: text
        });
      } catch (error) {
        console.error('Error al compartir:', error);
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Enlaces de Reserva
        </h3>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Selector de tipo de enlace */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setLinkType('general')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              linkType === 'general'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Enlace General
          </button>
          <button
            onClick={() => setLinkType('recurring')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              linkType === 'recurring'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Enlace Recurrente
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {linkType === 'general' 
            ? 'Los pacientes pueden elegir entre cita única o recurrente'
            : 'Los pacientes solo pueden agendar citas recurrentes semanales'
          }
        </p>
      </div>

      {/* Enlace actual */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enlace de reserva {linkType === 'general' ? 'general' : 'recurrente'}
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <code className="text-sm text-gray-800 break-all">
              {currentLink}
            </code>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => copyToClipboard(currentLink)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copiar enlace"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => shareLink(currentLink)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Compartir enlace"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => window.open(currentLink, '_blank')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {copied && (
          <div className="mt-2 text-sm text-green-600">
            ✓ Enlace copiado al portapapeles
          </div>
        )}
      </div>

      {/* Estadísticas de uso */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-600">Citas este mes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600">Visitas al enlace</div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          ¿Cómo usar tus enlaces?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Comparte el enlace por WhatsApp, email o redes sociales</li>
          <li>• Los pacientes pueden ver tu disponibilidad y agendar directamente</li>
          <li>• Recibirás notificación automática de nuevas reservas</li>
          <li>• Las citas se sincronizan con Google Calendar automáticamente</li>
        </ul>
      </div>
    </div>
  );
};