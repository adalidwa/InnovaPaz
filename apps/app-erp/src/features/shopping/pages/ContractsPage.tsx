import React, { useState, useMemo } from 'react';
import '../../../assets/styles/theme.css';
import './ContractsPage.css';
import TitleDescription from '../../../components/common/TitleDescription';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import {
  IoAdd,
  IoClose,
  IoDocumentText,
  IoTime,
  IoWarning,
  IoCheckmark,
  IoCloudUpload,
  IoRefresh,
  IoDocument,
} from 'react-icons/io5';
import dbData from '../data/db.json';

const pageInfo = {
  title: 'Gestión de Contratos y Acuerdos',
  description: 'Administra contratos comerciales con proveedores',
};

// Tipos TypeScript
interface Contract {
  id: number;
  title: string;
  description: string;
  providerId: number;
  providerName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  type: 'supply' | 'fixed_price' | 'framework';
  terms: {
    discount?: string;
    fixedPrice?: string;
    paymentTerm: string;
    description: string;
  };
  documentPath: string;
  renewalAlert: boolean;
  createdDate: string;
  daysUntilExpiry: number;
}

interface NewContractForm {
  providerId: string;
  type: string;
  startDate: string;
  endDate: string;
  terms: string;
  renewalAlert: boolean;
}

