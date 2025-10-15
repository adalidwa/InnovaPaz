import { useState } from 'react';
import Movimientos from '../../../assets/images/movimiento.png';
import StatusTag from '../../../components/common/StatusTag';
import Button from '../../../components/common/Button';
import HistorialCompletoModal from './HistorialCompletoModal';
import type { ProductLegacy } from '../types/inventory';
import './RecentMovementsComponent.css';

interface RecentMovementsComponentProps {
  product: ProductLegacy;
}

function RecentMovementsComponent({ product }: RecentMovementsComponentProps) {
  const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false);

  const handleOpenHistorial = () => {
    setIsHistorialModalOpen(true);
  };

  const handleCloseHistorial = () => {
    setIsHistorialModalOpen(false);
  };

  // Generar movimientos simulados basados en el producto
  const generateMovements = () => {
    const movements = [];
    const names = ['Juan Pérez', 'María López', 'Carlos Silva', 'Ana Rodríguez'];
    const types = ['Compra', 'Venta', 'Restock', 'Ajuste'];

    for (let i = 0; i < 4; i++) {
      const isEntry = Math.random() > 0.6;
      const quantity = Math.floor(Math.random() * 20) + 1;
      const date = new Date();
      date.setDate(date.getDate() - i);

      movements.push({
        type: isEntry ? 'entry' : 'exit',
        quantity,
        date: date.toLocaleDateString('es-BO'),
        person: names[Math.floor(Math.random() * names.length)],
        operation: types[Math.floor(Math.random() * types.length)],
      });
    }

    return movements;
  };

  const movements = generateMovements();
  return (
    <div className='recent-movements-card'>
      <div className='movements-header'>
        <div className='movements-title-container'>
          <img src={Movimientos} alt='Movimientos' className='movements-icon' />
          <h3 className='movements-title'>Movimientos Recientes</h3>
        </div>
      </div>

      <div className='movements-content'>
        {movements.map((movement, index) => (
          <div key={index} className={`movement-item ${movement.type}`}>
            <div className='movement-indicator'>{movement.type === 'entry' ? '+' : '−'}</div>
            <div className='movement-details'>
              <div className='movement-main'>
                <span className='movement-type'>
                  {movement.type === 'entry' ? 'Entrada' : 'Salida'} - {movement.quantity} unidades
                </span>
                <StatusTag
                  text={movement.type === 'entry' ? 'Entrada' : 'Salida'}
                  backgroundColor={movement.type === 'entry' ? 'var(--sec-600)' : 'var(--pri-500)'}
                  textColor='var(--white)'
                  width={80}
                  height={24}
                />
              </div>
              <p className='movement-info'>
                {movement.date} | {movement.person} | {movement.operation}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className='movements-footer'>
        <Button variant='outline' size='medium' fullWidth onClick={handleOpenHistorial}>
          Ver Historial Completo
        </Button>
      </div>

      <HistorialCompletoModal
        isOpen={isHistorialModalOpen}
        onClose={handleCloseHistorial}
        product={product}
      />
    </div>
  );
}

export default RecentMovementsComponent;
