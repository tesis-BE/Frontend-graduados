# Frontend Graduados

Aplicación Angular (v19) para el portal de bolsa de empleo. Usa componentes standalone, ChangeDetectionStrategy.OnPush, y estilos basados en variables Bootstrap para soportar temas claro/oscuro y diseño responsivo.

## Cómo ejecutar

```bash
npm install
npm start    # ng serve en http://localhost:4200
npm run build
```

## Arquitectura y módulos creados/ajustados

- **Gestión de Usuarios (admin)**
  - Ruta: `/gestion-usuarios/usuarios`
  - Componentes: `usuarios-list.component.ts/html/scss`
  - Funciones: CRUD completo (crear, editar, eliminar, activar/desactivar), búsqueda, filtros por rol/estado, paginación, validaciones reactivas, modal de edición, badges por tipo de usuario. Usa `ChangeDetectorRef.markForCheck()` tras operaciones async.

- **Gestión de Roles (admin, vista)**
  - Ruta: `/gestion-usuarios/roles`
  - Componentes: `roles-list.component.ts/html/scss`
  - Funciones: listado de roles con tarjetas y permisos visibles. Sin CRUD aún, pero listo para ampliación.

- **Postulaciones**
  - Ruta: `/applications`
  - Estructura separada (pages/componentes):
    - `applications-list.component.ts` (lógica), `.html` (vista), `.scss` (estilos)
  - Funciones principales:
    - Vista única para graduado, reclutador y admin con data table + filtros + paginación.
    - Reclutador/Admin: formulario para crear postulaciones para un candidato (elige oferta propia, busca graduado, carta opcional) y ver recibidas por oferta o todas.
    - Graduado: ver sus propias postulaciones.
    - Cambio de estado de postulación vía diálogo (pendiente, revisado, entrevistado, aceptado, rechazado).
  - Responsivo: grillas colapsan a una columna en móviles, botones full-width.
  - Tema: usa variables `--bs-*` para colores y fondos.

- **Graduados y Empresas (bugfix)**
  - Se corrigió falta de refresco de UI bajo OnPush usando `ChangeDetectorRef.markForCheck()` después de peticiones.

- **Ruteo**
  - Redirecciones arregladas para que los ítems del sidebar abran las pantallas (`gestion-usuarios` → `usuarios/listado` y `roles/listado`).
  - Aplicaciones: lazy route `applications.routes.ts` carga `applications-list`.
  - Menú: `menu.meta.ts` incluye la entrada `applications` con label “Postulaciones” y url `/applications`.

## Servicios API (frontend)

- `application.service.ts`
  - `getMyApplications`, `getReceivedApplications`, `getApplicationsByJob` con paginación/estado.
  - `updateApplicationStatus(id, status)`.
  - `applyForCandidate(jobId, userId, coverLetter?)` para reclutador/admin.
  - `applyForJob(jobId, coverLetter?)` para graduado.

- `user.service.ts`
  - Admin: `getAllUsers`, `createUser`, `updateUser`, `deleteUser`, `toggleUserStatus`, `changeUserType`.
  - Graduados públicos para búsquedas de reclutador: `getGraduates`.

- `job-offer.service.ts`
  - `getMyJobOffers` usado para poblar selector en creación de postulaciones.

## Backend esperado (referencia rápida)

- Users (admin): `GET /users`, `POST /users`, `PUT /users/:id`, `PATCH /users/:id/status`, `DELETE /users/:id`.
- Applications: `POST /applications` (graduado), `POST /applications/by-recruiter` (reclutador/admin), `GET /applications/my`, `GET /applications/received`, `GET /applications/job/:jobId`, `PATCH /applications/:id/status`.

## Estilo y accesibilidad

- Variables CSS de Bootstrap para soportar modo claro/oscuro sin duplicar estilos.
- Diseño responsivo: layouts en grilla con `minmax` y colapso en móviles; botones y formularios adaptables.
- Tables usan componente compartido `DataTableComponent`; filtros con `FilterPanelComponent`; tarjetas con `CardComponent`.

## Notas de implementación

- OnPush: siempre se llama `cdr.markForCheck()` tras operaciones async en las pantallas creadas/ajustadas.
- Formularios: Reactive Forms con validaciones y mensajes breves.
- Filtros y paginación: se guardan `page`/`pageSize`; al filtrar se resetea a página 1.
- Separación de archivos: cada página tiene `.ts`, `.html`, `.scss` dedicados dentro de `/features/.../pages/`.

## Comandos útiles

```bash
npm start             # servidor de desarrollo
npm run build         # build de producción
```
