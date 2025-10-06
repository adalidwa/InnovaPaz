import {
  FaThLarge,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaExclamationTriangle,
  FaFileAlt,
  FaCog,
  FaUsers,
  FaMoneyBillWave,
  FaReceipt,
  FaCalculator,
  FaTruck,
  FaUserTie,
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
  inventario: {
    title: 'Inventario',
    titleIcon: FaBox,
    menuItems: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: FaThLarge,
      },
      {
        label: 'Productos',
        href: '/productos',
        icon: FaBox,
      },
      {
        label: 'Movimientos',
        href: '/movimientos',
        icon: FaShoppingCart,
      },
      {
        label: 'Reportes',
        href: '/reportes',
        icon: FaChartLine,
      },
      {
        label: 'Alertas',
        href: '/alertas',
        icon: FaExclamationTriangle,
      },
      {
        label: 'Documentos',
        href: '/documentos',
        icon: FaFileAlt,
      },
      {
        label: 'Configuración',
        href: '/configuracion/empresa',
        icon: FaCog,
      },
    ],
  },
  ventas: {
    title: 'Ventas',
    titleIcon: FaMoneyBillWave,
    menuItems: [
      {
        label: 'Dashboard',
        href: '/ventas/dashboard',
        icon: FaThLarge,
      },
      {
        label: 'Clientes',
        href: '/ventas/clientes',
        icon: FaUsers,
      },
      {
        label: 'Cotizaciones',
        href: '/ventas/cotizaciones',
        icon: FaReceipt,
      },
      {
        label: 'Facturación',
        href: '/ventas/facturacion',
        icon: FaCalculator,
      },
      {
        label: 'Pedidos',
        href: '/ventas/pedidos',
        icon: FaTruck,
      },
      {
        label: 'Vendedores',
        href: '/ventas/vendedores',
        icon: FaUserTie,
      },
      {
        label: 'Reportes',
        href: '/ventas/reportes',
        icon: FaChartLine,
      },
      {
        label: 'Configuración',
        href: '/ventas/configuracion/empresa',
        icon: FaCog,
      },
    ],
  },
};

export const getSidebarConfig = (module: string): SidebarConfig => {
  return sidebarConfigs[module] || sidebarConfigs.inventario;
};
