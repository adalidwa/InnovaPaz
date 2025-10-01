import {
  FaThLarge,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaExclamationTriangle,
  FaFileAlt,
  FaCog,
} from 'react-icons/fa';
import sidebarData from './sidebarConfig.json';

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType;
}

const iconMap: Record<string, React.ComponentType> = {
  FaThLarge,
  FaBox,
  FaShoppingCart,
  FaChartLine,
  FaExclamationTriangle,
  FaFileAlt,
  FaCog,
};

export const sidebarConfig: SidebarItem[] = sidebarData.map((item: any) => ({
  label: item.label,
  href: '/' + item.value,
  icon: iconMap[item.iconName],
}));
