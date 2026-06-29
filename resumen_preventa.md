# 📱 Resumen del Proyecto: App de Preventa Web

**Fecha de última actualización:** 29 de junio de 2026

---

## 🔧 Tecnologías

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **Autenticación:** JWT + localStorage
- **Mapas:** Leaflet + OpenStreetMap
- **PDF:** @react-pdf/renderer

---

## ✅ Funcionalidades Implementadas

### 1. Gestión de Pedidos

- **Flujo de 3 pasos:** Cliente → Pedido → Confirmación
- **Selección de cliente** con búsqueda por número o razón social
- **Selección de forma de pago** con valor por defecto inteligente
- **Selección de lista de precios** (manual, requerimiento del negocio)
- **Fecha de vencimiento:** automáticamente +2 días desde hoy
- **Fecha de entrega:** prefijada a +1 día en la confirmación
- **Carga de productos:**
  - Por código (búsqueda rápida)
  - Por catálogo (navegación visual)
- **Carrito con visualización** de items, cantidades y totales
- **Generación automática de número de pedido único:**
  - Formato: `idVendedor-YYMMDDNNN`
  - Ejemplo: `1-260629001`
  - **Corregido:** Usa MAX correlativo en lugar de COUNT para evitar duplicados al eliminar pedidos

### 2. Valores por Defecto Inteligentes

- **Fecha de vencimiento:** automáticamente +2 días desde hoy
- **Forma de pago:** se selecciona automáticamente la que tiene `predefinido = 1` en la base de datos
- **Lista de precios:** selección manual (requerimiento del negocio)
- **Fecha de entrega:** prefijada a +1 día en la confirmación

### 3. Cierre de Día

- **Botón "Cerrar Día"** en el panel principal
- **Resumen del día:** muestra nombre del vendedor, total de pedidos, clientes atendidos y facturación
- **Al confirmar el cierre:**
  - Marca los pedidos del día con `FinDelDia = NOW()`
  - Cierra sesión automáticamente y redirige al login
- **Regla de negocio:** Solo los pedidos con `FinDelDia IS NULL` pueden ser editados o eliminados

### 4. 📊 Resumen de Pedidos del Día (NUEVO)

- **Nueva pestaña "📊 Resumen"** en el panel principal
- **Selector de fecha** para ver pedidos de cualquier día
- **Tarjetas de totales:**
  - Total de pedidos
  - Facturación total
  - Clientes únicos atendidos
- **Tabla de pedidos** con:
  - Número de pedido
  - Cliente y forma de pago
  - Total
  - Cantidad de items
  - Estado (✅ Abierto / 🔒 Cerrado)
  - Acciones (ver detalle, editar, eliminar)
- **Modal de detalle:**
  - Información completa del pedido
  - Lista de productos con códigos, descripciones, cantidades, precios y totales
- **Editor de pedido completo:**
  - Modificar fechas (entrega y vencimiento)
  - Editar cantidades y precios de items
  - Agregar nuevos productos desde el catálogo
  - Eliminar items del pedido
  - Recálculo automático del total
- **Eliminación de pedidos:**
  - Confirmación obligatoria antes de eliminar
  - Solo permite eliminar pedidos con `FinDelDia IS NULL`
  - Transacción en backend que elimina items y pedido
- **Validación de pedidos cerrados:**
  - Botones de editar/eliminar deshabilitados para pedidos cerrados
  - Mensajes de error claros si se intenta modificar un pedido cerrado

### 5. 🌍 Geolocalización de Clientes

- **Captura de ubicación GPS** al crear o editar un cliente
- **Visualización en mapa** usando Leaflet + OpenStreetMap
- **Botón "📍 Ver en mapa"** en cada cliente
- **Modal con mapa interactivo:**
  - Marcador con información del cliente
  - Enlace a Google Maps para navegación
  - Coordenadas mostradas (latitud/longitud)
