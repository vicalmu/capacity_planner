// Datos de ejemplo para el Gantt
const sampleData = {
    projects: [
        {
            id: 1,
            name: "Proyecto A",
            tasks: [
                { id: 1, name: "Tarea 1", start: "2024-03-01", end: "2024-03-15" },
                { id: 2, name: "Tarea 2", start: "2024-03-10", end: "2024-03-25" }
            ]
        },
        {
            id: 2,
            name: "Proyecto B",
            tasks: [
                { id: 3, name: "Tarea 3", start: "2024-03-05", end: "2024-03-20" },
                { id: 4, name: "Tarea 4", start: "2024-03-15", end: "2024-03-30" }
            ]
        }
    ]
};

export function initializeGanttView() {
    const view = document.getElementById('gantt-view');
    if (!view) return;

    // Limpiar la vista
    view.innerHTML = '';

    // Crear la estructura básica
    const container = createGanttContainer();
    view.appendChild(container);

    // Inicializar datos
    renderGanttData(container, sampleData);
}

function createGanttContainer() {
    const container = document.createElement('div');
    container.className = 'gantt-container';
    
    container.innerHTML = `
        <div class="gantt-header">
            <h1 class="gantt-title">Diagrama de Gantt</h1>
            <div class="gantt-controls">
                <button class="gantt-button" id="new-project">Nuevo Proyecto</button>
                <button class="gantt-button" id="export-gantt">Exportar</button>
            </div>
        </div>
        
        <div class="gantt-toolbar">
            <div class="gantt-toolbar__group">
                <button class="gantt-button" id="gantt-today">Hoy</button>
                <button class="gantt-button" id="gantt-prev">◀</button>
                <button class="gantt-button" id="gantt-next">▶</button>
            </div>
            
            <div class="gantt-toolbar__separator"></div>
            
            <div class="gantt-toolbar__group gantt-zoom">
                <button class="gantt-zoom__button" id="zoom-out">-</button>
                <span>Zoom</span>
                <button class="gantt-zoom__button" id="zoom-in">+</button>
            </div>
            
            <div class="gantt-toolbar__separator"></div>
            
            <div class="gantt-toolbar__group">
                <select class="gantt-view-selector">
                    <option value="day">Día</option>
                    <option value="week" selected>Semana</option>
                    <option value="month">Mes</option>
                </select>
            </div>
        </div>
        
        <div class="gantt-grid">
            <div class="gantt-sidebar">
                <!-- Lista de proyectos y tareas -->
            </div>
            <div class="gantt-timeline">
                <!-- Timeline del Gantt -->
            </div>
        </div>
    `;

    // Añadir event listeners
    setupEventListeners(container);
    
    return container;
}

function setupEventListeners(container) {
    // Botón Nuevo Proyecto
    container.querySelector('#new-project').addEventListener('click', () => {
        console.log('Crear nuevo proyecto');
        // TODO: Implementar creación de proyecto
    });

    // Botón Exportar
    container.querySelector('#export-gantt').addEventListener('click', () => {
        console.log('Exportar Gantt');
        // TODO: Implementar exportación
    });

    // Navegación
    container.querySelector('#gantt-today').addEventListener('click', () => {
        console.log('Ir a hoy');
        // TODO: Implementar navegación a hoy
    });

    container.querySelector('#gantt-prev').addEventListener('click', () => {
        console.log('Anterior');
        // TODO: Implementar navegación anterior
    });

    container.querySelector('#gantt-next').addEventListener('click', () => {
        console.log('Siguiente');
        // TODO: Implementar navegación siguiente
    });

    // Zoom
    container.querySelector('#zoom-in').addEventListener('click', () => {
        console.log('Aumentar zoom');
        // TODO: Implementar zoom in
    });

    container.querySelector('#zoom-out').addEventListener('click', () => {
        console.log('Reducir zoom');
        // TODO: Implementar zoom out
    });

    // Selector de vista
    container.querySelector('.gantt-view-selector').addEventListener('change', (e) => {
        console.log('Cambiar vista a:', e.target.value);
        // TODO: Implementar cambio de vista
    });
}

function renderGanttData(container, data) {
    const sidebar = container.querySelector('.gantt-sidebar');
    const timeline = container.querySelector('.gantt-timeline');

    if (!sidebar || !timeline) return;

    // Renderizar proyectos en la barra lateral
    sidebar.innerHTML = data.projects.map(project => `
        <div class="gantt-row">
            <strong>${project.name}</strong>
            ${project.tasks.map(task => `
                <div class="gantt-row">
                    ${task.name}
                </div>
            `).join('')}
        </div>
    `).join('');

    // TODO: Implementar renderizado del timeline
    timeline.innerHTML = '<div>Timeline en desarrollo...</div>';
}