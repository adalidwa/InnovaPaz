import Button from '../../../components/common/Button';
import '../../../assets/styles/theme.css';
import './home.css';

function Home() {
  return (
    <div className='home-container'>
      <h1 className='home-title'>Sistema de Inventarios - Ejemplos de Botones</h1>

      <div className='home-section design-buttons-section'>
        <h2 className='home-subtitle'>Botones Principales del Sistema</h2>

        <div className='button-showcase'>
          <p className='button-description'>Botón para agregar nuevos productos al inventario</p>
          <Button
            variant='primary'
            icon={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>}
            iconPosition='left'
            rounded='lg'
            size='medium'
            onClick={() => alert('Redirigir a formulario de nuevo producto')}
          >
            Agregar Producto
          </Button>
        </div>

        <div className='button-showcase'>
          <p className='button-description'>Botón para visualizar detalles de productos</p>
          <Button
            variant='outline'
            icon={
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' />
              </svg>
            }
            iconPosition='left'
            rounded='lg'
            size='medium'
            onClick={() => alert('Ver detalles del producto')}
          >
            Ver Detalles
          </Button>
        </div>

        <div className='button-showcase'>
          <p className='button-description'>
            Botón de alerta para gestionar productos con stock bajo
          </p>
          <Button
            variant='warning'
            rounded='lg'
            size='medium'
            fullWidth
            onClick={() => alert('Mostrar productos con stock crítico')}
          >
            Gestionar Stock Crítico
          </Button>
        </div>

        <div className='button-showcase'>
          <p className='button-description'>Botón para confirmar y guardar cambios</p>
          <Button
            variant='success'
            rounded='lg'
            size='medium'
            fullWidth
            onClick={() => alert('Producto guardado exitosamente')}
          >
            Guardar Producto
          </Button>
        </div>
      </div>

      <div className='home-section'>
        <h2 className='home-subtitle'>Botones de Acciones Rápidas</h2>
        <div className='combinations-grid'>
          <Button
            variant='primary'
            icon={<span style={{ fontSize: '16px' }}>📦</span>}
            iconPosition='left'
            rounded='lg'
            onClick={() => alert('Nuevo producto')}
          >
            Nuevo Producto
          </Button>

          <Button
            variant='secondary'
            icon={<span style={{ fontSize: '16px' }}>📊</span>}
            iconPosition='left'
            rounded='lg'
            onClick={() => alert('Ver reportes')}
          >
            Reportes
          </Button>

          <Button
            variant='accent'
            icon={<span style={{ fontSize: '16px' }}>🔍</span>}
            iconPosition='left'
            rounded='lg'
            onClick={() => alert('Buscar productos')}
          >
            Buscar
          </Button>
        </div>
      </div>

      <div className='home-section'>
        <h2 className='home-subtitle'>Botones de Administración</h2>
        <div className='button-grid'>
          <Button
            variant='outline'
            icon={<span style={{ fontSize: '16px' }}>✏️</span>}
            iconPosition='left'
            rounded='md'
            size='small'
            onClick={() => alert('Editar producto')}
          >
            Editar
          </Button>

          <Button
            variant='warning'
            icon={<span style={{ fontSize: '16px' }}>⚠️</span>}
            iconPosition='left'
            rounded='md'
            size='small'
            onClick={() => confirm('¿Marcar como stock bajo?')}
          >
            Stock Bajo
          </Button>

          <Button
            variant='accent'
            icon={<span style={{ fontSize: '16px' }}>🗑️</span>}
            iconPosition='left'
            rounded='md'
            size='small'
            onClick={() => confirm('¿Eliminar producto?')}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <div className='home-section size-demo-section'>
        <h2 className='home-subtitle'>Diferentes Tamaños de Botones</h2>
        <div className='size-comparison'>
          <Button
            variant='primary'
            fullWidth
            rounded='lg'
            size='large'
            icon={<span>🚀</span>}
            iconPosition='left'
          >
            Botón Grande - Acción Principal
          </Button>

          <Button
            variant='secondary'
            fullWidth
            rounded='lg'
            size='medium'
            icon={<span>⚙️</span>}
            iconPosition='left'
          >
            Botón Mediano - Acción Secundaria
          </Button>

          <Button
            variant='outline'
            fullWidth
            rounded='lg'
            size='small'
            icon={<span>ℹ️</span>}
            iconPosition='left'
          >
            Botón Pequeño - Información
          </Button>
        </div>
      </div>

      <div className='home-section'>
        <h2 className='home-subtitle'>Estados de Botones</h2>
        <div className='button-grid'>
          <Button variant='primary' rounded='lg'>
            Normal
          </Button>

          <Button variant='primary' rounded='lg' disabled>
            Deshabilitado
          </Button>

          <Button variant='secondary' rounded='lg' loading>
            Cargando
          </Button>
        </div>
      </div>

      <div className='home-section'>
        <h2 className='home-subtitle'>Formulario de Ejemplo</h2>
        <form className='space-y-4' style={{ maxWidth: '400px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--pri-700)' }}>
              Nombre del Producto:
            </label>
            <input
              type='text'
              placeholder='Ingrese el nombre del producto'
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--pri-200)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          <div className='button-grid'>
            <Button
              type='submit'
              variant='primary'
              icon={<span>💾</span>}
              iconPosition='left'
              rounded='lg'
            >
              Guardar
            </Button>

            <Button
              type='button'
              variant='outline'
              rounded='lg'
              onClick={() => alert('Formulario cancelado')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
