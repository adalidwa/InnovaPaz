import React, { useState, useRef, useEffect } from 'react';
import './Header.css';
import { FaBell } from 'react-icons/fa';
import { IoPersonOutline, IoLogOutOutline, IoChevronDownOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ subtitle = 'Sistema' }) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Datos simulados del usuario (esto vendría de un contexto o estado global)
  const userData = {
    name: 'Edison García',
    email: 'edison.garcia@innovapaz.com',
    role: 'Administrador',
    avatar: null,
  };

  // Función para obtener iniciales
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Cerrar dropdown al hacer click fuera
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
    navigate('/configuracion/perfil');
    setShowUserDropdown(false);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    // lógica de logout aquí
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

        {/* User Dropdown */}
        <div className='header__user-dropdown' ref={dropdownRef}>
          <button
            className='header__user-btn header__icon-btn--border'
            onClick={toggleUserDropdown}
            aria-expanded={showUserDropdown}
            aria-haspopup='true'
          >
            <div className='header__user-avatar'>
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className='header__avatar-image' />
              ) : (
                <div className='header__avatar-initials'>{getInitials(userData.name)}</div>
              )}
            </div>
            <div className='header__user-info'>
              <span className='header__user-name'>{userData.name}</span>
              <span className='header__user-role'>{userData.role}</span>
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
                  {userData.avatar ? (
                    <img
                      src={userData.avatar}
                      alt={userData.name}
                      className='header__dropdown-avatar-image'
                    />
                  ) : (
                    <div className='header__dropdown-avatar-initials'>
                      {getInitials(userData.name)}
                    </div>
                  )}
                </div>
                <div className='header__dropdown-user-info'>
                  <span className='header__dropdown-name'>{userData.name}</span>
                  <span className='header__dropdown-email'>{userData.email}</span>
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
