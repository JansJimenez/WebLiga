# PROJECT CHARTER (ACTA DE CONSTITUCIÓN DEL PROYECTO)
## Plataforma Integral de Gestión y Difusión para Liga Provincial de Fútbol
**Código del Proyecto:** LPF-SYS-001  
**Versión:** 1.0.0  
**Fecha de Emisión:** 08 de Octubre de 2026  
**Autor Principal:** Ingeniero de Sistemas / Lead Software Architect  
**Estado:** Aprobado / En Fase de Definición Técnica  

---

## 1. INFORMACIÓN GENERAL Y RESUMEN EJECUTIVO

| Parámetro | Detalle |
| :--- | :--- |
| **Nombre del Proyecto** | Sistema Web Integral de Administración, Competencias y Portal Público de la Liga Provincial de Fútbol |
| **Acrónimo / Nombre en Clave** | **LPF-Manager** (Liga Provincial Fútbol Suite) |
| **Patrocinador Principal (Sponsor)** | Junta Directiva de la Liga Provincial de Fútbol |
| **Líder Técnico / Arquitecto** | Lead Systems Engineer & Solutions Architect |
| **Usuarios Objetivo** | Dirigentes de Liga, Delegados de Clubes, Colegio de Árbitros, Tribunal de Penas, Periodismo y Afición |

### 1.1 Resumen Ejecutivo
El presente proyecto concibe el diseño, desarrollo, despliegue y puesta en marcha de un ecosistema web centralizado y modular orientado a transformar digitalmente la operación de una liga provincial de fútbol. El sistema resolverá integralmente la gestión de competencias deportivas (torneos oficiales de apertura, clausura, liguillas y copas), el empadronamiento de clubes y atletas con verificación de habilitación biométrica/documental, el registro digital de actas arbitrales en tiempo real, el cálculo automatizado de tablas de clasificación y estadísticas federativas, el control del régimen disciplinario y sanciones, y un portal web de alta visibilidad para la afición, prensa y patrocinadores comerciales.

---

## 2. JUSTIFICACIÓN DEL NEGOCIO Y PROBLEMÁTICA ACTUAL

En el contexto habitual de las ligas provinciales y departamentales de fútbol amateur y semiprofesional, los procesos se caracterizan por una marcada obsolescencia operativa:

1. **Gestión Manual y Basada en Papel:**
   - Elaboración de planillas de juego a mano, propensas a borrones, tachaduras e ilegibilidad.
   - Padrón de jugadores en carpetas físicas o planillas de cálculo dispersas sin trazabilidad de pases ni verificación ágil de duplicidad de inscripción.
2. **Latencia Crítica en la Difusión de Información:**
   - Las tablas de posiciones y estadísticas tardan entre 48 y 72 horas en computarse tras el pitazo final del domingo.
   - La afición y los medios de comunicación dependen de publicaciones informales en redes sociales, generando desinformación.
3. **Fallas en el Control Disciplinario y Alineaciones Indebidas:**
   - La contabilidad manual de tarjetas amarillas acumuladas y suspensiones por tarjeta roja suele derivar en reclamos de puntos en mesa por alineación indebida de jugadores inhabilitados.
   - Falta de un registro unificado de resoluciones del Tribunal de Penas y Justicia Deportiva.
4. **Pérdida de Valor Comercial y Auspicios:**
   - La falta de una vitrina digital moderna, centralizada y con métricas de tráfico verificables desincentiva el patrocinio de marcas provinciales y regionales.

---

## 3. PROPÓSITO Y VISIÓN DEL PRODUCTO

### 3.1 Visión
Convertir a la Liga Provincial de Fútbol en un referente institucional y tecnológico de modernización deportiva a nivel regional, dotando a la organización de una plataforma de software robusta, escalable y en tiempo real que garantice transparencia, celeridad y valor tanto para los actores deportivos internos como para la comunidad de aficionados.

### 3.2 Propósito
Erradicar el error humano y la burocracia documental mediante la digitalización del 100% del ciclo de vida del torneo: desde la inscripción del jugador y el sorteo del fixture, hasta el cierre del acta arbitral digital, la publicación instantánea de clasificaciones y la generación automática de resoluciones disciplinarias.

