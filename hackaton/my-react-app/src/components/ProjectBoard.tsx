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
        department: 'logistics' as const,
        status: 'todo' as const,
        order: 0
    });

    // Extract unique task types from the tasks
    const getTaskTypes = () => {
        const types = new Set<string>();
        project.tasks.forEach(task => {
            // Extract task type from title (after "Poste X: ")
            const match = task.title.match(/: (.+)$/);
            if (match) {
                const taskName = match[1];
                // Group similar tasks
                if (taskName.includes('Assemblage')) types.add('Assemblage');
                else if (taskName.includes('Montage')) types.add('Montage');
                else if (taskName.includes('Fixation')) types.add('Fixation');
                else if (taskName.includes('Stickers')) types.add('Stickers');
                else if (taskName.includes('Passage')) types.add('Passage');
                else types.add('Autre');
            }
        });
        return Array.from(types).sort();
    };

    // Get unique people from all tasks
    const getPeople = () => {
        const peopleSet = new Set<string>();
        project.tasks.forEach(task => {
            if (task.personnes && Array.isArray(task.personnes)) {
                task.personnes.forEach((person: any) => {
                    if (person.Nom) peopleSet.add(person.Nom);
                });
            }
        });
        return Array.from(peopleSet).sort();
    };

    const taskTypes = getTaskTypes();
    const people = getPeople();

    const getTaskType = (task: Task) => {
        const match = task.title.match(/: (.+)$/);
        if (match) {
            const taskName = match[1];
            if (taskName.includes('Assemblage')) return 'Assemblage';
            if (taskName.includes('Montage')) return 'Montage';
            if (taskName.includes('Fixation')) return 'Fixation';
            if (taskName.includes('Stickers')) return 'Stickers';
            if (taskName.includes('Passage')) return 'Passage';
        }
        return 'Autre';
    };

    const getTasksByType = (type: string) => {
        return project.tasks.filter(task => getTaskType(task) === type).sort((a, b) => a.order - b.order);
    };

    const getTasksByPerson = (personName: string) => {
        return project.tasks.filter(task => {
            if (!task.personnes || !Array.isArray(task.personnes)) return false;
            return task.personnes.some((person: any) => person.Nom === personName);
        }).sort((a, b) => a.order - b.order);
    };

    const handleAddTask = () => {
        onAddTask(newTask);
        setNewTask({
            title: '',
            description: '',
            department: 'logistics' as const,
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
                <div className="grid-section">
                    <h3 className="section-title">📋 Type de tâche</h3>
                    <div className="grid-columns">
                        {taskTypes.map(type => (
                            <div key={type} className="task-type-column">
                                <div className="column-header">
                                    <span>{type}</span>
                                    <span className="task-count">{getTasksByType(type).length}</span>
                                </div>
                                <div className="task-list">
                                    {getTasksByType(type).map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onUpdate={onUpdateTask}
                                            onDelete={onDeleteTask}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid-section">
                    <h3 className="section-title">👥 Personnes impliquées</h3>
                    <div className="grid-columns">
                        {people.length > 0 ? (
                            people.slice(0, 6).map(person => (
                                <div key={person} className="person-column">
                                    <div className="column-header">
                                        <span className="person-name">{person}</span>
                                        <span className="task-count">{getTasksByPerson(person).length}</span>
                                    </div>
                                    <div className="task-list">
                                        {getTasksByPerson(person).map(task => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onUpdate={onUpdateTask}
                                                onDelete={onDeleteTask}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data">Aucune personne assignée</div>
                        )}
                    </div>
                </div>
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
                            value={newTask.status}
                            onChange={e => setNewTask({ ...newTask, status: e.target.value as any })}
                        >
                            <option value="todo">À faire</option>
                            <option value="in-progress">En cours</option>
                            <option value="review">Révision</option>
                            <option value="done">Terminé</option>
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
