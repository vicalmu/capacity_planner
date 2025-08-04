# 📋 NETBERRY CAPACITY PLANNING - HANDOFF CON PROBLEMA CSS

## 🎯 OBJETIVO
PMO necesita demostrar al director general si caben nuevos proyectos y justificar contrataciones. Dashboard para controlar capacidad departamental y rechazar proyectos cuando no hay recursos.

## ⚠️ PROBLEMA ACTUAL EN CURSO
**Estado**: Timeline funciona pero barras de progreso se ven muy pequeñas después de arreglar funcionalidad trimestral.

### Síntomas del problema:
- ✅ **Timeline funcional**: Botones Anual/Trimestral funcionan correctamente
- ✅ **Datos correctos**: Se muestran los porcentajes y horas correctas
- ❌ **Barras visuales**: Las barras de progreso se ven muy pequeñas/estrechas
- ❌ **CSS conflictuado**: Los estilos temporales con `!important` pueden estar causando conflictos

### Código implementado que funciona:
```javascript
// En components-main.js - Timeline COMPLETO con funcionalidad trimestral
timeline: {
    render: function() { /* código completo implementado */ },
    generateAnnualData: function() { /* funciona */ },
    generateQuarterlyData: function() { /* funciona */ },
    bindToggleEvents: function() { /* funciona */ },
    switchView: function() { /* funciona */ }
}
```

### CSS temporal aplicado (puede estar causando conflictos):
```css
/* Fix temporal para timeline - REVISAR */
.timeline-row { display: flex !important; /* ... */ }
.timeline-bar { flex: 1 !important; height: 30px !important; /* ... */ }
.bar-segment { /* estilos con !important */ }
```

### Próximo paso necesario:
**Revisar CSS completo** (dividido en 6 archivos) para identificar conflictos y ajustar estilos del timeline para que las barras se vean del tamaño correcto.

## 📊 DATOS CLAVE
- **44 personas** en **8 departamentos**
- **54 proyectos activos** con fechas reales
- **Capacidad base**: 1800 horas/persona/año
- **Umbrales**: Verde 0-84% | Amarillo 85-94% | Rojo 95%+
- **Datos manuales** (Excel/PDF → entrada manual)

## ⚙️ ARQUITECTURA MODULAR FINAL
```
js/
├── data.js                    # Datos + cálculos (formatNumber máx 2 decimales)
├── utils.js                   # Filtros, validaciones, eventos  
├── gantt/
│   └── gantt-chart.js        # Gantt completo separado (168 líneas)
├── simulator/
│   └── simulator-domino.js   # Efecto dominó realista (456 líneas)
└── components-main.js        # Coordinador principal (378 líneas)
```

**HTML includes:**
```html
<script src="js/data.js"></script>
<script src="js/utils.js"></script>
<script src="js/gantt/gantt-chart.js"></script>
<script src="js/simulator/simulator-domino.js"></script>
<script src="js/components-main.js"></script>
```

## ✅ FUNCIONALIDADES COMPLETADAS
- **Dashboard completo** con KPIs dinámicos filtrados por departamento
- **Gantt anual** encima de KPIs con múltiples carriles, click en proyecto → modal
- **Filtros** por departamento (individual/múltiple/todos) con recálculo automático
- **Vista detallada** por departamento con modal navegable (flechas teclado)
- **⭐ Timeline anual/trimestral** FUNCIONAL (botones Anual/Trimestral operativos)
- **Sistema de proyectos** con lista filtrable y progreso visual
- **⭐ SIMULADOR REALISTA** - Efecto dominó con ralentización por prioridades

## 🎯 SIMULADOR EFECTO DOMINÓ (IMPLEMENTADO)
**Lógica realista:** Los proyectos se desarrollan en paralelo, los menos prioritarios sufren más ralentización.

### Características principales:
- **Wizard 4 pasos**: Información → Recursos → Impacto → Efecto Dominó Realista  
- **Rangos de ralentización**: 12% - 18% (no números absolutos)
- **Impacto por prioridad**:
  - 🔴 Críticos: 2% - 5% (protegidos)
  - 🟡 Altos: 8% - 12% (afectación media)  
  - 🟠 Medios: 15% - 20% (sufren más)
  - ⚫ Bajos: 25% - 35% (absorben el impacto)
