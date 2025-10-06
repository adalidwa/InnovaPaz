import React from 'react';
import './Sidebar.css';
import { useLocation } from 'react-router-dom';
import logoInnovaPaz from '../../assets/icons/logoInnovaPaz.svg';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  title: string;
  menuItems: SidebarItem[];
  logoUrl?: string;
  brandFooter?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  title,
  menuItems,
  logoUrl,
  brandFooter = 'INNOVAPAZ',
}) => {
  const location = useLocation();

  return (
    <div className='sidebar'>
      <div className='sidebar__top'>
        <div className='sidebar__company'>
          <div className='sidebar__company-logo-large'>
            <img
              src={logoUrl || logoInnovaPaz}
              alt='Logo empresa'
              className='sidebar__company-logo-img'
            />
          </div>
          <h1 className='sidebar__company-name'>{title}</h1>
        </div>

        <div className='sidebar__section-label'>Menú de tareas</div>
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

      <div className='sidebar__footer'>
        <div className='sidebar__brand-inline'>
          {(logoUrl || logoInnovaPaz) && (
            <img
              src={logoUrl || logoInnovaPaz}
              alt='Logo empresa'
              className='sidebar__brand-logo'
            />
          )}
          <span className='sidebar__brand-text'>{brandFooter}</span>
          <span className='sidebar__brand-copy'>© 2025</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
