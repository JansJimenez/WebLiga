# ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)
## Plataforma de Gestión y Difusión para Liga Provincial de Fútbol
**Estándar de Referencia:** ISO/IEC/IEEE 29148:2018 / IEEE Std 830-1998  
**Código del Documento:** LPF-SRS-002  
**Versión:** 1.0.0  
**Fecha:** 08 de Octubre de 2026  
**Líder de Ingeniería:** Lead Systems Engineer & Solutions Architect  
**Estado:** Formal / Especificación Base  

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
El propósito de este documento es especificar de manera formal, unívoca y verificable los requerimientos funcionales (RF) y no funcionales (RNF) para la plataforma web de la Liga Provincial de Fútbol. Este documento sirve como contrato técnico de desarrollo, base para el diseño arquitectónico y criterio de aceptación para el control de calidad (QA).

### 1.2 Alcance del Sistema
El sistema se compone de dos subsistemas principales interconectados:
1. **Backoffice Administrativo y Operativo (LigaPro Admin):** Acceso restringido por roles para directivos, comités técnicos, árbitros y delegados de clubes.
2. **Portal Web Público y de Difusión (LigaPro Portal):** Sitio web de acceso libre, altamente optimizado para SEO, velocidad y consumo masivo por aficionados, medios de comunicación y patrocinadores.

### 1.3 Glosario y Definiciones
- **Acta Digital / Planilla de Juego:** Registro oficial electrónico del partido donde se asientan alineaciones, incidencias, goles, tarjetas y sustituciones.
- **Lista de Buena Fe:** Nómina oficial de futbolistas habilitados por un club para disputar un torneo determinado.
- **Alineación Indebida:** Participación de un deportista inhabilitado por sanción disciplinaria, falta de carnet o ausencia de alta médica.
- **Fixture:** Calendario oficial estructurado de enfrentamientos deportivos ordenado por jornadas o fechas.
- **RBAC (Role-Based Access Control):** Control de acceso basado en roles con privilegios granulares.
- **PWA (Progressive Web App):** Aplicación web con capacidades offline y comportamiento similar a una aplicación nativa.

---

## 2. ACTORES DEL SISTEMA Y MATRIZ DE ACCESO (RBAC)

| Rol | Código | Descripción y Nivel de Acceso |
| :--- | :---: | :--- |
| **Super Administrador (Liga)** | `ROLE_ADMIN` | Control total del sistema: gestión de usuarios, torneos, configuraciones federativas y auditoría. |
| **Comité Técnico / Torneos** | `ROLE_TECH_COMM` | Creación de fixtures, asignación de sedes, horarios y reprogramaciones oficiales. |
| **Colegio de Árbitros / Árbitro** | `ROLE_REFEREE` | Visualización de designaciones arbitrales, registro de actas de partido en vivo y cierre de informes. |
| **Tribunal de Disciplina** | `ROLE_DISCIPLINE` | Emisión de fallos sancionatorios, resolución de reclamos y ajuste de sanciones extraordinarias. |
| **Delegado de Club** | `ROLE_CLUB_DELEGATE` | Gestión de la plantilla de su club, solicitud de fichajes, impresión de carnets y carga de alineación preliminar. |
| **Prensa y Comunicaciones** | `ROLE_PRESS` | Publicación de notas de prensa, galerías fotográficas y comunicados oficiales. |
| **Aficionado / Usuario Público** | `ROLE_PUBLIC` | Acceso irrestricto de solo lectura al portal público (tablas, resultados, fixture, perfiles). |

---

## 3. REQUERIMIENTOS FUNCIONALES (RF)

### MÓDULO 1: GESTIÓN INSTITUCIONAL Y TORNEOS (RF-01)
- **RF-01.1 Creación de Temporadas y Categorías:** El sistema debe permitir registrar temporadas anuales y subdividirlas en categorías (e.g., Primera División, Primera B, Juvenil Sub-17, Fútbol Femenino, Senior).
- **RF-01.2 Parametrización de Reglas de Competencia:** Cada torneo debe permitir configurar su sistema de puntuación (puntos por victoria [default: 3], empate [default: 1], derrota [default: 0]), duración de tiempos reglamentarios, cantidad máxima de suplentes y cambios permitidos por partido (e.g., 5 cambios en 3 ventanas).
- **RF-01.3 Formatos de Competición:** Soportar formatos:
  - Sistema de liga regular (Todos contra todos a una o dos ruedas).
  - Fase de grupos con clasificación a liguilla/playoff.
  - Llaves de eliminación directa (Octavos, Cuartos, Semifinal, Final con o sin alargue y penales).
