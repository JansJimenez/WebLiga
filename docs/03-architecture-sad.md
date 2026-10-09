# DOCUMENTO DE ARQUITECTURA DE SOFTWARE (SAD)
## Plataforma de Gestión y Difusión para Liga Provincial de Fútbol
**Estándar de Referencia:** IEEE/ISO/IEC 42010 / Modelo C4 & 4+1 Vistas  
**Código del Documento:** LPF-SAD-003  
**Versión:** 1.0.0  
**Fecha:** 08 de Octubre de 2026  
**Líder de Arquitectura:** Lead Systems Engineer & Solutions Architect  
**Estado:** Arquitectura Base Aprobada  

---

## 1. INTRODUCCIÓN Y DRIVERS ARQUITECTÓNICOS

El diseño arquitectónico de **LPF-Manager** responde a necesidades críticas del negocio y a la realidad operativa de las canchas de fútbol provinciales:

1. **Dualidad de Cargas de Trabajo (Read vs. Write Heaviness):**
   - **Lectura Masiva (Read-Heavy):** El portal público experimenta picos de tráfico intensos (fines de semana al cierre de jornadas), donde miles de aficionados consultan simultáneamente tablas de posiciones y marcadores. Requiere renderizado estático con revalidación incremental (ISR) y caché en borde (Edge CDN).
   - **Escritura Crítica y Transaccional (Write-Critical):** La carga de actas arbitrales y cómputo de posiciones exige estricta consistencia transaccional (ACID). Un gol o tarjeta no puede quedar en estado intermedio ni provocar carreras de datos (*race conditions*).
2. **Resiliencia ante Desconexión en Cancha (Offline-First en Acta):**
   - Los árbitros operan frecuentemente en estadios municipales con cobertura de telefonía móvil deficiente o intermitente. La planilla arbitral debe persistir eventos localmente y sincronizarlos de forma transaccional e idempotente al detectar conectividad.
3. **Mantenibilidad y Simplicidad Operativa:**
   - Evitar la sobre-ingeniería de microservicios prematuros. Se selecciona un **Monolito Modular** fuertemente tipado que minimiza la fricción de despliegue, garantiza cohesión de dominio y permite evolucionar a servicios distribuidos solo si la escala federativa lo demanda.

---

## 2. STACK TECNOLÓGICO SELECCIONADO Y JUSTIFICACIÓN TÉCNICA

| Capa / Subsistema | Tecnología Seleccionada | Justificación Técnica de Ingeniería |
| :--- | :--- | :--- |
| **Plataforma / Runtime** | **Node.js (LTS v22+) & TypeScript** | Tipado estricto extremo (`strict: true`), ecosistema maduro, unificación de lenguaje en frontend y backend. |
| **Framework Fullstack** | **Next.js (App Router)** | Permite arquitectura híbrida: SSR / ISR para páginas públicas con SEO y máxima velocidad; Client Components para el Backoffice interactivo; Server Actions y Route Handlers para lógica de backend segura. |
| **Diseño y Estilos** | **Vanilla CSS Moderno / CSS Modules** | Máximo control estético, cero dependencia de librerías pesadas, rendimiento óptimo, variables nativas para temas claro/oscuro y efectos visuales de alta gama (glassmorphism, animaciones fluidas). |
| **Base de Datos Principal** | **PostgreSQL 16+** | Motor relacional estándar de la industria. Indispensable por integridad referencial estricta, claves foráneas, restricciones de unicidad (DNI único, pases no duplicados) y soporte de transacciones ACID para actas. |
| **Capa ORM / Acceso Datos** | **Prisma ORM o Drizzle ORM** | Generación de consultas tipadas de extremo a extremo, migraciones declarativas y protección intrínseca contra inyecciones SQL. |
| **Caché y Mensajería Local** | **Redis (Upstash / KeyDB)** | Caché en memoria para tablas de posiciones precalculadas, rate-limiting de endpoints y cola de procesamiento de eventos en segundo plano. |
| **Almacenamiento de Archivos** | **S3-Compatible (Cloudflare R2 / AWS S3)** | Almacenamiento seguro y económico para fotos de carnet de jugadores, escudos de clubes, actas en PDF y comprobantes de pases. |
| **PWA & Offline Engine** | **Workbox + Dexie.js (IndexedDB)** | Service Worker para caché de assets de la aplicación y base de datos local embebida en el navegador del árbitro para persistencia offline de eventos. |
| **Validación de Esquemas** | **Zod** | Validación universal en runtime de DTOs, formularios en cliente y cargas de API en backend compartiendo el mismo esquema. |