---

## 4. OBJETIVOS ESTRATÉGICOS (METAS S.M.A.R.T.)

1. **Tiempo de Publicación de Resultados (O-01):** Reducir el tiempo de publicación de resultados oficiales y tablas de posiciones de 48 horas a **menos de 15 minutos** posteriores al cierre y firma del acta arbitral.
2. **Cero Alineaciones Indebidas No Detectadas (O-02):** Implementar una validación algorítmica previa al partido que impida registrar en la lista de buena fe activa a cualquier jugador que posea sanción disciplinaria vigente, suspensión por acumulación de amonestaciones o falta de habilitación médica.
3. **Eficiencia en Padrón de Deportistas (O-03):** Disminución del 80% en los tiempos de verificación de transferencias, préstamos y emisión de carnets digitales con código QR para más de 1,500 deportistas registrados por temporada.
4. **Disponibilidad y Concurrencia (O-04):** Garantizar un SLA de disponibilidad del 99.7% durante los fines de semana (horas pico de juego: sábados y domingos de 10:00 a 20:00) soportando picos concurrentes de hasta 5,000 usuarios consultando resultados en vivo.
5. **Retorno de Inversión y Patrocinio (O-05):** Habilitar espacios publicitarios dinámicos y medibles con analíticas de impresiones para monetizar la plataforma con al menos 4 patrocinadores provinciales institucionales en la primera temporada.

---

## 5. ALCANCE DEL PROYECTO (SCOPE MANAGEMENT)

### 5.1 En Alcance (In-Scope)
- **Módulo de Configuración Institucional y Torneos:** Creación de temporadas, categorías (Primera División, Ascenso, Juveniles, Femenino), formatos de torneo (todos contra todos, grupos + liguilla playoff, eliminación directa) y reglamentos de puntuación específicos.
- **Módulo de Padrón y Fichajes de Clubes y Jugadores:** Expedientes digitales de clubes, estadios habilitados, directiva, planteles, ficha clínica básica, historial de pases inter-clubes y generación de Carnets Digitales con verificación QR.
- **Módulo de Fixture y Programación:** Generador asistido/automático de fixture (algoritmo Round Robin / Berger), asignación de estadios, fechas, horarios y designación de ternas arbitrales.
- **Módulo de Planilla Electrónica de Partido (Acta Digital):** Aplicación optimizada para móviles/tablets que permite al árbitro/veedor registrar alineaciones, titulares, suplentes, goles, asistencias, amonestaciones, expulsiones, sustituciones e incidencias arbitrales con firma digital/cierre de seguridad.
- **Motor Estadístico Automatizado:** Computación en tiempo real de Tablas de Posiciones generales y por grupo, tablas de goleadores, porteros menos batidos, tarjetas amarillas/rojas y tabla Fair Play según criterios FIFA/Federación.
- **Módulo del Tribunal de Disciplina:** Automatización de suspensión por ciclo de tarjetas amarillas (según reglamento: ej. cada 3 o 5 amarillas), gestión de actas de sanción, apelaciones y semáforo de habilitación por jugador.
- **Portal Público Web Responsive (Fan Portal):** Vista pública moderna con experiencia de usuario de primer nivel: marcadores en vivo, fixture interactivo, perfiles de equipos/jugadores, noticias oficiales, resoluciones descargables y banners de auspiciadores.
- **Módulo de Seguridad y Control de Acceso (RBAC):** Roles diferenciados (SuperAdmin Liga, Comité de Torneo, Comité de Árbitros, Tribunal de Penas, Delegado de Club, Prensa y Aficionado).

### 5.2 Fuera de Alcance (Out-of-Scope) - Fase 1
- Pasarela de pagos en línea integrada para venta de entradas de estadios físicos (se planifica para Fase 2).
- Transmisión de video en vivo (streaming propio por servidor de medios; en su lugar, se soportará incrustación de enlaces de YouTube/Facebook Live).
- Aplicaciones nativas compiladas para iOS/Android en tiendas (App Store / Google Play). En su reemplazo se construirá una **Progressive Web App (PWA)** offline-first de alto rendimiento.

---

## 6. STAKEHOLDERS (PARTES INTERESADAS) Y MATRIZ RACI

