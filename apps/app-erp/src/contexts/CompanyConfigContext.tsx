import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loadConfigFromBackend,
  saveConfigToBackend,
  applyThemeColorsToDOM,
  prepareConfigForSave,
} from './CompanyConfigUtils';

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
  logo_url?: string | null;
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
  setDefaultColors: () => void;
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

export const CompanyConfigProvider: React.FC<{ children: React.ReactNode; empresaId: string }> = ({
  children,
  empresaId,
}) => {
  const [config, setConfig] = useState<CompanyConfig>(defaultConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const cfg = await loadConfigFromBackend(empresaId, defaultConfig);
      setConfig(cfg);
      setIsLoaded(true);
      applyThemeColorsToDOM(cfg.identidad_visual);
    })();
  }, [empresaId]);

  useEffect(() => {
    applyThemeColorsToDOM(config.identidad_visual);
  }, [config.identidad_visual]);

  useEffect(() => {
    if (isLoaded) {
      saveConfigToBackend(empresaId, config);
    }
  }, [config.identidad_visual.tipografia, isLoaded, config, empresaId]);

  useEffect(() => {
    console.warn('CompanyConfigProvider - config actual:', config);
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
    const cleanedConfig = prepareConfigForSave(config);
    saveConfigToBackend(empresaId, cleanedConfig);
  }, [empresaId, config]);

  const clearConfig = useCallback(() => {
    const cleanedDefault = prepareConfigForSave(defaultConfig);
    setConfig(cleanedDefault);
    saveConfigToBackend(empresaId, cleanedDefault);
  }, [empresaId]);

  const applyThemeColors = useCallback(() => {
    applyThemeColorsToDOM(config.identidad_visual);
  }, [config.identidad_visual]);

  const setDefaultColors = useCallback(() => {
    const cleanedDefault = prepareConfigForSave({
      ...config,
      identidad_visual: { ...defaultConfig.identidad_visual },
    });
    setConfig((prev) => ({
      ...prev,
      identidad_visual: { ...defaultConfig.identidad_visual },
    }));
    applyThemeColorsToDOM(defaultConfig.identidad_visual);
    saveConfigToBackend(empresaId, cleanedDefault);
  }, [empresaId, config]);

  const contextValue: CompanyConfigContextType = {
    config,
    updateConfig,
    updateVisualIdentity,
    saveConfig,
    clearConfig,
    applyThemeColors,
    setDefaultColors,
  };

  return (
    <CompanyConfigContext.Provider value={contextValue}>{children}</CompanyConfigContext.Provider>
  );
};
