import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import logoInnovaPaz from '../../assets/icons/logoInnovaPaz.svg';
import { useCompanyConfig } from '../../contexts/CompanyConfigContext';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  title: string;
  titleIcon: React.ComponentType<{ className?: string }>;
  menuItems: SidebarItem[];
  logoUrl?: string;
  brandFooter?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems, logoUrl, brandFooter = 'INNOVAPAZ' }) => {
  const { config } = useCompanyConfig();
  const [empresaLogo, setEmpresaLogo] = useState<string | undefined>(logoUrl);

  useEffect(() => {
    if (config?.identidad_visual?.logo_url) {
      setEmpresaLogo(config.identidad_visual.logo_url);
    } else if (logoUrl) {
      setEmpresaLogo(logoUrl);
    } else {
      setEmpresaLogo(undefined);
    }
  }, [config?.identidad_visual?.logo_url, logoUrl]);

  return (
    <div className='sidebar'>
      <div className='sidebar__top'>
        <div className='sidebar__company'>
          <div className='sidebar__company-logo-large'>
            <img
              src={empresaLogo || logoInnovaPaz}
              alt='Logo empresa'
              className='sidebar__company-logo-img'
            />
          </div>
          <hr
            style={{
              width: '60%',
              margin: '0.5rem auto',
              border: 'none',
              borderTop: '2px solid #e5e7eb',
            }}
          />
          <h1 className='sidebar__company-name'>{config?.nombre || ''}</h1>
        </div>

        <div className='sidebar__section-label'>Menú de tareas</div>
        <nav className='sidebar__menu'>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={index}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
                }
                end
              >
                <IconComponent className='sidebar__item-icon' />
                <span className='sidebar__item-text'>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className='sidebar__footer'>
        <div className='sidebar__brand-inline'>
          <img src={logoInnovaPaz} alt='Logo empresa' className='sidebar__brand-logo' />
          <span className='sidebar__brand-text'>{brandFooter}</span>
          <span className='sidebar__brand-copy'>© 2025</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
