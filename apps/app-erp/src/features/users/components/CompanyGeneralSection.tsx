import React, { useCallback, useState, useEffect } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { FiDroplet, FiBell, FiMenu, FiType, FiCircle } from 'react-icons/fi';
import {
  useCompanyConfig,
  type VisualIdentity,
  type CompanyConfig,
} from '../../../contexts/CompanyConfigContext';
import CompanyLogoUpload from './CompanyLogoUpload';
import { useUser } from '../hooks/useContextBase';
import './CompanyGeneralSection.css';

const businessTypeOptions = [
  { value: 'ferreteria', label: 'Ferretería' },
  { value: 'licoreria', label: 'Licorería' },
  { value: 'minimarket', label: 'Minimarket' },
];

const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Dancing Script', label: 'Dancing Script' },
  { value: 'Oswald', label: 'Oswald' },
];

function ColorSwatch({
  label,
  value,
  onChange,
  icon,
  help,
  active,
  ariaLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  help: string;
  active?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div className={`color-swatch${active ? ' color-swatch--active' : ''}`}>
      <label className='color-swatch-label'>
        <span className='color-swatch-icon'>{icon}</span>
        <input
          type='color'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='color-swatch-input'
          aria-label={ariaLabel || label}
        />
        <span
          className='color-swatch-circle'
          style={{ background: value, borderColor: active ? value : '#e5e7eb' }}
        />
      </label>
      <span className='color-swatch-name'>{label}</span>
      <span className='color-swatch-hex'>{value.toUpperCase()}</span>
      <span className='color-swatch-help'>{help}</span>
    </div>
  );
}

