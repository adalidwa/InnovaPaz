import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

// Custom hook para acceder fácilmente al contexto de usuario y funciones de autenticación
export function useAuth() {
  return useContext(UserContext);
}
