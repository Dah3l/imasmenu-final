# ¡MAS! — E-commerce de comida casera

Aplicación web para catálogo de comida con carrito de compras y checkout por WhatsApp.

## 🚀 Uso

1. Crea la estructura de carpetas y pega cada archivo
2. Abre `index.html` en un navegador (necesita un servidor local para que `localStorage` funcione bien entre archivos)
3. Para ejecutar un servidor rápido: `python -m http.server 8000` y visita `http://localhost:8000`

## 🔐 Acceso administrador

- URL: `/admin.html`
- Usuario: `admin`
- Contraseña: `mas2025`

> También puedes acceder desde el botón ⚙ del header o el link del footer.

## 📦 Archivos

- `index.html` — Tienda pública
- `admin.html` — Panel de administración (con login)
- `css/styles.css` — Estilos compartidos (reset, variables, modales)
- `css/store.css` — Solo estilos de la tienda
- `css/admin.css` — Solo estilos del panel admin
- `js/config.js` — Datos por defecto y helpers de localStorage
- `js/utils.js` — Utilidades compartidas
- `js/store.js` — Lógica de la tienda (filtros, carrito, checkout)
- `js/admin.js` — Lógica del admin (login, CRUD productos, config)

## 💾 Persistencia

Todos los datos se guardan en `localStorage`:
- `imas_products` — Catálogo de productos
- `imas_sections` — Secciones del catálogo
- `imas_config` — Configuración del negocio y credenciales
- `imas_cart` — Carrito del usuario

## ⚠️ Notas

- Las credenciales se guardan en `localStorage` — adecuado para una demo, pero **no seguro para producción** (requiere backend).
- El checkout envía el pedido por WhatsApp; configura tu número en admin.