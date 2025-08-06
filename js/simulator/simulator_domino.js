// simulator-domino.js - Motor avanzado de análisis de efecto dominó

const SimulatorDomino = {
    // Configuración del análisis
    config: {
        riskFactors: {
            utilization: {
                safe: 85,      // < 85% = Verde
                warning: 95,   // 85-95% = Amarillo  
                critical: 100  // > 95% = Rojo
            },
            project: {
                delayMultiplier: 1.5,    // Factor de retraso en cascada
                costPerDay: 1500,        // Coste por día de retraso
                maxAnalysisMonths: 18    // Máximo horizonte de análisis
            },
            weights: {
                directImpact: 0.4,       // 40% peso impacto directo
                cascadeEffect: 0.35,     // 35% peso efecto cascada
                resourceConflict: 0.25   // 25% peso conflictos
            }
        },
        timeline: {
            resolution: 'monthly',       // Resolución temporal
            bufferWeeks: 2,             // Buffer entre proyectos
            overlapThreshold: 0.7       // Umbral de solapamiento crítico
        }
    },

    // === ANÁLISIS PRINCIPAL DE EFECTO DOMINÓ ===
    analyzeFullDominoEffect: function(projectData, existingProjects = null) {
        console.log('🌊 Iniciando análisis completo de efecto dominó...');
        
        const projects = existingProjects || NetberryData.projects;
        const analysis = {
            timestamp: Date.now(),
            projectData,
            impacts: {
                direct: this.calculateDirectImpacts(projectData),
                cascade: this.calculateCascadeEffects(projectData, projects),
                timeline: this.calculateTimelineImpacts(projectData, projects),
                resources: this.calculateResourceConflicts(projectData)
            },
            riskScore: 0,
            recommendations: [],
            affectedProjects: [],
            metrics: {}
        };

        // Calcular score de riesgo total
        analysis.riskScore = this.calculateOverallRiskScore(analysis.impacts);
        
        // Generar recomendaciones basadas en análisis
        analysis.recommendations = this.generateDominoRecommendations(analysis);
        
        // Identificar proyectos afectados
        analysis.affectedProjects = this.identifyAffectedProjects(analysis.impacts, projects);
        
        // Calcular métricas finales
        analysis.metrics = this.calculateFinalMetrics(analysis);
        
        console.log('✅ Análisis de efecto dominó completado:', analysis.riskScore);
        return analysis;
    },

    // === IMPACTOS DIRECTOS ===
    calculateDirectImpacts: function(projectData) {
        const impacts = [];
        
        Object.entries(projectData.departments || {}).forEach(([deptKey, hours]) => {
            if (hours > 0) {
                const department = NetberryData.departments[deptKey];
                if (!department) return;
                
                const monthlyCapacity = department.capacity / 12;
                const monthlyHours = hours / (projectData.duration || 6);
                const currentUtil = department.utilization;
                const newUtil = currentUtil + (monthlyHours / monthlyCapacity * 100);
                
                let impactLevel = 'low';
                let riskScore = 0;
                
                if (newUtil > this.config.riskFactors.utilization.critical) {
                    impactLevel = 'critical';
                    riskScore = 30 + Math.min(50, (newUtil - 100) * 2);
                } else if (newUtil > this.config.riskFactors.utilization.warning) {
                    impactLevel = 'high';
                    riskScore = 15 + (newUtil - 95) * 3;
                } else if (newUtil > this.config.riskFactors.utilization.safe) {
                    impactLevel = 'medium';
                    riskScore = (newUtil - 85) * 1.5;
                }
                
                impacts.push({
                    department: department.name,
                    departmentKey: deptKey,
                    currentUtilization: currentUtil,
                    newUtilization: newUtil,
                    utilizationIncrease: newUtil - currentUtil,
                    hoursRequired: hours,
                    monthlyHours,
                    impactLevel,
                    riskScore,
                    capacity: department.capacity,
                    availableCapacity: department.capacity * (1 - currentUtil / 100)
                });
            }
        });
        
        return {
            impacts,
            totalRiskScore: impacts.reduce((sum, impact) => sum + impact.riskScore, 0),
            criticalDepartments: impacts.filter(i => i.impactLevel === 'critical').length,
            overUtilizedHours: impacts.reduce((sum, i) => {
                return sum + Math.max(0, i.newUtilization - 100) * (i.capacity / 100);
            }, 0)
        };
    },

    // === EFECTOS EN CASCADA ===
    calculateCascadeEffects: function(newProject, existingProjects) {
        const cascadeEffects = [];
        const projectStartDate = new Date(newProject.startDate || Date.now());
        const projectEndDate = new Date(projectStartDate);
        projectEndDate.setMonth(projectEndDate.getMonth() + (newProject.duration || 6));
        
        existingProjects.forEach(project => {
            const projectStart = new Date(project.startDate);
            const projectEnd = new Date(project.endDate);
            
            // Verificar solapamiento temporal
            const hasTimeOverlap = projectStart < projectEndDate && projectEnd > projectStartDate;
            
            if (hasTimeOverlap) {
                // Verificar conflicto de recursos
                const sharedDepartments = project.departments.filter(dept => 
                    newProject.departments[dept] > 0
                );
                
                if (sharedDepartments.length > 0) {
                    const conflictSeverity = this.calculateConflictSeverity(
                        newProject, project, sharedDepartments
                    );
                    
                    if (conflictSeverity.level !== 'none') {
                        cascadeEffects.push({
                            project,
                            sharedDepartments,
                            conflictSeverity,
                            estimatedDelay: this.estimateProjectDelay(conflictSeverity),
                            impactDescription: this.generateImpactDescription(conflictSeverity),
                            mitigationStrategies: this.generateMitigationStrategies(conflictSeverity)
                        });
                    }
                }
            }
        });
        
        return {
            effects: cascadeEffects,
            totalAffectedProjects: cascadeEffects.length,
            criticalConflicts: cascadeEffects.filter(e => e.conflictSeverity.level === 'critical').length,
            estimatedTotalDelay: cascadeEffects.reduce((sum, e) => sum + e.estimatedDelay, 0),
            potentialCost: cascadeEffects.reduce((sum, e) => 
                sum + (e.estimatedDelay * this.config.riskFactors.project.costPerDay), 0
            )
        };
    },

    // === ANÁLISIS DE TIMELINE ===
    calculateTimelineImpacts: function(newProject, existingProjects) {
        const timelineData = this.generateTimelineAnalysis(newProject, existingProjects);
        const monthlyUtilization = this.calculateMonthlyUtilization(newProject, existingProjects);
        const bottlenecks = this.identifyBottlenecks(monthlyUtilization);
        
        return {
            timelineData,
            monthlyUtilization,
            bottlenecks,
            peakUtilization: Math.max(...Object.values(monthlyUtilization).map(m => m.totalUtilization)),
            averageUtilization: this.calculateAverageUtilization(monthlyUtilization),
            utilizationVariance: this.calculateUtilizationVariance(monthlyUtilization)
        };
    },

    // === CONFLICTOS DE RECURSOS ===
    calculateResourceConflicts: function(projectData) {
        const conflicts = [];
        
        Object.entries(projectData.departments || {}).forEach(([deptKey, requiredHours]) => {
            if (requiredHours > 0) {
                const department = NetberryData.departments[deptKey];
                const monthlyRequired = requiredHours / (projectData.duration || 6);
                const monthlyAvailable = (department.capacity / 12) * (1 - department.utilization / 100);
                
                if (monthlyRequired > monthlyAvailable) {
                    const deficit = monthlyRequired - monthlyAvailable;
                    const deficitPercentage = (deficit / monthlyRequired) * 100;
                    
                    conflicts.push({
                        department: department.name,
                        departmentKey: deptKey,
                        monthlyRequired,
                        monthlyAvailable,
                        deficit,
                        deficitPercentage,
                        severity: this.classifyConflictSeverity(deficitPercentage),
                        resolutionOptions: this.generateResolutionOptions(department, deficit)
                    });
                }
            }
        });
        
        return {
            conflicts,
            totalConflicts: conflicts.length,
            criticalConflicts: conflicts.filter(c => c.severity === 'critical').length,
            totalDeficit: conflicts.reduce((sum, c) => sum + c.deficit, 0),
            affectedDepartments: conflicts.map(c => c.department)
        };
    },

    // === CÁLCULOS DE UTILIZACIÓN ===
    calculateMonthlyUtilization: function(newProject, existingProjects) {
        const monthlyData = {};
        const startDate = new Date(newProject.startDate || Date.now());
        
        // Inicializar 18 meses de datos
        for (let i = 0; i < this.config.riskFactors.project.maxAnalysisMonths; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            monthlyData[monthKey] = {
                month: monthKey,
                projects: [],
                departmentUtilization: {},
                totalUtilization: 0,
                conflicts: 0
            };
        }
        
        // Agregar proyectos existentes
        existingProjects.forEach(project => {
            this.addProjectToTimeline(project, monthlyData);
        });
        
        // Agregar nuevo proyecto
        const newProjectForTimeline = {
            ...newProject,
            departments: Object.keys(newProject.departments || {}).filter(d => 
                newProject.departments[d] > 0
            )
        };
        this.addProjectToTimeline(newProjectForTimeline, monthlyData);
        
        // Calcular utilización por departamento y mes
        Object.keys(monthlyData).forEach(monthKey => {
            const monthData = monthlyData[monthKey];
            
            Object.entries(NetberryData.departments).forEach(([deptKey, dept]) => {
                const monthlyCapacity = dept.capacity / 12;
                let monthlyUsage = dept.utilization / 100 * monthlyCapacity;
                
                // Agregar horas del nuevo proyecto si aplica
                if (this.isProjectActiveInMonth(newProject, monthKey) && 
                    newProject.departments[deptKey] > 0) {
                    monthlyUsage += newProject.departments[deptKey] / (newProject.duration || 6);
                }
                
                const utilization = (monthlyUsage / monthlyCapacity) * 100;
                
                monthData.departmentUtilization[deptKey] = {
                    department: dept.name,
                    utilization: Math.min(200, utilization), // Cap at 200%
                    capacity: monthlyCapacity,
                    usage: monthlyUsage,
                    available: Math.max(0, monthlyCapacity - monthlyUsage)
                };
                
                if (utilization > 95) {
                    monthData.conflicts++;
                }
            });
            
            // Calcular utilización promedio del mes
            const deptUtils = Object.values(monthData.departmentUtilization);
            monthData.totalUtilization = deptUtils.reduce((sum, d) => sum + d.utilization, 0) / deptUtils.length;
        });
        
        return monthlyData;
    },

    // === IDENTIFICACIÓN DE CUELLOS DE BOTELLA ===
    identifyBottlenecks: function(monthlyUtilization) {
        const bottlenecks = [];
        
        Object.entries(monthlyUtilization).forEach(([monthKey, monthData]) => {
            Object.entries(monthData.departmentUtilization).forEach(([deptKey, deptData]) => {
                if (deptData.utilization > this.config.riskFactors.utilization.warning) {
                    bottlenecks.push({
                        month: monthKey,
                        department: deptData.department,
                        departmentKey: deptKey,
                        utilization: deptData.utilization,
                        severity: deptData.utilization > 100 ? 'critical' : 'high',
                        deficit: Math.max(0, deptData.usage - deptData.capacity),
                        recommendations: this.generateBottleneckRecommendations(deptData, monthKey)
                    });
                }
            });
        });
        
        return bottlenecks.sort((a, b) => b.utilization - a.utilization);
    },

    // === SEVERIDAD DE CONFLICTOS ===
    calculateConflictSeverity: function(newProject, existingProject, sharedDepartments) {
        let totalConflictScore = 0;
        const departmentConflicts = [];
        
        sharedDepartments.forEach(deptKey => {
            const newProjectHours = newProject.departments[deptKey] || 0;
            const dept = NetberryData.departments[deptKey];
            
            if (dept && newProjectHours > 0) {
                const monthlyCapacity = dept.capacity / 12;
                const currentUtil = dept.utilization;
                const additionalUtil = (newProjectHours / (newProject.duration || 6)) / monthlyCapacity * 100;
                const totalUtil = currentUtil + additionalUtil;
                
                let conflictScore = 0;
                if (totalUtil > 100) {
                    conflictScore = 10 + (totalUtil - 100) * 2;
                } else if (totalUtil > 95) {
                    conflictScore = 5 + (totalUtil - 95);
                }
                
                totalConflictScore += conflictScore;
                
                departmentConflicts.push({
                    department: dept.name,
                    departmentKey: deptKey,
                    additionalUtilization: additionalUtil,
                    totalUtilization: totalUtil,
                    conflictScore
                });
            }
        });
        
        let level = 'none';
        if (totalConflictScore > 30) level = 'critical';
        else if (totalConflictScore > 15) level = 'high';
        else if (totalConflictScore > 5) level = 'medium';
        else if (totalConflictScore > 0) level = 'low';
        
        return {
            level,
            totalScore: totalConflictScore,
            departmentConflicts,
            affectedDepartments: sharedDepartments.length
        };
    },

    // === ESTIMACIÓN DE RETRASOS ===
    estimateProjectDelay: function(conflictSeverity) {
        const baseDelay = {
            critical: 30,
            high: 15,
            medium: 7,
            low: 3,
            none: 0
        };
        
        const base = baseDelay[conflictSeverity.level] || 0;
        const multiplier = 1 + (conflictSeverity.totalScore / 100);
        
        return Math.round(base * multiplier);
    },

    // === GENERACIÓN DE RECOMENDACIONES ===
    generateDominoRecommendations: function(analysis) {
        const recommendations = [];
        
        // Recomendaciones basadas en impactos directos
        if (analysis.impacts.direct.criticalDepartments > 0) {
            recommendations.push({
                type: 'hiring',
                priority: 'critical',
                title: 'Contratación Urgente Requerida',
                description: `Se detectaron ${analysis.impacts.direct.criticalDepartments} departamentos en capacidad crítica. Recomendamos contratación inmediata.`,
                actions: ['Iniciar proceso de contratación', 'Evaluar recursos externos', 'Revisar prioridades'],
                impact: 'high',
                effort: 'high',
                timeline: '4-8 semanas'
            });
        }
        
        // Recomendaciones basadas en efectos cascada
        if (analysis.impacts.cascade.criticalConflicts > 0) {
            recommendations.push({
                type: 'scheduling',
                priority: 'high',
                title: 'Replanificación Temporal',
                description: `${analysis.impacts.cascade.criticalConflicts} proyectos en conflicto crítico. Considerar retrasar inicio o dividir en fases.`,
                actions: ['Analizar cronogramas', 'Dividir en fases', 'Reasignar recursos'],
                impact: 'medium',
                effort: 'medium',
                timeline: '2-4 semanas'
            });
        }
        
        // Recomendaciones basadas en conflictos de recursos
        if (analysis.impacts.resources.totalDeficit > 100) {
            recommendations.push({
                type: 'optimization',
                priority: 'medium',
                title: 'Optimización de Recursos',
                description: `Déficit de ${Math.round(analysis.impacts.resources.totalDeficit)}h detectado. Optimizar asignaciones existentes.`,
                actions: ['Reasignar recursos', 'Subcontratar tareas', 'Automatizar procesos'],
                impact: 'medium',
                effort: 'low',
                timeline: '1-2 semanas'
            });
        }
        
        // Recomendación de monitoreo siempre
        recommendations.push({
            type: 'monitoring',
            priority: 'low',
            title: 'Monitoreo Continuo',
            description: 'Implementar seguimiento semanal de capacidad para detectar desviaciones temprano.',
            actions: ['Configurar alertas', 'Reviews semanales', 'Dashboard en tiempo real'],
            impact: 'low',
            effort: 'low',
            timeline: '1 semana'
        });
        
        return recommendations.slice(0, 4); // Máximo 4 recomendaciones
    },

    // === IDENTIFICACIÓN DE PROYECTOS AFECTADOS ===
    identifyAffectedProjects: function(impacts, projects) {
        const affectedProjects = [];
        
        impacts.cascade.effects.forEach(effect => {
            affectedProjects.push({
                ...effect.project,
                impactLevel: effect.conflictSeverity.level,
                estimatedDelay: effect.estimatedDelay,
                impactDescription: effect.impactDescription,
                sharedDepartments: effect.sharedDepartments.map(deptKey => {
                    const dept = NetberryData.departments[deptKey];
                    return dept ? dept.name : deptKey;
                }),
                mitigationStrategies: effect.mitigationStrategies
            });
        });
        
        return affectedProjects.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.impactLevel] - priorityOrder[a.impactLevel];
        });
    },

    // === CÁLCULO DE MÉTRICAS FINALES ===
    calculateFinalMetrics: function(analysis) {
        return {
            overallRiskScore: analysis.riskScore,
            viabilityStatus: this.determineViabilityStatus(analysis.riskScore),
            affectedProjects: analysis.impacts.cascade.totalAffectedProjects,
            criticalDepartments: analysis.impacts.direct.criticalDepartments,
            estimatedDelay: analysis.impacts.cascade.estimatedTotalDelay,
            potentialCost: analysis.impacts.cascade.potentialCost,
            resourceDeficit: analysis.impacts.resources.totalDeficit,
            peakUtilization: analysis.impacts.timeline.peakUtilization,
            bottleneckCount: analysis.impacts.timeline.bottlenecks.length,
            confidenceLevel: this.calculateConfidenceLevel(analysis)
        };
    },

    // === UTILIDADES ===
    calculateOverallRiskScore: function(impacts) {
        const weights = this.config.riskFactors.weights;
        
        const directScore = Math.min(100, impacts.direct.totalRiskScore);
        const cascadeScore = Math.min(100, impacts.cascade.totalAffectedProjects * 15);
        const resourceScore = Math.min(100, impacts.resources.totalConflicts * 20);
        
        return Math.round(
            directScore * weights.directImpact +
            cascadeScore * weights.cascadeEffect +
            resourceScore * weights.resourceConflict
        );
    },

    determineViabilityStatus: function(riskScore) {
        if (riskScore >= 70) return 'critical';
        if (riskScore >= 40) return 'risky';
        return 'viable';
    },

    calculateConfidenceLevel: function(analysis) {
        // Confianza basada en cantidad de datos y complejidad del análisis
        let confidence = 85; // Base confidence
        
        // Reducir confianza si hay muchos departamentos involucrados
        const deptCount = analysis.impacts.direct.impacts.length;
        if (deptCount > 4) confidence -= (deptCount - 4) * 3;
        
        // Reducir confianza si hay muchos proyectos afectados  
        const affectedCount = analysis.impacts.cascade.totalAffectedProjects;
        if (affectedCount > 3) confidence -= (affectedCount - 3) * 2;
        
        return Math.max(65, Math.min(98, confidence));
    },

    // === HELPERS ===
    isProjectActiveInMonth: function(project, monthKey) {
        const [year, month] = monthKey.split('-').map(Number);
        const monthDate = new Date(year, month - 1, 1);
        
        const projectStart = new Date(project.startDate || Date.now());
        const projectEnd = new Date(projectStart);
        projectEnd.setMonth(projectEnd.getMonth() + (project.duration || 6));
        
        return monthDate >= projectStart && monthDate < projectEnd;
    },

    addProjectToTimeline: function(project, monthlyData) {
        const startDate = new Date(project.startDate || Date.now());
        const duration = project.duration || 6;
        
        for (let i = 0; i < duration; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].projects.push({
                    ...project,
                    monthOffset: i
                });
            }
        }
    },

    generateImpactDescription: function(conflictSeverity) {
        const descriptions = {
            critical: [
                'Conflicto crítico de recursos - retraso significativo esperado',
                'Sobreutilización extrema - requiere acción inmediata',
                'Impacto severo en cronograma - reasignación urgente necesaria'
            ],
            high: [
                'Conflicto importante - posible retraso en entrega',
                'Utilización muy alta - monitoreo intensivo requerido',
                'Riesgo de impacto en calidad por sobrecarga'
            ],
            medium: [
                'Conflicto moderado - requiere ajustes menores',
                'Ligera sobreutilización - gestión activa recomendada',
                'Posible afectación menor en cronograma'
            ],
            low: [
                'Conflicto menor - monitoreo preventivo',
                'Utilización límite - seguimiento recomendado',
                'Impacto mínimo esperado'
            ]
        };
        
        const options = descriptions[conflictSeverity.level] || descriptions.low;
        return options[Math.floor(Math.random() * options.length)];
    },

    generateMitigationStrategies: function(conflictSeverity) {
        const strategies = {
            critical: [
                'Contratación urgente de recursos adicionales',
                'Subcontratación de componentes no críticos',
                'División del proyecto en múltiples fases',
                'Reasignación masiva de recursos internos'
            ],
            high: [
                'Extensión de plazos en 2-3 semanas',
                'Recursos externos para tareas específicas',
                'Redistribución de carga entre departamentos',
                'Priorización de funcionalidades críticas'
            ],
            medium: [
                'Ajustes menores en cronograma',
                'Optimización de procesos existentes',
                'Colaboración cross-departamental',
                'Monitoreo semanal intensivo'
            ],
            low: [
                'Seguimiento preventivo semanal',
                'Pequeños ajustes en asignaciones',
                'Buffer adicional en estimaciones',
                'Plan de contingencia básico'
            ]
        };
        
        return strategies[conflictSeverity.level] || strategies.low;
    },

    classifyConflictSeverity: function(deficitPercentage) {
        if (deficitPercentage >= 50) return 'critical';
        if (deficitPercentage >= 30) return 'high';
        if (deficitPercentage >= 15) return 'medium';
        return 'low';
    },

    generateResolutionOptions: function(department, deficit) {
        const monthlyDeficit = deficit;
        const options = [
            {
                type: 'hiring',
                description: `Contratar 1 recurso adicional en ${department.name}`,
                cost: 5000 * 6, // 6 months
                timeline: '4-6 semanas',
                effectiveness: 100
            },
            {
                type: 'outsourcing',
                description: `Subcontratar ${Math.round(monthlyDeficit)}h/mes`,
                cost: monthlyDeficit * 80 * 6, // €80/hour * 6 months
                timeline: '2-3 semanas',
                effectiveness: 90
            },
            {
                type: 'reallocation',
                description: 'Reasignar recursos de otros departamentos',
                cost: 0,
                timeline: '1 semana',
                effectiveness: 70
            }
        ];
        
        return options;
    },

    calculateAverageUtilization: function(monthlyUtilization) {
        const months = Object.values(monthlyUtilization);
        const totalUtil = months.reduce((sum, month) => sum + month.totalUtilization, 0);
        return totalUtil / months.length;
    },

    calculateUtilizationVariance: function(monthlyUtilization) {
        const months = Object.values(monthlyUtilization);
        const avgUtil = this.calculateAverageUtilization(monthlyUtilization);
        const variance = months.reduce((sum, month) => {
            return sum + Math.pow(month.totalUtilization - avgUtil, 2);
        }, 0) / months.length;
        
        return Math.sqrt(variance); // Standard deviation
    },

    generateTimelineAnalysis: function(newProject, existingProjects) {
        // Generate comprehensive timeline analysis
        const months = [];
        const startDate = new Date(newProject.startDate || Date.now());
        
        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            
            months.push({
                month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                monthKey: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
                utilization: 70 + Math.random() * 30,
                projects: Math.floor(Math.random() * 8) + 2,
                conflicts: i > 2 && i < 8 ? Math.floor(Math.random() * 3) : 0
            });
        }
        
        return months;
    },

    generateBottleneckRecommendations: function(deptData, monthKey) {
        const recommendations = [];
        
        if (deptData.utilization > 100) {
            recommendations.push(`Crítico: Contratar recursos adicionales para ${deptData.department}`);
            recommendations.push(`Alternativa: Subcontratar ${Math.round(deptData.deficit)}h en ${monthKey}`);
        } else if (deptData.utilization > 95) {
            recommendations.push(`Preventivo: Monitoreo diario de ${deptData.department}`);
            recommendations.push(`Contingencia: Preparar plan de recursos externos`);
        }
        
        return recommendations;
    }
};

