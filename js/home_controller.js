// home-controller.js - Controlador para la página Home de selección de modos

// === CONFIGURACIÓN GLOBAL ===
const APP_CONFIG = {
    autoRedirectDelay: 3000, // 3 segundos
    defaultMode: 'gantt',
    modes: {
        gantt: {
            url: 'gantt.html',
            color: '#1e40af',
            name: 'Gantt'
        },
        projects: {
            url: 'projects.html', 
            color: '#059669',
            name: 'Proyectos'
        },
        simulator: {
            url: 'simulator.html',
            color: '#dc2626',
            name: 'Simulador'
        }
    }
};

// === VARIABLES GLOBALES ===
let autoRedirectTimer = null;
let countdownInterval = null;
let hasUserInteracted = false;

// === HEALTH SCORE SIMULATION ===
function updateHealthScore() {
    const healthScore = document.getElementById('healthScore');
    if (!healthScore) return;
    
    // Simular score basado en datos reales del sistema
    const scores = [87, 91, 85, 89, 93, 84, 88, 92];
    const randomScore = scores[Math.floor(Math.random() * scores.length)];
    
    healthScore.textContent = randomScore;
    healthScore.style.color = randomScore >= 90 ? '#10b981' : 
                            randomScore >= 80 ? '#f59e0b' : '#ef4444';
}

// === SELECCIÓN DE MODO ===
function selectMode(mode) {
    if (!APP_CONFIG.modes[mode]) {
        console.error('Modo no válido:', mode);
        return;
    }
    
    hasUserInteracted = true;
    clearAutoRedirect();
    
    // Animación de selección
    const selectedCard = document.querySelector(`.mode-card.${mode}`);
    if (selectedCard) {
        selectedCard.style.transform = 'scale(1.1)';
        selectedCard.style.boxShadow = `0 25px 50px ${APP_CONFIG.modes[mode].color}40`;
    }
    
    // Guardar preferencia y analytics
    saveUserPreference(mode);
    trackModeSelection(mode);
    
    // Redirect con delay para animación
    setTimeout(() => {
        window.location.href = APP_CONFIG.modes[mode].url;
    }, 500);
}

// === GESTIÓN DE PREFERENCIAS ===
function saveUserPreference(mode) {
    try {
        localStorage.setItem('netberry_last_mode', mode);
        localStorage.setItem('netberry_mode_timestamp', Date.now());
        localStorage.setItem('netberry_mode_count', 
            parseInt(localStorage.getItem('netberry_mode_count') || '0') + 1
        );
    } catch (e) {
        console.warn('No se pudo guardar la preferencia:', e);
    }
}

function loadUserPreferences() {
    try {
        const lastMode = localStorage.getItem('netberry_last_mode');
        const timestamp = localStorage.getItem('netberry_mode_timestamp');
        
        if (lastMode && timestamp) {
            const hoursSinceLastUse = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
            
            // Si fue usado en las últimas 24 horas, destacar el último modo
            if (hoursSinceLastUse < 24) {
                highlightLastUsedMode(lastMode);
            }
        }
        
        return lastMode;
    } catch (e) {
        console.warn('No se pudieron cargar las preferencias:', e);
        return null;
    }
}

