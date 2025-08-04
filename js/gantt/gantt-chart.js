// js/gantt/gantt-chart.js - Componente Gantt Chart

const GanttChart = {
    
    render: function() {
        const container = document.getElementById('ganttChart');
        if (!container) return;

        const year = NetberryData.config.ganttYear;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Generar cabeceras de meses
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        // Crear la estructura del Gantt
        let ganttHTML = `
            <div class="gantt-grid">
                <!-- Header Row -->
                <div class="gantt-cell gantt-header-cell">Departamento</div>
                ${months.map((month, index) => `
                    <div class="gantt-cell gantt-header-cell ${
                        year === currentYear && index === currentMonth ? 'current-month' : ''
                    }">${month}</div>
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
            const deptProjects = NetberryData.calculations.getProjectsByDepartmentAndYear(deptKey, year);
            
            if (deptProjects.length === 0) {
                // Departamento sin proyectos
                ganttHTML += `
                    <div class="gantt-cell dept-label">${dept.name} (${dept.people.length})</div>
                    ${Array(12).fill().map(() => '<div class="gantt-cell project-cell"></div>').join('')}
                `;
            } else {
                // Agrupar proyectos en carriles
                const tracks = this.organizeProjectsInTracks(deptProjects, year);
                
                tracks.forEach((track, trackIndex) => {
                    ganttHTML += `
                        <div class="gantt-cell dept-label ${trackIndex > 0 ? 'secondary-track' : ''}">${
                            trackIndex === 0 ? `${dept.name} (${dept.people.length})` : ''
                        }</div>
                    `;
                    
                    // Generar celdas para cada mes
                    for (let month = 0; month < 12; month++) {
                        const projectInMonth = track.find(project => {
                            const pos = NetberryData.calculations.getProjectTimelinePosition(project, year);
                            return pos && month >= pos.startMonth && month <= pos.endMonth;
                        });
                        
                        if (projectInMonth) {
                            const pos = NetberryData.calculations.getProjectTimelinePosition(projectInMonth, year);
                            if (month === pos.startMonth) {
                                // Primera celda del proyecto
                                ganttHTML += `
                                    <div class="gantt-cell project-cell">
                                        <div class="project-bar project-${deptKey}" 
                                             style="left: 0%; width: ${(pos.duration * 100)}%;"
                                             onclick="GanttChart.openProjectModal(${projectInMonth.id})"
                                             title="${projectInMonth.name} (${projectInMonth.startDate} - ${projectInMonth.endDate})">
                                            ${projectInMonth.name}
                                        </div>
                                    </div>
                                `;
                            } else {
                                // Celdas intermedias del proyecto
                                ganttHTML += '<div class="gantt-cell project-cell"></div>';
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

    organizeProjectsInTracks: function(projects, year) {
        const tracks = [];
        
        projects.forEach(project => {
            const pos = NetberryData.calculations.getProjectTimelinePosition(project, year);
            if (!pos) return;
            
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
        const newPos = NetberryData.calculations.getProjectTimelinePosition(newProject, year);
        if (!newPos) return false;
        
        for (let existingProject of track) {
            const existingPos = NetberryData.calculations.getProjectTimelinePosition(existingProject, year);
            if (!existingPos) continue;
            
            // Verificar si hay solapamiento
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
        
        container.innerHTML = departments.map(([key, dept]) => `
            <div class="gantt-legend-item">
                <div class="gantt-legend-color project-${key}"></div>
                <span>${dept.name}</span>
            </div>
        `).join('');
    },

    bindEvents: function() {
        const yearSelector = document.getElementById('ganttYearSelector');
        if (yearSelector) {
            yearSelector.addEventListener('change', (e) => {
                NetberryData.config.ganttYear = parseInt(e.target.value);
                this.render();
            });
        }
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

// Exportar para uso global
window.GanttChart = GanttChart;