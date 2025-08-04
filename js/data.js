// data.js - Capa de datos centralizada con formato de números optimizado

// Utilidad para formatear números (FIX: máximo 2 decimales)
const formatNumber = {
    toFixed: (num, decimals = 2) => {
        if (typeof num !== 'number') return '0.00';
        return Number(num.toFixed(decimals));
    },
    
    percentage: (num, decimals = 0) => {
        if (typeof num !== 'number') return '0%';
        return `${Number(num.toFixed(decimals))}%`;
    },
    
    hours: (num, decimals = 0) => {
        if (typeof num !== 'number') return '0h';
        return `${Number(num.toFixed(decimals))}h`;
    },
    
    decimal: (num, decimals = 2) => {
        if (typeof num !== 'number') return 0;
        return Number(num.toFixed(decimals));
    }
};

// Datos completos del sistema con formateo aplicado
const NetberryData = {
    // Configuración global - ACTUALIZADO con 1800h/persona/año
    config: {
        annualHoursPerPerson: 1800, // ← NUEVA CAPACIDAD BASE
        quarterlyHoursPerPerson: 450, // 1800/4 trimestres
        bufferPercentage: 15,
        warningThreshold: 85,
        criticalThreshold: 95,
        currentYear: 2025,
        currentQuarter: 'Q3 2025',
        timelineView: 'annual', // ← NUEVA: Vista por defecto anual
        selectedYear: 2025,
        ganttYear: 2025 // ← NUEVO: Año seleccionado en Gantt
    },

    // Departamentos con capacidades recalculadas basadas en 1800h/persona/año
    departments: {
        php: {
            name: 'PHP',
            capacity: 21600, // 12 personas × 1800h = 21,600h anuales
            utilization: formatNumber.decimal(87.3),
            projects: 12,
            people: [
                { name: 'Carlos Mendoza', role: 'Tech Lead', utilization: formatNumber.decimal(92.1), projects: ['E-commerce', 'Portal B2B', 'API REST'] },
                { name: 'Ana García', role: 'Senior Developer', utilization: formatNumber.decimal(88.5), projects: ['CRM Interno', 'Portal B2B'] },
                { name: 'Miguel Torres', role: 'Senior Developer', utilization: formatNumber.decimal(85.2), projects: ['E-commerce', 'Sistema ERP'] },
                { name: 'Laura Jiménez', role: 'Mid Developer', utilization: formatNumber.decimal(89.8), projects: ['API REST', 'Dashboard Analytics'] },
                { name: 'Roberto Sánchez', role: 'Mid Developer', utilization: formatNumber.decimal(83.4), projects: ['Portal Clientes', 'CRM Interno'] },
                { name: 'Isabel Martín', role: 'Junior Developer', utilization: formatNumber.decimal(78.1), projects: ['Mantenimiento', 'Soporte'] },
                { name: 'Diego Ruiz', role: 'Junior Developer', utilization: formatNumber.decimal(75.6), projects: ['Testing', 'Documentación'] },
                { name: 'Carmen López', role: 'Senior Developer', utilization: formatNumber.decimal(94.7), projects: ['Sistema Facturación', 'API REST', 'Migración DB'] },
                { name: 'Francisco Gómez', role: 'Mid Developer', utilization: formatNumber.decimal(86.9), projects: ['Portal B2B', 'Integraciones'] },
                { name: 'Patricia Díaz', role: 'Senior Developer', utilization: formatNumber.decimal(90.8), projects: ['E-commerce', 'Sistema Pagos'] },
                { name: 'José Moreno', role: 'Mid Developer', utilization: formatNumber.decimal(85.7), projects: ['CRM Interno', 'Reportes'] },
                { name: 'María Fernández', role: 'Junior Developer', utilization: formatNumber.decimal(82.3), projects: ['Soporte', 'Testing'] }
            ]
        },
        dotnet: {
            name: '.NET',
            capacity: 14400, // 8 personas × 1800h = 14,400h anuales
            utilization: formatNumber.decimal(91.8),
            projects: 8,
            people: [
                { name: 'Eduardo Martín', role: 'Tech Lead', utilization: formatNumber.decimal(94.5), projects: ['Microservicios', 'API Gateway', 'Cloud Migration'] },
                { name: 'Lucía Fernández', role: 'Senior Developer', utilization: formatNumber.decimal(92.7), projects: ['Sistema Bancario', 'API Gateway'] },
                { name: 'Ricardo Gómez', role: 'Senior Developer', utilization: formatNumber.decimal(90.3), projects: ['Microservicios', 'Auth Service'] },
                { name: 'Elena Rodríguez', role: 'Mid Developer', utilization: formatNumber.decimal(88.9), projects: ['API REST', 'Integraciones'] },
                { name: 'Javier Pérez', role: 'Mid Developer', utilization: formatNumber.decimal(91.6), projects: ['Sistema Bancario', 'Reportes'] },
                { name: 'Sofía Alonso', role: 'Junior Developer', utilization: formatNumber.decimal(87.8), projects: ['Testing', 'Documentación'] },
                { name: 'Alberto Vega', role: 'Senior Developer', utilization: formatNumber.decimal(93.4), projects: ['Cloud Migration', 'DevOps'] },
                { name: 'Marina Castro', role: 'Mid Developer', utilization: formatNumber.decimal(89.2), projects: ['Microservicios', 'Monitoring'] }
            ]
        },
        devops: {
            name: 'DevOps',
            capacity: 3600, // 2 personas × 1800h = 3,600h anuales
            utilization: formatNumber.decimal(94.7),
            projects: 15,
            people: [
                { name: 'Andrés Navarro', role: 'DevOps Lead', utilization: formatNumber.decimal(97.8), projects: ['CI/CD', 'Kubernetes', 'Cloud Infra', 'Monitoring', 'Security'] },
                { name: 'Natalia Cruz', role: 'DevOps Engineer', utilization: formatNumber.decimal(91.5), projects: ['Docker', 'CI/CD', 'AWS', 'Terraform'] }
            ]
        },
        movilidad: {
            name: 'Movilidad',
            capacity: 10800, // 6 personas × 1800h = 10,800h anuales
            utilization: formatNumber.decimal(84.6),
            projects: 6,
            people: [
                { name: 'Gonzalo Díaz', role: 'Mobile Lead', utilization: formatNumber.decimal(87.9), projects: ['App Banking', 'App Retail'] },
                { name: 'Raquel Molina', role: 'iOS Developer', utilization: formatNumber.decimal(85.3), projects: ['App Banking iOS', 'Framework UI'] },
                { name: 'Tomás Iglesias', role: 'Android Developer', utilization: formatNumber.decimal(83.7), projects: ['App Banking Android', 'SDK Pagos'] },
                { name: 'Clara Romero', role: 'React Native Dev', utilization: formatNumber.decimal(81.9), projects: ['App Retail', 'App Delivery'] },
                { name: 'Pablo Herrera', role: 'Flutter Developer', utilization: formatNumber.decimal(84.8), projects: ['App Corporate', 'Widgets'] },
                { name: 'Beatriz Vargas', role: 'QA Mobile', utilization: formatNumber.decimal(86.2), projects: ['Testing Apps', 'Automation'] }
            ]
        },
        ux: {
            name: 'UX-UI',
            capacity: 9000, // 5 personas × 1800h = 9,000h anuales
            utilization: formatNumber.decimal(73.8),
            projects: 8,
            people: [
                { name: 'Valentina Serrano', role: 'UX Lead', utilization: formatNumber.decimal(77.5), projects: ['Design System', 'App Banking UX'] },
                { name: 'Marcos Delgado', role: 'UI Designer', utilization: formatNumber.decimal(74.2), projects: ['E-commerce UI', 'Landing Pages'] },
                { name: 'Carla Méndez', role: 'UX Designer', utilization: formatNumber.decimal(71.6), projects: ['User Research', 'Prototypes'] },
                { name: 'Daniel Campos', role: 'Product Designer', utilization: formatNumber.decimal(75.8), projects: ['App Retail', 'Dashboard'] },
                { name: 'Lucía Guerrero', role: 'UI Developer', utilization: formatNumber.decimal(70.4), projects: ['Component Library', 'Animations'] }
            ]
        },
        pmo: {
            name: 'PMO',
            capacity: 7200, // 4 personas × 1800h = 7,200h anuales
            utilization: formatNumber.decimal(67.5),
            projects: 3,
            people: [
                { name: 'Sandra Moreno', role: 'PMO Director', utilization: formatNumber.decimal(71.8), projects: ['Portfolio Management', 'Strategy'] },
                { name: 'David Prieto', role: 'Project Manager', utilization: formatNumber.decimal(69.4), projects: ['E-commerce', 'Banking'] },
                { name: 'Mónica Rubio', role: 'Scrum Master', utilization: formatNumber.decimal(64.7), projects: ['Agile Teams', 'Training'] },
                { name: 'Luis Ortega', role: 'PM Jr', utilization: formatNumber.decimal(63.9), projects: ['Reporting', 'Coordination'] }
            ]
        },
        marketing: {
            name: 'Marketing',
            capacity: 5400, // 3 personas × 1800h = 5,400h anuales
            utilization: formatNumber.decimal(51.8),
            projects: 2,
            people: [
                { name: 'Pilar Cortés', role: 'Marketing Lead', utilization: formatNumber.decimal(54.6), projects: ['Campaigns', 'Strategy'] },
                { name: 'Óscar Peñas', role: 'Digital Marketing', utilization: formatNumber.decimal(49.7), projects: ['SEO/SEM', 'Analytics'] },
                { name: 'Nuria León', role: 'Content Manager', utilization: formatNumber.decimal(51.1), projects: ['Content', 'Social Media'] }
            ]
        },
        qa: {
            name: 'QA',
            capacity: 7200, // 4 personas × 1800h = 7,200h anuales
            utilization: formatNumber.decimal(64.8),
            projects: 4,
            people: [
                { name: 'Rodrigo Pascual', role: 'QA Lead', utilization: formatNumber.decimal(67.9), projects: ['Test Strategy', 'Automation'] },
                { name: 'Amparo Lozano', role: 'QA Engineer', utilization: formatNumber.decimal(65.3), projects: ['E-commerce Testing', 'API Tests'] },
                { name: 'Emilio Hidalgo', role: 'Test Automation', utilization: formatNumber.decimal(62.7), projects: ['Selenium', 'CI/CD Tests'] },
                { name: 'Teresa Reyes', role: 'QA Analyst', utilization: formatNumber.decimal(61.4), projects: ['Manual Testing', 'Reports'] }
            ]
        }
    },

    // PROYECTOS EXTENDIDOS PARA GANTT - CON FECHAS Y DEPARTAMENTOS
    projects: [
        {
            id: 1,
            name: 'E-commerce Renovación',
            startDate: '2025-01-15',
            endDate: '2025-11-30',
            progress: formatNumber.decimal(74.8),
            departments: ['php', 'ux'],
            hours: 450,
            priority: 'high',
            status: 'active',
            description: 'Renovación completa de la plataforma e-commerce con nuevas funcionalidades y mejora de UX'
        },
        {
            id: 2,
            name: 'App Mobile Banking',
            startDate: '2025-03-20',
            endDate: '2025-12-15',
            progress: formatNumber.decimal(59.7),
            departments: ['movilidad', 'devops'],
            hours: 680,
            priority: 'critical',
            status: 'active',
            description: 'Desarrollo de aplicación móvil para banca digital con funcionalidades avanzadas'
        },
        {
            id: 3,
            name: 'API Microservicios',
            startDate: '2025-02-01',
            endDate: '2026-02-28',
            progress: formatNumber.decimal(39.4),
            departments: ['dotnet', 'qa'],
            hours: 520,
            priority: 'high',
            status: 'active',
            description: 'Migración a arquitectura de microservicios para mejorar escalabilidad'
        },
        {
            id: 4,
            name: 'Portal Corporativo',
            startDate: '2025-03-10',
            endDate: '2026-03-15',
            progress: formatNumber.decimal(24.8),
            departments: ['php', 'marketing'],
            hours: 380,
            priority: 'medium',
            status: 'active',
            description: 'Desarrollo de portal corporativo para gestión interna'
        },
        {
            id: 5,
            name: 'Sistema Facturación',
            startDate: '2025-01-05',
            endDate: '2026-01-30',
            progress: formatNumber.decimal(54.3),
            departments: ['php', 'dotnet'],
            hours: 420,
            priority: 'high',
            status: 'active',
            description: 'Sistema integrado de facturación automática'
        },
        {
            id: 6,
            name: 'Cloud Migration',
            startDate: '2025-04-01',
            endDate: '2026-04-30',
            progress: formatNumber.decimal(29.6),
            departments: ['devops', 'dotnet'],
            hours: 890,
            priority: 'critical',
            status: 'active',
            description: 'Migración completa de infraestructura a la nube'
        },
        {
            id: 7,
            name: 'API REST v2',
            startDate: '2025-02-10',
            endDate: '2025-08-15',
            progress: formatNumber.decimal(65.2),
            departments: ['php'],
            hours: 320,
            priority: 'medium',
            status: 'active',
            description: 'Nueva versión de API REST con mejoras de performance'
        },
        {
            id: 8,
            name: 'CI/CD Pipeline',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            progress: formatNumber.decimal(78.4),
            departments: ['devops'],
            hours: 560,
            priority: 'high',
            status: 'active',
            description: 'Implementación de pipeline completo CI/CD'
        },
        {
            id: 9,
            name: 'Kubernetes Setup',
            startDate: '2025-04-15',
            endDate: '2025-10-30',
            progress: formatNumber.decimal(35.1),
            departments: ['devops'],
            hours: 450,
            priority: 'high',
            status: 'active',
            description: 'Configuración y deployment de cluster Kubernetes'
        },
        {
            id: 10,
            name: 'App Retail',
            startDate: '2025-10-01',
            endDate: '2026-06-30',
            progress: formatNumber.decimal(12.8),
            departments: ['movilidad'],
            hours: 380,
            priority: 'medium',
            status: 'active',
            description: 'Aplicación móvil para sector retail'
        },
        {
            id: 11,
            name: 'Design System',
            startDate: '2025-01-10',
            endDate: '2025-07-15',
            progress: formatNumber.decimal(82.5),
            departments: ['ux'],
            hours: 280,
            priority: 'medium',
            status: 'active',
            description: 'Sistema de diseño unificado para todos los productos'
        },
        {
            id: 12,
            name: 'User Research',
            startDate: '2025-04-01',
            endDate: '2025-12-31',
            progress: formatNumber.decimal(45.7),
            departments: ['ux'],
            hours: 200,
            priority: 'low',
            status: 'active',
            description: 'Investigación de usuarios y análisis de comportamiento'
        }
    ],

    // Métodos de cálculo con formato aplicado
    calculations: {
        getTotalCapacity: (departments = null) => {
            if (!departments) departments = Object.values(NetberryData.departments);
            const total = departments.reduce((sum, dept) => sum + dept.capacity, 0);
            return formatNumber.decimal(total);
        },

        getAverageUtilization: (departments = null) => {
            if (!departments) departments = Object.values(NetberryData.departments);
            if (departments.length === 0) return formatNumber.decimal(0);
            const avg = departments.reduce((sum, dept) => sum + dept.utilization, 0) / departments.length;
            return formatNumber.decimal(avg);
        },

        getAvailableCapacity: (departments = null) => {
            if (!departments) departments = Object.values(NetberryData.departments);
            const total = departments.reduce((sum, dept) => {
                const available = dept.capacity * (1 - dept.utilization / 100);
                return sum + available;
            }, 0);
            return formatNumber.decimal(total);
        },

        getCriticalDepartments: (threshold = 85) => {
            return Object.entries(NetberryData.departments)
                .filter(([key, dept]) => dept.utilization >= threshold)
                .map(([key, dept]) => ({
                    key,
                    name: dept.name,
                    utilization: dept.utilization
                }));
        },

        getFilteredDepartments: (filterKeys) => {
            if (filterKeys.includes('all')) {
                return Object.values(NetberryData.departments);
            }
            return filterKeys
                .map(key => NetberryData.departments[key])
                .filter(dept => dept !== undefined);
        },

        // NUEVO: Calcular capacidad total anual
        getTotalAnnualCapacity: (departments = null) => {
            if (!departments) departments = Object.values(NetberryData.departments);
            const totalPeople = departments.reduce((sum, dept) => sum + dept.people.length, 0);
            return totalPeople * NetberryData.config.annualHoursPerPerson;
        },

        // NUEVO: Calcular capacidad trimestral
        getTotalQuarterlyCapacity: (departments = null) => {
            if (!departments) departments = Object.values(NetberryData.departments);
            const totalPeople = departments.reduce((sum, dept) => sum + dept.people.length, 0);
            return totalPeople * NetberryData.config.quarterlyHoursPerPerson;
        },

        // NUEVO: Obtener proyectos por año
        getProjectsByYear: (year) => {
            return NetberryData.projects.filter(project => {
                const startYear = parseInt(project.startDate.split('-')[0]);
                const endYear = parseInt(project.endDate.split('-')[0]);
                return startYear <= year && endYear >= year;
            });
        },

        // NUEVO: Obtener proyectos por departamento y año
        getProjectsByDepartmentAndYear: (deptKey, year) => {
            const yearProjects = NetberryData.calculations.getProjectsByYear(year);
            return yearProjects.filter(project => 
                project.departments.includes(deptKey)
            );
        },

        // NUEVO: Calcular posición de proyecto en timeline (mes inicio y duración)
        getProjectTimelinePosition: (project, year) => {
            const projectStart = new Date(project.startDate);
            const projectEnd = new Date(project.endDate);
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31);

            // Si el proyecto no intersecta con el año, retornar null
            if (projectEnd < yearStart || projectStart > yearEnd) {
                return null;
            }

            // Calcular mes de inicio (limitado al año actual)
            const startMonth = Math.max(0, projectStart.getMonth() - (projectStart.getFullYear() - year) * 12);
            
            // Calcular mes de fin (limitado al año actual)
            const endMonth = Math.min(11, projectEnd.getMonth() + (year - projectEnd.getFullYear()) * 12);
            
            // Si el proyecto empieza antes del año, empezar en enero
            const displayStartMonth = projectStart.getFullYear() < year ? 0 : startMonth;
            
            // Si el proyecto termina después del año, terminar en diciembre
            const displayEndMonth = projectEnd.getFullYear() > year ? 11 : endMonth;

            return {
                startMonth: displayStartMonth,
                endMonth: displayEndMonth,
                duration: displayEndMonth - displayStartMonth + 1,
                startsBeforeYear: projectStart.getFullYear() < year,
                endsAfterYear: projectEnd.getFullYear() > year
            };
        },

        simulateProjectImpact: (requirements) => {
            const impacts = [];
            let totalViability = 'viable';
            
            Object.entries(requirements).forEach(([deptKey, hours]) => {
                if (hours > 0 && NetberryData.departments[deptKey]) {
                    const dept = NetberryData.departments[deptKey];
                    const monthlyCapacity = dept.capacity / 12; // Capacidad mensual
                    const monthlyHours = hours / (requirements.duration || 3);
                    const newUtilization = dept.utilization + (monthlyHours / monthlyCapacity * 100);
                    
                    let status = 'viable';
                    if (newUtilization > 100) status = 'impossible';
                    else if (newUtilization > 95) status = 'critical';
                    else if (newUtilization > 85) status = 'warning';
                    
                    if (status === 'impossible' || status === 'critical') {
                        totalViability = 'not_viable';
                    } else if (status === 'warning' && totalViability !== 'not_viable') {
                        totalViability = 'risky';
                    }
                    
                    impacts.push({
                        department: dept.name,
                        currentUtilization: dept.utilization,
                        newUtilization: formatNumber.decimal(newUtilization),
                        status,
                        hoursRequired: hours
                    });
                }
            });
            
            return {
                viability: totalViability,
                impacts,
                totalHours: Object.values(requirements).reduce((sum, h) => sum + (h || 0), 0),
                recommendations: NetberryData.calculations.generateRecommendations(totalViability, impacts)
            };
        },

        generateRecommendations: (viability, impacts) => {
            const recommendations = [];
            
            switch (viability) {
                case 'not_viable':
                    recommendations.push('Proyecto NO VIABLE en condiciones actuales');
                    recommendations.push('Considerar reducir alcance en 30-40%');
                    recommendations.push('Evaluar contratación de recursos adicionales');
                    recommendations.push('Posponer hasta Q1-Q2 2026');
                    break;
                    
                case 'risky':
                    recommendations.push('Proyecto VIABLE con riesgos controlables');
                    recommendations.push('Implementar buffer adicional del 20%');
                    recommendations.push('Revisión semanal de capacidad');
                    recommendations.push('Plan de contingencia preparado');
                    break;
                    
                default:
                    recommendations.push('Proyecto TOTALMENTE VIABLE');
                    recommendations.push('Capacidad suficiente confirmada');
                    recommendations.push('Ventana óptima identificada');
                    recommendations.push('Proceder con planificación detallada');
            }
            
            return recommendations;
        }
    }
};

// Exportar para uso global
window.NetberryData = NetberryData;
window.formatNumber = formatNumber;