# Guía de Contribución

## 🌟 Cómo Contribuir

¡Gracias por tu interés en contribuir a Netberry Capacity Planner! Esta guía te ayudará a configurar el proyecto para desarrollo y entender nuestro proceso de contribución.

## 📋 Proceso de Contribución

1. Fork del repositorio
2. Clonar tu fork
3. Crear una rama para tu feature
4. Hacer cambios
5. Commit y push
6. Crear Pull Request

## 🔧 Configuración del Entorno

### Requisitos
- Node.js v14+
- npm o yarn
- Git

### Pasos de Instalación
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/capacity_planner.git

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 📝 Convenciones de Código

### JavaScript
- Usar ES6+ features
- Seguir estilo Airbnb
- Documentar funciones y clases
- Tests para nueva funcionalidad

### CSS
- Seguir metodología BEM
- Mobile-first approach
- Usar variables CSS
- Mantener especificidad baja

### Commits
```bash
# Formato
tipo(scope): descripción

# Ejemplos
feat(gantt): add drag and drop support
fix(projects): resolve filter bug
docs(readme): update installation guide
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Watch mode
npm test:watch

# Cobertura
npm test:coverage
```

### Escribir Tests
```javascript
describe('Feature', () => {
    it('should work correctly', () => {
        // Arrange
        // Act
        // Assert
    });
});
```

## 📚 Documentación

- Documentar nueva funcionalidad
- Actualizar README si es necesario
- Incluir ejemplos de uso
- Mantener docs técnicos al día

## 🐛 Reportar Bugs

### Template
```markdown
**Descripción**
Descripción clara y concisa del bug

**Reproducción**
1. Ir a '...'
2. Click en '....'
3. Error aparece

**Comportamiento Esperado**
Descripción de lo que debería suceder

**Screenshots**
Si aplica, añadir screenshots

**Entorno**
- OS: [e.g. Windows 10]
- Navegador: [e.g. Chrome 88]
- Versión: [e.g. 1.0.0]
```

## 🚀 Feature Requests

### Template
```markdown
**Problema**
Descripción del problema que resuelve

**Solución Propuesta**
Descripción de la solución

**Alternativas**
Otras soluciones consideradas

**Contexto Adicional**
Cualquier otro contexto o screenshots
```

## 📜 Pull Request

### Template
```markdown
**Descripción**
Descripción clara de los cambios

**Tipo de Cambio**
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

**Tests**
- [ ] Añadidos nuevos tests
- [ ] Tests existentes pasan

**Checklist**
- [ ] Código sigue convenciones
- [ ] Documentación actualizada
- [ ] Tests añadidos/actualizados
- [ ] Revisión de código realizada
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/     # Componentes modulares
├── styles/        # Estilos CSS
├── utils/         # Utilidades
├── services/      # Servicios
└── tests/         # Tests
```

## 🎨 Diseño y UI

### Guías
- Seguir diseño existente
- Mantener consistencia
- Considerar accesibilidad
- Responsive design

### Colores
```css
:root {
    --color-primary: #2563eb;
    --color-secondary: #475569;
    /* etc */
}
```

## 🔒 Seguridad

- No commitear credenciales
- Validar inputs
- Sanitizar datos
- Seguir mejores prácticas

## 📈 Performance

### Guidelines
- Optimizar imágenes
- Minimizar DOM updates
- Usar lazy loading
- Comprimir assets

## 🌐 Internacionalización

- Usar strings traducibles
- Soportar RTL si necesario
- Considerar formatos locales

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (max-width: 1024px) { }
```

## ♿ Accesibilidad

- Usar ARIA labels
- Contraste adecuado
- Navegación por teclado
- Textos alternativos

## 🚥 CI/CD

### Proceso
1. Lint check
2. Tests
3. Build
4. Deploy preview
5. Production deploy

## 📦 Versionado

### Semantic Versioning
- MAJOR.MINOR.PATCH
- Breaking.Feature.Fix

## 👥 Código de Conducta

- Ser respetuoso
- Aceptar feedback
- Colaborar constructivamente
- Mantener profesionalismo

## 🤝 Soporte

- GitHub Issues
- Discussions
- Pull Requests
- Email team@example.com
