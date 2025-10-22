# Sistema de Exportación de Reportes Mejorado - INNOVAPAZ ERP

## 📋 Resumen General

El sistema de reportes ha sido completamente renovado con capacidades de
exportación profesionales para PDF y Excel, incluyendo:

- **9 tipos de reportes** diferentes con datos en tiempo real
- **Exportación PDF** con diseño profesional, colores corporativos y marca
- **Exportación Excel** con múltiples hojas, formato profesional y datos
  estructurados
- **Datos actualizados** directamente de las tablas correctas de la base de
  datos

## 🎯 Reportes Disponibles

### 1. **Dashboard Ejecutivo**

- **Endpoint Datos**: `GET /api/reports/generate/dashboard`
- **Export PDF**: `GET /api/reports/export/dashboard/pdf`
- **Export Excel**: `GET /api/reports/export/dashboard/excel`
- **Métricas**: Usuarios activos, productos, ventas, inventario, movimientos
- **Parámetros**: `empresa_id`, `periodo` (opcional)

### 2. **Reporte de Ventas**

- **Endpoint Datos**: `GET /api/reports/generate/ventas`
- **Export PDF**: `GET /api/reports/export/ventas/pdf`
- **Export Excel**: `GET /api/reports/export/ventas/excel`
- **Incluye**: Estadísticas de ventas, top productos, ventas por método de pago
- **Parámetros**: `empresa_id`, `fecha_desde`, `fecha_hasta`, `cliente_id`,
  `vendedor_id`

### 3. **Reporte de Inventario**

- **Endpoint Datos**: `GET /api/reports/generate/inventario`
- **Export PDF**: `GET /api/reports/export/inventario/pdf`
- **Export Excel**: `GET /api/reports/export/inventario/excel`
- **Incluye**: Estado del inventario, productos por categoría, próximos a vencer
- **Parámetros**: `empresa_id`, `categoria_id`, `marca_id`, `almacen_id`

### 4. **Movimientos de Inventario**

- **Endpoint Datos**: `GET /api/reports/generate/movimientos-inventario`
- **Export PDF**: `GET /api/reports/export/movimientos-inventario/pdf`
- **Export Excel**: `GET /api/reports/export/movimientos-inventario/excel`
- **Incluye**: Historial de entradas/salidas, productos más movidos, actividad
  por usuario
- **Parámetros**: `empresa_id`, `fecha_desde`, `fecha_hasta`, `producto_id`,
  `tipo_movimiento_id`

### 5. **Alertas del Sistema**

- **Endpoint Datos**: `GET /api/reports/generate/alertas`
- **Export PDF**: `GET /api/reports/export/alertas/pdf`
- **Export Excel**: `GET /api/reports/export/alertas/excel`
- **Incluye**: Stock bajo, sin stock, próximos a vencer con criticidad
- **Parámetros**: `empresa_id`, `stock_minimo` (default: 10)

### 6-9. **Reportes Adicionales**

- **Usuarios**: Solo Excel (`/export/usuarios/excel`)
- **Productos**: PDF y Excel (`/export/productos/pdf`,
  `/export/productos/excel`)

## 🎨 Características de Diseño PDF

### Paleta de Colores Profesional

```javascript
const COLORS = {
  primary: '#1F2937', // Gris oscuro elegante
  secondary: '#3B82F6', // Azul corporativo
  success: '#10B981', // Verde para números positivos
  warning: '#F59E0B', // Naranja para alertas
  danger: '#EF4444', // Rojo para críticos
  accent: '#8B5CF6', // Púrpura para destacar
  text: '#374151', // Gris texto
  light: '#F9FAFB', // Fondo claro
};
```

### Estructura PDF

1. **Header Corporativo**: Logo área, título principal y subtítulo
2. **Secciones con Iconos**: Cada sección tiene emoji e ícono identificativo
3. **Cards con Métricas**: Círculos de colores para KPIs principales
4. **Listas Profesionales**: Rankings con medallas y colores de estado
5. **Footer Corporativo**: Marca INNOVAPAZ ERP

## 📊 Características Excel

### Estructura de Hojas

- **Hoja 1**: Resumen ejecutivo con métricas principales
- **Hoja 2**: Datos detallados con columnas bien formateadas
- **Hoja 3**: Análisis específicos (top productos, categorías, etc.)
- **Hojas adicionales**: Según el tipo de reporte

### Formato Profesional

