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
            const userData = {
              uid: data.usuario.uid,
              nombre_completo: data.usuario.nombre_completo,
              email: data.usuario.email,
              rol: data.usuario.rol || '',
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
    const userToSave = {
      ...userData,
      avatar_url: userData.avatar_url || null,
    };
    setUser(userToSave);
    localStorage.setItem('token', token || '');
    localStorage.setItem('user', JSON.stringify(userToSave));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
