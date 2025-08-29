// COMPONENTE RUTA PROTEGIDA - Protege rutas que requieren autenticación
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // AGREGAR MÁS PROPS SI NECESITAS ROLES O PERMISOS ESPECÍFICOS
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
        {/* AQUÍ PUEDES AGREGAR UN SPINNER MÁS ELABORADO */}
      </div>
    );
  }

  // Redirigir a login si no hay usuario autenticado
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // AQUÍ PUEDES AGREGAR VERIFICACIONES ADICIONALES
  // Ejemplo: verificar roles, permisos, estado de la cuenta, etc.

  return <>{children}</>;
};