function ContractsPage() {
  // Estados principales
  const [contracts, setContracts] = useState<Contract[]>(
    (dbData.contracts as any[]).map((contract: any) => ({
      ...contract,
      status: contract.status as Contract['status'],
      type: contract.type as Contract['type'],
    }))
  );
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // Estado del formulario de nuevo contrato
  const [contractForm, setContractForm] = useState<NewContractForm>({
    providerId: '',
    type: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    terms: '',
    renewalAlert: true,
  });

  // Opciones para selects
  const providerOptions = dbData.providers.map((provider) => ({
    value: provider.id.toString(),
    label: provider.title,
  }));

  const contractTypeOptions = [
    { value: 'supply', label: 'Acuerdo de Suministro' },
    { value: 'fixed_price', label: 'Precios Fijos' },
    { value: 'framework', label: 'Contrato Marco' },
  ];

  // Funciones auxiliares
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-BO');
  };

  const getStatusInfo = (contract: Contract) => {
    if (contract.status === 'expired') {
      return {
        label: 'Por Vencer',
        className: 'status-expired',
        bgColor: 'var(--red-100)',
        textColor: 'var(--red-800)',
        badge: 'Vencido',
      };
    } else if (contract.daysUntilExpiry <= 30 && contract.daysUntilExpiry > 0) {
      return {
        label: 'Por Vencer',
        className: 'status-expiring',
        bgColor: 'var(--warning-100)',
        textColor: 'var(--warning-800)',
        badge: 'Por Vencer',
      };
    } else {
      return {
        label: 'Activo',
        className: 'status-active',
        bgColor: 'var(--sec-100)',
        textColor: 'var(--sec-800)',
        badge: 'Activo',
      };
    }
  };

  const getTypeLabel = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      supply: 'Suministro',
      fixed_price: 'Precio Fijo',
      framework: 'Marco',
    };
    return typeMap[type] || type;
  };

  // Handlers
  const showNotification = (type: 'success' | 'error' | 'warning', message: string): void => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFormChange = (field: keyof NewContractForm, value: string | boolean) => {
    setContractForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showNotification('error', 'El archivo no debe superar los 10MB');
        return;
      }
      // Validar tipo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        showNotification('error', 'Solo se permiten archivos PDF, DOC o DOCX');
        return;
      }
    }
    setSelectedFile(file);
  };

  const validateForm = (): string | null => {
    if (!contractForm.providerId) return 'Debe seleccionar un proveedor';
    if (!contractForm.type) return 'Debe seleccionar el tipo de acuerdo';
    if (!contractForm.startDate) return 'La fecha de inicio es obligatoria';
    if (!contractForm.endDate) return 'La fecha de vencimiento es obligatoria';
    if (!contractForm.terms.trim()) return 'Los términos del acuerdo son obligatorios';
    if (new Date(contractForm.endDate) <= new Date(contractForm.startDate)) {
      return 'La fecha de vencimiento debe ser posterior a la fecha de inicio';
    }
    return null;
  };

  const handleCreateContract = (): void => {
    const error = validateForm();
    if (error) {
      showNotification('error', error);
      return;
    }

    setIsLoading(true);

    // Simular creación de contrato
    setTimeout(() => {
      const provider = dbData.providers.find((p) => p.id.toString() === contractForm.providerId);
      const startDate = new Date(contractForm.startDate);
      const endDate = new Date(contractForm.endDate);
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const newContract: Contract = {
        id: Math.max(...contracts.map((c) => c.id)) + 1,
        title: `Contrato ${getTypeLabel(contractForm.type)} - ${provider?.title}`,
        description: `Acuerdo ${getTypeLabel(contractForm.type).toLowerCase()}`,
        providerId: parseInt(contractForm.providerId),
        providerName: provider?.title || '',
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        status: daysUntilExpiry > 0 ? 'active' : 'expired',
        type: contractForm.type as any,
        terms: {
          paymentTerm: '30 días',
          description: contractForm.terms,
        },
        documentPath: selectedFile ? `/contracts/${selectedFile.name}` : '',
        renewalAlert: contractForm.renewalAlert,
        createdDate: new Date().toISOString().split('T')[0],
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
      };

      setContracts((prev) => [newContract, ...prev]);
      setShowNewContractModal(false);
      setContractForm({
        providerId: '',
        type: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        terms: '',
        renewalAlert: true,
      });
      setSelectedFile(null);
      showNotification('success', 'Contrato creado exitosamente');
      setIsLoading(false);
    }, 1500);
  };

  const handleViewDocument = (contract: Contract): void => {
    setSelectedContract(contract);
    setShowDocumentModal(true);
  };

  const handleRenewContract = (contract: Contract): void => {
    setIsLoading(true);

    setTimeout(() => {
      // Simular renovación
      const today = new Date();
      const newEndDate = new Date(today.setFullYear(today.getFullYear() + 1));

      setContracts((prev) =>
        prev.map((c) =>
          c.id === contract.id
            ? {
                ...c,
                status: 'active' as const,
                endDate: newEndDate.toISOString().split('T')[0],
                daysUntilExpiry: 365,
              }
            : c
        )
      );

      showNotification('success', `Contrato ${contract.title} renovado por un año`);
      setIsLoading(false);
    }, 1000);
  };

  // Contratos separados por estado
  const activeContracts = contracts.filter((c) => c.status === 'active' && c.daysUntilExpiry > 30);
  const expiringContracts = contracts.filter(
    (c) => c.status === 'active' && c.daysUntilExpiry <= 30 && c.daysUntilExpiry > 0
  );
  const expiredContracts = contracts.filter(
    (c) => c.status === 'expired' || c.daysUntilExpiry <= 0
  );

  const renderContractCard = (contract: Contract) => {
    const statusInfo = getStatusInfo(contract);

    return (
      <div key={contract.id} className='contract-card'>
        <div className='contract-header'>
          <div className='contract-status'>
            <span
              className={`status-badge ${statusInfo.className}`}
              style={{
                backgroundColor: statusInfo.bgColor,
                color: statusInfo.textColor,
              }}
            >
              {statusInfo.badge}
            </span>
          </div>
        </div>

        <div className='contract-content'>
          <h3 className='contract-title'>{contract.title}</h3>
          <p className='contract-description'>{contract.description}</p>

          <div className='contract-details'>
            <div className='contract-row'>
              <span className='contract-label'>Vigencia:</span>
              <span className='contract-value'>
                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
              </span>
            </div>

            {contract.terms.discount && (
              <div className='contract-row'>
                <span className='contract-label'>Descuento:</span>
                <span className='contract-value'>{contract.terms.discount}</span>
              </div>
            )}

            {contract.terms.fixedPrice && (
              <div className='contract-row'>
                <span className='contract-label'>Precio Fijo:</span>
                <span className='contract-value'>{contract.terms.fixedPrice}</span>
              </div>
            )}

            <div className='contract-row'>
              <span className='contract-label'>Plazo de Pago:</span>
              <span className='contract-value'>{contract.terms.paymentTerm}</span>
            </div>

            <div className='contract-row'>
              <span className='contract-label'>Días hasta vencimiento:</span>
              <span
                className={`contract-value ${contract.daysUntilExpiry <= 0 ? 'expired' : contract.daysUntilExpiry <= 30 ? 'warning' : ''}`}
              >
                {contract.daysUntilExpiry <= 0
                  ? '0 días (Vencido)'
                  : `${contract.daysUntilExpiry} días`}
              </span>
            </div>
          </div>

          {contract.status === 'expired' || contract.daysUntilExpiry <= 0 ? (
            <div className='contract-warning'>
              <IoWarning /> Este contrato ha vencido. Considere renovarlo.
            </div>
          ) : null}
        </div>

        <div className='contract-actions'>
          {(contract.status === 'expired' || contract.daysUntilExpiry <= 30) && (
            <Button
              variant='warning'
              size='small'
              onClick={() => handleRenewContract(contract)}
              disabled={isLoading}
            >
              <IoRefresh /> Renovar Contrato
            </Button>
          )}
          <Button variant='secondary' size='small' onClick={() => handleViewDocument(contract)}>
            <IoDocumentText /> Ver Documento
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className='contracts-page'>
      {/* Notificación */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className='notification-content'>
            {notification.type === 'success' && <IoCheckmark />}
            {notification.type === 'error' && <IoWarning />}
            {notification.type === 'warning' && <IoWarning />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className='contracts-header'>
        <div className='contracts-title-section'>
          <TitleDescription
            title={pageInfo.title}
            description={pageInfo.description}
            titleSize={32}
            descriptionSize={16}
          />
          <Button
            variant='primary'
            onClick={() => setShowNewContractModal(true)}
            icon={<IoAdd />}
            disabled={isLoading}
          >
            Nuevo Contrato
          </Button>
        </div>
      </div>

      <div className='contracts-content'>
        {/* Contratos Activos */}
        {activeContracts.length > 0 && (
          <div className='contracts-section'>
            <div className='section-header'>
              <h3>Contratos Activos</h3>
            </div>
            <div className='contracts-grid'>{activeContracts.map(renderContractCard)}</div>
          </div>
        )}

        {/* Contratos por Vencer */}
        {expiringContracts.length > 0 && (
          <div className='contracts-section'>
            <div className='section-header'>
              <h3>Contratos por Vencer</h3>
            </div>
            <div className='contracts-grid'>{expiringContracts.map(renderContractCard)}</div>
          </div>
        )}

        {/* Contratos Vencidos */}
        {expiredContracts.length > 0 && (
          <div className='contracts-section'>
            <div className='section-header'>
              <h3>Contratos Vencidos</h3>
            </div>
            <div className='contracts-grid'>{expiredContracts.map(renderContractCard)}</div>
          </div>
        )}

        {contracts.length === 0 && (
          <div className='empty-state'>
            <IoDocumentText size={48} color='var(--pri-400)' />
            <h3>No hay contratos registrados</h3>
            <p>Haz clic en "Nuevo Contrato" para crear tu primer contrato.</p>
          </div>
        )}
      </div>

      {/* Modal Nuevo Contrato */}
      {showNewContractModal && (
        <div
          className='modal-overlay'
          onClick={(e) => e.target === e.currentTarget && setShowNewContractModal(false)}
        >
          <div className='contract-modal'>
            <div className='modal-header'>
              <h3>Crear Nuevo Contrato</h3>
              <button className='modal-close' onClick={() => setShowNewContractModal(false)}>
                <IoClose size={20} />
              </button>
            </div>

            <div className='modal-body'>
              <div className='form-row'>
                <div className='form-field'>
                  <label>Proveedor</label>
                  <Select
                    value={contractForm.providerId}
                    onChange={(e) => handleFormChange('providerId', e.target.value)}
                    options={providerOptions}
                    placeholder='Seleccionar proveedor...'
                    className='form-input'
                  />
                </div>
                <div className='form-field'>
                  <label>Tipo de Acuerdo</label>
                  <Select
                    value={contractForm.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    options={contractTypeOptions}
                    placeholder='Seleccionar tipo...'
                    className='form-input'
                  />
                </div>
              </div>

              <div className='form-row'>
                <div className='form-field'>
                  <label>Fecha de Inicio</label>
                  <Input
                    type='date'
                    value={contractForm.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                    className='form-input'
                  />
                </div>
                <div className='form-field'>
                  <label>Fecha de Vencimiento</label>
                  <Input
                    type='date'
                    value={contractForm.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    className='form-input'
                  />
                </div>
              </div>

              <div className='form-field full-width'>
                <label>Términos del Acuerdo</label>
                <textarea
                  value={contractForm.terms}
                  onChange={(e) => handleFormChange('terms', e.target.value)}
                  placeholder='Describe los términos del contrato...'
                  className='form-textarea'
                  rows={4}
                />
              </div>

              <div className='form-field full-width'>
                <label>Documento del Contrato</label>
                <div className='file-upload'>
                  <input
                    type='file'
                    id='contract-file'
                    accept='.pdf,.doc,.docx'
                    onChange={handleFileChange}
                    className='file-input'
                  />
                  <label htmlFor='contract-file' className='file-label'>
                    <IoCloudUpload size={24} />
                    {selectedFile
                      ? selectedFile.name
                      : 'Arrastra un archivo o haz clic para seleccionar'}
                  </label>
                  <div className='file-info'>PDF, DOC o DOCX (Máx. 10MB)</div>
                </div>
              </div>

              <div className='form-field full-width'>
                <label className='checkbox-label'>
                  <input
                    type='checkbox'
                    checked={contractForm.renewalAlert}
                    onChange={(e) => handleFormChange('renewalAlert', e.target.checked)}
                  />
                  Activar alertas de renovación (30 días antes)
                </label>
              </div>
            </div>

            <div className='modal-footer'>
              <div className='modal-buttons'>
                <Button
                  variant='secondary'
                  onClick={() => setShowNewContractModal(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button variant='primary' onClick={handleCreateContract} disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Contrato'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Documento */}
      {showDocumentModal && selectedContract && (
        <div
          className='modal-overlay'
          onClick={(e) => e.target === e.currentTarget && setShowDocumentModal(false)}
        >
          <div className='document-modal'>
            <div className='modal-header'>
              <h3>Documento del Contrato</h3>
              <button className='modal-close' onClick={() => setShowDocumentModal(false)}>
                <IoClose size={20} />
              </button>
            </div>

            <div className='modal-body'>
              <div className='document-info'>
                <div className='document-icon'>
                  <IoDocument size={48} color='var(--pri-600)' />
                </div>
                <div className='document-details'>
                  <h4>{selectedContract.title}</h4>
                  <p>{selectedContract.description}</p>
                  <div className='document-meta'>
                    <span>Archivo: {selectedContract.documentPath.split('/').pop()}</span>
                    <span>Proveedor: {selectedContract.providerName}</span>
                  </div>
                </div>
              </div>
              <div className='document-placeholder'>
                <p>Vista previa del documento no disponible</p>
                <p>El documento se abriría en una nueva ventana o se descargaría</p>
              </div>
            </div>

            <div className='modal-footer'>
              <div className='modal-buttons'>
                <Button variant='secondary' onClick={() => setShowDocumentModal(false)}>
                  Cerrar
                </Button>
                <Button
                  variant='primary'
                  onClick={() => showNotification('success', 'Documento descargado')}
                >
                  Descargar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractsPage;
