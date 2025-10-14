import { useState, useEffect } from 'react';
import { IoSunny, IoMoon, IoDesktop } from 'react-icons/io5';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import Modal from '../../../components/common/Modal';
import './PreferencesSection.css';

const themeOptions = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'auto', label: 'Automático' },
];

const languageOptions = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];

function PreferencesSection() {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'es',
  });
  const [userId, setUserId] = useState('');

  const [showModal, setShowModal] = useState(false);

  const handlePreferenceChange = (field: string, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.usuario.uid);
          if (data.usuario.preferencias) {
            setPreferences(data.usuario.preferencias);
          }
        }
      } catch {
        console.error('Error obteniendo usuario:');
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;
      const res = await fetch(`/api/users/${userId}/preferences`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferencias: preferences }),
      });
      if (res.ok) {
        setShowModal(true);
      } else {
        alert('No se pudo guardar las preferencias');
      }
    } catch (error) {
      alert('Error de red al guardar preferencias');
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
                className={`theme-option ${preferences.theme === option.value ? 'selected' : ''}`}
              >
                <input
                  type='radio'
                  name='theme'
                  value={option.value}
                  checked={preferences.theme === option.value}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
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
            <h3 className='preference-title'>Idioma</h3>
            <p className='preference-description'>Configura el idioma de la interfaz</p>
          </div>

          <div className='language-section'>
            <Select
              label=''
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              options={languageOptions}
              placeholder='Seleccionar idioma'
            />
          </div>
        </div>
      </div>

      <div className='preferences-actions'>
        <Button variant='primary' onClick={handleSave} size='medium'>
          Guardar Preferencias
        </Button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title='Preferencias Guardadas'
        message='Tus preferencias han sido actualizadas correctamente.'
        modalType='success'
        confirmButtonText='Aceptar'
      />
    </div>
  );
}

export default PreferencesSection;
