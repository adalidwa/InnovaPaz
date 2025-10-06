import React, { useCallback, useState } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import { FiDroplet, FiBell, FiMenu, FiType, FiCircle } from 'react-icons/fi';
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

interface VisualIdentity {
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

interface FormState {
  nombre: string;
  tipoNegocio: string;
  zonaHoraria: string;
  identidad_visual: VisualIdentity;
}

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
  const [form, setForm] = useState<FormState>({
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
  });
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    applyThemeColors();
  }, [form.identidad_visual]);

  const updateField = (key: keyof FormState, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const updateVisual = (key: keyof VisualIdentity, value: any) =>
    setForm((p) => ({
      ...p,
      identidad_visual: { ...p.identidad_visual, [key]: value },
    }));

  function applyThemeColors() {
    const v = form.identidad_visual;
    document.documentElement.style.setProperty('--header-bg', v.header_bg);
    document.documentElement.style.setProperty('--header-text', v.header_text);
    document.documentElement.style.setProperty('--sidebar-bg', v.sidebar_bg);
    document.documentElement.style.setProperty('--sidebar-text', v.sidebar_text);
    document.documentElement.style.setProperty('--content-bg', v.content_bg);
    document.documentElement.style.setProperty('--content-text', v.content_text);
    document.documentElement.style.setProperty('--pri-600', v.color_primario);
    document.documentElement.style.setProperty('--sec-600', v.color_acento);
    let fontVar = '--font-inter';
    if (v.tipografia === 'Roboto') fontVar = '--font-roboto';
    else if (v.tipografia === 'Lato') fontVar = '--font-lato';
    else if (v.tipografia === 'Poppins') fontVar = '--font-poppins';
    else if (v.tipografia === 'Montserrat') fontVar = '--font-montserrat';
    else if (v.tipografia === 'Open Sans') fontVar = '--font-open-sans';
    else if (v.tipografia === 'Dancing Script') fontVar = '--font-dancing-script';
    else if (v.tipografia === 'Oswald') fontVar = '--font-oswald';
    document.documentElement.style.setProperty('--font', `var(${fontVar})`);
  }

  const handleColorChange = (key: keyof VisualIdentity, value: string) => {
    updateVisual(key, value);
    setTimeout(applyThemeColors, 0);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
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
          value={form.nombre}
          onChange={(e) => updateField('nombre', e.target.value)}
        />
        <Select
          label='Tipo de Negocio'
          required
          options={businessTypeOptions}
          value={form.tipoNegocio}
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
                      value={form.identidad_visual.header_bg}
                      onChange={(v) => handleColorChange('header_bg', v)}
                      icon={<FiCircle />}
                      help='Fondo del menú superior'
                    />
                    <ColorSwatch
                      label='Texto'
                      value={form.identidad_visual.header_text}
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
                      value={form.identidad_visual.sidebar_bg}
                      onChange={(v) => handleColorChange('sidebar_bg', v)}
                      icon={<FiMenu />}
                      help='Fondo del menú lateral'
                    />
                    <ColorSwatch
                      label='Texto'
                      value={form.identidad_visual.sidebar_text}
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
                      value={form.identidad_visual.content_bg}
                      onChange={(v) => handleColorChange('content_bg', v)}
                      icon={<FiCircle />}
                      help='Fondo del contenido'
                    />
                    <ColorSwatch
                      label='Texto'
                      value={form.identidad_visual.content_text}
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
                      value={form.identidad_visual.color_primario}
                      onChange={(v) => handleColorChange('color_primario', v)}
                      icon={<FiDroplet />}
                      help='Botones principales y enlaces'
                      active
                    />
                    <ColorSwatch
                      label='Acento'
                      value={form.identidad_visual.color_acento}
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
                className={`logo-upload logo-upload--large ${dragActive ? 'logo-upload--drag' : ''} ${form.identidad_visual.logoPreview ? 'logo-upload--with-image' : ''}`}
                onDragEnter={onDrag}
                onDragOver={onDrag}
                onDragLeave={onDrag}
                onDrop={onDrop}
              >
                {form.identidad_visual.logoPreview ? (
                  <img
                    src={form.identidad_visual.logoPreview}
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
                value={form.identidad_visual.tipografia}
                onChange={(e) => {
                  updateVisual('tipografia', e.target.value);
                  setTimeout(applyThemeColors, 0);
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
                      checked={form.identidad_visual.permisos.colores_header}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...form.identidad_visual.permisos,
                          colores_header: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Colores del Header</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={form.identidad_visual.permisos.colores_sidebar}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...form.identidad_visual.permisos,
                          colores_sidebar: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Colores del Sidebar</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={form.identidad_visual.permisos.colores_contenido}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...form.identidad_visual.permisos,
                          colores_contenido: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Colores del Contenido</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={form.identidad_visual.permisos.colores_marca}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...form.identidad_visual.permisos,
                          colores_marca: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Colores de Marca</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={form.identidad_visual.permisos.tipografia}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...form.identidad_visual.permisos,
                          tipografia: e.target.checked,
                        })
                      }
                    />
                    <span className='permission-label'>Tipografía</span>
                  </label>

                  <label className='permission-item'>
                    <input
                      type='checkbox'
                      checked={form.identidad_visual.permisos.logo}
                      onChange={(e) =>
                        updateVisual('permisos', {
                          ...form.identidad_visual.permisos,
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
      </div>
    </form>
  );
}

export default CompanyGeneralSection;
