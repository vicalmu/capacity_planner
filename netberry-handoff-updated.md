# 📋 PROJECT HANDOFF DOCUMENT
## Capacity Planning Netberry

**Fecha de creación:** Agosto 2025  
**Última actualización:** Agosto 2025 - Sesión 3 (Opus 4)  
**Estado actual:** Dashboard Interactivo Mejorado con Vista Detallada Completa

---

## 🎯 OBJETIVO DEL PROYECTO

**Objetivo principal:** Saber si puedo asumir nuevos proyectos, demostrar con vistas al director general si cabe el proyecto o no. Ver cargas por departamento y personas individuales.

**Problema a resolver:** Actualmente no hay ningún control y nos ponen más proyectos de los que podemos asumir. Necesito demostrar cuándo NO cabe un proyecto para justificar más recursos o rechazar proyectos.

**Usuario principal:** PMO (yo) + Director General (presentaciones) + Jefes de Departamento (gestión de equipos)

---

## 🏢 ESTRUCTURA ORGANIZACIONAL

**Tamaño:** 44 personas distribuidas en 8 departamentos

**Departamentos implementados:**
- **PHP**: 12 personas (Carlos Mendoza, Ana García, Miguel Torres, etc.)
- **.NET**: 8 personas (Eduardo Martín, Lucía Fernández, Ricardo Gómez, etc.)
- **DevOps**: 2 personas (Andrés Navarro, Natalia Cruz) - Crítico
- **Movilidad**: 6 personas (Gonzalo Díaz, Raquel Molina, Tomás Iglesias, etc.)
- **UX-UI**: 5 personas (Valentina Serrano, Marcos Delgado, Carla Mendez, etc.)
- **PMO**: 4 personas (Sandra Moreno, David Prieto, Mónica Rubio, etc.)
- **Marketing**: 3 personas (Pilar Cortés, Óscar Peñas, Nuria León)
- **QA**: 4 personas (Rodrigo Pascual, Amparo Lozano, Emilio Hidalgo, etc.)

**Complejidad:** Cada persona tiene proyectos específicos asignados y utilización individual calculada.

**Proyectos simultáneos:** 54 proyectos activos implementados con datos realistas.

---

## 📊 MÉTRICAS Y SISTEMA

**Unidad de medida:** Horas disponibles por departamento y por persona

**Umbrales de alerta:**
- ✅ Verde: 0-84% utilización
- ⚠️ Amarillo: 85-94% utilización (empezar a preocuparse)
- 🔴 Rojo: 95%+ utilización (saturado)

**Períodos de visualización:**
- Vista mensual
- Vista trimestral (Q3 2025 - Q2 2026)
- Vista anual
- Granularidad mínima: 3 meses
- Horizonte de planificación: 6 meses a 1 año

**KPIs implementados:**
- Capacidad Disponible Global: 1,890h
- Utilización Global: 82%
- Proyectos Activos: 54
- Departamentos Saturados: 3 (DevOps, .NET, PHP)

---

## 💾 GESTIÓN DE DATOS

**Fuente de datos:** Entrada manual (sin importaciones automáticas)
- Los datos de proyectos vienen de Excel, PDF, TXT, etc.
- Alimentación manual de la herramienta por parte del PMO
- **PENDIENTE**: Sistema de entrada manual de datos

**Almacenamiento:** Base de datos (necesaria para servidor corporativo)
- NO localStorage/sessionStorage del navegador
- Preparado para deployment en servidor Netberry
- **PENDIENTE**: Implementación de persistencia

---

## 🎨 DISEÑO Y UX

**Estilo visual:**
- ✅ Moderno/tecnológico implementado
- ✅ Minimalista sin sobrecarga
- ✅ Datos muy visibles y claros
- ✅ Color corporativo naranja para headers y elementos importantes
- ✅ Animaciones y transiciones suaves
- ✅ Sistema modal para vistas detalladas

**Formato:** Single dashboard con drill-down a vistas detalladas

**Dispositivos objetivo:**
- ✅ Ordenador (principal) - Optimizado
- ✅ Preparado para compartir pantalla en reuniones
- ✅ Responsive design implementado

---

## ⚙️ FUNCIONALIDADES IMPLEMENTADAS

### ✅ Funcionalidades Core Completadas (Sesión 2 - Sonnet 4):
1. **Dashboard principal** con KPIs dinámicos
2. **Visualización de capacidad** por departamento
3. **Sistema de filtros** por departamento (individual, múltiple, todos)
4. **Recálculo automático** de KPIs según filtros activos
5. **Alertas visuales** cuando departamentos llegan al 85%+
6. **Vista básica por departamento** 
7. **Información básica de personas** (44 empleados)
8. **Simulador básico** de impacto de nuevos proyectos
9. **Timeline de capacidad** trimestral
10. **Lista de próximas liberaciones** de recursos

