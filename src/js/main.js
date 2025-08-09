// Importaciones de módulos
import { initializeGanttView } from './components/gantt/GanttView.js';
import { initializeProjectsView } from './components/projects/ProjectsView.js';
import { initializeSimulatorView } from './components/simulator/SimulatorView.js';
import { initializeTheme } from './utils/theme.js';

// Estado global de la aplicación
const state = {
    currentView: 'gantt',
    theme: 'light'
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeTheme();
});

function initializeApp() {
    // Inicializar vistas
    initializeGanttView();
    initializeProjectsView();
    initializeSimulatorView();

    // Configurar navegación
    setupNavigation();

    // Mostrar vista inicial
    showView(state.currentView);
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav__button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            showView(view);
        });
    });
}

function showView(viewName) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => {
        view.hidden = true;
    });

    // Mostrar la vista seleccionada
    const selectedView = document.getElementById(`${viewName}-view`);
    if (selectedView) {
        selectedView.hidden = false;
        state.currentView = viewName;
    }

    // Actualizar estado de los botones
    updateNavigationState(viewName);
}

function updateNavigationState(activeView) {
    document.querySelectorAll('.nav__button').forEach(button => {
        button.classList.toggle('active', button.dataset.view === activeView);
    });
}
