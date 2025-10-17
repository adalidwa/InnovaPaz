import { useState, useEffect } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Table, { type TableColumn } from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import { FiPlus, FiEdit2, FiTrash2, FiLock } from 'react-icons/fi';
import './CompanyRolesPermissionsSection.css';
import {
  getRolesByEmpresa,
  createRol,
  updateRol,
  deleteRol,
  getRolesStats,
  type Rol,
  type RolStats,
} from '../services/rolesService';

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
  const [roles, setRoles] = useState<Rol[]>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [stats, setStats] = useState<RolStats | null>(null);
  const [loading, setLoading] = useState(false);

  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Rol | null>(null);
  const [formName, setFormName] = useState('');
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [deletingRole, setDeletingRole] = useState<Rol | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormPerms([]);
    setEditingRole(null);
  };

  const openCreate = () => {
    resetForm();
    setCreateEditOpen(true);
  };

  const openEdit = (role: Rol) => {
    if (role.es_predeterminado) {
      alert('No puedes editar roles predeterminados del sistema');
      return;
    }
    setEditingRole(role);
    setFormName(role.nombre_rol);
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
      setLoading(true);
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
          const empId = dataUser.usuario.empresa_id;
          setEmpresaId(empId);

          const rolesData = await getRolesByEmpresa(empId, token);
          setRoles(rolesData);

          const statsData = await getRolesStats(empId, token);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error al cargar roles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleSave = async () => {
    if (!formName.trim() || !empresaId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      if (editingRole) {
        await updateRol(editingRole.rol_id, formName.trim(), formPerms, token);
      } else {
        await createRol(empresaId, formName.trim(), formPerms, token);
      }

      const rolesData = await getRolesByEmpresa(empresaId, token);
      setRoles(rolesData);

      const statsData = await getRolesStats(empresaId, token);
      setStats(statsData);

      setCreateEditOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (role: Rol) => {
    if (role.es_predeterminado) {
      alert('No puedes eliminar roles predeterminados del sistema');
      return;
    }
    setDeletingRole(role);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRole || !empresaId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      await deleteRol(deletingRole.rol_id, token);

      const rolesData = await getRolesByEmpresa(empresaId, token);
      setRoles(rolesData);

      const statsData = await getRolesStats(empresaId, token);
      setStats(statsData);

      setDeleteOpen(false);
      setDeletingRole(null);
    } catch (error: any) {
      alert(error.message || 'Error al eliminar el rol');
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<Rol>[] = [
    {
      key: 'nombre_rol',
      header: 'Nombre del Rol',
      render: (v: string, row: Rol) => (
        <span className='role-name-cell'>
          {row.es_predeterminado && (
            <FiLock size={14} style={{ marginRight: '8px', color: 'var(--pri-600)' }} />
          )}
          {v}
        </span>
      ),
    },
    {
      key: 'permisos',
      header: 'Permisos Activos',
      render: (_: unknown, row: Rol) => (
        <span className='perm-count'>
          {row.permisos.length} permiso{row.permisos.length !== 1 ? 's' : ''}
        </span>
      ),
      width: '160px',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_: unknown, row: Rol) => (
        <div className='roles-actions'>
          <button
            type='button'
            className='icon-action-btn'
            aria-label={`Editar ${row.nombre_rol}`}
            onClick={() => openEdit(row)}
            disabled={row.es_predeterminado}
            style={{
              opacity: row.es_predeterminado ? 0.5 : 1,
              cursor: row.es_predeterminado ? 'not-allowed' : 'pointer',
            }}
          >
            <FiEdit2 size={16} />
          </button>
          <button
            type='button'
            className='icon-action-btn icon-action-btn--danger'
            aria-label={`Eliminar ${row.nombre_rol}`}
            onClick={() => confirmDelete(row)}
            disabled={row.es_predeterminado}
            style={{
              opacity: row.es_predeterminado ? 0.5 : 1,
              cursor: row.es_predeterminado ? 'not-allowed' : 'pointer',
            }}
          >
            <FiTrash2 size={16} />
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
          description='Define qué pueden hacer los miembros de tu equipo'
          titleSize={16}
          descriptionSize={12}
          titleWeight='semibold'
          descriptionWeight='light'
          spacing='.35rem'
          maxWidth='100%'
        />
        {stats && (
          <div className='roles-stats-badge'>
            <span className='roles-stats-count'>
              {stats.roles_personalizados} / {stats.limite_roles} roles personalizados
            </span>
            {stats.puede_crear_mas ? (
              <span className='roles-stats-status roles-stats-status--available'>Disponible</span>
            ) : (
              <span className='roles-stats-status roles-stats-status--limit'>Límite alcanzado</span>
            )}
          </div>
        )}
        <Button
          variant='primary'
          size='small'
          onClick={openCreate}
          disabled={!stats?.puede_crear_mas || loading}
          className='roles-btn-add'
        >
          <FiPlus size={16} /> Nuevo Rol
        </Button>
      </div>

      {loading && !roles.length ? (
        <div className='loading-indicator'>Cargando roles...</div>
      ) : (
        <Table<Rol>
          data={roles}
          columns={columns}
          emptyMessage='Sin roles definidos aún'
          className='roles-table'
          rowClassName={(row) =>
            editingRole && row.rol_id === editingRole.rol_id ? 'table-row--active' : ''
          }
        />
      )}

      <Modal
        isOpen={createEditOpen}
        onClose={() => {
          setCreateEditOpen(false);
          resetForm();
        }}
        title={editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
        message=''
        showCancelButton
        cancelButtonText='Cancelar'
        showConfirmButton={false}
        modalType='info'
      >
        <div className='roles-form'>
          <Input
            label='Nombre del Rol'
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder='Ej: Vendedor, Supervisor, etc.'
          />
          <div className='perms-section'>
            <label className='perms-label'>Permisos</label>
            <div className='perms-grid'>
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <div key={perm.code} className='perm-checkbox-item'>
                  <input
                    type='checkbox'
                    id={perm.code}
                    checked={formPerms.includes(perm.code)}
                    onChange={() => togglePerm(perm.code)}
                  />
                  <label htmlFor={perm.code}>{perm.label}</label>
                </div>
              ))}
            </div>
          </div>
          <div className='roles-form-actions'>
            <Button
              variant='secondary'
              size='small'
              onClick={() => {
                setCreateEditOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              size='small'
              onClick={handleSave}
              disabled={!formName.trim() || loading}
            >
              {loading ? 'Guardando...' : editingRole ? 'Actualizar' : 'Crear Rol'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeletingRole(null);
        }}
        title='Eliminar Rol'
        message={`¿Seguro que deseas eliminar el rol "${deletingRole?.nombre_rol}"? Esta acción no se puede deshacer.`}
        showCancelButton
        showConfirmButton
        confirmButtonText={loading ? 'Eliminando...' : 'Eliminar'}
        onConfirm={handleDelete}
        modalType='error'
      />
    </div>
  );
}

export default CompanyRolesPermissionsSection;
