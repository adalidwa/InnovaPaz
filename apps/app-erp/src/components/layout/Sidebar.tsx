import React from 'react';
import './Sidebar.css';
import { useLocation } from 'react-router-dom';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  title: string;
  titleIcon: React.ComponentType<{ className?: string }>;
  menuItems: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ title, titleIcon: TitleIcon, menuItems }) => {
  const location = useLocation();

  return (
    <div className='sidebar'>
      <div className='sidebar__header'>
        <div className='sidebar__icon'>
          <TitleIcon />
        </div>
        <h2 className='sidebar__title'>{title}</h2>
      </div>

      <nav className='sidebar__menu'>
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <a
              key={index}
              href={item.href}
              className={`sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
            >
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
