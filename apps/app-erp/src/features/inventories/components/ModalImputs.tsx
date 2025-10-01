import React from 'react';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import './ModalImputs.css';

function ModalImputs() {
  const categorias = [
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'alimentos', label: 'Alimentos' },
    { value: 'limpieza', label: 'Limpieza' },
  ];

  return (
    <div className='modal-form'>
      <div className='form-row'>
        <Input label='Nombre del Producto' required placeholder='Ej: Coca Cola 500ml' />
        <Input label='Código del Producto' required placeholder='Ej: COC500' />
      </div>

      <Select label='Categoría' required placeholder='Seleccionar categoría' options={categorias} />

      <Input label='Descripción' placeholder='Descripción del producto...' />

      <div className='form-row'>
        <Input label='Precio de Venta (Bs.)' required type='number' placeholder='0.00' />
        <Input label='Costo (Bs.)' required type='number' placeholder='0.00' />
      </div>

      <div className='form-row'>
        <Input label='Stock Inicial' required type='number' placeholder='0' />
        <Input label='Stock Mínimo' required type='number' placeholder='0' />
      </div>

      <div className='form-section'>
        <h4 className='section-title'>Campos Específicos - Minimarket</h4>

        <div className='form-row'>
          <Input label='Fecha de Vencimiento' type='date' />
          <Input label='Lote' placeholder='Ej: LOT2024001' />
        </div>
      </div>

      <div className='form-actions'>
        <Button variant='secondary' size='medium'>
          Cancelar
        </Button>
        <Button variant='primary' size='medium'>
          Guardar Producto
        </Button>
      </div>
    </div>
  );
}

export default ModalImputs;