- **Corrección implementada:**
  - Orden correcto en `POINT(longitud, latitud)` para MySQL
  - Validación de coordenadas válidas antes de guardar

### 6. 🔄 Sistema de Versionado (NUEVO)

- **Badge de versión visible** en esquina inferior derecha
- **Información mostrada:**
  - Versión del frontend (FE)
  - Versión del backend (BE)
  - Build number
  - Commit hash
  - Timestamp
- **Actualización automática:**
  - Script que incrementa build number en cada `npm start` o `npm run build`
  - Integración con variables de entorno de Render para backend
- **Detección de actualizaciones:**
  - Verificación periódica cada 5 minutos
  - Alerta automática cuando hay nueva versión disponible
  - Botón para recargar la app
- **Vista expandible:**
  - Click en el badge muestra información detallada
  - Información del backend: servicio, región, uptime, versión de Node

### 7. Optimizaciones para Móviles

- **Catálogo de productos:**
  - Scroll horizontal para columnas (Cod, Descripción, Precio)
  - Scroll vertical cuando hay muchos productos
  - Fuentes reducidas para mejor visualización
  - Descripción en múltiples líneas
- **Carrito:**
  - Columnas optimizadas: Cod (10%), Descripción (30%), Cant. (8%), Precio (37%)
  - Precios con decimales completos visibles
  - Fuentes ajustadas para valores grandes
- **Editor de pedidos:**
  - Tabla responsive con scroll horizontal
  - Inputs optimizados para edición en móvil
  - Modal de búsqueda de productos adaptado

### 8. Manejo de Errores y Experiencia de Usuario

- **Validación de campos obligatorios** en todos los formularios
- **Mensajes de error claros** y específicos
- **Transacciones en base de datos** (rollback en errores)
- **Prevención de duplicados** en números de pedido (usando MAX correlativo)
- **Lista de precios bloqueada** tras agregar primer producto
- **Confirmaciones obligatorias** antes de acciones destructivas (eliminar pedido, vaciar carrito)
- **Estados de carga** visibles en botones y modales
- **Logs detallados** en backend para debugging

### 9. Reglas de Negocio Implementadas

- **FinDelDia:**
  - Siempre `NULL` al crear un pedido
  - Solo se setea con `NOW()` al ejecutar "Cerrar Día"
  - Determina si un pedido puede ser editado/eliminado
- **Edición de pedidos:**
  - Solo permite editar pedidos con `FinDelDia IS NULL`
  - Validación doble: frontend y backend
  - Mensaje de error claro si se intenta editar pedido cerrado
- **Eliminación de pedidos:**
  - Solo permite eliminar pedidos con `FinDelDia IS NULL`
  - Confirmación obligatoria con datos del pedido
  - Transacción que elimina items y pedido
- **Generación de números de pedido:**
  - Usa `MAX(correlativo) + 1` en lugar de `COUNT(*) + 1`
  - Evita duplicados cuando se eliminan pedidos
  - Formato: `idVendedor-YYMMDDNNN`

---

## 🗂️ Estructura de Archivos Clave

