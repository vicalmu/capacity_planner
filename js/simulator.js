// simulator.js - Simulador escalable para N departamentos

const NetberrySimulator = {
    currentStep: 1,
    selectedDepartments: [],
    projectRequirements: {},

    // Inicializar simulador
    init: function() {
        this.renderSimulator();
        this.bindEvents();
    },

    // Renderizar interfaz del simulador (escalable)
    renderSimulator: function() {
        const container = document.getElementById('simulatorContent');
        if (!container) return;

        container.innerHTML = `
            <div class="simulator-step" id="step1">
                <div class="step-header">
                    <span class="step-number">1</span>
                    <span class="step-title">Información del Proyecto</span>
                </div>
                <div class="input-group">
                    <input type="text" class="input-field" placeholder="Nombre del proyecto" id="projectName">
                    <select class="input-field" id="projectDuration">
                        <option value="3">3 meses</option>
                        <option value="6">6 meses</option>
                        <option value="9">9 meses</option>
                        <option value="12">12 meses</option>
                    </select>
                </div>
                <button class="step-btn" onclick="NetberrySimulator.nextStep()">
                    Siguiente: Seleccionar Departamentos →
                </button>
            </div>

            <div class="simulator-step hidden" id="step2">
                <div class="step-header">
                    <span class="step-number">2</span>
                    <span class="step-title">Departamentos Involucrados</span>
                </div>
                <div class="departments-selector" id="departmentsSelector">
                    ${this.renderDepartmentSelector()}
                </div>
                <div class="step-navigation">
                    <button class="step-btn secondary" onclick="NetberrySimulator.previousStep()">
                        ← Anterior
                    </button>
                    <button class="step-btn" onclick="NetberrySimulator.nextStep()">
                        Siguiente: Asignar Horas →
                    </button>
                </div>
            </div>

            <div class="simulator-step hidden" id="step3">
                <div class="step-header">
                    <span class="step-number">3</span>
                    <span class="step-title">Asignación de Horas</span>
                </div>
                <div class="hours-inputs" id="hoursInputs">
                    <!-- Se genera dinámicamente según departamentos seleccionados -->
                </div>
                <div class="step-navigation">
                    <button class="step-btn secondary" onclick="NetberrySimulator.previousStep()">
                        ← Anterior
                    </button>
                    <button class="step-btn simulate" onclick="NetberrySimulator.simulate()">
                        🔮 Simular Impacto
                    </button>
                </div>
            </div>

            <div class="simulation-result" id="simulationResult">
                <strong>💡 Simulador Avanzado Escalable</strong><br>
                <span style="opacity: 0.9;">Sigue los pasos para analizar la viabilidad de tu proyecto</span>
            </div>

            <div class="simulator-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="simulatorProgress" style="width: 33%"></div>
                </div>
                <div class="progress-steps">
                    <span class="progress-step active">Proyecto</span>
                    <span class="progress-step">Departamentos</span>
                    <span class="progress-step">Horas</span>
                </div>
            </div>
        `;

        this.addSimulatorStyles();
    },

    // Renderizar selector de departamentos
    renderDepartmentSelector: function() {
        const departments = Object.entries(NetberryData.departments);
        
        return departments.map(([key, dept]) => `
            <div class="dept-selector-card" data-dept="${key}">
                <div class="dept-selector-header">
                    <input type="checkbox" id="dept_${key}" class="dept-checkbox">
                    <label for="dept_${key}" class="dept-label">
                        <span class="dept-name">${dept.name}</span>
                        <span class="dept-meta">${dept.people.length} personas</span>
                    </label>
                </div>
                <div class="dept-current-load">
                    <div class="load-bar">
                        <div class="load-fill" style="width: ${dept.utilization}%; background: ${this.getUtilizationColor(dept.utilization)};"></div>
                    </div>
                    <span class="load-text">${formatNumber.percentage(dept.utilization)}</span>
                </div>
            </div>
        `).join('');
    },

    // Renderizar inputs de horas para departamentos seleccionados
    renderHoursInputs: function() {
        const container = document.getElementById('hoursInputs');
        if (!container || this.selectedDepartments.length === 0) return;

        const inputs = this.selectedDepartments.map(deptKey => {
            const dept = NetberryData.departments[deptKey];
            const availableHours = Math.round(dept.capacity * (1 - dept.utilization / 100));
            
            return `
                <div class="hours-input-group">
                    <div class="input-header">
                        <span class="dept-name">${dept.name}</span>
                        <span class="available-hours">${formatNumber.hours(availableHours)} disponibles</span>
                    </div>
                    <div class="input-with-slider">
                        <input type="number" 
                               class="hours-input" 
                               id="hours_${deptKey}" 
                               placeholder="Horas requeridas"
                               min="0" 
                               max="${availableHours * 1.5}"
                               value="0">
                        <input type="range" 
                               class="hours-slider" 
                               id="slider_${deptKey}"
                               min="0" 
                               max="${availableHours * 1.5}" 
                               value="0">
                    </div>
                    <div class="impact-preview" id="impact_${deptKey}">
                        <span class="impact-text">Sin impacto</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = inputs;
        this.bindHoursInputs();
    },

    // Navegar entre pasos
    nextStep: function() {
        if (this.currentStep === 1) {
            // Validar paso 1
            const projectName = document.getElementById('projectName').value;
            if (!projectName.trim()) {
                this.showNotification('Por favor, introduce el nombre del proyecto', 'warning');
                return;
            }
        } else if (this.currentStep === 2) {
            // Validar paso 2
            this.updateSelectedDepartments();
            if (this.selectedDepartments.length === 0) {
                this.showNotification('Selecciona al menos un departamento', 'warning');
                return;
            }
            this.renderHoursInputs();
        }

        if (this.currentStep < 3) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    },

    previousStep: function() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    },

    // Gestión de pasos
    showStep: function(step) {
        const stepElement = document.getElementById(`step${step}`);
        if (stepElement) {
            stepElement.classList.remove('hidden');
            stepElement.classList.add('active');
        }
    },

    hideStep: function(step) {
        const stepElement = document.getElementById(`step${step}`);
        if (stepElement) {
            stepElement.classList.add('hidden');
            stepElement.classList.remove('active');
        }
    },

    updateProgress: function() {
        const progressFill = document.getElementById('simulatorProgress');
        const progressSteps = document.querySelectorAll('.progress-step');
        
        if (progressFill) {
            progressFill.style.width = `${(this.currentStep / 3) * 100}%`;
        }

        progressSteps.forEach((step, index) => {
            if (index < this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    },

    // Actualizar departamentos seleccionados
    updateSelectedDepartments: function() {
        const checkboxes = document.querySelectorAll('.dept-checkbox:checked');
        this.selectedDepartments = Array.from(checkboxes).map(cb => cb.id.replace('dept_', ''));
    },

    // Vincular eventos de inputs de horas
    bindHoursInputs: function() {
        this.selectedDepartments.forEach(deptKey => {
            const input = document.getElementById(`hours_${deptKey}`);
            const slider = document.getElementById(`slider_${deptKey}`);
            const impactPreview = document.getElementById(`impact_${deptKey}`);

            if (input && slider) {
                // Sincronizar input y slider
                input.addEventListener('input', (e) => {
                    slider.value = e.target.value;
                    this.updateImpactPreview(deptKey, e.target.value);
                });

                slider.addEventListener('input', (e) => {
                    input.value = e.target.value;
                    this.updateImpactPreview(deptKey, e.target.value);
                });
            }
        });
    },

    // Actualizar vista previa de impacto
    updateImpactPreview: function(deptKey, hours) {
        const dept = NetberryData.departments[deptKey];
        const impactElement = document.getElementById(`impact_${deptKey}`);
        
        if (!dept || !impactElement || !hours || hours <= 0) {
            impactElement.innerHTML = '<span class="impact-text">Sin impacto</span>';
            return;
        }

        const duration = parseInt(document.getElementById('projectDuration').value) || 3;
        const monthlyCapacity = dept.capacity / 3;
        const monthlyHours = parseFloat(hours) / duration;
        const newUtilization = dept.utilization + (monthlyHours / monthlyCapacity * 100);

        let status, color, message;
        if (newUtilization > 100) {
            status = 'impossible';
            color = '#ef4444';
            message = `Imposible (${formatNumber.percentage(newUtilization)})`;
        } else if (newUtilization > 95) {
            status = 'critical';
            color = '#ef4444';
            message = `Crítico (${formatNumber.percentage(newUtilization)})`;
        } else if (newUtilization > 85) {
            status = 'warning';
            color = '#f59e0b';
            message = `Límite (${formatNumber.percentage(newUtilization)})`;
        } else {
            status = 'good';
            color = '#10b981';
            message = `Viable (${formatNumber.percentage(newUtilization)})`;
        }

        impactElement.innerHTML = `
            <span class="impact-text" style="color: ${color};">
                ${message}
            </span>
        `;
    },

    // Ejecutar simulación
    simulate: function() {
        // Recopilar datos
        const projectName = document.getElementById('projectName').value;
        const duration = parseInt(document.getElementById('projectDuration').value);
        
        const requirements = { duration };
        this.selectedDepartments.forEach(deptKey => {
            const hoursInput = document.getElementById(`hours_${deptKey}`);
            if (hoursInput) {
                requirements[deptKey] = parseFloat(hoursInput.value) || 0;
            }
        });

        // Calcular impacto
        const analysis = NetberryData.calculations.simulateProjectImpact(requirements);
        
        // Mostrar resultados
        this.displayResults(projectName, analysis);
    },

    // Mostrar resultados de simulación
    displayResults: function(projectName, analysis) {
        const resultContainer = document.getElementById('simulationResult');
        
        let bgColor, icon, title;
        switch (analysis.viability) {
            case 'not_viable':
                bgColor = 'rgba(254, 226, 226, 0.8)';
                icon = '🔴';
                title = 'PROYECTO NO VIABLE';
                break;
            case 'risky':
                bgColor = 'rgba(254, 243, 199, 0.8)';
                icon = '⚠️';
                title = 'VIABLE CON RIESGOS';
                break;
            default:
                bgColor = 'rgba(220, 252, 231, 0.8)';
                icon = '✅';
                title = 'TOTALMENTE VIABLE';
        }

        resultContainer.innerHTML = `
            <div class="result-header">
                <span class="result-icon">${icon}</span>
                <div>
                    <div class="result-title">${title}</div>
                    <div class="result-project">${projectName}</div>
                </div>
            </div>
            
            <div class="result-impacts">
                <strong>Impacto por Departamento:</strong>
                ${analysis.impacts.map(impact => `
                    <div class="impact-item ${impact.status}">
                        <span class="dept-name">${impact.department}</span>
                        <span class="utilization-change">
                            ${formatNumber.percentage(impact.currentUtilization)} → 
                            ${formatNumber.percentage(impact.newUtilization)}
                        </span>
                        <span class="hours-required">${formatNumber.hours(impact.hoursRequired)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="result-recommendations">
                <strong>Recomendaciones:</strong>
                <ul>
                    ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;

        resultContainer.style.background = bgColor;
        resultContainer.style.padding = '25px';
        resultContainer.style.borderRadius = '16px';
        resultContainer.style.marginTop = '20px';
    },

    // Utilidades
    getUtilizationColor: function(util) {
        if (util >= 95) return '#ef4444';
        if (util >= 85) return '#f59e0b';
        return '#10b981';
    },

    showNotification: function(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `simulator-notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('simulatorContent');
        if (container) {
            container.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    },

    bindEvents: function() {
        // Event listeners para checkboxes de departamentos
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('dept-checkbox')) {
                const card = e.target.closest('.dept-selector-card');
                if (e.target.checked) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            }
        });
    },

    addSimulatorStyles: function() {
        if (document.getElementById('simulator-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'simulator-styles';
        styles.textContent = `
            .simulator-step {
                transition: all 0.3s ease;
                opacity: 1;
                transform: translateX(0);
            }
            
            .simulator-step.hidden {
                display: none;
            }
            
            .step-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
            }
            
            .step-number {
                background: rgba(255,255,255,0.3);
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 14px;
            }
            
            .step-title {
                font-size: 18px;
                font-weight: 600;
            }
            
            .step-btn {
                background: rgba(255,255,255,0.25);
                color: white;
                border: 2px solid rgba(255,255,255,0.4);
                padding: 12px 24px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin: 5px;
            }
            
            .step-btn:hover {
                background: rgba(255,255,255,0.35);
                transform: translateY(-2px);
            }
            
            .step-btn.secondary {
                background: rgba(255,255,255,0.1);
                border-color: rgba(255,255,255,0.2);
            }
            
            .step-btn.simulate {
                background: rgba(16, 185, 129, 0.8);
                border-color: rgba(16, 185, 129, 1);
            }
            
            .step-navigation {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
            }
            
            .departments-selector {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                margin-bottom: 20px;
            }
            
            .dept-selector-card {
                background: rgba(255,255,255,0.1);
                border: 2px solid rgba(255,255,255,0.2);
                border-radius: 12px;
                padding: 15px;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .dept-selector-card:hover {
                border-color: rgba(255,255,255,0.4);
                transform: translateY(-2px);
            }
            
            .dept-selector-card.selected {
                border-color: rgba(16, 185, 129, 0.8);
                background: rgba(16, 185, 129, 0.1);
            }
            
            .dept-selector-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .dept-checkbox {
                accent-color: #10b981;
            }
            
            .dept-label {
                display: flex;
                flex-direction: column;
                cursor: pointer;
            }
            
            .dept-name {
                font-weight: 600;
                font-size: 14px;
            }
            
            .dept-meta {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .dept-current-load {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .load-bar {
                flex: 1;
                height: 6px;
                background: rgba(255,255,255,0.2);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .load-fill {
                height: 100%;
                border-radius: 3px;
                transition: width 0.3s ease;
            }
            
            .load-text {
                font-size: 12px;
                font-weight: 600;
            }
            
            .hours-inputs {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .hours-input-group {
                background: rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 15px;
            }
            
            .input-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .available-hours {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .input-with-slider {
                display: flex;
                gap: 10px;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .hours-input {
                flex: 1;
                min-width: 0;
            }
            
            .hours-slider {
                flex: 2;
                accent-color: #10b981;
            }
            
            .impact-preview {
                text-align: center;
                font-size: 13px;
                font-weight: 600;
            }
            
            .simulator-progress {
                margin-top: 25px;
            }
            
            .progress-bar {
                height: 4px;
                background: rgba(255,255,255,0.2);
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: rgba(255,255,255,0.8);
                border-radius: 2px;
                transition: width 0.4s ease;
            }
            
            .progress-steps {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
            }
            
            .progress-step {
                opacity: 0.6;
                transition: opacity 0.3s ease;
            }
            
            .progress-step.active {
                opacity: 1;
                font-weight: 600;
            }
            
            .result-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .result-icon {
                font-size: 32px;
            }
            
            .result-title {
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
            }
            
            .result-project {
                font-size: 14px;
                color: #6b7280;
            }
            
            .result-impacts {
                margin-bottom: 20px;
            }
            
            .impact-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                margin: 5px 0;
                border-radius: 8px;
                background: rgba(255,255,255,0.5);
                font-size: 13px;
            }
            
            .impact-item.impossible {
                border-left: 4px solid #ef4444;
            }
            
            .impact-item.critical {
                border-left: 4px solid #ef4444;
            }
            
            .impact-item.warning {
                border-left: 4px solid #f59e0b;
            }
            
            .impact-item.good {
                border-left: 4px solid #10b981;
            }
            
            .result-recommendations ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            
            .result-recommendations li {
                margin: 5px 0;
                font-size: 14px;
            }
            
            .simulator-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 1001;
                animation: slideInRight 0.3s ease;
            }
            
            .simulator-notification.warning {
                background: #f59e0b;
            }
            
            .simulator-notification.info {
                background: #3b82f6;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(styles);
    },

    // Reset simulador
    reset: function() {
        this.currentStep = 1;
        this.selectedDepartments = [];
        this.projectRequirements = {};
        this.renderSimulator();
    }
};

// Exportar para uso global
window.NetberrySimulator = NetberrySimulator;