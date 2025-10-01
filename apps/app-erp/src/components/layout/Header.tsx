import React from 'react';
import './Header.css';
import { FaBell, FaCog, FaUser } from 'react-icons/fa';

const Header: React.FC = () => {
  return (
    <header className='header'>
      <div className='header__left'>
        <h1 className='header__logo'>INNOVAPAZ</h1>
        <span className='header__subtitle'>Ferretería</span>
      </div>

      <div className='header__right'>
        <button className='header__icon-btn'>
          <FaBell className='header__icon' />
        </button>
        <button className='header__icon-btn'>
          <FaCog className='header__icon' />
        </button>
        <button className='header__icon-btn'>
          <FaUser className='header__icon' />
        </button>
      </div>
    </header>
  );
};

export default Header;
