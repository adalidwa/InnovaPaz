# Guía de Configuración de Base de Datos

Esta guía describe cómo configurar una base de datos PostgreSQL para la
aplicación ERP y ejecutar el script SQL para crear las tablas necesarias.

## Prerrequisitos

- Instalar PostgreSQL (versión 12 o superior).
- Crear un usuario de base de datos con permisos apropiados.
- Crear una nueva base de datos para la aplicación.

### Instalando PostgreSQL en Windows

1. Descarga el instalador de PostgreSQL desde el sitio web oficial
   (https://www.postgresql.org/download/windows/).
2. Ejecuta el instalador y sigue las instrucciones:
   - Selecciona componentes: Incluye PostgreSQL Server, pgAdmin y Herramientas
     de Línea de Comandos.
   - Establece una contraseña para el superusuario predeterminado (postgres).
   - Elige el puerto predeterminado (5432) o personalízalo si es necesario.
   - Selecciona el directorio de instalación.
3. Después de la instalación, el servicio PostgreSQL se inicia automáticamente.
   Usa pgAdmin o psql para conectarte.

### Instalando PostgreSQL en WSL (Ubuntu)

1. Actualiza tu sistema WSL Ubuntu: `sudo apt update && sudo apt upgrade`.
2. Instala PostgreSQL: `sudo apt install postgresql postgresql-contrib`.
3. Inicia el servicio PostgreSQL: `sudo systemctl start postgresql`.
4. Habilítalo para que se inicie al arranque:
   `sudo systemctl enable postgresql`.
5. Cambia al usuario postgres: `sudo -u postgres psql`.
6. Establece una contraseña para el usuario postgres: `\password postgres`
   (ingresa una contraseña segura).
7. Sal de psql: `\q`.
8. El puerto predeterminado es 5432. Puedes cambiarlo en
   `/etc/postgresql/<version>/main/postgresql.conf` si es necesario.

### Creando la Base de Datos

1. Conéctate a PostgreSQL:
   - En Windows: Abre pgAdmin, conéctate al servidor usando host 'localhost',
     puerto 5432, usuario 'postgres' y la contraseña establecida durante la
     instalación.
   - En WSL: Usa `psql -U postgres -h localhost -p 5432` e ingresa la
     contraseña.
2. Crea una nueva base de datos: Ejecuta `CREATE DATABASE innova_paz_erp_db;`
   (este es un nombre sugerido; asegúrate de que no sea 'postgres' para evitar
   conflictos con el usuario predeterminado).
3. Crea un usuario (opcional, por seguridad):
   `CREATE USER erp_user WITH PASSWORD 'tu_contraseña'; GRANT ALL PRIVILEGES ON DATABASE innova_paz_erp_db TO erp_user;`
4. Nota: El puerto predeterminado es 5432. Si se cambia, actualiza las cadenas
   de conexión de tu aplicación en consecuencia. Asegúrate de que la contraseña
   sea fuerte y se almacene de forma segura. Para la configuración en el archivo
   .env de tu aplicación, si deseas usar la misma contraseña para el usuario de
   la base de datos, puedes dejar el campo de contraseña vacío en el .env,
   dependiendo de cómo esté configurado tu sistema de autenticación.

### Configurando el Archivo .env

Para configurar las variables de entorno de la aplicación app-erp-backend, crea
un archivo llamado `.env` en la raíz del directorio del backend (es decir, en
`tu-proyecto/app/app-erp-backend/`).

#### En WSL/Linux:

1. Navega al directorio del backend: `cd tu-proyecto/app/app-erp-backend/`.
2. Crea el archivo `.env` usando un editor de texto (por ejemplo, `nano .env` o
   `vim .env`).
3. Agrega las siguientes variables de ejemplo, ajustándolas según tu
   configuración de PostgreSQL:

   ```
   # Configuración de la base de datos
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=innova_paz_erp_db
   DB_USER=postgres  # O 'erp_user' si creaste un usuario específico
   DB_PASSWORD=tu_contraseña_segura  # Deja vacío si usas autenticación por peer o similar

   # Otras configuraciones (ajusta según las necesidades de tu aplicación)
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=tu_jwt_secret_seguro
   ```

4. Guarda el archivo y asegúrate de que esté incluido en `.gitignore` para
   evitar subir contraseñas a repositorios públicos.
5. Reinicia tu aplicación backend para que cargue las nuevas variables.

#### En Windows (desde la interfaz):

1. Abre el Explorador de Archivos (File Explorer) y navega a la carpeta del
   backend.
2. Haz clic derecho en un espacio vacío dentro de la carpeta, selecciona
   "Nuevo" > "Documento de texto".
3. Renombra el archivo a `.env` (asegúrate de que la extensión sea exactamente
   `.env`, no `.env.txt`).
4. Haz doble clic en el archivo `.env` para abrirlo con el Bloc de notas
   (Notepad) o cualquier editor de texto.
5. Copia y pega las siguientes variables de ejemplo, ajustándolas según tu
   configuración de PostgreSQL:

   ```
   # Configuración de la base de datos
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=innova_paz_erp_db
   DB_USER=postgres  # O 'erp_user' si creaste un usuario específico
   DB_PASSWORD=tu_contraseña_segura  # Deja vacío si usas autenticación por peer o similar

   # Otras configuraciones (ajusta según las necesidades de tu aplicación)
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=tu_jwt_secret_seguro
   ```

6. Guarda el archivo (Archivo > Guardar) y ciérralo.
7. Asegúrate de que el archivo `.env` esté incluido en `.gitignore` para evitar
   subir contraseñas a repositorios públicos.
8. Reinicia tu aplicación backend para que cargue las nuevas variables.

## Pasos de Configuración

1. Conéctate a PostgreSQL usando un cliente como `psql` o una herramienta GUI
   (ej. pgAdmin).
2. Ejecuta el siguiente script SQL para crear todas las tablas. Asegúrate de
   estar conectado a la base de datos objetivo.

### Ejecutando el Script SQL

#### En Windows (usando pgAdmin):

- Abre pgAdmin y conéctate a la base de datos `innova_paz_erp_db` (o la que
  creaste).
- Haz clic derecho en la base de datos > Query Tool.
- Copia y pega el script SQL completo en el editor de consultas.
- Haz clic en "Execute" (o presiona F5) para ejecutar el script.

#### En Windows (usando psql desde línea de comandos):

- Abre la línea de comandos (cmd o PowerShell).
- Ejecuta: `psql -U postgres -d innova_paz_erp_db -h localhost -p 5432`
- Ingresa la contraseña cuando se solicite.
- Copia y pega el script SQL completo en el prompt de psql.
- Presiona Enter para ejecutar. Para salir, escribe `\q`.

#### En WSL (usando psql):

- Abre la terminal WSL.
- Ejecuta: `psql -U postgres -d innova_paz_erp_db -h localhost -p 5432`
- Ingresa la contraseña cuando se solicite.
- Copia y pega el script SQL completo en el prompt de psql.
- Presiona Enter para ejecutar. Para salir, escribe `\q`.

## Script SQL

Ejecuta el siguiente SQL en tu base de datos PostgreSQL:

```sql
-- ==============================================
--         TABLAS PRINCIPALES DE CONFIGURACIÓN
-- ==============================================

CREATE TABLE roles (
  rol_id SERIAL PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(empresa_id),
  nombre_rol VARCHAR(100) NOT NULL,
  permisos JSONB,
  es_predeterminado BOOLEAN DEFAULT FALSE,
  estado VARCHAR(50) DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
  usuario_id SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(100) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  email VARCHAR(150),
  rol_id INT REFERENCES roles(rol_id),
  estado BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
  uid VARCHAR(100) PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(empresa_id),
  rol_id INT REFERENCES roles(rol_id),
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  estado VARCHAR(50) DEFAULT 'activo',
  preferencias JSONB DEFAULT '{}'::jsonb,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipo_negocio (
  tipo_id SERIAL PRIMARY KEY,
  tipo_negocio VARCHAR(100),
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE planes (
  plan_id SERIAL PRIMARY KEY,
  nombre_plan VARCHAR(100) NOT NULL,
  precio_mensual INT NOT NULL,
  limites JSONB,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empresas (
  empresa_id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  tipo_negocio VARCHAR(100),
  ajustes JSONB,
  plan_id INT REFERENCES planes(plan_id),
  estado_suscripcion VARCHAR(50) DEFAULT 'en_prueba',
  fecha_fin_prueba TIMESTAMP,
  fecha_fin_periodo_actual TIMESTAMP,
  id_cliente_procesador_pago VARCHAR(150),
  tamano_empresa VARCHAR(20),
  email VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
--                TABLAS DE VENTAS
-- ==============================================

CREATE TABLE vendedores (
  vendedor_id SERIAL PRIMARY KEY,
  nombre VARCHAR(150),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  fecha_contratacion DATE,
  estado VARCHAR(50),
  empresa_id INT REFERENCES empresas(empresa_id)
);

CREATE TABLE estado_producto (
  estado_id SERIAL PRIMARY KEY,
  nombre VARCHAR(50),
  descripcion TEXT
);

CREATE TABLE marca (
  marca_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT
);

CREATE TABLE categorias (
  categoria_id SERIAL PRIMARY KEY,
  nombre_categoria VARCHAR(100),
  categoria_padre_id INT REFERENCES categorias(categoria_id),
  nivel INT,
  estado BOOLEAN DEFAULT TRUE,
  tipo_negocio_id INT REFERENCES tipo_negocio(tipo_id),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE atributos (
  atributo_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  atributo_padre_id INT REFERENCES atributos(atributo_id),
  tipo_atributo VARCHAR(50),
  unidad_medida VARCHAR(20),
  descripcion TEXT,
  es_obligatorio BOOLEAN DEFAULT FALSE
);

CREATE TABLE tipo_negocio_atributo (
  tipo_negocio_id INT REFERENCES tipo_negocio(tipo_id),
  atributo_id INT REFERENCES atributos(atributo_id),
  es_predeterminado BOOLEAN DEFAULT FALSE
);

CREATE TABLE categoria_atributo (
  categoria_id INT REFERENCES categorias(categoria_id),
  atributo_id INT REFERENCES atributos(atributo_id),
  es_predeterminado BOOLEAN DEFAULT FALSE
);

CREATE TABLE producto (
  producto_id SERIAL PRIMARY KEY,
  codigo VARCHAR(50),
  nombre_producto VARCHAR(150),
  descripcion TEXT,
  imagen VARCHAR(255),
  precio_venta DECIMAL(10,2),
  precio_costo DECIMAL(10,2),
  stock INT,
  cantidad_vendidos INT,
  categoria_id INT REFERENCES categorias(categoria_id),
  empresa_id INT REFERENCES empresas(empresa_id),
  marca_id INT REFERENCES marca(marca_id),
  estado_id INT REFERENCES estado_producto(estado_id),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP
);

CREATE TABLE atributos_productos (
  atributo_producto_id SERIAL PRIMARY KEY,
  producto_id INT REFERENCES producto(producto_id),
  atributo_id INT REFERENCES atributos(atributo_id),
  valor VARCHAR(100)
);

-- ==============================================
--                TABLAS DE COMPRAS
-- ==============================================

CREATE TABLE proveedores (
  proveedor_id SERIAL PRIMARY KEY,
  nombre VARCHAR(150),
  nit VARCHAR(50),
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  empresa_id INT REFERENCES empresas(empresa_id),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50)
);

CREATE TABLE estado_recepcion (
  estado_recepcion_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT
);

CREATE TABLE almacenes (
  almacen_id SERIAL PRIMARY KEY,
  empresa_id INT REFERENCES empresas(empresa_id),
  nombre VARCHAR(100),
  direccion TEXT,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lotes (
  lote_id SERIAL PRIMARY KEY,
  producto_id INT REFERENCES producto(producto_id),
  almacen_id INT REFERENCES almacenes(almacen_id),
  codigo_lote VARCHAR(50),
  fecha_ingreso DATE,
  fecha_vencimiento DATE,
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventario (
  inventario_id SERIAL PRIMARY KEY,
  producto_id INT REFERENCES producto(producto_id),
  almacen_id INT REFERENCES almacenes(almacen_id),
  cantidad_actual INT,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE aprovisionamiento (
  aprovisionamiento_id SERIAL PRIMARY KEY,
  producto_id INT REFERENCES producto(producto_id),
  stock_actual INT,
  stock_minimo INT,
  stock_maximo INT,
  estado VARCHAR(50),
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE motivo_devolucion (
  motivo_devolucion_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT
);

-- ==============================================
--            TABLAS DE CLIENTES Y PAGOS
-- ==============================================

CREATE TABLE categorias_cliente (
  categoria_cliente_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descuento_porcentaje DECIMAL(5,2),
  descripcion TEXT,
  estado VARCHAR(50)
);

CREATE TABLE clientes (
  cliente_id SERIAL PRIMARY KEY,
  nombre VARCHAR(150),
  email VARCHAR(100),
  telefono VARCHAR(20),
  nit_ci VARCHAR(50),
  direccion TEXT,
  categoria_cliente_id INT REFERENCES categorias_cliente(categoria_cliente_id),
  empresa_id INT REFERENCES empresas(empresa_id),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50)
);

CREATE TABLE metodo_pago (
  metodo_pago_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT,
  estado VARCHAR(50)
);

CREATE TABLE estado_venta (
  estado_venta_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT
);

-- ==============================================
--               PROCESO DE VENTAS
-- ==============================================

CREATE TABLE cotizaciones (
  cotizacion_id SERIAL PRIMARY KEY,
  numero_cotizacion VARCHAR(50) UNIQUE,
  cliente_id INT REFERENCES clientes(cliente_id),
  vendedor_id INT REFERENCES vendedores(vendedor_id),
  empresa_id INT REFERENCES empresas(empresa_id),
  fecha_cotizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_validez DATE,
  subtotal DECIMAL(10,2),
  impuesto DECIMAL(10,2),
  total DECIMAL(10,2),
  estado_cotizacion_id INT,
  observaciones TEXT,
  convertida_pedido BOOLEAN DEFAULT FALSE
);

CREATE TABLE detalle_cotizacion (
  detalle_cotizacion_id SERIAL PRIMARY KEY,
  cotizacion_id INT REFERENCES cotizaciones(cotizacion_id),
  producto_id INT REFERENCES producto(producto_id),
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  descuento DECIMAL(10,2)
);

CREATE TABLE pedidos (
  pedido_id SERIAL PRIMARY KEY,
  numero_pedido VARCHAR(50) UNIQUE,
  cliente_id INT REFERENCES clientes(cliente_id),
  vendedor_id INT REFERENCES vendedores(vendedor_id),
  empresa_id INT REFERENCES empresas(empresa_id),
  cotizacion_id INT REFERENCES cotizaciones(cotizacion_id),
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega_estimada DATE,
  subtotal DECIMAL(10,2),
  impuesto DECIMAL(10,2),
  total DECIMAL(10,2),
  estado_pedido_id INT,
  observaciones TEXT,
  completado BOOLEAN DEFAULT FALSE
);

CREATE TABLE detalle_pedido (
  detalle_pedido_id SERIAL PRIMARY KEY,
  pedido_id INT REFERENCES pedidos(pedido_id),
  producto_id INT REFERENCES producto(producto_id),
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  descuento DECIMAL(10,2)
);

CREATE TABLE ventas (
  venta_id SERIAL PRIMARY KEY,
  numero_venta VARCHAR(50) UNIQUE,
  cliente_id INT REFERENCES clientes(cliente_id),
  vendedor_id INT REFERENCES vendedores(vendedor_id),
  empresa_id INT REFERENCES empresas(empresa_id),
  cotizacion_id INT REFERENCES cotizaciones(cotizacion_id),
  pedido_id INT REFERENCES pedidos(pedido_id),
  fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10,2),
  impuesto DECIMAL(10,2),
  total DECIMAL(10,2),
  metodo_pago_id INT REFERENCES metodo_pago(metodo_pago_id),
  estado_venta_id INT REFERENCES estado_venta(estado_venta_id),
  observaciones TEXT
);

CREATE TABLE detalle_venta (
  detalle_venta_id SERIAL PRIMARY KEY,
  venta_id INT REFERENCES ventas(venta_id),
  producto_id INT REFERENCES producto(producto_id),
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  descuento DECIMAL(10,2)
);

-- ==============================================
--           PROCESO DE COMPRAS Y RECEPCIÓN
-- ==============================================

CREATE TABLE estado_orden_compra (
  estado_orden_compra_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT
);

CREATE TABLE ordenes_compra (
  orden_compra_id SERIAL PRIMARY KEY,
  numero_orden VARCHAR(50) UNIQUE,
  proveedor_id INT REFERENCES proveedores(proveedor_id),
  empresa_id INT REFERENCES empresas(empresa_id),
  fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega_esperada DATE,
  subtotal DECIMAL(10,2),
  impuesto DECIMAL(10,2),
  total DECIMAL(10,2),
  estado_orden_compra_id INT REFERENCES estado_orden_compra(estado_orden_compra_id),
  observaciones TEXT
);

CREATE TABLE detalle_orden_compra (
  detalle_orden_compra_id SERIAL PRIMARY KEY,
  orden_compra_id INT REFERENCES ordenes_compra(orden_compra_id),
  producto_id INT REFERENCES producto(producto_id),
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2)
);

CREATE TABLE recepciones (
  recepcion_id SERIAL PRIMARY KEY,
  numero_recepcion VARCHAR(50) UNIQUE,
  orden_compra_id INT REFERENCES ordenes_compra(orden_compra_id),
  proveedor_id INT REFERENCES proveedores(proveedor_id),
  almacen_id INT REFERENCES almacenes(almacen_id),
  entidad VARCHAR(100),
  fecha_recepcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cantidad_total INT,
  observaciones TEXT,
  estado_recepcion_id INT REFERENCES estado_recepcion(estado_recepcion_id)
);

CREATE TABLE detalle_recepcion (
  detalle_recepcion_id SERIAL PRIMARY KEY,
  recepcion_id INT REFERENCES recepciones(recepcion_id),
  producto_id INT REFERENCES producto(producto_id),
  lote_id INT REFERENCES lotes(lote_id),
  cantidad INT,
  precio_unitario DECIMAL(10,2)
);

-- ==============================================
--             CONTRATOS Y COTIZACIONES DE COMPRA
-- ==============================================

CREATE TABLE estado_cotizacion_compra (
  estado_cotizacion_compra_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT
);

CREATE TABLE cotizaciones_compra (
  cotizacion_compra_id SERIAL PRIMARY KEY,
  numero_cotizacion VARCHAR(50) UNIQUE,
  proveedor_id INT REFERENCES proveedores(proveedor_id),
  empresa_id INT REFERENCES empresas(empresa_id),
  fecha_cotizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_validez DATE,
  subtotal DECIMAL(10,2),
  impuesto DECIMAL(10,2),
  total DECIMAL(10,2),
  estado_cotizacion_compra_id INT REFERENCES estado_cotizacion_compra(estado_cotizacion_compra_id),
  observaciones TEXT
);

CREATE TABLE detalle_cotizacion_compra (
  detalle_cotizacion_compra_id SERIAL PRIMARY KEY,
  cotizacion_compra_id INT REFERENCES cotizaciones_compra(cotizacion_compra_id),
  producto_id INT REFERENCES producto(producto_id),
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2)
);

CREATE TABLE estado_contrato (
  estado_contrato_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT
);

CREATE TABLE contratos_compra (
  contrato_id SERIAL PRIMARY KEY,
  numero_contrato VARCHAR(50) UNIQUE,
  proveedor_id INT REFERENCES proveedores(proveedor_id),
  empresa_id INT REFERENCES empresas(empresa_id),
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_fin DATE,
  monto_total DECIMAL(10,2),
  estado_contrato_id INT REFERENCES estado_contrato(estado_contrato_id),
  terminos TEXT,
  observaciones TEXT
);

CREATE TABLE detalle_contrato_compra (
  detalle_contrato_id SERIAL PRIMARY KEY,
  contrato_id INT REFERENCES contratos_compra(contrato_id),
  producto_id INT REFERENCES producto(producto_id),
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  subtotal DECIMAL(10,2)
);

-- ==============================================
--             MOVIMIENTOS Y DEVOLUCIONES
-- ==============================================

CREATE TABLE tipo_movimiento (
  tipo_movimiento_id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  tipo VARCHAR(50),
  descripcion TEXT
);

CREATE TABLE movimientos_inventario (
  movimiento_id SERIAL PRIMARY KEY,
  producto_id INT REFERENCES producto(producto_id),
  tipo_movimiento_id INT REFERENCES tipo_movimiento(tipo_movimiento_id),
  cantidad INT,
  motivo TEXT,
  entidad_id INT,
  entidad_tipo VARCHAR(50),
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  almacen_id INT REFERENCES almacenes(almacen_id),
  empresa_id INT REFERENCES empresas(empresa_id)
);

CREATE TABLE devoluciones_compra (
  devolucion_id SERIAL PRIMARY KEY,
  numero_devolucion VARCHAR(50) UNIQUE,
  orden_compra_id INT REFERENCES ordenes_compra(orden_compra_id),
  proveedor_id INT REFERENCES proveedores(proveedor_id),
  producto_id INT REFERENCES producto(producto_id),
  cantidad INT,
  motivo_devolucion_id INT REFERENCES motivo_devolucion(motivo_devolucion_id),
  fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT
);
```

## Notas

- Asegúrate de que se cumplan las restricciones de clave externa al insertar
  datos.
- Realiza una copia de seguridad de tu base de datos antes de ejecutar el
  script.
- Si ocurren errores, verifica si hay nombres de tabla duplicados o dependencias
  faltantes. faltantes.
