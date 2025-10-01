import React from 'react';
import './Header.css';
import { FaBell, FaCog, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ subtitle = 'Sistema' }) => {
  const navigate = useNavigate();

  const goToTeam = () => navigate('/configuracion/equipo');
  const goToProfile = () => navigate('/configuracion/perfil');

  return (
    <header className='header'>
      <div className='header__left'>
        <h1 className='header__logo'>INNOVAPAZ</h1>
        <span className='header__subtitle'>{subtitle}</span>
      </div>

      <div className='header__right'>
        <button className='header__icon-btn'>
          <span className='header__icon'>
            <FaBell />
          </span>
        </button>
        <button className='header__icon-btn' onClick={goToTeam} title='Configuración / Equipo'>
          <span className='header__icon'>
            <FaCog />
          </span>
        </button>
        <button className='header__icon-btn' onClick={goToProfile} title='Mi Perfil'>
          <span className='header__icon'>
            <FaUser />
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
