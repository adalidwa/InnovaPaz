import React, { useState, useEffect } from 'react';
import {
  getRolesDisponiblesEmpresa,
  crearRolDesdePlantilla,
  crearRolNuevo,
  getRolesEmpresa,
  getEstadisticasRolesEmpresa,
  formatearPermisos,
  getDescripcionPermisos,
} from '../services/rolePlantillaService';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import {
  IoShieldCheckmarkOutline,
  IoPersonAddOutline,
  IoInformationCircleOutline,
  IoCopyOutline,
  IoStatsChartOutline,
  IoCheckmarkCircleOutline,
  IoAddCircleOutline,
  IoListOutline,
} from 'react-icons/io5';
import './RolePlantillasManager.css';

interface RolePlantillasManagerProps {
  empresaId: string;
}

const RolePlantillasManager: React.FC<RolePlantillasManagerProps> = ({ empresaId }) => {
  const [loading, setLoading] = useState(true);
  const [rolesDisponibles, setRolesDisponibles] = useState<any>(null);
  const [rolesActuales, setRolesActuales] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlantillasModal, setShowPlantillasModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedPlantilla, setSelectedPlantilla] = useState<any>(null);
  const [nombrePersonalizado, setNombrePersonalizado] = useState('');
  const [descripcionRol, setDescripcionRol] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Solo ejecutar si tenemos empresaId
    if (empresaId && empresaId.trim() !== '') {
      fetchData();
    }
  }, [empresaId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('RolePlantillasManager - fetchData con empresaId:', empresaId);

      const [rolesData, statsData, rolesEmpresaData] = await Promise.all([
        getRolesDisponiblesEmpresa(empresaId, token),
        getEstadisticasRolesEmpresa(empresaId, token),
        getRolesEmpresa(empresaId, token),
      ]);

      setRolesDisponibles(rolesData);
      setEstadisticas(statsData);
      setRolesActuales(rolesEmpresaData.roles || []);
    } catch (error) {
      console.error('Error cargando datos de roles:', error);
      setError('Error al cargar la información de roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearRolDesdePlantilla = async () => {
    if (!selectedPlantilla || !nombrePersonalizado.trim()) {
      setError('Nombre del rol es requerido');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      await crearRolDesdePlantilla(
        empresaId,
        selectedPlantilla.id,
        token,
        nombrePersonalizado.trim()
      );

      setSuccess('Rol predeterminado agregado exitosamente');
      setShowConfirmModal(false);
      setSelectedPlantilla(null);
      setNombrePersonalizado('');
      fetchData(); // Recargar datos
    } catch (error: any) {
      setError(error.message || 'Error al agregar rol predeterminado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCrearRolNuevo = async () => {
    if (!nombrePersonalizado.trim() || !descripcionRol.trim()) {
      setError('Nombre y descripción son requeridos');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Permisos básicos por defecto
      const permisosBasicos = {
        dashboard: { ver: true },
        configuracion: { ver: true },
      };

      await crearRolNuevo(
        empresaId,
        nombrePersonalizado.trim(),
        descripcionRol.trim(),
        permisosBasicos,
        token
      );

      setSuccess('Rol personalizado creado exitosamente');
      setShowCreateModal(false);
      setNombrePersonalizado('');
      setDescripcionRol('');
      fetchData(); // Recargar datos
    } catch (error: any) {
      setError(error.message || 'Error al crear rol');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = (plantilla: any) => {
    setSelectedPlantilla(plantilla);
    setNombrePersonalizado(`${plantilla.nombre}`);
    setShowPlantillasModal(false);
    setShowConfirmModal(true);
    setError(null);
  };

  const openNewRoleModal = () => {
    setNombrePersonalizado('');
    setDescripcionRol('');
    setShowCreateModal(true);
    setError(null);
  };

  if (loading) {
    return <div className='roles-loading'>Cargando plantillas de roles...</div>;
  }

  return (
    <div className='role-plantillas-manager'>
      <div className='manager-header'>
        <div className='header-info'>
          <h2 className='manager-title'>
            <IoShieldCheckmarkOutline />
            Roles y Permisos
          </h2>
          <p className='manager-subtitle'>Define qué pueden hacer los miembros de tu equipo</p>
        </div>
        <div className='header-actions'>
          <Button variant='secondary' onClick={() => setShowStatsModal(true)} size='small'>
            <IoStatsChartOutline />
            Estadísticas
          </Button>
          <Button variant='primary' onClick={openNewRoleModal} size='small'>
            <IoAddCircleOutline />
            Nuevo Rol
          </Button>
        </div>
      </div>

      {error && (
        <div className='error-message'>
          <IoInformationCircleOutline />
          {error}
        </div>
      )}

      {success && (
        <div className='success-message'>
          <IoCheckmarkCircleOutline />
          {success}
        </div>
      )}

      {/* Sección de Roles Actuales */}
      <div className='roles-section'>
        <div className='section-header'>
          <h3>Roles Definidos</h3>
          <div className='section-actions'>
            <span className='section-count'>{rolesActuales.length} roles</span>
            <Button variant='outline' onClick={() => setShowPlantillasModal(true)} size='small'>
              <IoListOutline />
              Agregar Roles Predeterminados
            </Button>
          </div>
        </div>

        {rolesActuales.length > 0 ? (
          <div className='roles-grid'>
            {rolesActuales.map((rol: any) => (
              <div key={rol.rol_id} className='role-card'>
                <div className='role-header'>
                  <div
                    className='role-badge'
                    style={{
                      backgroundColor: rol.plantilla_id_origen
                        ? 'var(--success-500)'
                        : 'var(--info-500)',
                    }}
                  >
                    {rol.plantilla_id_origen ? 'Predeterminado' : 'Personalizado'}
                  </div>
                  <h4 className='role-name'>{rol.nombre_rol}</h4>
                </div>

                <p className='role-description'>{rol.descripcion || 'Sin descripción'}</p>

                <div className='role-permissions'>
                  <span className='permissions-summary'>
                    {getDescripcionPermisos(rol.permisos)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='empty-state'>
            <IoPersonAddOutline size={48} />
            <h4>No hay roles definidos aún</h4>
            <p>Crea un rol nuevo o agrega roles predeterminados según tu tipo de empresa</p>
          </div>
        )}
      </div>

      {/* Modal para crear rol completamente nuevo */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Crear Rol Nuevo'
        message='Crea un rol completamente personalizado'
      >
        <div className='create-role-form'>
          <Input
            label='Nombre del Rol'
            value={nombrePersonalizado}
            onChange={(e) => setNombrePersonalizado(e.target.value)}
            placeholder='Ej: Supervisor de Ventas'
            disabled={submitting}
          />

          <Input
            label='Descripción'
            value={descripcionRol}
            onChange={(e) => setDescripcionRol(e.target.value)}
            placeholder='Describe las responsabilidades de este rol'
            disabled={submitting}
          />

          <div className='info-box'>
            <IoInformationCircleOutline />
            <span>Los permisos se podrán configurar después de crear el rol</span>
          </div>

          <div className='modal-actions'>
            <Button
              variant='secondary'
              onClick={() => setShowCreateModal(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              onClick={handleCrearRolNuevo}
              disabled={submitting || !nombrePersonalizado.trim() || !descripcionRol.trim()}
            >
              {submitting ? 'Creando...' : 'Crear Rol'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para agregar roles predeterminados */}
      <Modal
        isOpen={showPlantillasModal}
        onClose={() => setShowPlantillasModal(false)}
        title='Agregar Roles Predeterminados'
        message={`Selecciona las plantillas disponibles según tu tipo de empresa`}
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
                      onClick={() => openCreateModal(plantilla)}
                    >
                      <IoCopyOutline />
                      Agregar
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <div className='empty-plantillas'>
              <IoInformationCircleOutline size={48} />
              <p>No hay plantillas disponibles para tu plan actual</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal para confirmar agregar rol desde plantilla */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedPlantilla(null);
          setNombrePersonalizado('');
        }}
        title='Personalizar Rol'
        message={selectedPlantilla ? `Basado en: ${selectedPlantilla.nombre}` : ''}
      >
        {selectedPlantilla && (
          <div className='create-role-form'>
            <Input
              label='Nombre del Rol'
              value={nombrePersonalizado}
              onChange={(e) => setNombrePersonalizado(e.target.value)}
              placeholder='Ej: Cajero Senior'
              disabled={submitting}
            />

            <div className='plantilla-preview'>
              <h5>Permisos base:</h5>
              <div className='permissions-list'>
                {formatearPermisos(selectedPlantilla.permisos).map((permiso: string) => (
                  <span key={permiso} className='permission-tag'>
                    {permiso}
                  </span>
                ))}
              </div>
            </div>

            <div className='modal-actions'>
              <Button
                variant='secondary'
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedPlantilla(null);
                  setNombrePersonalizado('');
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant='primary'
                onClick={handleCrearRolDesdePlantilla}
                disabled={submitting || !nombrePersonalizado.trim()}
              >
                {submitting ? 'Agregando...' : 'Agregar Rol'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de estadísticas */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title='Estadísticas del Sistema de Roles'
        message=''
      >
        {estadisticas && (
          <div className='stats-content'>
            <div className='stat-item'>
              <h5>Plantillas Disponibles</h5>
              <p>
                {estadisticas.plantillas.total_disponibles} plantillas para{' '}
                {estadisticas.empresa.tipo}
              </p>
              <small>Permitidas por plan: {estadisticas.plantillas.permitidas_por_plan}</small>
            </div>

            <div className='stat-item'>
              <h5>Roles Personalizados</h5>
              <p>
                {estadisticas.roles_personalizados.total} de{' '}
                {estadisticas.roles_personalizados.limite} utilizados
              </p>
              <small>Disponibles: {estadisticas.roles_personalizados.disponibles}</small>
            </div>

            <div className='stat-item'>
              <h5>Uso del Sistema</h5>
              <p>
                {estadisticas.roles_personalizados.porcentaje_uso.toFixed(1)}% de capacidad
                utilizada
              </p>
              <small>Total roles activos: {estadisticas.total_roles_activos}</small>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RolePlantillasManager;
