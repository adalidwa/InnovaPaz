import { useState } from 'react';
import TitleDescription from '../../../components/common/TitleDescription';
import Button from '../../../components/common/Button';
import Table, { type TableColumn } from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { FiEdit2, FiUserPlus } from 'react-icons/fi';
import './CompanyMembersSection.css';

interface Member {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: 'activo' | 'pendiente';
}

const roleOptions = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Vendedor', label: 'Vendedor' },
  { value: 'Inventario', label: 'Inventario' },
];

function CompanyMembersSection() {
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan@empresa.com',
      rol: 'Administrador',
      estado: 'activo',
    },
    {
      id: '2',
      nombre: 'María García',
      email: 'maria@empresa.com',
      rol: 'Vendedor',
      estado: 'activo',
    },
    {
      id: '3',
      nombre: 'Carlos López',
      email: 'carlos@empresa.com',
      rol: 'Inventario',
      estado: 'pendiente',
    },
  ]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ nombre: '', email: '', rol: '' });

  const updateInvite = (k: string, v: string) => setInviteForm((p) => ({ ...p, [k]: v }));

  const handleInvite = () => {
    if (!inviteForm.nombre || !inviteForm.email || !inviteForm.rol) return;
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        nombre: inviteForm.nombre,
        email: inviteForm.email,
        rol: inviteForm.rol,
        estado: 'pendiente',
      },
    ]);
    setInviteForm({ nombre: '', email: '', rol: '' });
    setInviteOpen(false);
  };

  const columns: TableColumn<Member>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'rol', header: 'Rol' },
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
        <button
          type='button'
          className='icon-action-btn'
          aria-label={`Editar ${row.nombre}`}
          onClick={() => {
            /* TODO: abrir modal edición */
          }}
        >
          <FiEdit2 size={16} />
        </button>
      ),
      className: 'col-acciones',
      width: '72px',
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
          <Input
            label='Nombre'
            placeholder='Nombre completo'
            value={inviteForm.nombre}
            onChange={(e) => updateInvite('nombre', e.target.value)}
            required
          />
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
            options={roleOptions}
            placeholder='Seleccionar rol'
          />
          <div className='invite-actions'>
            <Button
              variant='primary'
              size='medium'
              onClick={handleInvite}
              disabled={!inviteForm.nombre || !inviteForm.email || !inviteForm.rol}
            >
              Enviar Invitación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CompanyMembersSection;
