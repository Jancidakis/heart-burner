// SERVICIOS FIREBASE - Todas las operaciones con Firestore van aquí
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// SERVICIO GENÉRICO PARA COLECCIONES
export class FirebaseService {
  
  // OBTENER DOCUMENTO POR ID
  static async getDocument(collectionName: string, documentId: string) {
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Documento no encontrado');
      }
    } catch (error) {
      console.error('Error obteniendo documento:', error);
      throw error;
    }
  }

  // OBTENER TODOS LOS DOCUMENTOS DE UNA COLECCIÓN
  static async getCollection(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo colección:', error);
      throw error;
    }
  }

  // AGREGAR NUEVO DOCUMENTO
  static async addDocument(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error agregando documento:', error);
      throw error;
    }
  }

  // ACTUALIZAR DOCUMENTO EXISTENTE
  static async updateDocument(collectionName: string, documentId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando documento:', error);
      throw error;
    }
  }

  // ELIMINAR DOCUMENTO
  static async deleteDocument(collectionName: string, documentId: string) {
    try {
      await deleteDoc(doc(db, collectionName, documentId));
    } catch (error) {
      console.error('Error eliminando documento:', error);
      throw error;
    }
  }

  // CONSULTA CON FILTROS
  static async queryDocuments(
    collectionName: string, 
    field: string, 
    operator: any, 
    value: any,
    orderByField?: string
  ) {
    try {
      let q = query(
        collection(db, collectionName),
        where(field, operator, value)
      );

      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error en consulta:', error);
      throw error;
    }
  }

  // ESCUCHAR CAMBIOS EN TIEMPO REAL
  static subscribeToCollection(
    collectionName: string, 
    callback: (data: any[]) => void,
    errorCallback?: (error: Error) => void
  ) {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      },
      (error) => {
        console.error('Error en suscripción:', error);
        if (errorCallback) errorCallback(error);
      }
    );

    return unsubscribe; // Devuelve función para cancelar suscripción
  }
}

// SERVICIOS ESPECÍFICOS - Agregar aquí servicios para entidades específicas
// Ejemplo: UserService, AppointmentService, TherapistService, etc.

export class UserService extends FirebaseService {
  private static COLLECTION = 'users';

  // CREAR PERFIL DE USUARIO
  static async createUserProfile(userId: string, userData: any) {
    try {
      await this.updateDocument(this.COLLECTION, userId, userData);
    } catch (error) {
      console.error('Error creando perfil de usuario:', error);
      throw error;
    }
  }

  // OBTENER PERFIL DE USUARIO
  static async getUserProfile(userId: string) {
    return this.getDocument(this.COLLECTION, userId);
  }

  // ACTUALIZAR PERFIL DE USUARIO
  static async updateUserProfile(userId: string, userData: any) {
    return this.updateDocument(this.COLLECTION, userId, userData);
  }
}

// AGREGAR MÁS SERVICIOS ESPECÍFICOS AQUÍ
// Ejemplo:
// export class AppointmentService extends FirebaseService { ... }
// export class TherapistService extends FirebaseService { ... }
</antmlAction>