### Frontend (`/src`)
src/
├── App.js # Rutas protegidas, autenticación y badge de versión
├── components/
│ ├── Pedido.jsx # Componente principal con flujo de pedidos + botón Resumen
│ ├── ClienteSelector.jsx # Selector de clientes con geolocalización
│ ├── ProductoSelector.jsx # Catálogo de productos responsive
│ ├── BusquedaPorCodigo.jsx # Búsqueda rápida por código
│ ├── Carrito.jsx # Visualización optimizada del carrito
│ ├── ConfirmacionPedido.jsx # Formulario de confirmación con fecha de entrega
│ ├── ResumenPedidosDia.jsx # NUEVO: Resumen de pedidos con edición y eliminación
│ ├── ResumenCierreModal.jsx # Modal de resumen de cierre diario
│ ├── MapaCliente.jsx # Visualización de ubicación en mapa
│ ├── VersionBadge.jsx # NUEVO: Badge de versión expandible
│ └── UpdateAlert.jsx # NUEVO: Alerta de actualización disponible
├── hooks/
│ ├── useVersion.js # NUEVO: Hook para obtener versión
│ └── useVersionCheck.js # NUEVO: Hook para verificar actualizaciones
├── utils/
│ └── auth.js # Gestión de autenticación y tokens
└── scripts/
└── update-version.js # NUEVO: Script de actualización de versión
123
BackEnd/
├── controllers/
│ ├── pedidoController.js # Lógica de pedidos, cierre de día, resumen, edición y eliminación
│ └── clienteController.js # Lógica de clientes con geolocalización
├── routes/
│ ├── pedidos.js # Rutas de pedidos (incluye DELETE /:id)
│ ├── clientes.js # Rutas de clientes
│ └── version.js # NUEVO: Endpoint de versión del backend
├── models/
│ └── db.js # Conexión a MySQL con pool robusto
└── public/
└── version.json # NUEVO: Archivo de versión del frontend

---

## 🔌 Endpoints Principales

### Pedidos

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/pedidos` | Crear pedido nuevo |
| GET | `/api/pedidos/vendedor/:idVendedor` | Obtener pedidos por vendedor |
| GET | `/api/pedidos/resumen-dia?fecha=YYYY-MM-DD&idVendedor=X` | Obtener resumen de pedidos por fecha |
| PUT | `/api/pedidos/:id` | Editar pedido completo (fechas + items) |
| DELETE | `/api/pedidos/:id` | Eliminar pedido (solo si no está cerrado) |
| POST | `/api/pedidos/cerrar-dia` | Cerrar día del vendedor |
| GET | `/api/pedidos/cierre/resumen/:idVendedor` | Obtener resumen de cierre diario |

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes` | Obtener todos los clientes |
| POST | `/api/clientes` | Crear cliente nuevo con geolocalización |
| PUT | `/api/clientes/:id` | Actualizar cliente (incluye geolocalización) |
| GET | `/api/clientes/ubicacion` | Obtener clientes con geolocalización |

### Versionado

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/version` | Obtener información de versión del backend |
| GET | `/version.json` | Obtener información de versión del frontend (archivo estático) |

---

## 🗄️ Estructura de Base de Datos

### Tabla `Pedidos`

```sql
CREATE TABLE Pedidos (
    IdPedido INT AUTO_INCREMENT PRIMARY KEY,
    NumeroPedido VARCHAR(20) UNIQUE NOT NULL,
    IdCliente INT NOT NULL,
    FechaPedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    FechaEntrega DATE,
    FechaVencimiento DATE,
    IdFormaPago INT,
    IdListaPrecios INT,
    Total DECIMAL(10,2),
    Estado VARCHAR(20) DEFAULT 'CONFIRMADO',
    IdVendedor INT,
    FinDelDia DATETIME NULL,
    FOREIGN KEY (IdCliente) REFERENCES Clientes(IdCliente),
    FOREIGN KEY (IdFormaPago) REFERENCES FormasDePago(IdPago),
    FOREIGN KEY (IdListaPrecios) REFERENCES ListasDePrecios(IdLista),
    FOREIGN KEY (IdVendedor) REFERENCES Usuarios(IdUsuario)
);

