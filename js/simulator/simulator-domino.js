// js/simulator/simulator-domino.js - Efecto Dominó Realista Simple

const SimulatorDomino = {
    
    // 🚀 PASO 4: EFECTO DOMINÓ REALISTA
    renderStep4: function(projectData, impactAnalysis) {
        return `
            <div class="wizard-content domino-analysis">
                <div class="domino-header">
                    <h3>🎯 ANÁLISIS DE IMPACTO REALISTA</h3>
                    <div class="domino-subtitle">
                        Ralentización estimada si se aprueba: <strong>${projectData.name}</strong>
                    </div>
                </div>

                ${this.renderSimpleImpactSummary(impactAnalysis)}
                ${this.renderDepartmentImpacts(impactAnalysis)}
                ${this.renderPriorityMatrix(impactAnalysis)}
                ${this.renderFinancialImpact(projectData, impactAnalysis)}
                ${this.renderDirectorArguments(projectData, impactAnalysis)}
            </div>
        `;
    },

    // Resumen simple del impacto
    renderSimpleImpactSummary: function(impactAnalysis) {
        const { departmentImpacts, overallImpact } = impactAnalysis;
        
        return `
            <div class="impact-summary-simple">
                <div class="impact-stat overall">
                    <div class="stat-number">${overallImpact.min}% - ${overallImpact.max}%</div>
                    <div class="stat-label">Ralentización Global Estimada</div>
                </div>
                <div class="impact-stat departments">
                    <div class="stat-number">${departmentImpacts.length}</div>
                    <div class="stat-label">Departamentos Afectados</div>
                </div>
                <div class="impact-stat protected">
                    <div class="stat-number">${this.countProtectedProjects(impactAnalysis)}</div>
                    <div class="stat-label">Proyectos Críticos Protegidos</div>
                </div>
            </div>
        `;
    },

    // Impacto por departamento de forma simple
    renderDepartmentImpacts: function(impactAnalysis) {
        const { departmentImpacts } = impactAnalysis;
        
        if (departmentImpacts.length === 0) {
            return `
                <div class="department-impacts">
                    <h4>✅ Sin Impacto Significativo</h4>
                    <p style="color: #10b981;">Este proyecto no genera ralentización considerable en los departamentos.</p>
                </div>
            `;
        }
        
        return `
            <div class="department-impacts">
                <h4>📊 IMPACTO POR DEPARTAMENTO</h4>
                <div class="departments-grid">
                    ${departmentImpacts.map(dept => `
                        <div class="dept-impact-card ${this.getImpactSeverity(dept.maxSlowdown)}">
                            <div class="dept-impact-header">
                                <div class="dept-impact-name">${dept.name}</div>
                                <div class="dept-impact-range">${dept.minSlowdown}% - ${dept.maxSlowdown}%</div>
                            </div>
                            <div class="dept-impact-details">
                                <div class="current-load">Carga actual: ${dept.currentUtilization}%</div>
                                <div class="new-load">Nueva carga: ${dept.newUtilization}%</div>
                                <div class="projects-affected">${dept.activeProjects} proyectos activos afectados</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Matriz de impacto por prioridades (LA CLAVE)
    renderPriorityMatrix: function(impactAnalysis) {
        const { departmentImpacts } = impactAnalysis;
        
        if (departmentImpacts.length === 0) return '';
        
        return `
            <div class="priority-matrix">
                <h4>⚖️ IMPACTO SEGÚN PRIORIDAD DE PROYECTOS</h4>
                <div class="matrix-explanation">
                    <p>Los proyectos se ven afectados según su prioridad. Los críticos están protegidos, los menos importantes absorben el impacto.</p>
                </div>
                
                ${departmentImpacts.map(dept => `
                    <div class="dept-priority-breakdown">
                        <h5>${dept.name} - Ralentización por Prioridad:</h5>
                        <div class="priority-grid">
                            <div class="priority-row critical">
                                <div class="priority-label">🔴 Críticos</div>
                                <div class="priority-impact">${dept.priorityImpacts.critical.min}% - ${dept.priorityImpacts.critical.max}%</div>
                                <div class="priority-explanation">Se protegen al máximo</div>
                            </div>
                            <div class="priority-row high">
                                <div class="priority-label">🟡 Altos</div>
                                <div class="priority-impact">${dept.priorityImpacts.high.min}% - ${dept.priorityImpacts.high.max}%</div>
                                <div class="priority-explanation">Afectación controlada</div>
                            </div>
                            <div class="priority-row medium">
                                <div class="priority-label">🟠 Medios</div>
                                <div class="priority-impact">${dept.priorityImpacts.medium.min}% - ${dept.priorityImpacts.medium.max}%</div>
                                <div class="priority-explanation">Impacto considerable</div>
                            </div>
                            <div class="priority-row low">
                                <div class="priority-label">⚫ Bajos</div>
                                <div class="priority-impact">${dept.priorityImpacts.low.min}% - ${dept.priorityImpacts.low.max}%</div>
                                <div class="priority-explanation">Absorben el mayor impacto</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                
                <div class="priority-summary">
                    <div class="summary-card">
                        <strong>💡 Resumen:</strong> Los proyectos críticos mantienen su velocidad, mientras que los proyectos de menor prioridad se ralentizan proporcionalmente más para absorber la carga adicional.
                    </div>
                </div>
            </div>
        `;
    },

    // Impacto financiero simplificado
    renderFinancialImpact: function(projectData, impactAnalysis) {
        const estimatedDelay = this.calculateEstimatedDelay(impactAnalysis);
        const delayCostRange = this.calculateDelayCostRange(estimatedDelay);
        const netImpactMin = (projectData.value || 0) - delayCostRange.max;
        const netImpactMax = (projectData.value || 0) - delayCostRange.min;
        
        return `
            <div class="financial-impact-simple">
                <h4>💰 IMPACTO ECONÓMICO ESTIMADO</h4>
                <div class="financial-grid-simple">
                    <div class="financial-item positive">
                        <div class="financial-label">Valor del Nuevo Proyecto</div>
                        <div class="financial-value">+€${this.formatCurrency(projectData.value || 0)}</div>
                    </div>
                    <div class="financial-item negative">
                        <div class="financial-label">Costo de Ralentización</div>
                        <div class="financial-value">€${this.formatCurrency(delayCostRange.min)} - €${this.formatCurrency(delayCostRange.max)}</div>
                    </div>
                    <div class="financial-item ${netImpactMin > 0 ? 'positive' : 'negative'}">
                        <div class="financial-label">Impacto Neto Estimado</div>
                        <div class="financial-value">
                            €${this.formatCurrency(Math.abs(netImpactMin))} - €${this.formatCurrency(Math.abs(netImpactMax))}
                        </div>
                    </div>
                </div>
                
                <div class="financial-explanation">
                    <p><strong>Nota:</strong> Los costos varían según qué proyectos se ralenticen más. Los proyectos críticos protegidos minimizan el impacto económico.</p>
                </div>
            </div>
        `;
    },

    // Argumentos simples para el director
    renderDirectorArguments: function(projectData, impactAnalysis) {
        const { overallImpact, departmentImpacts } = impactAnalysis;
        const worstCaseDept = departmentImpacts.reduce((worst, current) => 
            current.maxSlowdown > (worst?.maxSlowdown || 0) ? current : worst, null
        );
        
        let recommendation = '';
        let keyPoints = [];
        let talkingPoints = '';
        
        if (overallImpact.max <= 10) {
            recommendation = '✅ PROYECTO VIABLE';
            keyPoints = [
                `Ralentización mínima: máximo ${overallImpact.max}%`,
                'Los proyectos críticos mantienen su prioridad',
                'Impacto controlable en el timeline actual',
                'Capacidad suficiente para absorber la carga'
            ];
            talkingPoints = `"Director, este proyecto es totalmente viable. La ralentización máxima estimada es del ${overallImpact.max}%, y nuestros proyectos críticos estarán protegidos. ¿Procedemos con la aprobación?"`;
        } else if (overallImpact.max <= 25) {
            recommendation = '⚠️ VIABLE CON CONSIDERACIONES';
            keyPoints = [
                `Ralentización moderada: ${overallImpact.min}% - ${overallImpact.max}%`,
                'Los proyectos críticos siguen protegidos',
                'Los proyectos menos prioritarios se verán más afectados',
                'Recomendamos revisar prioridades trimestralmente'
            ];
            talkingPoints = `"Director, el proyecto es viable pero generará una ralentización del ${overallImpact.min}%-${overallImpact.max}%. Los proyectos críticos estarán protegidos, pero deberíamos revisar las prioridades de los proyectos menos importantes. ¿Aceptamos este impacto?"`;
        } else {
            recommendation = '❌ NO RECOMENDADO';
            keyPoints = [
                `Ralentización alta: ${overallImpact.min}% - ${overallImpact.max}%`,
                `Departamento ${worstCaseDept?.name || 'crítico'} sobrecargado`,
                'Riesgo de afectar incluso proyectos importantes',
                'Recomendamos posponer o contratar recursos adicionales'
            ];
            talkingPoints = `"Director, este proyecto no es recomendable en las condiciones actuales. Generaría una ralentización del ${overallImpact.min}%-${overallImpact.max}%, y existe riesgo de afectar incluso proyectos importantes. Recomiendo posponer hasta tener más capacidad."`;
        }
        
        return `
            <div class="director-arguments-simple">
                <h4>🎯 RECOMENDACIÓN PARA EL DIRECTOR GENERAL</h4>
                
                <div class="recommendation-header-simple">
                    <div class="recommendation-action">${recommendation}</div>
                </div>
                
                <div class="arguments-simple">
                    <h5>📋 Puntos Clave:</h5>
                    <ul>
                        ${keyPoints.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="talking-points-simple">
                    <h5>💬 Frase Preparada:</h5>
                    <div class="talking-point-simple">
                        <p><em>${talkingPoints}</em></p>
                    </div>
                </div>
                
                <div class="evidence-simple">
                    <h5>📊 Datos de Respaldo:</h5>
                    <div class="evidence-grid">
                        <span class="evidence-item">✓ Análisis de carga actual por departamento</span>
                        <span class="evidence-item">✓ Matriz de impacto por prioridades</span>
                        <span class="evidence-item">✓ Estimación de ralentización realista</span>
                        <span class="evidence-item">✓ Protección de proyectos críticos</span>
                    </div>
                </div>
            </div>
        `;
    },

    // === CÁLCULOS SIMPLIFICADOS ===
    calculateSimpleImpact: function(projectData) {
        const newProjectDepts = Object.keys(projectData.departments || {});
        const departmentImpacts = [];
        let overallImpactMin = 0;
        let overallImpactMax = 0;
        
        newProjectDepts.forEach(deptKey => {
            const dept = NetberryData.departments[deptKey];
            const additionalHours = projectData.departments[deptKey] || 0;
            const currentUtil = dept.utilization;
            const monthlyCapacity = dept.capacity / 12;
            const monthlyAdditional = additionalHours / (projectData.duration || 6);
            const newUtil = currentUtil + (monthlyAdditional / monthlyCapacity * 100);
            
            if (newUtil > currentUtil) {
                // Calcular ralentización basada en sobrecarga
                const overloadPercentage = newUtil - currentUtil;
                const baseSlowdown = Math.min(overloadPercentage * 2, 35); // Máximo 35%
                
                const minSlowdown = Math.max(2, Math.round(baseSlowdown * 0.6));
                const maxSlowdown = Math.round(baseSlowdown * 1.4);
                
                // Contar proyectos activos en este departamento
                const activeProjects = NetberryData.projects.filter(p => 
                    p.status === 'active' && p.departments.includes(deptKey)
                ).length;
                
                departmentImpacts.push({
                    key: deptKey,
                    name: dept.name,
                    currentUtilization: Math.round(currentUtil),
                    newUtilization: Math.round(newUtil),
                    minSlowdown,
                    maxSlowdown,
                    activeProjects,
                    priorityImpacts: this.calculatePriorityImpacts(minSlowdown, maxSlowdown)
                });
                
                // Contribuir al impacto global
                overallImpactMin += minSlowdown * 0.3; // Peso por departamento
                overallImpactMax += maxSlowdown * 0.3;
            }
        });
        
        return {
            departmentImpacts,
            overallImpact: {
                min: Math.round(Math.max(2, overallImpactMin)),
                max: Math.round(Math.min(35, overallImpactMax))
            }
        };
    },

    calculatePriorityImpacts: function(minBase, maxBase) {
        return {
            critical: {
                min: Math.round(minBase * 0.2), // Los críticos se protegen mucho
                max: Math.round(maxBase * 0.3)
            },
            high: {
                min: Math.round(minBase * 0.6),
                max: Math.round(maxBase * 0.7)
            },
            medium: {
                min: Math.round(minBase * 1.0),
                max: Math.round(maxBase * 1.0)
            },
            low: {
                min: Math.round(minBase * 1.5), // Los menos prioritarios sufren más
                max: Math.round(maxBase * 1.8)
            }
        };
    },

    countProtectedProjects: function(impactAnalysis) {
        // Contar proyectos críticos y altos en departamentos afectados
        return impactAnalysis.departmentImpacts.reduce((count, dept) => {
            const criticalProjects = NetberryData.projects.filter(p => 
                p.status === 'active' && 
                p.departments.includes(dept.key) && 
                (p.priority === 'critical' || p.priority === 'high')
            ).length;
            return count + criticalProjects;
        }, 0);
    },

    calculateEstimatedDelay: function(impactAnalysis) {
        const avgSlowdown = impactAnalysis.overallImpact.max;
        return {
            min: Math.round(avgSlowdown * 0.1), // meses
            max: Math.round(avgSlowdown * 0.2)
        };
    },

    calculateDelayCostRange: function(delayRange) {
        const avgProjectValue = 50000; // Valor promedio de proyectos afectados
        const monthlyCost = avgProjectValue * 0.1; // 10% por mes de retraso
        
        return {
            min: delayRange.min * monthlyCost,
            max: delayRange.max * monthlyCost
        };
    },

    getImpactSeverity: function(maxSlowdown) {
        if (maxSlowdown <= 10) return 'low-impact';
        if (maxSlowdown <= 20) return 'medium-impact';
        return 'high-impact';
    },

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('es-ES').format(Math.round(amount));
    }
};

// Exportar para uso global
window.SimulatorDomino = SimulatorDomino;