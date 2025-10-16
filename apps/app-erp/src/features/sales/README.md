# Sales Module - Sistema ERP

Este módulo de ventas replica y adapta toda la funcionalidad del módulo de
shopping, proporcionando un sistema completo de gestión de ventas local.

## 🏗️ Estructura Implementada

```
features/sales/
├── data/
│   └── db.json                 # Base de datos local adaptada para ventas
├── hooks/
│   └── hooks.ts               # Hooks personalizados para gestión de datos
├── services/
│   └── salesService.ts        # Servicios para manejo de datos
├── utils/
│   └── salesUtils.ts          # Utilidades generales
├── components/
│   ├── SalesCard.tsx          # Componente principal para mostrar módulos
│   ├── AddClientModal.tsx     # Modal para agregar clientes
│   ├── AddProductModal.tsx    # Modal para agregar productos
│   ├── ClientHistoryModal.tsx # Modal para ver historial de clientes
│   └── index.ts               # Exportaciones de componentes
└── pages/
    ├── SalesPage.tsx          # Página principal del módulo
    └── SalesPage.css          # Estilos de la página principal
```

## 📊 Base de Datos Local (db.json)

### Entidades Principales:

1. **Clientes (clients)**: 10 clientes de ejemplo con diferentes tipos
   - Regulares, Corporativos, Mayoristas
   - Información completa: NIT, contacto, límites de crédito

2. **Productos (products)**: 10 productos con gestión de inventario
   - Códigos únicos, categorías, precios de venta y costo
   - Control de stock con estados (Disponible, Bajo Stock, Crítico)

3. **Módulos de Ventas (salesModules)**: 7 módulos principales
   - Punto de Venta, Clientes, Órdenes, Cotizaciones, etc.
   - Control de estado activo/inactivo y prioridades

4. **Ventas (sales)**: Registros de ventas completadas
5. **Órdenes (orders)**: Órdenes de venta pendientes
6. **Cotizaciones (quotes)**: Cotizaciones para clientes
7. **Historial (historyData)**: Histórico de transacciones por cliente

## 🔧 Hooks Implementados

### Gestión de Datos:

- `useClients`: Manejo completo de clientes (CRUD + validación)
- `useProducts`: Gestión de productos con filtros y categorías
- `useSales`: Control de ventas y transacciones
- `useOrders`: Manejo de órdenes de venta
- `useQuotes`: Gestión de cotizaciones
- `useSalesModules`: Control de módulos del sistema

### Funcionalidad Específica:

- `useCart`: Carrito de compras para punto de venta
- `useHistory`: Historial de transacciones por cliente
- `useModal`: Control de modales del sistema
- `useClientForm` & `useProductForm`: Formularios con validación

## 🛠️ Servicios (SalesService)

### Métodos Principales:

- **Clientes**: `getAllClients`, `searchClients`, `getClientById`
- **Productos**: `getAllProducts`, `searchProducts`, `getProductByCode`
- **Ventas**: `getAllSales`, `getSalesByClient`, `getSalesByDateRange`
- **Estadísticas**: `getTotalSales`, `getTopSellingProducts`, `getTopClients`
- **Validación**: `validateSale`, `validateOrder`, `validateQuote`

## 🔨 Utilidades (salesUtils)

### Funcionalidades:

- **Formateo**: Moneda, fechas, números, porcentajes
- **Validación**: Email, NIT, teléfonos bolivianos
- **Cálculos**: Subtotales, descuentos, impuestos, márgenes
- **Carrito**: Agregar, actualizar, eliminar productos
- **Filtros**: Búsquedas y filtrados avanzados
- **Reportes**: Análisis de ventas, productos top, clientes top
- **Exportación**: CSV, impresión de recibos
- **Persistencia**: LocalStorage para datos offline

## 🎨 Componentes

### Modales Implementados:

- **AddClientModal**: Formulario completo para nuevos clientes
- **AddProductModal**: Gestión de productos con validación
- **ClientHistoryModal**: Visualización de historial con paginación

### Componente Principal:

- **SalesCard**: Tarjeta modular para mostrar funcionalidades
- **SalesPage**: Página principal con grid de módulos

## 🚀 Funcionalidades Implementadas

### ✅ Completamente Funcional:

1. **Base de datos local** con datos de ejemplo realistas
2. **Hooks personalizados** para toda la lógica de negocio
3. **Servicios async** que simulan llamadas a API
4. **Utilidades completas** para formateo y validación
5. **Modales funcionales** usando componentes comunes
6. **Componente principal** de navegación
7. **Validaciones** para todos los formularios
8. **Sistema de estados** para productos y transacciones

### 🔄 Integración con Componentes Comunes:

- Modal, Button, Input, Select, Table, Pagination
- StatusTag, TitleDescription
- Reutilización completa de la librería de componentes

## 📱 Responsive Design

Todos los componentes están optimizados para:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎯 Próximos Pasos

Para completar la implementación:

1. **Integrar con rutas** del sistema
2. **Conectar páginas específicas** (POS, Clientes, etc.)
3. **Implementar autenticación** si es necesaria
4. **Agregar más validaciones** específicas del negocio
5. **Optimizar rendimiento** para grandes volúmenes de datos

## 🔧 Uso

```tsx
import { SalesPage } from './features/sales/pages/SalesPage';
import { useSalesModules, useClients } from './features/sales/hooks/hooks';
import { SalesService } from './features/sales/services/salesService';
```

El módulo está completamente funcional y listo para su integración en el sistema
principal.