- **RF-01.4 Configuración de Criterios de Desempate:** Permitir ordenar las prioridades de desempate en la tabla: 1) Diferencia de gol, 2) Mayor cantidad de goles a favor, 3) Resultado del partido directo entre equipos empatados, 4) Puntos Fair Play, 5) Sorteo.

### MÓDULO 2: GESTIÓN DE CLUBES Y CAMPOS DEPORTIVOS (RF-02)
- **RF-02.1 Perfil del Club:** Registro institucional de cada club: razón social, nombre deportivo, escudo en alta resolución, año de fundación, presidente, colores de indumentaria titular y alternativa (para alertar coincidencias de color en partidos).
- **RF-02.2 Gestión de Sedes y Estadios:** Registro de recintos deportivos con nombre, geolocalización (coordenadas GPS para Google Maps), capacidad de aforo, tipo de superficie (césped natural, sintético, tierra) y estado de habilitación técnica.

### MÓDULO 3: PADRÓN DE JUGADORES, CUERPOS TÉCNICOS Y CARNETIZACIÓN (RF-03)
- **RF-03.1 Ficha Digital del Jugador:** Registro con validación de Documento Nacional de Identidad (DNI/Cédula), nombres, apellidos, fecha de nacimiento (con cálculo automático de categoría por edad), posición en campo, número de dorsal habitual y fotografía frontal tipo carnet.
- **RF-03.2 Control de Unicidad y Traspasos:** El sistema debe validar que un jugador no esté inscrito activamente en más de un club simultáneamente en la misma temporada. Toda transferencia debe registrar fecha de solicitud, club emisor, club receptor, tipo de pase (definitivo o a préstamo) y visto bueno de la Liga.
- **RF-03.3 Habilitación Médica y Ficha Técnica:** Registro de fecha de examen médico preventivo y seguro de accidentes. Si la fecha expira, el sistema marcará al jugador como "No Apto Médicamente" y bloqueará su alineación.
- **RF-03.4 Generación de Carnet Digital con Código QR:** El sistema debe generar un carnet digital en PDF e interfaz web con un código QR firmado criptográficamente que, al ser escaneado por el árbitro en cancha, muestre de inmediato la foto, validez y estado de habilitación del futbolista.

### MÓDULO 4: MOTOR DE FIXTURE Y PROGRAMACIÓN DE ENCUENTROS (RF-04)
- **RF-04.1 Generación Asistida de Calendario:** Generar automáticamente el fixture mediante algoritmo de emparejamiento (Algoritmo de Berger / Round-Robin), permitiendo definir restricciones (e.g., dos clubes que comparten el mismo estadio no jueguen de local la misma jornada).
- **RF-04.2 Programación de Jornadas:** El Comité Técnico podrá asignar a cada partido: fecha, horario, estadio designado y veedor de la liga.
- **RF-04.3 Designación de Terna Arbitral:** Asignación de árbitro principal, asistente 1, asistente 2 y cuarto árbitro a cada encuentro, notificando automáticamente a sus cuentas de usuario.

### MÓDULO 5: PLANILLA ELECTRÓNICA DE PARTIDO / ACTA DIGITAL (RF-05)
- **RF-05.1 Flujo de Estados del Encuentro:** El partido transitará por los estados: `PROGRAMADO` -> `ALINEACIONES_CONFIRMADAS` -> `EN_JUEGO` -> `ENTRETIEMPO` -> `FINALIZADO` -> `ACTA_FIRMADA` -> `VALIDADO_LIGA` o `SUSPENDIDO`.
- **RF-05.2 Carga de Alineación por Delegados:** Los delegados cargarán su lista (titulares, suplentes y cuerpo técnico) hasta 60 minutos antes del inicio. El sistema bloqueará automáticamente a cualquier jugador sancionado o no habilitado.
- **RF-05.3 Captura de Eventos en Tiempo Real (Árbitro/Mesa):** Registro ágil con un solo toque de:
  - Goles (jugada, penal, tiro libre, autogol) indicando minuto y jugador.
  - Tarjetas Amarillas y Rojas directas o por doble amonestación (con motivo tipificado según reglamento).
  - Sustituciones (jugador que sale, jugador que entra, minuto).
- **RF-05.4 Informe Confidencial y Cierre Arbitral:** Sección para redactar incidentes de conducta del público, cuerpo técnico o agresiones. Cierre mediante confirmación y PIN/Firma electrónica del árbitro central y delegados.
- **RF-05.5 Operación Offline con Sincronización:** Si se pierde la conectividad en el estadio, la planilla seguirá funcionando en memoria local del navegador (PWA/IndexedDB) y se sincronizará automáticamente al restablecerse la red.

