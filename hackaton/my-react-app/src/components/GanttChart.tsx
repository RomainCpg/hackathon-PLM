import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { getAllRecords, getOptimalGantt, type Record } from '../services/api';
import '../styles/GanttChart.css';

interface GanttChartProps {
    tasks: Task[];
}

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
}

// Convert API Record to Task
const convertRecordToTask = (record: Record): Task => {
    return {
        id: `task-${record.Poste}`,
        title: `Poste ${record.Poste}: ${record.Nom || 'Sans nom'}`,
        description: record['Aléas Industriels'] || record['Cause Potentielle'] || '',
        createdAt: new Date().toISOString(),
        order: record.Poste,
        poste: record.Poste,
        nombrePieces: record['Nombre pièces'],
        'tempsPrévu': record['Temps Prévu'],
        'tempsRéel': record['Temps Réel'],
        'aléasIndustriels': record['Aléas Industriels'],
        causePotentielle: record['Cause Potentielle'],
        heureDebut: record['Heure Début'],
        heureFin: record['Heure Fin'],
        horaireDepart: record['Heure Début'],
        horaireFin: record['Heure Fin'],
        dateDebut: record.Date,
        personnes: record.Personnes,
        'pièces': record.Pièces,
        dependencies: record.previousIds || [],
    };
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{task.title}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    {/* Time Information */}
                    <div className="detail-section">
                        <h3>⏱️ Informations de temps</h3>
                        <div className="detail-grid">
                            {task['tempsPrévu'] && (
                                <div className="detail-item">
                                    <strong>Durée Prévue:</strong>
                                    <span>{task['tempsPrévu']}</span>
                                </div>
                            )}
                            {task['tempsRéel'] && (
                                <div className="detail-item">
                                    <strong>Temps Réel:</strong>
                                    <span>{task['tempsRéel']}</span>
                                </div>
                            )}
                            {task.heureDebut && (
                                <div className="detail-item">
                                    <strong>Heure Début:</strong>
                                    <span>{task.heureDebut}</span>
                                </div>
                            )}
                            {task.heureFin && (
                                <div className="detail-item">
                                    <strong>Heure Fin:</strong>
                                    <span>{task.heureFin}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* People */}
                    {task.personnes && task.personnes.length > 0 && (
                        <div className="detail-section">
                            <h3>👥 Personnes impliquées</h3>
                            <div className="people-grid">
                                {task.personnes.map((person: any, idx: number) => (
                                    <div key={idx} className="person-item">
                                        <div className="person-name">
                                            {person.Prénom && person.Nom ? `${person.Prénom} ${person.Nom}` : person.Nom || 'N/A'}
                                        </div>
                                        {person.Qualification && (
                                            <div className="person-info">
                                                <strong>Qualification:</strong> {person.Qualification}
                                            </div>
                                        )}
                                        {person.Semaine && (
                                            <div className="person-info">
                                                <strong>Semaine:</strong> {person.Semaine}
                                            </div>
                                        )}
                                        {person.Matricule && (
                                            <div className="person-info">
                                                <strong>Matricule:</strong> {person.Matricule}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Task Details */}
                    <div className="detail-section">
                        <h3>📋 Détails</h3>
                        <div className="detail-grid">
                            {task.poste && (
                                <div className="detail-item">
                                    <strong>Poste:</strong>
                                    <span>#{task.poste}</span>
                                </div>
                            )}
                            {task.nombrePieces && (
                                <div className="detail-item">
                                    <strong>Nombre de pièces:</strong>
                                    <span>{task.nombrePieces}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Issues */}
                    {(task['aléasIndustriels'] || task.causePotentielle) && (
                        <div className="detail-section alert-section">
                            <h3>⚠️ Problèmes</h3>
                            {task['aléasIndustriels'] && (
                                <div className="alert-box">
                                    <strong>Aléas Industriels:</strong>
                                    <p>{task['aléasIndustriels']}</p>
                                </div>
                            )}
                            {task.causePotentielle && (
                                <div className="alert-box">
                                    <strong>Cause Potentielle:</strong>
                                    <p>{task.causePotentielle}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pieces */}
                    {task['pièces'] && task['pièces'].length > 0 && (
                        <div className="detail-section">
                            <h3>🔧 Pièces</h3>
                            <div className="pieces-grid">
                                {task['pièces'].map((piece: any, idx: number) => (
                                    <div key={idx} className="piece-card">
                                        {piece.Référence && <div className="piece-ref">{piece.Référence}</div>}
                                        {piece.Désignation && <div className="piece-name">{piece.Désignation}</div>}
                                        <div className="piece-details">
                                            {piece.Quantité && <span>Qté: {piece.Quantité}</span>}
                                            {piece.Fournisseur && <span>Fourn: {piece.Fournisseur}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [viewMode, setViewMode] = useState<'initial' | 'optimized'>('initial');
    const [optimizedTasks, setOptimizedTasks] = useState<Task[]>([]);
    const [isLoadingOptimization, setIsLoadingOptimization] = useState(false);
    const [optimizationError, setOptimizationError] = useState<string | null>(null);
    
    // State for API data
    const [apiTasks, setApiTasks] = useState<Task[]>([]);
    const [isLoadingApi, setIsLoadingApi] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);

    // Fetch data from API on component mount
    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setIsLoadingApi(true);
                setApiError(null);
                const records = await getAllRecords();
                const convertedTasks = records.map(convertRecordToTask);
                setApiTasks(convertedTasks);
            } catch (error) {
                console.error('Error fetching records:', error);
                setApiError('Erreur lors du chargement des données');
            } finally {
                setIsLoadingApi(false);
            }
        };

        fetchRecords();
    }, []);

    // Use API tasks instead of props tasks
    const allTasks = apiTasks.length > 0 ? apiTasks : tasks;
    
    // Function to fetch optimized Gantt
    const fetchOptimizedGantt = async () => {
        setIsLoadingOptimization(true);
        setOptimizationError(null);
        
        try {
            const optimizedData = await getOptimalGantt(allTasks);
            setOptimizedTasks(optimizedData);
            setViewMode('optimized');
        } catch (error) {
            console.error('Error fetching optimized Gantt:', error);
            setOptimizationError('Erreur lors de l\'optimisation. Veuillez réessayer.');
        } finally {
            setIsLoadingOptimization(false);
        }
    };
    
    // Use either optimized or initial tasks based on view mode
    const displayTasks = viewMode === 'optimized' ? optimizedTasks : allTasks;
    
    // Show loading state
    if (isLoadingApi) {
        return (
            <div className="gantt-chart">
                <div className="loading-state">
                    <p>⏳ Chargement des données...</p>
                </div>
            </div>
        );
    }

    // Show API error if any
    if (apiError) {
        return (
            <div className="gantt-chart">
                <div className="error-message">
                    ⚠️ {apiError}
                </div>
            </div>
        );
    }
    
    // Generate color palette
    const generateColor = (index: number): string => {
        const colors = [
            'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', // Green
            'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', // Blue
            'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', // Orange
            'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', // Purple
            'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)', // Red
            'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)', // Cyan
            'linear-gradient(135deg, #FFEB3B 0%, #FBC02D 100%)', // Yellow
            'linear-gradient(135deg, #3F51B5 0%, #303F9F 100%)', // Indigo
            'linear-gradient(135deg, #607D8B 0%, #455A64 100%)', // Blue Grey
            'linear-gradient(135deg, #795548 0%, #5D4037 100%)', // Brown
            'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)', // Pink
            'linear-gradient(135deg, #009688 0%, #00796B 100%)', // Teal
            'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)', // Deep Purple
            'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)', // Light Green
            'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)', // Deep Orange
        ];
        return colors[index % colors.length];
    };
    
    // Extract unique task types from all tasks
    const getTaskTypes = (): Map<string, string> => {
        const taskTypeMap = new Map<string, string>();
        let colorIndex = 0;
        
        displayTasks.forEach(task => {
            if (task.title) {
                const parts = task.title.split(':');
                if (parts.length > 1) {
                    const firstWord = parts[1].trim().split(' ')[0].toLowerCase();
                    if (!taskTypeMap.has(firstWord)) {
                        taskTypeMap.set(firstWord, generateColor(colorIndex++));
                    }
                }
            }
        });
        
        return taskTypeMap;
    };
    
    const taskTypeColorMap = getTaskTypes();
    
    // Get color based on first word of task title
    const getTaskColor = (taskTitle: string): string => {
        const parts = taskTitle.split(':');
        if (parts.length > 1) {
            const firstWord = parts[1].trim().split(' ')[0].toLowerCase();
            return taskTypeColorMap.get(firstWord) || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default purple
    };
    
    // Separate linked and unlinked tasks
    // Since dependencies now contain poste numbers, we need to check accordingly
    const linkedTasks = displayTasks.filter(task => 
        task.dependencies && task.dependencies.length > 0 ||
        displayTasks.some(t => t.dependencies?.includes(task.poste || 0))
    );
    
    const unlinkedTasks = displayTasks.filter(task => 
        !task.dependencies?.length && !displayTasks.some(t => t.dependencies?.includes(task.poste || 0))
    );

    // Build task hierarchy for Gantt
    const getTaskLevel = (posteId: number, visited = new Set<number>()): number => {
        if (visited.has(posteId)) return 0;
        visited.add(posteId);
        
        const task = displayTasks.find(t => t.poste === posteId);
        if (!task?.dependencies || task.dependencies.length === 0) return 0;
        
        const maxParentLevel = Math.max(
            ...task.dependencies.map(depId => getTaskLevel(depId, visited))
        );
        return maxParentLevel + 1;
    };

    // Parse time string "HH:MM:SS" to minutes
    const parseTimeToMinutes = (timeStr: string): number => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0] || '0', 10);
        const minutes = parseInt(parts[1] || '0', 10);
        return hours * 60 + minutes;
    };

    // Calculate duration from time fields (in minutes)
    const getTaskDuration = (task: Task): number => {
        // Use Horaire fields if available
        if (task.horaireDepart && task.horaireFin) {
            const start = parseTimeToMinutes(task.horaireDepart);
            const end = parseTimeToMinutes(task.horaireFin);
            return end - start;
        }
        // Fallback to temps réel or prévu
        if (task['tempsPrévu']) {
            const [h, m] = task['tempsPrévu'].split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        }
        if (task['tempsRéel']) {
            const [h, m] = task['tempsRéel'].split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        }
        return 60; // Default 1 hour in minutes
    };

    // Sort linked tasks based on view mode
    const sortedLinkedTasks = [...linkedTasks].sort((a, b) => {
        if (viewMode === 'optimized' && a.heureDebutOptimale && b.heureDebutOptimale) {
            // Sort chronologically by optimal start time
            const timeA = parseTimeToMinutes(a.heureDebutOptimale);
            const timeB = parseTimeToMinutes(b.heureDebutOptimale);
            return timeA - timeB;
        }
        // Default: sort by Poste order
        return (a.poste || 0) - (b.poste || 0);
    });

    // Calculate positions based on view mode
    const taskPositions = new Map<string, { startPercent: number; widthPercent: number }>();
    
    if (viewMode === 'optimized' && optimizedTasks.length > 0) {
        // For optimized view: use "heureDebutOptimale" and "tempsRéel"
        // First, find the earliest start time and latest end time
        let minStartMinutes = Infinity;
        let maxEndMinutes = 0;
        
        sortedLinkedTasks.forEach(task => {
            const startTime = task.heureDebutOptimale;
            if (startTime) {
                const startMinutes = parseTimeToMinutes(startTime);
                const duration = getTaskDuration(task);
                const endMinutes = startMinutes + duration;
                
                minStartMinutes = Math.min(minStartMinutes, startMinutes);
                maxEndMinutes = Math.max(maxEndMinutes, endMinutes);
            }
        });
        
        const totalDurationMinutes = maxEndMinutes - minStartMinutes;
        
        // Calculate positions for each task
        sortedLinkedTasks.forEach(task => {
            const startTime = task.heureDebutOptimale;
            if (startTime && totalDurationMinutes > 0) {
                const startMinutes = parseTimeToMinutes(startTime);
                const duration = getTaskDuration(task);
                
                const startPercent = ((startMinutes - minStartMinutes) / totalDurationMinutes) * 100;
                const widthPercent = (duration / totalDurationMinutes) * 100;
                
                taskPositions.set(task.id, { startPercent, widthPercent });
            } else {
                // Fallback if no optimal start time
                taskPositions.set(task.id, { startPercent: 0, widthPercent: 100 });
            }
        });
    } else {
        // For initial view: sequential positioning based on Poste order
        let totalDuration = 0;
        
        // First pass: calculate total duration
        sortedLinkedTasks.forEach(task => {
            const duration = getTaskDuration(task);
            totalDuration += duration;
        });

        // Second pass: calculate positions
        let accumulatedDuration = 0;
        sortedLinkedTasks.forEach(task => {
            const duration = getTaskDuration(task);
            const startPercent = totalDuration > 0 ? (accumulatedDuration / totalDuration) * 100 : 0;
            const widthPercent = totalDuration > 0 ? (duration / totalDuration) * 100 : 100;
            
            taskPositions.set(task.id, { startPercent, widthPercent });
            accumulatedDuration += duration;
        });
    }

    // Calculate total process time
    const calculateTotalProcessTime = (): number => {
        if (viewMode === 'optimized' && optimizedTasks.length > 0) {
            // For optimized view: calculate from earliest start to latest end
            let minStartMinutes = Infinity;
            let maxEndMinutes = 0;
            
            sortedLinkedTasks.forEach(task => {
                const startTime = task.heureDebutOptimale;
                if (startTime) {
                    const startMinutes = parseTimeToMinutes(startTime);
                    const duration = getTaskDuration(task);
                    const endMinutes = startMinutes + duration;
                    
                    minStartMinutes = Math.min(minStartMinutes, startMinutes);
                    maxEndMinutes = Math.max(maxEndMinutes, endMinutes);
                }
            });
            
            return maxEndMinutes - minStartMinutes;
        } else {
            // For initial view: sum of all task durations (sequential)
            let totalDuration = 0;
            sortedLinkedTasks.forEach(task => {
                totalDuration += getTaskDuration(task);
            });
            return totalDuration;
        }
    };

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}min`;
    };

    const totalProcessTime = calculateTotalProcessTime();

    return (
        <div className="gantt-chart">
            {sortedLinkedTasks.length > 0 && (
                <div className="gantt-section">
                    <div className="gantt-header-section">
                        <h3 className="gantt-title">📊 Diagramme de Gantt - Tâches liées</h3>
                        
                        <div className="view-mode-controls">
                            <div className="toggle-switch">
                                <button
                                    className={`toggle-button ${viewMode === 'initial' ? 'active' : ''}`}
                                    onClick={() => setViewMode('initial')}
                                >
                                    Initial
                                </button>
                                <button
                                    className={`toggle-button ${viewMode === 'optimized' ? 'active' : ''}`}
                                    onClick={() => {
                                        if (optimizedTasks.length === 0) {
                                            // Don't switch if no optimized data yet
                                            return;
                                        }
                                        setViewMode('optimized');
                                    }}
                                    disabled={optimizedTasks.length === 0}
                                >
                                    Optimisé
                                </button>
                            </div>
                            
                            {viewMode === 'optimized' && optimizedTasks.length === 0 && (
                                <button 
                                    className="optimize-button"
                                    onClick={fetchOptimizedGantt}
                                    disabled={isLoadingOptimization}
                                >
                                    {isLoadingOptimization ? '⏳ Optimisation en cours...' : '🚀 Calculer le planning optimisé via l\'IA'}
                                </button>
                            )}
                            
                            {viewMode === 'initial' && optimizedTasks.length === 0 && (
                                <button 
                                    className="optimize-button"
                                    onClick={fetchOptimizedGantt}
                                    disabled={isLoadingOptimization}
                                >
                                    {isLoadingOptimization ? '⏳ Optimisation en cours...' : '🚀 Calculer le planning optimisé via l\'IA'}
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {optimizationError && (
                        <div className="error-message">
                            ⚠️ {optimizationError}
                        </div>
                    )}
                    
                    {/* Legend */}
                    <div className="gantt-legend">
                        <div className="legend-title">Légende des types de tâches :</div>
                        <div className="legend-items">
                            {Array.from(taskTypeColorMap.entries()).map(([taskType, color]) => (
                                <div key={taskType} className="legend-item">
                                    <div className="legend-color" style={{ background: color }}></div>
                                    <span>{taskType.charAt(0).toUpperCase() + taskType.slice(1)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="gantt-container">
                        <div className="gantt-header">
                            <div className="gantt-task-labels">Tâche</div>
                        </div>

                        <div className="gantt-rows">
                            {sortedLinkedTasks.map((task) => {
                                const position = taskPositions.get(task.id) || { startPercent: 0, widthPercent: 100 };
                                const taskColor = getTaskColor(task.title);

                                return (
                                    <React.Fragment key={task.id}>
                                        <div className="gantt-row">
                                        <div className="gantt-task-label">
                                            <div className="task-name">{task.title}</div>
                                            <div className="task-time">
                                                <strong>Temps :</strong>{' '}
                                                <span>{task['tempsPrévu'] ? `${task['tempsPrévu']} (Prévu)` : '- (Prévu)'}</span>
                                                {' - '}
                                                <span>{task['tempsRéel'] ? `${task['tempsRéel']} (Réel)` : '- (Réel)'}</span>
                                            </div>
                                        </div>
                                        <div className="gantt-bar-container">
                                            <div
                                                className="gantt-bar"
                                                style={{
                                                    left: `${position.startPercent}%`,
                                                    width: `${position.widthPercent}%`,
                                                    background: taskColor,
                                                }}
                                                onClick={() => setSelectedTask(task)}
                                                title={`Cliquez pour voir les détails`}
                                            >
                                                <span className="bar-label">{task.poste ? `P${task.poste}` : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {unlinkedTasks.length > 0 && (
                <div className="unlinked-section">
                    <h3 className="section-title">🔗 Tâches non liées</h3>
                    <div className="unlinked-tasks">
                        {unlinkedTasks.map(task => (
                            <div key={task.id} className="unlinked-task">
                                <div className="task-header">
                                    <span className="task-title">{task.title}</span>
                                    {task.poste && <span className="poste-badge">Poste {task.poste}</span>}
                                </div>
                                <div className="task-info">
                                    {task['tempsRéel'] && <span>⏱️ {task['tempsRéel']}</span>}
                                    {task.nombrePieces && <span>📦 {task.nombrePieces} pièces</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {sortedLinkedTasks.length > 0 && (
                <div className="gantt-total-time">
                    <div className="total-time-label">⏱️ Temps total du processus:</div>
                    <div className="total-time-value">{formatTime(totalProcessTime)}</div>
                </div>
            )}

            {sortedLinkedTasks.length === 0 && unlinkedTasks.length === 0 && (
                <div className="empty-state">
                    <p>Aucune tâche à afficher</p>
                    <p className="hint">Organisez vos tâches dans l'onglet "Diagramme Flow" pour les voir ici</p>
                </div>
            )}

            {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
        </div>
    );
};

export default GanttChart;
