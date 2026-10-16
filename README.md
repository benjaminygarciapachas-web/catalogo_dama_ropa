# CATALOGO DAMA ROPA - Aplicación Full-Stack

Aplicación web profesional completa (Back-End + Front-End) de catálogo de ropa para dama con arquitectura modular, base de datos SQLite sincronizada, almacenamiento persistente en la nube mediante Cloudinary, autenticación estricta con roles de usuario y administrador, y sincronización en tiempo real mediante WebSockets.

---

## 🚀 Despliegue en Render

El proyecto está configurado para desplegarse fácilmente en **Render**:

1. Conectar el repositorio de GitHub: `https://github.com/benjaminygarciapachas-web/catalogo_dama_ropa`
2. **Build Command**: `npm install && cd backend && npm install && node seed.mjs`
3. **Start Command**: `node server.js`
4. **Node Version**: `>=22.5.0` (o especificar `NODE_VERSION: 22.12.0`)
5. **Variables de Entorno Recomendadas**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `ADMIN_USER`: `PATTYps`
   - `ADMIN_PASS`: `PATTYpschincha452416`
   - `JWT_SECRET`: `catalogo_dama_jwt_secure_key_452416_pattyps`
   - `CLOUDINARY_CLOUD_NAME`: `hvoicb7h`
   - `CLOUDINARY_API_KEY`: `296764566543229`
   - `CLOUDINARY_API_SECRET`: `PjrI6SwHn6CAb5Dmsfh26m5wzlg`

---

## 📁 Estructura del Proyecto

```text
catalogo_dama/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Conexión y helpers SQL (SQLite nativo Node 22+)
│   │   │   ├── cloudinary.js        # Integración Cloudinary y sincronización en la nube
│   │   │   ├── init.sql             # Esquema SQL (roles, usuarios, sesiones, categorías, subcategorías, productos)
│   │   │   └── catalogo.sqlite      # Archivo de base de datos SQL local
│   │   ├── controllers/
│   │   │   ├── authController.js    # Lógica de login estricto y fallback de seguridad
│   │   │   ├── sessionController.js # Monitoreo de sesiones en tiempo real
│   │   │   ├── categoryController.js# Categorías y subcategorías de ropa de dama
│   │   │   └── productController.js # CRUD completo de productos con eventos Socket.io
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js    # JWT y protección exclusiva de administrador
│   │   │   └── uploadMiddleware.js  # Multer para procesamiento de imágenes
│   │   ├── models/
│   │   │   ├── userModel.js         # Consultas SQL para usuarios y roles
│   │   │   ├── sessionModel.js      # Registro SQL de sesiones activas en tiempo real
│   │   │   ├── categoryModel.js     # Consultas SQL de categorías y subcategorías
│   │   │   └── productModel.js      # Consultas SQL para productos con filtros
│   │   └── routes/
│   │       ├── authRoutes.js        # Rutas /api/auth
│   │       ├── sessionRoutes.js     # Rutas /api/sessions (Panel en tiempo real)
│   │       ├── categoryRoutes.js    # Rutas /api/categories
│   │       └── productRoutes.js     # Rutas /api/products
│   ├── uploads/                     # Carpeta temporal para procesamiento de imágenes
│   ├── .env                         # Variables de entorno locales
│   ├── index.js                     # Servidor Express + CORS + WebSockets (Socket.IO)
│   ├── package.json                 # Dependencias del backend
│   └── seed.mjs                     # Script de inicialización de datos base
├── frontend/
│   ├── css/
│   │   └── styles.css               # Diseño moderno, responsivo y elegante
│   ├── js/
│   │   ├── app.js                   # Lógica principal, filtros dinámicos, lightbox y catálogo
│   │   ├── socket.js                # Conexión WebSockets y presencia en tiempo real
│   │   └── admin.js                 # Panel de administración, subida de prendas y sesiones
│   └── index.html                   # Interfaz interactiva ("CATALOGO DAMA ROPA")
├── server.js                        # Punto de entrada universal raíz
├── render.yaml                      # Configuración automática para Render Blueprint
├── Dockerfile                       # Contenedor listo para despliegues Docker
├── .node-version                    # Versión de Node.js fijada a 22.12.0
├── package.json                     # Scripts y dependencias principales
└── README.md
```

---

## ⚡ Instalación y Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. Inicializar base de datos:
   ```bash
   npm run seed
   ```

3. Iniciar el servidor:
   ```bash
   npm start
   ```

4. Abrir en el navegador:
   ```text
   http://localhost:3000
   ```

---

## 👑 Credenciales de Acceso

- **Administrador**:
  - **Usuario**: `PATTYps`
  - **Contraseña**: `PATTYpschincha452416`
  - **Privilegios**: Subir prendas, modificar catálogo, eliminar productos y monitoreo en vivo de visitantes.

- **Cliente / Visitante**:
  - Ingreso directo o con cualquier nombre de usuario invitado.

---

## 📂 Subcategorías de Ropa de Dama

### Grupo Marca:
1. polivestidos de marca
2. polos y blusas de marca
3. chompas y casacas de marca
4. pantalones shrots marca
5. conjuntos de marca

### Grupo Normal:
6. pantalones, enterizos y jeans
7. shorts y faldas
8. plussize
9. vestidos
10. polos
11. blusas
12. poleras
13. casacas
14. chompas
15. conjuntos
16. ropa_fitnes
17. blazzer
