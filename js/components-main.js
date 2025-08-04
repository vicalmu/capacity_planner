// js/components-main.js - Coordinador Principal de Componentes

const NetberryComponents = {
    
    // Componente de KPIs (mantenido en este archivo por simplicidad)
    kpis: {
        render: function() {
            const container = document.getElementById('kpiGrid');
            if (!container) return;

            const departments = NetberryData.calculations.getFilteredDepartments(NetberryUtils.activeFilters);
            const totalCapacity = NetberryData.calculations.getTotalCapacity(departments);
            const avgUtilization = NetberryData.calculations.getAverageUtilization(departments);
            const availableCapacity = NetberryData.calculations.getAvailableCapacity(departments);
            const criticalDepts = NetberryData.calculations.getCriticalDepartments(85);

            // Calcular proyectos activos para departamentos filtrados
            let activeProjects = new Set();
            if (NetberryUtils.activeFilters.includes('all')) {
                activeProjects = new Set(NetberryData.projects.map(p => p.name));
            } else {
                NetberryData.projects.forEach(project => {
                    if (project.departments.some(dept => NetberryUtils.activeFilters.includes(dept))) {
                        activeProjects.add(project.name);
                    }
                });
            }

            // Ajustar período según vista actual
            const periodLabel = NetberryData.config.timelineView === 'annual' ? 'Anual 2025' : 'Q3 2025';

            container.innerHTML = `
                <div class="kpi-card capacity">
                    <div class="kpi-value" style="color: #10b981;">${formatNumber.hours(availableCapacity)}</div>
                    <div class="kpi-label">Capacidad Disponible (${periodLabel})</div>
                    <div class="kpi-trend ${this.getCapacityTrend(availableCapacity)}">
                        ${this.getCapacityMessage(availableCapacity)}
                    </div>
                </div>
                
                <div class="kpi-card utilization">
                    <div class="kpi-value" style="color: ${NetberryUtils.getUtilizationColor(avgUtilization)};">
                        ${formatNumber.percentage(avgUtilization)}
                    </div>
                    <div class="kpi-label">Utilización ${NetberryUtils.activeFilters.includes('all') ? 'Global' : 'Filtrada'}</div>
                    <div class="kpi-trend ${this.getUtilizationTrend(avgUtilization)}">
                        ${this.getUtilizationMessage(avgUtilization)}
                    </div>
                </div>
                
                <div class="kpi-card projects">
                    <div class="kpi-value" style="color: #3b82f6;">${activeProjects.size}</div>
                    <div class="kpi-label">Proyectos Activos</div>
                    <div class="kpi-trend trend-good">
                        ↗ ${Math.ceil(activeProjects.size * 0.15)} nuevos este mes
                    </div>
                </div>
                
                <div class="kpi-card alert">
                    <div class="kpi-value" style="color: #ef4444;">${criticalDepts.length}</div>
                    <div class="kpi-label">Departamentos Críticos</div>
                    <div class="kpi-trend ${criticalDepts.length > 0 ? 'trend-critical' : 'trend-good'}">
                        ${this.getAlertMessage(criticalDepts)}
                    </div>
                </div>
            `;

            // Actualizar status indicator
            this.updateStatusIndicator(criticalDepts.length);
        },

        getCapacityTrend: function(capacity) {
            if (capacity > 8000) return 'trend-good';
            if (capacity > 4000) return 'trend-warning';
            return 'trend-critical';
        },

        getCapacityMessage: function(capacity) {
            if (capacity > 8000) return '✓ Ventana para múltiples proyectos grandes';
            if (capacity > 4000) return '⚠️ Capacidad limitada - Priorizar proyectos';
            return '🔴 Capacidad crítica - Rechazar nuevos proyectos';
        },

        getUtilizationTrend: function(util) {
            if (util >= 95) return 'trend-critical';
            if (util >= 85) return 'trend-warning';
            return 'trend-good';
        },

        getUtilizationMessage: function(util) {
            if (util >= 95) return '🔴 Capacidad crítica - Acción inmediata';
            if (util >= 85) return '⚠️ Aproximándose al límite óptimo (85%)';
            return '✓ Capacidad saludable';
        },

        getAlertMessage: function(criticalDepts) {
            if (criticalDepts.length === 0) return '✅ Sin alertas críticas';
            const names = criticalDepts.slice(0, 3).map(d => `${d.name} (${formatNumber.percentage(d.utilization)})`);
            return `🔴 ${names.join(', ')}`;
        },

        updateStatusIndicator: function(criticalCount) {
            const statusIndicator = document.getElementById('statusIndicator');
            if (!statusIndicator) return;

            if (criticalCount >= 3) {
                statusIndicator.textContent = '🔴 Acción Urgente';
                statusIndicator.style.background = 'rgba(239, 68, 68, 0.2)';
            } else if (criticalCount > 0) {
                statusIndicator.textContent = '⚠️ Atención Requerida';
                statusIndicator.style.background = 'rgba(245, 158, 11, 0.2)';
            } else {
                statusIndicator.textContent = '✅ Estado Óptimo';
                statusIndicator.style.background = 'rgba(16, 185, 129, 0.2)';
            }
        },

        update: function() {
            this.render();
        }
    },

    // Delegar al componente Gantt externo
    gantt: {
        render: function() {
            if (typeof GanttChart !== 'undefined') {
                GanttChart.render();
            } else {
                console.warn('GanttChart no está disponible');
            }
        },
        update: function() {
            if (typeof GanttChart !== 'undefined') {
                GanttChart.update();
            }
        }
    },

    // Componente de filtros (simplificado)
    filters: {
        render: function() {
            const container = document.getElementById('filterButtons');
            if (!container) return;

            const departments = Object.entries(NetberryData.departments);
            
            container.innerHTML = `
                <button class="filter-btn all ${NetberryUtils.activeFilters.includes('all') ? 'active' : ''}" 
                        data-dept="all">
                    Todos los Departamentos
                </button>
                ${departments.map(([key, dept]) => `
                    <button class="filter-btn ${NetberryUtils.activeFilters.includes(key) ? 'active' : ''}" 
                            data-dept="${key}">
                        ${dept.name} (${dept.people.length})
                    </button>
                `).join('')}
                <button class="filter-btn clear-filters" onclick="NetberryComponents.filters.clearAll()">
                    ✖ Limpiar
                </button>
            `;

            this.bindEvents();
        },

        bindEvents: function() {
            document.querySelectorAll('.filter-btn:not(.clear-filters)').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleFilterClick(btn);
                });
            });
        },

        handleFilterClick: function(btn) {
            const dept = btn.getAttribute('data-dept');
            
            if (dept === 'all') {
                NetberryUtils.activeFilters = ['all'];
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                if (NetberryUtils.activeFilters.includes('all')) {
                    NetberryUtils.activeFilters = [];
                    document.querySelector('.filter-btn[data-dept="all"]').classList.remove('active');
                }
                
                if (NetberryUtils.activeFilters.includes(dept)) {
                    NetberryUtils.activeFilters = NetberryUtils.activeFilters.filter(d => d !== dept);
                    btn.classList.remove('active');
                } else {
                    NetberryUtils.activeFilters.push(dept);
                    btn.classList.add('active');
                }
                
                if (NetberryUtils.activeFilters.length === 0) {
                    NetberryUtils.activeFilters = ['all'];
                    document.querySelector('.filter-btn[data-dept="all"]').classList.add('active');
                }
            }
            
            this.applyFilters();
        },

        applyFilters: function() {
            NetberryComponents.kpis.update();
            NetberryComponents.departments.filter();
            NetberryComponents.projects.filter();
            NetberryComponents.timeline.update();
            NetberryComponents.gantt.update();
        },

        clearAll: function() {
            NetberryUtils.activeFilters = ['all'];
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-dept="all"]').classList.add('active');
            this.applyFilters();
        }
    },

    // Componente de departamentos (simplificado)
    departments: {
        render: function() {
            const container = document.getElementById('departmentGrid');
            if (!container) return;

            const departments = Object.entries(NetberryData.departments);
            
            container.innerHTML = departments.map(([key, dept]) => `
                <div class="dept-card ${NetberryUtils.getUtilizationClass(dept.utilization)}" 
                     data-dept="${key}"
                     onclick="NetberryModal.show('${key}')">
                    <div class="dept-name">${dept.name}</div>
                    <div class="utilization-ring ${NetberryUtils.getUtilizationRingClass(dept.utilization)}">
                        ${formatNumber.percentage(dept.utilization, 0)}
                    </div>
                    <div class="dept-info">
                        ${dept.people.length} personas • ${NetberryUtils.getUtilizationStatus(dept.utilization)}
                    </div>
                </div>
            `).join('');

            this.filter();
        },

        filter: function() {
            const deptCards = document.querySelectorAll('.dept-card[data-dept]');
            
            deptCards.forEach(card => {
                const dept = card.getAttribute('data-dept');
                if (NetberryUtils.activeFilters.includes('all') || NetberryUtils.activeFilters.includes(dept)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }
    },

timeline: {
    render: function() {
        const container = document.getElementById('capacityTimeline');
        if (!container) return;

        // Obtener departamentos filtrados
        const filteredDepartments = NetberryData.calculations.getFilteredDepartments(NetberryUtils.activeFilters);
        
        // Generar datos según vista actual
        const timelineData = NetberryData.config.timelineView === 'annual' 
            ? this.generateAnnualData(filteredDepartments)
            : this.generateQuarterlyData(filteredDepartments);

        container.innerHTML = timelineData.map(period => `
            <div class="timeline-row">
                <div class="timeline-label">${period.label}</div>
                <div class="timeline-bar">
                    <div class="bar-segment committed" 
                         style="width: ${period.committed}%;"
                         title="Comprometido: ${period.committed}%">
                        ${period.committed}%
                    </div>
                    <div class="bar-segment buffer" 
                         style="width: ${period.buffer}%;"
                         title="Buffer: ${period.buffer}%">
                        Buffer
                    </div>
                    <div class="bar-segment available" 
                         style="width: ${period.available}%;"
                         title="Disponible: ${period.available}%">
                        ${period.available}%
                    </div>
                </div>
                <div class="timeline-total">${formatNumber.hours(period.total)}</div>
            </div>
        `).join('');

        // Configurar eventos del toggle
        this.bindToggleEvents();
    },

    generateAnnualData: function(filteredDepartments) {
        const totalCapacity = NetberryData.calculations.getTotalCapacity(filteredDepartments);
        
        const years = [
            { label: '2025', committed: 78, buffer: 15, available: 7 },
            { label: '2026', committed: 65, buffer: 15, available: 20 },
            { label: '2027', committed: 58, buffer: 15, available: 27 },
            { label: '2028', committed: 52, buffer: 15, available: 33 }
        ];

        return years.map(year => ({
            ...year,
            total: totalCapacity
        }));
    },

    generateQuarterlyData: function(filteredDepartments) {
        const totalCapacity = NetberryData.calculations.getTotalCapacity(filteredDepartments) / 4;
        const selectedYear = NetberryData.config.selectedYear || 2025;
        
        const quarters = [
            { label: `Q1 ${selectedYear}`, committed: 72, buffer: 15, available: 13 },
            { label: `Q2 ${selectedYear}`, committed: 75, buffer: 15, available: 10 },
            { label: `Q3 ${selectedYear}`, committed: 68, buffer: 15, available: 17 },
            { label: `Q4 ${selectedYear}`, committed: 70, buffer: 15, available: 15 }
        ];

        return quarters.map(quarter => ({
            ...quarter,
            total: totalCapacity
        }));
    },

    bindToggleEvents: function() {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.getAttribute('data-view');
                this.switchView(view);
            });
        });
    },

    switchView: function(view) {
        NetberryData.config.timelineView = view;
        
        // Actualizar botones activos
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Re-renderizar timeline
        this.render();
        
        // Actualizar KPIs para reflejar el nuevo período
        NetberryComponents.kpis.update();
    },

    update: function() {
        this.render();
    }
},

    projects: {
        render: function() {
            const container = document.getElementById('projectsList');
            if (!container) return;

            container.innerHTML = NetberryData.projects.slice(0, 4).map(project => `
                <div class="project-item" data-depts="${project.departments.join(',')}">
                    <div>
                        <div class="project-name">${project.name}</div>
                        <div class="project-end">
                            Finaliza: ${project.endDate} • 
                            ${project.departments.map(d => NetberryData.departments[d].name).join(', ')} • 
                            ${formatNumber.hours(project.hours)}
                        </div>
                    </div>
                    <div class="project-progress">
                        <div class="progress-fill" style="
                            background: ${NetberryUtils.getProgressColor(project.progress)};
                            width: ${project.progress}%;
                        "></div>
                    </div>
                </div>
            `).join('');

            this.filter();
        },

        filter: function() {
            const projectItems = document.querySelectorAll('.project-item[data-depts]');
            
            projectItems.forEach(item => {
                const projectDepts = item.getAttribute('data-depts').split(',');
                const hasMatchingDept = NetberryUtils.activeFilters.includes('all') || 
                    projectDepts.some(dept => NetberryUtils.activeFilters.includes(dept));
                
                if (hasMatchingDept) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        }
    },

    // SIMULADOR CON EFECTO DOMINÓ (Delegado a módulos externos)
    simulator: {
        currentStep: 1,
        maxSteps: 4,
        projectData: {},
        impactAnalysis: null,

        openModal: function() {
            const modal = document.getElementById('simulatorModal');
            if (modal) {
                modal.style.display = 'block';
                this.renderWizard();
            }
        },

        closeModal: function() {
            const modal = document.getElementById('simulatorModal');
            if (modal) {
                modal.style.display = 'none';
                this.resetWizard();
            }
        },

        resetWizard: function() {
            this.currentStep = 1;
            this.projectData = {};
            this.impactAnalysis = null;
        },

        renderWizard: function() {
            const container = document.getElementById('simulatorModalContent');
            if (!container) return;

            container.innerHTML = `
                <div class="simulator-wizard">
                    ${this.renderSteps()}
                    ${this.renderStepContent()}
                    ${this.renderActions()}
                </div>
            `;

            this.bindEvents();
        },

        renderSteps: function() {
            return `
                <div class="wizard-steps">
                    <div class="wizard-step ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}">
                        <div class="step-number">1</div>
                        <span>Información</span>
                    </div>
                    <div class="wizard-step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
                        <div class="step-number">2</div>
                        <span>Recursos</span>
                    </div>
                    <div class="wizard-step ${this.currentStep >= 3 ? 'active' : ''} ${this.currentStep > 3 ? 'completed' : ''}">
                        <div class="step-number">3</div>
                        <span>Impacto</span>
                    </div>
                    <div class="wizard-step ${this.currentStep >= 4 ? 'active' : ''}">
                        <div class="step-number">🎯</div>
                        <span>Efecto Dominó</span>
                    </div>
                </div>
            `;
        },

        renderStepContent: function() {
            switch (this.currentStep) {
                case 1: return this.renderStep1();
                case 2: return this.renderStep2();
                case 3: return this.renderStep3();
                case 4: 
                    // Delegar al módulo SimulatorDomino
                    if (typeof SimulatorDomino !== 'undefined') {
                        this.impactAnalysis = SimulatorDomino.calculateSimpleImpact(this.projectData);
                        return SimulatorDomino.renderStep4(this.projectData, this.impactAnalysis);
                    } else {
                        return '<div class="error">SimulatorDomino no está disponible</div>';
                    }
                default: return '';
            }
        },

        // Métodos básicos del simulador (pasos 1-3)
        renderStep1: function() {
            return `
                <div class="wizard-content">
                    <div class="form-section">
                        <h3>📋 Información Básica del Proyecto</h3>
                        <div class="form-grid">
                            <div class="form-field">
                                <label>Nombre del Proyecto</label>
                                <input type="text" id="projectName" placeholder="Ej: Nueva plataforma e-commerce" 
                                       value="${this.projectData.name || ''}">
                            </div>
                            <div class="form-field">
                                <label>💰 Valor del Proyecto (€)</label>
                                <input type="number" id="projectValue" min="0" step="1000" 
                                       placeholder="150000" value="${this.projectData.value || ''}">
                            </div>
                            <div class="form-field">
                                <label>Duración Estimada (meses)</label>
                                <input type="number" id="projectDuration" min="1" max="24" 
                                       placeholder="6" value="${this.projectData.duration || ''}">
                            </div>
                            <div class="form-field">
                                <label>Fecha de Inicio Deseada</label>
                                <input type="date" id="projectStartDate" 
                                       value="${this.projectData.startDate || ''}">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderStep2: function() {
            const departments = Object.entries(NetberryData.departments);
            
            return `
                <div class="wizard-content">
                    <div class="form-section">
                        <h3>👥 Recursos por Departamento</h3>
                        <div class="form-grid">
                            ${departments.map(([key, dept]) => `
                                <div class="dept-requirement">
                                    <div class="dept-header">
                                        <div class="dept-name-sim">${dept.name}</div>
                                        <div class="current-util">
                                            Actual: ${formatNumber.percentage(dept.utilization, 0)}
                                        </div>
                                    </div>
                                    <input type="number" 
                                           class="hours-input" 
                                           id="hours-${key}" 
                                           placeholder="Horas necesarias"
                                           min="0" 
                                           max="2000"
                                           value="${this.projectData.departments?.[key] || ''}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        },

        renderStep3: function() {
            const analysis = this.performAnalysis();
            
            return `
                <div class="wizard-content">
                    <div class="results-summary">
                        <div class="viability-status">
                            <div class="status-icon">${this.getStatusIcon(analysis.viability)}</div>
                            <div class="status-text status-${analysis.viability.replace('_', '-')}">
                                ${this.getStatusText(analysis.viability)}
                            </div>
                        </div>
                        ${analysis.viability !== 'viable' ? `
                            <div class="domino-preview" style="margin-top: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border-left: 4px solid #ef4444;">
                                <strong>⚠️ ADVERTENCIA:</strong> Este proyecto podría afectar otros proyectos en curso.
                                <br><small>Haz clic en "Siguiente" para ver el <strong>análisis de impacto temporal</strong> completo.</small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        },

        renderActions: function() {
            return `
                <div class="wizard-actions">
                    <button class="wizard-btn secondary" 
                            onclick="NetberryComponents.simulator.previousStep()"
                            ${this.currentStep === 1 ? 'style="visibility: hidden;"' : ''}>
                        ← Anterior
                    </button>
                    
                    <button class="wizard-btn primary" 
                            onclick="NetberryComponents.simulator.${this.currentStep === 4 ? 'closeModal()' : 'nextStep()'}"
                            id="nextStepBtn">
                        ${this.currentStep === 4 ? '✓ Cerrar' : 'Siguiente →'}
                    </button>
                </div>
            `;
        },

        // Métodos de control
        nextStep: function() {
            this.saveCurrentStepData();
            if (this.currentStep < this.maxSteps) {
                this.currentStep++;
                this.renderWizard();
            }
        },

        previousStep: function() {
            if (this.currentStep > 1) {
                this.currentStep--;
                this.renderWizard();
            }
        },

        saveCurrentStepData: function() {
            if (this.currentStep === 1) {
                this.projectData.name = document.getElementById('projectName')?.value || '';
                this.projectData.value = parseInt(document.getElementById('projectValue')?.value) || 0;
                this.projectData.duration = parseInt(document.getElementById('projectDuration')?.value) || 6;
                this.projectData.startDate = document.getElementById('projectStartDate')?.value || '';
            } else if (this.currentStep === 2) {
                this.projectData.departments = {};
                Object.keys(NetberryData.departments).forEach(deptKey => {
                    const input = document.getElementById(`hours-${deptKey}`);
                    if (input && parseInt(input.value) > 0) {
                        this.projectData.departments[deptKey] = parseInt(input.value);
                    }
                });
            }
        },

        bindEvents: function() {
            // Eventos básicos
        },

        performAnalysis: function() {
            return NetberryData.calculations.simulateProjectImpact(this.projectData.departments || {});
        },

        getStatusIcon: function(viability) {
            const icons = { 'viable': '✅', 'risky': '⚠️', 'not_viable': '❌' };
            return icons[viability] || '❓';
        },

        getStatusText: function(viability) {
            const texts = { 'viable': 'Proyecto Viable', 'risky': 'Proyecto con Riesgos', 'not_viable': 'Proyecto No Viable' };
            return texts[viability] || 'Estado Desconocido';
        }
    },

    // Inicializar todos los componentes
    init: function() {
        this.gantt.render();
        this.kpis.render();
        this.filters.render();
        this.departments.render();
        this.timeline.render();
        this.projects.render();
        
        // Configurar botón simulador del header
        const simulatorBtn = document.getElementById('simulatorHeaderBtn');
        if (simulatorBtn) {
            simulatorBtn.addEventListener('click', () => {
                this.simulator.openModal();
            });
        }
        
        // Animar entrada
        setTimeout(() => {
            NetberryUtils.animateElements('.kpi-card', 100);
            setTimeout(() => {
                NetberryUtils.animateElements('.dept-card', 50);
            }, 500);
        }, 100);
    },

    // Actualizar todos los componentes
    updateAll: function() {
        this.gantt.update();
        this.kpis.update();
        this.departments.filter();
        this.projects.filter();
        this.timeline.update();
    }
};

// Exportar para uso global
window.NetberryComponents = NetberryComponents;

