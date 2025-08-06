// js/gantt/gantt_ui_controller.js - Controlador de UI para el Gantt optimizado

const GanttUIController = {
    // Variables globales
    selectedDepartments: ['php', 'dotnet', 'devops', 'movilidad', 'ux', 'pmo', 'marketing', 'qa'],
    
    // Inicialización
    init: function() {
        this.bindEvents();
        this.updateSelectorDisplay();
        
        // Inicializar componentes principales
        setTimeout(() => {
            if (typeof GanttMode !== 'undefined') {
                GanttMode.init();
            } else if (typeof NetberryComponents !== 'undefined') {
                NetberryComponents.init();
            }
        }, 100);
    },

    // Event Listeners
    bindEvents: function() {
        // Click fuera para cerrar dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.department-selector')) {
                document.getElementById('selectorDropdown').classList.remove('show');
            }
            
            if (!e.target.closest('.mode-selector')) {
                document.getElementById('modeMenu').classList.remove('show');
            }
        });

        // Cambios en checkboxes de departamentos
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('#selectorDropdown')) {
                this.handleDepartmentChange(e.target);
            }
        });
    },

    // === DROPDOWN DE DEPARTAMENTOS ===
    toggleDepartmentDropdown: function() {
        const dropdown = document.getElementById('selectorDropdown');
        dropdown.classList.toggle('show');
    },

    selectAllDepartments: function() {
        const checkboxes = document.querySelectorAll('#selectorDropdown input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
        this.selectedDepartments = Array.from(checkboxes).map(cb => cb.value);
        this.updateSelectorDisplay();
        this.applyFilters();
    },

    clearAllDepartments: function() {
        const checkboxes = document.querySelectorAll('#selectorDropdown input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        this.selectedDepartments = [];
        this.updateSelectorDisplay();
        this.applyFilters();
    },

    handleDepartmentChange: function(checkbox) {
        const value = checkbox.value;
        if (checkbox.checked) {
            if (!this.selectedDepartments.includes(value)) {
                this.selectedDepartments.push(value);
            }
        } else {
            this.selectedDepartments = this.selectedDepartments.filter(dept => dept !== value);
        }
        this.updateSelectorDisplay();
        this.applyFilters();
    },

    updateSelectorDisplay: function() {
        const toggle = document.getElementById('selectedCount');
        const count = this.selectedDepartments.length;
        
        if (count === 0) {
            toggle.textContent = 'Ninguno';
        } else if (count === 8) {
            toggle.textContent = 'Todos (8)';
        } else {
            toggle.textContent = `${count} seleccionados`;
        }
        
        // Actualizar checkmarks visuales
        document.querySelectorAll('.option-item').forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const checkmark = item.querySelector('.checkmark');
            if (checkbox.checked) {
                item.classList.add('selected');
                checkmark.style.opacity = '1';
            } else {
                item.classList.remove('selected');
                checkmark.style.opacity = '0';
            }
        });
    },

    // === FILTROS RÁPIDOS ===
    showCriticalOnly: function() {
        const criticalDepts = ['php', 'dotnet', 'devops'];
        this.updateQuickFilter('critical', criticalDepts);
    },

    showAvailable: function() {
        const availableDepts = ['ux', 'pmo', 'marketing'];
        this.updateQuickFilter('available', availableDepts);
    },

    showAll: function() {
        const allDepts = ['php', 'dotnet', 'devops', 'movilidad', 'ux', 'pmo', 'marketing', 'qa'];
        this.updateQuickFilter('all', allDepts);
    },

    updateQuickFilter: function(type, deptList) {
        // Actualizar checkboxes
        document.querySelectorAll('#selectorDropdown input[type="checkbox"]').forEach(cb => {
            cb.checked = deptList.includes(cb.value);
        });
        
        this.selectedDepartments = deptList;
        this.updateSelectorDisplay();
        
        // Actualizar botones quick filter
        document.querySelectorAll('.quick-filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // Encontrar y activar el botón correspondiente
        const targetBtn = document.querySelector(`.quick-filter-btn[onclick*="${type === 'critical' ? 'showCriticalOnly' : type === 'available' ? 'showAvailable' : 'showAll'}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        
        this.applyFilters();
    },

    applyFilters: function() {
        console.log('Aplicando filtros:', this.selectedDepartments);
        
        // Llamar a la función de actualización del dashboard si existe
        if (typeof NetberryComponents !== 'undefined') {
            // Actualizar filtros activos en NetberryUtils si existe
            if (typeof NetberryUtils !== 'undefined') {
                NetberryUtils.activeFilters = this.selectedDepartments.length === 8 ? ['all'] : this.selectedDepartments;
            }
            NetberryComponents.updateAll();
        }
    },

    // === SELECTOR DE MODOS ===
    toggleModeMenu: function() {
        document.getElementById('modeMenu').classList.toggle('show');
    },

    switchMode: function(mode) {
        const modes = {
            'projects': 'projects.html',
            'simulator': 'simulator.html',
            'gantt': 'gantt.html'
        };
        
        if (modes[mode]) {
            window.location.href = modes[mode];
        }
    },

    // === NAVEGACIÓN ===
    goHome: function() {
        window.location.href = 'index.html';
    },

    // === ACCIONES DEL GANTT ===
    openSimulator: function() {
        if (typeof NetberryComponents !== 'undefined' && NetberryComponents.simulator) {
            NetberryComponents.simulator.openModal();
        } else {
            console.log('Simulador no disponible');
        }
    },

    exportGanttPDF: function() {
        console.log('Exportando Gantt a PDF');
        // Aquí iría la lógica de exportación
        alert('Funcionalidad de exportación a PDF en desarrollo');
    },

    togglePredictions: function() {
        console.log('Alternando predicciones');
        const btn = event.target;
        btn.classList.toggle('active');
        
        if (btn.classList.contains('active')) {
            btn.textContent = '🔮 Ocultar Predicciones';
            // Lógica para mostrar predicciones
        } else {
            btn.textContent = '🔮 Ver Predicciones';
            // Lógica para ocultar predicciones
        }
    },

    fullscreenGantt: function() {
        const ganttContainer = document.querySelector('.gantt-container-maximized');
        if (ganttContainer) {
            if (ganttContainer.requestFullscreen) {
                ganttContainer.requestFullscreen();
            } else if (ganttContainer.webkitRequestFullscreen) {
                ganttContainer.webkitRequestFullscreen();
            } else if (ganttContainer.msRequestFullscreen) {
                ganttContainer.msRequestFullscreen();
            }
        }
    },

    // === UTILIDADES ===
    updateKPIHeader: function() {
        const kpiContainer = document.getElementById('kpiHeaderCompact');
        if (!kpiContainer) return;

        // Generar KPIs compactos para el header
        const kpis = [
            { label: 'Disponible', value: '4.2k', color: '#10b981' },
            { label: 'Críticos', value: '3', color: '#ef4444' },
            { label: 'Proyectos', value: '12', color: '#3b82f6' }
        ];

        kpiContainer.innerHTML = kpis.map(kpi => `
            <div class="kpi-compact" style="border-left-color: ${kpi.color}">
                <div class="kpi-value-compact">${kpi.value}</div>
                <div class="kpi-label-compact">${kpi.label}</div>
            </div>
        `).join('');
    },

    updateHealthIndicators: function() {
        // Actualizar indicadores de health y alerts en el header
        const healthElement = document.getElementById('healthCompact');
        const alertsElement = document.getElementById('alertsCompact');
        
        if (healthElement) {
            // Aquí se actualizaría con datos reales
            healthElement.textContent = '87';
        }
        
        if (alertsElement) {
            // Aquí se actualizaría con datos reales
            alertsElement.textContent = '3';
        }
    },

    // === INICIALIZACIÓN COMPLETA ===
    refresh: function() {
        this.updateSelectorDisplay();
        this.updateKPIHeader();
        this.updateHealthIndicators();
        this.applyFilters();
    }
};

// Funciones globales para onclick (compatibilidad)
function toggleDepartmentDropdown() {
    GanttUIController.toggleDepartmentDropdown();
}

function selectAllDepartments() {
    GanttUIController.selectAllDepartments();
}

function clearAllDepartments() {
    GanttUIController.clearAllDepartments();
}

function showCriticalOnly() {
    GanttUIController.showCriticalOnly();
}

function showAvailable() {
    GanttUIController.showAvailable();
}

function showAll() {
    GanttUIController.showAll();
}

function toggleModeMenu() {
    GanttUIController.toggleModeMenu();
}

function switchMode(mode) {
    GanttUIController.switchMode(mode);
}

function goHome() {
    GanttUIController.goHome();
}

function openSimulator() {
    GanttUIController.openSimulator();
}

function exportGanttPDF() {
    GanttUIController.exportGanttPDF();
}

function togglePredictions() {
    GanttUIController.togglePredictions();
}

function fullscreenGantt() {
    GanttUIController.fullscreenGantt();
}

// Auto-inicialización
document.addEventListener('DOMContentLoaded', function() {
    GanttUIController.init();
});

// Exportar para uso global
window.GanttUIController = GanttUIController;