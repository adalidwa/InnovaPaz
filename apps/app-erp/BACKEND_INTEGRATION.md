# Integración Frontend-Backend para Productos

## ✅ Cambios Realizados

### 1. **Tipos TypeScript Actualizados**

- ✅ Actualizado `src/features/inventories/types/inventory.ts` con interfaces
  basadas en la BD real
- ✅ Agregada interfaz `Product` (datos del backend)
- ✅ Agregada interfaz `ProductLegacy` (compatibilidad con componentes
  existentes)
- ✅ Agregadas interfaces para requests: `CreateProductRequest`,
  `UpdateProductRequest`, `ProductResponse`

### 2. **Servicio de Productos Creado**

- ✅ Creado `src/features/inventories/services/productService.ts`
- ✅ Métodos implementados: `getAllProducts`, `getProductById`, `createProduct`,
  `updateProduct`, `deleteProduct`
- ✅ Función de conversión de formato BD → Legacy para compatibilidad
- ✅ Manejo de errores y configuración de URL base

### 3. **Hook de Productos Actualizado**

- ✅ Creado `src/features/inventories/hooks/useProductsReal.ts`
- ✅ Integración con el servicio de productos del backend
- ✅ Funciones async para todas las operaciones CRUD
- ✅ Conversión automática de formatos de datos
- ✅ Carga inicial de productos desde la BD

### 4. **Componentes Actualizados**

- ✅ `ProductsContext.tsx` - Actualizado para usar ProductLegacy y funciones
  async
- ✅ `ProductsCardCrud.tsx` - Actualizado para usar ProductLegacy
- ✅ `ProductManagement.tsx` - Funciones async y manejo de ProductLegacy
- ✅ `EditProductModal.tsx` - Soporte para funciones async
- ✅ `ModalImputs.tsx` - Soporte para funciones async

## 🔧 Configuración Requerida

### 1. **Variables de Entorno del Backend**

Asegúrate de que tu backend tenga estas variables en `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=innova_paz_erp_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña_segura
NODE_ENV=development
PORT=3000
```

### 2. **URL del Backend**

La URL está configurada en `productService.ts`:

```typescript
const API_BASE_URL = 'http://localhost:4000';
```

Las rutas utilizadas son: `/api/products`

### 3. **ID de Empresa**

Configurado en `useProductsReal.ts`:

```typescript
const EMPRESA_ID = '93d5a3c0-a091-40ab-97de-e26a285c7318';
```

## 🚀 Cómo Probar

### 1. **Iniciar el Backend**

```bash
cd apps/app-erp-backend
npm install  # si no lo has hecho
node index.js
```

### 2. **Iniciar el Frontend**

```bash
cd apps/app-erp
npm install  # si no lo has hecho
npm run dev
```

### 3. **Probar en el Navegador**

1. Abre la aplicación en el navegador
2. Ve a la sección de Productos
3. Deberías ver los productos reales de la base de datos
4. Prueba agregar, editar y eliminar productos

### 4. **Debug de Conexión**

Si no ves datos, abre la consola del navegador y ejecuta:

```javascript
window.testBackendConnection();
```

## 📋 Datos de Prueba

Si aún no tienes productos, puedes crear uno con este POST a
`http://localhost:4000/api/products`:

```json
{
  "codigo": "FAR500",
  "nombre_producto": "Fanta 500ml",
  "descripcion": "Bebida gaseosa sabor naranja de 500ml",
  "precio_venta": 3.5,
  "precio_costo": 2.0,
  "stock": 1000,
  "empresa_id": "93d5a3c0-a091-40ab-97de-e26a285c7318",
  "categoria_id": 8,
  "marca_id": 3,
  "estado_id": 1
}
```

## 🔍 Verificaciones

- ✅ Backend funcionando en puerto 4000
- ✅ Base de datos con datos de empresa, categorías y marcas
- ✅ CORS configurado correctamente en el backend
- ✅ Frontend conectándose a la API correcta

## 🐛 Posibles Problemas

1. **Error de CORS**: Asegúrate de que el backend tenga CORS habilitado
2. **Puerto diferente**: Cambia `API_BASE_URL` en `productService.ts`
3. **Empresa no encontrada**: Verifica que existe la empresa con el ID
   configurado
4. **Sin productos**: Crea algunos productos de prueba usando la API

## 📝 Próximos Pasos

1. **Agregar categorías y marcas reales**: Integrar APIs para categorías y
   marcas
2. **Mejorar UI de errores**: Mostrar mensajes de error más amigables
3. **Agregar loading states**: Mejorar indicadores de carga
4. **Validación de formularios**: Validar datos antes de enviar al backend
5. **Paginación**: Implementar paginación para muchos productos

¡La integración básica está completa! Los productos ahora se cargan desde la
base de datos real.
