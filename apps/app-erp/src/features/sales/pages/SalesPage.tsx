import React from 'react';
import { Input, TitleDescription } from '../../../components/common';
import { SalesCard } from '../components/SalesCard';
import { useSalesModules } from '../hooks/hooks';
import './SalesPage.css';

export const SalesPage: React.FC = () => {
  const { modules, searchTerm, getModuleQuantity, getModuleStatus, handleSearchChange } =
    useSalesModules();

  const handleModuleClick = (moduleRoute: string) => {
    if (moduleRoute) {
      // Aquí se podría implementar navegación a las diferentes secciones
      console.log(`Navigating to: /sales/${moduleRoute}`);
    }
  };

  return (
    <div className='sales-page'>
      <div className='sales-page-header'>
        <TitleDescription
          title='Gestión de Ventas'
          description='Administra tus ventas, clientes y productos de forma eficiente'
        />

        <div className='sales-page-controls'>
          <Input
            type='text'
            placeholder='Buscar módulos...'
            value={searchTerm}
            onChange={handleSearchChange}
            className='search-input'
          />
        </div>
      </div>

      <div className='sales-page-content'>
        {modules.length === 0 ? (
          <div className='no-modules'>
            <div className='no-modules-icon'>📋</div>
            <h3>No se encontraron módulos</h3>
            <p>No hay módulos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className='sales-modules-grid'>
            {modules.map((module) => (
              <SalesCard
                key={module.id}
                module={module}
                quantity={getModuleQuantity(module.id)}
                status={getModuleStatus(module)}
                onClick={() => handleModuleClick(module.route)}
              />
            ))}
          </div>
        )}
      </div>

      <div className='sales-page-stats'>
        <div className='stats-container'>
          <div className='stat-item'>
            <span className='stat-number'>{modules.filter((m) => m.isActive).length}</span>
            <span className='stat-label'>Módulos Activos</span>
          </div>
          <div className='stat-item'>
            <span className='stat-number'>
              {modules.filter((m) => m.priority === 'high').length}
            </span>
            <span className='stat-label'>Alta Prioridad</span>
          </div>
          <div className='stat-item'>
            <span className='stat-number'>
              {modules.reduce((sum, m) => sum + getModuleQuantity(m.id), 0)}
            </span>
            <span className='stat-label'>Total Registros</span>
          </div>
        </div>
      </div>
    </div>
  );
};
