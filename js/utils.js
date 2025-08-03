// utils.js - Utilidades generales

const NetberryUtils = {
    // Gestión de filtros activos
    activeFilters: ['all'],

    // Obtener clase de utilización
    getUtilizationClass: function(util) {
        if (util >= 95) return 'critical';
        if (util >= 85) return 'warning';
        return 'good';
    },

    getUtilizationRingClass: function(util) {
        if (util >= 95) return 'util-critical';
        if (util >= 85) return 'util-warning';
        return 'util-good';
    },

    getUtilizationStatus: function(util) {
        if (util >= 95) return 'Saturado';
        if (util >= 85) return 'Límite';
        return 'Disponible';
    },

    getUtilizationColor: function(util) {
        if (util >= 95) return '#ef4444';
        if (util >= 85) return '#f59e0b';
        return '#10b981';
    },

    // Obtener color de progreso
    getProgressColor: function(progress) {
        if (progress >= 70) return '#3b82f6';
        if (progress >= 50) return '#f59e0b';
        if (progress >= 30) return '#8b5cf6';
        return '#10b981';
    },

    // Gestión de animaciones
    animateElements: function(selector, delay = 100) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * delay);
        });
    },

    // Debounce para optimizar rendimiento
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Gestión de localStorage/sessionStorage (NO USAR en Claude.ai)
    // En su lugar, usar almacenamiento en memoria
    storage: {
        data: {},
        
        setItem: function(key, value) {
            this.data[key] = JSON.stringify(value);
        },
        
        getItem: function(key) {
            const item = this.data[key];
            return item ? JSON.parse(item) : null;
        },
        
        removeItem: function(key) {
            delete this.data[key];
        },
        
        clear: function() {
            this.data = {};
        }
    },

    // Validaciones
    validators: {
        isPositiveNumber: function(value) {
            return !isNaN(value) && parseFloat(value) > 0;
        },
        
        isValidEmail: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        isNotEmpty: function(value) {
            return value && value.toString().trim().length > 0;
        },
        
        isValidHours: function(hours, maxHours) {
            return this.isPositiveNumber(hours) && parseFloat(hours) <= maxHours;
        }
    },

    // Gestión de eventos del teclado
    keyboard: {
        init: function() {
            document.addEventListener('keydown', function(e) {
                // ESC para cerrar modal
                if (e.key === 'Escape') {
                    NetberryModal.close();
                }
                
                // Ctrl+F para enfocar filtros
                if (e.ctrlKey && e.key === 'f') {
                    e.preventDefault();
                    const firstFilter = document.querySelector('.filter-btn');
                    if (firstFilter) firstFilter.focus();
                }
                
                // Ctrl+S para simular (cuando esté en simulador)
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    const simulatorVisible = document.querySelector('.simulator-card');
                    if (simulatorVisible && typeof NetberrySimulator !== 'undefined') {
                        NetberrySimulator.simulate();
                    }
                }
                
                // Ctrl+R para reset
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    NetberryComponents.filters.clearAll();
                }
            });
        }
    },

    // Auto-actualización simulada
    autoUpdate: {
        interval: null,
        
        start: function() {
            this.interval = setInterval(() => {
                // Simular pequeños cambios en utilización
                Object.keys(NetberryData.departments).forEach(deptKey => {
                    const dept = NetberryData.departments[deptKey];
                    const change = (Math.random() - 0.5) * 2; // ±1%
                    dept.utilization = formatNumber.decimal(
                        Math.max(0, Math.min(100, dept.utilization + change))
                    );
                });
                
                // Solo actualizar si no hay modal abierto
                if (!document.getElementById('departmentModal').style.display === 'block') {
                    NetberryComponents.kpis.update();
                    NetberryComponents.departments.render();
                }
            }, 30000); // Cada 30 segundos
        },
        
        stop: function() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    },

    // Notificaciones toast
    notifications: {
        show: function(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `toast-notification toast-${type}`;
            notification.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${this.getIcon(type)}</span>
                    <span class="toast-message">${message}</span>
                </div>
            `;
            
            // Agregar estilos si no existen
            this.addStyles();
            
            document.body.appendChild(notification);
            
            // Mostrar con animación
            setTimeout(() => notification.classList.add('show'), 100);
            
            // Ocultar después del tiempo especificado
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        },
        
        getIcon: function(type) {
            const icons = {
                info: 'ℹ️',
                success: '✅',
                warning: '⚠️',
                error: '❌'
            };
            return icons[type] || icons.info;
        },
        
        addStyles: function() {
            if (document.getElementById('toast-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    z-index: 1000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                }
                
                .toast-notification.show {
                    transform: translateX(0);
                }
                
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                }
                
                .toast-icon {
                    font-size: 20px;
                }
                
                .toast-message {
                    font-weight: 500;
                    color: #374151;
                }
                
                .toast-info {
                    border-left: 4px solid #3b82f6;
                }
                
                .toast-success {
                    border-left: 4px solid #10b981;
                }
                
                .toast-warning {
                    border-left: 4px solid #f59e0b;
                }
                
                .toast-error {
                    border-left: 4px solid #ef4444;
                }
            `;
            
            document.head.appendChild(styles);
        }
    },

    // Formateo de fechas
    dateUtils: {
        formatDate: function(date, format = 'DD/MM/YYYY') {
            if (!(date instanceof Date)) return '';
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return format
                .replace('DD', day)
                .replace('MM', month)
                .replace('YYYY', year);
        },
        
        addMonths: function(date, months) {
            const result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result;
        },
        
        getQuarter: function(date) {
            const month = date.getMonth() + 1;
            return Math.ceil(month / 3);
        },
        
        getQuarterLabel: function(date) {
            const quarter = this.getQuarter(date);
            const year = date.getFullYear();
            return `Q${quarter} ${year}`;
        }
    },

    // Exportar datos
    export: {
        toCSV: function(data, filename = 'netberry_data.csv') {
            const csv = this.arrayToCSV(data);
            this.downloadFile(csv, filename, 'text/csv');
        },
        
        toJSON: function(data, filename = 'netberry_data.json') {
            const json = JSON.stringify(data, null, 2);
            this.downloadFile(json, filename, 'application/json');
        },
        
        arrayToCSV: function(array) {
            if (!array || array.length === 0) return '';
            
            const headers = Object.keys(array[0]).join(',');
            const rows = array.map(row => 
                Object.values(row).map(value => 
                    typeof value === 'string' ? `"${value}"` : value
                ).join(',')
            );
            
            return [headers, ...rows].join('\n');
        },
        
        downloadFile: function(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
        }
    }
};

// Inicializar utilidades al cargar
document.addEventListener('DOMContentLoaded', function() {
    NetberryUtils.keyboard.init();
});

// Exportar para uso global
window.NetberryUtils = NetberryUtils;