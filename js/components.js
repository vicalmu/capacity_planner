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

    // Componente de timeline
    timeline: {
        render: function() {
            const container = document.getElementById('capacityTimeline');
            if (!container) return;

            const quarters = [
                { label: 'Q3 2025', committed: 68, buffer: 15, available: 17, total: 7920 },
                { label: 'Q4 2025', committed: 72, buffer: 15, available: 13, total: 7920 },
                { label: 'Q1 2026', committed: 58, buffer: 15, available: 27, total: 7920 },
                { label: 'Q2 2026', committed: 45, buffer: 15, available: 40, total: 7920 }
            ];

            container.innerHTML = quarters.map(quarter => `
                <div class="timeline-row">
                    <div class="timeline-label">${quarter.label}</div>
                    <div class="timeline-bar">
                        <div class="bar-segment committed" style="width: ${quarter.committed}%;">
                            ${quarter.committed}%
                        </div>
                        <div class="bar-segment buffer" style="width: ${quarter.buffer}%;">
                            Buffer
                        </div>
                        <div class="bar-segment available" style="width: ${quarter.available}%;">
                            ${quarter.available}%
                        </div>
                    </div>
                    <div class="timeline-total">${formatNumber.hours(quarter.total)}</div>
                </div>
            `).join('');
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