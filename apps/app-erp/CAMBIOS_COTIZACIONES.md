# Solución al Problema de Creación de Cotizaciones

## Problema Identificado

Las cotizaciones no se estaban creando correctamente porque el frontend no
enviaba el `cliente_id` cuando se seleccionaba un cliente registrado. Esto
causaba que todas las cotizaciones se crearan como "clientes directos" sin
vincular al cliente registrado en el sistema.

## Análisis Realizado

### Backend (Ya estaba correctamente implementado)

El backend ya tenía las validaciones correctas:

1. **Modelo (`quote.model.js`)**:
   - Valida que todos los productos pertenezcan a la empresa del usuario
   - Valida que el cliente pertenezca a la empresa (si se proporciona
     `cliente_id`)
   - Acepta cotizaciones con `cliente_id` NULL para clientes directos

2. **Controlador (`quotes.controller.js`)**:
   - Requiere `empresaId` como parámetro obligatorio en todas las operaciones
   - Filtra todas las consultas por `empresaId`

3. **Servicio Frontend (`salesService.ts`)**:
   - Ya obtiene correctamente el `empresaId` del usuario logueado
   - Los métodos `getAllProducts()` y `getAllClients()` ya filtran por empresa

### Problema en Frontend

El componente `NewQuoteModal.tsx` no estaba incluyendo el `cliente_id` en el
objeto `quoteData` cuando se seleccionaba un cliente del sistema.

## Solución Implementada

### Archivo Modificado

`/app-erp/src/features/sales/components/NewQuoteModal.tsx`

### Cambios Realizados

```typescript
// ANTES (líneas 143-155)
const quoteData = {
  numero_cotizacion: quoteNumber,
  fecha_validez: validUntil,
  subtotal: calculateSubtotal(),
  impuesto: 0,
  descuento: globalDiscount,
  total: calculateTotal(),
  observaciones: observations,
  nombre_cliente_directo: clientName,
  email_cliente_directo: clientEmail,
  telefono_cliente_directo: clientPhone,
  productos: selectedProducts,
};

// DESPUÉS (líneas 143-163)
const quoteData: any = {
  numero_cotizacion: quoteNumber,
  fecha_validez: validUntil,
  subtotal: calculateSubtotal(),
  impuesto: 0,
  descuento: globalDiscount,
  total: calculateTotal(),
  observaciones: observations,
  productos: selectedProducts,
};

// Si hay un cliente seleccionado (no es cliente directo), incluir el cliente_id
// El cliente general tiene id=20, pero no debe enviarse como cliente_id
if (selectedClient && selectedClient.id !== 20) {
  quoteData.cliente_id = selectedClient.id;
}

// Siempre enviar los datos del cliente directo para que se muestren en la cotización
quoteData.nombre_cliente_directo = clientName;
quoteData.email_cliente_directo = clientEmail;
quoteData.telefono_cliente_directo = clientPhone;
```

### Lógica de la Solución

1. **Cliente Registrado**: Si se selecciona un cliente del sistema (id !== 20),
   se envía el `cliente_id` para vincular la cotización al cliente registrado.

2. **Cliente General/Directo**: Si no hay cliente seleccionado o se usa el
   "Cliente General" (id=20), NO se envía `cliente_id`, permitiendo crear
   cotizaciones para clientes no registrados.

3. **Datos de Cliente**: Siempre se envían los campos `nombre_cliente_directo`,
   `email_cliente_directo` y `telefono_cliente_directo` para que se muestren en
   la cotización, independientemente de si está vinculada a un cliente
   registrado.

## Funcionalidad Multi-Empresa

El sistema ya estaba correctamente implementado para funcionar con múltiples
empresas:

### Filtrado por Empresa

1. **Productos**:
   - `ProductSelector` → `SalesService.getAllProducts()` → filtra por
     `empresaId`
   - Backend valida que los productos pertenezcan a la empresa

2. **Clientes**:
   - `ClientSelector` → `SalesService.getAllClients()` → filtra por `empresaId`
   - Backend valida que el cliente pertenezca a la empresa

3. **Cotizaciones**:
   - Todas las operaciones requieren `empresaId`
   - El backend filtra TODAS las consultas por `empresaId`

### Seguridad

- Cada empresa solo puede ver y crear cotizaciones con sus propios recursos
- No es posible acceder a datos de otras empresas
- El `empresaId` se obtiene del usuario logueado almacenado en localStorage

## Archivos de Respaldo

Se creó un respaldo del archivo original:

- `NewQuoteModal.tsx.backup`

## Verificación

- ✅ TypeScript: Sin errores de compilación
- ✅ Lint: Sin errores (solo warnings preexistentes en otros archivos)
- ✅ Lógica: La solución respeta la arquitectura multi-empresa existente

## Cómo Probar

1. Inicia sesión con un usuario de una empresa
2. Ve a Ventas → Cotizaciones
3. Crea una nueva cotización:
   - **Con cliente registrado**: Selecciona un cliente del dropdown
   - **Con cliente directo**: No selecciones cliente o usa "Cliente General"
4. Agrega productos (solo verás los productos de tu empresa)
5. Completa y guarda la cotización
6. Verifica que la cotización se creó correctamente

## Resultado Esperado

- ✅ Las cotizaciones se crean exitosamente
- ✅ Los productos solo muestran los de la empresa del usuario
- ✅ Los clientes solo muestran los de la empresa del usuario
- ✅ Cada empresa solo ve sus propias cotizaciones
- ✅ Se pueden crear cotizaciones con clientes registrados o directos
