// projects-controller.js - Controlador completo para el Modo Proyectos

const ProjectsMode = {
    // Estado del modo
    state: {
        initialized: false,
        currentView: 'list',
        selectedProjects: new Set(),
        filteredProjects: [],
        sortBy: 'name',
        sortDirection: 'asc',
        filters: {
            status: ['active'],
            departments: [],
            priority: '',
            progressMin: 0,
            progressMax: 100,
            search: ''
        },
        editingProject: null
    },

    // === INICIALIZACIÓN ===
    init: function() {
        console.log('📋 Inicializando Modo Proyectos...');
        
        this.setupProjectsMode();
        this.renderDepartmentsFilter();
        this.applyFilters();
        this.bindEvents();
        
        this.state.initialized = true;
        console.log('✅ Modo Proyectos inicializado correctamente');
    },

    setupProjectsMode: function() {
        // Configurar tema visual
        document.documentElement.style.setProperty('--mode-color', '#059669');
        
        // Configurar evento del botón crear proyecto
        const createBtn = document.getElementById('createProjectBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.openCreateProjectModal());
        }
        
        // Configurar shortcuts de teclado
        this.setupKeyboardShortcuts();
        
        // Cargar proyectos desde localStorage si existen
        this.loadProjectsFromStorage();
    },

    // === GESTIÓN DE DATOS ===
    loadProjectsFromStorage: function() {
        try {
            const savedProjects = localStorage.getItem('netberry_projects');
            if (savedProjects) {
                const projects = JSON.parse(savedProjects);
                // Merge con proyectos existentes
                NetberryData.projects = [...NetberryData.projects, ...projects];
                console.log('📋 Proyectos cargados desde localStorage:', projects.length);
            }
        } catch (e) {
            console.warn('No se pudieron cargar los proyectos guardados:', e);
        }
    },

    saveProjectsToStorage: function() {
        try {
            // Guardar solo los proyectos creados por el usuario (con ID > 1000)
            const userProjects = NetberryData.projects.filter(p => p.id > 1000);
            localStorage.setItem('netberry_projects', JSON.stringify(userProjects));
            console.log('💾 Proyectos guardados en localStorage:', userProjects.length);
        } catch (e) {
            console.warn('No se pudieron guardar los proyectos:', e);
        }
    },

    // === RENDERIZADO DE VISTAS ===
    switchView: function(viewName) {
        if (!['list', 'kanban', 'timeline'].includes(viewName)) return;
        
        // Actualizar estado
        this.state.currentView = viewName;
        
        // Actualizar botones
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        
        // Mostrar/ocultar vistas
        document.querySelectorAll('.projects-view').forEach(view => {
            view.style.display = 'none';
        });
        
        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.style.display = 'block';
        }
        
        // Renderizar vista específica
        switch (viewName) {
            case 'list':
                this.renderListView();
                break;
            case 'kanban':
                this.renderKanbanView();
                break;
            case 'timeline':
                this.renderTimelineView();
                break;
        }
        
        // Actualizar breadcrumbs
        this.updateCurrentView(viewName);
    },

    renderListView: function() {
        const container = document.getElementById('projectsList');
        if (!container) return;
        
        container.innerHTML = this.state.filteredProjects.map(project => this.createProjectCard(project)).join('');
        
        // Bind events para las cards
        this.bindProjectCardEvents();
    },

    createProjectCard: function(project) {
        const departments = project.departments.map(deptKey => {
            const dept = NetberryData.departments[deptKey];
            return dept ? dept.name : deptKey;
        });
        
        const statusClass = this.getProjectStatus(project);
        const priorityClass = project.priority || 'medium';
        const progressAngle = (project.progress / 100) * 360;
        
        return `
            <div class="project-card" data-project-id="${project.id}" 
                 onclick="ProjectsMode.selectProject(${project.id})">
                <input type="checkbox" class="project-checkbox" 
                       onchange="ProjectsMode.toggleProjectSelection(${project.id})"
                       ${this.state.selectedProjects.has(project.id) ? 'checked' : ''}>
                
                <div class="project-card-header">
                    <div class="project-info">
                        <div class="project-title" onclick="ProjectsMode.openProjectDetails(${project.id})">
                            ${project.name}
                        </div>
                        <div class="project-meta">
                            <span>📅 ${project.startDate} → ${project.endDate}</span>
                            <span>⏱️ ${project.hours}h</span>
                            <span>ID: ${project.id}</span>
                        </div>
                    </div>
                    <div class="project-actions">
                        <button class="project-action-btn" onclick="ProjectsMode.editProject(${project.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="project-action-btn" onclick="ProjectsMode.duplicateProject(${project.id})" title="Duplicar">
                            📋
                        </button>
                        <button class="project-action-btn" onclick="ProjectsMode.deleteProject(${project.id})" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="project-card-body">
                    <div class="project-details">
                        <div class="project-departments">
                            ${departments.map(dept => `<span class="dept-tag">${dept}</span>`).join('')}
                        </div>
                        <div class="project-description">
                            ${project.description || 'Sin descripción disponible'}
                        </div>
                    </div>
                    
                    <div class="project-progress-section">
                        <div class="progress-circle" style="--progress-angle: ${progressAngle}deg;">
                            ${Math.round(project.progress)}%
                        </div>
                        <div class="progress-label">Progreso</div>
                    </div>
                    
                    <div class="project-status">
                        <div class="status-badge ${statusClass}">
                            ${this.getStatusLabel(statusClass)}
                        </div>
                        <div class="priority-indicator ${priorityClass}" 
                             title="Prioridad: ${this.getPriorityLabel(priorityClass)}">
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderKanbanView: function() {
        const container = document.getElementById('kanbanBoard');
        if (!container) return;
        
        const columns = [
            { id: 'backlog', title: '📋 Backlog', status: 'backlog' },
            { id: 'active', title: '🚀 En Proceso', status: 'active' },
            { id: 'completed', title: '✅ Completado', status: 'completed' },
            { id: 'archived', title: '📦 Archivado', status: 'archived' }
        ];
        
        container.innerHTML = columns.map(column => {
            const columnProjects = this.state.filteredProjects.filter(p => 
                this.getProjectStatus(p) === column.status
            );
            
            return `
                <div class="kanban-column" data-status="${column.status}">
                    <div class="kanban-header">
                        <div class="kanban-title">${column.title}</div>
                        <div class="kanban-count">${columnProjects.length}</div>
                    </div>
                    <div class="kanban-items" ondrop="ProjectsMode.onKanbanDrop(event)" ondragover="ProjectsMode.onKanbanDragOver(event)">
                        ${columnProjects.map(project => this.createKanbanCard(project)).join('')}
                    </div>
                </div>
            `;
        }).join('');
        
        this.bindKanbanEvents();
    },

    createKanbanCard: function(project) {
        const statusClass = this.getProjectStatus(project);
        
        return `
            <div class="kanban-card ${statusClass}" 
                 draggable="true" 
                 data-project-id="${project.id}"
                 ondragstart="ProjectsMode.onKanbanDragStart(event)">
                <div class="kanban-card-title">${project.name}</div>
                <div class="kanban-card-meta">
                    <span>${Math.round(project.progress)}%</span>
                    <span>${project.hours}h</span>
                </div>
            </div>
        `;
    },

    renderTimelineView: function() {
        const container = document.getElementById('timelineContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="timeline-header">
                <h3>📅 Timeline de Proyectos 2025</h3>
                <p>Vista temporal de todos los proyectos activos</p>
            </div>
            <div class="timeline-chart">
                <!-- Implementación futura: Gantt simplificado para proyectos -->
                <div style="text-align: center; padding: 100px; color: #64748b;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🚧</div>
                    <h3>Timeline View en Desarrollo</h3>
                    <p>Esta funcionalidad estará disponible próximamente</p>
                </div>
            </div>
        `;
    },

    // === FILTROS ===
    renderDepartmentsFilter: function() {
        const dropdown = document.getElementById('departmentsDropdown');
        if (!dropdown) return;
        
        const departments = Object.entries(NetberryData.departments);
        
        dropdown.innerHTML = departments.map(([key, dept]) => `
            <div class="multi-select-option">
                <input type="checkbox" 
                       id="dept-${key}" 
                       value="${key}"
                       ${this.state.filters.departments.length === 0 || this.state.filters.departments.includes(key) ? 'checked' : ''}
                       onchange="ProjectsMode.updateDepartmentFilter()">
                <label for="dept-${key}">${dept.name}</label>
            </div>
        `).join('');
        
        this.updateDepartmentsSelected();
    },

    updateDepartmentFilter: function() {
        const checkboxes = document.querySelectorAll('#departmentsDropdown input[type="checkbox"]:checked');
        this.state.filters.departments = Array.from(checkboxes).map(cb => cb.value);
        this.updateDepartmentsSelected();
        this.applyFilters();
    },

    updateDepartmentsSelected: function() {
        const selectedSpan = document.getElementById('departmentsSelected');
        if (!selectedSpan) return;
        
        const selectedCount = this.state.filters.departments.length;
        const totalCount = Object.keys(NetberryData.departments).length;
        
        if (selectedCount === 0 || selectedCount === totalCount) {
            selectedSpan.textContent = 'Todos seleccionados';
        } else {
            selectedSpan.textContent = `${selectedCount} seleccionados`;
        }
    },

    applyFilters: function() {
        let filtered = [...NetberryData.projects];
        
        // Filtro por estado
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            const selectedStatuses = Array.from(statusFilter.selectedOptions).map(opt => opt.value);
            if (selectedStatuses.length > 0) {
                filtered = filtered.filter(project => {
                    const projectStatus = this.getProjectStatus(project);
                    return selectedStatuses.includes(projectStatus);
                });
            }
        }
        
        // Filtro por departamentos
        if (this.state.filters.departments.length > 0) {
            filtered = filtered.filter(project => 
                project.departments.some(dept => this.state.filters.departments.includes(dept))
            );
        }
        
        // Filtro por prioridad
        const priorityFilter = document.getElementById('priorityFilter');
        if (priorityFilter && priorityFilter.value) {
            filtered = filtered.filter(project => 
                (project.priority || 'medium') === priorityFilter.value
            );
        }
        
        // Filtro por rango de progreso
        const progressMin = document.getElementById('progressMin');
        const progressMax = document.getElementById('progressMax');
        if (progressMin && progressMax) {
            const minVal = parseInt(progressMin.value);
            const maxVal = parseInt(progressMax.value);
            filtered = filtered.filter(project => 
                project.progress >= minVal && project.progress <= maxVal
            );
            
            // Actualizar labels
            document.getElementById('progressMinLabel').textContent = minVal + '%';
            document.getElementById('progressMaxLabel').textContent = maxVal + '%';
        }
        
        // Filtro de búsqueda
        const searchInput = document.getElementById('projectSearch');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchTerm) ||
                (project.description && project.description.toLowerCase().includes(searchTerm)) ||
                project.departments.some(deptKey => {
                    const dept = NetberryData.departments[deptKey];
                    return dept && dept.name.toLowerCase().includes(searchTerm);
                })
            );
        }
        
        // Aplicar ordenamiento
        this.sortProjects(filtered);
        
        // Actualizar estado y UI
        this.state.filteredProjects = filtered;
        this.updateProjectCount();
        this.renderCurrentView();
    },

    sortProjects: function(projects = null) {
        const projectsToSort = projects || this.state.filteredProjects;
        const sortBy = this.state.sortBy;
        const direction = this.state.sortDirection;
        
        projectsToSort.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'startDate':
                    valueA = new Date(a.startDate);
                    valueB = new Date(b.startDate);
                    break;
                case 'endDate':
                    valueA = new Date(a.endDate);
                    valueB = new Date(b.endDate);
                    break;
                case 'progress':
                    valueA = a.progress;
                    valueB = b.progress;
                    break;
                case 'priority':
                    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    valueA = priorityOrder[a.priority || 'medium'];
                    valueB = priorityOrder[b.priority || 'medium'];
                    break;
                case 'status':
                    valueA = this.getProjectStatus(a);
                    valueB = this.getProjectStatus(b);
                    break;
                default:
                    return 0;
            }
            
            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    // === UTILIDADES DE PROYECTO ===
    getProjectStatus: function(project) {
        // Lógica simple de determinación de estado
        if (project.status) return project.status;
        
        if (project.progress >= 100) return 'completed';
        if (project.progress > 0) return 'active';
        return 'backlog';
    },

    getStatusLabel: function(status) {
        const labels = {
            backlog: 'Backlog',
            active: 'En Proceso',
            completed: 'Terminado',
            archived: 'Archivado'
        };
        return labels[status] || status;
    },

    getPriorityLabel: function(priority) {
        const labels = {
            critical: 'Crítica',
            high: 'Alta',
            medium: 'Media',
            low: 'Baja'
        };
        return labels[priority] || 'Media';
    },

    // === CRUD DE PROYECTOS ===
    openCreateProjectModal: function() {
        this.state.editingProject = null;
        this.renderProjectModal('create');
        this.showModal('projectModal');
    },

    editProject: function(projectId) {
        const project = NetberryData.projects.find(p => p.id === projectId);
        if (!project) return;
        
        this.state.editingProject = project;
        this.renderProjectModal('edit');
        this.showModal('projectModal');
    },

    renderProjectModal: function(mode) {
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('projectForm');
        
        if (modalTitle) {
            modalTitle.textContent = mode === 'create' ? '➕ Crear Nuevo Proyecto' : '✏️ Editar Proyecto';
        }
        
        if (!form) return;
        
        const project = this.state.editingProject || {};
        const departments = Object.entries(NetberryData.departments);
        
        form.innerHTML = `
            <div class="project-form-grid">
                <div class="form-field">
                    <label class="form-label">Nombre del Proyecto *</label>
                    <input type="text" class="form-input" name="name" 
                           value="${project.name || ''}" 
                           placeholder="Ej: Nueva plataforma e-commerce" required>
                </div>
                
                <div class="form-field">
                    <label class="form-label">Horas Estimadas *</label>
                    <input type="number" class="form-input" name="hours" 
                           value="${project.hours || ''}" 
                           min="1" max="5000" placeholder="500" required>
                </div>
                
                <div class="form-field">
                    <label class="form-label">Fecha de Inicio *</label>
                    <input type="date" class="form-input" name="startDate" 
                           value="${project.startDate || ''}" required>
                </div>
                
                <div class="form-field">
                    <label class="form-label">Fecha de Fin *</label>
                    <input type="date" class="form-input" name="endDate" 
                           value="${project.endDate || ''}" required>
                </div>
                
                <div class="form-field">
                    <label class="form-label">Estado</label>
                    <select class="form-select" name="status">
                        <option value="backlog" ${project.status === 'backlog' ? 'selected' : ''}>📋 Backlog</option>
                        <option value="active" ${!project.status || project.status === 'active' ? 'selected' : ''}>🚀 En Proceso</option>
                        <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>✅ Terminado</option>
                        <option value="archived" ${project.status === 'archived' ? 'selected' : ''}>📦 Archivado</option>
                    </select>
                </div>
                
                <div class="form-field">
                    <label class="form-label">Prioridad</label>
                    <select class="form-select" name="priority">
                        <option value="low" ${project.priority === 'low' ? 'selected' : ''}>🔵 Baja</option>
                        <option value="medium" ${!project.priority || project.priority === 'medium' ? 'selected' : ''}>🟢 Media</option>
                        <option value="high" ${project.priority === 'high' ? 'selected' : ''}>🟡 Alta</option>
                        <option value="critical" ${project.priority === 'critical' ? 'selected' : ''}>🔴 Crítica</option>
                    </select>
                </div>
                
                <div class="form-field">
                    <label class="form-label">Progreso (%)</label>
                    <input type="number" class="form-input" name="progress" 
                           value="${project.progress || 0}" 
                           min="0" max="100" step="5">
                </div>
                
                <div class="form-field">
                    <label class="form-label">Departamentos Involucrados</label>
                    <div class="departments-checklist" style="max-height: 150px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                        ${departments.map(([key, dept]) => `
                            <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
                                <input type="checkbox" 
                                       id="dept-modal-${key}" 
                                       name="departments" 
                                       value="${key}"
                                       ${!project.departments || project.departments.includes(key) ? 'checked' : ''}>
                                <label for="dept-modal-${key}">${dept.name}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-field form-field-full">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-textarea" name="description" 
                              placeholder="Descripción detallada del proyecto...">${project.description || ''}</textarea>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="form-btn secondary" onclick="ProjectsMode.closeProjectModal()">
                    Cancelar
                </button>
                <button type="button" class="form-btn secondary" onclick="ProjectsMode.showTemplatesModal()">
                    🎨 Templates
                </button>
                <button type="submit" class="form-btn primary">
                    ${mode === 'create' ? '➕ Crear Proyecto' : '💾 Guardar Cambios'}
                </button>
            </div>
        `;
    },

    saveProject: function(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const departments = Array.from(formData.getAll('departments'));
        
        if (departments.length === 0) {
            this.showNotification('Debe seleccionar al menos un departamento', 'error');
            return;
        }
        
        const projectData = {
            name: formData.get('name'),
            hours: parseInt(formData.get('hours')),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            progress: parseFloat(formData.get('progress')) || 0,
            departments: departments,
            description: formData.get('description') || ''
        };
        
        // Validaciones
        if (new Date(projectData.startDate) >= new Date(projectData.endDate)) {
            this.showNotification('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
            return;
        }
        
        if (this.state.editingProject) {
            // Editar proyecto existente
            const project = this.state.editingProject;
            Object.assign(project, projectData);
            this.showNotification(`Proyecto "${project.name}" actualizado correctamente`, 'success');
        } else {
            // Crear nuevo proyecto
            const newProject = {
                ...projectData,
                id: Date.now(), // ID temporal
            };
            NetberryData.projects.push(newProject);
            this.showNotification(`Proyecto "${newProject.name}" creado correctamente`, 'success');
        }
        
        // Guardar cambios y actualizar vista
        this.saveProjectsToStorage();
        this.applyFilters();
        this.closeProjectModal();
    },

    deleteProject: function(projectId) {
        const project = NetberryData.projects.find(p => p.id === projectId);
        if (!project) return;
        
        if (confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?`)) {
            const index = NetberryData.projects.findIndex(p => p.id === projectId);
            if (index > -1) {
                NetberryData.projects.splice(index, 1);
                this.saveProjectsToStorage();
                this.applyFilters();
                this.showNotification(`Proyecto "${project.name}" eliminado`, 'success');
            }
        }
    },

    duplicateProject: function(projectId) {
        const project = NetberryData.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const duplicatedProject = {
            ...project,
            id: Date.now(),
            name: `${project.name} (Copia)`,
            progress: 0,
            status: 'backlog'
        };
        
        NetberryData.projects.push(duplicatedProject);
        this.saveProjectsToStorage();
        this.applyFilters();
        this.showNotification(`Proyecto duplicado como "${duplicatedProject.name}"`, 'success');
    },

    // === EVENT HANDLING ===
    bindEvents: function() {
        // Search input
        const searchInput = document.getElementById('projectSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.applyFilters(), 300);
            });
        }
        
        // Sort controls
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.state.sortBy = sortSelect.value;
                this.applyFilters();
            });
        }
        
        const sortDirection = document.getElementById('sortDirection');
        if (sortDirection) {
            sortDirection.addEventListener('click', () => this.toggleSortDirection());
        }
        
        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', () => this.toggleSelectAll());
        }
        
        // Progress range inputs
        const progressMin = document.getElementById('progressMin');
        const progressMax = document.getElementById('progressMax');
        if (progressMin && progressMax) {
            [progressMin, progressMax].forEach(input => {
                input.addEventListener('input', () => this.applyFilters());
            });
        }
    },

    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'n':
                        e.preventDefault();
                        this.openCreateProjectModal();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('projectSearch')?.focus();
                        break;
                }
            }
        });
    },

    // === UTILITY FUNCTIONS ===
    renderCurrentView: function() {
        switch (this.state.currentView) {
            case 'list':
                this.renderListView();
                break;
            case 'kanban':
                this.renderKanbanView();
                break;
            case 'timeline':
                this.renderTimelineView();
                break;
        }
    },

    updateProjectCount: function() {
        const projectCount = document.getElementById('projectCount');
        const totalProjects = document.getElementById('totalProjects');
        
        if (projectCount) {
            projectCount.textContent = this.state.filteredProjects.length;
        }
        if (totalProjects) {
            totalProjects.textContent = NetberryData.projects.length;
        }
    },

    updateCurrentView: function(viewName) {
        const currentView = document.getElementById('currentView');
        if (currentView) {
            const viewNames = { list: 'Vista Lista', kanban: 'Vista Kanban', timeline: 'Vista Timeline' };
            currentView.textContent = viewNames[viewName] || viewName;
        }
    },

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
            setTimeout(() => notification.parentNode?.removeChild(notification), 300);
        }, duration);
    },

    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    },

    closeProjectModal: function() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.state.editingProject = null;
    }
};

// === FUNCIONES GLOBALES ===
function goHome() {
    window.location.href = 'index.html';
}

function switchView(viewName) {
    ProjectsMode.switchView(viewName);
}

function filterProjects() {
    ProjectsMode.applyFilters();
}

function clearSearch() {
    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
        searchInput.value = '';
        ProjectsMode.applyFilters();
    }
}

function applyFilters() {
    ProjectsMode.applyFilters();
}

function toggleMultiSelect(type) {
    const dropdown = document.getElementById(`${type}Dropdown`);
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function resetAllFilters() {
    // Reset all filter inputs
    document.getElementById('statusFilter').selectedIndex = 1; // Active
    document.getElementById('priorityFilter').value = '';
    document.getElementById('progressMin').value = 0;
    document.getElementById('progressMax').value = 100;
    document.getElementById('projectSearch').value = '';
    
    // Reset department checkboxes
    document.querySelectorAll('#departmentsDropdown input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });
    
    ProjectsMode.updateDepartmentFilter();
    ProjectsMode.applyFilters();
}

function saveProject(event) {
    ProjectsMode.saveProject(event);
}

function closeProjectModal() {
    ProjectsMode.closeProjectModal();
}

// Exponer para uso global
window.ProjectsMode = ProjectsMode;