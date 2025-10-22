import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Sidebar.css';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LayoutProps {
  children: React.ReactNode;
  sidebarTitle: string;
  sidebarTitleIcon: React.ComponentType<{ className?: string }>;
  sidebarMenuItems: SidebarItem[];
}

const Layout: React.FC<LayoutProps> = ({
  children,
  sidebarTitle,
  sidebarTitleIcon,
  sidebarMenuItems,
}) => {
  return (
    <div className='layout'>
      <Sidebar title={sidebarTitle} titleIcon={sidebarTitleIcon} menuItems={sidebarMenuItems} />
      <div className='layout__main'>
        <Header />
        <main className='layout__content'>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
