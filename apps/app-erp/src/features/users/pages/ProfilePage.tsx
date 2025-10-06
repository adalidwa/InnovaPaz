import React, { useState, useEffect } from 'react';
import { IoPersonOutline, IoSettingsOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import PersonalInfoSection from '../components/PersonalInfoSection';
import PreferencesSection from '../components/PreferencesSection';
import SecuritySection from '../components/SecuritySection';
import { currentUser, currentCompany } from '../config/mockData';
import { validateTokenAndLogin } from '../../../services/authService';
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
  const [userData, setUserData] = useState(currentUser);
  const [companyData, setCompanyData] = useState(currentCompany);
  const [loading, setLoading] = useState(!currentUser);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setLoading(true);
        try {
          await validateTokenAndLogin();
          // Después de la validación, los datos estarán en currentUser y currentCompany
          setUserData(currentUser);
          setCompanyData(currentCompany);
        } catch (error) {
          console.error('Error cargando datos del usuario:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(currentUser);
        setCompanyData(currentCompany);
        setLoading(false);
      }
    };

    loadUserData();
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