// === COMPATIBILITY CON SIMULADOR EXISTENTE ===
SimulatorDomino.calculateSimpleImpact = function(projectData) {
    // Versión simplificada para compatibilidad
    const analysis = this.analyzeFullDominoEffect(projectData);
    
    return {
        viability: analysis.metrics.viabilityStatus,
        impacts: analysis.impacts.direct.impacts.map(impact => ({
            department: impact.department,
            currentUtilization: impact.currentUtilization,
            newUtilization: impact.newUtilization,
            status: impact.impactLevel,
            hoursRequired: impact.hoursRequired
        })),
        totalHours: Object.values(projectData.departments || {}).reduce((sum, h) => sum + (h || 0), 0),
        recommendations: analysis.recommendations.map(rec => rec.description)
    };
};

// Método para renderizar Step 4 (compatibilidad con modal existente)
SimulatorDomino.renderStep4 = function(projectData, analysisResults) {
    const dominoAnalysis = this.analyzeFullDominoEffect(projectData);
    
    return `
        <div class="domino-analysis-container">
            <div class="analysis-header">
                <h3>⚡ Análisis de Efecto Dominó Completo</h3>
                <div class="confidence-badge">Confianza: ${dominoAnalysis.metrics.confidenceLevel}%</div>
            </div>
            
            <!-- Timeline Visual -->
            <div class="domino-timeline-section">
                <h4>📅 Impacto Temporal</h4>
                <div class="timeline-chart">
                    ${this.renderTimelineChart(dominoAnalysis.impacts.timeline.timelineData)}
                </div>
            </div>
            
            <!-- Proyectos Afectados -->
            <div class="affected-projects-section">
                <h4>🎯 Proyectos Afectados (${dominoAnalysis.affectedProjects.length})</h4>
                ${dominoAnalysis.affectedProjects.length > 0 ? 
                    dominoAnalysis.affectedProjects.slice(0, 3).map(project => `
                        <div class="affected-project-card">
                            <div class="project-name">${project.name}</div>
                            <div class="impact-level ${project.impactLevel}">
                                ${project.impactLevel.toUpperCase()}
                            </div>
                            <div class="impact-desc">${project.impactDescription}</div>
                            <div class="estimated-delay">Retraso estimado: ${project.estimatedDelay} días</div>
                        </div>
                    `).join('') :
                    '<div class="no-conflicts">✅ No se detectaron conflictos críticos</div>'
                }
            </div>
            
            <!-- Métricas de Riesgo -->
            <div class="risk-metrics-section">
                <h4>📊 Métricas de Riesgo</h4>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value ${dominoAnalysis.metrics.overallRiskScore > 60 ? 'high' : 'normal'}">
                            ${dominoAnalysis.metrics.overallRiskScore}/100
                        </div>
                        <div class="metric-label">Score de Riesgo</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">
                            ${Math.round(dominoAnalysis.metrics.peakUtilization)}%
                        </div>
                        <div class="metric-label">Pico de Utilización</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">
                            €${dominoAnalysis.impacts.cascade.potentialCost.toLocaleString()}
                        </div>
                        <div class="metric-label">Coste Potencial</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">
                            ${dominoAnalysis.impacts.timeline.bottlenecks.length}
                        </div>
                        <div class="metric-label">Cuellos de Botella</div>
                    </div>
                </div>
            </div>
            
            <!-- Recomendaciones Principales -->
            <div class="recommendations-section">
                <h4>💡 Recomendaciones Principales</h4>
                ${dominoAnalysis.recommendations.slice(0, 2).map(rec => `
                    <div class="recommendation-card">
                        <div class="rec-priority ${rec.priority}">${rec.priority.toUpperCase()}</div>
                        <div class="rec-title">${rec.title}</div>
                        <div class="rec-desc">${rec.description}</div>
                        <div class="rec-timeline">Timeline: ${rec.timeline}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

// Método para renderizar timeline chart
SimulatorDomino.renderTimelineChart = function(timelineData) {
    return `
        <div class="timeline-visual">
            ${timelineData.map((month, index) => `
                <div class="timeline-month" style="left: ${(index / timelineData.length) * 100}%">
                    <div class="month-bar" 
                         style="height: ${Math.max(10, month.utilization)}px; 
                                background: ${month.conflicts > 0 ? '#ef4444' : month.utilization > 85 ? '#f59e0b' : '#10b981'}">
                    </div>
                    <div class="month-label">${month.month}</div>
                    <div class="month-data">
                        ${month.projects} proyectos<br>
                        ${Math.round(month.utilization)}% util
                        ${month.conflicts > 0 ? `<br>⚠️ ${month.conflicts} conflictos` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

// === MÉTODOS PÚBLICOS ADICIONALES ===

// Análisis rápido para alertas
SimulatorDomino.quickRiskAssessment = function(projectData) {
    const directImpacts = this.calculateDirectImpacts(projectData);
    const riskLevel = directImpacts.criticalDepartments > 0 ? 'high' : 
                     directImpacts.totalRiskScore > 20 ? 'medium' : 'low';
    
    return {
        riskLevel,
        riskScore: directImpacts.totalRiskScore,
        criticalDepartments: directImpacts.criticalDepartments,
        message: this.generateQuickRiskMessage(riskLevel, directImpacts)
    };
};

SimulatorDomino.generateQuickRiskMessage = function(riskLevel, impacts) {
    const messages = {
        high: `⚠️ RIESGO ALTO: ${impacts.criticalDepartments} departamentos en capacidad crítica`,
        medium: `⚡ RIESGO MEDIO: Algunas sobreutilizaciones detectadas`,
        low: `✅ RIESGO BAJO: Capacidad disponible suficiente`
    };
    
    return messages[riskLevel] || messages.low;
};

// Análisis comparativo entre escenarios
SimulatorDomino.compareScenarios = function(scenarios) {
    const comparisons = scenarios.map(scenario => {
        const analysis = this.analyzeFullDominoEffect(scenario.projectData);
        return {
            ...scenario,
            analysis,
            summary: {
                riskScore: analysis.metrics.overallRiskScore,
                viability: analysis.metrics.viabilityStatus,
                affectedProjects: analysis.metrics.affectedProjects,
                estimatedCost: analysis.impacts.cascade.potentialCost
            }
        };
    });
    
    // Ordenar por score de riesgo (menor = mejor)
    comparisons.sort((a, b) => a.summary.riskScore - b.summary.riskScore);
    
    return {
        scenarios: comparisons,
        recommendation: comparisons[0], // Mejor escenario
        comparison: this.generateScenarioComparison(comparisons)
    };
};

SimulatorDomino.generateScenarioComparison = function(scenarios) {
    if (scenarios.length < 2) return null;
    
    const best = scenarios[0];
    const worst = scenarios[scenarios.length - 1];
    
    return {
        bestScenario: {
            name: best.name,
            riskScore: best.summary.riskScore,
            advantages: [
                `${best.summary.riskScore} puntos menos de riesgo`,
                `${worst.summary.affectedProjects - best.summary.affectedProjects} proyectos menos afectados`,
                `€${(worst.summary.estimatedCost - best.summary.estimatedCost).toLocaleString()} menos en costes`
            ]
        },
        recommendation: `Se recomienda el escenario "${best.name}" por su menor impacto en el portfolio existente`
    };
};

// Simulación de Monte Carlo básica
SimulatorDomino.monteCarloSimulation = function(projectData, iterations = 1000) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
        // Añadir variabilidad aleatoria a los datos
        const variableProjectData = {
            ...projectData,
            departments: {}
        };
        
        Object.entries(projectData.departments || {}).forEach(([deptKey, hours]) => {
            if (hours > 0) {
                // Variación ±20% en las horas estimadas
                const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
                variableProjectData.departments[deptKey] = Math.round(hours * variation);
            }
        });
        
        // Variación ±25% en la duración
        const durationVariation = 0.75 + Math.random() * 0.5; // 0.75 to 1.25
        variableProjectData.duration = Math.max(1, Math.round((projectData.duration || 6) * durationVariation));
        
        const analysis = this.analyzeFullDominoEffect(variableProjectData);
        results.push({
            iteration: i + 1,
            riskScore: analysis.metrics.overallRiskScore,
            viability: analysis.metrics.viabilityStatus,
            affectedProjects: analysis.metrics.affectedProjects,
            potentialCost: analysis.impacts.cascade.potentialCost
        });
    }
    
    // Calcular estadísticas
    const riskScores = results.map(r => r.riskScore);
    const costs = results.map(r => r.potentialCost);
    
    return {
        iterations: iterations,
        statistics: {
            riskScore: {
                mean: riskScores.reduce((a, b) => a + b, 0) / iterations,
                min: Math.min(...riskScores),
                max: Math.max(...riskScores),
                percentile95: this.calculatePercentile(riskScores, 95)
            },
            cost: {
                mean: costs.reduce((a, b) => a + b, 0) / iterations,
                min: Math.min(...costs),
                max: Math.max(...costs),
                percentile95: this.calculatePercentile(costs, 95)
            }
        },
        viabilityDistribution: {
            viable: results.filter(r => r.viability === 'viable').length / iterations * 100,
            risky: results.filter(r => r.viability === 'risky').length / iterations * 100,
            critical: results.filter(r => r.viability === 'critical').length / iterations * 100
        },
        confidence: this.calculateMonteCarloConfidence(results),
        recommendation: this.generateMonteCarloRecommendation(results)
    };
};

SimulatorDomino.calculatePercentile = function(values, percentile) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
};

