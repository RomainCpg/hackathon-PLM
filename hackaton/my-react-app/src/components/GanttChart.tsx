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
                                        <div className="person-name">{person.Nom || 'N/A'}</div>
                                        {person.Semaine && <span className="person-badge">Semaine {person.Semaine}</span>}
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
    // Separate linked and unlinked tasks
    const linkedTasks = tasks.filter(task => 
        task.dependencies && task.dependencies.length > 0 ||
        tasks.some(t => t.dependencies?.includes(task.id))
    );
    
    const unlinkedTasks = tasks.filter(task => 
        !task.dependencies?.length && !tasks.some(t => t.dependencies?.includes(task.id))
    );

    // Get week number for a task
    const getTaskWeek = (task: Task): number | null => {
        if (task.personnes && task.personnes.length > 0) {
            const semaine = task.personnes[0].Semaine;
            if (typeof semaine === 'number') return semaine;
        }
        return null;
    };

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

    // Calculate duration from time fields
    const getTaskDuration = (task: Task): number => {
        if (task['tempsRéel']) {
            const [h, m, s] = task['tempsRéel'].split(':').map(Number);
            return (h || 0) + (m || 0) / 60 + (s || 0) / 3600;
        }
        if (task['tempsPrévu']) {
            const [h, m, s] = task['tempsPrévu'].split(':').map(Number);
            return (h || 0) + (m || 0) / 60 + (s || 0) / 3600;
        }
        return 1; // Default 1 hour
    };

    // Calculate start time based on dependencies
    const getTaskStartTime = (task: Task, taskStartTimes: Map<string, number>): number => {
        if (!task.dependencies || task.dependencies.length === 0) return 0;
        
        let maxEndTime = 0;
        task.dependencies.forEach(depId => {
            const depTask = tasks.find(t => t.id === depId);
            if (depTask) {
                const depStart = taskStartTimes.get(depId) || 0;
                const depDuration = getTaskDuration(depTask);
                maxEndTime = Math.max(maxEndTime, depStart + depDuration);
            }
        });
        return maxEndTime;
    };

    // Sort linked tasks by level and week
    const sortedLinkedTasks = [...linkedTasks].sort((a, b) => {
        const weekA = getTaskWeek(a) || 0;
        const weekB = getTaskWeek(b) || 0;
        if (weekA !== weekB) return weekA - weekB;
        
        const levelA = getTaskLevel(a.id);
        const levelB = getTaskLevel(b.id);
        if (levelA !== levelB) return levelA - levelB;
        return a.order - b.order;
    });

    // Calculate start times for all tasks
    const taskStartTimes = new Map<string, number>();
    sortedLinkedTasks.forEach(task => {
        const startTime = getTaskStartTime(task, taskStartTimes);
        taskStartTimes.set(task.id, startTime);
    });

    // Find total duration
    const maxEndTime = sortedLinkedTasks.reduce((max, task) => {
        const start = taskStartTimes.get(task.id) || 0;
        const duration = getTaskDuration(task);
        return Math.max(max, start + duration);
    }, 0);

    const totalHours = Math.ceil(maxEndTime) || 24;

    return (
        <div className="gantt-chart">
            {sortedLinkedTasks.length > 0 && (
                <div className="gantt-section">
                    <h3 className="gantt-title">📊 Diagramme de Gantt - Tâches liées</h3>
                    
                    <div className="gantt-container">
                        <div className="gantt-header">
                            <div className="gantt-task-labels">Tâche</div>
                            <div className="gantt-timeline">
                                {Array.from({ length: Math.ceil(totalHours) + 1 }, (_, i) => (
                                    <div key={i} className="timeline-mark">
                                        {i}h
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="gantt-rows">
                            {sortedLinkedTasks.map((task, index) => {
                                const startTime = taskStartTimes.get(task.id) || 0;
                                const duration = getTaskDuration(task);
                                const startPercent = (startTime / totalHours) * 100;
                                const widthPercent = (duration / totalHours) * 100;
                                
                                const currentWeek = getTaskWeek(task);
                                const previousWeek = index > 0 ? getTaskWeek(sortedLinkedTasks[index - 1]) : null;
                                const showWeekHeader = currentWeek !== null && currentWeek !== previousWeek;

                                return (
                                    <React.Fragment key={task.id}>
                                        {showWeekHeader && (
                                            <div className="gantt-week-header">
                                                Semaine {currentWeek}
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
                                                className={`gantt-bar status-${task.status}`}
                                                style={{
                                                    left: `${startPercent}%`,
                                                    width: `${widthPercent}%`,
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
