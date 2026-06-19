# AGENTS — Frontend Angular

## Descripción
Proyecto Angular 19 scaffolded con Angular CLI — actualmente vacío, sin lógica de negocio ni componentes personalizados. Servirá como frontend de la plataforma educativa conectado al backend REST API.

## Estado actual
- **Scaffolded**: Proyecto recién generado con `ng new`.
- **Sin desarrollo**: Solo existe el `AppComponent` por defecto con la página de bienvenida de Angular.
- **Sin componentes, servicios, modelos ni estilos personalizados.**
- **Sin rutas definidas** (arreglo `routes` vacío en `app.routes.ts`).
- **Sin conexión al backend.**

## Tech Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Angular | 19.2.x |
| Lenguaje | TypeScript | ~5.7.2 |
| Target ES | ES2022 | — |
| CLI | @angular/cli | 19.2.27 |
| Build | @angular-devkit/build-angular | 19.2.27 |
| Testing | Jasmine + Karma | ~5.6.0 / ~6.4.0 |
| Package Manager | **pnpm** | — |
| Estilos | CSS global + CSS por componente | — |
| Routing | @angular/router | 19.2.x |
| HTTP | @angular/common/http | 19.2.x (disponible, no configurado) |
| Forms | @angular/forms | 19.2.x (disponible, no configurado) |

## Dependencias principales (package.json)

### Producción
- `@angular/common`, `@angular/compiler`, `@angular/core`, `@angular/forms`, `@angular/platform-browser`, `@angular/platform-browser-dynamic`, `@angular/router`
- `rxjs` ~7.8.0, `tslib` ^2.3.0, `zone.js` ~0.15.0

### Desarrollo
- `@angular-devkit/build-angular` ^19.2.27, `@angular/cli` ^19.2.27, `@angular/compiler-cli` ^19.2.0
- `@types/jasmine` ~5.1.0, `jasmine-core` ~5.6.0, `karma` ~6.4.0, `karma-chrome-launcher` ~3.2.0, `karma-coverage` ~2.2.0, `karma-jasmine` ~5.1.0, `karma-jasmine-html-reporter` ~2.1.0
- `typescript` ~5.7.2

## Estructura actual

```
src/
├── index.html                     → Entry HTML
├── main.ts                        → bootstrapApplication(AppComponent, appConfig)
├── styles.css                     → Global styles (vacío)
└── app/
    ├── app.component.ts           → Componente raíz standalone
    ├── app.component.html         → Template con página de bienvenida Angular
    ├── app.component.css          → Estilos del componente (vacío)
    ├── app.component.spec.ts      → Test unitario default
    ├── app.config.ts              → AppConfig con provideRouter(routes)
    └── app.routes.ts              → Routes[] vacío
```

## Configuración

### angular.json (build)
- Builder: `@angular-devkit/build-angular:application`
- Output: `dist/frontend`
- Polyfills: `zone.js`
- Styles: `src/styles.css`
- Assets: `public/`

### TypeScript
- `tsconfig.json`: strict mode, ES2022 target, standalone components habilitado
- `tsconfig.app.json`: extends base, files: `src/main.ts`
- `tsconfig.spec.json`: extends base, incluye Jasmine types

### Servidor de desarrollo
- Puerto por defecto: 4200
- Hot-reload automático

## Scripts disponibles

```bash
pnpm start        # ng serve → http://localhost:4200
pnpm run build    # ng build → dist/frontend
pnpm run watch    # ng build --watch --configuration development
pnpm test         # ng test → Karma + Chrome
```

## Reglas para el agente

1. **USAR pnpm siempre para todo. NO usar npm.**
2. **Arquitectura Angular standalone**: Usar `bootstrapApplication` + componentes standalone. NO usar NgModules.
3. **Rutas**: Definir en `app.routes.ts` usando `Routes` array. Usar `provideRouter` (ya configurado).
4. **HTTP**: Usar `provideHttpClient()` en `app.config.ts` para conectar con el backend REST.
5. **Autenticación JWT**: El backend usa tokens Bearer. Crear un `AuthService` + `HttpInterceptor` para adjuntar el token a cada request.
6. **Backend API**: Corre en `http://localhost:8080`. Configurar proxy en `proxy.conf.json` para desarrollo.
7. **Estilos**: Usar CSS global en `styles.css` y estilos encapsulados por componente. Considerar Tailwind o Angular Material si se necesita.
8. **Componentes**: Generar con `ng generate component` dentro de carpetas organizadas por feature.
9. **Servicios**: Inyectables con `providedIn: 'root'`.
10. **Testing**: Mantener y actualizar los `.spec.ts` correspondientes. Usar TestBed + HttpClientTestingModule.
11. **NO modificar** la configuración base de TypeScript (strict mode, standalone) sin consultar.
12. **Estructura sugerida** a medida que crezca:
    ```
    src/app/
    ├── core/          → Servicios singleton (auth, http interceptor, guards)
    ├── shared/        → Componentes reutilizables, pipes, directivas
    ├── features/      → Módulos de funcionalidad (courses, dashboard, cart, etc.)
    └── layout/        → Header, Footer, Sidebar
    ```
13. **CORS**: El backend ya permite `localhost:4200`. No deberían haber problemas de CORS en desarrollo si se usa el proxy o el mismo puerto.