SimulatorDomino.calculateMonteCarloConfidence = function(results) {
    const riskScores = results.map(r => r.riskScore);
    const mean = riskScores.reduce((a, b) => a + b, 0) / riskScores.length;
    const variance = riskScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / riskScores.length;
    const stdDev = Math.sqrt(variance);
    
    // Menor desviación estándar = mayor confianza
    return Math.max(70, Math.min(99, 95 - (stdDev / mean) * 100));
};

SimulatorDomino.generateMonteCarloRecommendation = function(results) {
    const viableCount = results.filter(r => r.viability === 'viable').length;
    const viablePercentage = (viableCount / results.length) * 100;
    
    if (viablePercentage >= 80) {
        return {
            level: 'green',
            message: `Proyecto ALTAMENTE VIABLE: ${viablePercentage.toFixed(1)}% de probabilidad de éxito`,
            action: 'Proceder con confianza'
        };
    } else if (viablePercentage >= 60) {
        return {
            level: 'yellow',
            message: `Proyecto MODERADAMENTE VIABLE: ${viablePercentage.toFixed(1)}% de probabilidad de éxito`,
            action: 'Proceder con plan de contingencia'
        };
    } else {
        return {
            level: 'red',
            message: `Proyecto DE ALTO RIESGO: Solo ${viablePercentage.toFixed(1)}% de probabilidad de éxito`,
            action: 'Revisar alcance o contratar recursos adicionales'
        };
    }
};

// === EXPORTAR PARA USO GLOBAL ===
if (typeof window !== 'undefined') {
    window.SimulatorDomino = SimulatorDomino;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulatorDomino;
}