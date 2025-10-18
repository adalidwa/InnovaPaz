import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import { FaBell } from 'react-icons/fa';
import { IoPersonOutline, IoLogOutOutline, IoChevronDownOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../features/users/hooks/useContextBase';

interface HeaderProps {
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ subtitle = 'Sistema' }) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useUser();
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Ya no necesitamos mapear - el backend envía directamente el nombre_rol
  const getRoleName = (roleName: string | undefined) => {
    return roleName || 'Sin rol';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const goToProfile = () => {
    navigate('/app-erp/configuracion/perfil');
    setShowUserDropdown(false);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    if (logout) logout();
    navigate('/login');
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <header className='header'>
      <div className='header__left'>
        <span className='header__subtitle header__subtitle--big'>{subtitle}</span>
      </div>

      <div className='header__right'>
        <button className='header__icon-btn header__icon-btn--border' title='Notificaciones'>
          <span className='header__icon'>
            <FaBell />
          </span>
        </button>

        <div className='header__user-dropdown' ref={dropdownRef}>
          <button
            className='header__user-btn header__icon-btn--border'
            onClick={toggleUserDropdown}
            aria-expanded={showUserDropdown}
            aria-haspopup='true'
          >
            <div className='header__user-avatar'>
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt='Avatar'
                  className='header__avatar-image'
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div className='header__avatar-initials'>
                  {getInitials(user?.nombre_completo || '')}
                </div>
              )}
            </div>
            <div className='header__user-info'>
              <span className='header__user-name'>{user?.nombre_completo}</span>
              <span className='header__user-role'>{getRoleName(user?.rol)}</span>
            </div>
            <IoChevronDownOutline
              className={`header__dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`}
              size={16}
            />
          </button>

          {showUserDropdown && (
            <div className='header__dropdown-menu'>
              <div className='header__dropdown-header'>
                <div className='header__dropdown-avatar'>
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt='Avatar'
                      className='header__avatar-image'
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div className='header__dropdown-avatar-initials'>
                      {getInitials(user?.nombre_completo || '')}
                    </div>
                  )}
                </div>
                <div className='header__dropdown-user-info'>
                  <span className='header__dropdown-name'>{user?.nombre_completo}</span>
                  <span className='header__dropdown-email'>{user?.email}</span>
                  <span className='header__dropdown-role'>{getRoleName(user?.rol)}</span>
                </div>
              </div>

              <div className='header__dropdown-divider'></div>

              <div className='header__dropdown-options'>
                <button className='header__dropdown-option' onClick={goToProfile}>
                  <IoPersonOutline size={18} />
                  <span>Ver mi perfil</span>
                </button>

                <button
                  className='header__dropdown-option header__dropdown-option--logout'
                  onClick={handleLogout}
                >
                  <IoLogOutOutline size={18} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
