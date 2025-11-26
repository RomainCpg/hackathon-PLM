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

// Format merged_json.json (manufacturing data)
interface MergedJsonEntry {
    Poste: number;
    Nom: string;
    'Nombre pièces': number;
    'Temps Prévu': string;
    Date: number;
    'Heure Début': string;
    'Heure Fin': string;
    'Temps Réel': string;
    'Aléas Industriels': string;
    'Cause Potentielle': string;
    Personnes: any[];
    Pièces: any[];
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

    const parseMergedJsonToTasks = (entries: MergedJsonEntry[]): Task[] => {
        // First pass: create all tasks
        const tasks = entries.map((entry) => {
            // Determine status: 'review' if issues, otherwise 'done'
            let status: 'todo' | 'in-progress' | 'review' | 'done' = 'done';
            if (entry['Aléas Industriels']) {
                status = 'review';
            }

            // Determine department based on task name
            let department: 'clients' | 'logistics' | 'services' = 'logistics';
            const taskName = entry.Nom.toLowerCase();
            if (taskName.includes('assemblage') || taskName.includes('montage')) {
                department = 'logistics';
            } else if (taskName.includes('fixation') || taskName.includes('sticker')) {
                department = 'services';
            }

            // Build rich description
            const descParts = [];
            if (entry['Aléas Industriels']) {
                descParts.push(`⚠️ Aléa: ${entry['Aléas Industriels']}`);
            }
            if (entry['Cause Potentielle']) {
                descParts.push(`Cause: ${entry['Cause Potentielle']}`);
            }
            descParts.push(`Pièces: ${entry['Nombre pièces']}`);
            descParts.push(`⏱️ Prévu: ${entry['Temps Prévu']} | Réel: ${entry['Temps Réel']}`);
            descParts.push(`🕐 ${entry['Heure Début']} → ${entry['Heure Fin']}`);
            
            const description = descParts.join(' • ');

            return {
                id: `poste-${entry.Poste}`,
                title: `Poste ${entry.Poste}: ${entry.Nom}`,
                description,
                status,
                department,
                createdAt: new Date(entry.Date).toISOString(),
                order: entry.Poste - 1,
                // Store original manufacturing data
                poste: entry.Poste,
                nombrePieces: entry['Nombre pièces'],
                'tempsPrévu': entry['Temps Prévu'],
                'tempsRéel': entry['Temps Réel'],
                'aléasIndustriels': entry['Aléas Industriels'],
                causePotentielle: entry['Cause Potentielle'],
                heureDebut: entry['Heure Début'],
                heureFin: entry['Heure Fin'],
                personnes: entry.Personnes,
                'pièces': entry.Pièces,
                // Initialize dependencies and position
                dependencies: [] as string[],
                position: undefined,
            };
        });

        // Second pass: build dependencies based on Semaine field
        // Group tasks by week number from Personnes
        const tasksByWeek = new Map<number, Task[]>();
        
        tasks.forEach(task => {
            if (task.personnes && task.personnes.length > 0) {
                // Get week number from first person's Semaine field
                const semaine = task.personnes[0].Semaine;
                if (typeof semaine === 'number') {
                    if (!tasksByWeek.has(semaine)) {
                        tasksByWeek.set(semaine, []);
                    }
                    tasksByWeek.get(semaine)!.push(task);
                }
            }
        });

        // Sort tasks within each week by Poste number
        tasksByWeek.forEach(weekTasks => {
            weekTasks.sort((a, b) => (a.poste || 0) - (b.poste || 0));
        });

        // Sort weeks
        const sortedWeeks = Array.from(tasksByWeek.keys()).sort((a, b) => a - b);
        
        // Build sequential dependencies: each task depends on the previous task
        // Within a week, tasks are sequential by Poste order
        // Between weeks, first task of week N depends on last task of week N-1
        let previousTask: Task | null = null;
        
        sortedWeeks.forEach(weekNum => {
            const weekTasks = tasksByWeek.get(weekNum)!;
            
            weekTasks.forEach(task => {
                if (previousTask) {
                    task.dependencies = [previousTask.id];
                } else {
                    task.dependencies = [];
                }
                previousTask = task;
            });
        });

        // Set initial positions based on sequential order
        let currentX = 50;
        let currentY = 50;
        const horizontalSpacing = 600;
        const verticalSpacing = 200;
        let tasksInRow = 0;
        const maxTasksPerRow = 5;
        
        sortedWeeks.forEach(weekNum => {
            const weekTasks = tasksByWeek.get(weekNum)!;
            
            weekTasks.forEach(task => {
                task.position = {
                    x: currentX,
                    y: currentY
                };
                
                // Move to next position
                tasksInRow++;
                if (tasksInRow >= maxTasksPerRow) {
                    // Move to next row
                    currentX = 50;
                    currentY += verticalSpacing;
                    tasksInRow = 0;
                } else {
                    // Move right
                    currentX += horizontalSpacing;
                }
            });
        });

        return tasks;
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

                let tasks: Task[];

                // Check if merged_json format (has Poste field)
                if (Array.isArray(parsed) && parsed.length > 0 && 'Poste' in parsed[0]) {
                    tasks = parseMergedJsonToTasks(parsed as MergedJsonEntry[]);
                } else {
                    // Original format
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

                    tasks = parseLogToTasks(logs);
                }

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
                <h4>Formats JSON acceptés :</h4>
                <pre>{`Format simple:
[{
  "title": "Recevoir la commande",
  "status": "done",
  "department": "clients"
}]

Format merged_json (fabrication):
[{
  "Poste": 1,
  "Nom": "Montage train atterissage",
  "Nombre pièces": 8,
  "Temps Prévu": "00:25:00",
  "Temps Réel": "00:32:45",
  "Aléas Industriels": "Rupture outillage"
}]`}</pre>
            </div>
        </div>
    );
};

export default FileUpload;
