import React, { useState } from 'react';
import type { Project, Task } from '../types';
import TaskCard from './TaskCard.tsx';
import '../styles/ProjectBoard.css';

interface ProjectBoardProps {
    project: Project;
    onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
    onDeleteTask: (taskId: string) => void;
    onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({
    project,
    onUpdateTask,
    onDeleteTask,
    onAddTask
}) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        department: 'assembly' as const,
        status: 'todo' as const,
        order: 0
    });

    const departments = [
        { id: 'assembly', name: 'Assemblage', color: '#E3F2FD', icon: '�' },
        { id: 'integration', name: 'Intégration', color: '#FFF3E0', icon: '�' },
        { id: 'finishing', name: 'Finition', color: '#F1F8E9', icon: '✨' }
    ];

    const statuses = [
        { id: 'todo', name: 'À faire' },
        { id: 'in-progress', name: 'En cours' },
        { id: 'review', name: 'Révision' },
        { id: 'done', name: 'Terminé' }
    ];

    const getTasksByDepartmentAndStatus = (dept: string, status: string) => {
        return project.tasks
            .filter(task => task.department === dept && task.status === status)
            .sort((a, b) => a.order - b.order);
    };

    const handleAddTask = () => {
        onAddTask(newTask);
        setNewTask({
            title: '',
            description: '',
            department: 'assembly',
            status: 'todo',
            order: 0
        });
        setShowAddModal(false);
    };

    return (
        <div className="project-board">
            <div className="board-header">
                <h2>{project.name}</h2>
                <button className="add-task-btn" onClick={() => setShowAddModal(true)}>
                    + Nouvelle tâche
                </button>
            </div>

            <div className="board-grid">
                <div className="status-headers">
                    <div className="empty-cell"></div>
                    {statuses.map(status => (
                        <div key={status.id} className="status-header">
                            {status.name}
                        </div>
                    ))}
                </div>

                {departments.map(dept => (
                    <div key={dept.id} className="department-row">
                        <div
                            className="department-header"
                            style={{ backgroundColor: dept.color }}
                        >
                            <span className="dept-icon">{dept.icon}</span>
                            <span>{dept.name}</span>
                        </div>

                        {statuses.map(status => (
                            <div key={`${dept.id}-${status.id}`} className="task-column">
                                {getTasksByDepartmentAndStatus(dept.id, status.id).map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onUpdate={onUpdateTask}
                                        onDelete={onDeleteTask}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Nouvelle tâche</h3>
                        <input
                            type="text"
                            placeholder="Titre de la tâche"
                            value={newTask.title}
                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Description"
                            value={newTask.description}
                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        />
                        <select
                            value={newTask.department}
                            onChange={e => setNewTask({ ...newTask, department: e.target.value as any })}
                        >
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <select
                            value={newTask.status}
                            onChange={e => setNewTask({ ...newTask, status: e.target.value as any })}
                        >
                            {statuses.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <div className="modal-actions">
                            <button onClick={() => setShowAddModal(false)}>Annuler</button>
                            <button onClick={handleAddTask} className="primary">Créer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectBoard;
