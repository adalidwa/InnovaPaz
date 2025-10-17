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
            setUser({
              uid: data.usuario.uid,
              nombre_completo: data.usuario.nombre_completo,
              email: data.usuario.email,
              rol: data.usuario.rol || 'Sin rol', // Asegurar que siempre tenga un valor
              empresa_id: data.usuario.empresa_id,
              avatar_url: data.usuario.avatar_url || null,
              rol_id: data.usuario.rol_id || '',
            });
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error verificando sesión:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = (userData: User, token: string) => {
    setUser({
      ...userData,
      avatar_url: userData.avatar_url || null,
    });
    localStorage.setItem('token', token || '');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateAvatar = (avatarUrl: string) => {
    setUser((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateAvatar }}>
      {children}
    </UserContext.Provider>
  );
};
