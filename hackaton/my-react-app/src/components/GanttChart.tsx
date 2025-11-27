import React, { useState } from 'react';
import type { Task } from '../types';
import '../styles/GanttChart.css';

interface GanttChartProps {
    tasks: Task[];
}

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
}

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
        
        tasks.forEach(task => {
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
    const linkedTasks = tasks.filter(task => 
        task.dependencies && task.dependencies.length > 0 ||
        tasks.some(t => t.dependencies?.includes(task.id))
    );
    
    const unlinkedTasks = tasks.filter(task => 
        !task.dependencies?.length && !tasks.some(t => t.dependencies?.includes(task.id))
    );

    // Build task hierarchy for Gantt
    const getTaskLevel = (taskId: string, visited = new Set<string>()): number => {
        if (visited.has(taskId)) return 0;
        visited.add(taskId);
        
        const task = tasks.find(t => t.id === taskId);
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
        if (task['tempsRéel']) {
            const [h, m] = task['tempsRéel'].split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        }
        if (task['tempsPrévu']) {
            const [h, m] = task['tempsPrévu'].split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        }
        return 60; // Default 1 hour in minutes
    };

    // Helper to combine date + time into timestamp
    const getTaskTimestamp = (task: Task): number => {
        const dateMs = task.dateDebut || 0;
        const timeStr = task.horaireDepart || task.heureDebut || '';
        if (!timeStr) return dateMs;
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0] || '0', 10);
        const minutes = parseInt(parts[1] || '0', 10);
        return dateMs + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    };

    // Sort linked tasks by date + time chronologically
    const sortedLinkedTasks = [...linkedTasks].sort((a, b) => {
        const timestampA = getTaskTimestamp(a);
        const timestampB = getTaskTimestamp(b);
        if (timestampA !== timestampB) return timestampA - timestampB;
        
        // Secondary sort by Poste number when date/time are equal
        return (a.poste || 0) - (b.poste || 0);
    });

    // Calculate start times for all tasks (in milliseconds timestamp)
    const taskStartTimes = new Map<string, number>();
    let minStartTimestamp = Infinity;
    let maxEndTimestamp = 0;
    
    sortedLinkedTasks.forEach(task => {
        const timestamp = getTaskTimestamp(task);
        taskStartTimes.set(task.id, timestamp);
        minStartTimestamp = Math.min(minStartTimestamp, timestamp);
        
        const duration = getTaskDuration(task);
        maxEndTimestamp = Math.max(maxEndTimestamp, timestamp + (duration * 60 * 1000));
    });

    // If no tasks, use defaults
    if (minStartTimestamp === Infinity) minStartTimestamp = Date.now();
    if (maxEndTimestamp === 0) maxEndTimestamp = minStartTimestamp + (24 * 60 * 60 * 1000);
    
    // Calculate working hours range (skip night hours)
    const minDate = new Date(minStartTimestamp);
    const maxDate = new Date(maxEndTimestamp);
    
    // Adjust to start of working hours (8 AM) on the first day
    const workDayStart = new Date(minDate);
    workDayStart.setHours(8, 0, 0, 0);
    if (minDate < workDayStart) {
        minStartTimestamp = workDayStart.getTime();
    }
    
    // Adjust to end of working hours (5 PM / 17:00) on the last day
    const workDayEnd = new Date(maxDate);
    workDayEnd.setHours(17, 0, 0, 0);
    if (maxDate > workDayEnd) {
        maxEndTimestamp = workDayEnd.getTime();
    }
    
    const totalDurationMs = maxEndTimestamp - minStartTimestamp;
    
    // Generate timeline markers only for working hours
    const generateTimelineMarkers = (): { timestamp: number; label: string }[] => {
        const markers: { timestamp: number; label: string }[] = [];
        let currentTimestamp = minStartTimestamp;
        
        while (currentTimestamp <= maxEndTimestamp) {
            const date = new Date(currentTimestamp);
            const hour = date.getHours();
            
            // Only include hours between 8 AM and 5 PM (17:00)
            if (hour >= 8 && hour < 17) {
                markers.push({
                    timestamp: currentTimestamp,
                    label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
                });
            }
            
            currentTimestamp += 60 * 60 * 1000; // Add 1 hour
            
            // Skip non-working hours (5 PM to 8 AM)
            const nextDate = new Date(currentTimestamp);
            if (nextDate.getHours() >= 17 || nextDate.getHours() < 8) {
                const skipTo = new Date(nextDate);
                if (nextDate.getHours() >= 17) {
                    skipTo.setDate(skipTo.getDate() + 1);
                    skipTo.setHours(8, 0, 0, 0);
                } else {
                    skipTo.setHours(8, 0, 0, 0);
                }
                currentTimestamp = skipTo.getTime();
            }
        }
        
        return markers;
    };
    
    const timelineMarkers = generateTimelineMarkers();

    return (
        <div className="gantt-chart">
            {sortedLinkedTasks.length > 0 && (
                <div className="gantt-section">
                    <h3 className="gantt-title">📊 Diagramme de Gantt - Tâches liées</h3>
                    
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
                            <div className="gantt-timeline">
                                {timelineMarkers.map((marker, i) => {
                                    const date = new Date(marker.timestamp);
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const mins = String(date.getMinutes()).padStart(2, '0');
                                    return (
                                        <div key={i} className="timeline-mark">
                                            <div>{day}/{month}</div>
                                            <div>{hours}:{mins}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="gantt-rows">
                            {sortedLinkedTasks.map((task, index) => {
                                const startTimestamp = taskStartTimes.get(task.id) || minStartTimestamp;
                                const duration = getTaskDuration(task);
                                const startPercent = ((startTimestamp - minStartTimestamp) / totalDurationMs) * 100;
                                const widthPercent = ((duration * 60 * 1000) / totalDurationMs) * 100;
                                const taskColor = getTaskColor(task.title);
                                
                                // Check if we need a date header
                                const currentDate = new Date(task.dateDebut || 0);
                                const previousDate = index > 0 ? new Date(sortedLinkedTasks[index - 1].dateDebut || 0) : null;
                                const showDateHeader = !previousDate || currentDate.toDateString() !== previousDate.toDateString();

                                return (
                                    <React.Fragment key={task.id}>
                                        {showDateHeader && (
                                            <div className="gantt-date-header">
                                                {currentDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </div>
                                        )}
                                        <div className="gantt-row">
                                        <div className="gantt-task-label">
                                            <div className="task-name">{task.title}</div>
                                            <div className="task-time">
                                                {task['tempsRéel'] || task['tempsPrévu'] || '-'}
                                            </div>
                                        </div>
                                        <div className="gantt-bar-container">
                                            <div
                                                className="gantt-bar"
                                                style={{
                                                    left: `${startPercent}%`,
                                                    width: `${widthPercent}%`,
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
