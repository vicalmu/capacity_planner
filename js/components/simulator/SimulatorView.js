export function initializeSimulatorView() {
    const view = document.getElementById('simulator-view');
    if (!view) return;

    view.innerHTML = `
        <div class="simulator-container">
            <h1>Simulador de Capacidad</h1>
            <p>Implementación en progreso...</p>
        </div>
    `;
}