import { useCompanyConfig } from '../../../contexts/CompanyConfigContext';
import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import CompanyGeneralSection from '../components/CompanyGeneralSection';
import CompanyMembersSection from '../components/CompanyMembersSection';
import CompanyRolesPermissionsSection from '../components/CompanyRolesPermissionsSection';
import CompanyBillingSection from '../components/CompanyBillingSection';
import SubscriptionAlerts from '../components/SubscriptionAlerts';
import './CompanySettingsPage.css';
import type { JSX } from 'react';

interface TabDef {
  key: string;
  label: string;
  content: JSX.Element;
  hash: string;
}

interface CompanyData {
  id: string;
  nombre: string;
  tipo_negocio: string;
  plan_id: string;
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
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  const { updateConfig } = useCompanyConfig();

  useEffect(() => {
    if (companyData) {
      updateConfig({
        nombre: companyData.nombre,
        tipoNegocio: companyData.tipo_negocio,
      });
    }
  }, [companyData, updateConfig]);

  const getInitial = () => {
    const h = window.location.hash.replace('#', '');
    const found = tabs.find((t) => t.hash === h);
    return found?.key || 'general';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitial);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const resUser = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!resUser.ok) {
          setLoading(false);
          return;
        }
        const dataUser = await resUser.json();
        const empresaId = dataUser.usuario.empresa_id;

        const resCompany = await fetch(`/api/companies/${empresaId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resCompany.ok) {
          const dataCompany = await resCompany.json();

          if (dataCompany.empresa && dataCompany.empresa.ajustes) {
            setCompanyData({
              id: dataCompany.empresa.empresa_id || dataCompany.empresa.id,
              nombre: dataCompany.empresa.ajustes.nombre || dataCompany.empresa.nombre,
              tipo_negocio: dataCompany.empresa.ajustes.tipoNegocio || '',
              plan_id: dataCompany.empresa.plan_id || '',
            });
          }
        }
      } catch (error) {}
      setLoading(false);
    };
    loadData();
  }, []);

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

      {/* Alertas de suscripción */}
      <SubscriptionAlerts />

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
