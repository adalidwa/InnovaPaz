# Módulo de Ventas (Sales)

Sistema de gestión de ventas completo, integrado con el backend de PostgreSQL.

## Estructura del Proyecto

```
sales/
├── data/
│   └── db.json.backup         # Backup de datos de ejemplo (no se usa en producción)
├── hooks/
│   ├── hooks.ts               # Hooks personalizados para gestión de estado
│   └── index.ts               # Re-exportación de hooks
├── services/
│   ├── api.ts                 # Cliente HTTP para comunicación con backend
│   ├── salesService.ts        # Servicio principal de ventas (conectado a backend)
│   └── index.ts               # Re-exportación de servicios
├── utils/
│   ├── salesUtils.ts          # Utilidades para operaciones de ventas
│   └── index.ts               # Re-exportación de utilidades
├── components/
│   ├── SalesCard.tsx          # Tarjeta de venta
│   ├── AddClientModal.tsx     # Modal para agregar clientes
│   ├── AddProductModal.tsx    # Modal para agregar productos
│   ├── ClientHistoryModal.tsx # Modal de historial de cliente
│   ├── PointOfSale.tsx        # Componente principal del punto de venta
│   ├── SalesCart.tsx          # Carrito de compras
│   ├── ProductList.tsx        # Lista de productos
│   ├── ClientSelector.tsx     # Selector de clientes
│   ├── PaymentMethod.tsx      # Selector de método de pago
│   └── index.ts               # Re-exportación de componentes
└── pages/
    ├── SalesPage.tsx          # Página principal de ventas
    └── SalesPage.css          # Estilos de la página

```

## Conexión al Backend

### Base de Datos PostgreSQL

El módulo está conectado a una base de datos PostgreSQL en Render:

- **Host**: dpg-d3i40ladbo4c73fdfdl0-a.oregon-postgres.render.com
- **Puerto**: 5432
- **Base de Datos**: innovapaz_erp_db
- **Usuario**: innovapaz_erp_db_user

### API Backend

El backend está desplegado en: `http://localhost:4000`

#### Endpoints Principales:

**Clientes:**

- `GET /clients/empresa/:empresaId` - Obtener todos los clientes
- `GET /clients/empresa/:empresaId/:id` - Obtener cliente por ID
- `POST /clients/empresa/:empresaId` - Crear nuevo cliente
- `PUT /clients/empresa/:empresaId/:id` - Actualizar cliente
- `DELETE /clients/empresa/:empresaId/:id` - Eliminar cliente

**Productos:**

- `GET /products?empresa_id=:empresaId` - Obtener todos los productos
- `GET /products/:id?empresa_id=:empresaId` - Obtener producto por ID
- `GET /products/code/:code?empresa_id=:empresaId` - Obtener producto por código
- `GET /products/search?empresa_id=:empresaId&query=:query` - Buscar productos

**Ventas:**

- `GET /sales/empresa/:empresaId` - Obtener todas las ventas
- `GET /sales/empresa/:empresaId/:id` - Obtener venta por ID
- `POST /sales/empresa/:empresaId` - Crear nueva venta
- `GET /sales/empresa/:empresaId/stats` - Obtener estadísticas de ventas

**Cotizaciones:**

- `GET /quotes?empresaId=:empresaId` - Obtener todas las cotizaciones
- `POST /quotes?empresaId=:empresaId` - Crear nueva cotización
- `PUT /quotes/:id/status?empresaId=:empresaId` - Actualizar estado de
  cotización

## Hooks Disponibles

### 1. `useClients()`

Gestión completa de clientes con conexión al backend.

```typescript
const {
  clients, // Lista de todos los clientes
  currentClients, // Clientes de la página actual
  filteredClients, // Clientes filtrados por búsqueda
  searchTerm, // Término de búsqueda actual
  currentPage, // Página actual
  totalPages, // Total de páginas
  loading, // Estado de carga
  addClient, // Función para agregar cliente
  updateClient, // Función para actualizar cliente
  deleteClient, // Función para eliminar cliente
  validateClient, // Función para validar datos del cliente
  handleSearchChange, // Manejador de cambio de búsqueda
  handlePageChange, // Manejador de cambio de página
  ITEMS_PER_PAGE, // Constante de items por página
} = useClients();
```

### 2. `useProducts()`

Gestión de productos con conexión al backend.

```typescript
const {
  products, // Lista de todos los productos
  currentProducts, // Productos de la página actual
  filteredProducts, // Productos filtrados
  categories, // Categorías disponibles
  searchTerm, // Término de búsqueda
  selectedCategory, // Categoría seleccionada
  currentPage, // Página actual
  totalPages, // Total de páginas
  loading, // Estado de carga
  handleSearchChange, // Manejador de cambio de búsqueda
  handleCategoryChange, // Manejador de cambio de categoría
  handlePageChange, // Manejador de cambio de página
  ITEMS_PER_PAGE, // Constante de items por página
} = useProducts();
```

### 3. `useCart()`

Gestión del carrito de compras (Punto de Venta).

**IMPORTANTE:** El carrito inicia vacío. Los productos solo se agregan cuando el
usuario los selecciona.

```typescript
const {
  cartItems, // Items en el carrito (INICIA VACÍO)
  discount, // Descuento aplicado
  subtotal, // Subtotal del carrito
  total, // Total a pagar
  selectedClientId, // ID del cliente seleccionado
  setSelectedClientId, // Función para seleccionar cliente
  addToCart, // Función para agregar producto
  updateCartItem, // Función para actualizar cantidad
  removeFromCart, // Función para eliminar item
  clearCart, // Función para limpiar carrito
  applyDiscount, // Función para aplicar descuento
  CART_MAX_ITEMS, // Máximo de items permitidos
} = useCart();
```

