// components.js - Componentes de interfaz modulares

const NetberryComponents = {
    
    // Componente de KPIs
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

    // Componente de filtros
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
        },

        clearAll: function() {
            NetberryUtils.activeFilters = ['all'];
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.filter-btn[data-dept="all"]').classList.add('active');
            this.applyFilters();
        }
    },

    // Componente de departamentos
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

    // Componente de timeline ACTUALIZADO con vista anual/trimestral
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

            // Actualizar título del gráfico
            this.updateChartTitle();

            container.innerHTML = timelineData.map(period => `
                <div class="timeline-row">
                    <div class="timeline-label">${period.label}</div>
                    <div class="timeline-bar">
                        <div class="bar-segment committed" 
                             style="width: ${period.committed}%;"
                             title="Comprometido: ${period.committed}% (${formatNumber.hours(period.committedHours)})">
                            ${period.committed}%
                        </div>
                        <div class="bar-segment buffer" 
                             style="width: ${period.buffer}%;"
                             title="Buffer: ${period.buffer}% (${formatNumber.hours(period.bufferHours)})">
                            Buffer
                        </div>
                        <div class="bar-segment available" 
                             style="width: ${period.available}%;"
                             title="Disponible: ${period.available}% (${formatNumber.hours(period.availableHours)})">
                            ${period.available}%
                        </div>
                    </div>
                    <div class="timeline-total">
                        ${formatNumber.hours(period.total)}
                        <div class="timeline-subtitle">${period.departments} dept${period.departments !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            `).join('');

            // Configurar eventos del toggle
            this.bindToggleEvents();
        },

        // NUEVO: Generar datos anuales
        generateAnnualData: function(filteredDepartments) {
            const totalCapacity = NetberryData.calculations.getTotalAnnualCapacity(filteredDepartments);
            
            const years = [
                { label: '2025', baseCommitted: 78, trend: 0 },
                { label: '2026', baseCommitted: 65, trend: -13 },
                { label: '2027', baseCommitted: 58, trend: -20 },
                { label: '2028', baseCommitted: 52, trend: -26 }
            ];

            return this.calculatePeriodData(years, filteredDepartments, totalCapacity);
        },

        // NUEVO: Generar datos trimestrales con orden correcto Q1→Q2→Q3→Q4
        generateQuarterlyData: function(filteredDepartments) {
            const totalCapacity = NetberryData.calculations.getTotalQuarterlyCapacity(filteredDepartments);
            const selectedYear = NetberryData.config.selectedYear;
            
            const quarters = [
                { label: `Q1 ${selectedYear}`, baseCommitted: selectedYear === 2025 ? 72 : 58, trend: selectedYear === 2025 ? 4 : -10 },
                { label: `Q2 ${selectedYear}`, baseCommitted: selectedYear === 2025 ? 75 : 45, trend: selectedYear === 2025 ? 7 : -23 },
                { label: `Q3 ${selectedYear}`, baseCommitted: selectedYear === 2025 ? 68 : 52, trend: selectedYear === 2025 ? 0 : -16 },
                { label: `Q4 ${selectedYear}`, baseCommitted: selectedYear === 2025 ? 70 : 48, trend: selectedYear === 2025 ? 2 : -20 }
            ];

            return this.calculatePeriodData(quarters, filteredDepartments, totalCapacity);
        },

        // NUEVO: Método común para calcular datos de períodos
        calculatePeriodData: function(periods, filteredDepartments, totalCapacity) {
            return periods.map(period => {
                // Calcular utilización promedio de los departamentos filtrados
                const avgUtilization = NetberryData.calculations.getAverageUtilization(filteredDepartments);
                
                // Ajustar porcentajes basados en utilización actual y tendencia del período
                let committed = formatNumber.decimal(avgUtilization + period.trend);
                committed = Math.max(0, Math.min(100, committed)); // Mantener entre 0-100%
                
                const buffer = 15; // Buffer fijo del 15%
                let available = formatNumber.decimal(100 - committed - buffer);
                available = Math.max(0, available); // No puede ser negativo
                
                // Ajustar committed si excede 85% (límite recomendado)
                if (committed + buffer > 85) {
                    committed = Math.max(0, 85 - buffer);
                    available = formatNumber.decimal(100 - committed - buffer);
                }

                // Calcular horas absolutas
                const committedHours = formatNumber.decimal((committed / 100) * totalCapacity);
                const bufferHours = formatNumber.decimal((buffer / 100) * totalCapacity);
                const availableHours = formatNumber.decimal((available / 100) * totalCapacity);

                return {
                    label: period.label,
                    committed: formatNumber.decimal(committed),
                    buffer: formatNumber.decimal(buffer),
                    available: formatNumber.decimal(available),
                    total: totalCapacity,
                    committedHours,
                    bufferHours,
                    availableHours,
                    departments: filteredDepartments.length
                };
            });
        },

        // NUEVO: Configurar eventos del toggle anual/trimestral
        bindToggleEvents: function() {
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = btn.getAttribute('data-view');
                    this.switchView(view);
                });
            });
            
            // Event listener para selector de año
            const yearSelector = document.getElementById('yearSelector');
            if (yearSelector) {
                yearSelector.addEventListener('change', (e) => {
                    NetberryData.config.selectedYear = parseInt(e.target.value);
                    this.render();
                    NetberryComponents.kpis.update();
                });
            }
        },

        // NUEVO: Cambiar entre vista anual y trimestral
        switchView: function(view) {
            NetberryData.config.timelineView = view;
            
            // Actualizar botones activos
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-view="${view}"]`).classList.add('active');
            
            // Mostrar/ocultar selector de año
            const yearSelector = document.getElementById('yearSelector');
            if (yearSelector) {
                if (view === 'quarterly') {
                    yearSelector.style.display = 'inline-block';
                    yearSelector.value = NetberryData.config.selectedYear;
                } else {
                    yearSelector.style.display = 'none';
                }
            }
            
            // Re-renderizar timeline
            this.render();
            
            // Actualizar KPIs para reflejar el nuevo período
            NetberryComponents.kpis.update();
        },

        // NUEVO: Actualizar título del gráfico según vista
        updateChartTitle: function() {
            const titleElement = document.querySelector('.chart-title');
            if (titleElement) {
                const isAnnual = NetberryData.config.timelineView === 'annual';
                titleElement.textContent = `📊 Proyección de Capacidad ${isAnnual ? 'Anual' : 'Trimestral'}`;
            }
        },

        // Método para actualizar el timeline cuando cambian los filtros
        update: function() {
            this.render();
            
            // Animar actualización
            const timelineRows = document.querySelectorAll('.timeline-row');
            timelineRows.forEach((row, index) => {
                row.style.opacity = '0.7';
                row.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'scale(1)';
                }, index * 50);
            });
        }
    },

    // Componente de proyectos
    projects: {
        render: function() {
            const container = document.getElementById('projectsList');
            if (!container) return;

            container.innerHTML = NetberryData.projects.slice(0, 4).map(project => `
                <div class="project-item" data-depts="${project.departments.join(',')}">
                    <div>
                        <div class="project-name">${project.name}</div>
                        <div class="project-end">
                            Finaliza: ${project.end} • 
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

    // SIMULADOR COMPLETO EN MODAL
    simulator: {
        currentStep: 1,
        maxSteps: 3,
        projectData: {},

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
                        <span>Información del Proyecto</span>
                    </div>
                    <div class="wizard-step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
                        <div class="step-number">2</div>
                        <span>Recursos Requeridos</span>
                    </div>
                    <div class="wizard-step ${this.currentStep >= 3 ? 'active' : ''}">
                        <div class="step-number">3</div>
                        <span>Análisis de Impacto</span>
                    </div>
                </div>
            `;
        },

        renderStepContent: function() {
            switch (this.currentStep) {
                case 1:
                    return this.renderStep1();
                case 2:
                    return this.renderStep2();
                case 3:
                    return this.renderStep3();
                default:
                    return '';
            }
        },

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
                                <label>Prioridad</label>
                                <select id="projectPriority">
                                    <option value="low" ${this.projectData.priority === 'low' ? 'selected' : ''}>Baja</option>
                                    <option value="medium" ${this.projectData.priority === 'medium' ? 'selected' : ''}>Media</option>
                                    <option value="high" ${this.projectData.priority === 'high' ? 'selected' : ''}>Alta</option>
                                    <option value="critical" ${this.projectData.priority === 'critical' ? 'selected' : ''}>Crítica</option>
                                </select>
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
                        <div class="form-field" style="margin-top: 20px;">
                            <label>Descripción del Proyecto</label>
                            <textarea id="projectDescription" rows="3" 
                                      placeholder="Describe brevemente el alcance y objetivos del proyecto...">${this.projectData.description || ''}</textarea>
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
                        <p style="color: #6b7280; margin-bottom: 25px;">
                            Especifica las horas necesarias de cada departamento para el proyecto.
                        </p>
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
                                           value="${this.projectData.departments?.[key] || ''}"
                                           oninput="NetberryComponents.simulator.updateUtilPreview('${key}')">
                                    <div class="util-preview" id="preview-${key}">
                                        ${this.projectData.departments?.[key] ? 
                                          this.calculateNewUtilization(key, this.projectData.departments[key]) : 
                                          'Introduce las horas para ver el impacto'}
                                    </div>
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
                            <p style="color: #6b7280;">
                                Proyecto: <strong>${this.projectData.name || 'Sin nombre'}</strong> • 
                                Duración: <strong>${this.projectData.duration || 'N/A'} meses</strong> • 
                                Total: <strong>${formatNumber.hours(analysis.totalHours)}</strong>
                            </p>
                        </div>

                        <div class="impact-grid">
                            ${analysis.impacts.map(impact => `
                                <div class="impact-item ${impact.status}">
                                    <div class="impact-dept">${impact.department}</div>
                                    <div class="impact-util">
                                        ${formatNumber.percentage(impact.currentUtilization)} → 
                                        <strong>${formatNumber.percentage(impact.newUtilization)}</strong>
                                        (${impact.hoursRequired > 0 ? '+' + formatNumber.hours(impact.hoursRequired) : 'Sin cambios'})
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="recommendations">
                            <h4>🎯 Recomendaciones</h4>
                            <ul>
                                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
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
                    
                    <div style="display: flex; gap: 10px;">
                        ${this.currentStep === 3 ? `
                            <button class="wizard-btn secondary" onclick="NetberryComponents.simulator.resetWizard(); NetberryComponents.simulator.renderWizard();">
                                🔄 Nuevo Análisis
                            </button>
                        ` : ''}
                        
                        <button class="wizard-btn primary" 
                                onclick="NetberryComponents.simulator.${this.currentStep === 3 ? 'closeModal()' : 'nextStep()'}"
                                id="nextStepBtn">
                            ${this.currentStep === 3 ? '✓ Cerrar' : 'Siguiente →'}
                        </button>
                    </div>
                </div>
            `;
        },

        bindEvents: function() {
            // Eventos para Step 1
            if (this.currentStep === 1) {
                const fields = ['projectName', 'projectPriority', 'projectDuration', 'projectStartDate', 'projectDescription'];
                fields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) {
                        field.addEventListener('input', () => this.validateStep1());
                    }
                });
            }

            // Eventos para Step 2
            if (this.currentStep === 2) {
                Object.keys(NetberryData.departments).forEach(deptKey => {
                    const input = document.getElementById(`hours-${deptKey}`);
                    if (input) {
                        input.addEventListener('input', () => this.validateStep2());
                    }
                });
            }
        },

        nextStep: function() {
            if (this.validateCurrentStep()) {
                this.saveCurrentStepData();
                if (this.currentStep < this.maxSteps) {
                    this.currentStep++;
                    this.renderWizard();
                }
            }
        },

        previousStep: function() {
            if (this.currentStep > 1) {
                this.currentStep--;
                this.renderWizard();
            }
        },

        validateCurrentStep: function() {
            switch (this.currentStep) {
                case 1:
                    return this.validateStep1();
                case 2:
                    return this.validateStep2();
                case 3:
                    return true;
                default:
                    return false;
            }
        },

        validateStep1: function() {
            const name = document.getElementById('projectName')?.value.trim();
            const duration = document.getElementById('projectDuration')?.value;
            
            const isValid = name && duration && parseInt(duration) > 0 && parseInt(duration) <= 24;
            
            const nextBtn = document.getElementById('nextStepBtn');
            if (nextBtn) {
                nextBtn.disabled = !isValid;
            }
            
            return isValid;
        },

        validateStep2: function() {
            const hasHours = Object.keys(NetberryData.departments).some(deptKey => {
                const input = document.getElementById(`hours-${deptKey}`);
                return input && parseInt(input.value) > 0;
            });
            
            const nextBtn = document.getElementById('nextStepBtn');
            if (nextBtn) {
                nextBtn.disabled = !hasHours;
            }
            
            return hasHours;
        },

        saveCurrentStepData: function() {
            if (this.currentStep === 1) {
                this.projectData.name = document.getElementById('projectName')?.value || '';
                this.projectData.priority = document.getElementById('projectPriority')?.value || 'medium';
                this.projectData.duration = parseInt(document.getElementById('projectDuration')?.value) || 6;
                this.projectData.startDate = document.getElementById('projectStartDate')?.value || '';
                this.projectData.description = document.getElementById('projectDescription')?.value || '';
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

        updateUtilPreview: function(deptKey) {
            const input = document.getElementById(`hours-${deptKey}`);
            const preview = document.getElementById(`preview-${deptKey}`);
            
            if (input && preview) {
                const hours = parseInt(input.value) || 0;
                if (hours > 0) {
                    preview.textContent = this.calculateNewUtilization(deptKey, hours);
                } else {
                    preview.textContent = 'Introduce las horas para ver el impacto';
                }
            }
        },

        calculateNewUtilization: function(deptKey, hours) {
            const dept = NetberryData.departments[deptKey];
            if (!dept) return 'Error';

            const monthlyCapacity = dept.capacity / 12;
            const monthlyHours = hours / (this.projectData.duration || 6);
            const newUtil = dept.utilization + (monthlyHours / monthlyCapacity * 100);

            const status = newUtil > 100 ? 'Imposible' : 
                          newUtil > 95 ? 'Crítico' : 
                          newUtil > 85 ? 'Riesgo' : 'Viable';

            return `Nuevo: ${formatNumber.percentage(newUtil)} (${status})`;
        },

        performAnalysis: function() {
            return NetberryData.calculations.simulateProjectImpact(this.projectData.departments || {});
        },

        getStatusIcon: function(viability) {
            const icons = {
                'viable': '✅',
                'risky': '⚠️',  
                'not_viable': '❌'
            };
            return icons[viability] || '❓';
        },

        getStatusText: function(viability) {
            const texts = {
                'viable': 'Proyecto Viable',
                'risky': 'Proyecto con Riesgos',
                'not_viable': 'Proyecto No Viable'
            };
            return texts[viability] || 'Estado Desconocido';
        }
    },

    // Método para cerrar modal del simulador
    closeSimulatorModal: function() {
        this.simulator.closeModal();
    },

    // Inicializar todos los componentes
    init: function() {
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
        this.kpis.update();
        this.departments.filter();
        this.projects.filter();
        this.timeline.update();
    }
};

// Exportar para uso global
window.NetberryComponents = NetberryComponents;