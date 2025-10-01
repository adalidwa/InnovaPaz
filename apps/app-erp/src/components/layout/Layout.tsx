import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Sidebar.css';

interface LayoutProps {
  children: React.ReactNode;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, subtitle = 'Ferretería' }) => {
  return (
    <div className='layout'>
      <Sidebar />
      <div className='layout__main'>
        <Header subtitle={subtitle} />
        <main className='layout__content'>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
