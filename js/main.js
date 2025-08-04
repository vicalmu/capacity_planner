// main.js - Archivo principal que inicializa la aplicación

const NetberryApp = {
    // Estado de la aplicación
    state: {
        initialized: false,
        lastUpdate: null,
        autoUpdateEnabled: true
    },

    // Inicializar aplicación
    init: function() {
        if (this.state.initialized) return;

        console.log('🚀 Inicializando Netberry Capacity Planning...');

        // Verificar dependencias
        if (!this.checkDependencies()) {
            console.error('❌ Faltan dependencias requeridas');
            return;
        }

        // Inicializar componentes en orden
        try {
            this.initializeComponents();
            this.setupEventListeners();
            this.startAutoUpdate();
            
            this.state.initialized = true;
            this.state.lastUpdate = new Date();
            
            console.log('✅ Netberry Capacity Planning inicializado correctamente');
            
            

        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.showErrorMessage(error);
        }
    },

    // Verificar que todas las dependencias estén disponibles
    checkDependencies: function() {
        const required = [
            'NetberryData',
            'NetberryUtils', 
            'NetberryComponents',
            'NetberryModal',
            'NetberrySimulator',
            'formatNumber'
        ];

        const missing = required.filter(dep => typeof window[dep] === 'undefined');
        
        if (missing.length > 0) {
            console.error('Dependencias faltantes:', missing);
            return false;
        }

        return true;
    },

    // Inicializar todos los componentes
    initializeComponents: function() {
        console.log('🔧 Inicializando componentes...');

        // 1. Inicializar datos (aplicar formato de números)
        this.validateDataIntegrity();

        // 2. Inicializar componentes UI
        NetberryComponents.init();

        // 3. Inicializar simulador escalable
        NetberrySimulator.init();

        // 4. Inicializar modal
        NetberryModal.init();

        console.log('✅ Todos los componentes inicializados');
    },

    // Validar integridad de datos y formato de números
    validateDataIntegrity: function() {
        console.log('🔍 Validando integridad de datos...');

        let issuesFound = 0;

        // Verificar que todos los números estén formateados correctamente
        Object.values(NetberryData.departments).forEach(dept => {
            // Verificar utilización del departamento
            if (!this.isValidNumber(dept.utilization, 2)) {
                console.warn(`⚠️ Utilización mal formateada en ${dept.name}: ${dept.utilization}`);
                dept.utilization = formatNumber.decimal(dept.utilization);
                issuesFound++;
            }

            // Verificar personas
            dept.people.forEach(person => {
                if (!this.isValidNumber(person.utilization, 2)) {
                    console.warn(`⚠️ Utilización mal formateada para ${person.name}: ${person.utilization}`);
                    person.utilization = formatNumber.decimal(person.utilization);
                    issuesFound++;
                }
            });
        });

        // Verificar proyectos
        NetberryData.projects.forEach(project => {
            if (!this.isValidNumber(project.progress, 2)) {
                console.warn(`⚠️ Progreso mal formateado en ${project.name}: ${project.progress}`);
                project.progress = formatNumber.decimal(project.progress);
                issuesFound++;
            }
        });

        if (issuesFound > 0) {
            console.log(`🔧 Se corrigieron ${issuesFound} problemas de formato numérico`);
        } else {
            console.log('✅ Todos los números están correctamente formateados');
        }
    },

    // Verificar si un número tiene el formato correcto
    isValidNumber: function(num, maxDecimals = 2) {
        if (typeof num !== 'number') return false;
        
        const decimals = (num.toString().split('.')[1] || '').length;
        return decimals <= maxDecimals;
    },

    // Configurar event listeners globales
    setupEventListeners: function() {
        console.log('🎧 Configurando event listeners...');

        // Resize handler para responsive
        window.addEventListener('resize', NetberryUtils.debounce(() => {
            this.handleResize();
        }, 250));

        // Visibility change para pausar actualizaciones
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                NetberryUtils.autoUpdate.stop();
            } else if (this.state.autoUpdateEnabled) {
                NetberryUtils.autoUpdate.start();
            }
        });

        // Error handler global
        window.addEventListener('error', (event) => {
            console.error('Error global capturado:', event.error);
            this.showErrorMessage(event.error);
        });

        console.log('✅ Event listeners configurados');
    },

    // Manejar cambio de tamaño de ventana
    handleResize: function() {
        // Reajustar componentes si es necesario
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Configuración para móvil
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    },

    // Iniciar auto-actualización
    startAutoUpdate: function() {
        if (this.state.autoUpdateEnabled) {
            NetberryUtils.autoUpdate.start();
            console.log('🔄 Auto-actualización iniciada (cada 30 segundos)');
        }
    },

    // Mostrar mensaje de error
    showErrorMessage: function(error) {
        const message = error.message || 'Error desconocido en la aplicación';
        NetberryUtils.notifications.show(
            `Error: ${message}. Consulta la consola para más detalles.`,
            'error',
            5000
        );
    },

    // Métodos de utilidad para debug
    debug: {
        // Mostrar estado actual
        showState: function() {
            console.log('📊 Estado actual de Netberry:', {
                initialized: NetberryApp.state.initialized,
                lastUpdate: NetberryApp.state.lastUpdate,
                autoUpdate: NetberryApp.state.autoUpdateEnabled,
                activeFilters: NetberryUtils.activeFilters,
                currentDepartment: NetberryModal.currentDepartment
            });
        },

        // Verificar formato de números
        checkNumberFormats: function() {
            console.log('🔢 Verificando formato de números...');
            
            Object.entries(NetberryData.departments).forEach(([key, dept]) => {
                console.log(`${dept.name}: ${dept.utilization}% (${typeof dept.utilization})`);
                
                dept.people.forEach(person => {
                    const decimals = (person.utilization.toString().split('.')[1] || '').length;
                    if (decimals > 2) {
                        console.warn(`❌ ${person.name}: ${person.utilization}% (${decimals} decimales)`);
                    }
                });
            });
        },

        // Simular datos de prueba
        simulateData: function() {
            console.log('🧪 Simulando datos de prueba...');
            
            // Cambiar algunas utilizaciones para probar
            Object.values(NetberryData.departments).forEach(dept => {
                const oldUtil = dept.utilization;
                dept.utilization = formatNumber.decimal(Math.random() * 100);
                console.log(`${dept.name}: ${oldUtil}% → ${dept.utilization}%`);
            });
            
            // Actualizar UI
            NetberryComponents.updateAll();
            
            NetberryUtils.notifications.show('Datos de prueba aplicados', 'info');
        },

        // Resetear datos originales
        resetData: function() {
            location.reload();
        }
    },

    // Métodos públicos para control de la aplicación
    toggleAutoUpdate: function() {
        this.state.autoUpdateEnabled = !this.state.autoUpdateEnabled;
        
        if (this.state.autoUpdateEnabled) {
            NetberryUtils.autoUpdate.start();
            NetberryUtils.notifications.show('Auto-actualización activada', 'success');
        } else {
            NetberryUtils.autoUpdate.stop();
            NetberryUtils.notifications.show('Auto-actualización desactivada', 'info');
        }
    },

    // Forzar actualización manual
    forceUpdate: function() {
        console.log('🔄 Forzando actualización manual...');
        NetberryComponents.updateAll();
        this.state.lastUpdate = new Date();
        NetberryUtils.notifications.show('Dashboard actualizado manualmente', 'success');
    },

    // Exportar datos completos
    exportAllData: function() {
        const exportData = {
            timestamp: new Date().toISOString(),
            departments: NetberryData.departments,
            projects: NetberryData.projects,
            activeFilters: NetberryUtils.activeFilters,
            summary: {
                totalCapacity: NetberryData.calculations.getTotalCapacity(),
                averageUtilization: NetberryData.calculations.getAverageUtilization(),
                criticalDepartments: NetberryData.calculations.getCriticalDepartments()
            }
        };

        NetberryUtils.export.toJSON(exportData, 'netberry_dashboard_complete.json');
        NetberryUtils.notifications.show('Datos completos exportados', 'success');
    }
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Pequeño delay para asegurar que todos los scripts estén cargados
    setTimeout(() => {
        NetberryApp.init();
    }, 100);
});

