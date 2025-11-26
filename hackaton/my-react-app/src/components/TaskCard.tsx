import React, { useState } from 'react';
import type { Task } from '../types';
import ManufacturingDetails from './ManufacturingDetails';
import '../styles/TaskCard.css';

interface TaskCardProps {
    task: Task;
    onUpdate: (taskId: string, updates: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [editedTask, setEditedTask] = useState(task);

    const handleSave = () => {
        onUpdate(task.id, editedTask);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="task-card editing">
                <input
                    type="text"
                    value={editedTask.title}
                    onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                    placeholder="Titre"
                />
                <textarea
                    value={editedTask.description}
                    onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                    placeholder="Description"
                />
                <div className="edit-actions">
                    <button onClick={handleSave} className="save-btn">✓</button>
                    <button onClick={() => setIsEditing(false)} className="cancel-btn">✕</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="task-card" onClick={() => setShowDetails(true)}>
                <div className="task-header">
                    <h4>{task.title}</h4>
                    <div className="task-actions" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsEditing(true)} className="edit-btn">✏️</button>
                        <button onClick={() => onDelete(task.id)} className="delete-btn">🗑️</button>
                    </div>
                </div>

                {task.posteNumber && (
                    <div className="task-poste-number">
                        <span className="poste-badge">Poste {task.posteNumber}</span>
                    </div>
                )}

                <p className="task-description">{task.description}</p>

                {/* Informations de timing pour manufacturing */}
                {task.tempsPrevu && task.tempsReel && (
                    <div className="task-timing">
                        <div className="timing-item">
                            <span className="timing-label">⏱️ Prévu:</span>
                            <span className="timing-value">{task.tempsPrevu}</span>
                        </div>
                        <div className="timing-item">
                            <span className="timing-label">⏰ Réel:</span>
                            <span className="timing-value">{task.tempsReel}</span>
                        </div>
                    </div>
                )}

                {/* Pièces et personnel */}
                {(task.nombrePieces || task.personnes) && (
                    <div className="task-resources">
                        {task.nombrePieces && (
                            <span className="resource-badge">🔧 {task.nombrePieces} pièces</span>
                        )}
                        {task.personnes && task.personnes.length > 0 && (
                            <span className="resource-badge">👥 {task.personnes.length} personnes</span>
                        )}
                    </div>
                )}

                {/* Aléas industriels */}
                {task.aleasIndustriels && (
                    <div className="task-incidents">
                        <div className="incident-label">⚠️ Aléas:</div>
                        <div className="incident-text">{task.aleasIndustriels}</div>
                    </div>
                )}

                {task.assignedTo && (
                    <div className="task-assigned">
                        <span>👤 {task.assignedTo}</span>
                    </div>
                )}
                {task.dueDate && (
                    <div className="task-date">
                        <span>📅 {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                )}
            </div>

            {showDetails && (
                <ManufacturingDetails
                    task={task}
                    onClose={() => setShowDetails(false)}
                />
            )}
        </>
    );
};

export default TaskCard;
