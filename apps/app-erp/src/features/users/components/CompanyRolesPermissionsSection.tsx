import { useState, useEffect } from 'react';
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [empresaId, setEmpresaId] = useState('');

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

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resUser = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resUser.ok) {
          const dataUser = await resUser.json();
          setEmpresaId(dataUser.usuario.empresa_id);
          const resRoles = await fetch(`/api/roles?empresa_id=${dataUser.usuario.empresa_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (resRoles.ok) {
            const dataRoles = await resRoles.json();
            setRoles(
              dataRoles.map((r: { rol_id: string; nombre_rol: string; permisos: string[] }) => ({
                id: r.rol_id,
                nombre: r.nombre_rol,
                permisos: Array.isArray(r.permisos) ? r.permisos : [],
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error obteniendo roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleSave = async () => {
    if (!formName.trim() || !empresaId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (editingRole) {
        const res = await fetch(`/api/roles/${editingRole.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre_rol: formName.trim(),
            permisos: formPerms,
          }),
        });
        if (res.ok) {
          setCreateEditOpen(false);
          resetForm();
          const resRoles = await fetch(`/api/roles?empresa_id=${empresaId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (resRoles.ok) {
            const dataRoles = await resRoles.json();
            setRoles(
              dataRoles.map((r: { rol_id: string; nombre_rol: string; permisos: string[] }) => ({
                id: r.rol_id,
                nombre: r.nombre_rol,
                permisos: Array.isArray(r.permisos) ? r.permisos : [],
              }))
            );
          }
        }
      } else {
        const res = await fetch('/api/roles', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            empresa_id: empresaId,
            nombre_rol: formName.trim(),
            permisos: formPerms,
            es_predeterminado: false,
            estado: 'activo',
          }),
        });
        if (res.ok) {
          setCreateEditOpen(false);
          resetForm();
          const resRoles = await fetch(`/api/roles?empresa_id=${empresaId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (resRoles.ok) {
            const dataRoles = await resRoles.json();
            setRoles(
              dataRoles.map((r: { rol_id: string; nombre_rol: string; permisos: string[] }) => ({
                id: r.rol_id,
                nombre: r.nombre_rol,
                permisos: Array.isArray(r.permisos) ? r.permisos : [],
              }))
            );
          }
        }
      }
    } catch {
      alert('Error al guardar el rol');
    }
  };

  const confirmDelete = (role: Role) => {
    setDeletingRole(role);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRole || !empresaId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/roles/${deletingRole.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        setDeleteOpen(false);
        setDeletingRole(null);
        const resRoles = await fetch(`/api/roles?empresa_id=${empresaId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resRoles.ok) {
          const dataRoles = await resRoles.json();
          setRoles(
            dataRoles.map((r: { rol_id: string; nombre_rol: string; permisos: string[] }) => ({
              id: r.rol_id,
              nombre: r.nombre_rol,
              permisos: Array.isArray(r.permisos) ? r.permisos : [],
            }))
          );
        }
      }
    } catch {
      alert('Error al eliminar el rol');
    }
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
      render: (_: unknown, row: Role) => (
        <span className='perm-count'>
          {row.permisos.length} permiso{row.permisos.length !== 1 ? 's' : ''}
        </span>
      ),
      width: '160px',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: unknown, row: Role) => (
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
