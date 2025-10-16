import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../../../components/common';
import { SalesService } from '../services/salesService';
import './ManageCategoriesModal.css';

interface Category {
  categoria_cliente_id: number;
  nombre: string;
  descuento_porcentaje: number;
  descripcion: string;
  estado: string;
}

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryChanged?: () => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  onCategoryChanged,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descuento_porcentaje: 0,
    descripcion: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await SalesService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ nombre: '', descuento_porcentaje: 0, descripcion: '' });
    setEditingId(null);
    setIsAddingNew(true);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      nombre: category.nombre,
      descuento_porcentaje: category.descuento_porcentaje,
      descripcion: category.descripcion || '',
    });
    setEditingId(category.categoria_cliente_id);
    setIsAddingNew(true);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ nombre: '', descuento_porcentaje: 0, descripcion: '' });
  };

  const handleSave = async () => {
    try {
      if (!formData.nombre.trim()) {
        alert('El nombre es requerido');
        return;
      }

      if (editingId) {
        await SalesService.updateCategory(editingId, formData);
      } else {
        await SalesService.createCategory(formData);
      }

      await loadCategories();
      handleCancel();
      onCategoryChanged?.();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleToggleStatus = async (categoryId: number, currentStatus: string) => {
    try {
      if (currentStatus === 'activo') {
        await SalesService.deactivateCategory(categoryId);
      } else {
        await SalesService.activateCategory(categoryId);
      }
      await loadCategories();
      onCategoryChanged?.();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado de la categoría');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Gestión de Categorías de Clientes'
      size='large'
      showCancelButton={false}
    >
      <div className='manage-categories-modal'>
        {/* Add Button */}
        <div className='manage-categories-modal__header'>
          <Button variant='primary' size='medium' onClick={handleAddNew} disabled={isAddingNew}>
            + Nueva Categoría
          </Button>
        </div>

        {/* Form for Add/Edit */}
        {isAddingNew && (
          <div className='manage-categories-modal__form'>
            <h3>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            <div className='manage-categories-modal__form-grid'>
              <div>
                <label>Nombre *</label>
                <Input
                  type='text'
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder='Ej: Cliente VIP'
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label>Descuento (%)</label>
                <Input
                  type='number'
                  value={formData.descuento_porcentaje.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, descuento_porcentaje: Number(e.target.value) })
                  }
                  min='0'
                  max='100'
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Descripción</label>
                <Input
                  type='text'
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder='Descripción de la categoría'
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className='manage-categories-modal__form-actions'>
              <Button variant='secondary' size='small' onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant='primary' size='small' onClick={handleSave}>
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className='manage-categories-modal__content'>
          {loading ? (
            <div className='manage-categories-modal__loading'>Cargando categorías...</div>
          ) : !categories || categories.length === 0 ? (
            <div className='manage-categories-modal__empty'>No hay categorías registradas</div>
          ) : (
            <div className='manage-categories-modal__list'>
              {categories.map((category) => (
                <div key={category.categoria_cliente_id} className='manage-categories-modal__item'>
                  <div className='manage-categories-modal__item-info'>
                    <div className='manage-categories-modal__item-name'>
                      {category.nombre}
                      <span
                        className={`manage-categories-modal__status ${category.estado === 'activo' ? 'active' : 'inactive'}`}
                      >
                        {category.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className='manage-categories-modal__item-details'>
                      <span>Descuento: {category.descuento_porcentaje}%</span>
                      {category.descripcion && <span>{category.descripcion}</span>}
                    </div>
                  </div>
                  <div className='manage-categories-modal__item-actions'>
                    <Button
                      variant='primary'
                      size='small'
                      onClick={() => handleEdit(category)}
                      disabled={isAddingNew}
                    >
                      Editar
                    </Button>
                    <Button
                      variant={category.estado === 'activo' ? 'danger' : 'success'}
                      size='small'
                      onClick={() =>
                        handleToggleStatus(category.categoria_cliente_id, category.estado)
                      }
                    >
                      {category.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='manage-categories-modal__footer'>
          <Button variant='secondary' size='medium' onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
