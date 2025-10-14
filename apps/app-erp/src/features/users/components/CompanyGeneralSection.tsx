import React, { useCallback, useState } from 'react';
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
  // Usar el contexto global de configuración
  const { config, updateConfig, updateVisualIdentity, saveConfig, clearConfig } =
    useCompanyConfig();

  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateField = (key: keyof CompanyConfig, value: any) => {
    updateConfig({ [key]: value });
  };

  const updateVisual = (key: keyof VisualIdentity, value: any) => {
    updateVisualIdentity({ [key]: value });
  };

  const handleColorChange = (key: keyof VisualIdentity, value: string) => {
    updateVisual(key, value);
  };

  const handleLogo = (file?: File) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      updateVisual('logoPreview', e.target?.result as string);
    };
    reader.readAsDataURL(file);
    updateVisual('logoFile', file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleLogo(file);
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    onDrag(e);
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleLogo(file);
  };

  // Función para limpiar los datos guardados
  const clearStoredData = useCallback(() => {
    clearConfig();
    alert('Datos limpiados exitosamente');
  }, [clearConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Guardar usando el contexto
    saveConfig();

    // Simular proceso de guardado
    setTimeout(() => {
      setSaving(false);
      // Opcional: mostrar mensaje de éxito
      alert('¡Datos guardados exitosamente!');
    }, 800);
  };

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
              <div
                className={`logo-upload logo-upload--large ${dragActive ? 'logo-upload--drag' : ''} ${config.identidad_visual.logoPreview ? 'logo-upload--with-image' : ''}`}
                onDragEnter={onDrag}
                onDragOver={onDrag}
                onDragLeave={onDrag}
                onDrop={onDrop}
              >
                {config.identidad_visual.logoPreview ? (
                  <img
                    src={config.identidad_visual.logoPreview}
                    alt='Logo'
                    className='logo-preview-img logo-preview-img--large'
                  />
                ) : (
                  <div className='logo-upload-inner logo-upload-inner--large'>
                    <span className='logo-icon logo-icon--large'>⬆</span>
                    <p className='logo-text logo-text--large'>
                      Subir Logo
                      <br />
                      <small>JPG, PNG o SVG. Máx 2MB.</small>
                    </p>
                  </div>
                )}
                <input
                  type='file'
                  accept='.png,.jpg,.jpeg,.svg'
                  className='logo-file-input'
                  onChange={onFileInputChange}
                  aria-label='Seleccionar logo'
                />
              </div>
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
            <span style={{ fontSize: 12, color: '#888' }}>
              Recomendamos usar logos en PNG o SVG con fondo transparente para mejor apariencia.
              Tamaño máximo: 2MB.
            </span>
          </div>
        </div>
      </>

      <div className='company-actions'>
        <Button type='submit' variant='primary' size='medium' loading={saving}>
          Guardar Cambios
        </Button>
        <Button type='button' variant='secondary' size='medium' onClick={clearStoredData}>
          Limpiar Datos
        </Button>
      </div>
    </form>
  );
}

export default CompanyGeneralSection;
