import React, { useRef, useState } from 'react';
import type { Task } from '../types';
import '../styles/FileUpload.css';

interface FileUploadProps {
    onTasksLoaded: (tasks: Task[]) => void;
}

// Format attendu du JSON
interface LogEntry {
    id?: string;
    title: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'review' | 'done';
    department?: 'clients' | 'logistics' | 'services';
    assignedTo?: string;
    dueDate?: string;
    order?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onTasksLoaded }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const parseLogToTasks = (logs: LogEntry[]): Task[] => {
        return logs.map((log, index) => ({
            id: log.id || `task-${Date.now()}-${index}`,
            title: log.title,
            description: log.description || '',
            status: log.status || 'todo',
            department: log.department || 'clients',
            assignedTo: log.assignedTo,
            dueDate: log.dueDate,
            createdAt: new Date().toISOString(),
            order: log.order !== undefined ? log.order : index,
        }));
    };

    const handleFile = (file: File) => {
        if (!file.name.endsWith('.json')) {
            setError('Le fichier doit être au format JSON');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);

                // Accepter soit un array soit un objet avec une propriété tasks/logs
                let logs: LogEntry[];

                if (Array.isArray(parsed)) {
                    logs = parsed;
                } else if (parsed.tasks) {
                    logs = parsed.tasks;
                } else if (parsed.logs) {
                    logs = parsed.logs;
                } else {
                    throw new Error('Format JSON invalide. Attendu: un array ou {tasks: [...]} ou {logs: [...]}');
                }

                const tasks = parseLogToTasks(logs);
                onTasksLoaded(tasks);
                setError(null);

                // Reset input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier');
            }
        };

        reader.onerror = () => {
            setError('Erreur lors de la lecture du fichier');
        };

        reader.readAsText(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="file-upload-container">
            <div
                className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <div className="upload-icon">📁</div>
                <p className="upload-text">
                    Glissez un fichier JSON ici ou cliquez pour sélectionner
                </p>
                <p className="upload-hint">
                    Format: <code>[{`{title, description, status, department, ...}`}]</code>
                </p>
            </div>

            {error && (
                <div className="upload-error">
                    ⚠️ {error}
                </div>
            )}

            <div className="upload-example">
                <h4>Exemple de format JSON :</h4>
                <pre>{`[
  {
    "title": "Recevoir la commande",
    "description": "Validation de la commande client",
    "status": "done",
    "department": "clients",
    "order": 0
  },
  {
    "title": "Classifier la pièce",
    "description": "Classification technique",
    "status": "in-progress",
    "department": "clients",
    "order": 1
  }
]`}</pre>
            </div>
        </div>
    );
};

export default FileUpload;
