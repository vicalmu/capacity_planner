export function initializeProjectsView() {
    const view = document.getElementById('projects-view');
    if (!view) return;

    view.innerHTML = `
        <div class="projects-container">
            <h1>Vista de Proyectos</h1>
            <p>Implementación en progreso...</p>
        </div>
    `;
}