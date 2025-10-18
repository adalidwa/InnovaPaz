import {
  FaThLarge,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaCog,
  FaMoneyBillWave,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

interface SidebarItem {
  label: string;
  href: string;
  icon: IconType;
}

interface SidebarConfig {
  title: string;
  titleIcon: IconType;
  menuItems: SidebarItem[];
}

export const sidebarConfigs: Record<string, SidebarConfig> = {
  dashboard: {
    title: 'Dashboard',
    titleIcon: FaThLarge,
    menuItems: [
      {
        label: 'Dashboard',
        href: '/app-erp/dashboard',
        icon: FaThLarge,
      },
      {
        label: 'Inventarios',
        href: '/app-erp/productos',
        icon: FaBox,
      },
      {
        label: 'Compras',
        href: '/app-erp/shopping',
        icon: FaShoppingCart,
      },
      {
        label: 'Ventas',
        href: '/app-erp/ventas',
        icon: FaMoneyBillWave,
      },
      {
        label: 'Reportes',
        href: '/app-erp/reportes',
        icon: FaChartLine,
      },
      {
        label: 'Configuración',
        href: '/app-erp/configuracion/empresa',
        icon: FaCog,
      },
    ],
  },
};

export const getSidebarConfig = (module: string): SidebarConfig => {
  return sidebarConfigs[module] || sidebarConfigs.dashboard;
};
