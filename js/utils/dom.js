/**
 * Utilidades para manipulación del DOM
 */

/**
 * Crea un elemento DOM con atributos y clases
 * @param {string} tag - Tipo de elemento HTML
 * @param {Object} options - Opciones de configuración
 * @param {string[]} [options.classes] - Array de clases CSS
 * @param {Object} [options.attributes] - Objeto con atributos HTML
 * @param {string} [options.text] - Texto del elemento
 * @returns {HTMLElement}
 */
export function createElement(tag, { classes = [], attributes = {}, text = '' } = {}) {
    const element = document.createElement(tag);
    
    if (classes.length) {
        element.classList.add(...classes);
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    if (text) {
        element.textContent = text;
    }
    
    return element;
}

/**
 * Remueve todos los hijos de un elemento
 * @param {HTMLElement} element - Elemento a limpiar
 */
export function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Añade múltiples event listeners a un elemento
 * @param {HTMLElement} element - Elemento objetivo
 * @param {Object} listeners - Objeto con eventos y callbacks
 */
export function addEventListeners(element, listeners) {
    Object.entries(listeners).forEach(([event, callback]) => {
        element.addEventListener(event, callback);
    });
}