- **Argumentos automáticos** para el director con frases preparadas
- **Exportación** de informe JSON para presentaciones

### Frases típicas generadas:
> *"Director, este proyecto sobrecarga PHP del 87% al 95%. Los proyectos críticos se ralentizarán 2-5%, pero los menos prioritarios hasta 25-35%. ¿Aceptamos este trade-off?"*

## 🔥 CASOS DE USO IMPLEMENTADOS
1. **✅ Evaluación de proyecto nuevo**: Simulador realista con matriz de prioridades
2. **✅ Justificación de recursos**: Vista granular por departamento + exportación
3. **✅ Planificación estratégica**: Timeline anual/trimestral filtrable
4. **✅ Confrontación con director**: Argumentos automáticos con rangos realistas
5. **✅ Análisis departamental**: Filtros + Gantt + modal navegable

## 🚧 PRÓXIMAS PRIORIDADES
1. **🔥 URGENTE: Arreglar CSS del timeline** (barras muy pequeñas)
2. **Sistema entrada manual datos** (formularios CRUD personas/proyectos)
3. **Base de datos** (persistencia - arquitectura modular preparada)
4. **Reportes PDF** (presentaciones director general)

## 💾 DATOS & PERSISTENCIA
- **NO localStorage/sessionStorage** (servidor corporativo)
- Entrada manual desde Excel/PDF/TXT
- Arquitectura modular preparada para MySQL/PostgreSQL
- Exportación JSON disponible (Ctrl+E en modal, botón exportar en simulador)

## 🎨 DISEÑO
- Color corporativo naranja (#ff6600)
- Responsive (ordenador principal + pantalla compartida)
- Modales nativos con navegación mejorada
- Gantt encima KPIs, timeline anual por defecto
- **⚠️ PROBLEMA**: Barras del timeline muy pequeñas tras ajustes CSS

## 🔧 ASPECTOS TÉCNICOS IMPORTANTES

### Inicialización:
- **Auto-inicialización** al cargar página con `DOMContentLoaded`
- Si falla: ejecutar `NetberryComponents.init()` en consola

### Arquitectura modular:
- **Sin conflictos** - Cada módulo se exporta independientemente
- **Coordinador principal** (`components-main.js`) orquesta todo
- **Dependencias claras**: Gantt → SimulatorDomino → Components-main

### Timeline implementado:
- ✅ **Funcionalidad**: Anual/Trimestral completamente operativo
- ✅ **Datos**: Porcentajes y horas correctos mostrados
- ❌ **Visual**: Barras de progreso muy pequeñas (problema CSS)

### Bugs solucionados:
- ✅ **Números decimales** limitados a 2 máximo (formatNumber)
- ✅ **Arquitectura modular** (1000 líneas vs 2000+ originales)
- ✅ **Simulador escalable** para N departamentos
- ✅ **Efecto dominó realista** vs secuencial irreal
- ✅ **Timeline funcional** (botones Anual/Trimestral operativos)

## 🔧 PARA RETOMAR SESIÓN

### Comando debug disponible:
```javascript
// Verificar estado
console.log('Timeline HTML:', document.getElementById('capacityTimeline').innerHTML);
console.log('Components:', typeof NetberryComponents);
NetberryComponents.init(); // Si es necesario
```

### Problema específico a resolver:
**"Timeline funciona pero barras de progreso se ven muy pequeñas - revisar CSS completo dividido en 6 archivos para identificar conflictos con estilos temporales aplicados"**

### Instrucción para Claude:
*"Proyecto Netberry Capacity Planning. Timeline FUNCIONAL pero problema visual: barras muy pequeñas. CSS dividido en 6 archivos, estilos temporales con !important aplicados. Necesario: revisar CSS completo, identificar conflictos, ajustar estilos timeline para barras tamaño correcto. Funcionalidad OK, solo problema visual CSS. Usuario NO programador."*

## 🎯 RESULTADO CONSEGUIDO
**Dashboard completamente funcional** con simulador devastador para confrontaciones director. **Solo falta ajuste visual CSS del timeline.**

**Estado:** ✅ **95% COMPLETADO** - Solo queda arreglo visual CSS timeline.