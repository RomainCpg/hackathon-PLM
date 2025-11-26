import React, { useState } from 'react';
import type { Task } from '../types';
import '../styles/TaskCard.css';

interface TaskCardProps {
    task: Task;
    onUpdate: (taskId: string, updates: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
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
        <div className="task-card">
            <div className="task-header">
                <h4>{task.title}</h4>
                <div className="task-actions">
                    <button onClick={() => setIsEditing(true)} className="edit-btn">✏️</button>
                    <button onClick={() => onDelete(task.id)} className="delete-btn">🗑️</button>
                </div>
            </div>
            <p className="task-description">{task.description}</p>
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
    );
};

export default TaskCard;
