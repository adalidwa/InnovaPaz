import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface UserPreferences {
  theme: ThemeMode;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
}

interface ThemeContextType {
  currentTheme: ThemeMode;
  preferences: UserPreferences;
  isDarkMode: boolean;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setFontSize: (fontSize: 'small' | 'medium' | 'large') => Promise<void>;
  updatePreferences: (prefs: UserPreferences) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'es',
    fontSize: 'medium',
  });
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');
  const [loading, setLoading] = useState(true);

  // Detectar preferencia del sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Calcular si debe usar modo oscuro
  const isDarkMode =
    currentTheme === 'dark' || (currentTheme === 'auto' && getSystemTheme() === 'dark');

  // Aplicar tema al DOM
  const applyTheme = (theme: ThemeMode) => {
    const resolvedTheme = theme === 'auto' ? getSystemTheme() : theme;
    const root = document.documentElement;

    if (resolvedTheme === 'dark') {
      // Variables CSS para tema oscuro
      root.style.setProperty('--header-bg', '#1a1a1a');
      root.style.setProperty('--header-text', '#e5e5e5');
      root.style.setProperty('--sidebar-bg', '#111111');
      root.style.setProperty('--sidebar-text', '#ffffff');
      root.style.setProperty('--content-bg', '#181818');
      root.style.setProperty('--content-text', '#e5e5e5');

      // Colores primarios adaptados para oscuro
      root.style.setProperty('--pri-900', '#e5e5e5');
      root.style.setProperty('--pri-800', '#d1d5db');
      root.style.setProperty('--pri-700', '#9ca3af');
      root.style.setProperty('--pri-600', '#6b7280');
      root.style.setProperty('--pri-500', '#4b5563');
      root.style.setProperty('--pri-400', '#374151');
      root.style.setProperty('--pri-300', '#1f2937');
      root.style.setProperty('--pri-200', '#111827');
      root.style.setProperty('--pri-100', '#0f0f0f');

      // Backgrounds para modo oscuro
      root.style.setProperty('--bg-100', '#0f0f0f');
      root.style.setProperty('--bg-200', '#1a1a1a');
      root.style.setProperty('--bg-300', '#262626');
      root.style.setProperty('--bg-400', '#404040');

      // Cards y elementos con backgrounds especiales
      root.style.setProperty('--card-bg', '#1f1f1f');
      root.style.setProperty('--white', '#1f1f1f');
    } else {
      // Restaurar variables CSS para tema claro (valores originales del theme.css)
      root.style.setProperty('--header-bg', '#ffffff');
      root.style.setProperty('--header-text', '#322f44');
      root.style.setProperty('--sidebar-bg', '#322f44');
      root.style.setProperty('--sidebar-text', '#ffffff');
      root.style.setProperty('--content-bg', '#fcfbfa');
      root.style.setProperty('--content-text', '#242231');

      // Restaurar colores primarios originales
      root.style.setProperty('--pri-900', '#242231');
      root.style.setProperty('--pri-800', '#322f44');
      root.style.setProperty('--pri-700', '#39364e');
      root.style.setProperty('--pri-600', '#403d58');
      root.style.setProperty('--pri-500', '#8d89ad');
      root.style.setProperty('--pri-400', '#a3a0bd');
      root.style.setProperty('--pri-300', '#bab8ce');
      root.style.setProperty('--pri-200', '#d1d0de');
      root.style.setProperty('--pri-100', '#f0f0f5');

      // Restaurar backgrounds originales
      root.style.setProperty('--bg-100', '#fcfbfa');
      root.style.setProperty('--bg-200', '#fbfaf8');
      root.style.setProperty('--bg-300', '#f9f8f6');
      root.style.setProperty('--bg-400', '#f8f6f3');

      // Restaurar elementos
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--white', '#ffffff');
    }
  };

  // Aplicar tamaño de fuente al DOM
  const applyFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    const root = document.documentElement;

    switch (fontSize) {
      case 'small':
        root.style.setProperty('--base-font-size', '14px');
        break;
      case 'medium':
        root.style.setProperty('--base-font-size', '16px');
        break;
      case 'large':
        root.style.setProperty('--base-font-size', '18px');
        break;
    }
  };

  // Cargar preferencias del usuario al inicializar
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          applyTheme('light');
          applyFontSize('medium');
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userPrefs = data.usuario.preferencias || {
            theme: 'light',
            language: 'es',
            fontSize: 'medium',
          };

          setPreferences(userPrefs);
          setCurrentTheme(userPrefs.theme);
          applyTheme(userPrefs.theme);
          applyFontSize(userPrefs.fontSize);
        }
      } catch (error) {
        console.error('Error cargando preferencias del usuario:', error);
        // Aplicar configuración por defecto en caso de error
        applyTheme('light');
        applyFontSize('medium');
      } finally {
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, []);

  // Escuchar cambios en preferencias del sistema para modo 'auto'
  useEffect(() => {
    if (currentTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme('auto');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [currentTheme]);

  // Función para cambiar tema
  const setTheme = async (theme: ThemeMode) => {
    try {
      const newPreferences = { ...preferences, theme };

      // Actualizar estado local inmediatamente
      setCurrentTheme(theme);
      setPreferences(newPreferences);
      applyTheme(theme);

      // Guardar en servidor
      await updatePreferences(newPreferences);
    } catch (error) {
      console.error('Error al cambiar tema:', error);
      // Revertir en caso de error
      setCurrentTheme(preferences.theme);
      applyTheme(preferences.theme);
    }
  };

  // Función para cambiar tamaño de fuente
  const setFontSize = async (fontSize: 'small' | 'medium' | 'large') => {
    try {
      const newPreferences = { ...preferences, fontSize };

      // Aplicar cambio inmediatamente
      applyFontSize(fontSize);
      setPreferences(newPreferences);

      // Guardar en servidor
      await updatePreferences(newPreferences);
    } catch (error) {
      console.error('Error al cambiar tamaño de fuente:', error);
      // Revertir en caso de error
      applyFontSize(preferences.fontSize);
    }
  };

  // Función para actualizar preferencias
  const updatePreferences = async (newPreferences: UserPreferences) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Obtener UID del usuario actual
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) return;

      const userData = await userResponse.json();
      const userUid = userData.usuario.uid;

      // Actualizar preferencias en el servidor
      const response = await fetch(`/api/users/${userUid}/preferences`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferencias: newPreferences }),
      });

      if (response.ok) {
        setPreferences(newPreferences);
        console.log('Preferencias guardadas correctamente');
      } else {
        throw new Error('Error al guardar preferencias');
      }
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      throw error;
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    preferences,
    isDarkMode,
    setTheme,
    setFontSize,
    updatePreferences,
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
