import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface VisualIdentity {
  header_bg: string;
  header_text: string;
  sidebar_bg: string;
  sidebar_text: string;
  content_bg: string;
  content_text: string;
  color_primario: string;
  color_acento: string;
  tipografia: string;
  logoFile?: File | null;
  logoPreview?: string | null;
  permisos: {
    colores_header: boolean;
    colores_sidebar: boolean;
    colores_contenido: boolean;
    colores_marca: boolean;
    tipografia: boolean;
    logo: boolean;
  };
}

export interface CompanyConfig {
  nombre: string;
  tipoNegocio: string;
  zonaHoraria: string;
  identidad_visual: VisualIdentity;
}

interface CompanyConfigContextType {
  config: CompanyConfig;
  updateConfig: (newConfig: Partial<CompanyConfig>) => void;
  updateVisualIdentity: (newVisual: Partial<VisualIdentity>) => void;
  saveConfig: () => void;
  clearConfig: () => void;
  applyThemeColors: () => void;
}

const defaultConfig: CompanyConfig = {
  nombre: '',
  tipoNegocio: '',
  zonaHoraria: '',
  identidad_visual: {
    header_bg: '#ffffff',
    header_text: '#322f44',
    sidebar_bg: '#322f44',
    sidebar_text: '#ffffff',
    content_bg: '#f9fafb',
    content_text: '#1f2937',
    color_primario: '#4f46e5',
    color_acento: '#10b981',
    tipografia: 'Inter',
    logoFile: null,
    logoPreview: null,
    permisos: {
      colores_header: true,
      colores_sidebar: true,
      colores_contenido: true,
      colores_marca: false,
      tipografia: true,
      logo: false,
    },
  },
};

const CompanyConfigContext = createContext<CompanyConfigContextType | undefined>(undefined);

export const useCompanyConfig = () => {
  const context = useContext(CompanyConfigContext);
  if (!context) {
    throw new Error('useCompanyConfig must be used within a CompanyConfigProvider');
  }
  return context;
};

// Función para cargar configuración desde localStorage
const loadConfigFromStorage = (): CompanyConfig => {
  try {
    const savedData = localStorage.getItem('companyGeneralData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        ...parsedData,
        identidad_visual: {
          ...parsedData.identidad_visual,
          logoFile: null, // No guardamos File objects
        },
      };
    }
  } catch (error) {
    console.error('Error al cargar configuración desde localStorage:', error);
  }
  return defaultConfig;
};

// Función para guardar configuración en localStorage
const saveConfigToStorage = (config: CompanyConfig) => {
  try {
    const dataToSave = {
      ...config,
      identidad_visual: {
        ...config.identidad_visual,
        logoFile: null, // No guardamos File objects
      },
    };
    localStorage.setItem('companyGeneralData', JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error al guardar configuración en localStorage:', error);
  }
};

// Función para aplicar los colores del tema
const applyThemeColorsToDOM = (visual: VisualIdentity) => {
  document.documentElement.style.setProperty('--header-bg', visual.header_bg);
  document.documentElement.style.setProperty('--header-text', visual.header_text);
  document.documentElement.style.setProperty('--sidebar-bg', visual.sidebar_bg);
  document.documentElement.style.setProperty('--sidebar-text', visual.sidebar_text);
  document.documentElement.style.setProperty('--content-bg', visual.content_bg);
  document.documentElement.style.setProperty('--content-text', visual.content_text);
  document.documentElement.style.setProperty('--pri-600', visual.color_primario);
  document.documentElement.style.setProperty('--sec-600', visual.color_acento);

  let fontVar = '--font-inter';
  if (visual.tipografia === 'Roboto') fontVar = '--font-roboto';
  else if (visual.tipografia === 'Lato') fontVar = '--font-lato';
  else if (visual.tipografia === 'Poppins') fontVar = '--font-poppins';
  else if (visual.tipografia === 'Montserrat') fontVar = '--font-montserrat';
  else if (visual.tipografia === 'Open Sans') fontVar = '--font-open-sans';
  else if (visual.tipografia === 'Dancing Script') fontVar = '--font-dancing-script';
  else if (visual.tipografia === 'Oswald') fontVar = '--font-oswald';

  document.documentElement.style.setProperty('--font', `var(${fontVar})`);
};

export const CompanyConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CompanyConfig>(loadConfigFromStorage);

  // Aplicar tema al cargar el componente
  useEffect(() => {
    applyThemeColorsToDOM(config.identidad_visual);
  }, []);

  // Aplicar tema cuando cambia la identidad visual
  useEffect(() => {
    applyThemeColorsToDOM(config.identidad_visual);
  }, [config.identidad_visual]);

  // Auto-guardar cambios con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveConfigToStorage(config);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [config]);

  const updateConfig = useCallback((newConfig: Partial<CompanyConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const updateVisualIdentity = useCallback((newVisual: Partial<VisualIdentity>) => {
    setConfig((prev) => ({
      ...prev,
      identidad_visual: { ...prev.identidad_visual, ...newVisual },
    }));
  }, []);

  const saveConfig = useCallback(() => {
    saveConfigToStorage(config);
  }, [config]);

  const clearConfig = useCallback(() => {
    localStorage.removeItem('companyGeneralData');
    setConfig(defaultConfig);
  }, []);

  const applyThemeColors = useCallback(() => {
    applyThemeColorsToDOM(config.identidad_visual);
  }, [config.identidad_visual]);

  const contextValue: CompanyConfigContextType = {
    config,
    updateConfig,
    updateVisualIdentity,
    saveConfig,
    clearConfig,
    applyThemeColors,
  };

  return (
    <CompanyConfigContext.Provider value={contextValue}>{children}</CompanyConfigContext.Provider>
  );
};
