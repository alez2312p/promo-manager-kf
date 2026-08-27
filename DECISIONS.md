# DECISIONS.md - Justificación de Decisiones Técnicas

Este documento reúne las decisiones de diseño, arquitectura y selección de tecnologías aplicadas en el desarrollo del **Módulo de Gestión de Promociones (PromoManager KF)**, explicando tanto el sustento técnico como la experiencia práctica que motivó cada elección.

---

## 1. Enfoque y Filosofía de Desarrollo

Para esta prueba técnica opté por un stack donde tengo amplia experiencia práctica y dominio en entornos de producción: el ecosistema de **TypeScript** de punta a punta (**Node.js + Express** en backend y **React + Vite** en frontend). 

En lugar de construir una solución genérica, decidí estructurar el proyecto bajo principios de **Clean Architecture (Arquitectura Limpia)** y **Domain-Driven Design (DDD)**. Esto permite aislar por completo las reglas de negocio de las promociones (validación de rangos de fechas, límites de porcentaje, inmutabilidad de estados finalizados y restricciones de borrado) respecto a la base de datos o el framework HTTP.

---

## 2. Backend: Node.js + Express vs Laravel

La prueba permitía elegir libremente entre **Node.js** o **Laravel**. Mi decisión de usar **Node.js con Express y TypeScript** se basó en los siguientes factores:

- **Experiencia y velocidad de entrega**: Vengo trabajando extensamente con TypeScript tanto en frontend (React, Next.js) como en backend (Node.js, Express, NestJS). Mantener un único lenguaje tipado en todo el monorepo reduce la fricción de cambio de contexto y permite compartir tipos y modelos conceptuales con mayor facilidad.
- **Control y ligereza**: A diferencia de la sobrecarga y convenciones rígidas de Laravel (donde muchas cosas ocurren por "magia" del framework), Express ofrece un control absoluto sobre el pipeline de middlewares, el manejo de errores centralizado y la inyección de dependencias hacia los servicios de dominio.
- **Arquitectura desacoplada**: Organicé el backend en tres capas bien definidas:
  - **Dominio (`src/domain/`)**: Entidades con comportamiento (`Promotion`, `Product`, `Category`), errores semánticos (`DomainError`) e interfaces de repositorio sin ninguna dependencia externa.
  - **Aplicación (`src/application/`)**: Casos de uso y DTOs que orquestan las operaciones del negocio.
  - **Infraestructura (`src/infrastructure/`)**: Implementaciones reales de base de datos con Prisma, controladores HTTP Express y esquemas de validación Zod.

---

## 3. Validación con Zod en Backend y Frontend

Decidí usar **Zod** en ambas capas de la aplicación por su capacidad para inferir tipos de TypeScript automáticamente y su enfoque *fail-fast*:

- En el **Backend**: Valida las solicitudes HTTP en el middleware antes de que alcancen los servicios de aplicación. Si un payload viene con tipos incorrectos o campos faltantes, la petición se rechaza de inmediato con un error 400 descriptivo.
- En el **Frontend**: Se integra directamente con **React Hook Form** mediante `@hookform/resolvers/zod`, permitiendo que las mismas reglas de validación (por ejemplo, que el porcentaje esté entre 1 y 100 o que la fecha final sea posterior a la inicial) se apliquen de forma instantánea en la interfaz del usuario.

---

## 4. Persistencia: PostgreSQL 16 + Prisma ORM

Elegí **PostgreSQL** junto a **Prisma ORM** por las siguientes razones:

- **Seguridad en tipos relacionales**: Prisma genera tipos estáticos directamente desde el archivo `schema.prisma`, lo que evita discrepancias entre el modelo de datos y el código TypeScript.
- **Integridad referencial y transacciones**: 
  - La relación entre promociones, productos y categorías utiliza claves foráneas con reglas `onDelete: SetNull`.
  - Para la eliminación de categorías que contienen productos asociados, implementé un flujo asistido: el backend ejecuta una transacción atómica (`prisma.$transaction`) que permite al usuario decidir si desea reasignar esos productos a otra categoría existente o dejarlos desvinculados como "Sin Categoría", garantizando que nunca se produzcan errores de llaves foráneas ni productos huérfanos.
