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

            container.innerHTML = `
                <div class="kpi-card capacity">
                    <div class="kpi-value" style="color: #10b981;">${formatNumber.hours(availableCapacity)}</div>
                    <div class="kpi-label">Capacidad Disponible (Q3 2025)</div>
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
            if (capacity > 2000) return 'trend-good';
            if (capacity > 1000) return 'trend-warning';
            return 'trend-critical';
        },

        getCapacityMessage: function(capacity) {
            if (capacity > 2000) return '✓ Ventana para 3-4 proyectos grandes';
            if (capacity > 1000) return '⚠️ Capacidad limitada - Priorizar proyectos';
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
            NetberryComponents.timeline.update(); // ← ESTA LÍNEA DEBE ESTAR
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

  // Componente de timeline actualizado para filtrar por departamento
timeline: {
    render: function() {
        const container = document.getElementById('capacityTimeline');
        if (!container) return;

        // Obtener departamentos filtrados
        const filteredDepartments = NetberryData.calculations.getFilteredDepartments(NetberryUtils.activeFilters);
        
        // Calcular capacidad total de los departamentos filtrados
        const totalFilteredCapacity = NetberryData.calculations.getTotalCapacity(filteredDepartments);
        
        // Generar datos trimestrales basados en departamentos filtrados
        const quarters = this.generateQuarterData(filteredDepartments, totalFilteredCapacity);

        // Determinar título según filtro activo
        const title = this.getTimelineTitle();

        container.innerHTML = `
            <div class="timeline-header">
                <h3>${title}</h3>
                <div class="timeline-legend">
                    <span class="legend-item"><span class="legend-color committed"></span>Comprometido</span>
                    <span class="legend-item"><span class="legend-color buffer"></span>Buffer</span>
                    <span class="legend-item"><span class="legend-color available"></span>Disponible</span>
                </div>
            </div>
            ${quarters.map(quarter => `
                <div class="timeline-row">
                    <div class="timeline-label">${quarter.label}</div>
                    <div class="timeline-bar">
                        <div class="bar-segment committed" 
                             style="width: ${quarter.committed}%;"
                             title="Comprometido: ${quarter.committed}% (${formatNumber.hours(quarter.committedHours)})">
                            ${quarter.committed}%
                        </div>
                        <div class="bar-segment buffer" 
                             style="width: ${quarter.buffer}%;"
                             title="Buffer: ${quarter.buffer}% (${formatNumber.hours(quarter.bufferHours)})">
                            Buffer
                        </div>
                        <div class="bar-segment available" 
                             style="width: ${quarter.available}%;"
                             title="Disponible: ${quarter.available}% (${formatNumber.hours(quarter.availableHours)})">
                            ${quarter.available}%
                        </div>
                    </div>
                    <div class="timeline-total">
                        ${formatNumber.hours(quarter.total)}
                        <div class="timeline-subtitle">${quarter.departments} dept${quarter.departments !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            `).join('')}
        `;
    },
      // AGREGAR ESTE MÉTODO QUE FALTA:
    update: function() {
        console.log('🔄 Timeline update llamado');
        this.render();
    },

    // Generar datos por trimestre para departamentos filtrados
    generateQuarterData: function(filteredDepartments, totalCapacity) {
        const quarters = [
            { label: 'Q3 2025', baseCommitted: 68, trend: 0 },
            { label: 'Q4 2025', baseCommitted: 72, trend: 4 },
            { label: 'Q1 2026', baseCommitted: 58, trend: -10 },
            { label: 'Q2 2026', baseCommitted: 45, trend: -23 }
        ];

        return quarters.map(quarter => {
            // Calcular utilización promedio de los departamentos filtrados
            const avgUtilization = NetberryData.calculations.getAverageUtilization(filteredDepartments);
            
            // Ajustar porcentajes basados en utilización actual y tendencia del trimestre
            let committed = formatNumber.decimal(avgUtilization + quarter.trend);
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
            const quarterlCapacity = totalCapacity; // Capacidad trimestral
            const committedHours = formatNumber.decimal((committed / 100) * quarterlCapacity);
            const bufferHours = formatNumber.decimal((buffer / 100) * quarterlCapacity);
            const availableHours = formatNumber.decimal((available / 100) * quarterlCapacity);

            return {
                label: quarter.label,
                committed: formatNumber.decimal(committed),
                buffer: formatNumber.decimal(buffer),
                available: formatNumber.decimal(available),
                total: quarterlCapacity,
                committedHours,
                bufferHours,
                availableHours,
                departments: filteredDepartments.length
            };
        });
    },

    // Obtener título según filtro activo
    getTimelineTitle: function() {
        if (NetberryUtils.activeFilters.includes('all')) {
            return 'Proyección de Capacidad Trimestral - Todos los Departamentos';
        } else if (NetberryUtils.activeFilters.length === 1) {
            const deptKey = NetberryUtils.activeFilters[0];
            const deptName = NetberryData.departments[deptKey].name;
            return `Proyección de Capacidad Trimestral - ${deptName}`;
        } else {
            const deptNames = NetberryUtils.activeFilters
                .map(key => NetberryData.departments[key].name)
                .slice(0, 2); // Mostrar máximo 2 nombres
            const remaining = NetberryUtils.activeFilters.length - 2;
            const suffix = remaining > 0 ? ` +${remaining} más` : '';
            return `Proyección de Capacidad Trimestral - ${deptNames.join(', ')}${suffix}`;
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

    // Inicializar todos los componentes
    init: function() {
        this.kpis.render();
        this.filters.render();
        this.departments.render();
        this.timeline.render();
        this.projects.render();
        
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
    }
};

// Exportar para uso global
window.NetberryComponents = NetberryComponents;