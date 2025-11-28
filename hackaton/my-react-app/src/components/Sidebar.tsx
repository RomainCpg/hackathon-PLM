import React from 'react';
import type { Project } from '../types';
import '../styles/Sidebar.css';

interface SidebarProps {
    projects: Project[];
    selectedProjectId: string | null;
    onSelectProject: (projectId: string) => void;
    onAddProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    projects,
    selectedProjectId,
    onSelectProject,
    onAddProject
}) => {
    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <img src="/logo.jpeg" alt="PulseTrack" className="brand-logo" />
                <h1 className="brand-name">PulseTrack</h1>
            </div>
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
                            <h3>{project.name}</h3>
                            <span className={`status-badge status-${project.status}`}>
                                {project.status === 'active' ? 'Actif' :
                                    project.status === 'completed' ? 'Terminé' : 'En pause'}
                            </span>
                        </div>
                        <div className="project-stats">
                            <span>{project.tasks.length} tâches</span>
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