Campo FinDelDia:
NULL → Pedido abierto (editable/eliminable)
DATETIME → Pedido cerrado (solo lectura)
Tabla DetallePedidos
CREATE TABLE DetallePedidos (
    IdDetalle INT,
    NumeroPedido VARCHAR(20),
    IdProducto INT,
    IdLista INT,
    Cantidad INT,
    PrecioUnitario DECIMAL(10,2),
    Importe DECIMAL(10,2),
    PRIMARY KEY (IdDetalle, NumeroPedido),
    FOREIGN KEY (NumeroPedido) REFERENCES Pedidos(NumeroPedido) ON DELETE CASCADE,
    FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto)
);
Tabla Clientes
CREATE TABLE Clientes (
    IdCliente INT AUTO_INCREMENT PRIMARY KEY,
    NumeroCliente VARCHAR(10) UNIQUE,
    RazonSocial VARCHAR(100),
    Direccion VARCHAR(200),
    Telefono VARCHAR(20),
    IdLocalidad INT,
    CUIT VARCHAR(20),
    Saldo DECIMAL(10,2),
    geolocalizacion POINT,
    FOREIGN KEY (IdLocalidad) REFERENCES Localidades(IdLocalidad)
);
🚀 Estado Actual
✅ Completado
Totalmente funcional en desarrollo
Responsive para móviles (Samsung A55 probado)
Sin pérdida de funcionalidad en ninguna actualización
Sistema de versionado completo (frontend + backend)
Resumen de pedidos del día con edición y eliminación
Geolocalización de clientes funcionando
Reglas de negocio implementadas (FinDelDia, validaciones)
Generación de números de pedido sin duplicados
Edición completa de pedidos (fechas + items)
Eliminación de pedidos con validación
Listo para producción
🎯 Próximos Pasos Sugeridos
Desplegar en Render (backend) y Vercel/Netlify (frontend)
Configurar HTTPS para habilitar geolocalización en producción
Implementar backup automático de base de datos
Agregar reportes estadísticos (ventas por período, productos más vendidos)
Implementar sincronización offline para vendedores sin conexión
Agregar firma digital en confirmación de pedidos
Integrar con sistema de facturación electrónica
📝 Historial de Cambios Recientes
29 de junio de 2026
✅ Agregado sistema de versionado completo (badge + detección de actualizaciones)
✅ Implementado resumen de pedidos del día con selector de fecha
✅ Agregada edición completa de pedidos (fechas + items + agregar/eliminar productos)
✅ Implementada eliminación de pedidos con validación de FinDelDia
✅ Corregida generación de números de pedido (MAX en lugar de COUNT)
✅ Corregida lógica de FinDelDia (siempre NULL al crear, solo cerrarDia lo setea)
✅ Corregida geolocalización de clientes (orden correcto en POINT)
✅ Agregadas validaciones de pedidos cerrados (no editables/eliminables)
📞 Soporte
Para consultas o problemas, revisar los logs del backend en la consola de Node.js y la consola del navegador (F12) para el frontend.

---

## 📋 Resumen de lo actualizado:

### **Nuevas funcionalidades agregadas:**

1. ✅ **Sistema de versionado completo** (badge + detección de actualizaciones)
2. ✅ **Resumen de pedidos del día** con selector de fecha
3. ✅ **Edición completa de pedidos** (fechas + items + agregar/eliminar productos)
4. ✅ **Eliminación de pedidos** con validación de FinDelDia
5. ✅ **Geolocalización de clientes** funcionando correctamente

### **Correcciones importantes:**

1. ✅ **Generación de números de pedido** sin duplicados (MAX en lugar de COUNT)
2. ✅ **Lógica de FinDelDia** corregida (siempre NULL al crear, solo cerrarDia lo setea)
3. ✅ **Geolocalización** con orden correcto en POINT(longitud, latitud)
4. ✅ **Validaciones** de pedidos cerrados (no editables/eliminables)

### **Documentación agregada:**

1. ✅ **Estructura de archivos** completa (frontend + backend)
2. ✅ **Endpoints principales** con métodos y descripciones
3. ✅ **Estructura de base de datos** con campos y relaciones
4. ✅ **Reglas de negocio** documentadas
5. ✅ **Historial de cambios** con fecha
6. ✅ **Próximos pasos sugeridos**

**¿Querés que agreguemos algo más o seguimos con otra funcionalidad?** 🚀
