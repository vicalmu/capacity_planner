    performImpactAnalysis: function() {
        this.state.analysisResults = {
            impacts: [],
            viability: 'calculating',
            riskScore: 0
        };
        
        // Simulate analysis delay
        setTimeout(() => {
            const impacts = [];
            let riskScore = 0;
            let viableCount = 0;
            
            Object.entries(this.state.projectData.departments).forEach(([deptKey, hours]) => {
                if (hours > 0) {
                    const dept = NetberryData.departments[deptKey];
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
            
            this.state.analysisResults = {
                impacts,
                viability: overallViability,
                riskScore: Math.min(100, riskScore),
                viableCount
            };
            
            this.renderStep3();
        }, 1500);
    },

    renderStep3: function() {
        if (!this.state.analysisResults || this.state.analysisResults.viability === 'calculating') {
            this.renderStep3Loading();
            return;
        }
        
        const impactGrid = document.getElementById('impactGrid');
        const viabilityCard = document.getElementById('viabilityCard');
        
        if (impactGrid) {
            impactGrid.innerHTML = this.state.analysisResults.impacts.map(impact => `
                <div class="impact-card ${impact.status}">
                    <div class="impact-dept-name">${impact.department}</div>
                    
                    <div class="impact-gauge">
                        <div class="gauge-bg">
                            <div class="gauge-fill">
                                ${Math.round(impact.newUtilization)}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="impact-details">
                        <div class="impact-before">${impact.currentUtilization.toFixed(1)}% actual</div>
                        <div class="impact-after">${impact.hoursRequired}h requeridas</div>
                    </div>
                </div>
            `).join('');
        }
        
        if (viabilityCard) {
            const viability = this.state.analysisResults.viability;
            const score = 100 - this.state.analysisResults.riskScore;
            
            const statusConfig = {
                viable: { 
                    text: 'PROYECTO VIABLE', 
                    color: '#10b981',
                    icon: '✅'
                },
                risky: { 
                    text: 'PROYECTO CON RIESGOS', 
                    color: '#f59e0b',
                    icon: '⚠️'
                },
                critical: { 
                    text: 'PROYECTO NO VIABLE', 
                    color: '#ef4444',
                    icon: '❌'
                }
            };
            
            const config = statusConfig[viability];
            
            viabilityCard.querySelector('.viability-icon').textContent = config.icon;
            viabilityCard.querySelector('.viability-status').textContent = config.text;
            viabilityCard.querySelector('.viability-status').style.color = config.color;
            viabilityCard.querySelector('.viability-score').textContent = Math.round(score) + '/100';
            viabilityCard.querySelector('.viability-score').style.color = config.color;
            
            // Update card border
            viabilityCard.style.borderColor = config.color;
        }
    },

    renderStep3Loading: function() {
        const impactGrid = document.getElementById('impactGrid');
        const viabilityCard = document.getElementById('viabilityCard');
        
        if (impactGrid) {
            impactGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #64748b;">
                    <div style="font-size: 3rem; margin-bottom: 20px; animation: pulse 1s infinite;">🧮</div>
                    <h3>Analizando impacto en departamentos...</h3>
                    <p>Calculando utilización y viabilidad</p>
                </div>
            `;
        }
        
        if (viabilityCard) {
            viabilityCard.querySelector('.viability-status').textContent = 'Analizando viabilidad...';
            viabilityCard.querySelector('.viability-score').textContent = '--';
        }
    },

    // === STEP 4: DOMINO ANALYSIS ===
    performDominoAnalysis: function() {
        // Simulate complex domino effect calculation
        setTimeout(() => {
            this.state.dominoEffects = this.calculateDominoEffects();
            this.renderStep4();
        }, 2000);
    },

    calculateDominoEffects: function() {
        const affectedProjects = [];
        const riskMetrics = {
            delayedProjects: 0,
            additionalCost: 0,
            resourceConflicts: 0
        };
        
        // Analyze impact on existing projects
        NetberryData.projects.forEach(project => {
            const hasConflict = project.departments.some(deptKey => {
                const requiredHours = this.state.projectData.departments[deptKey] || 0;
                if (requiredHours > 0) {
                    const newUtil = this.calculateNewUtilization(deptKey, requiredHours);
                    return newUtil > 95; // Threshold for conflict
                }
                return false;
            });
            
            if (hasConflict) {
                const impactLevel = Math.random() > 0.5 ? 'medium' : 'high';
                const delayDays = impactLevel === 'high' ? 
                    Math.floor(Math.random() * 30) + 15 : 
                    Math.floor(Math.random() * 14) + 7;
                
                affectedProjects.push({
                    ...project,
                    impactLevel,
                    estimatedDelay: delayDays,
                    description: this.generateImpactDescription(project, impactLevel)
                });
                
                if (impactLevel === 'high') {
                    riskMetrics.delayedProjects++;
                    riskMetrics.additionalCost += delayDays * 1500; // €1500 por día de retraso
                }
                riskMetrics.resourceConflicts++;
            }
        });
        
        return {
            affectedProjects: affectedProjects.slice(0, 5), // Top 5 most affected
            riskMetrics,
            timeline: this.generateTimelineData()
        };
    },

    generateImpactDescription: function(project, level) {
        const descriptions = {
            high: [
                `Retraso significativo por conflicto de recursos`,
                `Necesita reasignación de equipo`,
                `Impacto en fecha de entrega crítica`
            ],
            medium: [
                `Posible retraso menor`,
                `Requiere ajuste de cronograma`,
                `Afectación leve en recursos`
            ]
        };
        
        const options = descriptions[level] || descriptions.medium;
        return options[Math.floor(Math.random() * options.length)];
    },

    generateTimelineData: function() {
        // Generate timeline visualization data
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        return months.map((month, index) => ({
            month,
            projects: Math.floor(Math.random() * 8) + 2,
            utilization: 60 + Math.random() * 40,
            conflicts: index > 6 ? Math.floor(Math.random() * 3) : 0 // More conflicts in later months
        }));
    },

    renderStep4: function() {
        if (!this.state.dominoEffects) {
            this.renderStep4Loading();
            return;
        }
        
        this.renderDominoVisualization();
        this.renderAffectedProjects();
        this.renderRiskMetrics();
    },

    renderStep4Loading: function() {
        const dominoViz = document.getElementById('dominoViz');
        if (dominoViz) {
            dominoViz.innerHTML = `
                <div style="text-align: center; padding: 100px; color: #64748b;">
                    <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1s infinite;">⚡</div>
                    <h3>Analizando efecto dominó...</h3>
                    <p>Calculando impacto temporal en proyectos existentes</p>
                </div>
            `;
        }
    },

    renderDominoVisualization: function() {
        const container = document.getElementById('dominoViz');
        if (!container) return;
        
        const timeline = this.state.dominoEffects.timeline;
        
        container.innerHTML = `
            <h3 style="margin-bottom: 20px; color: #111827; display: flex; align-items: center; gap: 8px;">
                ⚡ Timeline de Impacto 2025
            </h3>
            <div class="domino-timeline">
                <div class="timeline-axis"></div>
                <div class="timeline-months">
                    ${timeline.map(data => `<span>${data.month}</span>`).join('')}
                </div>
                <div class="domino-blocks">
                    ${this.renderTimelineBlocks(timeline)}
                </div>
            </div>
        `;
    },

    renderTimelineBlocks: function(timeline) {
        return timeline.map((data, index) => {
            const left = (index / timeline.length) * 100;
            const width = 100 / timeline.length - 2;
            const height = Math.max(20, (data.utilization / 100) * 120);
            const bottom = 50;
            
            const hasConflicts = data.conflicts > 0;
            const className = hasConflicts ? 'domino-block affected' : 'domino-block';
            
            return `
                <div class="${className}" 
                     style="left: ${left}%; width: ${width}%; height: ${height}px; bottom: ${bottom}px;"
                     title="${data.month}: ${data.projects} proyectos, ${data.utilization.toFixed(1)}% utilización">
                    ${data.projects}
                </div>
            `;
        }).join('');
    },

    renderAffectedProjects: function() {
        const container = document.getElementById('affectedProjects');
        if (!container) return;
        
        const projects = this.state.dominoEffects.affectedProjects;
        
        container.innerHTML = `
            <h3>🎯 Proyectos Afectados</h3>
            ${projects.length === 0 ? 
                '<p style="color: #64748b; text-align: center; padding: 40px;">No se detectaron conflictos con proyectos existentes</p>' :
                projects.map(project => `
                    <div class="affected-project-item">
                        <div class="project-info">
                            <div class="project-name">${project.name}</div>
                            <div class="project-impact-desc">${project.description}</div>
                        </div>
                        <div class="impact-badge ${project.impactLevel}">
                            ${project.estimatedDelay} días de retraso
                        </div>
                    </div>
                `).join('')
            }
        `;
    },

    renderRiskMetrics: function() {
        const container = document.getElementById('riskMetrics');
        if (!container) return;
        
        const metrics = this.state.dominoEffects.riskMetrics;
        
        container.innerHTML = `
            <div class="risk-metric">
                <div class="risk-metric-value" style="color: #ef4444;">
                    ${metrics.delayedProjects}
                </div>
                <div class="risk-metric-label">Proyectos Retrasados</div>
            </div>
            <div class="risk-metric">
                <div class="risk-metric-value" style="color: #f59e0b;">
                    €${metrics.additionalCost.toLocaleString()}
                </div>
                <div class="risk-metric-label">Coste Adicional</div>
            </div>
            <div class="risk-metric">
                <div class="risk-metric-value" style="color: #dc2626;">
                    ${metrics.resourceConflicts}
                </div>
                <div class="risk-metric-label">Conflictos de Recursos</div>
            </div>
        `;
    },

    // === STEP 5: AI RECOMMENDATIONS ===
    generateRecommendations: function() {
        setTimeout(() => {
            this.state.recommendations = this.calculateRecommendations();
            this.renderStep5();
        }, 1500);
    },

    calculateRecommendations: function() {
        const viability = this.state.analysisResults?.viability || 'viable';
        const impacts = this.state.analysisResults?.impacts || [];
        const dominoEffects = this.state.dominoEffects || {};
        
        const recommendations = [];
        
        // Generate strategic recommendations based on analysis
        if (viability === 'critical') {
            recommendations.push({
                type: 'hiring',
                icon: '👥',
                title: 'Contratación Urgente Requerida',
                description: 'Recomendamos contratar 2-3 recursos adicionales en departamentos críticos antes de iniciar el proyecto.',
                confidence: 92,
                actions: ['Ver Plan de Contratación', 'Calcular ROI']
            });
            
            recommendations.push({
                type: 'scope',
                icon: '✂️',
                title: 'Reducción de Alcance',
                description: 'Considerar dividir el proyecto en 2 fases para distribuir la carga de trabajo temporal.',
                confidence: 88,
                actions: ['Ver Propuesta', 'Simular Fases']
            });
        } else if (viability === 'risky') {
            recommendations.push({
                type: 'timeline',
                icon: '📅',
                title: 'Optimización de Timeline',
                description: 'Retrasar el inicio 4-6 semanas permitiría una distribución más equilibrada de recursos.',
                confidence: 85,
                actions: ['Ver Cronograma', 'Evaluar Impacto']
            });
        }
        
        // Always add resource optimization
        recommendations.push({
            type: 'optimization',
            icon: '⚡',
            title: 'Optimización de Recursos',
            description: 'Reasignar 40h de PHP a .NET y 20h de UX a QA mejoraría la eficiencia general un 12%.',
            confidence: 94,
            actions: ['Aplicar Cambios', 'Ver Detalles']
        });
        
        // Add monitoring recommendation
        recommendations.push({
            type: 'monitoring',
            icon: '📊',
            title: 'Monitoreo Activo',
            description: 'Implementar check-points semanales de capacidad para detectar desviaciones tempranamente.',
            confidence: 96,
            actions: ['Configurar Alertas', 'Ver Template']
        });
        
        return {
            recommendations,
            executiveSummary: this.generateExecutiveSummary(viability),
            actionPlan: this.generateActionPlan(viability)
        };
    },

    generateExecutiveSummary: function(viability) {
        const summaries = {
            viable: {
                title: '✅ Proyecto Aprobado para Ejecución',
                content: 'El análisis confirma que el proyecto es completamente viable con los recursos actuales. La utilización departamental se mantiene dentro de rangos óptimos y no se detectan conflictos significativos con el portfolio existente.'
            },
            risky: {
                title: '⚠️ Proyecto Viable con Monitoreo Requerido',
                content: 'El proyecto es viable pero requiere gestión activa de riesgos. Se han identificado algunos departamentos que estarán cerca de su capacidad máxima. Se recomienda implementar un plan de contingencia.'
            },
            critical: {
                title: '🚨 Proyecto Requiere Acciones Correctivas',
                content: 'El proyecto en su forma actual presenta riesgos significativos de incumplimiento. Se requieren acciones correctivas inmediatas: contratación adicional, reducción de alcance o replanificación temporal.'
            }
        };
        
        return summaries[viability] || summaries.viable;
    },

    generateActionPlan: function(viability) {
        const plans = {
            viable: [
                { title: 'Confirmar recursos', description: 'Validar disponibilidad final con jefes de departamento' },
                { title: 'Iniciar proyecto', description: 'Proceder con el kick-off según cronograma planificado' },
                { title: 'Monitoreo semanal', description: 'Establecer check-points de seguimiento de capacidad' }
            ],
            risky: [
                { title: 'Plan de contingencia', description: 'Preparar recursos adicionales o proveedores externos' },
                { title: 'Monitoreo diario', description: 'Implementar seguimiento diario en departamentos críticos' },
                { title: 'Revisión bi-semanal', description: 'Evaluar necesidad de ajustes cada 2 semanas' },
                { title: 'Iniciar con precaución', description: 'Proceder con inicio gradual y validaciones continuas' }
            ],
            critical: [
                { title: 'Evaluar contratación', description: 'Iniciar proceso de contratación en departamentos sobrecargados' },
                { title: 'Revisar alcance', description: 'Analizar posibilidad de dividir en fases o reducir funcionalidades' },
                { title: 'Buscar alternativas', description: 'Considerar outsourcing parcial o replanificación temporal' },
                { title: 'Re-evaluación', description: 'Nueva simulación después de implementar cambios' }
            ]
        };
        
        return plans[viability] || plans.viable;
    },

    renderStep5: function() {
        if (!this.state.recommendations) {
            this.renderStep5Loading();
            return;
        }
        
        this.renderExecutiveSummary();
        this.renderRecommendationsGrid();
        this.renderActionPlan();
    },

    renderStep5Loading: function() {
        const container = document.getElementById('executiveSummary');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; color: #64748b;">
                    <div style="font-size: 3rem; margin-bottom: 20px; animation: pulse 1s infinite;">🤖</div>
                    <h3>Generando recomendaciones inteligentes...</h3>
                    <p>La IA está analizando todos los datos para crear el plan óptimo</p>
                </div>
            `;
        }
    },

    renderExecutiveSummary: function() {
        const container = document.getElementById('executiveSummary');
        if (!container) return;
        
        const summary = this.state.recommendations.executiveSummary;
        
        container.innerHTML = `
            <div class="summary-title">${summary.title}</div>
            <div class="summary-content">${summary.content}</div>
        `;
    },

    renderRecommendationsGrid: function() {
        const container = document.getElementById('recommendationsGrid');
        if (!container) return;
        
        const recommendations = this.state.recommendations.recommendations;
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="rec-header">
                    <div class="rec-icon">${rec.icon}</div>
                    <div class="rec-title">${rec.title}</div>
                    <div class="rec-confidence">${rec.confidence}%</div>
                </div>
                <div class="rec-description">${rec.description}</div>
                <div class="rec-actions">
                    ${rec.actions.map(action => `
                        <button class="rec-action-btn ${rec.actions.indexOf(action) === 0 ? 'primary' : ''}"
                                onclick="SimulatorMode.handleRecommendationAction('${rec.type}', '${action}')">
                            ${action}
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    renderActionPlan: function() {
        const container = document.getElementById('actionPlan');
        if (!container) return;
        
        const actionPlan = this.state.recommendations.actionPlan;
        
        container.innerHTML = `
            <h3>📋 Plan de Acción Recomendado</h3>
            <div class="action-steps">
                ${actionPlan.map((step, index) => `
                    <div class="action-step">
                        <div class="step-number-action">${index + 1}</div>
                        <div class="step-content">
                            <div class="step-title">${step.title}</div>
                            <div class="step-description">${step.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // === VALIDATION AND UTILITIES ===
    validateCurrentStep: function() {
        switch (this.state.currentStep) {
            case 1:
                const name = document.getElementById('projectName').value.trim();
                if (!name) {
                    this.showNotification('Por favor, ingresa un nombre para el proyecto', 'error');
                    return false;
                }
                break;
                
            case 2:
                const hasResources = Object.values(this.state.projectData.departments)
                    .some(hours => hours > 0);
                if (!hasResources) {
                    this.showNotification('Por favor, asigna horas a al menos un departamento', 'error');
                    return false;
                }
                break;
        }
        
        return true;
    },

    saveCurrentStepData: function() {
        switch (this.state.currentStep) {
            case 1:
                this.state.projectData.name = document.getElementById('projectName').value;
                this.state.projectData.duration = parseInt(document.getElementById('projectDuration').value) || 6;
                this.state.projectData.startDate = document.getElementById('projectStartDate').value;
                this.state.projectData.budget = parseInt(document.getElementById('projectBudget').value) || 0;
                this.state.projectData.priority = document.getElementById('projectPriority').value;
                break;
        }
    },

    // === UI UPDATES ===
    updateProgress: function() {
        const progressFill = document.getElementById('progressFill');
        const progressPercent = (this.state.currentStep / this.state.totalSteps) * 100;
        
        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.state.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.state.currentStep) {
                step.classList.add('completed');
            }
        });
        
        // Update step number indicator
        document.getElementById('currentStepNumber').textContent = this.state.currentStep;
    },

    updateNavigation: function() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.state.currentStep === 1;
        }
        
        if (nextBtn) {
            if (this.state.currentStep === this.state.totalSteps) {
                nextBtn.textContent = 'Finalizar';
                nextBtn.onclick = () => this.finishSimulation();
            } else {
                nextBtn.textContent = 'Siguiente →';
                nextBtn.onclick = () => this.nextStep();
            }
        }
    },

    updateBreadcrumbs: function() {
        const currentStep = document.getElementById('currentStep');
        const stepNames = [
            '', 'Configuración de Proyecto', 'Requisitos de Recursos', 
            'Análisis de Impacto', 'Efecto Dominó', 'Recomendaciones'
        ];
        
        if (currentStep) {
            currentStep.textContent = stepNames[this.state.currentStep] || 'Simulador';
        }
    },

    // === EVENT HANDLING ===
    bindEvents: function() {
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Scenarios button
        const scenariosBtn = document.getElementById('scenariosBtn');
        if (scenariosBtn) {
            scenariosBtn.addEventListener('click', () => this.openScenariosModal());
        }
        
        // Auto-save every 30 seconds
        setInterval(() => {
            this.autoSave();
        }, 30000);
    },

    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key.toLowerCase()) {
                    case 'arrowright':
                        e.preventDefault();
                        this.nextStep();
                        break;
                    case 'arrowleft':
                        e.preventDefault();
                        this.previousStep();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveScenario();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetSimulation();
                        break;
                }
            }
        });
    },

    // === ACTION HANDLERS ===
    handleRecommendationAction: function(type, action) {
        console.log(`Acción recomendación: ${type} - ${action}`);
        this.showNotification(`Función "${action}" en desarrollo`, 'info');
    },

    finishSimulation: function() {
        this.showNotification('Simulación completada exitosamente', 'success');
        
        // Save scenario automatically
        this.saveScenario();
        
        // Option to return to home or start new simulation
        setTimeout(() => {
            if (confirm('¿Quieres iniciar una nueva simulación?')) {
                this.resetSimulation();
            } else {
                window.location.href = 'index.html';
            }
        }, 2000);
    },

    // === PANEL MANAGEMENT ===
    togglePanel: function() {
        const panel = document.getElementById('floatingPanel');
        this.state.panelOpen = !this.state.panelOpen;
        
        if (panel) {
            panel.classList.toggle('open', this.state.panelOpen);
        }
    },

    // === SCENARIO MANAGEMENT ===
    saveScenario: function() {
        const scenario = {
            id: Date.now(),
            name: this.state.projectData.name || `Escenario ${Date.now()}`,
            date: new Date().toISOString(),
            projectData: { ...this.state.projectData },
            analysisResults: this.state.analysisResults,
            dominoEffects: this.state.dominoEffects,
            recommendations: this.state.recommendations
        };
        
        this.state.savedScenarios.push(scenario);
        this.saveScenariosToStorage();
        
        this.showNotification(`Escenario "${scenario.name}" guardado`, 'success');
    },

    loadScenario: function() {
        // Implementation for loading scenarios
        this.showNotification('Funcionalidad de carga en desarrollo', 'info');
    },

    saveScenariosToStorage: function() {
        try {
            localStorage.setItem('netberry_scenarios', JSON.stringify(this.state.savedScenarios));
        } catch (e) {
            console.warn('No se pudieron guardar los escenarios:', e);
        }
    },

    loadSavedScenarios: function() {
        try {
            const saved = localStorage.getItem('netberry_scenarios');
            if (saved) {
                this.state.savedScenarios = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('No se pudieron cargar los escenarios guardados:', e);
        }
    },

    exportReport: function() {
        this.showNotification('Funcionalidad de exportación en desarrollo', 'info');
    },

    resetSimulation: function() {
        if (confirm('¿Estás seguro de que quieres reiniciar la simulación?')) {
            this.state.currentStep = 1;
            this.state.projectData = {
                name: '',
                duration: 6,
                startDate: '',
                budget: 0,
                priority: 'medium',
                type: 'custom',
                departments: {}
            };
            this.state.analysisResults = null;
            this.state.dominoEffects = null;
            this.state.recommendations = null;
            
            this.updateProgress();
            this.renderCurrentStep();
            this.updateNavigation();
            
            // Reset form fields
            document.getElementById('projectName').value = '';
            document.getElementById('projectDuration').value = '6';
            document.getElementById('projectBudget').value = '';
            
            this.showNotification('Simulación reiniciada', 'success');
        }
    },

    autoSave: function() {
        if (this.state.currentStep > 1 && this.state.projectData.name) {
            const autoSaveData = {
                currentStep: this.state.currentStep,
                projectData: this.state.projectData,
                timestamp: Date.now()
            };
            
            try {
                localStorage.setItem('netberry_simulator_autosave', JSON.stringify(autoSaveData));
            } catch (e) {
                console.warn('Auto-save failed:', e);
            }
        }
    },

    loadAutoSave: function() {
        try {
            const autoSave = localStorage.getItem('netberry_simulator_autosave');
            if (autoSave) {
                const data = JSON.parse(autoSave);
                const hoursSinceLastSave = (Date.now() - data.timestamp) / (1000 * 60 * 60);
                
                // Only restore if less than 24 hours old
                if (hoursSinceLastSave < 24) {
                    if (confirm('Se encontró una simulación en progreso. ¿Quieres continuarla?')) {
                        this.state.currentStep = data.currentStep;
                        this.state.projectData = data.projectData;
                        
                        this.updateProgress();
                        this.renderCurrentStep();
                        this.updateNavigation();
                        
                        this.showNotification('Simulación restaurada', 'success');
                        return true;
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load auto-save:', e);
        }
        return false;
    },

    // === MODAL MANAGEMENT ===
    openScenariosModal: function() {
        this.showNotification('Comparación de escenarios en desarrollo', 'info');
    },

    closeScenariosModal: function() {
        const modal = document.getElementById('scenariosModal');
        if (modal) {
            modal.style.display = 'none';
        }
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
    }
};

// === FUNCIONES GLOBALES ===
function goHome() {
    if (SimulatorMode.state.currentStep > 1) {
        if (confirm('¿Estás seguro de que quieres salir? Se perderá el progreso actual.')) {
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
}

// Exponer para uso global
window.SimulatorMode = SimulatorMode;// simulator-controller.js - Controlador completo para el Modo Simulador

const SimulatorMode = {
    // Estado del simulador
    state: {
        initialized: false,
        currentStep: 1,
        totalSteps: 5,
        projectData: {
            name: '',
            duration: 6,
            startDate: '',
            budget: 0,
            priority: 'medium',
            type: 'custom',
            departments: {}
        },
        analysisResults: null,
        dominoEffects: null,
        recommendations: null,
        savedScenarios: [],
        panelOpen: false
    },

    // === INICIALIZACIÓN ===
    init: function() {
        console.log('⚡ Inicializando Modo Simulador...');
        
        this.setupSimulatorMode();
        this.renderCurrentStep();
        this.bindEvents();
        this.loadSavedScenarios();
        
        this.state.initialized = true;
        console.log('✅ Modo Simulador inicializado correctamente');
    },

    setupSimulatorMode: function() {
        // Configurar tema visual
        document.documentElement.style.setProperty('--mode-color', '#dc2626');
        
        // Configurar fecha por defecto
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0];
        document.getElementById('projectStartDate').value = defaultDate;
        
        // Configurar shortcuts de teclado
        this.setupKeyboardShortcuts();
        
        // Inicializar progress
        this.updateProgress();
    },

    // === NAVEGACIÓN ENTRE PASOS ===
    nextStep: function() {
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.saveCurrentStepData();
        
        if (this.state.currentStep < this.state.totalSteps) {
            this.state.currentStep++;
            this.updateProgress();
            this.renderCurrentStep();
            this.updateNavigation();
            
            // Procesar datos si es necesario
            if (this.state.currentStep === 3) {
                this.performImpactAnalysis();
            } else if (this.state.currentStep === 4) {
                this.performDominoAnalysis();
            } else if (this.state.currentStep === 5) {
                this.generateRecommendations();
            }
        }
    },

    previousStep: function() {
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.updateProgress();
            this.renderCurrentStep();
            this.updateNavigation();
        }
    },

    goToStep: function(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.state.totalSteps) {
            this.state.currentStep = stepNumber;
            this.updateProgress();
            this.renderCurrentStep();
            this.updateNavigation();
        }
    },

    // === RENDERIZADO DE PASOS ===
    renderCurrentStep: function() {
        // Ocultar todos los pasos
        document.querySelectorAll('.simulation-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Mostrar paso actual
        const currentStepEl = document.getElementById(`step${this.state.currentStep}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }
        
        // Renderizar contenido específico
        switch (this.state.currentStep) {
            case 1:
                this.renderStep1();
                break;
            case 2:
                this.renderStep2();
                break;
            case 3:
                this.renderStep3();
                break;
            case 4:
                this.renderStep4();
                break;
            case 5:
                this.renderStep5();
                break;
        }
        
        // Actualizar breadcrumbs
        this.updateBreadcrumbs();
    },

    // === STEP 1: PROJECT CONFIGURATION ===
    renderStep1: function() {
        // Bind project type selection
        document.querySelectorAll('.project-type-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.project-type-card').forEach(c => 
                    c.classList.remove('selected'));
                card.classList.add('selected');
                
                const type = card.dataset.type;
                this.state.projectData.type = type;
                this.loadProjectTemplate(type);
            });
        });
        
        // Populate form with existing data
        if (this.state.projectData.name) {
            document.getElementById('projectName').value = this.state.projectData.name;
        }
    },

    loadProjectTemplate: function(type) {
        const templates = {
            web: {
                name: 'Desarrollo Web Enterprise',
                departments: { php: 300, ux: 120, qa: 80, devops: 60 },
                duration: 6,
                budget: 150000
            },
            mobile: {
                name: 'App Móvil Nativa',
                departments: { movilidad: 400, ux: 150, qa: 100, devops: 80 },
                duration: 8,
                budget: 200000
            },
            api: {
                name: 'API Microservicios',
                departments: { dotnet: 350, devops: 120, qa: 80 },
                duration: 4,
                budget: 100000
            },
            infra: {
                name: 'Migración Cloud',
                departments: { devops: 500, dotnet: 200, qa: 60 },
                duration: 3,
                budget: 80000
            }
        };
        
        if (templates[type]) {
            const template = templates[type];
            
            // Update UI
            document.getElementById('projectName').value = template.name;
            document.getElementById('projectDuration').value = template.duration;
            document.getElementById('projectBudget').value = template.budget;
            
            // Store template data
            this.state.projectData = {
                ...this.state.projectData,
                ...template,
                type: type
            };
            
            // Show template loaded notification
            this.showTemplateNotification(template.name);
        }
    },

    showTemplateNotification: function(templateName) {
        const suggestion = document.getElementById('templatesSuggestion');
        if (suggestion) {
            suggestion.querySelector('.suggestion-text').textContent = 
                `Template "${templateName}" cargado automáticamente`;
            suggestion.style.display = 'flex';
            
            setTimeout(() => {
                suggestion.style.display = 'none';
            }, 3000);
        }
    },

    // === STEP 2: RESOURCE REQUIREMENTS ===
    renderStep2: function() {
        const container = document.getElementById('resourcesGrid');
        if (!container) return;
        
        const departments = Object.entries(NetberryData.departments);
        
        container.innerHTML = departments.map(([key, dept]) => {
            const existingHours = this.state.projectData.departments[key] || 0;
            const currentUtil = dept.utilization;
            const newUtil = this.calculateNewUtilization(key, existingHours);
            const statusClass = newUtil > 100 ? 'critical' : newUtil > 90 ? 'warning' : 'safe';
            
            return `
                <div class="resource-card ${existingHours > 0 ? 'active' : ''}" data-dept="${key}">
                    <div class="resource-header">
                        <div class="resource-name">${dept.name}</div>
                        <div class="current-utilization">
                            Actual: ${currentUtil.toFixed(1)}%
                        </div>
                    </div>
                    
                    <div class="resource-input-container">
                        <input type="number" 
                               class="resource-input" 
                               id="hours-${key}"
                               min="0" max="2000" 
                               value="${existingHours}"
                               placeholder="0"
                               onchange="SimulatorMode.updateResourceHours('${key}', this.value)">
                        <label style="font-size: 12px; color: #64748b; margin-top: 4px;">
                            Horas necesarias
                        </label>
                    </div>
                    
                    <input type="range" 
                           class="resource-slider"
                           min="0" max="1000" step="10"
                           value="${existingHours}"
                           onchange="SimulatorMode.updateResourceSlider('${key}', this.value)">
                    
                    <div class="resource-impact">
                        <span class="impact-current">${currentUtil.toFixed(1)}%</span>
                        <span class="impact-new ${statusClass}">${newUtil.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }).join('');
        
        this.updateResourcesSummary();
    },

    updateResourceHours: function(deptKey, hours) {
        const numHours = parseInt(hours) || 0;
        this.state.projectData.departments[deptKey] = numHours;
        
        // Sync slider
        const slider = document.querySelector(`input[type="range"][onchange*="${deptKey}"]`);
        if (slider) {
            slider.value = Math.min(numHours, 1000);
        }
        
        // Update visual feedback
        this.updateDepartmentCard(deptKey);
        this.updateResourcesSummary();
    },

    updateResourceSlider: function(deptKey, hours) {
        const numHours = parseInt(hours) || 0;
        this.state.projectData.departments[deptKey] = numHours;
        
        // Sync input
        const input = document.getElementById(`hours-${deptKey}`);
        if (input) {
            input.value = numHours;
        }
        
        // Update visual feedback
        this.updateDepartmentCard(deptKey);
        this.updateResourcesSummary();
    },

    updateDepartmentCard: function(deptKey) {
        const card = document.querySelector(`[data-dept="${deptKey}"]`);
        const hours = this.state.projectData.departments[deptKey] || 0;
        
        if (card) {
            card.classList.toggle('active', hours > 0);
            
            // Update impact display
            const newUtil = this.calculateNewUtilization(deptKey, hours);
            const impactNew = card.querySelector('.impact-new');
            if (impactNew) {
                impactNew.textContent = newUtil.toFixed(1) + '%';
                impactNew.className = `impact-new ${newUtil > 100 ? 'critical' : newUtil > 90 ? 'warning' : 'safe'}`;
            }
        }
    },

    calculateNewUtilization: function(deptKey, hours) {
        const dept = NetberryData.departments[deptKey];
        if (!dept) return 0;
        
        const monthlyCapacity = dept.capacity / 12;
        const monthlyHours = hours / (this.state.projectData.duration || 6);
        const newUtil = dept.utilization + (monthlyHours / monthlyCapacity * 100);
        
        return Math.max(0, newUtil);
    },

    updateResourcesSummary: function() {
        const totalHours = Object.values(this.state.projectData.departments)
            .reduce((sum, hours) => sum + (hours || 0), 0);
        
        const involvedDepts = Object.values(this.state.projectData.departments)
            .filter(hours => hours > 0).length;
        
        const estimatedCost = totalHours * 75; // €75 por hora promedio
        
        // Update UI
        document.getElementById('totalHours').textContent = totalHours + 'h';
        document.getElementById('estimatedCost').textContent = '€' + estimatedCost.toLocaleString();
        document.getElementById('involvedDepts').textContent = involvedDepts;
    },

    // === STEP 3: IMPACT ANALYSIS ===
    performImpactAnalysis: function() {
        this.state.analysisResults = {
            impacts: [],
            viability: 'calculating',
            riskScore: 0
        };
        
        // Simulate analysis delay
        setTimeout(() => {
            const impacts = [];
            let riskScore = 0;
            let viableCount = 0;
            
            Object.entries(this.state.projectData.departments).forEach(([deptKey, hours]) => {
                if (hours > 0) {
                    const dept = NetberryData.departments[deptKey];
                    const newUtil