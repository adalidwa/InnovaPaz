import { createContext, useContext } from 'react';

export interface User {
  uid: string;
  nombre_completo: string;
  email: string;
  rol: string;
  empresa_id: string;
  avatar_url?: string | null;
  rol_id?: string;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateAvatar?: (avatarUrl: string) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de UserProvider');
  }
  return context;
};