---

## 3. PATRONES DE ARQUITECTURA Y DISEÑO

### 3.1 Monolito Modular con Separación por Capas
La solución se organiza en módulos de dominio desacoplados dentro del mismo repositorio:
- `modules/competitions`: Temporadas, torneos, fases, grupos y fixture.
- `modules/clubs`: Clubes, canchas, directivas.
- `modules/players`: Padrón, fichajes, transferencias y carnets con código QR.
- `modules/matches`: Planilla arbitral, actas, eventos de juego y estados del partido.
- `modules/standings`: Motor de cálculo de tablas y estadísticas individuales.
- `modules/discipline`: Acumulación de tarjetas, sanciones y resoluciones del tribunal.
- `modules/portal`: Servicios de difusión pública, noticias y contenidos multimedia.

### 3.2 Patrón de Máquina de Estados (State Machine) para el Partido
El ciclo de vida del encuentro sigue transiciones formales controladas:

```
[ PROGRAMADO ] 
      │  (Carga de nóminas por delegados)
      ▼
[ ALINEACIONES_CONFIRMADAS ] 
      │  (Pitazo inicial por el árbitro)
      ▼
[ EN_JUEGO ] ◄───► [ ENTRETIEMPO ]
      │  (Pitazo final)
      ▼
[ FINALIZADO ] 
      │  (Cierre con firma arbitral)
      ▼
[ ACTA_FIRMADA ] ───► Dispara Evento: `MatchFinalizedEvent`
      │                ├─► Recalcular Tablas de Posiciones
      │                └─► Evaluar Acumulación de Tarjetas (Sanciones)
      ▼
[ VALIDADO_LIGA ] (Aprobación administrativa por Comité de Torneo)
```

### 3.3 Eventos de Dominio en Proceso (In-Process Domain Events)
Al confirmarse el estado `ACTA_FIRMADA`, se emite de forma transaccional el evento de dominio `MatchFinalizedEvent`. Los listeners desacoplados reaccionan ejecutando:
1. `RecalculateStandingsHandler`: Recalcula la tabla de posiciones de la categoría afectada y purga la caché de Redis.
2. `CheckDisciplinaryCardsHandler`: Evalúa tarjetas amarillas y rojas del partido, actualiza contadores por atleta y genera registros preventivos de inhabilitación si se alcanza el umbral.
3. `AuditTrailHandler`: Asienta el cierre del acta en la bitácora inmutable de auditoría.

---

## 4. DIAGRAMAS DE ARQUITECTURA (C4 MODEL Y FLUJOS)

### 4.1 Diagrama de Contenedores (C4 Container Diagram)