- Columnas auto-dimensionadas
- Títulos descriptivos con fecha de generación
- Separación clara entre secciones
- Formato de moneda boliviano (Bs)
- Fechas en formato local boliviano

## 🔧 Uso desde Frontend

### Ejemplo de Implementación React

```typescript
// Descargar PDF Dashboard
const downloadDashboardPDF = async (
  empresaId: string,
  periodo: string = 'mes_actual'
) => {
  try {
    const response = await fetch(
      `/api/reports/export/dashboard/pdf?empresa_id=${empresaId}&periodo=${periodo}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error descargando PDF:', error);
  }
};

// Descargar Excel Ventas
const downloadVentasExcel = async (empresaId: string, filtros: any = {}) => {
  try {
    const params = new URLSearchParams({ empresa_id: empresaId, ...filtros });
    const response = await fetch(`/api/reports/export/ventas/excel?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ventas-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error descargando Excel:', error);
  }
};
```

### Botones de Exportación

```tsx
const ExportButtons = ({ empresaId, reportType, filters = {} }) => {
  return (
    <div className='flex gap-2'>
      <button
        onClick={() => downloadPDF(empresaId, reportType, filters)}
        className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
      >
        <FileText size={16} />
        Exportar PDF
      </button>

      <button
        onClick={() => downloadExcel(empresaId, reportType, filters)}
        className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
      >
        <Download size={16} />
        Exportar Excel
      </button>
    </div>
  );
};
```

## 📋 Parámetros de Consulta

### Períodos Disponibles (Dashboard)

- `hoy` - Solo el día actual
- `semana_actual` - Lunes a domingo actual
- `mes_actual` - Mes en curso (default)
- `mes_anterior` - Mes pasado completo
- `trimestre_actual` - Q1, Q2, Q3, Q4 actual
- `año_actual` - Año en curso
- `ultimos_7_dias` - Rolling 7 días
- `ultimos_30_dias` - Rolling 30 días

### Filtros Comunes

- `empresa_id` (requerido en todos)
- `fecha_desde` / `fecha_hasta` (formato: YYYY-MM-DD)
- `categoria_id`, `marca_id`, `almacen_id` (para productos)
- `cliente_id`, `vendedor_id` (para ventas)
- `stock_minimo` (para alertas, default: 10)

## 🚀 Beneficios del Sistema

### Para Usuarios

1. **Reportes Profesionales**: Diseño corporativo atractivo
2. **Múltiples Formatos**: PDF para presentaciones, Excel para análisis
3. **Datos Actuales**: Información en tiempo real de la base de datos
4. **Filtros Flexibles**: Personalización según necesidades
5. **Descarga Inmediata**: Sin esperas ni procesos complejos

### Para Desarrolladores

1. **Código Modular**: Funciones reutilizables para PDF y Excel
2. **Mantenible**: Separación clara entre datos, presentación y exportación
3. **Escalable**: Fácil agregar nuevos tipos de reportes
4. **Consistente**: Paleta de colores y estilos unificados
5. **Documentado**: Endpoints claramente documentados

## 🔮 Próximas Mejoras

1. **Gráficos en PDF**: Integrar charts.js para visualizaciones
2. **Plantillas Personalizadas**: Permitir personalización de marca por empresa
3. **Programación**: Reportes automáticos vía email
4. **Dashboard Interactivo**: Filtros en tiempo real con exportación
5. **APIs GraphQL**: Mayor flexibilidad en consultas

## 🧪 Testing

```bash
# Probar endpoint de datos
curl "http://localhost:5000/api/reports/generate/dashboard?empresa_id=1&periodo=mes_actual"

# Probar exportación PDF
curl "http://localhost:5000/api/reports/export/dashboard/pdf?empresa_id=1" > dashboard.pdf

# Probar exportación Excel
curl "http://localhost:5000/api/reports/export/ventas/excel?empresa_id=1" > ventas.xlsx
```

## 📁 Estructura de Archivos

```
controllers/
├── reports.controller.js      # Endpoints de datos JSON
├── reports.export.controller.js # Endpoints de exportación PDF/Excel

models/
├── report.model.js           # Queries optimizadas para reportes

routes/
├── reports.routes.js         # Definición de todas las rutas

docs/
├── SISTEMA-EXPORTACION-MEJORADO.md # Esta documentación
```

---

**¡El sistema de reportes está listo para uso profesional con capacidades de
exportación completas!** 🎉
