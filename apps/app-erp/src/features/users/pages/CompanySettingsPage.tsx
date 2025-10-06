import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import CompanyGeneralSection from '../components/CompanyGeneralSection';
import CompanyMembersSection from '../components/CompanyMembersSection';
import CompanyRolesPermissionsSection from '../components/CompanyRolesPermissionsSection';
import CompanyBillingSection from '../components/CompanyBillingSection';
import { currentCompany, getCurrentPlanInfo } from '../config/mockData';
import { getCompanyUsers } from '../../../services/userService';
import { validateTokenAndLogin } from '../../../services/authService';
import './CompanySettingsPage.css';
import type { JSX } from 'react';

interface TabDef {
  key: string;
  label: string;
  content: JSX.Element;
  hash: string;
}

const tabs: TabDef[] = [
  { key: 'general', label: 'General', content: <CompanyGeneralSection />, hash: 'general' },
  { key: 'members', label: 'Miembros', content: <CompanyMembersSection />, hash: 'miembros' },
  {
    key: 'roles',
    label: 'Roles y Permisos',
    content: <CompanyRolesPermissionsSection />,
    hash: 'roles-permisos',
  },
  {
    key: 'billing',
    label: 'Plan y Facturación',
    content: <CompanyBillingSection />,
    hash: 'plan-facturacion',
  },
];

function CompanySettingsPage() {
  const [companyData, setCompanyData] = useState(currentCompany);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getInitial = () => {
    const h = window.location.hash.replace('#', '');
    const found = tabs.find((t) => t.hash === h);
    return found?.key || 'general';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitial);

  useEffect(() => {
    const loadData = async () => {
      if (!currentCompany) {
        // Si no hay datos de empresa, validar token primero
        await validateTokenAndLogin();
      }

      setCompanyData(currentCompany);

      // Cargar usuarios de la empresa
      if (currentCompany?.id) {
        await loadCompanyUsers();
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadCompanyUsers = async () => {
    if (!currentCompany?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const users = await getCompanyUsers(currentCompany.id);
      setCompanyUsers(users);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const current = tabs.find((t) => t.key === activeTab);
    if (current) window.history.replaceState(null, '', `#${current.hash}`);
  }, [activeTab]);

  const onSelect = (key: string) => setActiveTab(key);

  const handleKeyNav = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = tabs.findIndex((t) => t.key === activeTab);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[next].key);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prev].key);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveTab(tabs[0].key);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveTab(tabs[tabs.length - 1].key);
      }
    },
    [activeTab]
  );

  const activeContent = tabs.find((t) => t.key === activeTab)?.content;

  const planInfo = companyData
    ? getCurrentPlanInfo(companyData.plan_id, companyUsers.length)
    : null;

  return (
    <div className='company-settings-page'>
      <TitleDescription
        title={`Configuración de ${companyData?.nombre || 'la Empresa'}`}
        description={`Administra la información, miembros y suscripción de tu ${companyData?.tipo_negocio || 'negocio'}`}
        titleSize={22}
        descriptionSize={13}
        titleWeight='semibold'
        descriptionWeight='light'
        spacing='.55rem'
        maxWidth='100%'
        className='settings-page-header'
      />

      {planInfo && (
        <div className='plan-summary'>
          <span className='plan-name'>{planInfo.name}</span>
          <span className='users-count'>
            {planInfo.currentUsers}/{planInfo.maxUsers} usuarios
          </span>
        </div>
      )}

      {loading ? (
        <div className='loading-indicator'>Cargando datos de la empresa...</div>
      ) : (
        <>
          <div
            className='settings-tabs'
            role='tablist'
            aria-label='Configuración Empresa'
            onKeyDown={handleKeyNav}
          >
            {tabs.map((t) => {
              const active = t.key === activeTab;
              return (
                <button
                  key={t.key}
                  role='tab'
                  type='button'
                  aria-selected={active}
                  aria-controls={`panel-${t.key}`}
                  id={`tab-${t.key}`}
                  tabIndex={active ? 0 : -1}
                  className={`settings-tab-btn ${active ? 'is-active' : ''}`}
                  onClick={() => onSelect(t.key)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div
            id={`panel-${activeTab}`}
            role='tabpanel'
            aria-labelledby={`tab-${activeTab}`}
            className='settings-tab-panel'
          >
            {activeContent}
          </div>
        </>
      )}
    </div>
  );
}

export default CompanySettingsPage;
