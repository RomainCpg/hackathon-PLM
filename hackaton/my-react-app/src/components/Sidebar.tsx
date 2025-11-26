import React, { useState } from 'react';
import type { Project } from '../types';
import '../styles/Sidebar.css';

interface SidebarProps {
    projects: Project[];
    selectedProjectId: string | null;
    onSelectProject: (projectId: string) => void;
    onAddProject: () => void;
    onRenameProject: (projectId: string, newName: string) => void;
    onDeleteProject: (projectId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    projects,
    selectedProjectId,
    onSelectProject,
    onAddProject,
    onRenameProject,
    onDeleteProject
}) => {
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const handleStartEdit = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProjectId(project.id);
        setEditingName(project.name);
    };

    const handleSaveEdit = (projectId: string, e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.stopPropagation();
        if (editingName.trim()) {
            onRenameProject(projectId, editingName.trim());
        }
        setEditingProjectId(null);
        setEditingName('');
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingProjectId(null);
        setEditingName('');
    };

    const handleDelete = (projectId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            onDeleteProject(projectId);
        }
    };

    const handleKeyDown = (projectId: string, e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveEdit(projectId, e);
        } else if (e.key === 'Escape') {
            e.stopPropagation();
            setEditingProjectId(null);
            setEditingName('');
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>📊 Projets</h2>
                <button onClick={onAddProject} className="add-project-btn">+</button>
            </div>

            <div className="projects-list">
                {projects.map(project => (
                    <div
                        key={project.id}
                        className={`project-item ${selectedProjectId === project.id ? 'active' : ''}`}
                        onClick={() => onSelectProject(project.id)}
                    >
                        <div className="project-info">
                            {editingProjectId === project.id ? (
                                <div className="project-name-edit" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(project.id, e)}
                                        autoFocus
                                        className="project-name-input"
                                    />
                                    <button
                                        onClick={(e) => handleSaveEdit(project.id, e)}
                                        className="save-btn"
                                        title="Sauvegarder"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="cancel-btn"
                                        title="Annuler"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3>{project.name}</h3>
                                    <div className="project-actions">
                                        <button
                                            onClick={(e) => handleStartEdit(project, e)}
                                            className="edit-btn"
                                            title="Modifier le nom"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(project.id, e)}
                                            className="delete-btn"
                                            title="Supprimer le projet"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="project-info-bottom">
                            <span className={`status-badge status-${project.status}`}>
                                {project.status === 'active' ? 'Actif' :
                                    project.status === 'completed' ? 'Terminé' : 'En pause'}
                            </span>
                            <div className="project-stats">
                                <span>{project.tasks.length} tâches</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <div className="stats-summary">
                    <h4>Statistiques</h4>
                    <p>Total: {projects.length} projets</p>
                    <p>Actifs: {projects.filter(p => p.status === 'active').length}</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