function CompanyGeneralSection() {
  const { config, updateConfig, updateVisualIdentity, setDefaultColors } = useCompanyConfig();
  const { user } = useUser();
  const empresaId = user?.empresa_id || '';
  const token = localStorage.getItem('token') || '';

  const [saving, setSaving] = useState(false);
  const [originalConfig, setOriginalConfig] = useState<CompanyConfig | null>(null);

  useEffect(() => {
    if (config && !originalConfig) {
      setOriginalConfig(config);
    }
  }, [config, originalConfig]);

  const updateField = (key: keyof CompanyConfig, value: string | number | boolean) => {
    updateConfig({ [key]: value });
  };

  const updateVisual = (
    key: keyof VisualIdentity,
    value: string | number | boolean | object | null
  ) => {
    updateVisualIdentity({ [key]: value });
  };

  const handleColorChange = (key: keyof VisualIdentity, value: string) => {
    updateVisual(key, value);
  };

  const handleLogoUploaded = (url: string) => {
    updateVisualIdentity({ logo_url: url, logoPreview: url });
  };

  useEffect(() => {
    const fetchEmpresaAndConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resUser = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resUser.ok) {
          const dataUser = await resUser.json();
          const empId = dataUser.usuario.empresa_id;
          const resEmpresa = await fetch(`/api/companies/${empId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (resEmpresa.ok) {
            const dataEmpresa = await resEmpresa.json();
            if (dataEmpresa.empresa?.ajustes) {
              let tipoNegocioValue = '';
              console.warn('Datos recibidos del backend:', dataEmpresa.empresa);
              if (dataEmpresa.empresa.tipoNegocio) {
                tipoNegocioValue = dataEmpresa.empresa.tipoNegocio;
              } else if (dataEmpresa.empresa.ajustes.tipoNegocio) {
                tipoNegocioValue = dataEmpresa.empresa.ajustes.tipoNegocio;
              } else if (dataEmpresa.empresa.ajustes.tipo_negocio) {
                tipoNegocioValue = dataEmpresa.empresa.ajustes.tipo_negocio;
              } else if (dataEmpresa.empresa.tipo_empresa_id) {
                switch (dataEmpresa.empresa.tipo_empresa_id) {
                  case 1:
                    tipoNegocioValue = 'ferreteria';
                    break;
                  case 2:
                    tipoNegocioValue = 'licoreria';
                    break;
                  case 3:
                    tipoNegocioValue = 'minimarket';
                    break;
                  default:
                    tipoNegocioValue = '';
                }
              }
              console.warn('Valor de tipoNegocio que se usará:', tipoNegocioValue);
              updateConfig({
                ...dataEmpresa.empresa.ajustes,
                nombre: dataEmpresa.empresa.ajustes.nombre || dataEmpresa.empresa.nombre || '',
                tipoNegocio: tipoNegocioValue,
              });
            }
          }
        }
      } catch {}
    };
    fetchEmpresaAndConfig();
  }, [updateConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !empresaId) return;

      let logoUrl = config.identidad_visual.logo_url || null;
      let logoPublicId = null;

      if (config.identidad_visual.logoFile) {
        const formData = new FormData();
        formData.append('logo', config.identidad_visual.logoFile);
        const resLogo = await fetch(`/api/companies/upload/logo/${empresaId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (resLogo.ok) {
          const data = await resLogo.json();
          logoUrl = data.logo_url;
          logoPublicId = data.logo_public_id;
          updateVisualIdentity({ logo_url: logoUrl, logoPreview: logoUrl });
        } else {
          alert('No se pudo subir el logo');
          setSaving(false);
          return;
        }
      }

      const configToSave = {
        ...config,
        identidad_visual: {
          ...config.identidad_visual,
          logoPreview: undefined,
          logoFile: undefined,
          logo_url: logoUrl,
        },
        logo_url: logoUrl,
        logo_public_id: logoPublicId || undefined,
      };
      console.warn('[FRONTEND] Enviando ajustes al backend:', configToSave);
      const res = await fetch(`/api/companies/${empresaId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ajustes: configToSave }),
      });
      if (res.ok) {
        alert('¡Datos guardados exitosamente!');
      } else {
        alert('No se pudo guardar la configuración');
      }
    } catch (error) {
      alert('Error de red al guardar configuración');
    }
    setSaving(false);
  };

  const undoChanges = useCallback(() => {
    if (originalConfig) {
      updateConfig(originalConfig);
      alert('Cambios no guardados revertidos');
    }
  }, [originalConfig, updateConfig]);

  const handleResetDefaults = useCallback(() => {
    if (
      window.confirm(
        '¿Seguro que deseas restablecer los valores por defecto? Se perderán tus personalizaciones.'
      )
    ) {
      setDefaultColors();
      alert('Valores por defecto restablecidos');
    }
  }, [setDefaultColors]);

  return (
    <form className='company-general-card' onSubmit={handleSubmit}>
      <TitleDescription
        title='Información de la Empresa'
        description='Actualiza los datos básicos de tu negocio'
        titleSize={18}
        descriptionSize={13}
        titleWeight='semibold'
        descriptionWeight='light'
        spacing='0.35rem'
        maxWidth='100%'
      />
      <>
        <Input
          label='Nombre de la Empresa'
          required
          placeholder='Mi Empresa'
          value={config.nombre}
          onChange={(e) => updateField('nombre', e.target.value)}
        />
        <Select
          label='Tipo de Negocio'
          required
          options={businessTypeOptions}
          value={config.tipoNegocio}
          onChange={(e) => updateField('tipoNegocio', e.target.value)}
          placeholder='Seleccionar tipo'
        />
      </>
      <>
        <TitleDescription
          title='Identidad Visual y Colores'
          description='Personaliza los colores principales, el logo y la tipografía de tu sistema.'
          titleSize={17}
          descriptionSize={13}
          titleWeight='semibold'
          descriptionWeight='light'
          spacing='0.18rem'
          maxWidth='100%'
        />
        <div className='visual-identity-row'>
          <section className='visual-identity-col visual-identity-col--colors'>
            <div className='visual-card'>
              <div className='visual-card-title'>Colores Corporativos</div>
              <div className='color-sections'>
                <div className='color-section'>
                  <h4 className='color-section-title'>Menú superior</h4>
                  <div className='color-swatches-row'>
                    <ColorSwatch
                      label='Fondo'
                      value={config.identidad_visual.header_bg}
                      onChange={(v) => handleColorChange('header_bg', v)}
                      icon={<FiCircle />}
                      help='Fondo del menú superior'
                    />
                    <ColorSwatch
                      label='Texto'
                      value={config.identidad_visual.header_text}
                      onChange={(v) => handleColorChange('header_text', v)}
                      icon={<FiType />}
                      help='Texto del menú superior'
                    />
                  </div>
                </div>
                <div className='color-section'>
                  <h4 className='color-section-title'>Menú lateral</h4>
                  <div className='color-swatches-row'>
                    <ColorSwatch
                      label='Fondo'
                      value={config.identidad_visual.sidebar_bg}
                      onChange={(v) => handleColorChange('sidebar_bg', v)}
                      icon={<FiMenu />}
                      help='Fondo del menú lateral'
                    />
                    <ColorSwatch
                      label='Texto'
                      value={config.identidad_visual.sidebar_text}
                      onChange={(v) => handleColorChange('sidebar_text', v)}
                      icon={<FiType />}
                      help='Texto del menú lateral'
                    />
                  </div>
                </div>
                <div className='color-section'>
                  <h4 className='color-section-title'>Area de trabajo</h4>
                  <div className='color-swatches-row'>
                    <ColorSwatch
                      label='Fondo'
                      value={config.identidad_visual.content_bg}
                      onChange={(v) => handleColorChange('content_bg', v)}
                      icon={<FiCircle />}
                      help='Fondo del contenido'
                    />
                    <ColorSwatch
                      label='Texto'
                      value={config.identidad_visual.content_text}
                      onChange={(v) => handleColorChange('content_text', v)}
                      icon={<FiType />}
                      help='Texto del contenido'
                    />
                  </div>
                </div>
                <div className='color-section'>
                  <h4 className='color-section-title'>Marca</h4>
                  <div className='color-swatches-row'>
                    <ColorSwatch
                      label='Botones principales'
                      value={config.identidad_visual.color_primario}
                      onChange={(v) => handleColorChange('color_primario', v)}
                      icon={<FiDroplet />}
                      help='Botones principales y enlaces'
                      active
                    />
                    <ColorSwatch
                      label='Acento'
                      value={config.identidad_visual.color_acento}
                      onChange={(v) => handleColorChange('color_acento', v)}
                      icon={<FiBell />}
                      help='Cambia el efecto, checks.'
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className='visual-identity-col visual-identity-col--logo'>
            <div className='visual-card'>
              <div className='visual-card-title'>Logo y Tipografía</div>
              <CompanyLogoUpload
                empresaId={empresaId}
                token={token}
                onUploaded={handleLogoUploaded}
              />
              <Select
                label='Tipografía Principal'
                options={fontOptions}
                value={config.identidad_visual.tipografia}
                onChange={(e) => {
                  updateVisual('tipografia', e.target.value);
                }}
                required
              />
              <div className='permissions-section'>
                <h4 className='permissions-title'>Permisos de Personalización</h4>
                <p className='permissions-description'>
                  Controla qué elementos pueden editar los otros miembros del equipo.
                </p>
                <div className='permissions-grid'>
                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={config.identidad_visual.permisos.colores_header}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...config.identidad_visual.permisos,
                          colores_header: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Colores del Header</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={config.identidad_visual.permisos.colores_sidebar}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...config.identidad_visual.permisos,
                          colores_sidebar: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Colores del Sidebar</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={config.identidad_visual.permisos.colores_contenido}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...config.identidad_visual.permisos,
                          colores_contenido: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Colores del Contenido</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={config.identidad_visual.permisos.colores_marca}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...config.identidad_visual.permisos,
                          colores_marca: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Colores de Marca</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={config.identidad_visual.permisos.tipografia}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...config.identidad_visual.permisos,
                          tipografia: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Tipografía</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={config.identidad_visual.permisos.logo}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...config.identidad_visual.permisos,
                          logo: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Logo de la Empresa</span>
                  </label>
                </div>
              </div>
            </div>
          </section>
          <div className='visual-identity-note visual-identity-note--modern'>
            <b>Nota:</b> Los cambios de colores, tipografía o logo afectan a toda la empresa.
            Algunos campos pueden estar bloqueados por motivos de seguridad o configuración interna.{' '}
            <br />
            <span className='visual-identity-note-hint'>
              Recomendamos usar logos en PNG o SVG con fondo transparente para mejor apariencia.
              Tamaño máximo: 2MB.
            </span>
          </div>
        </div>
      </>

      <div className='company-actions'>
        <div className='company-actions-main'>
          <Button type='submit' variant='primary' size='medium' loading={saving}>
            Guardar Cambios
          </Button>
          <span className='btn-help-text'>Aplica y guarda todos los cambios realizados.</span>
        </div>
        <div className='company-actions-secondary'>
          <div className='company-actions-secondary-item'>
            <Button type='button' variant='secondary' size='medium' onClick={undoChanges}>
              Deshacer cambios
            </Button>
            <span className='btn-help-text'>
              Revierte los cambios hechos en esta sesión antes de guardar.
            </span>
          </div>
          <div className='company-actions-secondary-item'>
            <Button type='button' variant='outline' size='medium' onClick={handleResetDefaults}>
              Restablecer valores
            </Button>
            <span className='btn-help-text'>Vuelve a los valores originales del sistema.</span>
          </div>
        </div>
      </div>
    </form>
  );
}

export default CompanyGeneralSection;
