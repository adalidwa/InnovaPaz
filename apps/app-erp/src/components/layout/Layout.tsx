import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Sidebar.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='layout'>
      <Sidebar />
      <div className='layout__main'>
        <Header />
        <main className='layout__content'>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
