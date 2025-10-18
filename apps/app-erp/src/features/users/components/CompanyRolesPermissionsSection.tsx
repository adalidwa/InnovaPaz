import { useState, useEffect } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Table, { type TableColumn } from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import { FiPlus, FiEdit2, FiTrash2, FiLock, FiList } from 'react-icons/fi';
import { IoCopyOutline } from 'react-icons/io5';
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
import {
  getRolesDisponiblesEmpresa,
  crearRolDesdePlantilla,
  getDescripcionPermisos,
  formatearPermisos,
} from '../services/rolePlantillaService';

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
  const [plantillasOpen, setPlantillasOpen] = useState(false);
  const [confirmPlantillaOpen, setConfirmPlantillaOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Rol | null>(null);
  const [formName, setFormName] = useState('');
  const [formPerms, setFormPerms] = useState<string[]>([]);
  const [deletingRole, setDeletingRole] = useState<Rol | null>(null);
  const [rolesDisponibles, setRolesDisponibles] = useState<any>(null);
  const [selectedPlantilla, setSelectedPlantilla] = useState<any>(null);

  const resetForm = () => {
    setFormName('');
    setFormPerms([]);
    setEditingRole(null);
  };

  const openCreate = () => {
    resetForm();
    setCreateEditOpen(true);
  };

  const openPlantillas = async () => {
    if (!empresaId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const disponibles = await getRolesDisponiblesEmpresa(empresaId, token);
      setRolesDisponibles(disponibles);
      setPlantillasOpen(true);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      alert('Error al cargar roles predeterminados');
    }
  };

  const openConfirmPlantilla = (plantilla: any) => {
    setSelectedPlantilla(plantilla);
    setFormName(plantilla.nombre);
    setPlantillasOpen(false);
    setConfirmPlantillaOpen(true);
  };

  const openEdit = (role: Rol) => {
    if (role.es_predeterminado) {
      alert('No puedes editar roles predeterminados del sistema');
      return;
    }
    setEditingRole(role);
    setFormName(role.nombre_rol);
    // Manejar permisos como array o convertir de objeto
    if (Array.isArray(role.permisos)) {
      setFormPerms(role.permisos);
    } else {
      // Si los permisos son un objeto, extraer las claves activas
      const permisosArray: string[] = [];
      Object.entries(role.permisos).forEach(([modulo, acciones]) => {
        if (typeof acciones === 'object') {
          Object.entries(acciones as Record<string, boolean>).forEach(([accion, activo]) => {
            if (activo) {
              permisosArray.push(`${modulo}.${accion}`);
            }
          });
        }
      });
      setFormPerms(permisosArray);
    }
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
        // Actualizar rol existente
        await updateRol(editingRole.rol_id, formName.trim(), formPerms, token);
        alert('Rol actualizado exitosamente');
      } else {
        // Crear nuevo rol personalizado - permisos como array
        const descripcion = 'Rol personalizado creado por el usuario';
        const created = await createRol(empresaId, formName.trim(), formPerms, token, descripcion);
        // Si backend retorna el rol creado, añadirlo inmediatamente para mejor UX
        if (created) {
          setRoles((prev) => [created, ...prev]);
        }
        alert('Rol personalizado creado exitosamente');
      }

      // Recargar datos
      const rolesData = await getRolesByEmpresa(empresaId, token);
      setRoles(rolesData);

      const statsData = await getRolesStats(empresaId, token);
      setStats(statsData);

      // Emitir evento para que otras pestañas se actualicen
      if (editingRole) {
        window.dispatchEvent(new CustomEvent('roleUpdated', { detail: { empresaId } }));
      } else {
        window.dispatchEvent(new CustomEvent('roleCreated', { detail: { empresaId } }));
      }

      setCreateEditOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar rol:', error);
      alert(error.message || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarPlantilla = async () => {
    if (!selectedPlantilla || !formName.trim() || !empresaId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      await crearRolDesdePlantilla(empresaId, selectedPlantilla.id, token, formName.trim());

      const rolesData = await getRolesByEmpresa(empresaId, token);
      setRoles(rolesData);

      const statsData = await getRolesStats(empresaId, token);
      setStats(statsData);

      // Emitir evento para que otras pestañas se actualicen
      window.dispatchEvent(new CustomEvent('roleCreated', { detail: { empresaId } }));

      setConfirmPlantillaOpen(false);
      setSelectedPlantilla(null);
      setFormName('');
      alert('Rol predeterminado agregado exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al agregar rol predeterminado');
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

      // Emitir evento para que otras pestañas se actualicen
      window.dispatchEvent(new CustomEvent('roleDeleted', { detail: { empresaId } }));

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
            <FiLock size={14} style={{ marginRight: '8px', color: 'var(--success-600)' }} />
          )}
          {!row.es_predeterminado && (row as any).plantilla_id_origen && (
            <IoCopyOutline size={14} style={{ marginRight: '8px', color: 'var(--success-500)' }} />
          )}
          {v}
        </span>
      ),
    },
    {
      key: 'permisos',
      header: 'Permisos Activos',
      render: (_: unknown, row: Rol) => {
        // Si tiene permisos array de strings
        if (Array.isArray(row.permisos)) {
          return (
            <span className='perm-count'>
              {row.permisos.length} permiso{row.permisos.length !== 1 ? 's' : ''}
            </span>
          );
        }
        // Si tiene permisos objeto (nuevo formato)
        if (typeof row.permisos === 'object') {
          const descripcion = getDescripcionPermisos(row.permisos);
          return <span className='perm-count'>{descripcion}</span>;
        }
        return <span className='perm-count'>0 permisos</span>;
      },
      width: '200px',
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
        <div className='roles-header-actions'>
          <Button
            variant='outline'
            size='small'
            onClick={openPlantillas}
            disabled={loading}
            className='roles-btn-plantillas'
          >
            <FiList size={16} /> Agregar Roles Predeterminados
          </Button>
          <Button
            variant='primary'
            size='small'
            onClick={openCreate}
            disabled={stats ? !stats.puede_crear_mas || loading : false}
            className='roles-btn-add'
          >
            <FiPlus size={16} /> Nuevo Rol
          </Button>
        </div>
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

      {/* Modal para seleccionar plantillas */}
      <Modal
        isOpen={plantillasOpen}
        onClose={() => {
          setPlantillasOpen(false);
          setRolesDisponibles(null);
        }}
        title='Agregar Roles Predeterminados'
        message='Selecciona las plantillas disponibles según tu tipo de empresa'
        showCancelButton={false}
        showConfirmButton={false}
        modalType='info'
      >
        <div className='plantillas-modal-content'>
          {rolesDisponibles?.plantillas?.filter((p: any) => p.puede_usar).length > 0 ? (
            <div className='plantillas-list'>
              {rolesDisponibles.plantillas
                .filter((p: any) => p.puede_usar)
                .map((plantilla: any) => (
                  <div key={plantilla.id} className='plantilla-item'>
                    <div className='plantilla-info'>
                      <h5>{plantilla.nombre}</h5>
                      <p>{plantilla.descripcion}</p>
                      <span className='plantilla-permisos'>
                        {getDescripcionPermisos(plantilla.permisos)}
                      </span>
                    </div>
                    <Button
                      variant='primary'
                      size='small'
                      onClick={() => openConfirmPlantilla(plantilla)}
                    >
                      <IoCopyOutline />
                      Agregar
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <div className='empty-plantillas'>
              <p>No hay plantillas disponibles para tu plan actual</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal para confirmar agregar rol desde plantilla */}
      <Modal
        isOpen={confirmPlantillaOpen}
        onClose={() => {
          setConfirmPlantillaOpen(false);
          setSelectedPlantilla(null);
          setFormName('');
        }}
        title='Personalizar Rol'
        message={`Basado en: ${selectedPlantilla?.nombre || ''}`}
        showCancelButton={false}
        showConfirmButton={false}
        modalType='info'
      >
        <div className='roles-form'>
          <Input
            label='Nombre del Rol'
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder='Ej: Cajero Principal'
          />

          {selectedPlantilla && (
            <div className='plantilla-preview'>
              <h5>Permisos base:</h5>
              <div className='permissions-list'>
                {formatearPermisos(selectedPlantilla.permisos)
                  .slice(0, 10)
                  .map((permiso: string) => (
                    <span key={permiso} className='permission-tag'>
                      {permiso}
                    </span>
                  ))}
                {formatearPermisos(selectedPlantilla.permisos).length > 10 && (
                  <span className='permission-tag-more'>
                    +{formatearPermisos(selectedPlantilla.permisos).length - 10} más
                  </span>
                )}
              </div>
            </div>
          )}

          <div className='roles-form-actions'>
            <Button
              variant='secondary'
              size='small'
              onClick={() => {
                setConfirmPlantillaOpen(false);
                setSelectedPlantilla(null);
                setFormName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              size='small'
              onClick={handleAgregarPlantilla}
              disabled={!formName.trim() || loading}
            >
              {loading ? 'Agregando...' : 'Agregar Rol'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CompanyRolesPermissionsSection;
