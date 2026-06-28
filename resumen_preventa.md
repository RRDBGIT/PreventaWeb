📱 Resumen del Proyecto: App de Preventa Web
🔧 Tecnologías
Frontend: React.js
Backend: Node.js + Express
Base de datos: MySQL
Autenticación: JWT + localStorage
✅ Funcionalidades implementadas
1. Gestión de Pedidos
Flujo de 3 pasos: Cliente → Pedido → Confirmación
Selección de cliente, forma de pago, lista de precios y fecha de vencimiento
Carga de productos por código o catálogo
Carrito con visualización de items, cantidades y totales
Generación automática de número de pedido único: idVendedor-YYMMDDNNN
2. Valores por Defecto Inteligentes
Fecha de vencimiento: automáticamente +2 días desde hoy
Forma de pago: se selecciona automáticamente la que tiene predefinido = 1 en la base de datos
Lista de precios: selección manual (requerimiento del negocio)
Fecha de entrega: prefijada a +1 día en la confirmación
3. Cierre de Día
Botón "Cerrar Día" en el panel principal
Resumen del día: muestra nombre del vendedor, total de pedidos, clientes atendidos y facturación
Al confirmar el cierre:
Marca los pedidos del día con FinDelDia = NOW()
Cierra sesión automáticamente y redirige al login
4. Optimizaciones para Móviles
Catálogo de productos:
Scroll horizontal para columnas (Cod, Descripción, Precio)
Scroll vertical cuando hay muchos productos
Fuentes reducidas para mejor visualización
Descripción en múltiples líneas
Carrito:
Columnas optimizadas: Cod (10%), Descripción (30%), Cant. (8%), Precio (37%)
Precios con decimales completos visibles
Fuentes ajustadas para valores grandes
5. Manejo de Errores y Experiencia de Usuario
Validación de campos obligatorios
Mensajes de error claros
Transacciones en base de datos (rollback en errores)
Prevención de duplicados en números de pedido
Lista de precios bloqueada tras agregar primer producto
6. Priorización de Pedidos Entrega Inmediata
Cuando la fecha de entrega = fecha actual, el pedido se marca automáticamente con FinDelDia = NOW()
Esto permite identificar pedidos urgentes para descarga prioritaria
🗂️ Estructura de Archivos Clave
Frontend (/src)
App.js: Rutas protegidas y autenticación
components/Pedido.jsx: Componente principal con flujo de pedidos
components/ProductoSelector.jsx: Catálogo de productos responsive
components/Carrito.jsx: Visualización optimizada del carrito
components/ConfirmacionPedido.jsx: Formulario de confirmación con fecha de entrega
components/ResumenCierreModal.jsx: Modal de resumen de cierre diario
utils/auth.js: Gestión de autenticación y tokens
Backend (/BackEnd)
controllers/pedidoController.js: Lógica de pedidos, cierre de día y resumen
models/db.js: Conexión a MySQL con pool robusto
Rutas para: /pedidos, /catalogos/formas-pago, /pedidos/cerrar-dia, etc.
🚀 Estado Actual
✅ Totalmente funcional en desarrollo
✅ Responsive para móviles (Samsung A55 probado)
✅ Sin pérdida de funcionalidad en ninguna actualización
✅ Listo para producción