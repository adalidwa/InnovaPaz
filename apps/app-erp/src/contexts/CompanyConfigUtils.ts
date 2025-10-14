import type { CompanyConfig, VisualIdentity } from './CompanyConfigContext';

const defaultVisualIdentity: VisualIdentity = {
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
};

export const loadConfigFromBackend = async (
  empresaId: string,
  defaultConfig: CompanyConfig
): Promise<CompanyConfig> => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/companies/${empresaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      console.warn('loadConfigFromBackend - datos recibidos:', data);
      const ajustes = data.empresa.ajustes || defaultConfig;
      // Asegura que identidad_visual tenga todos los campos
      return {
        ...ajustes,
        identidad_visual: {
          ...defaultVisualIdentity,
          ...(ajustes.identidad_visual || {}),
        },
      };
    }
  } catch (error) {
    console.error('Error al cargar configuración desde backend:', error);
  }
  return defaultConfig;
};

export const prepareConfigForSave = (config: CompanyConfig): CompanyConfig => {
  const visual = { ...config.identidad_visual };
  if ('logoFile' in visual) {
    delete visual.logoFile;
  }
  console.warn('prepareConfigForSave - identidad_visual:', visual);
  return {
    ...config,
    identidad_visual: visual,
  };
};

export const saveConfigToBackend = async (empresaId: string, config: CompanyConfig) => {
  try {
    const token = localStorage.getItem('token');
    const configToSave = prepareConfigForSave(config);
    console.warn(
      'saveConfigToBackend - JSON enviado:',
      JSON.stringify({ ajustes: configToSave }, null, 2)
    );
    await fetch(`/api/companies/${empresaId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ajustes: configToSave }),
    });
  } catch (error) {
    console.error('Error al guardar configuración en backend:', error);
  }
};

export const applyThemeColorsToDOM = (visual: VisualIdentity) => {
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
