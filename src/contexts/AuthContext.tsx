// CONTEXTO DE AUTENTICACIÓN - Maneja el estado de autenticación global con Google
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // LOGIN CON GOOGLE
  const loginWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      // Configurar el proveedor para pedir selección de cuenta
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      // AQUÍ PUEDES AGREGAR LÓGICA ADICIONAL DESPUÉS DEL LOGIN
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  };

  // LOGOUT DE USUARIO
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // AQUÍ PUEDES AGREGAR LÓGICA DE LIMPIEZA DESPUÉS DEL LOGOUT
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  };

  // Convertir FirebaseUser a nuestro tipo User personalizado
  const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      // AGREGAR MÁS CAMPOS SI ES NECESARIO
    };
  };

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(convertFirebaseUser(user));
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    loginWithGoogle,
    logout,
    // AGREGAR MÁS MÉTODOS AQUÍ SI ES NECESARIO
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
