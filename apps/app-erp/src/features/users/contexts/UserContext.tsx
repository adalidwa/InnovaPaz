import React, { useState, useEffect } from 'react';
import { UserContext } from '../hooks/useContextBase.ts';
import type { User } from '../hooks/useContextBase.ts';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (res.ok) {
            const data = await res.json();
            console.log('📥 Usuario cargado desde /api/auth/me:', data.usuario); // DEBUG
            const userData = {
              uid: data.usuario.uid,
              nombre_completo: data.usuario.nombre_completo,
              email: data.usuario.email,
              rol: data.usuario.rol || 'Sin rol', // Asegurar que siempre tenga un valor
              empresa_id: data.usuario.empresa_id,
              avatar_url: data.usuario.avatar_url || null,
              rol_id: data.usuario.rol_id || '',
            };
            setUser(userData);
            // Guardar usuario en localStorage
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error verificando sesión:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = (userData: User, token: string) => {
    // ⚠️ LIMPIAR COMPLETAMENTE EL LOCALSTORAGE ANTES DE GUARDAR
    console.log('🔄 Limpiando localStorage antes de nuevo login...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const userToSave = {
      ...userData,
      avatar_url: userData.avatar_url || null,
    };

    console.log('✅ Guardando nuevo usuario en sesión:', {
      email: userToSave.email,
      nombre: userToSave.nombre_completo,
      empresa_id: userToSave.empresa_id,
    });

    setUser(userToSave);
    localStorage.setItem('token', token || '');
    localStorage.setItem('user', JSON.stringify(userToSave));

    // Verificar que se guardó correctamente
    const savedUser = localStorage.getItem('user');
    console.log('✅ Usuario guardado en localStorage:', savedUser);
  };

  const logout = () => {
    console.log('👋 Cerrando sesión...');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Sesión cerrada, localStorage limpiado');
  };

  const updateAvatar = (avatarUrl: string) => {
    setUser((prev) => {
      if (prev) {
        const updatedUser = { ...prev, avatar_url: avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prev;
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateAvatar }}>
      {children}
    </UserContext.Provider>
  );
};
