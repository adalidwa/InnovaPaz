import React from 'react';
import { useCompanyConfig } from '../../contexts/CompanyConfigContext';

const ThemeIndicator: React.FC = () => {
  const { config } = useCompanyConfig();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px',
        backgroundColor: 'var(--content-bg)',
        border: `2px solid var(--pri-600)`,
        borderRadius: '8px',
        fontSize: '12px',
        color: 'var(--content-text)',
        fontFamily: 'var(--font)',
        zIndex: 1000,
        maxWidth: '200px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🎨 Tema Activo</div>
      <div>Empresa: {config.nombre || 'Sin configurar'}</div>
      <div>Tipo: {config.tipoNegocio || 'Sin configurar'}</div>
      <div>Fuente: {config.identidad_visual.tipografia}</div>
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginTop: '4px',
          alignItems: 'center',
        }}
      >
        <div>Colores:</div>
        <div
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: config.identidad_visual.color_primario,
            borderRadius: '2px',
          }}
        ></div>
        <div
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: config.identidad_visual.color_acento,
            borderRadius: '2px',
          }}
        ></div>
      </div>
    </div>
  );
};

export default ThemeIndicator;
