import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../configs/firebaseConfig';

export interface UserData {
  id: string;
  nombre_completo: string;
  email: string;
  rol: string;
  empresa_id: string;
  created_at: Date;
  updated_at: Date;
  setup_completed: boolean;
}

export interface CompanyData {
  id: string;
  nombre: string;
  owner_uid: string;
  plan_id: string;
  tipo_negocio: string;
  created_at: Date;
  updated_at: Date;
}

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        nombre_completo: data.nombre_completo,
        email: data.email,
        rol: data.rol,
        empresa_id: data.empresa_id,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
        setup_completed: data.setup_completed || false,
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    return null;
  }
};

export const getCompanyData = async (companyId: string): Promise<CompanyData | null> => {
  try {
    const companyDoc = await getDoc(doc(db, 'empresas', companyId));
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      return {
        id: companyDoc.id,
        nombre: data.nombre,
        owner_uid: data.owner_uid,
        plan_id: data.plan_id,
        tipo_negocio: data.tipo_negocio,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo datos de la empresa:', error);
    return null;
  }
};

export const getCompanyUsers = async (companyId: string): Promise<UserData[]> => {
  try {
    const q = query(collection(db, 'users'), where('empresa_id', '==', companyId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre_completo: data.nombre_completo,
        email: data.email,
        rol: data.rol,
        empresa_id: data.empresa_id,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
        setup_completed: data.setup_completed || false,
      };
    });
  } catch (error) {
    console.error('Error obteniendo usuarios de la empresa:', error);
    return [];
  }
};
