// simulator-core.js - Núcleo principal del simulador

const SimulatorCore = {
    // Estado central del simulador
    state: {
        initialized: false,
        currentStep: 1,
        totalSteps: 5,
        projectData: {
            name: '',
            duration: 6,
            startDate: '',
            budget: 0,
            priority: 'medium',
            type: 'custom',
            departments: {}
        },
        analysisResults: null,
        dominoEffects: null,
        recommendations: null,
        savedScenarios: []
    },

    // === INICIALIZACIÓN ===
    init: function() {
        console.log('⚡ Inicializando Simulador Core...');
        
        this.setupSimulatorMode();
        this.renderCurrentStep();
        this.bindEvents();
        this.loadSavedScenarios();
        
        this.state.initialized = true;
        console.log('✅ Simulador Core inicializado');
    },

    setupSimulatorMode: function() {
        // Configurar tema visual
        document.documentElement.style.setProperty('--mode-color', '#dc2626');
        
        // Configurar fecha por defecto
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0];
        const startDateInput = document.getElementById('projectStartDate');
        if (startDateInput) {
            startDateInput.value = defaultDate;
        }
        
        // Inicializar progress
        this.updateProgress();
    },

    // === NAVEGACIÓN ENTRE PASOS ===
    nextStep: function() {
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.saveCurrentStepData();
        
        if (this.state.currentStep < this.state.totalSteps) {
            this.state.currentStep++;
            this.updateProgress();
            this.renderCurrentStep();
            this.updateNavigation();
            
            // Trigger análisis específico por paso
            this.triggerStepAnalysis();
        }
    },

    previousStep: function() {
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.updateProgress();
            this.renderCurrentStep();
            this.updateNavigation();
        }
    },

    goToStep: function(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.state.totalSteps) {
            this.state.currentStep = stepNumber;
            this.updateProgress();
            this.renderCurrentStep();
            this.updateNavigation();
        }
    },

    triggerStepAnalysis: function() {
        switch (this.state.currentStep) {
            case 3:
                if (typeof SimulatorAnalysis !== 'undefined') {
                    SimulatorAnalysis.performImpactAnalysis();
                }
                break;
            case 4:
                if (typeof SimulatorAnalysis !== 'undefined') {
                    SimulatorAnalysis.performDominoAnalysis();
                }
                break;
            case 5:
                if (typeof SimulatorAnalysis !== 'undefined') {
                    SimulatorAnalysis.generateRecommendations();
                }
                break;
        }
    },

    // === RENDERIZADO PRINCIPAL ===
    renderCurrentStep: function() {
        // Ocultar todos los pasos
        document.querySelectorAll('.simulation-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Mostrar paso actual
        const currentStepEl = document.getElementById(`step${this.state.currentStep}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }
        
        // Delegar renderizado específico
        this.delegateStepRendering();
        
        // Actualizar breadcrumbs
        this.updateBreadcrumbs();
    },

    delegateStepRendering: function() {
        switch (this.state.currentStep) {
            case 1:
                if (typeof SimulatorSteps !== 'undefined') {
                    SimulatorSteps.renderStep1();
                }
                break;
            case 2:
                if (typeof SimulatorSteps !== 'undefined') {
                    SimulatorSteps.renderStep2();
                }
                break;
            case 3:
                if (typeof SimulatorSteps !== 'undefined') {
                    SimulatorSteps.renderStep3();
                }
                break;
            case 4:
                if (typeof SimulatorSteps !== 'undefined') {
                    SimulatorSteps.renderStep4();
                }
                break;
            case 5:
                if (typeof SimulatorSteps !== 'undefined') {
                    SimulatorSteps.renderStep5();
                }
                break;
        }
    },

    // === VALIDACIÓN ===
    validateCurrentStep: function() {
        switch (this.state.currentStep) {
            case 1:
                const name = document.getElementById('projectName')?.value.trim();
                if (!name) {
                    this.showNotification('Por favor, ingresa un nombre para el proyecto', 'error');
                    return false;
                }
                break;
                
            case 2:
                const hasResources = Object.values(this.state.projectData.departments)
                    .some(hours => hours > 0);
                if (!hasResources) {
                    this.showNotification('Por favor, asigna horas a al menos un departamento', 'error');
                    return false;
                }
                break;
        }
        
        return true;
    },

    saveCurrentStepData: function() {
        switch (this.state.currentStep) {
            case 1:
                const nameInput = document.getElementById('projectName');
                const durationInput = document.getElementById('projectDuration');
                const startDateInput = document.getElementById('projectStartDate');
                const budgetInput = document.getElementById('projectBudget');
                const priorityInput = document.getElementById('projectPriority');
                
                if (nameInput) this.state.projectData.name = nameInput.value;
                if (durationInput) this.state.projectData.duration = parseInt(durationInput.value) || 6;
                if (startDateInput) this.state.projectData.startDate = startDateInput.value;
                if (budgetInput) this.state.projectData.budget = parseInt(budgetInput.value) || 0;
                if (priorityInput) this.state.projectData.priority = priorityInput.value;
                break;
        }
    },

    // === UI UPDATES ===
    updateProgress: function() {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = (this.state.currentStep / this.state.totalSteps) * 100;
        
        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.state.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.state.currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Update step number indicator
        const stepNumberEl = document.getElementById('currentStepNumber');
        if (stepNumberEl) {
            stepNumberEl.textContent = this.state.currentStep;
        }
    },

    updateNavigation: function() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.state.currentStep === 1;
        }
        
        if (nextBtn) {
            if (this.state.currentStep === this.state.totalSteps) {
                nextBtn.textContent = 'Finalizar';
                nextBtn.onclick = () => this.finishSimulation();
            } else {
                nextBtn.textContent = 'Siguiente →';
                nextBtn.onclick = () => this.nextStep();
            }
        }
    },

    updateBreadcrumbs: function() {
        const currentStep = document.getElementById('currentStep');
        const stepNames = [
            '', 'Configuración de Proyecto', 'Requisitos de Recursos', 
            'Análisis de Impacto', 'Efecto Dominó', 'Recomendaciones'
        ];
        
        if (currentStep) {
            currentStep.textContent = stepNames[this.state.currentStep] || 'Simulador';
        }
    },

    // === EVENT HANDLING ===
    bindEvents: function() {
        // Scenarios button
        const scenariosBtn = document.getElementById('scenariosBtn');
        if (scenariosBtn) {
            scenariosBtn.addEventListener('click', () => this.openScenariosModal());
        }
        
        // Auto-save every 30 seconds
        setInterval(() => {
            this.autoSave();
        }, 30000);
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    },

    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key.toLowerCase()) {
                    case 'arrowright':
                        e.preventDefault();
                        this.nextStep();
                        break;
                    case 'arrowleft':
                        e.preventDefault();
                        this.previousStep();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveScenario();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetSimulation();
                        break;
                }
            }
        });
    },

    // === SCENARIO MANAGEMENT ===
    saveScenario: function() {
        const scenario = {
            id: Date.now(),
            name: this.state.projectData.name || `Escenario ${Date.now()}`,
            date: new Date().toISOString(),
            projectData: { ...this.state.projectData },
            analysisResults: this.state.analysisResults,
            dominoEffects: this.state.dominoEffects,
            recommendations: this.state.recommendations
        };
        
        this.state.savedScenarios.push(scenario);
        this.saveScenariosToStorage();
        
        this.showNotification(`Escenario "${scenario.name}" guardado`, 'success');
    },

    saveScenariosToStorage: function() {
        try {
            localStorage.setItem('netberry_scenarios', JSON.stringify(this.state.savedScenarios));
        } catch (e) {
            console.warn('No se pudieron guardar los escenarios:', e);
        }
    },

    loadSavedScenarios: function() {
        try {
            const saved = localStorage.getItem('netberry_scenarios');
            if (saved) {
                this.state.savedScenarios = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('No se pudieron cargar los escenarios guardados:', e);
        }
    },

    autoSave: function() {
        if (this.state.currentStep > 1 && this.state.projectData.name) {
            const autoSaveData = {
                currentStep: this.state.currentStep,
                projectData: this.state.projectData,
                timestamp: Date.now()
            };
            
            try {
                localStorage.setItem('netberry_simulator_autosave', JSON.stringify(autoSaveData));
            } catch (e) {
                console.warn('Auto-save failed:', e);
            }
        }
    },

    loadAutoSave: function() {
        try {
            const autoSave = localStorage.getItem('netberry_simulator_autosave');
            if (autoSave) {
                const data = JSON.parse(autoSave);
                const hoursSinceLastSave = (Date.now() - data.timestamp) / (1000 * 60 * 60);
                
                // Only restore if less than 24 hours old
                if (hoursSinceLastSave < 24) {
                    if (confirm('Se encontró una simulación en progreso. ¿Quieres continuarla?')) {
                        this.state.currentStep = data.currentStep;
                        this.state.projectData = data.projectData;
                        
                        this.updateProgress();
                        this.renderCurrentStep();
                        this.updateNavigation();
                        
                        this.showNotification('Simulación restaurada', 'success');
                        return true;
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load auto-save:', e);
        }
        return false;
    },

    // === ACTIONS ===
    finishSimulation: function() {
        this.showNotification('Simulación completada exitosamente', 'success');
        
        // Save scenario automatically
        this.saveScenario();
        
        // Option to return to home or start new simulation
        setTimeout(() => {
            if (confirm('¿Quieres iniciar una nueva simulación?')) {
                this.resetSimulation();
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    },

    resetSimulation: function() {
        if (confirm('¿Estás seguro de que quieres reiniciar la simulación?')) {
            this.state.currentStep = 1;
            this.state.projectData = {
                name: '',
                duration: 6,
                startDate: '',
                budget: 0,
                priority: 'medium',
                type: 'custom',
                departments: {}
            };
            this.state.analysisResults = null;
            this.state.dominoEffects = null;
            this.state.recommendations = null;
            
            this.updateProgress();
            this.renderCurrentStep();
            this.updateNavigation();
            
            // Reset form fields
            const nameInput = document.getElementById('projectName');
            const durationInput = document.getElementById('projectDuration');
            const budgetInput = document.getElementById('projectBudget');
            
            if (nameInput) nameInput.value = '';
            if (durationInput) durationInput.value = '6';
            if (budgetInput) budgetInput.value = '';
            
            this.showNotification('Simulación reiniciada', 'success');
        }
    },

    openScenariosModal: function() {
        this.showNotification('Comparación de escenarios en desarrollo', 'info');
    },


    // === UTILITIES ===
    showNotification: function(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    // === INICIALIZACIÓN CON AUTO-RESTORE ===
    initWithAutoRestore: function() {
        // Intentar cargar auto-save primero
        const restored = this.loadAutoSave();
        
        if (!restored) {
            // Inicialización normal
            this.init();
        }
    }
};

// Exponer para uso global
window.SimulatorCore = SimulatorCore;