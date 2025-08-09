/**
 * Utilidades para manejo de fechas
 */

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {Date} date - Fecha a formatear
 * @returns {string}
 */
export function formatDate(date) {
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Date} startDate - Fecha inicial
 * @param {Date} endDate - Fecha final
 * @returns {number}
 */
export function getDaysDifference(startDate, endDate) {
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica si una fecha está dentro de un rango
 * @param {Date} date - Fecha a verificar
 * @param {Date} startDate - Fecha inicial del rango
 * @param {Date} endDate - Fecha final del rango
 * @returns {boolean}
 */
export function isDateInRange(date, startDate, endDate) {
    return date >= startDate && date <= endDate;
}

/**
 * Obtiene el primer día del mes
 * @param {Date} date - Fecha de referencia
 * @returns {Date}
 */
export function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtiene el último día del mes
 * @param {Date} date - Fecha de referencia
 * @returns {Date}
 */
export function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
