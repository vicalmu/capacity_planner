// js/gantt/gantt-chart.js - Gantt Chart con Dropdown de Departamentos CORREGIDO

const GanttChart = {
    
    render: function() {
        const container = document.getElementById('ganttChart');
        if (!container) return;

        const year = NetberryData.config.ganttYear;
        const quarter = NetberryData.config.selectedQuarter || 'Q1';
        const isQuarterly = NetberryData.config.ganttView === 'quarterly';
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Generar cabeceras según vista
        const headers = this.generateHeaders(isQuarterly, quarter);

        // Crear controles de año y trimestre
        const controls = this.renderControls(year, quarter, isQuarterly);

        // Crear la estructura del Gantt
        let ganttHTML = `
            ${controls}
            <div class="gantt-grid" style="grid-template-columns: 180px repeat(${headers.length}, 1fr);">
                <!-- Header Row -->
                <div class="gantt-cell gantt-header-cell">Departamento</div>
                ${headers.map((header, index) => `
                    <div class="gantt-cell gantt-header-cell ${
                        this.isCurrentPeriod(header, year, isQuarterly, index) ? 'current-month' : ''
                    }">${header}</div>
                `).join('')}
        `;

        // Generar filas por departamento
        const filteredDepartments = NetberryData.calculations.getFilteredDepartments(NetberryUtils.activeFilters);
        const filteredDeptEntries = Object.entries(NetberryData.departments)
            .filter(([key, dept]) => 
                NetberryUtils.activeFilters.includes('all') || 
                NetberryUtils.activeFilters.includes(key)
            );

        filteredDeptEntries.forEach(([deptKey, dept]) => {
            // FILA DE CAPACIDAD DEPARTAMENTAL CON CÁLCULO MENSUAL CORRECTO
            ganttHTML += this.renderCapacityRowWithMonthlyCalculation(deptKey, dept, headers.length, isQuarterly, year, quarter);
            
            // FILAS DE PROYECTOS
            const deptProjects = NetberryData.calculations.getProjectsByDepartmentAndYear(deptKey, year);
            
            if (deptProjects.length > 0) {
                // Agrupar proyectos en carriles
                const tracks = this.organizeProjectsInTracks(deptProjects, year);
                
                tracks.forEach((track, trackIndex) => {
                    ganttHTML += `
                        <div class="gantt-cell project-track-label">${
                            trackIndex === 0 ? `↳ Proyectos` : ''
                        }</div>
                    `;
                    
                    // Generar celdas para cada período
                    for (let period = 0; period < headers.length; period++) {
                        const projectInPeriod = track.find(project => {
                            // CORREGIDO: Usar siempre posición anual, luego verificar si está en el trimestre
                            const pos = NetberryData.calculations.getProjectTimelinePosition(project, year);
                            if (!pos) return false;
                            
                            if (isQuarterly) {
                                // Convertir el período trimestral a mes absoluto
                                const quarterStartMonth = (parseInt(NetberryData.config.selectedQuarter.substring(1)) - 1) * 3;
                                const absoluteMonth = quarterStartMonth + period;
                                return absoluteMonth >= pos.startMonth && absoluteMonth <= pos.endMonth;
                            } else {
                                return period >= pos.startMonth && period <= pos.endMonth;
                            }
                        });
                        
                        if (projectInPeriod) {
                            // CORREGIDO: Usar posición anual para calcular el ancho correcto
                            const pos = NetberryData.calculations.getProjectTimelinePosition(projectInPeriod, year);
                            
                            if (isQuarterly) { 
                                // Para vista trimestral, verificar si es el primer período visible del proyecto
                                const quarterStartMonth = (parseInt(NetberryData.config.selectedQuarter.substring(1)) - 1) * 3;
                                const absoluteMonth = quarterStartMonth + period;
                                const projectStartInQuarter = Math.max(pos.startMonth, quarterStartMonth) - quarterStartMonth;
                                const projectEndInQuarter = Math.min(pos.endMonth, quarterStartMonth + 2) - quarterStartMonth;
                                
                                if (period === projectStartInQuarter) {
                                    // Primera celda visible del proyecto en este trimestre
                                    const visibleDuration = projectEndInQuarter - projectStartInQuarter + 1;
                                    ganttHTML += `
                                        <div class="gantt-cell project-cell">
                                            <div class="project-bar project-${deptKey}" 
                                                 style="left: 0%; width: ${(visibleDuration * 100)}%;"
                                                 onclick="GanttChart.openProjectModal(${projectInPeriod.id})"
                                                 title="${projectInPeriod.name} (${projectInPeriod.startDate} - ${projectInPeriod.endDate})">
                                                ${projectInPeriod.name}
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    ganttHTML += '<div class="gantt-cell project-cell"></div>';
                                }
                            } else {
                                // Vista anual (como antes)
                                if (period === pos.startMonth) {
                                    ganttHTML += `
                                        <div class="gantt-cell project-cell">
                                            <div class="project-bar project-${deptKey}" 
                                                 style="left: 0%; width: ${(pos.duration * 100)}%;"
                                                 onclick="GanttChart.openProjectModal(${projectInPeriod.id})"
                                                 title="${projectInPeriod.name} (${projectInPeriod.startDate} - ${projectInPeriod.endDate})">
                                                ${projectInPeriod.name}
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    ganttHTML += '<div class="gantt-cell project-cell"></div>';
                                }
                            }
                        } else {
                            ganttHTML += '<div class="gantt-cell project-cell"></div>';
                        }
                    }
                });
            }
        });

        ganttHTML += '</div>';
        container.innerHTML = ganttHTML;

        // Renderizar leyenda
        this.renderLegend();
        
        // Configurar eventos
        this.bindEvents();
    },

    generateHeaders: function(isQuarterly, quarter) {
        if (isQuarterly) {
            const quarterMap = {
                'Q1': ['Ene', 'Feb', 'Mar'],
                'Q2': ['Abr', 'May', 'Jun'],
                'Q3': ['Jul', 'Ago', 'Sep'],
                'Q4': ['Oct', 'Nov', 'Dic']
            };
            return quarterMap[quarter] || quarterMap['Q1'];
        } else {
            return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        }
    },

    // *** FUNCIÓN RENDERCONTROLS CORREGIDA CON EVENTOS FUNCIONALES ***
    renderControls: function(year, quarter, isQuarterly) {
        const years = [2024, 2025, 2026, 2027, 2028];
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        
        // Obtener departamentos actuales
        const departments = Object.entries(NetberryData.departments);
        const activeFilters = NetberryUtils.activeFilters || ['all'];
        const filteredDepts = activeFilters.includes('all') ? 
            departments.map(([key]) => key) : activeFilters;
        
        // Calcular conteo para mostrar
        const selectedCount = activeFilters.includes('all') ? departments.length : activeFilters.length;
        const displayText = activeFilters.includes('all') ? 
            `Todos (${departments.length})` : 
            selectedCount === 0 ? 'Ninguno' : 
            `${selectedCount} seleccionados`;

        return `
            <div class="gantt-controls">
                <div class="gantt-control-group">
                    <label class="year-label">Año:</label>
                    <select id="ganttYearSelector" class="year-selector">
                        ${years.map(y => `
                            <option value="${y}" ${y === year ? 'selected' : ''}>${y}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="gantt-control-group">
                    <label class="view-label">Vista:</label>
                    <div class="view-toggle">
                        <button class="view-btn ${!isQuarterly ? 'active' : ''}" data-view="annual">
                            Anual
                        </button>
                        <button class="view-btn ${isQuarterly ? 'active' : ''}" data-view="quarterly">
                            Trimestral
                        </button>
                    </div>
                </div>
                
                ${isQuarterly ? `
                    <div class="gantt-control-group">
                        <label class="quarter-label">Trimestre:</label>
                        <select id="ganttQuarterSelector" class="quarter-selector">
                            ${quarters.map(q => `
                                <option value="${q}" ${q === quarter ? 'selected' : ''}>${q}</option>
                            `).join('')}
                        </select>
                    </div>
                ` : ''}
                
                <!-- *** SELECTOR DE DEPARTAMENTOS CORREGIDO *** -->
                <div class="gantt-control-group department-selector-inline">
                    <label class="dept-label">Departamentos:</label>
                    <div class="selector-toggle" id="departmentToggle">
                        <span id="selectedCount">${displayText}</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="selector-dropdown" id="selectorDropdown">
                        <div class="dropdown-header">
                            <button class="select-all-btn" id="selectAllBtn">Seleccionar Todos</button>
                            <button class="clear-all-btn" id="clearAllBtn">Limpiar</button>
                        </div>
                        <div class="dropdown-options" id="dropdownOptions">
                            ${departments.map(([key, dept]) => {
                                const isSelected = activeFilters.includes('all') || activeFilters.includes(key);
                                return `
                                    <div class="option-item ${isSelected ? 'selected' : ''}" data-dept="${key}">
                                        <input type="checkbox" id="dept-${key}" value="${key}" ${isSelected ? 'checked' : ''}>
                                        <div class="checkmark">✓</div>
                                        <label for="dept-${key}" class="dept-name">${dept.name}</label>
                                        <span class="dept-count">${dept.people.length}p</span>
                                        ${dept.utilization > 95 ? 
                                            `<span class="dept-status critical">${Math.round(dept.utilization)}%</span>` : 
                                            dept.utilization > 85 ? 
                                            `<span class="dept-status warning">${Math.round(dept.utilization)}%</span>` : 
                                            `<span class="dept-status good">${Math.round(dept.utilization)}%</span>`
                                        }
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderCapacityRowWithMonthlyCalculation: function(deptKey, dept, periodCount, isQuarterly, year, quarter) {
        const monthlyCapacity = dept.capacity / 12; // Capacidad mensual del departamento
        const deptProjects = NetberryData.calculations.getProjectsByDepartmentAndYear(deptKey, year);
        
        // Calcular utilización mensual - CORREGIDO: Sin recalcular por vista
        let monthlyUtilizations = [];
        const startMonth = isQuarterly ? (parseInt(quarter.substring(1)) - 1) * 3 : 0;
        const periodsToShow = isQuarterly ? 3 : 12;
        
        for (let period = 0; period < periodsToShow; period++) {
            const currentMonth = startMonth + period;
            let monthlyHours = 0;
            
            // Sumar horas de todos los proyectos activos en este mes
            deptProjects.forEach(project => {
                // CORREGIDO: Usar siempre la posición anual completa
                const pos = NetberryData.calculations.getProjectTimelinePosition(project, year);
                if (pos && currentMonth >= pos.startMonth && currentMonth <= pos.endMonth) {
                    // CLAVE: Siempre dividir entre la duración REAL del proyecto, no la vista
                    const projectDurationMonths = pos.endMonth - pos.startMonth + 1;
                    const monthlyProjectHours = project.hours / projectDurationMonths;
                    monthlyHours += monthlyProjectHours;
                }
            });
            
            // Calcular porcentaje de utilización mensual
            const monthlyUtilization = (monthlyHours / monthlyCapacity) * 100;
            monthlyUtilizations.push(Math.round(monthlyUtilization));
        }
        
        // Determinar color de fondo de la fila según la utilización máxima
        const maxUtilization = Math.max(...monthlyUtilizations);
        const rowClass = maxUtilization > 100 ? 'dept-critical' : maxUtilization > 90 ? 'dept-warning' : 'dept-normal';
        
        let html = `
            <div class="gantt-cell dept-capacity-label dept-${deptKey} ${rowClass}">
                <div class="dept-capacity-info">
                    <strong>${dept.name}</strong>
                    <div class="capacity-stats">
                        ${dept.people.length}p • Max: ${maxUtilization}%
                    </div>
                </div>
            </div>
        `;
        
        // Generar celdas con utilización mensual real
        for (let period = 0; period < periodsToShow; period++) {
            const utilization = monthlyUtilizations[period] || 0;
            const capacityColor = this.getCapacityColor(utilization);
            const displayUtilization = utilization > 999 ? '999+' : utilization;
            
            html += `
                <div class="gantt-cell capacity-cell">
                    <div class="capacity-bar dept-${deptKey}" style="
                        width: ${Math.min(utilization, 100)}%; 
                        background: ${capacityColor};
                    " title="${dept.name}: ${utilization}% utilización mensual">
                        ${displayUtilization}%
                    </div>
                </div>
            `;
        }
        
        return html;
    },

    getCapacityColor: function(utilization) {
        if (utilization >= 95) return 'linear-gradient(135deg, #ef4444, #dc2626)';
        if (utilization >= 85) return 'linear-gradient(135deg, #f59e0b, #d97706)';
        return 'linear-gradient(135deg, #10b981, #059669)';
    },

    isCurrentPeriod: function(header, year, isQuarterly, index) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        if (year !== currentYear) return false;
        
        if (isQuarterly) {
            // Lógica para trimestres
            const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
            return index === (currentMonth - quarterStartMonth);
        } else {
            // Lógica para meses anuales
            return index === currentMonth;
        }
    },

    organizeProjectsInTracks: function(projects, year) {
        const tracks = [];
        const isQuarterly = NetberryData.config.ganttView === 'quarterly';
        
        projects.forEach(project => {
            // CORREGIDO: Siempre usar posición anual para organizar tracks
            const pos = NetberryData.calculations.getProjectTimelinePosition(project, year);
            if (!pos) return;
            
            // Si es vista trimestral, verificar si el proyecto intersecta con el trimestre
            if (isQuarterly) {
                const quarter = NetberryData.config.selectedQuarter || 'Q1';
                const quarterStart = (parseInt(quarter.substring(1)) - 1) * 3;
                const quarterEnd = quarterStart + 2;
                
                // Si el proyecto no intersecta con el trimestre, no lo incluir
                if (pos.endMonth < quarterStart || pos.startMonth > quarterEnd) return;
            }
            
            // Buscar un carril donde quepa el proyecto
            let trackFound = false;
            for (let track of tracks) {
                if (this.canProjectFitInTrack(project, track, year)) {
                    track.push(project);
                    trackFound = true;
                    break;
                }
            }
            
            // Si no cabe en ningún carril, crear uno nuevo
            if (!trackFound) {
                tracks.push([project]);
            }
        });
        
        return tracks;
    },

    canProjectFitInTrack: function(newProject, track, year) {
        // CORREGIDO: Siempre usar posición anual para verificar solapamientos
        const newPos = NetberryData.calculations.getProjectTimelinePosition(newProject, year);
        if (!newPos) return false;
        
        for (let existingProject of track) {
            const existingPos = NetberryData.calculations.getProjectTimelinePosition(existingProject, year);
            if (!existingPos) continue;
            
            // Verificar si hay solapamiento en meses absolutos
            if (!(newPos.endMonth < existingPos.startMonth || newPos.startMonth > existingPos.endMonth)) {
                return false; // Hay solapamiento
            }
        }
        
        return true; // No hay solapamiento
    },

    renderLegend: function() {
        const container = document.getElementById('ganttLegend');
        if (!container) return;

        const departments = Object.entries(NetberryData.departments);
        
        container.innerHTML = `
            <div class="legend-section">
                <h4>Departamentos:</h4>
                <div class="legend-items">
                    ${departments.map(([key, dept]) => `
                        <div class="gantt-legend-item">
                            <div class="gantt-legend-color project-${key}"></div>
                            <span>${dept.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="legend-section">
                <h4>Capacidad:</h4>
                <div class="legend-items">
                    <div class="gantt-legend-item">
                        <div class="capacity-legend-color" style="background: linear-gradient(135deg, #10b981, #059669);"></div>
                        <span>0-84% (Saludable)</span>
                    </div>
                    <div class="gantt-legend-item">
                        <div class="capacity-legend-color" style="background: linear-gradient(135deg, #f59e0b, #d97706);"></div>
                        <span>85-94% (Advertencia)</span>
                    </div>
                    <div class="gantt-legend-item">
                        <div class="capacity-legend-color" style="background: linear-gradient(135deg, #ef4444, #dc2626);"></div>
                        <span>95%+ (Crítico)</span>
                    </div>
                </div>
            </div>
        `;
    },

    // *** EVENTOS CORREGIDOS CON DROPDOWN FUNCIONAL ***
    bindEvents: function() {
        // Limpiar eventos anteriores
        this.unbindEvents();

        // Selector de año
        const yearSelector = document.getElementById('ganttYearSelector');
        if (yearSelector) {
            yearSelector.addEventListener('change', (e) => {
                NetberryData.config.ganttYear = parseInt(e.target.value);
                this.render();
            });
        }

        // Selector de trimestre
        const quarterSelector = document.getElementById('ganttQuarterSelector');
        if (quarterSelector) {
            quarterSelector.addEventListener('change', (e) => {
                NetberryData.config.selectedQuarter = e.target.value;
                this.render();
            });
        }

        // Toggle vista anual/trimestral
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.getAttribute('data-view');
                NetberryData.config.ganttView = view;
                
                // Actualizar botones activos
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.render();
            });
        });

        // *** DROPDOWN DE DEPARTAMENTOS FUNCIONAL ***
        const departmentToggle = document.getElementById('departmentToggle');
        const selectorDropdown = document.getElementById('selectorDropdown');
        const selectAllBtn = document.getElementById('selectAllBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');

        // Toggle dropdown
        if (departmentToggle) {
            departmentToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                selectorDropdown.classList.toggle('show');
                
                // Actualizar flecha
                const arrow = departmentToggle.querySelector('.arrow');
                if (arrow) {
                    arrow.style.transform = selectorDropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            });
        }

        // Seleccionar todos
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectAllDepartments();
            });
        }

        // Limpiar todos
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearAllDepartments();
            });
        }

        // Checkboxes de departamentos
        const checkboxes = document.querySelectorAll('#selectorDropdown input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleDepartmentChange(e.target);
            });
        });

        // Option items clickables
        const optionItems = document.querySelectorAll('.option-item');
        optionItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox' && !e.target.closest('button')) {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        this.handleDepartmentChange(checkbox);
                    }
                }
            });
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.department-selector-inline')) {
                if (selectorDropdown && selectorDropdown.classList.contains('show')) {
                    selectorDropdown.classList.remove('show');
                    const arrow = departmentToggle?.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                }
            }
        });
    },

    unbindEvents: function() {
        // Remover event listeners previos si existen
        const elements = ['ganttYearSelector', 'ganttQuarterSelector', 'departmentToggle', 'selectAllBtn', 'clearAllBtn'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.replaceWith(el.cloneNode(true));
            }
        });
    },

    // *** FUNCIONES DE MANEJO DE DEPARTAMENTOS ***
    selectAllDepartments: function() {
        const checkboxes = document.querySelectorAll('#selectorDropdown input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = true;
            const optionItem = cb.closest('.option-item');
            if (optionItem) {
                optionItem.classList.add('selected');
            }
        });

        // Actualizar filtros
        NetberryUtils.activeFilters = ['all'];
        this.updateSelectorDisplay();
        this.applyFilters();
    },

    clearAllDepartments: function() {
        const checkboxes = document.querySelectorAll('#selectorDropdown input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = false;
            const optionItem = cb.closest('.option-item');
            if (optionItem) {
                optionItem.classList.remove('selected');
            }
        });

        // Actualizar filtros
        NetberryUtils.activeFilters = [];
        this.updateSelectorDisplay();
        this.applyFilters();
    },

    handleDepartmentChange: function(checkbox) {
        const value = checkbox.value;
        const optionItem = checkbox.closest('.option-item');
        
        if (checkbox.checked) {
            if (optionItem) optionItem.classList.add('selected');
            
            // Agregar departamento a filtros activos
            if (!NetberryUtils.activeFilters.includes(value) && !NetberryUtils.activeFilters.includes('all')) {
                NetberryUtils.activeFilters.push(value);
            }
            
            // Si todos están seleccionados, cambiar a 'all'
            const allDepts = Object.keys(NetberryData.departments);
            if (NetberryUtils.activeFilters.length === allDepts.length) {
                NetberryUtils.activeFilters = ['all'];
            }
        } else {
            if (optionItem) optionItem.classList.remove('selected');
            
            // Si estaba en modo 'all', cambiar a lista específica
            if (NetberryUtils.activeFilters.includes('all')) {
                NetberryUtils.activeFilters = Object.keys(NetberryData.departments).filter(key => key !== value);
            } else {
                // Remover departamento específico
                NetberryUtils.activeFilters = NetberryUtils.activeFilters.filter(dept => dept !== value);
            }
        }

        this.updateSelectorDisplay();
        this.applyFilters();
    },

    updateSelectorDisplay: function() {
        const selectedCountElement = document.getElementById('selectedCount');
        if (!selectedCountElement) return;

        const allDepts = Object.keys(NetberryData.departments);
        const isAllSelected = NetberryUtils.activeFilters.includes('all');
        const selectedCount = isAllSelected ? allDepts.length : NetberryUtils.activeFilters.length;

        let displayText;
        if (selectedCount === 0) {
            displayText = 'Ninguno';
        } else if (isAllSelected || selectedCount === allDepts.length) {
            displayText = `Todos (${allDepts.length})`;
        } else {
            displayText = `${selectedCount} seleccionados`;
        }

        selectedCountElement.textContent = displayText;
    },

    applyFilters: function() {
        console.log('🔄 Aplicando filtros:', NetberryUtils.activeFilters);
        
        // Actualizar todos los componentes
        if (typeof NetberryComponents !== 'undefined') {
            NetberryComponents.updateAll();
        }
        
        // Re-renderizar el Gantt con los nuevos filtros
        this.render();
    },

    openProjectModal: function(projectId) {
        const project = NetberryData.projects.find(p => p.id === projectId);
        if (!project) return;

        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        const subtitle = document.getElementById('projectModalSubtitle');
        const content = document.getElementById('projectModalContent');

        if (modal && title && subtitle && content) {
            title.textContent = project.name;
            subtitle.textContent = `${project.startDate} - ${project.endDate} • ${project.progress}% completado`;
            
            content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${project.progress}%</div>
                        <div class="stat-label">Progreso</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${formatNumber.hours(project.hours)}</div>
                        <div class="stat-label">Horas Estimadas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${project.priority.toUpperCase()}</div>
                        <div class="stat-label">Prioridad</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${project.departments.length}</div>
                        <div class="stat-label">Departamentos</div>
                    </div>
                </div>
                
                <div style="margin: 25px 0;">
                    <h3 style="color: var(--dark); margin-bottom: 15px;">📋 Descripción</h3>
                    <p style="color: #6b7280; line-height: 1.6;">${project.description}</p>
                </div>
                
                <div style="margin: 25px 0;">
                    <h3 style="color: var(--dark); margin-bottom: 15px;">👥 Departamentos Involucrados</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${project.departments.map(deptKey => `
                            <span style="padding: 6px 12px; background: var(--primary-orange); color: white; 
                                       border-radius: 20px; font-size: 13px; font-weight: 600;">
                                ${NetberryData.departments[deptKey].name}
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                <div style="margin: 25px 0;">
                    <h3 style="color: var(--dark); margin-bottom: 15px;">📅 Timeline</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="font-weight: 600;">Inicio:</span>
                            <span>${new Date(project.startDate).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span style="font-weight: 600;">Fin:</span>
                            <span>${new Date(project.endDate).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--primary-orange); height: 100%; width: ${project.progress}%; 
                                       border-radius: 4px; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    },

    closeProjectModal: function() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    update: function() {
        this.render();
    }
};

// Funciones globales para compatibilidad (CORREGIDAS)
function toggleDepartmentDropdown() {
    const dropdown = document.getElementById('selectorDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        
        // Actualizar flecha
        const toggle = document.getElementById('departmentToggle');
        const arrow = toggle?.querySelector('.arrow');
        if (arrow) {
            arrow.style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
}

function selectAllDepartments() {
    if (window.GanttChart) {
        GanttChart.selectAllDepartments();
    }
}

function clearAllDepartments() {
    if (window.GanttChart) {
        GanttChart.clearAllDepartments();
    }
}

// Exportar para uso global
window.GanttChart = GanttChart;