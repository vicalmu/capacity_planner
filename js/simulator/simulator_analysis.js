// simulator-analysis.js - Motor de análisis y cálculos del simulador

const SimulatorAnalysis = {

    // === ANÁLISIS DE IMPACTO (STEP 3) ===
    performImpactAnalysis: function() {
        SimulatorCore.state.analysisResults = {
            impacts: [],
            viability: 'calculating',
            riskScore: 0
        };
        
        // Simulate analysis delay
        setTimeout(() => {
            const impacts = [];
            let riskScore = 0;
            let viableCount = 0;
            
            Object.entries(SimulatorCore.state.projectData.departments).forEach(([deptKey, hours]) => {
                if (hours > 0) {
                    const dept = NetberryData.departments[deptKey];
                    if (!dept) return;
                    
                    const newUtil = this.calculateNewUtilization(deptKey, hours);
                    
                    let status = 'viable';
                    let risk = 0;
                    
                    if (newUtil > 100) {
                        status = 'critical';
                        risk = 30 + (newUtil - 100) * 2;
                    } else if (newUtil > 95) {
                        status = 'risky';
                        risk = 15 + (newUtil - 95) * 3;
                    } else if (newUtil > 85) {
                        status = 'warning';
                        risk = (newUtil - 85) * 1.5;
                    } else {
                        viableCount++;
                    }
                    
                    riskScore += risk;
                    
                    impacts.push({
                        department: dept.name,
                        deptKey,
                        currentUtilization: dept.utilization,
                        newUtilization: newUtil,
                        hoursRequired: hours,
                        status,
                        risk
                    });
                }
            });
            
            // Determine overall viability
            let overallViability = 'viable';
            if (riskScore > 50) overallViability = 'critical';
            else if (riskScore > 25) overallViability = 'risky';
            
            SimulatorCore.state.analysisResults = {
                impacts,
                viability: overallViability,
                riskScore: Math.min(100, riskScore),
                viableCount
            };
            
            // Re-render step 3 with results
            if (SimulatorCore.state.currentStep === 3) {
                SimulatorSteps.renderStep3();
            }
        }, 1500);
    },

    calculateNewUtilization: function(deptKey, hours) {
        const dept = NetberryData.departments[deptKey];
        if (!dept) return 0;
        
        const monthlyCapacity = dept.capacity / 12;
        const monthlyHours = hours / (SimulatorCore.state.projectData.duration || 6);
        const newUtil = dept.utilization + (monthlyHours / monthlyCapacity * 100);
        
        return Math.max(0, newUtil);
    },

    // === ANÁLISIS DE EFECTO DOMINÓ (STEP 4) ===
    performDominoAnalysis: function() {
        // Use the advanced domino analysis if available
        if (typeof SimulatorDomino !== 'undefined') {
            setTimeout(() => {
                const dominoAnalysis = SimulatorDomino.analyzeFullDominoEffect(
                    SimulatorCore.state.projectData
                );
                
                SimulatorCore.state.dominoEffects = {
                    affectedProjects: dominoAnalysis.affectedProjects || [],
                    riskMetrics: dominoAnalysis.metrics || {
                        delayedProjects: 0,
                        additionalCost: 0,
                        resourceConflicts: 0
                    },
                    timeline: dominoAnalysis.impacts?.timeline?.timelineData || this.generateSimpleTimeline()
                };
                
                // Re-render step 4 with results
                if (SimulatorCore.state.currentStep === 4) {
                    SimulatorSteps.renderStep4();
                }
            }, 2000);
        } else {
            // Fallback to simple analysis
            this.performSimpleDominoAnalysis();
        }
    },

    performSimpleDominoAnalysis: function() {
        setTimeout(() => {
            const affectedProjects = this.identifyAffectedProjects();
            const riskMetrics = this.calculateSimpleRiskMetrics(affectedProjects);
            const timeline = this.generateSimpleTimeline();
            
            SimulatorCore.state.dominoEffects = {
                affectedProjects,
                riskMetrics,
                timeline
            };
            
            // Re-render step 4 with results
            if (SimulatorCore.state.currentStep === 4) {
                SimulatorSteps.renderStep4();
            }
        }, 2000);
    },

    identifyAffectedProjects: function() {
        const affectedProjects = [];
        const newProjectDepts = Object.keys(SimulatorCore.state.projectData.departments || {})
            .filter(dept => SimulatorCore.state.projectData.departments[dept] > 0);
        
        NetberryData.projects.forEach(project => {
            const hasConflict = project.departments.some(dept => newProjectDepts.includes(dept));
            
            if (hasConflict) {
                const impactLevel = Math.random() > 0.6 ? 'high' : 'medium';
                const estimatedDelay = impactLevel === 'high' ? 
                    Math.floor(Math.random() * 20) + 10 : 
                    Math.floor(Math.random() * 10) + 3;
                
                affectedProjects.push({
                    ...project,
                    impactLevel,
                    estimatedDelay,
                    description: this.generateImpactDescription(impactLevel)
                });
            }
        });
        
        return affectedProjects.slice(0, 4); // Limit to top 4
    },

    generateImpactDescription: function(level) {
        const descriptions = {
            high: [
                'Conflicto crítico de recursos - retraso significativo',
                'Sobreutilización detectada - requiere acción inmediata',
                'Impacto severo en cronograma'
            ],
            medium: [
                'Conflicto moderado - ajustes requeridos',
                'Ligera sobreutilización - monitoreo necesario',
                'Posible afectación en timeline'
            ],
            low: [
                'Conflicto menor - seguimiento preventivo',
                'Utilización límite alcanzada',
                'Impacto mínimo esperado'
            ]
        };
        
        const options = descriptions[level] || descriptions.medium;
        return options[Math.floor(Math.random() * options.length)];
    },

    calculateSimpleRiskMetrics: function(affectedProjects) {
        const delayedProjects = affectedProjects.filter(p => p.impactLevel === 'high').length;
        const totalDelay = affectedProjects.reduce((sum, p) => sum + p.estimatedDelay, 0);
        const additionalCost = totalDelay * 1200; // €1200 per day
        
        return {
            delayedProjects,
            additionalCost,
            resourceConflicts: affectedProjects.length
        };
    },

    generateSimpleTimeline: function() {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        return months.map((month, index) => {
            const baseUtilization = 70 + Math.random() * 25;
            const hasNewProject = index >= 2 && index <= 8; // Project runs Mar-Sep
            const utilization = hasNewProject ? baseUtilization + 10 + Math.random() * 15 : baseUtilization;
            
            return {
                month,
                projects: Math.floor(Math.random() * 6) + 3,
                utilization: Math.min(120, utilization),
                conflicts: utilization > 95 ? Math.floor(Math.random() * 2) + 1 : 0
            };
        });
    },

    // === GENERACIÓN DE RECOMENDACIONES (STEP 5) ===
    generateRecommendations: function() {
        setTimeout(() => {
            const viability = SimulatorCore.state.analysisResults?.viability || 'viable';
            const impacts = SimulatorCore.state.analysisResults?.impacts || [];
            const dominoEffects = SimulatorCore.state.dominoEffects || {};
            
            const recommendations = this.createRecommendations(viability, impacts, dominoEffects);
            const executiveSummary = this.createExecutiveSummary(viability);
            const actionPlan = this.createActionPlan(viability);
            
            SimulatorCore.state.recommendations = {
                recommendations,
                executiveSummary,
                actionPlan
            };
            
            // Re-render step 5 with results
            if (SimulatorCore.state.currentStep === 5) {
                SimulatorSteps.renderStep5();
            }
        }, 1500);
    },

    createRecommendations: function(viability, impacts, dominoEffects) {
        const recommendations = [];
        
        // Recommendations based on viability
        if (viability === 'critical') {
            recommendations.push({
                type: 'hiring',
                icon: '👥',
                title: 'Contratación Urgente Requerida',
                description: 'Se detectaron departamentos en capacidad crítica. Recomendamos contratación inmediata para asegurar la viabilidad del proyecto.',
                confidence: 92,
                actions: ['Ver Plan de Contratación', 'Calcular ROI']
            });
            
            recommendations.push({
                type: 'scope',
                icon: '✂️',
                title: 'Reducción de Alcance',
                description: 'Considerar dividir el proyecto en fases para distribuir mejor la carga de trabajo temporal.',
                confidence: 88,
                actions: ['Ver Propuesta de Fases', 'Simular División']
            });
        } else if (viability === 'risky') {
            recommendations.push({
                type: 'timeline',
                icon: '📅',
                title: 'Optimización de Timeline',
                description: 'Ajustar fechas de inicio o duración permitiría una mejor distribución de recursos y menor riesgo.',
                confidence: 85,
                actions: ['Ver Cronograma Optimizado', 'Evaluar Impacto']
            });
        }
        
        // Always add resource optimization
        recommendations.push({
            type: 'optimization',
            icon: '⚡',
            title: 'Optimización de Recursos',
            description: 'Reasignar cargas de trabajo entre departamentos puede mejorar la eficiencia general del proyecto.',
            confidence: 90,
            actions: ['Ver Sugerencias', 'Aplicar Cambios']
        });
        
        // Add monitoring recommendation
        recommendations.push({
            type: 'monitoring',
            icon: '📊',
            title: 'Monitoreo Continuo',
            description: 'Implementar seguimiento regular de capacidad para detectar desviaciones y ajustar sobre la marcha.',
            confidence: 95,
            actions: ['Configurar Alertas', 'Ver Dashboard']
        });
        
        return recommendations.slice(0, 4); // Max 4 recommendations
    },

    createExecutiveSummary: function(viability) {
        const summaries = {
            viable: {
                title: '✅ Proyecto Aprobado para Ejecución',
                content: 'El análisis confirma que el proyecto es completamente viable con los recursos actuales. La utilización departamental se mantiene dentro de rangos óptimos y no se detectan conflictos significativos con el portfolio existente.'
            },
            risky: {
                title: '⚠️ Proyecto Viable con Monitoreo Requerido',
                content: 'El proyecto es viable pero requiere gestión activa de riesgos. Se han identificado departamentos que estarán cerca de su capacidad máxima. Recomendamos implementar un plan de monitoreo intensivo.'
            },
            critical: {
                title: '🚨 Proyecto Requiere Acciones Correctivas',
                content: 'El proyecto en su forma actual presenta riesgos significativos. Se requieren acciones correctivas inmediatas: contratación adicional, reducción de alcance o replanificación temporal antes de proceder.'
            }
        };
        
        return summaries[viability] || summaries.viable;
    },

    createActionPlan: function(viability) {
        const plans = {
            viable: [
                { title: 'Confirmar disponibilidad', description: 'Validar recursos finales con jefes de departamento' },
                { title: 'Planificar kick-off', description: 'Preparar reunión de inicio y definir hitos clave' },
                { title: 'Establecer monitoreo', description: 'Configurar seguimiento semanal de progreso y capacidad' },
                { title: 'Ejecutar proyecto', description: 'Iniciar desarrollo según cronograma planificado' }
            ],
            risky: [
                { title: 'Preparar contingencias', description: 'Identificar recursos adicionales o proveedores externos' },
                { title: 'Intensificar monitoreo', description: 'Implementar seguimiento diario en departamentos críticos' },
                { title: 'Revisar quincenalmente', description: 'Evaluar necesidad de ajustes cada 2 semanas' },
                { title: 'Inicio controlado', description: 'Comenzar con fase piloto y validaciones continuas' }
            ],
            critical: [
                { title: 'Evaluar recursos adicionales', description: 'Analizar opciones de contratación o subcontratación' },
                { title: 'Replantear alcance', description: 'Considerar división en fases o reducción de funcionalidades' },
                { title: 'Buscar alternativas', description: 'Explorar outsourcing parcial o replanificación temporal' },
                { title: 'Re-evaluar proyecto', description: 'Nueva simulación después de implementar cambios' }
            ]
        };
        
        return plans[viability] || plans.viable;
    },

    // === UTILITIES ===
    getViabilityColor: function(viability) {
        const colors = {
            viable: '#10b981',
            risky: '#f59e0b',
            critical: '#ef4444'
        };
        return colors[viability] || colors.viable;
    },

    getViabilityIcon: function(viability) {
        const icons = {
            viable: '✅',
            risky: '⚠️',
            critical: '❌'
        };
        return icons[viability] || icons.viable;
    },

    calculateConfidenceScore: function() {
        // Base confidence
        let confidence = 85;
        
        // Adjust based on data quality
        const dataQuality = this.assessDataQuality();
        confidence += (dataQuality - 70) * 0.3;
        
        // Adjust based on analysis complexity
        const complexity = this.getAnalysisComplexity();
        confidence -= complexity * 2;
        
        return Math.max(65, Math.min(98, Math.round(confidence)));
    },

    assessDataQuality: function() {
        // Simple data quality assessment
        const projectData = SimulatorCore.state.projectData;
        let quality = 50;
        
        if (projectData.name) quality += 10;
        if (projectData.startDate) quality += 10;
        if (projectData.budget > 0) quality += 10;
        if (Object.keys(projectData.departments || {}).length > 0) quality += 20;
        
        return quality;
    },

    getAnalysisComplexity: function() {
        const deptCount = Object.keys(SimulatorCore.state.projectData.departments || {}).length;
        const duration = SimulatorCore.state.projectData.duration || 6;
        
        let complexity = 0;
        if (deptCount > 4) complexity += 3;
        if (duration > 12) complexity += 2;
        
        return complexity;
    }
};

// Exponer para uso global
window.SimulatorAnalysis = SimulatorAnalysis;