function highlightLastUsedMode(mode) {
    const lastModeCard = document.querySelector(`.mode-card.${mode}`);
    if (!lastModeCard) return;
    
    lastModeCard.style.border = '3px solid #ff6b35';
    lastModeCard.style.background = 'linear-gradient(135deg, #ffffff 0%, #fff5f0 100%)';
    
    // Agregar indicador de "último usado"
    const indicator = document.createElement('div');
    indicator.innerHTML = '⭐ Último usado';
    indicator.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: #ff6b35;
        color: white;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        z-index: 10;
    `;
    lastModeCard.style.position = 'relative';
    lastModeCard.appendChild(indicator);
}

// === SISTEMA AUTO-REDIRECT ===
function startAutoRedirect() {
    if (hasUserInteracted) return;
    
    // Mostrar countdown después de 1 segundo
    setTimeout(() => {
        if (!hasUserInteracted) {
            showCountdown();
        }
    }, 1000);
}

function showCountdown() {
    const countdownContainer = document.getElementById('countdownContainer');
    const countdownNumber = document.getElementById('countdownNumber');
    
    if (!countdownContainer || !countdownNumber) return;
    
    countdownContainer.style.display = 'block';
    let seconds = 3;
    
    countdownInterval = setInterval(() => {
        seconds--;
        countdownNumber.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(countdownInterval);
            // Usar el último modo usado o el modo por defecto
            const lastMode = localStorage.getItem('netberry_last_mode') || APP_CONFIG.defaultMode;
            selectMode(lastMode);
        }
    }, 1000);
}

function clearAutoRedirect() {
    if (autoRedirectTimer) {
        clearTimeout(autoRedirectTimer);
        autoRedirectTimer = null;
    }
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    const countdownContainer = document.getElementById('countdownContainer');
    if (countdownContainer) {
        countdownContainer.style.display = 'none';
    }
}

// === KEYBOARD SHORTCUTS ===
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + tecla para accesos rápidos
        if (e.altKey) {
            switch(e.key.toLowerCase()) {
                case 'g':
                    e.preventDefault();
                    selectMode('gantt');
                    break;
                case 'p':
                    e.preventDefault();
                    selectMode('projects');
                    break;
                case 's':
                    e.preventDefault();
                    selectMode('simulator');
                    break;
                case 'h':
                    e.preventDefault();
                    location.reload(); // Refresh home
                    break;
            }
        }
        
        // ESC para cancelar auto-redirect
        if (e.key === 'Escape') {
            hasUserInteracted = true;
            clearAutoRedirect();
        }
        
        // Números directos para selección rápida
        if (!e.altKey && !e.ctrlKey && !e.metaKey) {
            switch(e.key) {
                case '1':
                    selectMode('gantt');
                    break;
                case '2':
                    selectMode('projects');
                    break;
                case '3':
                    selectMode('simulator');
                    break;
            }
        }
    });
}

// === DETECCIÓN DE INTERACCIÓN ===
function setupInteractionDetection() {
    // Detección de movimiento del mouse (solo una vez)
    document.addEventListener('mousemove', () => {
        hasUserInteracted = true;
        clearAutoRedirect();
    }, { once: true });
    
    // Detección de scroll
    document.addEventListener('scroll', () => {
        hasUserInteracted = true;
        clearAutoRedirect();
    }, { once: true });
    
    // Detección de toque en móviles
    document.addEventListener('touchstart', () => {
        hasUserInteracted = true;
        clearAutoRedirect();
    }, { once: true });
}

// === EFECTOS VISUALES ===
function initVisualEffects() {
    // Animación de entrada secuencial para las cards
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach((card, index) => {
        card.style.animationDelay = `${0.4 + (index * 0.2)}s`;
    });
    
    // Efecto parallax suave para el background
    document.addEventListener('mousemove', (e) => {
        const shapes = document.querySelectorAll('.bg-shape');
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
}

// === ANALYTICS Y TRACKING ===
function trackModeSelection(mode) {
    const timestamp = new Date().toISOString();
    const sessionData = {
        mode,
        timestamp,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        sessionId: generateSessionId()
    };
    
    console.log('Modo seleccionado:', sessionData);
    
    // Aquí podrías enviar a tu sistema de analytics
    // sendAnalytics('mode_selected', sessionData);
}

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// === UTILIDADES ===
function getRecommendedMode() {
    const now = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    // Lógica inteligente basada en horarios
    if (now >= 9 && now <= 11) {
        return 'gantt'; // Mañana: revisión de capacidad
    } else if (now >= 14 && now <= 16) {
        return 'projects'; // Tarde: gestión de proyectos
    } else if (dayOfWeek === 1 || dayOfWeek === 5) {
        return 'simulator'; // Lunes/Viernes: planificación
    }
    
    return APP_CONFIG.defaultMode;
}

function displayQuickTips() {
    // Mostrar tips después de 5 segundos si no hay interacción
    setTimeout(() => {
        if (!hasUserInteracted) {
            const tips = [
                'Tip: Usa Alt+G para ir directo al Modo Gantt',
                'Tip: Presiona ESC para cancelar el auto-redirect',
                'Tip: Los números 1, 2, 3 seleccionan modos directamente'
            ];
            
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            showTooltip(randomTip, 3000);
        }
    }, 5000);
}

function showTooltip(message, duration = 2000) {
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: fadeInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 300);
    }, duration);
}

// === INICIALIZACIÓN PRINCIPAL ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Netberry Home Controller inicializado');
    
    // Cargar preferencias y configurar interfaz
    loadUserPreferences();
    updateHealthScore();
    
    // Configurar interacciones
    setupKeyboardShortcuts();
    setupInteractionDetection();
    initVisualEffects();
    
    // Mostrar tips y iniciar auto-redirect
    displayQuickTips();
    
    // Iniciar auto-redirect después de las animaciones
    setTimeout(() => {
        startAutoRedirect();
    }, 2000);
    
    // Actualizar health score periódicamente
    setInterval(updateHealthScore, 30000);
});

// === MANEJO DE ERRORES ===
window.addEventListener('error', (e) => {
    console.error('Error en Home Controller:', e.error);
});

// Exponer funciones globales necesarias
window.selectMode = selectMode;