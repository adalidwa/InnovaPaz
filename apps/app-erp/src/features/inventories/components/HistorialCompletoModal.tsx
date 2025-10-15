import { useState, useMemo } from 'react';
import Button from '../../../components/common/Button';
import StatusTag from '../../../components/common/StatusTag';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { BiSearch } from 'react-icons/bi';
import type { ProductLegacy } from '../types/inventory';
import './HistorialCompletoModal.css';

interface Movement {
  id: string;
  type: 'entry' | 'exit';
  quantity: number;
  date: string;
  time: string;
  person: string;
  operation: string;
  details: string;
  balanceAfter: number;
}

interface HistorialCompletoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductLegacy;
}

function HistorialCompletoModal({ isOpen, onClose, product }: HistorialCompletoModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entry' | 'exit'>('all');
  const [filterOperation, setFilterOperation] = useState('all');

  // Generar historial completo simulado
  const generateCompleteHistory = (): Movement[] => {
    const movements: Movement[] = [];
    const names = [
      'Juan Pérez',
      'María López',
      'Carlos Silva',
      'Ana Rodríguez',
      'Pedro González',
      'Laura Martín',
    ];
    const operations = ['Compra', 'Venta', 'Restock', 'Ajuste', 'Devolución', 'Transferencia'];
    const details = [
      'Compra a proveedor',
      'Venta mostrador',
      'Reposición automática',
      'Ajuste por inventario',
      'Devolución cliente',
      'Transferencia sucursal',
      'Venta online',
      'Merma por vencimiento',
      'Corrección sistema',
    ];

    let currentBalance = product.stock;

    // Generar 30 movimientos simulados
    for (let i = 0; i < 30; i++) {
      const isEntry = Math.random() > 0.4;
      const quantity = Math.floor(Math.random() * 25) + 1;
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      if (isEntry) {
        currentBalance += quantity;
      } else {
        currentBalance = Math.max(0, currentBalance - quantity);
      }

      movements.push({
        id: `mov_${i + 1}`,
        type: isEntry ? 'entry' : 'exit',
        quantity,
        date: date.toLocaleDateString('es-BO'),
        time: date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
        person: names[Math.floor(Math.random() * names.length)],
        operation: operations[Math.floor(Math.random() * operations.length)],
        details: details[Math.floor(Math.random() * details.length)],
        balanceAfter: currentBalance,
      });
    }

    return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const allMovements = useMemo(() => generateCompleteHistory(), [product]);

  // Filtrar movimientos
  const filteredMovements = useMemo(() => {
    return allMovements.filter((movement) => {
      // Filtro por texto
      const matchesSearch =
        searchTerm === '' ||
        movement.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.details.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por tipo
      const matchesType = filterType === 'all' || movement.type === filterType;

      // Filtro por operación
      const matchesOperation = filterOperation === 'all' || movement.operation === filterOperation;

      return matchesSearch && matchesType && matchesOperation;
    });
  }, [allMovements, searchTerm, filterType, filterOperation]);

  const operationOptions = [
    { value: 'all', label: 'Todas las operaciones' },
    { value: 'Compra', label: 'Compra' },
    { value: 'Venta', label: 'Venta' },
    { value: 'Restock', label: 'Restock' },
    { value: 'Ajuste', label: 'Ajuste' },
    { value: 'Devolución', label: 'Devolución' },
    { value: 'Transferencia', label: 'Transferencia' },
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'entry', label: 'Solo entradas' },
    { value: 'exit', label: 'Solo salidas' },
  ];

  if (!isOpen) return null;

  return (
    <div className='historial-modal-overlay' onClick={onClose}>
      <div className='historial-modal-container' onClick={(e) => e.stopPropagation()}>
        <div className='historial-modal-header'>
          <div className='historial-title-section'>
            <h2 className='historial-modal-title'>Historial Completo</h2>
            <p className='historial-product-name'>
              {product.name} - {product.code}
            </p>
          </div>
          <button className='historial-modal-close' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='historial-filters'>
          <div className='historial-search'>
            <Input
              type='text'
              placeholder='Buscar por persona, operación o detalles...'
              leftIcon={<BiSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='historial-filter-row'>
            <Select
              placeholder='Tipo de movimiento'
              options={typeOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            />
            <Select
              placeholder='Tipo de operación'
              options={operationOptions}
              value={filterOperation}
              onChange={(e) => setFilterOperation(e.target.value)}
            />
          </div>
        </div>

        <div className='historial-content'>
          <div className='historial-stats'>
            <div className='stat-item'>
              <span className='stat-label'>Total movimientos:</span>
              <span className='stat-value'>{filteredMovements.length}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Entradas:</span>
              <span className='stat-value entry'>
                {filteredMovements.filter((m) => m.type === 'entry').length}
              </span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Salidas:</span>
              <span className='stat-value exit'>
                {filteredMovements.filter((m) => m.type === 'exit').length}
              </span>
            </div>
          </div>

          <div className='historial-list'>
            {filteredMovements.length === 0 ? (
              <div className='no-movements'>
                <p>No se encontraron movimientos que coincidan con los filtros.</p>
              </div>
            ) : (
              filteredMovements.map((movement) => (
                <div key={movement.id} className={`historial-movement-item ${movement.type}`}>
                  <div className='movement-indicator-large'>
                    {movement.type === 'entry' ? '+' : '−'}
                  </div>
                  <div className='movement-info-complete'>
                    <div className='movement-header-row'>
                      <div className='movement-main-info'>
                        <span className='movement-quantity'>
                          {movement.type === 'entry' ? '+' : '-'}
                          {movement.quantity} unidades
                        </span>
                        <StatusTag
                          text={movement.type === 'entry' ? 'Entrada' : 'Salida'}
                          backgroundColor={
                            movement.type === 'entry' ? 'var(--sec-600)' : 'var(--pri-500)'
                          }
                          textColor='var(--white)'
                          width={80}
                          height={20}
                        />
                      </div>
                      <div className='movement-balance'>Balance: {movement.balanceAfter}</div>
                    </div>
                    <div className='movement-details-row'>
                      <span className='movement-operation'>{movement.operation}</span>
                      <span className='movement-person'>por {movement.person}</span>
                    </div>
                    <div className='movement-meta-row'>
                      <span className='movement-datetime'>
                        {movement.date} - {movement.time}
                      </span>
                      <span className='movement-details-text'>{movement.details}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='historial-modal-footer'>
          <Button variant='primary' size='medium' onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HistorialCompletoModal;
