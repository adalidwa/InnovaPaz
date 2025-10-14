import React, { useState, useEffect } from 'react';
import { IoPersonOutline, IoSettingsOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import PersonalInfoSection from '../components/PersonalInfoSection';
import PreferencesSection from '../components/PreferencesSection';
import SecuritySection from '../components/SecuritySection';
import './ProfilePage.css';

type TabType = 'personal' | 'preferences' | 'security';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'personal',
    label: 'Información Personal',
    icon: <IoPersonOutline size={20} />,
  },
  {
    id: 'preferences',
    label: 'Preferencias',
    icon: <IoSettingsOutline size={20} />,
  },
  {
    id: 'security',
    label: 'Seguridad',
    icon: <IoShieldCheckmarkOutline size={20} />,
  },
];

function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [userData, setUserData] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
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
        if (resUser.ok) {
          const dataUser = await resUser.json();
          setUserData(dataUser.usuario);
          const empresaId = dataUser.usuario.empresa_id;
          const resCompany = await fetch(`/api/companies/${empresaId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (resCompany.ok) {
            const dataCompany = await resCompany.json();
            setCompanyData(dataCompany);
          }
        }
      } catch (error) {}
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoSection />;
      case 'preferences':
        return <PreferencesSection />;
      case 'security':
        return <SecuritySection />;
      default:
        return <PersonalInfoSection />;
    }
  };

  if (loading) {
    return (
      <div className='profile-page'>
        <div className='profile-container'>
          <div className='loading-indicator'>Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='profile-page'>
      <div className='profile-container'>
        <div className='profile-header'>
          <h1 className='profile-title'>Mi Perfil</h1>
          <p className='profile-subtitle'>
            {userData
              ? `Hola ${userData.nombre_completo}`
              : 'Gestiona tu información personal y preferencias de cuenta'}
          </p>
          {companyData && userData && (
            <div className='profile-company-info'>
              <span className='company-name'>{companyData.nombre}</span>
              <span className='user-role'>{userData.rol}</span>
            </div>
          )}
        </div>

        <div className='profile-content'>
          <div className='profile-tabs'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className='profile-tab-icon'>{tab.icon}</span>
                <span className='profile-tab-label'>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className='profile-tab-content'>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