### MÓDULO 6: MOTOR ESTADÍSTICO Y TABLAS AUTOMATIZADAS (RF-06)
- **RF-06.1 Recálculo Instantáneo de Tablas de Posiciones:** Al marcarse un partido como `FINALIZADO`/`ACTA_FIRMADA`, el motor debe recalcular de forma transaccional e inmediata:
  - PJ (Partidos Jugados), PG (Ganados), PE (Empatados), PP (Perdidos).
  - GF (Goles a Favor), GC (Goles en Contra), DG (Diferencia de Goles), PTS (Puntos).
  - Aplicar desempates jerárquicos automáticos.
- **RF-06.2 Tabla de Goleadores (Pichichi):** Consolidación por torneo y categoría de máximos anotadores, discriminando goles de penal.
- **RF-06.3 Tabla de Valla Menos Batida:** Cálculo del promedio de goles recibidos por arquero/club con mínimo de minutos disputados.
- **RF-06.4 Tabla Fair Play:** Puntuación de conducta deportiva basada en penalizaciones (-1 por amarilla, -3 por roja por doble amarilla, -5 por roja directa).

### MÓDULO 7: TRIBUNAL DE DISCIPLINA Y SANCIONES AUTOMÁTICAS (RF-07)
- **RF-07.1 Regla Automática de Acumulación de Tarjetas:** El sistema debe suspender automáticamente con 1 fecha de inhabilitación al jugador que acumule el umbral configurado (e.g., 3 o 5 amarillas acumuladas en el torneo).
- **RF-07.2 Suspensión por Expulsión:** Bloqueo preventivo automático de 1 fecha para todo jugador expulsado con roja directa, quedando su expediente en espera de la resolución formal del Tribunal de Penas si el castigo amerita más fechas.
- **RF-07.3 Expedientes y Boletín Sancionatorio:** El Tribunal podrá dictar resoluciones (fechas de castigo, multas económicas, clausura de cancha), las cuales se reflejarán instantáneamente en la habilitación del atleta y en el boletín oficial descargable en PDF.
- **RF-07.4 Semáforo de Habilitación:** Cada jugador dispondrá de un estado visual: `HABILITADO` (Verde), `SUSPENDIDO_PROVISORIO` (Amarillo), `SANCIONADO` (Rojo), impidiendo su selección en actas de partido.

### MÓDULO 8: PORTAL PÚBLICO Y EXPERIENCIA DEL AFICIONADO (RF-08)
- **RF-08.1 Home Page Dinámica:** Marcadores de la fecha en curso en vivo ("Match Center"), tabla de posiciones resumida, próxima fecha destacada y slider de noticias principales.
- **RF-08.2 Centro de Partidos (Fixture y Resultados):** Navegación por fechas y fases con filtros por categoría. Ficha de detalle de partido con minuto a minuto, alineaciones y cronología de eventos.
- **RF-08.3 Fichas de Clubes y Plantillas:** Página por club con su historia, escudo, lista de jugadores con fotos, estadísticas de la temporada y fixture particular.
- **RF-08.4 Módulo de Noticias y Resoluciones:** Publicación de comunicados de prensa con soporte de imágenes y archivos adjuntos (resoluciones oficiales del Tribunal de Disciplina).
- **RF-08.5 Espacios de Auspiciadores y Publicidad:** Gestión de banners publicitarios (Header, sidebar, entre partidos y pie de página) con contador de impresiones y clics para monetización de la Liga.

### MÓDULO 9: AUDITORÍA Y TRAZABILIDAD (RF-09)
- **RF-09.1 Registro de Logs de Auditoría (Audit Log):** Toda modificación crítica (cambio de resultado en mesa por fallo arbitral, anulación de gol, habilitación especial de jugador, reprogramación de partido) debe quedar registrada con marca de tiempo, usuario que ejecutó la acción, dirección IP y valores anteriores vs. valores nuevos.

---

## 4. REQUERIMIENTOS NO FUNCIONALES (RNF) SEGÚN ISO/IEC 25010

### 4.1 Eficiencia de Desempeño (Performance Efficiency)
- **RNF-01 Latencia de Respuesta (API):** El 95% de las solicitudes al backend (p95) deben responder en menos de **250 ms** bajo carga nominal.
- **RNF-02 Tiempo de Carga del Portal Público (Core Web Vitals):**
  - Largest Contentful Paint (LCP) < 2.0 segundos en conexiones móviles 4G.
  - First Input Delay (FID) / INP < 100 ms.
  - Cumulative Layout Shift (CLS) < 0.1.
