// gantt-controller.js - Controlador específico para el Modo Gantt

const GanttMode = {
    // Estado del modo
    state: {
        initialized: false,
        predictions: false,
        criticalAlerts: [],
        currentHealthScore: 87
    },

    // === INICIALIZACIÓN ===
    init: function() {
        console.log('🎯 Inicializando Modo Gantt...');
        
        this.setupGanttMode();
        this.renderSmartAlerts();
        this.renderAIRecommendations();
        this.updateHealthScore();
        this.bindEvents();
        
        // Inicializar componentes base
        if (typeof NetberryComponents !== 'undefined') {
            NetberryComponents.init();
        }
        
        this.state.initialized = true;
        console.log('✅ Modo Gantt inicializado correctamente');
    },

    // === CONFIGURACIÓN ESPECÍFICA DEL MODO ===
    setupGanttMode: function() {
        // Actualizar indicadores
        this.updateModeIndicators();
        
        // Configurar alerts banner
        this.checkCriticalCapacity();
        
        // Configurar temas visuales específicos
        document.documentElement.style.setProperty('--mode-color', '#1e40af');
        
        // Keyboard shortcuts específicos del modo
        this.setupGanttKeyboardShortcuts();
    },

    updateModeIndicators: function() {
        const breadcrumbs = document.querySelector('.breadcrumbs');
        if (breadcrumbs) {
            breadcrumbs.classList.add('gantt-mode');
        }
    },

    // === SMART ALERTS ===
    renderSmartAlerts: function() {
        const container = document.getElementById('smartAlerts');
        if (!container) return;

        const alerts = this.generateSmartAlerts();
        
        container.innerHTML = alerts.map(alert => `
            <div class="smart-alert ${alert.type}">
                <div class="alert-content">
                    <span class="alert-icon">${alert.icon}</span>
                    <span class="alert-text">${alert.message}</span>
                </div>
                <div class="alert-actions">
                    ${alert.actions.map(action => `
                        <button class="alert-action" onclick="${action.handler}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Animar entrada
        this.animateAlertsEntrance();
    },

    generateSmartAlerts: function() {
        const alerts = [];
        
        // Verificar departamentos críticos
        const criticalDepts = NetberryData.calculations.getCriticalDepartments(90);
        if (criticalDepts.length > 0) {
            alerts.push({
                type: 'critical',
                icon: '🔴',
                message: `CRÍTICO: ${criticalDepts[0].name} al ${criticalDepts[0].utilization}% - Contratación urgente recomendada`,
                actions: [
                    { label: 'Ver Plan', handler: 'GanttMode.showHiringPlan()' },
                    { label: 'Simular', handler: 'GanttMode.openSimulator()' }
                ]
            });
        }

        // Oportunidades de capacidad
        const availableDepts = Object.entries(NetberryData.departments)
            .filter(([key, dept]) => dept.utilization < 70)
            .sort((a, b) => a[1].utilization - b[1].utilization);

        if (availableDepts.length > 0) {
            const dept = availableDepts[0][1];
            alerts.push({
                type: 'opportunity',
                icon: '🟢',
                message: `OPORTUNIDAD: ${dept.name} con ${(100 - dept.utilization).toFixed(1)}% capacidad libre - Puede absorber nuevos proyectos`,
                actions: [
                    { label: 'Asignar Trabajo', handler: 'GanttMode.assignWork()' },
                    { label: 'Ver Detalles', handler: `NetberryModal.show('${availableDepts[0][0]}')` }
                ]
            });
        }

        // Predicción de capacidad
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: 'PREDICCIÓN: Con las tendencias actuales, necesitarás 2 desarrolladores PHP en Q4 2025',
            actions: [
                { label: 'Ver Predicción', handler: 'GanttMode.togglePredictions()' },
                { label: 'Planificar', handler: 'GanttMode.openHiringPlanner()' }
            ]
        });

        return alerts;
    },

    animateAlertsEntrance: function() {
        const alerts = document.querySelectorAll('.smart-alert');
        alerts.forEach((alert, index) => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(-100px)';
            
            setTimeout(() => {
                alert.style.transition = 'all 0.5s ease-out';
                alert.style.opacity = '1';
                alert.style.transform = 'translateX(0)';
            }, index * 150);
        });
    },

    // === AI RECOMMENDATIONS ===
    renderAIRecommendations: function() {
        const container = document.getElementById('aiRecommendations');
        if (!container) return;

        const recommendations = this.generateAIRecommendations();
        
        const listContainer = container.querySelector('.recommendations-list');
        if (listContainer) {
            listContainer.innerHTML = recommendations.map(rec => `
                <div class="recommendation-item">
                    <div class="recommendation-content">
                        <span class="recommendation-icon">${rec.icon}</span>
                        <span class="recommendation-text">${rec.text}</span>
                    </div>
                    <button class="recommendation-action" onclick="${rec.action}">
                        ${rec.actionLabel}
                    </button>
                </div>
            `).join('');
        }

        // Actualizar confianza
        this.updateAIConfidence();
    },

    generateAIRecommendations: function() {
        return [
            {
                icon: '🔄',
                text: 'Mover 120h del proyecto E-commerce de PHP a .NET reduciría riesgo general un 15%',
                action: 'GanttMode.suggestResourceReallocation()',
                actionLabel: 'Aplicar'
            },
            {
                icon: '👥',
                text: 'Contratar 1 DevOps Senior incrementaría capacidad global un 12%',
                action: 'GanttMode.showHiringImpact()',
                actionLabel: 'Ver ROI'
            },
            {
                icon: '📅',
                text: 'Retrasar proyecto Portal Corporativo 2 semanas optimizaría utilización Q3',
                action: 'GanttMode.showScheduleOptimization()',
                actionLabel: 'Simular'
            },
            {
                icon: '⚡',
                text: 'Implementar automatización CI/CD liberaría 200h/mes en DevOps',
                action: 'GanttMode.showAutomationROI()',
                actionLabel: 'Evaluar'
            }
        ];
    },

    updateAIConfidence: function() {
        const confidence = document.querySelector('.ai-confidence');
        if (confidence) {
            const scores = [91, 94, 88, 92, 89];
            const randomScore = scores[Math.floor(Math.random() * scores.length)];
            confidence.textContent = `Confianza: ${randomScore}%`;
            
            // Color coding
            confidence.style.background = randomScore >= 90 ? '#10b981' : 
                                        randomScore >= 85 ? '#f59e0b' : '#ef4444';
        }
    },

    // === HEALTH SCORE ===
    updateHealthScore: function() {
        const healthNumber = document.getElementById('healthScoreNumber');
        const healthTrend = document.getElementById('healthTrend');
        
        if (healthNumber) {
            const score = this.calculateHealthScore();
            healthNumber.textContent = score;
            healthNumber.style.color = score >= 90 ? '#10b981' : 
                                     score >= 80 ? '#f59e0b' : '#ef4444';
            this.state.currentHealthScore = score;
        }

        if (healthTrend) {
            const trends = ['↗ +3 esta semana', '↘ -2 esta semana', '→ Estable', '↗ +5 este mes'];
            healthTrend.textContent = trends[Math.floor(Math.random() * trends.length)];
        }
    },

    calculateHealthScore: function() {
        // Algoritmo simplificado de Health Score
        const departments = Object.values(NetberryData.departments);
        const avgUtil = departments.reduce((sum, dept) => sum + dept.utilization, 0) / departments.length;
        
        // Penalizar por sobreutilización y subutilización
        let score = 100;
        
        departments.forEach(dept => {
            if (dept.utilization > 95) {
                score -= (dept.utilization - 95) * 2; // Penalización fuerte
            } else if (dept.utilization < 60) {
                score -= (60 - dept.utilization) * 0.5; // Penalización leve
            }
        });
        
        // Bonus por balance
        const utilRange = Math.max(...departments.map(d => d.utilization)) - 
                         Math.min(...departments.map(d => d.utilization));
        if (utilRange < 20) score += 5; // Bonus por balance
        
        return Math.max(65, Math.min(100, Math.round(score)));
    },

    // === CAPACITY CHECKS ===
    checkCriticalCapacity: function() {
        const banner = document.getElementById('alertBanner');
        if (!banner) return;

        const criticalDepts = NetberryData.calculations.getCriticalDepartments(90);
        
        if (criticalDepts.length > 0) {
            const dept = criticalDepts[0];
            banner.innerHTML = `🚨 ATENCIÓN: ${dept.name} al ${dept.utilization.toFixed(1)}% de capacidad - Acción requerida`;
            banner.style.display = 'block';
        } else {
            banner.style.display = 'none';
        }
    },

    // === EVENT HANDLERS ===
    bindEvents: function() {
        // Actualización automática cada 30 segundos
        setInterval(() => {
            this.updateHealthScore();
            this.checkCriticalCapacity();
        }, 30000);

        // Event listeners específicos del modo
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    },

    setupGanttKeyboardShortcuts: function() {
        // Shortcuts específicos del Gantt
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key.toLowerCase()) {
                    case 'f':
                        e.preventDefault();
                        this.focusFilters();
                        break;
                    case 'e':
                        e.preventDefault();
                        exportGanttPDF();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshData();
                        break;
                }
            }
        });
    },

    handleKeyboardShortcuts: function(e) {
        // Manejo centralizado de shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'k':
                    e.preventDefault();
                    this.openCommandPalette();
                    break;
            }
        }
    },

    // === FILTER ACTIONS ===
    focusFilters: function() {
        const firstFilter = document.querySelector('.filter-btn');
        if (firstFilter) {
            firstFilter.focus();
        }
    },

    // === QUICK ACTIONS ===
    showCriticalOnly: function() {
        const criticalDepts = NetberryData.calculations.getCriticalDepartments(85);
        const criticalKeys = criticalDepts.map(d => d.key);
        
        // Actualizar filtros activos
        NetberryUtils.activeFilters = criticalKeys.length > 0 ? criticalKeys : ['all'];
        
        // Re-render components
        NetberryComponents.updateAll();
        
        // Update UI
        this.updateFilterButtons();
        this.updateBreadcrumbs('Solo Departamentos Críticos');
    },

    showAvailable: function() {
        const availableDepts = Object.entries(NetberryData.departments)
            .filter(([key, dept]) => dept.utilization < 80)
            .map(([key]) => key);
        
        NetberryUtils.activeFilters = availableDepts.length > 0 ? availableDepts : ['all'];
        NetberryComponents.updateAll();
        this.updateFilterButtons();
        this.updateBreadcrumbs('Departamentos Disponibles');
    },

    showAll: function() {
        NetberryUtils.activeFilters = ['all'];
        NetberryComponents.updateAll();
        this.updateFilterButtons();
        this.updateBreadcrumbs('Todos los Departamentos');
    },

    updateFilterButtons: function() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            const dept = btn.getAttribute('data-dept');
            if (NetberryUtils.activeFilters.includes(dept) || 
                (NetberryUtils.activeFilters.includes('all') && dept === 'all')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    updateBreadcrumbs: function(filterText) {
        const currentFilter = document.getElementById('currentFilter');
        if (currentFilter) {
            currentFilter.textContent = filterText;
        }
    },

    // === GANTT ACTIONS ===
    exportGanttPDF: function() {
        console.log('📄 Exportando Gantt a PDF...');
        // Implementación futura de exportación
        this.showNotification('Función de exportación en desarrollo', 'info');
    },

    togglePredictions: function() {
        this.state.predictions = !this.state.predictions;
        
        const btn = document.querySelector('[onclick="togglePredictions()"]');
        if (btn) {
            btn.textContent = this.state.predictions ? '🔮 Ocultar Predicciones' : '🔮 Ver Predicciones';
        }
        
        console.log('🔮 Predicciones:', this.state.predictions ? 'ACTIVADAS' : 'DESACTIVADAS');
        this.showNotification(
            this.state.predictions ? 'Predicciones activadas' : 'Predicciones desactivadas',
            'success'
        );
    },

    refreshData: function() {
        console.log('🔄 Refrescando datos...');
        this.updateHealthScore();
        this.renderSmartAlerts();
        this.renderAIRecommendations();
        NetberryComponents.updateAll();
        this.showNotification('Datos actualizados', 'success');
    },

    // === AI RECOMMENDATION ACTIONS ===
    suggestResourceReallocation: function() {
        console.log('🔄 Abriendo sugerencias de reasignación...');
        this.showNotification('Analizando reasignación óptima de recursos...', 'info');
        // Implementación futura
    },

    showHiringImpact: function() {
        console.log('👥 Mostrando impacto de contratación...');
        this.showNotification('Calculando ROI de nuevas contrataciones...', 'info');
        // Implementación futura
    },

    showScheduleOptimization: function() {
        console.log('📅 Abriendo optimización de cronograma...');
        this.showNotification('Analizando optimizaciones de cronograma...', 'info');
        // Implementación futura
    },

    showAutomationROI: function() {
        console.log('⚡ Mostrando ROI de automatización...');
        this.showNotification('Calculando impacto de automatización...', 'info');
        // Implementación futura
    },

    openSimulator: function() {
        const simulatorBtn = document.getElementById('simulatorHeaderBtn');
        if (simulatorBtn) {
            simulatorBtn.click();
        }
    },

    // === ALERT ACTIONS ===
    showHiringPlan: function() {
        console.log('📋 Abriendo plan de contratación...');
        this.showNotification('Generando plan de contratación inteligente...', 'info');
        // Implementación futura: modal con plan detallado
    },

    assignWork: function() {
        console.log('📋 Abriendo asignación de trabajo...');
        this.showNotification('Preparando asignación inteligente de trabajo...', 'info');
        // Implementación futura: modal de asignación
    },

    openHiringPlanner: function() {
        console.log('👥 Abriendo planificador de contrataciones...');
        this.showNotification('Iniciando planificador de RRHH...', 'info');
        // Implementación futura
    },

    // === UTILITY FUNCTIONS ===
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

    openCommandPalette: function() {
        console.log('⌘ Abriendo paleta de comandos...');
        this.showNotification('Función de comando palette en desarrollo', 'info');
        // Implementación futura: modal con búsqueda de acciones
    }
};

// === FUNCIONES GLOBALES PARA COMPATIBILITY ===
function goHome() {
    window.location.href = 'index.html';
}

function showCriticalOnly() {
    GanttMode.showCriticalOnly();
}

function showAvailable() {
    GanttMode.showAvailable();
}

function showAll() {
    GanttMode.showAll();
}

function exportGanttPDF() {
    GanttMode.exportGanttPDF();
}

function togglePredictions() {
    GanttMode.togglePredictions();
}

// Exponer para uso global
window.GanttMode = GanttMode;