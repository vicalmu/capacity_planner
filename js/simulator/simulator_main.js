// simulator-main.js - Coordinador principal del simulador

const SimulatorMode = {
    
    // === INICIALIZACIÓN PRINCIPAL ===
    init: function() {
        console.log('⚡ Inicializando Modo Simulador completo...');
        
        // Initialize core
        if (typeof SimulatorCore !== 'undefined') {
            SimulatorCore.init();
        } else {
            console.error('SimulatorCore no está disponible');
            return;
        }
        
        console.log('✅ Modo Simulador completamente inicializado');
    },

    // === DELEGACIÓN A CORE ===
    nextStep: function() {
        if (typeof SimulatorCore !== 'undefined') {
            SimulatorCore.nextStep();
        }
    },

    previousStep: function() {
        if (typeof SimulatorCore !== 'undefined') {
            SimulatorCore.previousStep();
        }
    },

    goToStep: function(stepNumber) {
        if (typeof SimulatorCore !== 'undefined') {
            SimulatorCore.goToStep(stepNumber);
        }
    },

    // === PANEL MANAGEMENT ===
    togglePanel: function() {
        if (typeof SimulatorCore !== 'undefined') {
            SimulatorCore.togglePanel();
        }
    },

    // === SCENARIO ACTIONS ===
    saveScenario: function() {
        if (typeof SimulatorCore !== 'undefined') {
            SimulatorCore.saveScenario();
        }
    },

    loadScenario: function() {
        console.log('📁 Cargando escenario...');
        SimulatorCore.showNotification('Funcionalidad de carga en desarrollo', 'info');
    },

    exportReport: function() {
        console.log('📊 Exportando informe...');
        SimulatorCore.showNotification('Funcionalidad de exportación en desarrollo', 'info');
    },

    resetSimulation: function() {
        if (typeof SimulatorCore !== 'undefined') {
            SimulatorCore.resetSimulation();
        }
    },

    // === MODAL MANAGEMENT ===
    closeScenariosModal: function() {
        const modal = document.getElementById('scenariosModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // === INICIALIZACIÓN CON AUTO-RESTORE ===
    initWithAutoRestore: function() {
        if (typeof SimulatorCore !== 'undefined') {
            SimulatorCore.initWithAutoRestore();
        } else {
            this.init();
        }
    },

    // === GETTERS PARA COMPATIBILIDAD ===
    get state() {
        return SimulatorCore ? SimulatorCore.state : {};
    }
};

// === FUNCIONES GLOBALES PARA COMPATIBILITY ===
function goHome() {
    if (SimulatorCore && SimulatorCore.state.currentStep > 1) {
        if (confirm('¿Estás seguro de que quieres salir? Se perderá el progreso actual.')) {
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
}

// === EVENT LISTENERS GLOBALES ===
document.addEventListener('keydown', (e) => {
    // ESC para salir
    if (e.key === 'Escape') {
        if (SimulatorCore && SimulatorCore.state.currentStep === 1) {
            goHome();
        } else if (SimulatorCore) {
            if (confirm('¿Volver al paso anterior o salir al home?\n\nSí = Paso anterior\nNo = Salir al home')) {
                SimulatorCore.previousStep();
            } else {
                goHome();
            }
        }
    }
    
    // Enter para continuar (excepto en inputs de texto)
    if (e.key === 'Enter' && !e.target.matches('textarea, input[type="text"], input[type="number"]')) {
        e.preventDefault();
        if (SimulatorCore) {
            SimulatorCore.nextStep();
        }
    }
});

// Prevenir pérdida de datos accidental
window.addEventListener('beforeunload', (e) => {
    if (SimulatorCore && 
        SimulatorCore.state.currentStep > 1 && 
        SimulatorCore.state.projectData.name) {
        e.preventDefault();
        e.returnValue = 'Tienes una simulación en progreso. ¿Estás seguro de que quieres salir?';
        
        // Auto-save antes de salir
        SimulatorCore.autoSave();
    }
});

// Auto-inicialización mejorada con verificación de dependencias
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que todas las dependencias estén disponibles
    const checkDependencies = () => {
        const required = ['SimulatorCore', 'SimulatorSteps', 'SimulatorAnalysis'];
        const missing = required.filter(dep => typeof window[dep] === 'undefined');
        
        if (missing.length > 0) {
            console.error('Dependencias faltantes:', missing);
            showErrorMessage('Error: Faltan módulos requeridos: ' + missing.join(', '));
            return false;
        }
        
        return true;
    };
    
    // Inicializar con pequeño delay
    setTimeout(() => {
        if (checkDependencies()) {
            if (typeof SimulatorMode !== 'undefined') {
                SimulatorMode.initWithAutoRestore();
            } else {
                console.error('SimulatorMode no está disponible');
                showErrorMessage('Error: SimulatorMode no se pudo inicializar');
            }
        }
    }, 150);
});

// Función para mostrar errores de carga
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fee2e2;
            border: 2px solid #fecaca;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            text-align: center;
            z-index: 9999;
            font-family: system-ui, sans-serif;
        ">
            <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
            <h3 style="color: #991b1b; margin-bottom: 12px;">Error de Inicialización</h3>
            <p style="color: #7f1d1d; margin-bottom: 20px;">${message}</p>
            <button onclick="location.href='index.html'" style="
                background: #dc2626;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            ">Volver al Inicio</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
}

// === FUNCIONES DE UTILIDAD GLOBAL ===

// Función para verificar estado del simulador
function getSimulatorStatus() {
    if (!SimulatorCore || !SimulatorCore.state.initialized) {
        return 'not_initialized';
    }
    
    const step = SimulatorCore.state.currentStep;
    const hasData = SimulatorCore.state.projectData.name;
    
    if (step === 1 && !hasData) return 'ready';
    if (step > 1 && hasData) return 'in_progress';
    if (step === 5 && SimulatorCore.state.recommendations) return 'completed';
    
    return 'unknown';
}

// Función para obtener progreso como porcentaje
function getProgressPercentage() {
    if (!SimulatorCore) return 0;
    return Math.round((SimulatorCore.state.currentStep / SimulatorCore.state.totalSteps) * 100);
}

// Función para obtener resumen del proyecto actual
function getProjectSummary() {
    if (!SimulatorCore || !SimulatorCore.state.projectData) {
        return null;
    }
    
    const projectData = SimulatorCore.state.projectData;
    const totalHours = Object.values(projectData.departments || {})
        .reduce((sum, hours) => sum + (hours || 0), 0);
    
    return {
        name: projectData.name || 'Sin nombre',
        duration: projectData.duration || 0,
        budget: projectData.budget || 0,
        totalHours,
        departments: Object.keys(projectData.departments || {}).length,
        progress: getProgressPercentage(),
        status: getSimulatorStatus()
    };
}

// Función para debug del estado
function debugSimulator() {
    if (!SimulatorCore) {
        console.log('❌ SimulatorCore no disponible');
        return;
    }
    
    console.group('🔍 Debug Simulator State');
    console.log('Status:', getSimulatorStatus());
    console.log('Progress:', getProgressPercentage() + '%');
    console.log('Current Step:', SimulatorCore.state.currentStep);
    console.log('Project Summary:', getProjectSummary());
    console.log('Full State:', SimulatorCore.state);
    console.groupEnd();
}

// Exponer funciones de utilidad
window.debugSimulator = debugSimulator;
window.getSimulatorStatus = getSimulatorStatus;
window.getProgressPercentage = getProgressPercentage;
window.getProjectSummary = getProjectSummary;

// Exponer SimulatorMode para uso global
window.SimulatorMode = SimulatorMode;

// === CONFIGURACIÓN DE DESARROLLO ===
// Solo en modo desarrollo, exponer funciones adicionales
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Función para simular datos de prueba
    window.loadTestData = function() {
        if (SimulatorCore) {
            SimulatorCore.state.projectData = {
                name: 'Proyecto de Prueba',
                duration: 6,
                startDate: '2025-03-01',
                budget: 150000,
                priority: 'high',
                type: 'web',
                departments: {
                    php: 300,
                    ux: 120,
                    qa: 80,
                    devops: 60
                }
            };
            
            SimulatorCore.renderCurrentStep();
            console.log('✅ Datos de prueba cargados');
        }
    };
    
    // Función para skip a cualquier paso
    window.skipToStep = function(step) {
        if (SimulatorCore && step >= 1 && step <= 5) {
            // Load test data if needed
            if (step > 1 && !SimulatorCore.state.projectData.name) {
                window.loadTestData();
            }
            
            SimulatorCore.goToStep(step);
            console.log('⚡ Saltado al paso', step);
        }
    };
    
    // Auto-completar para testing
    window.autoComplete = function() {
        if (SimulatorCore) {
            window.loadTestData();
            
            // Mock analysis results
            SimulatorCore.state.analysisResults = {
                impacts: [
                    { department: 'PHP', currentUtilization: 87.3, newUtilization: 95.2, status: 'warning', hoursRequired: 300 },
                    { department: 'UX-UI', currentUtilization: 73.8, newUtilization: 85.1, status: 'viable', hoursRequired: 120 }
                ],
                viability: 'risky',
                riskScore: 35
            };
            
            console.log('🚀 Auto-completado activado - Simulador listo para testing');
        }
    };
    
    console.log('🔧 Modo desarrollo activado. Funciones disponibles:');
    console.log('- loadTestData() - Cargar datos de prueba');
    console.log('- skipToStep(n) - Saltar al paso n');
    console.log('- autoComplete() - Auto-completar para testing');
    console.log('- debugSimulator() - Ver estado completo');
}