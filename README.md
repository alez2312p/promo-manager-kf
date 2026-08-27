# PromoManager KF - Módulo de Gestión de Promociones

Sistema web full-stack para el registro, control de vigencia, estados y administración de promociones, productos y categorías en puntos de venta (POS). Diseñado e implementado siguiendo los principios de **Clean Architecture**, **Domain-Driven Design (DDD)**, **React + Vite**, **Node.js + Express + TypeScript**, **PostgreSQL + Prisma** y orquestación con **Docker Compose**.

---

## Tabla de Contenidos

- [PromoManager KF - Módulo de Gestión de Promociones](#promomanager-kf---módulo-de-gestión-de-promociones)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Características Principales](#características-principales)
  - [Arquitectura del Proyecto](#arquitectura-del-proyecto)
  - [Requisitos Previos](#requisitos-previos)
  - [Inicio Rápido con Docker Compose](#inicio-rápido-con-docker-compose)
  - [Desarrollo Local (Sin Docker)](#desarrollo-local-sin-docker)
    - [1. Iniciar el servicio de base de datos](#1-iniciar-el-servicio-de-base-de-datos)
    - [2. Instalar dependencias del monorepo](#2-instalar-dependencias-del-monorepo)
    - [3. Configurar variables de entorno](#3-configurar-variables-de-entorno)
    - [4. Sincronizar esquema y poblar datos iniciales](#4-sincronizar-esquema-y-poblar-datos-iniciales)
    - [5. Iniciar servidores de desarrollo](#5-iniciar-servidores-de-desarrollo)
  - [Datos de Prueba (Seed Database)](#datos-de-prueba-seed-database)
  - [Endpoint de Salud (GET /health)](#endpoint-de-salud-get-health)
  - [Pruebas Unitarias](#pruebas-unitarias)
  - [Pipeline de CI/CD (GitHub Actions)](#pipeline-de-cicd-github-actions)
  - [Justificación de Decisiones Técnicas](#justificación-de-decisiones-técnicas)

---

## Características Principales

- **Gestión Integral de Promociones**:
  - Creación con validaciones estrictas: nombre, código único, tipo de descuento (`Porcentaje` o `Monto Fijo`), valor, fecha de inicio y fin.
  - Alcance configurable: aplicación global (toda la tienda), por categoría o por producto específico.
  - Flujo de ciclo de vida de estados: `Programada` -> `Activa` -> `Finalizada`.
  - Eliminación segura mediante diálogo de confirmación (restringida exclusivamente al estado `Programada`).
  - Inmutabilidad estricta para promociones en estado `Finalizada`.
- **Dashboard y Vista de Resumen**:
  - Métricas en tiempo real con conteo por estado (`Programadas`, `Activas`, `Finalizadas`).
  - Conteo y tabla dedicada de promociones vigentes hoy (evaluadas en tiempo real en zona horaria UTC).
- **Catálogo de Productos y Categorías**:
  - Tabla responsiva con vista híbrida (tarjetas compactas en móvil y tabla de datos con desplazamiento horizontal en escritorio).
  - Precios formateados en Pesos Colombianos (COP).
  - Generador automático de códigos SKU con ayuda contextual.
  - Reasignación asistida al eliminar categorías con productos asociados (transferencia a otra categoría o desvinculación a "Sin Categoría").
- **Interfaz y Experiencia de Usuario**:
  - Diseño Mobile-First desarrollado con **Tailwind CSS** y componentes accesibles de **shadcn/ui**.

---

## Arquitectura del Proyecto

El repositorio está estructurado como un monorepo con separación modular de responsabilidades:

```
promo-manager-kf/
├── backend/                       # API REST (Clean Architecture + DDD)
│   ├── prisma/
│   │   ├── schema.prisma         # Esquema relacional PostgreSQL
│   │   └── seed.ts               # Datos iniciales de prueba en COP
│   ├── src/
│   │   ├── domain/               # Entidades, Excepciones e Interfaces de Repositorio
│   │   ├── application/          # Servicios de Dominio y DTOs
│   │   ├── infrastructure/       # Repositorios Prisma, Controladores y Routers Express
│   │   ├── config/               # Validador de variables de entorno con Zod
│   │   └── index.ts              # Punto de entrada y Graceful Shutdown
│   ├── Dockerfile                # Construcción multietapa (Node 20 Alpine)
│   └── package.json
├── frontend/                      # SPA (React 18 + Vite + TypeScript)
│   ├── src/
│   │   ├── components/layout/    # Navbar responsivo con Sheet móvil y MainLayout
│   │   ├── components/ui/        # Componentes base shadcn/ui & DeleteConfirmModal
│   │   ├── features/             # Módulos: promotions, products, categories, dashboard
│   │   ├── pages/                # Vistas principales de React Router
│   │   └── lib/utils.ts          # Utilidades y formateador de moneda COP
│   ├── nginx.conf                 # Configuración de Nginx para producción con Gzip
│   ├── Dockerfile                 # Construcción multietapa (Node 20 -> Nginx Alpine)
│   └── package.json
├── .github/workflows/
│   └── ci.yml                    # Pipeline CI/CD: lint -> test -> build-docker -> smoke-test
├── docker-compose.yml             # Orquestador (PostgreSQL 16, Backend, Frontend)
├── DECISIONS.md                   # Documento de justificación técnica y arquitectura
├── .env.example                   # Plantilla de variables de entorno
└── README.md
```

---

## Requisitos Previos

- **Docker** (v24+) y **Docker Compose** (v2+)
- *Para ejecución local sin Docker*:
  - **Node.js**: v20 LTS o superior
  - **npm**: v10+
  - **PostgreSQL**: v14+ (puerto 5433 o 5432)

---

## Inicio Rápido con Docker Compose

El proyecto puede inicializarse por completo mediante un único comando:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/alez2312p/promo-manager-kf.git
   cd promo-manager-kf
   ```

2. **Crear archivo de variables de entorno**:
   ```bash
   cp .env.example .env
   ```

3. **Construir y levantar los contenedores**:
   ```bash
   docker compose up --build
   ```

4. **Acceso a los servicios**:
   - **Frontend (Aplicación Web)**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:4000](http://localhost:4000)
   - **Healthcheck**: [http://localhost:4000/health](http://localhost:4000/health)
   - **PostgreSQL**: `localhost:5433` (usuario: `postgres`, base de datos: `promo_db`)

---

## Desarrollo Local (Sin Docker)

Para ejecutar el entorno de desarrollo localmente sin contenedores para la aplicación:

### 1. Iniciar el servicio de base de datos
```bash
docker compose up postgres -d
```

### 2. Instalar dependencias del monorepo
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Sincronizar esquema y poblar datos iniciales
```bash
npm --workspace=backend run prisma:push
npm --workspace=backend run prisma:seed
```

### 5. Iniciar servidores de desarrollo
En dos terminales independientes:

- **Backend** (puerto 4000):
  ```bash
  npm --workspace=backend run dev
  ```

- **Frontend** (puerto 3000 / 5173):
  ```bash
  npm --workspace=frontend run dev
  ```

---

## Datos de Prueba (Seed Database)

Para restablecer la base de datos con categorías, productos y promociones de ejemplo:
```bash
npm --workspace=backend run prisma:seed
```

---

## Endpoint de Salud (GET /health)

El backend expone un endpoint que ejecuta una verificación activa contra PostgreSQL mediante una consulta `SELECT 1`:

- **Solicitud**: `GET http://localhost:4000/health`
- **Respuesta 200 OK (Servicio y Base de Datos Operativos)**:
  ```json
  {
    "status": "ok",
    "db": "connected"
  }
  ```
- **Respuesta 503 Service Unavailable (Fallo en Conexión)**:
  ```json
  {
    "status": "error",
    "db": "disconnected"
  }
  ```

---

## Pruebas Unitarias

Ejecuta la suite de pruebas unitarias automatizadas con Vitest:
```bash
npm run test
```

Valida exhaustivamente las reglas de negocio de promociones (rangos de fechas, valores de descuento porcentual y fijo, inmutabilidad y eliminación controlada).

---

## Pipeline de CI/CD (GitHub Actions)

El archivo [`.github/workflows/ci.yml`](.github/workflows/ci.yml) define un pipeline automatizado estructurado en 3 etapas secuenciales:

1. **1. Lint & Unit Tests**: Verificación de tipos con `tsc --noEmit` y ejecución de pruebas unitarias con Vitest.
2. **2. Build Docker Images**: Construcción de las imágenes Docker multietapa de Backend y Frontend.
3. **3. Integration Smoke Test**:
   - Validación estricta de variables de entorno y secretos requeridos.
   - Despliegue de los servicios con `docker compose up -d`.
   - Sondeo al endpoint `GET /health` con validación de código HTTP 200 y conectividad a base de datos.
   - En caso de anomalía, extracción automática de logs de contenedores y terminación con código de error.

---

## Justificación de Decisiones Técnicas

Para consultar el análisis detallado sobre la selección de arquitectura, tecnologías y patrones de diseño utilizados en este proyecto, revise el documento **[`DECISIONS.md`](DECISIONS.md)**.
