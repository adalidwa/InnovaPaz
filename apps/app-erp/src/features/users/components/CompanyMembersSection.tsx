import { useState, useEffect } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Table, { type TableColumn } from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { FiEdit2, FiUserPlus, FiMail, FiX } from 'react-icons/fi';
import './CompanyMembersSection.css';
import { getRolesByEmpresa, type Rol } from '../services/rolesService';
import {
  createInvitation,
  getInvitationsByCompany,
  resendInvitation,
  cancelInvitation,
} from '../services/invitationsService';

interface Member {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  rol_nombre?: string;
  estado: 'activo' | 'pendiente';
  tipo?: 'usuario' | 'invitacion';
  invitacion_id?: number;
  fecha_expiracion?: string;
}

function CompanyMembersSection() {
  const [members, setMembers] = useState<Member[]>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', rol: '' });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    type: 'resend' | 'cancel' | null;
    invitacionId: number | null;
  }>({
    show: false,
    type: null,
    invitacionId: null,
  });

  const updateInvite = (k: string, v: string) => setInviteForm((p) => ({ ...p, [k]: v }));

  const fetchData = async () => {
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

        // Cargar roles de la empresa
        setLoadingRoles(true);
        const rolesData = await getRolesByEmpresa(empId, token);
        setRoles(rolesData);
        setLoadingRoles(false);

        // Cargar miembros activos de la empresa (solo usuarios reales)
        const resMembers = await fetch(`/api/users/company/${empId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const membersData: Member[] = [];

        if (resMembers.ok) {
          const dataMembers = await resMembers.json();
          console.log(
            `🔍 [Frontend] Usuarios recibidos del backend (empresa ${empId}):`,
            dataMembers.length
          );
          console.log('📋 [Frontend] Primeros 3 usuarios:', dataMembers.slice(0, 3));
          membersData.push(
            ...dataMembers.map(
              (m: {
                uid: string;
                nombre_completo: string;
                email: string;
                rol_id: string;
                rol?: { nombre_rol?: string };
                estado: 'activo' | 'pendiente';
              }) => {
                const rolObj = rolesData.find((r) => r.rol_id === m.rol_id);
                return {
                  id: m.uid,
                  nombre: m.nombre_completo,
                  email: m.email,
                  rol: m.rol_id,
                  rol_nombre: rolObj?.nombre_rol || m.rol?.nombre_rol || 'Sin rol',
                  estado: 'activo' as const,
                  tipo: 'usuario' as const,
                };
              }
            )
          );
        }

        // Cargar invitaciones pendientes
        const invitations = await getInvitationsByCompany(token);
        console.log(`🔍 [Frontend] Invitaciones recibidas:`, invitations.length);
        const pendingInvitations = invitations
          .filter((inv) => inv.estado === 'pendiente')
          .map((inv) => {
            const rolObj = rolesData.find((r) => r.rol_id.toString() === inv.rol);
            return {
              id: `inv-${inv.invitacion_id}`,
              nombre: 'Invitación pendiente',
              email: inv.email,
              rol: inv.rol,
              rol_nombre: inv.rol_nombre || rolObj?.nombre_rol || 'Sin rol',
              estado: 'pendiente' as const,
              tipo: 'invitacion' as const,
              invitacion_id: inv.invitacion_id,
              fecha_expiracion: inv.fecha_expiracion,
            };
          });

        console.log(
          `📊 [Frontend] Total a mostrar: ${membersData.length} usuarios + ${pendingInvitations.length} invitaciones = ${membersData.length + pendingInvitations.length}`
        );
        setMembers([...membersData, ...pendingInvitations]);
      }
    } catch (error) {
      console.error('Error obteniendo datos:', error);
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.rol || !empresaId) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('No se encontró el token de autenticación');
        setLoading(false);
        return;
      }

      await createInvitation(
        {
          email: inviteForm.email,
          rol_id: parseInt(inviteForm.rol),
        },
        token
      );

      setSuccessMessage('Invitación enviada exitosamente');
      setInviteForm({ email: '', rol: '' });
      setInviteOpen(false);

      // Recargar datos para mostrar la nueva invitación
      await fetchData();
    } catch (error) {
      console.error('Error al enviar invitación:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar la invitación');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitacionId: number) => {
    setConfirmAction({
      show: true,
      type: 'resend',
      invitacionId: invitacionId,
    });
  };

  const executeResendInvitation = async () => {
    if (!confirmAction.invitacionId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await resendInvitation(confirmAction.invitacionId, token);
      setModalMessage('Invitación reenviada exitosamente');
      setShowSuccessModal(true);
      setConfirmAction({ show: false, type: null, invitacionId: null });
      await fetchData();
    } catch (error) {
      console.error('Error al reenviar invitación:', error);
      setModalMessage(error instanceof Error ? error.message : 'Error al reenviar la invitación');
      setShowErrorModal(true);
      setConfirmAction({ show: false, type: null, invitacionId: null });
    }
  };

  const handleCancelInvitation = async (invitacionId: number) => {
    setConfirmAction({
      show: true,
      type: 'cancel',
      invitacionId: invitacionId,
    });
  };

  const executeCancelInvitation = async () => {
    if (!confirmAction.invitacionId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await cancelInvitation(confirmAction.invitacionId, token);
      setModalMessage('Invitación cancelada exitosamente');
      setShowSuccessModal(true);
      setConfirmAction({ show: false, type: null, invitacionId: null });
      await fetchData();
    } catch (error) {
      console.error('Error al cancelar invitación:', error);
      setModalMessage(error instanceof Error ? error.message : 'Error al cancelar la invitación');
      setShowErrorModal(true);
      setConfirmAction({ show: false, type: null, invitacionId: null });
    }
  };

  const columns: TableColumn<Member>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    {
      key: 'rol_nombre',
      header: 'Rol',
      render: (_, row) => row.rol_nombre || 'Sin rol',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (_, row) => (
        <span
          className={`status-badge ${
            row.estado === 'activo' ? 'status-badge--active' : 'status-badge--pending'
          }`}
        >
          {row.estado === 'activo' ? 'Activo' : 'Pendiente'}
        </span>
      ),
      className: 'col-estado',
      width: '120px',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {row.tipo === 'usuario' ? (
            <button
              type='button'
              className='icon-action-btn'
              aria-label={`Editar ${row.nombre}`}
              onClick={() => {}}
            >
              <FiEdit2 size={16} />
            </button>
          ) : (
            <>
              <button
                type='button'
                className='icon-action-btn'
                aria-label='Reenviar invitación'
                title='Reenviar invitación'
                onClick={() => handleResendInvitation(row.invitacion_id!)}
              >
                <FiMail size={16} />
              </button>
              <button
                type='button'
                className='icon-action-btn'
                style={{ color: '#dc3545' }}
                aria-label='Cancelar invitación'
                title='Cancelar invitación'
                onClick={() => handleCancelInvitation(row.invitacion_id!)}
              >
                <FiX size={16} />
              </button>
            </>
          )}
        </div>
      ),
      className: 'col-acciones',
      width: '100px',
    },
  ];

  return (
    <div className='company-members-card'>
      <div className='members-header-line'>
        <TitleDescription
          title='Miembros del Equipo'
          description='Administra los usuarios con acceso a tu cuenta'
          titleSize={16}
          descriptionSize={12}
          titleWeight='semibold'
          descriptionWeight='light'
          spacing='.35rem'
          maxWidth='100%'
        />
        <Button
          variant='primary'
          size='medium'
          icon={<FiUserPlus size={16} />}
          onClick={() => setInviteOpen(true)}
        >
          Invitar Miembro
        </Button>
      </div>

      <Table<Member>
        data={members}
        columns={columns}
        emptyMessage='Sin miembros aún'
        className='members-table'
      />

      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title='Invitar Miembro'
        message=''
        showCancelButton
        cancelButtonText='Cerrar'
        showConfirmButton={false}
        modalType='info'
      >
        <div className='invite-form'>
          {successMessage && (
            <div
              style={{
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
              }}
            >
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div
              style={{
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '4px',
              }}
            >
              {errorMessage}
            </div>
          )}
          <Input
            type='email'
            label='Email'
            placeholder='correo@empresa.com'
            value={inviteForm.email}
            onChange={(e) => updateInvite('email', e.target.value)}
            required
          />
          <Select
            label='Rol'
            required
            value={inviteForm.rol}
            onChange={(e) => updateInvite('rol', e.target.value)}
            options={roles.map((r) => ({ value: r.rol_id, label: r.nombre_rol }))}
            placeholder={loadingRoles ? 'Cargando roles...' : 'Seleccionar rol'}
            disabled={loadingRoles}
          />
          <div className='invite-actions'>
            <Button
              variant='primary'
              size='medium'
              onClick={handleInvite}
              disabled={!inviteForm.email || !inviteForm.rol || loadingRoles || loading}
            >
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación para reenviar/cancelar invitación */}
      <Modal
        isOpen={confirmAction.show}
        onClose={() => setConfirmAction({ show: false, type: null, invitacionId: null })}
        title={confirmAction.type === 'resend' ? '¿Reenviar invitación?' : '¿Cancelar invitación?'}
        message={
          confirmAction.type === 'resend'
            ? '¿Estás seguro de reenviar esta invitación?'
            : '¿Estás seguro de cancelar esta invitación?'
        }
        modalType='warning'
        confirmButtonText='Confirmar'
        showCancelButton={true}
        cancelButtonText='Cancelar'
        onConfirm={() => {
          if (confirmAction.type === 'resend') {
            executeResendInvitation();
          } else if (confirmAction.type === 'cancel') {
            executeCancelInvitation();
          }
        }}
        onCancel={() => setConfirmAction({ show: false, type: null, invitacionId: null })}
      />

      {/* Modal de éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title='¡Éxito!'
        message={modalMessage}
        modalType='success'
        confirmButtonText='Aceptar'
      />

      {/* Modal de error */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title='Error'
        message={modalMessage}
        modalType='error'
        confirmButtonText='Aceptar'
      />
    </div>
  );
}

export default CompanyMembersSection;