- **Índices estratégicos**: Se definieron índices en `code`, `status`, `sku`, `categoryId` y `productId` para optimizar las consultas de filtrado y verificación de vigencias en el POS.

---

## 5. Frontend: React 18, Vite, Tailwind CSS y shadcn/ui

Para la interfaz de usuario me apoyé en herramientas con las que construyo aplicaciones modernas diariamente (incluyendo experiencia en proyectos con **Next.js** y **React**):

- **Vite en lugar de Create React App**: Ofrece un entorno de desarrollo con Hot Module Replacement (HMR) casi instantáneo y una compilación de producción optimizada mediante Rollup.
- **Tailwind CSS + shadcn/ui**: 
  - Me gusta el enfoque de **shadcn/ui** porque los componentes no son una librería empaquetada externa que restringe el diseño, sino código fuente basado en **Radix UI** que vive dentro de mi propio proyecto (`src/components/ui`). Esto me permitió personalizar el comportamiento y la estética de los modales de confirmación, tooltips de ayuda para el SKU y menús responsivos.
  - Diseñé la interfaz con enfoque **Mobile-First**: en pantallas móviles las tablas de promociones y productos se convierten en tarjetas compactas de lectura rápida, y en escritorio se transforman en tablas con scroll horizontal seguro.
- **TanStack Query (React Query v5)**:
  - Lo seleccioné para el manejo del estado asíncrono y caché del servidor. Elimina la necesidad de usar Redux o `useEffect` manuales para peticiones, y permite invalidar y refrescar automáticamente las listas de promociones, productos y métricas tras cada creación, edición o borrado.

---

## 6. Docker y Despliegue con Docker Compose

Para cumplir con la facilidad de ejecución mediante `docker compose up --build`, preparé configuraciones multietapa optimizadas:

- **Backend Dockerfile**: Compila TypeScript en una primera etapa y transfiere solo el código compilado (`dist/`) y las dependencias de producción a una imagen final `node:20-alpine`, ejecutándose bajo un usuario sin privilegios (`USER node`).
- **Frontend Dockerfile**: Construye los estáticos de Vite y los sirve a través de un contenedor ligero de **Nginx Alpine**, configurado con compresión Gzip, políticas de caché estático y fallback para enrutamiento SPA (`try_files $uri /index.html`).
- **Orquestación**: `docker-compose.yml` inicia PostgreSQL, aguarda a que esté saludable mediante `pg_isready` y luego levanta el backend y frontend en una red interna compartida.

---

## 7. Endpoint de Salud (GET /health)

El requerimiento de la prueba exigía un endpoint de monitoreo real. En [`backend/src/routes/health.router.ts`](backend/src/routes/health.router.ts) implementé un healthcheck que ejecuta una consulta `SELECT 1` activa en PostgreSQL:

- Retorna `HTTP 200 OK` con `{ "status": "ok", "db": "connected" }` únicamente cuando la API y la conexión a base de datos están completamente operativas.
- Retorna `HTTP 503 Service Unavailable` con `{ "status": "error", "db": "disconnected" }` si la base de datos no está disponible.

---

## 8. Pipeline de CI/CD (GitHub Actions)

Configuré el flujo en [`.github/workflows/ci.yml`](.github/workflows/ci.yml) dividiéndolo en 3 etapas secuenciales con dependencias explícitas:

1. **Lint & Unit Tests**: Ejecuta `tsc --noEmit` en ambos proyectos y corre las pruebas unitarias de dominio con **Vitest** (15 tests de reglas de negocio).
2. **Build Docker Images**: Valida que las imágenes de Backend y Frontend compilen sin errores de empaquetado.
3. **Integration Smoke Test**:
   - Valida que las variables de entorno existan (fallando si falta alguna requerida).
   - Levanta el entorno con `docker compose up -d`.
   - Realiza polling con reintentos hacia `GET /health` hasta confirmar `HTTP 200 OK` y conectividad con la base de datos.
   - En caso de fallo, extrae los logs de los contenedores para facilitar el diagnóstico y termina con código de error.
