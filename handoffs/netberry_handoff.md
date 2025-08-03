# 📋 NETBERRY CAPACITY PLANNING - HANDOFF

## 🎯 OBJETIVO
PMO necesita demostrar al director general si caben nuevos proyectos y justificar contrataciones. Dashboard para controlar capacidad departamental y rechazar proyectos cuando no hay recursos.

## 📊 DATOS CLAVE
- **44 personas** en **8 departamentos**
- **54 proyectos activos** implementados
- **Umbrales**: Verde 0-84% | Amarillo 85-94% | Rojo 95%+
- **Datos manuales** (Excel/PDF → entrada manual)

## ⚙️ ARQUITECTURA MODULAR (8 archivos)
```
index.html          # Layout base (300 líneas)
styles.css           # Estilos separados
data.js              # Datos + cálculos (formatNumber máx 2 decimales)
utils.js             # Filtros, validaciones, eventos
components.js        # UI modular (KPIs, filtros, departamentos, timeline)
modal.js             # Modal navegable con drill-down por persona
simulator.js         # Simulador escalable 3 pasos para nuevos proyectos
main.js              # Inicializador + debug tools
```

## ✅ FUNCIONALIDADES COMPLETADAS
- Dashboard con KPIs dinámicos que se recalculan según filtros
- Filtros por departamento (individual/múltiple/todos)
- Vista detallada por departamento con modal navegable (flechas teclado)
- Simulador de proyectos escalable (wizard 3 pasos)
- **Timeline trimestral filtrable por departamento** ← RECIÉN IMPLEMENTADO
- Alertas visuales cuando departamentos ≥85%
- Atajos teclado (ESC, Ctrl+F, Ctrl+S, Ctrl+R, ←→)
- Validación automática números (máx 2 decimales)

## 🔥 PRÓXIMAS PRIORIDADES
1. **Sistema entrada manual datos** (formularios CRUD personas/proyectos)
2. **Base de datos** (persistencia - arquitectura ya preparada)
3. **Reportes PDF** (presentaciones director general)
4. **Llevar Simulador de proyectos a un popup** (no me gusta ahi abajo)

## 💾 DATOS & PERSISTENCIA
- **NO localStorage/sessionStorage** (servidor corporativo)
- Entrada manual desde Excel/PDF/TXT
- Arquitectura preparada para MySQL/PostgreSQL
- Exportación JSON disponible (Ctrl+E)

## 🎨 DISEÑO
- Color corporativo naranja (#ff6600)
- Responsive (ordenador principal + pantalla compartida)
- Animaciones suaves, modal nativo
- Datos muy visibles para presentaciones

## 🔧 PARA RETOMAR SESIÓN
**Instrucción Claude**: *"Proyecto Capacity Planning PMO Netberry. Dashboard modular funcional con 44 personas, 8 departamentos, timeline filtrable. Arquitectura 8 archivos. Usuario NO programador. Próximo: [especificar funcionalidad]. Bugs críticos ya solucionados - no mencionar."*

**Debug disponible**: `Netberry.debug.showState()` en consola