### 4. `useSales()`

Gestión de historial de ventas.

```typescript
const {
  sales, // Lista de ventas
  currentSales, // Ventas de la página actual
  filteredSales, // Ventas filtradas
  searchTerm, // Término de búsqueda
  currentPage, // Página actual
  totalPages, // Total de páginas
  loading, // Estado de carga
  addSale, // Función para crear venta
  handleSearchChange, // Manejador de búsqueda
  handlePageChange, // Manejador de paginación
  ITEMS_PER_PAGE, // Items por página
} = useSales();
```

## Servicios (SalesService)

El servicio principal `SalesService` maneja toda la comunicación con el backend.

### Métodos Principales:

**Clientes:**

```typescript
SalesService.getAllClients();
SalesService.getClientById(id);
SalesService.searchClients(query);
SalesService.createClient(clientData);
SalesService.updateClient(id, updates);
SalesService.deleteClient(id);
```

**Productos:**

```typescript
SalesService.getAllProducts()
SalesService.getProductById(id)
SalesService.getProductByCode(code)
SalesService.searchProducts(query, category?)
SalesService.getAvailableProducts()
SalesService.getLowStockProducts()
```

**Ventas:**

```typescript
SalesService.getAllSales();
SalesService.getSaleById(id);
SalesService.getSalesByClient(clientId);
SalesService.getSalesByDateRange(startDate, endDate);
SalesService.createSale(saleData);
```

**Estadísticas:**

```typescript
SalesService.getTotalSales(period?)
SalesService.getSalesCount(period?)
```

**Cotizaciones:**

```typescript
SalesService.getAllQuotes(empresaId);
SalesService.createQuote(quoteData, empresaId);
SalesService.updateQuoteStatus(quoteId, estadoId, empresaId);
SalesService.generateQuoteNumber(empresaId);
```

## Componentes Principales

### PointOfSale

Componente principal del punto de venta. **El carrito inicia vacío** y los
productos se agregan desde la lista de productos disponibles.

```typescript
<PointOfSale />
```

### SalesCart

Carrito de ventas con funcionalidades de:

- Agregar/eliminar productos
- Modificar cantidades
- Seleccionar cliente
- Seleccionar método de pago
- Procesar venta (conectado al backend)

```typescript
<SalesCart
  cartItems={cartItems}
  onQuantityChange={handleQuantityChange}
  onRemoveItem={handleRemoveItem}
  onProcessSale={handleProcessSale}
  onCancel={handleCancel}
/>
```

### ProductList

Lista de productos disponibles obtenidos desde el backend.

```typescript
<ProductList
  onAddToCart={handleAddToCart}
  searchTerm={searchTerm}
/>
```

## Flujo de Trabajo del Punto de Venta

1. **Inicialización**: El carrito inicia vacío (sin productos precargados)
2. **Cargar Productos**: Los productos se obtienen del backend automáticamente
3. **Buscar Productos**: El usuario puede buscar por nombre o código
4. **Agregar al Carrito**: El usuario agrega productos desde la lista
5. **Seleccionar Cliente**: Obligatorio para procesar la venta
6. **Seleccionar Método de Pago**: cash, credit, debit, transfer
7. **Procesar Venta**: Se envía al backend y se guarda en la base de datos
8. **Limpiar Carrito**: Después de procesar, el carrito vuelve a estar vacío

## Configuración Backend

El módulo obtiene el `empresa_id` del usuario logueado desde `localStorage`:

```typescript
const user = JSON.parse(localStorage.getItem('user'));
const empresaId = user.empresa_id;
```

## Características Implementadas

- ✅ Carrito de ventas vacío por defecto
- ✅ Conexión completa con backend PostgreSQL
- ✅ CRUD de clientes con backend
- ✅ Lectura de productos desde backend
- ✅ Creación de ventas en backend
- ✅ Validaciones de datos
- ✅ Sistema de búsqueda y filtros
- ✅ Paginación de resultados
- ✅ Manejo de estados de carga
- ✅ Manejo de errores
- ✅ Diseño responsive (Desktop/Tablet/Mobile)

## Cambios Recientes

### 2024 - Actualización Mayor

- **Eliminada dependencia de db.json**: Ahora todo se obtiene del backend
- **Carrito vacío por defecto**: PointOfSale y SalesCart ya no tienen productos
  precargados
- **db.json renombrado**: Movido a `db.json.backup` para mantenerlo como
  referencia
- **Integración completa con PostgreSQL**: Todos los hooks y servicios
  conectados al backend

## Próximos Pasos

1. Implementar endpoint de órdenes en el backend
2. Agregar más filtros y estadísticas avanzadas
3. Implementar reportes de ventas
4. Agregar notificaciones de stock bajo
5. Implementar sistema de impresión de recibos
6. Optimizar rendimiento con caché

## Uso

```typescript
import { SalesPage } from './features/sales/pages/SalesPage';
import { useClients, useSales, useCart } from './features/sales/hooks/hooks';
import { SalesService } from './features/sales/services/salesService';

// En tu componente
function MyComponent() {
  const { cartItems, addToCart, clearCart } = useCart();
  const { sales, loading } = useSales();

  // Tu lógica aquí
}
```

## Notas Importantes

- El carrito **siempre** inicia vacío
- Todos los datos se obtienen del backend (no hay datos mock)
- Es necesario tener un usuario logueado con `empresa_id` válido
- El backend debe estar corriendo en `http://localhost:4000`