// Exponer funciones útiles globalmente para debug
window.Netberry = {
    app: NetberryApp,
    debug: NetberryApp.debug,
    forceUpdate: () => NetberryApp.forceUpdate(),
    toggleAutoUpdate: () => NetberryApp.toggleAutoUpdate(),
    exportData: () => NetberryApp.exportAllData()
};

// Mensaje de consola para desarrolladores
console.log(`
🧡 Netberry Capacity Planning Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Funciones disponibles en consola:
• Netberry.debug.showState() - Ver estado actual
• Netberry.debug.checkNumberFormats() - Verificar decimales
• Netberry.forceUpdate() - Actualizar manualmente
• Netberry.toggleAutoUpdate() - Activar/desactivar auto-actualización
• Netberry.exportData() - Exportar todos los datos

Atajos de teclado:
• ESC - Cerrar modal
• Ctrl+F - Enfocar filtros
• Ctrl+S - Simular proyecto
• Ctrl+R - Resetear filtros
• ← → - Navegar entre departamentos en modal
• Ctrl+E - Exportar datos del departamento

🔧 Bugs solucionados:
✅ Números limitados a 2 decimales máximo
✅ Simulador escalable para N departamentos
✅ Arquitectura modular optimizada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Exportar para uso global
window.NetberryApp = NetberryApp;