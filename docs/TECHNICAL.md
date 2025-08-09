# Documentación Técnica - Capacity Planner

## 🏗️ Arquitectura

### Frontend
- **Build System**: Vite
- **Módulos**: ES Modules
- **Estilos**: CSS Modular con metodología BEM
- **Assets**: Sistema de assets estáticos en directorio público

### Estructura de Componentes

#### 1. Vista Gantt (`/js/components/gantt/`)
- `GanttView.js`: Componente principal
- `gantt_chart.js`: Lógica de visualización
- `gantt_controller.js`: Controlador de datos
- `gantt_ui_controller.js`: Controlador de UI

#### 2. Vista Proyectos (`/js/components/projects/`)
- `ProjectsView.js`: Componente principal
- `projects_controller.js`: Lógica de gestión

#### 3. Simulador (`/js/components/simulator/`)
- `SimulatorView.js`: Componente principal
- `simulator_core.js`: Lógica central
- `simulator_analysis.js`: Análisis de datos
- `simulator_domino.js`: Cálculo de efecto dominó
- `simulator_steps.js`: Gestión de pasos

### Sistema de Estilos

#### Base (`/css/base/`)
- `reset.css`: Reset CSS personalizado
- `variables.css`: Variables CSS globales
- `typography.css`: Configuración tipográfica

#### Componentes (`/css/components/`)
- Estilos modulares por componente
- Implementación BEM
- Reutilización de variables

#### Temas (`/css/themes/`)
- `light.css`: Tema claro
- `dark.css`: Tema oscuro

## 🔄 Flujo de Datos

### Gantt
1. Inicialización del controlador
2. Carga de datos de proyectos
3. Renderizado de timeline
4. Actualización en tiempo real

### Proyectos
1. Carga inicial de portfolio
2. CRUD de proyectos
3. Actualización de vista Kanban
4. Sincronización con Gantt

### Simulador
1. Entrada de parámetros
2. Análisis de efecto dominó
3. Cálculo de impacto
4. Generación de recomendaciones

## 🛠️ Utilidades

### Date Utils (`/js/utils/date.js`)
- Formateo de fechas
- Cálculos temporales
- Conversiones de zona horaria

### DOM Utils (`/js/utils/dom.js`)
- Manipulación del DOM
- Gestión de eventos
- Utilidades de renderizado

### Theme Utils (`/js/utils/theme.js`)
- Gestión de temas
- Persistencia de preferencias
- Cambios dinámicos

## 📦 Assets

### Iconos SVG (`/public/assets/`)
- `gantt-icon.svg`: Icono de Gantt
- `projects-icon.svg`: Icono de Proyectos
- `simulator-icon.svg`: Icono de Simulador

## 🔧 Scripts

### clear-port.js
- Libera el puerto 3000
- Implementado con ES Modules
- Manejo de errores robusto

## 🎨 Diseño UI/UX

### Landing Page
- Diseño moderno con tarjetas
- Animaciones suaves
- Feedback visual
- Accesibilidad mejorada

### Componentes Compartidos
- Sistema de tarjetas
- Etiquetas de características
- Iconografía consistente
- Paleta de colores unificada

## 🔍 Debugging

### Logs
- Niveles: INFO, WARN, ERROR
- Contexto detallado
- Timestamp incluido

### Errores
- Manejo centralizado
- Feedback visual
- Retry automático cuando es posible

## 🔒 Seguridad

### Sanitización
- Inputs validados
- Datos escapados
- XSS prevenido

### Navegación
- Rutas validadas
- Estados persistidos
- Sesión gestionada

## 📱 Responsive

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Adaptaciones
- Layout fluido
- Imágenes optimizadas
- Touch-friendly

## 🚀 Performance

### Optimizaciones
- Code splitting
- Lazy loading
- Asset optimization
- Cache estratégico

## 🔄 CI/CD

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 📈 Monitoreo

### Métricas
- Tiempo de carga
- Interacciones de usuario
- Errores
- Performance

## 🔜 Roadmap Técnico

1. Implementar lazy loading
2. Mejorar sistema de caché
3. Añadir tests unitarios
4. Implementar PWA
5. Optimizar assets
6. Mejorar accesibilidad