```mermaid
graph TB
    subgraph Clientes ["Capa de Clientes"]
        PublicUser["Aficionado / Prensa\n(Navegador Web / Móvil)"]
        RefereeUser["Árbitro de Campo\n(PWA Tablet/Móvil)"]
        AdminUser["Directivo / Delegado\n(Desktop / Laptop)"]
    end

    subgraph EdgeLayer ["Capa de Borde & Red (Cloudflare / CDN)"]
        EdgeCDN["Edge Network / CDN\n(Caché de Páginas Públicas & SSL)"]
    end

    subgraph AppServer ["Servidor de Aplicación (Next.js Node.js Runtime)"]
        WebPortal["Portal Web Público\n(SSR / ISR Pages)"]
        AdminSPA["Panel Administrativo / Backoffice\n(React UI + RBAC)"]
        RefereePWA["Planilla Arbitral PWA\n(IndexedDB + Sync Engine)"]
        APILayer["API Routes / Server Actions\n(Controladores & Casos de Uso)"]
        DomainCore["Núcleo de Dominio\n(Motor de Tablas, Disciplina, Padrón)"]
    end

    subgraph DataPersistence ["Capa de Persistencia e Infraestructura"]
        PostgresDB[("PostgreSQL 16\n(Datos Relacionales & Transaccionales)")]
        RedisCache[("Redis Store\n(Caché Tablas, Sesiones, Rate-Limit)")]
        ObjectStorage[("Object Storage S3/R2\n(Fotos Carnet, Escudos, PDFs)")]
    end

    PublicUser -->|HTTPS GET| EdgeCDN
    EdgeCDN -->|Fetch / Revalidate| WebPortal
    AdminUser -->|HTTPS Session| AdminSPA
    RefereeUser -->|PWA App Cache| RefereePWA

    AdminSPA -->|API Requests| APILayer
    RefereePWA -->|Offline Local Storage| RefereePWA
    RefereePWA -->|Sync Encrypted Payload| APILayer
    WebPortal -->|Query Data| DomainCore

    APILayer --> DomainCore
    DomainCore -->|Lecturas / Escrituras ACID| PostgresDB
    DomainCore -->|Cache Invalidation / Fetch| RedisCache
    DomainCore -->|Upload / Download Assets| ObjectStorage
```

---

### 4.2 Flujo de Datos: Registro de Partido y Actualización Automática

```mermaid
sequenceDiagram
    autonumber
    actor Arbitro as Árbitro en Campo (PWA)
    participant LocalDB as Local IndexedDB
    participant API as Backend API (Next.js)
    participant DB as PostgreSQL 16
    participant EventBus as Domain Event Bus
    participant StandingsEngine as Motor de Tablas
    participant Redis as Redis Cache
    participant Portal as Portal Público (Aficionados)

    Arbitro->>LocalDB: Registra Gol / Tarjeta / Sustitución
    Note over Arbitro,LocalDB: Persistencia inmediata offline en cancha
    Arbitro->>API: Finaliza Partido y Firma Acta (Payload Completo)
    API->>DB: Inicia Transacción ACID
    API->>DB: Guarda Eventos de Partido y Actualiza Estado a 'ACTA_FIRMADA'
    API->>DB: Confirma Transacción (COMMIT)
    API->>Arbitro: Confirmación de Cierre Exitoso
    
    API->>EventBus: Publica 'MatchFinalizedEvent'
    par Recálculo de Clasificaciones
        EventBus->>StandingsEngine: Ejecuta Recálculo de Tabla del Grupo
        StandingsEngine->>DB: Computa PJ, PG, PE, PP, GF, GC, DG, PTS
        StandingsEngine->>Redis: Invalida y regenera caché de la tabla
    and Control Disciplinario
        EventBus->>DB: Actualiza acumulación de amarillas y suspende inhabilitados
    end

    Portal->>Redis: Consulta Tabla de Posiciones Actualizada
    Redis-->>Portal: Retorna datos en < 10ms
```

---

## 5. MODELO DE DATOS Y DOMINIO CONCEPTUAL (ER DIAGRAM)

