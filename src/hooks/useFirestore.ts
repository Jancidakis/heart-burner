// HOOK PERSONALIZADO PARA FIRESTORE - Hook reutilizable para operaciones con Firebase
import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/firebaseService';

// Hook para obtener una colección completa
export const useCollection = (collectionName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await FirebaseService.getCollection(collectionName);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName]);

  return { data, loading, error };
};

// Hook para obtener un documento específico
export const useDocument = (collectionName: string, documentId: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!documentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await FirebaseService.getDocument(collectionName, documentId);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, documentId]);

  return { data, loading, error };
};

// Hook para suscribirse a cambios en tiempo real
export const useRealtimeCollection = (collectionName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // SUSCRIBIRSE A CAMBIOS EN TIEMPO REAL
    const unsubscribe = FirebaseService.subscribeToCollection(
      collectionName,
      (newData) => {
        setData(newData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // CLEANUP - Cancelar suscripción cuando el componente se desmonte
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName]);

  return { data, loading, error };
};

// AGREGAR MÁS HOOKS PERSONALIZADOS SEGÚN NECESIDADES
// Ejemplo: useUserData, useAppointments, etc.