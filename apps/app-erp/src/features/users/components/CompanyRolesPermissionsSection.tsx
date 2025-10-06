import { useState } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Table, { type TableColumn } from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './CompanyRolesPermissionsSection.css';

interface Role {
  id: string;
  nombre: string;
  permisos: string[];
}

const AVAILABLE_PERMISSIONS: { code: string; label: string; group?: string }[] = [
  { code: 'users.read', label: 'Ver Usuarios' },
  { code: 'users.write', label: 'Gestionar Usuarios' },
  { code: 'inventory.read', label: 'Ver Inventario' },
  { code: 'inventory.write', label: 'Gestionar Inventario' },
  { code: 'sales.read', label: 'Ver Ventas' },
  { code: 'sales.write', label: 'Crear / Editar Ventas' },
  { code: 'reports.read', label: 'Ver Reportes' },
  { code: 'config.write', label: 'Configurar Sistema' },
];

function CompanyRolesPermissionsSection() {
  const [roles, setRoles] = useState<Role[]>([
    { id: '1', nombre: 'Administrador', permisos: AVAILABLE_PERMISSIONS.map((p) => p.code) },
    {
      id: '2',
      nombre: 'Vendedor',
      permisos: ['sales.read', 'sales.write', 'inventory.read', 'users.read'],
    },
  ]);

  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formName, setFormName] = useState('');
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormPerms([]);
    setEditingRole(null);
  };

  const openCreate = () => {
    resetForm();
    setCreateEditOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormName(role.nombre);
    setFormPerms(role.permisos);
    setCreateEditOpen(true);
  };

  const togglePerm = (code: string) => {
    setFormPerms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id ? { ...r, nombre: formName.trim(), permisos: formPerms } : r
        )
      );
    } else {
      setRoles((prev) => [
        ...prev,
        { id: Date.now().toString(), nombre: formName.trim(), permisos: formPerms },
      ]);
    }
    setCreateEditOpen(false);
    resetForm();
  };

  const confirmDelete = (role: Role) => {
    setDeletingRole(role);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (deletingRole) {
      setRoles((prev) => prev.filter((r) => r.id !== deletingRole.id));
    }
    setDeleteOpen(false);
    setDeletingRole(null);
  };

  const columns: TableColumn<Role>[] = [
    {
      key: 'nombre',
      header: 'Nombre del Rol',
      render: (v: string) => <span className='role-name-cell'>{v}</span>,
    },
    {
      key: 'permisos',
      header: 'Permisos Activos',
      render: (_: any, row) => (
        <span className='perm-count'>
          {row.permisos.length} permiso{row.permisos.length !== 1 ? 's' : ''}
        </span>
      ),
      width: '160px',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: any, row) => (
        <div className='roles-actions'>
          <button
            type='button'
            className='role-icon-btn role-icon-btn--edit'
            aria-label={`Editar rol ${row.nombre}`}
            onClick={() => openEdit(row)}
          >
            <FiEdit2 size={15} />
          </button>
          <button
            type='button'
            className='role-icon-btn role-icon-btn--delete'
            aria-label={`Eliminar rol ${row.nombre}`}
            onClick={() => confirmDelete(row)}
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
      width: '110px',
      className: 'roles-col-actions',
    },
  ];

  return (
    <div className='company-roles-card'>
      <div className='roles-header-line'>
        <TitleDescription
          title='Roles y Permisos'
          description='Define qué puede hacer cada tipo de miembro'
          titleSize={16}
          descriptionSize={12}
          titleWeight='semibold'
          descriptionWeight='light'
          spacing='.35rem'
          maxWidth='100%'
        />
        <Button variant='primary' size='medium' icon={<FiPlus size={16} />} onClick={openCreate}>
          Crear Rol
        </Button>
      </div>

      <Table<Role>
        data={roles}
        columns={columns}
        emptyMessage='Sin roles'
        className='roles-table'
        rowClassName={(row) =>
          editingRole && row.id === editingRole.id ? 'table-row--active' : ''
        }
      />

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={createEditOpen}
        onClose={() => {
          setCreateEditOpen(false);
          resetForm();
        }}
        title={editingRole ? 'Editar Rol' : 'Crear Rol'}
        message=''
        showCancelButton
        cancelButtonText='Cerrar'
        showConfirmButton={false}
        modalType='info'
        size='large'
      >
        <div className='role-form'>
          <Input
            label='Nombre del Rol'
            placeholder='Ej: Supervisor'
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className='permissions-block'>
            <span className='permissions-block-title'>
              Permisos ({formPerms.length} seleccionados)
            </span>
            <div className='permissions-list'>
              {AVAILABLE_PERMISSIONS.map((p) => {
                const active = formPerms.includes(p.code);
                return (
                  <label key={p.code} className={`perm-item ${active ? 'perm-item--active' : ''}`}>
                    <input type='checkbox' checked={active} onChange={() => togglePerm(p.code)} />
                    <span className='perm-label'>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className='role-form-actions'>
            <Button
              variant='primary'
              size='medium'
              onClick={handleSave}
              disabled={!formName.trim()}
            >
              {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title='Eliminar Rol'
        message={`¿Seguro que deseas eliminar el rol "${deletingRole?.nombre}"? Esta acción no se puede deshacer.`}
        modalType='warning'
        showConfirmButton
        confirmButtonText='Eliminar'
        showCancelButton
        cancelButtonText='Cancelar'
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

export default CompanyRolesPermissionsSection;
