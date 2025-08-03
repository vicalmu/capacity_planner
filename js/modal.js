// modal.js - Componente modal para vista detallada

const NetberryModal = {
    currentDepartment: null,

    // Mostrar modal con detalle del departamento
    show: function(deptKey) {
        const dept = NetberryData.departments[deptKey];
        if (!dept) return;

        const modal = document.getElementById('departmentModal');
        if (!modal) return;

        // Actualizar header del modal
        document.getElementById('modalTitle').textContent = `Departamento ${dept.name}`;
        document.getElementById('modalSubtitle').textContent = 
            `${dept.people.length} personas • ${dept.projects} proyectos activos • ${formatNumber.percentage(dept.utilization)} utilización`;

        // Calcular estadísticas del departamento
        this.renderStats(dept);
        this.renderPeople(dept);

        // Mostrar modal
        modal.style.display = 'block';
        this.currentDepartment = deptKey;

        // Agregar clase al body para prevenir scroll
        document.body.style.overflow = 'hidden';
    },

    // Renderizar estadísticas del departamento
    renderStats: function(dept) {
        const statsContainer = document.getElementById('modalStats');
        if (!statsContainer) return;

        const availableHours = formatNumber.decimal(dept.capacity * (1 - dept.utilization / 100));
        const utilizationColor = NetberryUtils.getUtilizationColor(dept.utilization);

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value" style="color: var(--primary-orange);">
                    ${formatNumber.hours(dept.capacity)}
                </div>
                <div class="stat-label">Capacidad Total (Q3)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: ${utilizationColor};">
                    ${formatNumber.percentage(dept.utilization)}
                </div>
                <div class="stat-label">Utilización Actual</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: var(--success);">
                    ${formatNumber.hours(availableHours)}
                </div>
                <div class="stat-label">Horas Disponibles</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: #3b82f6;">
                    ${dept.projects}
                </div>
                <div class="stat-label">Proyectos Activos</div>
            </div>
        `;
    },

    // Renderizar grid de personas
    renderPeople: function(dept) {
        const peopleContainer = document.getElementById('peopleGrid');
        if (!peopleContainer) return;

        // Ordenar personas por utilización (mayor a menor)
        const sortedPeople = [...dept.people].sort((a, b) => b.utilization - a.utilization);

        peopleContainer.innerHTML = sortedPeople.map(person => {
            const utilizationColor = NetberryUtils.getUtilizationColor(person.utilization);
            const utilizationClass = NetberryUtils.getUtilizationClass(person.utilization);

            return `
                <div class="person-card ${utilizationClass}" 
                     onclick="NetberryModal.showPersonDetail('${person.name}', '${dept.name}')">
                    <div class="person-name">${person.name}</div>
                    <div class="person-role">${person.role}</div>
                    <div class="person-utilization">
                        <div class="util-bar">
                            <div class="util-fill" style="
                                background: ${utilizationColor};
                                width: ${person.utilization}%;
                            "></div>
                        </div>
                        <span style="font-weight: 600; color: ${utilizationColor};">
                            ${formatNumber.percentage(person.utilization)}
                        </span>
                    </div>
                    <div class="person-projects">
                        <strong>Proyectos asignados:</strong><br>
                        ${person.projects.map(p => `• ${p}`).join('<br>')}
                    </div>
                    <div class="person-status">
                        <span class="status-badge ${utilizationClass}">
                            ${this.getPersonStatus(person.utilization)}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        this.addPersonCardStyles();
    },

    // Obtener estado de la persona
    getPersonStatus: function(utilization) {
        if (utilization >= 95) return 'Saturado';
        if (utilization >= 85) return 'Límite';
        if (utilization >= 70) return 'Ocupado';
        return 'Disponible';
    },

    // Mostrar detalle de persona (funcionalidad adicional)
    showPersonDetail: function(personName, deptName) {
        const dept = NetberryData.departments[this.currentDepartment];
        const person = dept.people.find(p => p.name === personName);
        
        if (!person) return;

        // Crear modal pequeño o tooltip con más información
        NetberryUtils.notifications.show(
            `${person.name} (${person.role}): ${formatNumber.percentage(person.utilization)} utilización - ${person.projects.length} proyectos activos`,
            person.utilization >= 95 ? 'error' : person.utilization >= 85 ? 'warning' : 'info'
        );
    },

    // Cerrar modal
    close: function() {
        const modal = document.getElementById('departmentModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        this.currentDepartment = null;
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
    },

    // Añadir estilos adicionales para las tarjetas de personas
    addPersonCardStyles: function() {
        if (document.getElementById('person-card-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'person-card-styles';
        styles.textContent = `
            .person-card {
                position: relative;
                transition: all 0.3s ease;
            }
            
            .person-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.15);
            }
            
            .person-card.critical {
                border-color: #fca5a5;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }
            
            .person-card.warning {
                border-color: #fcd34d;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }
            
            .person-card.good {
                border-color: #86efac;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }
            
            .person-status {
                position: absolute;
                top: 15px;
                right: 15px;
            }
            
            .status-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-badge.critical {
                background: #fee2e2;
                color: #dc2626;
                border: 1px solid #fca5a5;
            }
            
            .status-badge.warning {
                background: #fef3c7;
                color: #d97706;
                border: 1px solid #fcd34d;
            }
            
            .status-badge.good {
                background: #dcfce7;
                color: #16a34a;
                border: 1px solid #86efac;
            }
            
            .person-projects {
                margin-top: 12px;
                font-size: 12px;
                line-height: 1.4;
            }
            
            .person-projects strong {
                color: #374151;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .util-bar {
                position: relative;
                overflow: hidden;
            }
            
            .util-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
                animation: shimmer 2s infinite;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `;

        document.head.appendChild(styles);
    },

    // Exportar datos del departamento
    exportDepartmentData: function() {
        if (!this.currentDepartment) return;

        const dept = NetberryData.departments[this.currentDepartment];
        const exportData = {
            departamento: dept.name,
            capacidad_total: dept.capacity,
            utilizacion_actual: dept.utilization,
            proyectos_activos: dept.projects,
            personas: dept.people.map(person => ({
                nombre: person.name,
                rol: person.role,
                utilizacion: person.utilization,
                proyectos: person.projects.join(', ')
            }))
        };

        NetberryUtils.export.toJSON(exportData, `departamento_${dept.name.toLowerCase()}.json`);
        NetberryUtils.notifications.show(`Datos del departamento ${dept.name} exportados`, 'success');
    },

    // Navegar entre departamentos en el modal
    navigateDepartment: function(direction) {
        const deptKeys = Object.keys(NetberryData.departments);
        const currentIndex = deptKeys.indexOf(this.currentDepartment);
        
        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % deptKeys.length;
        } else {
            newIndex = currentIndex === 0 ? deptKeys.length - 1 : currentIndex - 1;
        }
        
        this.show(deptKeys[newIndex]);
    },

    // Inicializar eventos del modal
    init: function() {
        // Cerrar modal al hacer clic fuera
        window.onclick = function(event) {
            const modal = document.getElementById('departmentModal');
            if (event.target === modal) {
                NetberryModal.close();
            }
        };

        // Navegación con teclado en el modal
        document.addEventListener('keydown', function(e) {
            if (NetberryModal.currentDepartment) {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    NetberryModal.navigateDepartment('next');
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    NetberryModal.navigateDepartment('prev');
                } else if (e.key === 'e' && e.ctrlKey) {
                    e.preventDefault();
                    NetberryModal.exportDepartmentData();
                }
            }
        });
    }
};

// Inicializar modal al cargar
document.addEventListener('DOMContentLoaded', function() {
    NetberryModal.init();
});

// Exportar para uso global
window.NetberryModal = NetberryModal;