// Importaciones de módulos
import { initializeGanttView } from './components/gantt/GanttView.js';
import { initializeProjectsView } from './components/projects/ProjectsView.js';
import { initializeSimulatorView } from './components/simulator/SimulatorView.js';
import { initializeTheme } from './utils/theme.js';

// Estado global de la aplicación
const state = {
    currentView: null,
    theme: 'light'
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeTheme();
});

function initializeApp() {
    // Configurar navegación
    setupNavigation();

    // Manejar la ruta inicial
    handleRoute();

    // Escuchar cambios en la URL
    window.addEventListener('popstate', handleRoute);
}

function setupNavigation() {
    const modeButtons = document.querySelectorAll('.mode-button');
    modeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Permitir la navegación normal del navegador
            const view = button.dataset.view;
            window.location.href = `/${view}`;
        });
    });
}

function handleRoute() {
    const path = window.location.pathname;
    const view = path.substring(1) || 'home'; // Si no hay path, mostrar home
    
    if (view === 'home') {
        showModeSelector();
    } else {
        selectMode(view);
    }
}

function navigateToView(viewName) {
    // Actualizar la URL
    const newPath = viewName === 'home' ? '/' : `/${viewName}`;
    window.history.pushState({}, '', newPath);
    
    // Actualizar la vista
    if (viewName === 'home') {
        showModeSelector();
    } else {
        selectMode(viewName);
    }
}

function showModeSelector() {
    // Mostrar el selector de modos
    const modeSelector = document.querySelector('.mode-selector');
    if (modeSelector) {
        modeSelector.style.display = 'grid';
    }

    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => {
        view.hidden = true;
    });

    // Resetear el estado actual
    state.currentView = null;
    updateNavigationState(null);
}

function selectMode(viewName) {
    // Ocultar el selector de modos
    const modeSelector = document.querySelector('.mode-selector');
    if (modeSelector) {
        modeSelector.style.display = 'none';
    }

    // Inicializar la vista correspondiente
    switch (viewName) {
        case 'gantt':
            initializeGanttView();
            break;
        case 'projects':
            initializeProjectsView();
            break;
        case 'simulator':
            initializeSimulatorView();
            break;
        default:
            showModeSelector();
            return;
    }

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
    document.querySelectorAll('.mode-button').forEach(button => {
        button.classList.toggle('active', button.dataset.view === activeView);
    });
}