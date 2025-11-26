import { useState } from 'react'
import type { Project, Task } from './types'
import Sidebar from './components/Sidebar'
import ProjectBoard from './components/ProjectBoard'
import FlowDiagram from './components/FlowDiagram'
import FileUpload from './components/FileUpload'
import './App.css'

function App() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Projet Airplus',
      description: 'Gestion des processus clients, logistique et services',
      status: 'active',
      createdAt: new Date().toISOString(),
      tasks: [
        {
          id: '1',
          title: 'Recevoir la commande',
          description: 'Réception et validation de la commande client',
          status: 'done',
          department: 'clients',
          createdAt: new Date().toISOString(),
          order: 0
        },
        {
          id: '2',
          title: 'Classifier la pièce',
          description: 'Classification et catégorisation de la pièce',
          status: 'in-progress',
          department: 'clients',
          createdAt: new Date().toISOString(),
          order: 1
        },
        {
          id: '3',
          title: 'Réviser la pièce',
          description: 'Révision technique et validation des spécifications',
          status: 'todo',
          department: 'logistics',
          createdAt: new Date().toISOString(),
          order: 0
        },
        {
          id: '4',
          title: 'Valider les specs',
          description: 'Validation finale des spécifications techniques',
          status: 'todo',
          department: 'logistics',
          createdAt: new Date().toISOString(),
          order: 1
        },
        {
          id: '5',
          title: 'Approuver la pièce',
          description: 'Approbation finale avant production',
          status: 'todo',
          department: 'services',
          createdAt: new Date().toISOString(),
          order: 0
        }
      ]
    }
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [viewMode, setViewMode] = useState<'grid' | 'flow'>('grid');
  const [showUpload, setShowUpload] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setProjects(prev => prev.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          tasks: project.tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        };
      }
      return project;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          tasks: project.tasks.filter(task => task.id !== taskId)
        };
      }
      return project;
    }));
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setProjects(prev => prev.map(project => {
      if (project.id === selectedProjectId) {
        return {
          ...project,
          tasks: [...project.tasks, newTask]
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
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                📊 Grille
              </button>
              <button
                className={`view-btn ${viewMode === 'flow' ? 'active' : ''}`}
                onClick={() => setViewMode('flow')}
              >
                🔀 Diagramme Flow
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

            {viewMode === 'grid' ? (
              <ProjectBoard
                project={selectedProject}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
              />
            ) : (
              <FlowDiagram tasks={selectedProject.tasks} />
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