```mermaid
erDiagram
    LIGA ||--o{ TEMPORADA : organiza
    TEMPORADA ||--o{ CATEGORIA : comprende
    CATEGORIA ||--o{ TORNEO : disputa
    TORNEO ||--o{ FASE : divide_en
    FASE ||--o{ FECHA_JORNADA : contiene
    FECHA_JORNADA ||--o{ PARTIDO : programa
    
    CLUB ||--o{ EQUIPO_CATEGORIA : inscribe
    CATEGORIA ||--o{ EQUIPO_CATEGORIA : pertenece
    EQUIPO_CATEGORIA ||--o{ JUGADOR_INSCRIPCION : lista_buena_fe
    JUGADOR ||--o{ JUGADOR_INSCRIPCION : federado_en
    JUGADOR ||--o{ SANCION_DISCIPLINARIA : registra

    EQUIPO_CATEGORIA ||--o{ PARTIDO : juega_local
    EQUIPO_CATEGORIA ||--o{ PARTIDO : juega_visita
    
    PARTIDO ||--o{ EVENTO_PARTIDO : genera
    JUGADOR ||--o{ EVENTO_PARTIDO : protagoniza
    PARTIDO ||--o| ACTA_ARBITRAL : consolida
    
    TORNEO ||--o{ TABLA_POSICIONES : calcula

    PARTIDO {
        uuid id PK
        timestamp fecha_hora
        string estado "PROGRAMADO, EN_JUEGO, FINALIZADO, etc."
        int goles_local
        int goles_visita
        uuid estadio_id FK
    }

    EVENTO_PARTIDO {
        uuid id PK
        uuid partido_id FK
        uuid jugador_id FK
        string tipo "GOL, AUTOGOL, TARJETA_AMARILLA, TARJETA_ROJA, CAMBIO"
        int minuto
        string detalle_observacion
    }

    TABLA_POSICIONES {
        uuid id PK
        uuid torneo_id FK
        uuid equipo_categoria_id FK
        int pj
        int pg
        int pe
        int pp
        int gf
        int gc
        int dg
        int puntos
    }

    SANCION_DISCIPLINARIA {
        uuid id PK
        uuid jugador_id FK
        uuid torneo_id FK
        string motivo
        int fechas_castigo
        int fechas_cumplidas
        string estado "VIGENTE, CUMPLIDA, APELADA"
    }
```

---

## 6. SEGURIDAD, POLÍTICAS Y AUDITORÍA

1. **Autenticación y Autorización Granular:**
   - Sesiones gestionadas con cookies criptográficamente firmadas `HttpOnly`, `SameSite=Lax`, `Secure`.
   - Middleware de Next.js para interceptar rutas y evaluar el rol requerido antes de acceder a cualquier pantalla o endpoint administrativo.
2. **Protección de Datos e Identidad (Carnet QR):**
   - El código QR impreso en el carnet físico no contendrá datos planos vulnerables, sino un JSON Web Token (JWT) firmado con clave privada por el servidor de la liga, con tiempo de expiración y verificación de firma digital. Cualquier alteración física invalidará el escaneo del árbitro.
3. **Auditoría Inmutable:**
   - Tabla `bitacora_auditoria` que almacena: `id`, `usuario_id`, `entidad`, `accion` (`INSERT`, `UPDATE`, `DELETE`), `payload_anterior`, `payload_nuevo`, `ip_origen`, `created_at`. No permite eliminación ni modificación (`append-only`).

---

## 7. ESTRATEGIA DE DESPLIEGUE, DEVOPS Y OBSERVABILIDAD

### 7.1 Pipeline de CI/CD (GitHub Actions)
1. **Linting & Type-Checking:** Ejecución de ESLint y `tsc --noEmit` para asegurar calidad y compatibilidad.
2. **Test Suite:** Pruebas unitarias en Vitest para lógica de desempates, cómputo de actas y sanciones.
3. **Build:** Construcción del contenedor Docker de producción multi-etapa (*multi-stage build*) optimizado en tamaño (<150 MB).
4. **Deploy:** Despliegue automatizado sin tiempo de inactividad (*Zero-Downtime Rolling Update*).

### 7.2 Infraestructura de Producción
- **Servidor Web / Aplicación:** Contenedor Docker Node.js sobre VPS Linux (Ubuntu Server) orquestado con Docker Compose / Coolify o desplegado en Vercel.
- **Base de Datos:** Instancia gestionada de PostgreSQL (e.g., Supabase / Neon o Postgres local optimizado con conexión pooled mediante PgBouncer).
- **Reverse Proxy & SSL:** Nginx o Caddy con aprovisionamiento automático de certificados SSL Let's Encrypt y compresión Brotli/Gzip.
- **Monitoreo & Logs:** Registro centralizado con Pino/Winston y telemetría de errores con Sentry en frontend y backend.