### ✅ Mejoras Implementadas (Sesión 3 - Opus 4):
1. **Vista detallada completa por departamento** con modal interactivo
2. **Información granular de cada persona**:
   - Nombre, rol específico, % utilización individual
   - Proyectos asignados a cada persona
   - Barra visual de utilización con colores
3. **Simulador avanzado** con 3 niveles de análisis:
   - No viable (con acciones concretas)
   - Viable con riesgos (mitigaciones sugeridas)
   - Totalmente viable (ventanas óptimas)
4. **Mejoras de UX/UI**:
   - Animaciones profesionales
   - Efectos hover avanzados
   - Gradientes y sombras mejoradas
   - Modal con backdrop blur
5. **Atajos de teclado** (ESC, Ctrl+F, Ctrl+S)
6. **Auto-actualización** cada 30 segundos
7. **44 personas con datos completos** y realistas

---

## 🐛 BUGS Y MEJORAS IDENTIFICADAS (NUEVA SECCIÓN)

### 🔴 Bugs a Corregir:
1. **Números decimales sin acotar**
   - Problema: Aparecen cifras con muchos decimales
   - Solución: Limitar TODOS los números a máximo 2 decimales
   - Ubicaciones afectadas:
     * Cálculos de capacidad disponible
     * Porcentajes de utilización
     * Horas en simulador
     * KPIs dinámicos

### 🔶 Mejoras de UX Necesarias:
1. **Simulador de Proyectos - Escalabilidad del Front**
   - Problema actual: Con 8 departamentos caben los inputs, pero al añadir más departamentos el formulario será poco usable
   - Propuestas de mejora:
     * Opción 1: Selector de departamentos con checkboxes + inputs dinámicos solo para los seleccionados
     * Opción 2: Wizard/stepper por pasos (paso 1: seleccionar deptos, paso 2: introducir horas)
     * Opción 3: Tabla expandible con todos los departamentos
     * Opción 4: Búsqueda predictiva de departamentos + añadir dinámicamente
   - Prioridad: ALTA (limitará la escalabilidad futura)
   - Vista de calendario tipo gantt, sencilla. Con 3 trimestres o año entero.

---

## 🚀 CASOS DE USO IMPLEMENTADOS

**✅ Caso 1 - Evaluación de proyecto nuevo:**
- Simulador avanzado funcional con recomendaciones detalladas
- Cálculo automático de impacto con 3 niveles
- Recomendaciones cuantificadas (viable/riesgo/no viable)

**✅ Caso 2 - Justificación de recursos:**
- Vista detallada completa por departamento
- Identificación individual de personas sobrecargadas
- Datos granulares para argumentar contrataciones

**✅ Caso 3 - Planificación estratégica:**
- Timeline trimestral implementado
- Visualización de evolución de capacidad
- Identificación de ventanas de oportunidad

**✅ Caso 4 - Análisis departamental específico:**
- Sistema de filtros completamente funcional
- Vista individual por departamento con modal
- Drill-down a nivel de persona con proyectos específicos
- Presentaciones focalizadas por audiencia

**✅ Caso 5 - Gestión de equipos:**
- Vista completa del equipo por departamento
- Identificación de carga individual con %
- Proyectos específicos por persona
- Redistribución informada de proyectos

---

## 🔄 FUNCIONALIDADES PENDIENTES (Prioridad Actualizada)

### 🔥 Alta Prioridad:
1. **Sistema de entrada manual de datos**
   - Formularios para añadir/editar personas
   - Gestión de proyectos
   - Actualización de cargas de trabajo

2. **Conexión con base de datos**
   - Persistencia de datos
   - Sincronización entre sesiones
   - Preparación para servidor corporativo

3. **Sistema de reportes avanzado**
   - Exportación PDF para director general
   - Reportes personalizados por departamento
   - Templates de presentación

4. **⚠️ NUEVO: Rediseño del simulador para escalabilidad**
   - Interfaz que soporte N departamentos
   - Mantener usabilidad con 15+ departamentos
   - Posible implementación con selector dinámico

5. **⚠️ NUEVO: Fix de formato numérico**
   - Implementar .toFixed(2) en todos los cálculos
   - Revisar toda la aplicación para consistencia

### 🔶 Prioridad Media:
6. **Gestión de departamentos dinámicos**
   - Añadir/eliminar departamentos
   - Reorganizar personas entre departamentos
   - Templates de departamentos

7. **Vista calendario mejorada**
   - Timeline visual más detallado
   - Planificación de liberaciones
   - Drag & drop de proyectos

### 🔵 Prioridad Baja:
8. **Integraciones**
   - Import/Export Excel
   - Sincronización con herramientas PM
   - APIs para otras herramientas corporativas

9. **Analytics avanzado**
   - Histórico de utilización
   - Predicciones con IA
   - Tendencias y patrones

---

## 📋 CHECKLIST PARA PRÓXIMAS SESIONES

**Al iniciar nueva sesión con Claude, proporcionar:**

