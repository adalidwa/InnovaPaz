import React from 'react';
import './Sidebar.css';
import { sidebarConfig } from '../../config/sidebarConfig';
import { FaBox } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  return (
    <div className='sidebar'>
      <div className='sidebar__header'>
        <div className='sidebar__icon'>
          <FaBox />
        </div>
        <h2 className='sidebar__title'>Inventario</h2>
      </div>

      <nav className='sidebar__menu'>
        {sidebarConfig.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <a key={index} href={item.href} className='sidebar__item'>
              <IconComponent className='sidebar__item-icon' />
              <span className='sidebar__item-text'>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
