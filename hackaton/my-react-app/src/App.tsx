import { useState } from 'react'
import type { Project, Task } from './types'
import Sidebar from './components/Sidebar'
import Statistics from './components/Statistics'
import FlowDiagram from './components/FlowDiagram'
import GanttChart from './components/GanttChart'
import FileUpload from './components/FileUpload'
import RecordManager from './components/RecordManager'
import WorkflowView from './components/WorkflowView'
import './App.css'

function App() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [viewMode, setViewMode] = useState<'gantt' | 'statistics' | 'flow' | 'records' | 'workflow'>('gantt');
  const [showUpload, setShowUpload] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleUpdateTasks = (updatedTasks: Task[]) => {
    setProjects(prev => prev.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          tasks: updatedTasks
        };
      }
      return project;
    }));
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Nouveau Projet ${projects.length + 1}`,
      description: 'Description du projet',
      status: 'active',
      createdAt: new Date().toISOString(),
      tasks: []
    };
    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
  };

  const handleTasksLoaded = (tasks: Task[]) => {
    if (selectedProject) {
      setProjects(prev => prev.map(project => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            tasks: [...project.tasks, ...tasks]
          };
        }
        return project;
      }));
      setShowUpload(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onAddProject={handleAddProject}
      />
      <div className="main-content">
        {selectedProject ? (
          <>
            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'gantt' ? 'active' : ''}`}
                onClick={() => setViewMode('gantt')}
              >
                📊 Gantt
              </button>
              <button
                className={`view-btn ${viewMode === 'statistics' ? 'active' : ''}`}
                onClick={() => setViewMode('statistics')}
              >
                📈 Statistiques
              </button>
              <button
                className={`view-btn ${viewMode === 'flow' ? 'active' : ''}`}
                onClick={() => setViewMode('flow')}
              >
                🔀 Diagramme Flow
              </button>
              <button
                className={`view-btn ${viewMode === 'workflow' ? 'active' : ''}`}
                onClick={() => setViewMode('workflow')}
              >
                🔗 Workflow
              </button>
              <button
                className={`view-btn ${viewMode === 'records' ? 'active' : ''}`}
                onClick={() => setViewMode('records')}
              >
                📦 Records
              </button>
              <button
                className="upload-btn"
                onClick={() => setShowUpload(!showUpload)}
              >
                📁 {showUpload ? 'Fermer' : 'Importer JSON'}
              </button>
            </div>

            {showUpload && (
              <FileUpload onTasksLoaded={handleTasksLoaded} />
            )}

            {viewMode === 'gantt' ? (
              <GanttChart tasks={selectedProject.tasks} />
            ) : viewMode === 'statistics' ? (
              <Statistics tasks={selectedProject.tasks} />
            ) : viewMode === 'flow' ? (
              <FlowDiagram 
                tasks={selectedProject.tasks} 
                onTasksUpdate={handleUpdateTasks}
              />
            ) : viewMode === 'workflow' ? (
              <WorkflowView />
            ) : (
              <RecordManager />
            )}
          </>
        ) : (
          <div className="no-project">
            <h2>Aucun projet sélectionné</h2>
            <p>Créez un nouveau projet pour commencer</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