### ✅ Contexto básico:
- [ ] "Estoy trabajando en: Capacity Planning Netberry"
- [ ] "Objetivo: Demostrar viabilidad de proyectos y justificar recursos"
- [ ] "Estado actual: Dashboard mejorado con vista detallada y simulador avanzado"
- [ ] "Versión actual: Sesión 3 con Opus 4"

### ✅ Bugs a corregir primero:
- [ ] "Necesito corregir: números decimales sin límite (máximo 2 decimales)"
- [ ] "Necesito mejorar: simulador para que escale con más departamentos"

### ✅ Especificaciones técnicas:
- [ ] "Tengo 44 personas en 8 departamentos con datos completos"
- [ ] "Dashboard con filtros, drill-down modal y simulador avanzado funcionando"
- [ ] "Modal con vista detallada de personas implementado"
- [ ] "Colores: naranja corporativo, diseño moderno con animaciones"
- [ ] "Base de datos requerida, NO localStorage"

### ✅ Próxima prioridad:
- [ ] Especificar qué feature específico quiero desarrollar
- [ ] Si es el simulador: definir cómo debe comportarse con 15+ departamentos
- [ ] Si es entrada de datos: definir flujo de usuario
- [ ] Si es base de datos: especificar tecnología (MySQL, PostgreSQL, etc.)

---

## 📝 NOTAS DE EVOLUCIÓN

**Sesión 1 (Agosto 2025):**
- Mockup inicial creado ✅
- Definidos requisitos y scope ✅
- Documento de handoff inicial ✅

**Sesión 2 (Agosto 2025 - Sonnet 4):**
- Dashboard interactivo completo ✅
- Sistema de filtros por departamento ✅
- Vista básica con drill-down ✅
- 44 personas con datos básicos ✅
- Simulador básico funcional ✅
- KPIs dinámicos implementados ✅

**Sesión 3 (Agosto 2025 - Opus 4):**
- Modal detallado por departamento ✅
- Vista granular de personas con proyectos ✅
- Simulador avanzado con 3 niveles de análisis ✅
- Mejoras significativas de UX/UI ✅
- Animaciones profesionales ✅
- Atajos de teclado ✅
- **IDENTIFICADOS**: Bug decimales y problema escalabilidad simulador

**Próximas sesiones prioritarias:**
- [ ] **Corregir formato de números (2 decimales máx)**
- [ ] **Rediseñar simulador para soportar N departamentos**
- [ ] **Sistema de entrada manual de datos**
- [ ] **Conexión con base de datos**
- [ ] **Sistema de reportes PDF**

---

## 🎯 DECISION FRAMEWORK ACTUALIZADO

**Para aceptar/rechazar funcionalidades nuevas:**
- ✅ ¿Ayuda a decidir si cabe un proyecto?
- ✅ ¿Ayuda a justificar recursos al director?
- ✅ ¿Mejora la gestión granular de equipos?
- ✅ ¿Escala bien con el crecimiento de la empresa? (NUEVO)
- ✅ ¿Se puede implementar en 1-2 sesiones?
- ❌ ¿Complica demasiado la experiencia de usuario?
- ❌ ¿Requiere integraciones que no podemos controlar?

**Criterios de éxito:**
- Dashboard usado semanalmente por PMO ✅
- Presentaciones mensuales al director general (PENDIENTE)
- Reducción de proyectos no viables aceptados (MEDIR)
- Justificación exitosa de contrataciones (PENDIENTE)
- **NUEVO**: Soportar crecimiento a 60+ personas y 12+ departamentos

---

## 🔧 INFORMACIÓN TÉCNICA

**Tecnologías implementadas:**
- HTML5 + CSS3 + JavaScript puro
- Diseño responsive con animaciones CSS avanzadas
- Sistema modal nativo con backdrop blur
- Estructura modular preparada para backend

**Arquitectura actual:**
- Single page application
- Datos en memoria (temporal)
- Sistema de filtros reactivo
- Componentes reutilizables
- Event listeners optimizados

**Preparado para:**
- Base de datos relacional
- Servidor corporativo Netberry
- APIs REST para CRUD operations
- Autenticación corporativa
- Escalabilidad a 100+ usuarios

**Deuda técnica identificada:**
- Formato de números inconsistente
- Simulador no escalable para muchos departamentos
- Falta persistencia de datos
- Sin sistema de versionado de cambios

---

**🔄 INSTRUCCIÓN PARA CLAUDE (ACTUALIZADA):**
*"Este es un proyecto de Capacity Planning para PMO de Netberry. Dashboard mejorado con modal detallado, 44 personas con proyectos específicos, 8 departamentos, simulador avanzado con 3 niveles de análisis. BUGS CONOCIDOS: números con muchos decimales (limitar a 2), simulador no escalable para más departamentos. Usuario NO es programador. Explicar técnicamente pero enfocar en valor de negocio. Preguntar qué quiere: 1) Corregir bugs, 2) Mejorar simulador para escalar, 3) Sistema entrada datos, 4) Base datos, 5) Reportes PDF."*