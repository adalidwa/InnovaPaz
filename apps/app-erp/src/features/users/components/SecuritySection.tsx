import './SecuritySection.css';
import { useState } from 'react';
import { IoLockClosed, IoKey } from 'react-icons/io5';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { changeUserPassword } from '../services/authService';

function SecuritySection() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
  }>({
    type: 'success',
    title: '',
    message: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async () => {
    // Validaciones
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setModalConfig({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Por favor completa todos los campos para cambiar tu contraseña.',
      });
      setShowModal(true);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setModalConfig({
        type: 'error',
        title: 'Error de validación',
        message: 'Las contraseñas nuevas no coinciden. Verifica e intenta nuevamente.',
      });
      setShowModal(true);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setModalConfig({
        type: 'warning',
        title: 'Contraseña débil',
        message: 'La nueva contraseña debe tener al menos 8 caracteres.',
      });
      setShowModal(true);
      return;
    }

    // Cambiar contraseña en Firebase
    setIsLoading(true);
    try {
      const result = await changeUserPassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.ok) {
        setModalConfig({
          type: 'success',
          title: 'Contraseña Actualizada',
          message: 'Tu contraseña ha sido cambiada exitosamente.',
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setModalConfig({
          type: 'error',
          title: 'Error al cambiar contraseña',
          message: result.error || 'No se pudo cambiar la contraseña.',
        });
      }
    } catch (error: any) {
      setModalConfig({
        type: 'error',
        title: 'Error inesperado',
        message: error.message || 'Ocurrió un error al cambiar la contraseña.',
      });
    } finally {
      setIsLoading(false);
      setShowModal(true);
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    return Math.min(score, 100);
  };

  const getStrengthText = (score: number) => {
    if (score < 30) return 'Muy débil';
    if (score < 50) return 'Débil';
    if (score < 70) return 'Buena';
    if (score < 90) return 'Fuerte';
    return 'Muy fuerte';
  };

  const getStrengthColor = (score: number) => {
    if (score < 30) return 'var(--acc-600)';
    if (score < 50) return 'var(--var-600)';
    if (score < 70) return 'var(--var-500)';
    if (score < 90) return 'var(--sec-600)';
    return 'var(--sec-700)';
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div className='security-section'>
      <div className='section-header'>
        <h2 className='section-title'>Seguridad</h2>
        <p className='section-subtitle'>Gestiona la seguridad de tu cuenta</p>
      </div>

      <div className='security-content'>
        <div className='security-group'>
          <div className='security-group-header'>
            <div className='security-icon'>
              <IoLockClosed size={24} />
            </div>
            <div>
              <h3 className='security-group-title'>Contraseña</h3>
              <p className='security-group-subtitle'>
                Mantén tu cuenta segura con una contraseña fuerte
              </p>
            </div>
          </div>

          <div className='password-form'>
            <div className='password-fields'>
              <div className='form-field'>
                <Input
                  label='Contraseña Actual'
                  type='password'
                  value={passwordData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder='Ingresa tu contraseña actual'
                  required
                />
                <div className='field-hint'>
                  Necesitamos verificar tu identidad antes de cambiar la contraseña
                </div>
              </div>

              <div className='form-field'>
                <Input
                  label='Nueva Contraseña'
                  type='password'
                  value={passwordData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder='Ingresa tu nueva contraseña'
                  required
                />

                {passwordData.newPassword && (
                  <div className='password-strength'>
                    <div className='password-strength-bar'>
                      <div
                        className='password-strength-fill'
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor(passwordStrength),
                        }}
                      />
                    </div>
                    <div className='password-strength-text'>
                      <span
                        className='strength-label'
                        style={{ color: getStrengthColor(passwordStrength) }}
                      >
                        {getStrengthText(passwordStrength)}
                      </span>
                      <span className='strength-score'>{passwordStrength}%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className='form-field'>
                <Input
                  label='Confirmar Nueva Contraseña'
                  type='password'
                  value={passwordData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder='Confirma tu nueva contraseña'
                  required
                />
                {passwordData.confirmPassword && (
                  <div
                    className={`password-match ${passwordData.newPassword === passwordData.confirmPassword ? 'match' : 'no-match'}`}
                  >
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <span>✓ Las contraseñas coinciden</span>
                    ) : (
                      <span>✗ Las contraseñas no coinciden</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className='password-requirements'>
              <h4 className='requirements-title'>Requisitos de contraseña:</h4>
              <ul className='requirements-list'>
                <li className={passwordData.newPassword.length >= 8 ? 'valid' : ''}>
                  Mínimo 8 caracteres
                </li>
                <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                  Al menos una letra mayúscula
                </li>
                <li className={/[a-z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                  Al menos una letra minúscula
                </li>
                <li className={/\d/.test(passwordData.newPassword) ? 'valid' : ''}>
                  Al menos un número
                </li>
              </ul>
            </div>
          </div>

          <div className='form-actions'>
            <Button
              variant='primary'
              onClick={handleChangePassword}
              size='medium'
              icon={<IoKey />}
              disabled={isLoading}
            >
              {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        modalType={modalConfig.type}
        confirmButtonText='Aceptar'
      />
    </div>
  );
}

export default SecuritySection;
