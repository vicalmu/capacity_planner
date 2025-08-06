// simulator-steps.js - Renderizado de los pasos del simulador

const SimulatorSteps = {

    // === STEP 1: PROJECT CONFIGURATION ===
    renderStep1: function() {
        // Bind project type selection
        document.querySelectorAll('.project-type-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.project-type-card').forEach(c => 
                    c.classList.remove('selected'));
                card.classList.add('selected');
                
                const type = card.dataset.type;
                SimulatorCore.state.projectData.type = type;
                this.loadProjectTemplate(type);
            });
        });
        
        // Populate form with existing data
        if (SimulatorCore.state.projectData.name) {
            const nameInput = document.getElementById('projectName');
            if (nameInput) {
                nameInput.value = SimulatorCore.state.projectData.name;
            }
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
            const nameInput = document.getElementById('projectName');
            const durationInput = document.getElementById('projectDuration');
            const budgetInput = document.getElementById('projectBudget');
            
            if (nameInput) nameInput.value = template.name;
            if (durationInput) durationInput.value = template.duration;
            if (budgetInput) budgetInput.value = template.budget;
            
            // Store template data
            SimulatorCore.state.projectData = {
                ...SimulatorCore.state.projectData,
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
            const textEl = suggestion.querySelector('.suggestion-text');
            if (textEl) {
                textEl.textContent = `Template "${templateName}" cargado automáticamente`;
            }
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
            const existingHours = SimulatorCore.state.projectData.departments[key] || 0;
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
                               onchange="SimulatorSteps.updateResourceHours('${key}', this.value)">
                        <label style="font-size: 12px; color: #64748b; margin-top: 4px;">
                            Horas necesarias
                        </label>
                    </div>
                    
                    <input type="range" 
                           class="resource-slider"
                           min="0" max="1000" step="10"
                           value="${existingHours}"
                           onchange="SimulatorSteps.updateResourceSlider('${key}', this.value)">
                    
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
        SimulatorCore.state.projectData.departments[deptKey] = numHours;
        
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
        SimulatorCore.state.projectData.departments[deptKey] = numHours;
        
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
        const hours = SimulatorCore.state.projectData.departments[deptKey] || 0;
        
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
        const monthlyHours = hours / (SimulatorCore.state.projectData.duration || 6);
        const newUtil = dept.utilization + (monthlyHours / monthlyCapacity * 100);
        
        return Math.max(0, newUtil);
    },

    updateResourcesSummary: function() {
        const totalHours = Object.values(SimulatorCore.state.projectData.departments)
            .reduce((sum, hours) => sum + (hours || 0), 0);
        
        const involvedDepts = Object.values(SimulatorCore.state.projectData.departments)
            .filter(hours => hours > 0).length;
        
        const estimatedCost = totalHours * 75; // €75 por hora promedio
        
        // Update UI
        const totalHoursEl = document.getElementById('totalHours');
        const estimatedCostEl = document.getElementById('estimatedCost');
        const involvedDeptsEl = document.getElementById('involvedDepts');
        
        if (totalHoursEl) totalHoursEl.textContent = totalHours + 'h';
        if (estimatedCostEl) estimatedCostEl.textContent = '€' + estimatedCost.toLocaleString();
        if (involvedDeptsEl) involvedDeptsEl.textContent = involvedDepts;
    },

    // === STEP 3: IMPACT ANALYSIS ===
    renderStep3: function() {
        if (!SimulatorCore.state.analysisResults || 
            SimulatorCore.state.analysisResults.viability === 'calculating') {
            this.renderStep3Loading();
            return;
        }
        
        const impactGrid = document.getElementById('impactGrid');
        const viabilityCard = document.getElementById('viabilityCard');
        
        if (impactGrid && SimulatorCore.state.analysisResults.impacts) {
            impactGrid.innerHTML = SimulatorCore.state.analysisResults.impacts.map(impact => `
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
        
        if (viabilityCard && SimulatorCore.state.analysisResults) {
            const viability = SimulatorCore.state.analysisResults.viability;
            const score = 100 - SimulatorCore.state.analysisResults.riskScore;
            
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
            
            const config = statusConfig[viability] || statusConfig.viable;
            
            const iconEl = viabilityCard.querySelector('.viability-icon');
            const statusEl = viabilityCard.querySelector('.viability-status');
            const scoreEl = viabilityCard.querySelector('.viability-score');
            
            if (iconEl) iconEl.textContent = config.icon;
            if (statusEl) {
                statusEl.textContent = config.text;
                statusEl.style.color = config.color;
            }
            if (scoreEl) {
                scoreEl.textContent = Math.round(score) + '/100';
                scoreEl.style.color = config.color;
            }
            
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
            const statusEl = viabilityCard.querySelector('.viability-status');
            const scoreEl = viabilityCard.querySelector('.viability-score');
            
            if (statusEl) statusEl.textContent = 'Analizando viabilidad...';
            if (scoreEl) scoreEl.textContent = '--';
        }
    },

    // === STEP 4: DOMINO EFFECT ===
    renderStep4: function() {
        if (!SimulatorCore.state.dominoEffects) {
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
        if (!container || !SimulatorCore.state.dominoEffects) return;
        
        const timeline = SimulatorCore.state.dominoEffects.timeline || this.generateMockTimeline();
        
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
        
        const projects = SimulatorCore.state.dominoEffects.affectedProjects || [];
        
        container.innerHTML = `
            <h3>🎯 Proyectos Afectados</h3>
            ${projects.length === 0 ? 
                '<p style="color: #64748b; text-align: center; padding: 40px;">No se detectaron conflictos con proyectos existentes</p>' :
                projects.map(project => `
                    <div class="affected-project-item">
                        <div class="project-info">
                            <div class="project-name">${project.name}</div>
                            <div class="project-impact-desc">${project.description || 'Conflicto de recursos detectado'}</div>
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
        
        const metrics = SimulatorCore.state.dominoEffects.riskMetrics || {
            delayedProjects: 0,
            additionalCost: 0,
            resourceConflicts: 0
        };
        
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

    // === STEP 5: RECOMMENDATIONS ===
    renderStep5: function() {
        if (!SimulatorCore.state.recommendations) {
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
        if (!container || !SimulatorCore.state.recommendations) return;
        
        const summary = SimulatorCore.state.recommendations.executiveSummary || {
            title: '📊 Resumen Ejecutivo',
            content: 'Análisis completado con recomendaciones generadas automáticamente.'
        };
        
        container.innerHTML = `
            <div class="summary-title">${summary.title}</div>
            <div class="summary-content">${summary.content}</div>
        `;
    },

    renderRecommendationsGrid: function() {
        const container = document.getElementById('recommendationsGrid');
        if (!container || !SimulatorCore.state.recommendations) return;
        
        const recommendations = SimulatorCore.state.recommendations.recommendations || [];
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="rec-header">
                    <div class="rec-icon">${rec.icon || '💡'}</div>
                    <div class="rec-title">${rec.title}</div>
                    <div class="rec-confidence">${rec.confidence || 85}%</div>
                </div>
                <div class="rec-description">${rec.description}</div>
                <div class="rec-actions">
                    ${(rec.actions || ['Ver detalles', 'Aplicar']).map(action => `
                        <button class="rec-action-btn ${rec.actions && rec.actions.indexOf(action) === 0 ? 'primary' : ''}"
                                onclick="SimulatorSteps.handleRecommendationAction('${rec.type}', '${action}')">
                            ${action}
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    renderActionPlan: function() {
        const container = document.getElementById('actionPlan');
        if (!container || !SimulatorCore.state.recommendations) return;
        
        const actionPlan = SimulatorCore.state.recommendations.actionPlan || [];
        
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

    // === UTILITIES ===
    generateMockTimeline: function() {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        return months.map((month, index) => ({
            month,
            projects: Math.floor(Math.random() * 8) + 2,
            utilization: 60 + Math.random() * 40,
            conflicts: index > 6 ? Math.floor(Math.random() * 3) : 0
        }));
    },

    handleRecommendationAction: function(type, action) {
        console.log(`Acción recomendación: ${type} - ${action}`);
        SimulatorCore.showNotification(`Función "${action}" en desarrollo`, 'info');
    }
};

// Exponer para uso global
window.SimulatorSteps = SimulatorSteps;