- **RNF-03 Concurrencia:** La plataforma debe soportar un mínimo de **3,000 usuarios concurrentes** navegando el portal público durante las horas de cierre de partidos de fin de semana, manteniendo tiempos de respuesta estables mediante caché en Edge/CDN.

### 4.2 Seguridad y Protección de Datos (Security)
- **RNF-04 Autenticación y Criptografía:**
  - Uso de autenticación basada en tokens JWT con rotación segura o sesiones HTTP-only protegidas contra ataques XSS.
  - Almacenamiento de contraseñas utilizando algoritmo de hash resistente: **Argon2id** o **Bcrypt** (cost factor >= 12).
- **RNF-05 Cifrado en Tránsito y en Reposo:**
  - Todo el tráfico debe ser obligatorio sobre HTTPS con soporte estricto de **TLS 1.3** y políticas HSTS.
  - Respaldo de base de datos con cifrado AES-256 en reposo.
- **RNF-06 Protección de Datos de Menores:**
  - En categorías formativas (Sub-13, Sub-15, Sub-17), el sistema no expondrá públicamente números de documento de identidad ni datos de contacto privados, en estricto apego a las leyes de protección de datos personales.
- **RNF-07 Prevención de Ataques Comunes:** Protección nativa contra Cross-Site Request Forgery (CSRF), Cross-Site Scripting (XSS), SQL Injection (mediante uso mandatorio de ORM/consultas parametrizadas) y Rate Limiting contra ataques de fuerza bruta en endpoints de login.

### 4.3 Confiabilidad y Disponibilidad (Reliability & Availability)
- **RNF-08 Disponibilidad (Uptime):** Acuerdo de nivel de servicio (SLA) del **99.7%** mensual, con ventana de mantenimiento restringida a días de semana en horario de madrugada (Martes/Miércoles 02:00 a 05:00 hrs).
- **RNF-09 Tolerancia a Fallos y Respaldos:**
  - Copias de seguridad automáticas (Snapshot + WAL) cada 24 horas y retención de 30 días.
  - RPO (Recovery Point Objective) <= 1 hora.
  - RTO (Recovery Time Objective) <= 2 horas.

### 4.4 Usabilidad y Accesibilidad (Usability & Accessibility)
- **RNF-10 Diseño Responsivo y Mobile-First:** El 100% de las interfaces públicas y la planilla arbitral deben estar diseñadas para operar óptimamente en pantallas de smartphones (desde 360px de ancho) hasta monitores 4K.
- **RNF-11 Usabilidad en Terreno (Planilla Arbitral):** Los botones interactivos del acta digital deben tener un tamaño táctil mínimo de 48x48 píxeles con alto contraste de color para facilitar su uso a la luz del sol en canchas abiertas.
- **RNF-12 Accesibilidad:** Cumplimiento con las directrices **WCAG 2.1 Nivel AA** en el portal público.

### 4.5 Mantenibilidad y Extensibilidad (Maintainability)
- **RNF-13 Calidad de Código:** Adopción obligatoria de TypeScript en modo estricto (`strict: true`), arquitectura modular desacoplada y pruebas unitarias con cobertura mínima del 80% en los módulos de cómputo de tablas y sanciones disciplinarias.
- **RNF-14 Documentación de API:** Documentación viva de los endpoints mediante estándar OpenAPI 3.0 / Swagger.

---

## 5. MATRIZ DE TRAZABILIDAD (MUESTRA CLAVE)

| ID Req. | Tipo | Módulo | Objetivo Asociado (Charter) | Prioridad |
| :---: | :---: | :--- | :---: | :---: |
| **RF-03.4** | Funcional | Padrón / Carnet QR | O-03 (Eficiencia Padrón) | Alta (Must) |
| **RF-05.2** | Funcional | Acta / Bloqueo Inhabilitados | O-02 (Cero Alineaciones Indebidas) | Crítica (Must) |
| **RF-05.5** | Funcional | Acta / Offline PWA | Factor Crítico CSF-02 | Crítica (Must) |
| **RF-06.1** | Funcional | Motor Tablas Automáticas | O-01 (< 15 min publicación) | Crítica (Must) |
| **RF-07.1** | Funcional | Sanciones Automáticas | O-02 (Cero Alineaciones Indebidas) | Alta (Must) |
| **RF-08.5** | Funcional | Portal / Banners Auspicios | O-05 (Retorno / Patrocinio) | Media (Should) |
| **RNF-03** | No Funcional | Rendimiento y Concurrencia | O-04 (Disponibilidad 99.7%) | Alta (Must) |
