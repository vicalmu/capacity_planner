# 🎯 PROMPT COMPLETO - PROYECTO NETBERRY CAPACITY PLANNER
*Prompt para crear desde cero un dashboard PMO de planificación de capacidad*

## 📋 **DESCRIPCIÓN DEL PROYECTO**

Crea un **dashboard web PMO (Project Management Office)** llamado **"Netberry Capacity Planner"** para la gestión inteligente de recursos y planificación de proyectos.

---

## 🎯 **OBJETIVO PRINCIPAL**

**Problema a resolver:** Los PMOs necesitan herramientas para:
- ✅ **Evaluar viabilidad** de nuevos proyectos
- ✅ **Justificar contrataciones** con datos concretos  
- ✅ **Rechazar proyectos** sin recursos disponibles
- ✅ **Planificar capacidad** a medio/largo plazo
- ✅ **Visualizar utilización** departamental en tiempo real

**Usuario objetivo:** Project Managers y directores de PMO que toman decisiones estratégicas sobre recursos humanos y asignación de proyectos.

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **📊 DATOS BASE:**
- **8 departamentos:** PHP, .NET, DevOps, Movilidad, UX, PMO, Marketing, QA
- **20 personas total** (2-3 personas por departamento)
- **12 proyectos activos** con fechas reales y departamentos asignados
- **Capacidad base:** 1800 horas/persona/año
- **Utilización real:** Calculada dinámicamente por proyectos

### **🎮 ESTRUCTURA MODULAR:**
```
netberry-capacity-planner/
├── index.html              # Home con overview general
├── gantt.html              # Modo Gantt (timeline + capacidad)
├── projects.html           # Modo Proyectos (gestión completa)
├── simulator.html          # Modo Simulador (impacto de proyectos)
├── css/
│   ├── styles.css          # Archivo maestro con imports
│   ├── 01-base.css         # Variables y reset
│   ├── layout/             # Módulos de layout
│   └── components/         # Componentes específicos
└── js/
    ├── data.js             # Datos de departamentos y proyectos
    ├── utils.js            # Utilidades y cálculos
    ├── components_main.js  # Componentes principales
    └── [modo]/             # Controladores por modo
```

---

## 🎯 **MODOS DE FUNCIONAMIENTO**

### **1. 🏠 HOME (index.html)**
**Dashboard overview con:**
- **KPI Cards:** Disponibilidad total, departamentos críticos, proyectos activos, health score
- **Gráficos:** Utilización por departamento, timeline de proyectos
- **Alertas inteligentes:** Departamentos sobrecargados, oportunidades de capacidad
- **Navegación:** Acceso rápido a los 3 modos especializados

### **2. 📊 MODO GANTT (gantt.html)**
**Timeline con capacidad integrada:**
- **Gantt fusionado:** Cada fila muestra capacidad departamental + proyectos en timeline
- **Cálculo mensual:** Utilización real = (horas proyectos / capacidad mensual) × 100
- **Vista dual:** Anual (12 meses) o Trimestral (3 meses)
- **Filtros inteligentes:** Selector multiselect de departamentos
- **Colores estado:** Verde (0-84%), Naranja (85-94%), Rojo (95%+)

### **3. 📋 MODO PROYECTOS (projects.html)**
**Gestión completa de proyectos:**
- **Vista múltiple:** Lista, Kanban, Timeline
- **Estados:** Backlog, Activo, Completado, Archivado
- **Filtros avanzados:** Por estado, departamento, prioridad, rango de fechas
- **Acciones bulk:** Crear, editar, archivar múltiples proyectos
- **Templates:** Plantillas predefinidas por tipo de proyecto

### **4. ⚡ MODO SIMULADOR (simulator.html)**
**Wizard de impacto de proyectos:**
- **Paso 1:** Configuración proyecto (nombre, tipo, horas, fechas, departamentos)
- **Paso 2:** Asignación recursos (sliders para distribuir horas por departamento)
- **Paso 3:** Análisis impacto (visualización utilización resultante por departamento)
- **Paso 4:** Efecto dominó (proyectos afectados, retrasos potenciales)
- **Paso 5:** Recomendaciones (argumentos para directores, plan de acción)

---

## 🎨 **DISEÑO Y UX**

### **🎨 PALETA DE COLORES:**
```css
:root {
    --primary-orange: #ff6b35;
    --secondary-orange: #f7941e;
    --dark: #2c3e50;
    --gray-100: #f8f9fa;
    --gray-200: #e9ecef;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
}
```

### **📱 RESPONSIVE DESIGN:**
- **Desktop first** con breakpoints: 1200px, 768px, 480px
- **Mobile optimized:** Navegación colapsada, tablas scroll horizontal
- **Touch friendly:** Botones >44px, espaciado adecuado

### **✨ COMPONENTES CLAVE:**
- **Header inteligente:** Logo + modo actual + indicadores health + KPIs compactos
- **Selector de modos:** Dropdown con iconos (📊 Gantt, 📋 Proyectos, ⚡ Simulador)
- **Filtros avanzados:** Multiselect de departamentos con estados visuales
- **Cards adaptables:** KPIs, proyectos, departamentos con hover effects
- **Modales fullscreen:** Para configuración y detalles

