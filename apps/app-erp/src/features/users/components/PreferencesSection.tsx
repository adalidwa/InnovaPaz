import { useState } from 'react';
import { IoSunny, IoMoon, IoDesktop } from 'react-icons/io5';
import Select from '../../../components/common/Select';
import { useTheme } from '../../../contexts/ThemeContext';
import './PreferencesSection.css';

const themeOptions = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'auto', label: 'Automático' },
];

const fontSizeOptions = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
];

function PreferencesSection() {
  const { currentTheme, preferences, setTheme, setFontSize, loading: themeLoading } = useTheme();
  const [saving, setSaving] = useState(false);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      setSaving(true);
      await setTheme(newTheme);
    } catch (error) {
      console.error('Error cambiando tema:', error);
      alert('Error al cambiar el tema');
    } finally {
      setSaving(false);
    }
  };

  const handleFontSizeChange = async (newFontSize: 'small' | 'medium' | 'large') => {
    try {
      setSaving(true);
      await setFontSize(newFontSize);
    } catch (error) {
      console.error('Error cambiando tamaño de fuente:', error);
      alert('Error al cambiar el tamaño de fuente');
    } finally {
      setSaving(false);
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <IoSunny size={20} />;
      case 'dark':
        return <IoMoon size={20} />;
      case 'auto':
        return <IoDesktop size={20} />;
      default:
        return <IoSunny size={20} />;
    }
  };

  if (themeLoading) {
    return (
      <div className='preferences-section'>
        <div className='section-header'>
          <h2 className='section-title'>Cargando preferencias...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='preferences-section'>
      <div className='section-header'>
        <h2 className='section-title'>Preferencias</h2>
        <p className='section-subtitle'>Personaliza tu experiencia en la plataforma</p>
      </div>

      <div className='preferences-grid'>
        <div className='preference-card'>
          <div className='preference-card-header'>
            <h3 className='preference-title'>Apariencia</h3>
            <p className='preference-description'>Selecciona el tema de la interfaz</p>
          </div>

          <div className='theme-options'>
            {themeOptions.map((option) => (
              <label
                key={option.value}
                className={`theme-option ${currentTheme === option.value ? 'selected' : ''}`}
              >
                <input
                  type='radio'
                  name='theme'
                  value={option.value}
                  checked={currentTheme === option.value}
                  onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
                  disabled={saving}
                />
                <div className='theme-option-content'>
                  <div className='theme-icon'>{getThemeIcon(option.value)}</div>
                  <span className='theme-label'>{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className='preference-card'>
          <div className='preference-card-header'>
            <h3 className='preference-title'>Tamaño de Letra</h3>
            <p className='preference-description'>Ajusta el tamaño de fuente de la interfaz</p>
          </div>

          <div className='font-size-section'>
            <Select
              label=''
              value={preferences.fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value as 'small' | 'medium' | 'large')}
              options={fontSizeOptions}
              placeholder='Seleccionar tamaño'
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreferencesSection;