### 6.1 Identificación de Actores Clave

```
[ Directiva de la Liga ] <---> [ Sponsor / Patrocinadores ]
          |
          +---> [ Comité Técnico / Torneos ]
          +---> [ Colegio de Árbitros / Árbitros de Campo ]
          +---> [ Tribunal de Disciplina / Penas ]
          +---> [ Delegados y Dirigentes de Clubes ]
          +---> [ Afición, Comunidad Deportiva y Prensa Local ]
```

### 6.2 Matriz RACI Preliminar
*(R = Responsable, A = Aprobador/Accountable, C = Consultado, I = Informado)*

| Actividad / Entregable | Directiva Liga | Comité Técnico | Árbitros | Tribunal Penas | Delegado Club | Lead Engineer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Definición del Reglamento y Puntos | **A** | **R** | C | C | I | C |
| Registro y Validación de Jugadores | I | **A** | I | I | **R** | C |
| Confección de Fixture y Calendario | A | **R** | C | I | I | C |
| Llenado y Cierre de Acta de Partido | I | I | **R** | I | C | C |
| Emisión de Resoluciones de Castigo | A | I | C | **R** | I | C |
| Desarrollo, Pruebas y Despliegue Web | A | C | C | C | C | **R** |

---

## 7. FACTORES CRÍTICOS DE ÉXITO (CSF)

1. **Adopción por Delegados y Árbitros:** La interfaz del acta digital y la carga de nóminas debe ser extremadamente simple e intuitiva para usuarios con bajo nivel de alfabetización digital.
2. **Resiliencia ante Mala Conectividad:** La planilla arbitral debe permitir registrar eventos localmente en el dispositivo del árbitro aun si la cancha provincial pierde señal de internet (almacenamiento offline y sincronización idempotente al recuperar red).
3. **Cero Inconsistencias en Tablas:** Los desempates reglamentarios (diferencia de gol, goles a favor, resultados entre sí, fair play) deben calcularse con 100% de apego a las bases aprobadas sin intervención manual.

---

## 8. MATRIZ PRELIMINAR DE RIESGOS

| ID | Riesgo Identificado | Probabilidad | Impacto | Estrategia de Mitigación |
| :---: | :--- | :---: | :---: | :--- |
| **R-01** | Baja o nula conectividad celular en estadios periféricos de la provincia. | **Alta** | **Alto** | Arquitectura PWA con persistencia en IndexedDB/LocalState y sincronización transaccional al detectar conexión. |
| **R-02** | Resistencia al cambio de dirigentes tradicionales habituados al papel. | **Media** | **Alto** | Capacitaciones prácticas, interfaz minimalista y soporte de impresión en formato PDF oficial idéntico al tradicional. |
| **R-03** | Intentos de suplantación de identidad o duplicidad de jugadores en varios clubes. | **Media** | **Crítico** | Validación estricta con Documento de Identidad (DNI), fotografía obligatoria y bloqueo por índice de unicidad en base de datos. |
| **R-04** | Picos de tráfico que degraden el rendimiento en finales de semana. | **Alta** | **Medio** | Cacheo agresivo en capa de CDN, separación de lecturas públicas mediante SSG/ISR y base de datos optimizada con índices adecuados. |

---

## 9. CRONOGRAMA DE HITOS DE ALTO NIVEL

| Hito | Fase | Entregable Principal |
| :---: | :--- | :--- |
| **M1** | Análisis y Especificación | Project Charter, SRS Completo, SAD y Modelo de Dominio. |
| **M2** | Fundamentos y Backoffice | Gestión de Clubes, Jugadores, Carnets QR y Configuración de Torneo. |
| **M3** | Motor de Partidos y Acta Digital | Generador de Fixture, Planilla Arbitral PWA y Motor Estadístico. |
| **M4** | Tribunal de Penas y Portal Público | Automatización de Sanciones, UI Pública con Resultados y Tablas en Vivo. |
| **M5** | Pruebas Piloto y Marcha Blanca | Simulación con Torneo Relámpago y capacitación a usuarios clave. |
| **M6** | Puesta en Producción Oficial | Despliegue en producción para el inicio del campeonato oficial. |