---

## ⚙️ **FUNCIONALIDADES TÉCNICAS**

### **📊 CÁLCULOS CORE:**
```javascript
// Utilización departamental
utilizacion = (horasProyectosActivos / capacidadAnual) * 100

// Disponibilidad mensual
disponibilidadMes = (capacidadMensual - horasAsignadasMes) / capacidadMensual

// Health Score algoritmo
healthScore = 100 - penalizacionSobreutilizacion - penalizacionSubutilizacion + bonusBalance
```

### **🎯 ALGORITMOS INTELIGENTES:**
- **Detección automática** de departamentos críticos (>85% utilización)
- **Predicción de capacidad** basada en tendencias de proyectos
- **Sugerencias de reasignación** para optimizar cargas de trabajo
- **Cálculo de impacto** de nuevos proyectos en tiempo real

### **🔄 INTERACTIVIDAD:**
- **Filtros en tiempo real** sin recarga de página
- **Drag & drop** en modo Kanban
- **Tooltips informativos** en gráficos y métricas
- **Animations smooth** para transiciones de estado
- **Keyboard shortcuts** para power users

---

## 🎮 **EXPERIENCIA DE USUARIO**

### **🎯 FLUJO PRINCIPAL:**
1. **Entrada:** Home dashboard con overview general
2. **Análisis:** Modo Gantt para visualizar timeline y capacidad
3. **Gestión:** Modo Proyectos para administrar cartera
4. **Planificación:** Modo Simulador para evaluar nuevos proyectos
5. **Decisión:** Exportar reportes y tomar acciones

### **💡 SMART ALERTS:**
- **Crítico:** "DevOps al 94% - Contratación urgente recomendada"
- **Oportunidad:** "UX con 30% capacidad libre - Puede absorber trabajo"
- **Predicción:** "Necesitarás 2 desarrolladores PHP en Q4 2025"

### **🤖 AI RECOMMENDATIONS:**
- Reasignación óptima de recursos entre departamentos
- Sugerencias de contratación con ROI calculado
- Optimización de cronogramas para reducir conflictos
- Automatizaciones para liberar capacidad

---

## 📱 **ESPECIFICACIONES TÉCNICAS**

### **🛠️ TECNOLOGÍAS:**
- **Frontend:** HTML5, CSS3 (Grid + Flexbox), Vanilla JavaScript
- **Styling:** CSS custom properties, modular architecture
- **Charts:** CSS-based visualizations o Chart.js
- **Responsive:** Mobile-first con progressive enhancement
- **Performance:** Lazy loading, optimized assets

### **📦 DEPENDENCIAS MÍNIMAS:**
- No frameworks pesados (React, Vue, etc.)
- Máximo 2-3 librerías externas pequeñas
- Priorizar CSS puro sobre Bootstrap/Tailwind
- JavaScript vanilla para máximo control

### **🎛️ CONFIGURABILIDAD:**
- Datos mock facilmente editables en `data.js`
- Capacidades por departamento ajustables
- Proyectos y fechas configurables
- Algoritmos de cálculo parametrizables

---

## 🚀 **ENTREGABLES ESPERADOS**

### **📄 ARCHIVOS PRINCIPALES:**
1. **4 páginas HTML** funcionales y navegables
2. **Sistema CSS modular** <500 líneas por archivo
3. **JavaScript organizado** por responsabilidades
4. **Datos mock realistas** para demostración
5. **README completo** con instrucciones de uso

### **✨ CARACTERÍSTICAS DISTINTIVAS:**
- **Dashboard PMO real:** No es un proyecto educativo, sino una herramienta profesional
- **Cálculos precisos:** Algoritmos que PMOs pueden usar en producción
- **UX optimizada:** Diseñado para toma de decisiones rápidas
- **Escalabilidad:** Arquitectura preparada para datos reales vía API

### **🎯 CASOS DE USO REALES:**
- "¿Podemos aceptar este proyecto de 500h en Q3?"
- "¿Cuántos developers PHP necesitamos contratar?"
- "¿Qué impacto tendría retrasar el proyecto X 2 semanas?"
- "¿Cuál es el estado real de capacidad por departamento?"

---

## 💎 **VALOR DIFERENCIAL**

Este no es un dashboard genérico, sino una **herramienta especializada PMO** que:
- ✅ **Combina timeline + capacidad** en vista única (Gantt fusionado)
- ✅ **Calcula impacto real** de decisiones de proyectos
- ✅ **Genera argumentos automáticos** para justificar recursos
- ✅ **Predice necesidades futuras** basado en tendencias
- ✅ **Optimiza asignaciones** para maximizar eficiencia

**Resultado:** Una herramienta que PMOs pueden usar directamente para tomar decisiones estratégicas fundamentadas en datos reales de capacidad y utilización.