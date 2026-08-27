# Promo Manager KF - Monorepo

Estructura inicial de monorepo para la prueba técnica de gestión de promociones.

---

## 🏗️ Arquitectura del Proyecto

El monorepo está organizado en dos proyectos principales y orquestado mediante Docker Compose:

```
promo-manager-kf/
├── backend/                  # API REST en Node.js + Express + TypeScript
│   ├── prisma/
│   │   └── schema.prisma    # Esquema de base de datos PostgreSQL
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts        # Validador de variables de entorno (dotenv + Zod)
│   │   ├── lib/
│   │   │   └── prisma.ts     # Instancia Singleton de Prisma Client
│   │   ├── routes/
│   │   │   └── health.router.ts # Endpoint GET /health (SELECT 1)
│   │   ├── app.ts            # Configuración de Express & Middlewares
│   │   └── index.ts          # Punto de entrada y Graceful Shutdown
│   ├── Dockerfile            # Construcción multietapa de producción
│   └── package.json
├── frontend/                 # Aplicación SPA en React + Vite + TypeScript
│   ├── src/                  # Componentes y estilos React
│   ├── nginx.conf            # Servidor web Nginx para producción
│   ├── Dockerfile            # Construcción multietapa (Node -> Nginx)
│   └── package.json
├── docker-compose.yml        # Orquestador (PostgreSQL 16, Backend, Frontend)
├── .env.example              # Variables de entorno documentadas
├── .gitignore                # Reglas de exclusión de Git
└── package.json              # Scripts globales del monorepo
```

---

## ⚙️ Requisitos Previos

- **Node.js**: v20+ (o v22+)
- **Docker** y **Docker Compose**
- **npm**: v10+

---

## 🚀 Inicio Rápido con Docker Compose

1. **Configura el archivo de entorno**:
   ```bash
   cp .env.example .env
   ```

2. **Inicia todos los servicios**:
   ```bash
   docker compose up --build
   ```

3. **Servicios disponibles**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:4000](http://localhost:4000)
   - **Healthcheck**: [http://localhost:4000/health](http://localhost:4000/health)
   - **PostgreSQL**: `localhost:5432`

---

## 💻 Desarrollo Local (Sin Docker)

### 1. Iniciar Base de Datos
Puedes levantar únicamente la base de datos PostgreSQL con Docker:
```bash
docker compose up postgres -d
```

### 2. Instalar Dependencias
Desde la raíz del monorepo:
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia los archivos `.env`:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Generar Cliente de Prisma y Ejecutar Migraciones
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Iniciar Servidores de Desarrollo
En terminales separadas o usando workspaces:

- **Backend** (puerto 4000):
  ```bash
  npm run dev:backend
  ```

- **Frontend** (puerto 3000):
  ```bash
  npm run dev:frontend
  ```

---

## 🔍 Endpoint de Salud (`GET /health`)

El backend incluye una verificación activa de conexión real con PostgreSQL mediante Prisma:

- **Respuesta Exitosa (HTTP 200)**:
  ```json
  {
    "status": "ok",
    "db": "connected"
  }
  ```

- **Respuesta de Fallo (HTTP 503)** (cuando la BD no está disponible o falla `SELECT 1`):
  ```json
  {
    "status": "error",
    "db": "disconnected"
  }
  ```

---

## 🛡️ Validación de Variables de Entorno

El archivo [`backend/src/config/env.ts`](backend/src/config/env.ts) valida automáticamente las variables de entorno al iniciar la aplicación mediante **Zod**. Si falta una variable requerida (por ejemplo `DATABASE_URL`), el proceso se detendrá inmediatamente arrojando un error descriptivo con el detalle de las variables faltantes.
