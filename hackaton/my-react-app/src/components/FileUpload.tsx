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
    'Horaire de départ': string;
    'Horaire de fin': string;
    'Temps Réel': string;
    'Aléas Industriels': string;
    'Cause Potentielle': string;
    Personnes: any[];
    Pièces: any[];
    previousIds?: number[]; // Optional array of previous poste IDs
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
            assignedTo: log.assignedTo,
            dueDate: log.dueDate,
            createdAt: new Date().toISOString(),
            order: log.order !== undefined ? log.order : index,
        }));
    };

    const parseMergedJsonToTasks = (entries: MergedJsonEntry[]): Task[] => {
        // Helper function to parse date + time to timestamp in minutes since epoch start
        const parseDateTime = (dateMs: number, timeStr: string): number => {
            if (!timeStr) return dateMs;
            const parts = timeStr.split(':');
            const hours = parseInt(parts[0] || '0', 10);
            const minutes = parseInt(parts[1] || '0', 10);
            // Convert date to start of day + add time offset
            return dateMs + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
        };

        // First pass: create all tasks
        const tasks = entries.map((entry) => {
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
            
            // Use Horaire fields if available, fallback to Heure fields
            const startTime = entry['Horaire de départ'] || entry['Heure Début'];
            const endTime = entry['Horaire de fin'] || entry['Heure Fin'];
            descParts.push(`🕐 ${startTime} → ${endTime}`);
            
            const description = descParts.join(' • ');

            return {
                id: `poste-${entry.Poste}`,
                title: `Poste ${entry.Poste}: ${entry.Nom}`,
                description,
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
                horaireDepart: startTime,
                horaireFin: endTime,
                dateDebut: entry["Date"],
                personnes: entry["Personnes"],
                'pièces': entry["Pièces"],
                // Initialize dependencies and position - will be set in second pass
                dependencies: [] as number[],
                position: { x: 0, y: 0 },
            };
        });

        // Second pass: sort by Date + start time chronologically
        const sortedTasks = [...tasks].sort((a, b) => {
            const dateTimeA = parseDateTime(a.dateDebut || 0, a.horaireDepart || a.heureDebut || '');
            const dateTimeB = parseDateTime(b.dateDebut || 0, b.horaireDepart || b.heureDebut || '');
            if (dateTimeA !== dateTimeB) return dateTimeA - dateTimeB;
            // If same date/time, sort by Poste number
            return (a.poste || 0) - (b.poste || 0);
        });
        
        // Build dependencies from previousIds or default to sequential
        sortedTasks.forEach((task, _) => {
            // Find the original entry to get previousIds
            const originalEntry = entries.find(e => e.Poste === task.poste);
            
            if (originalEntry?.previousIds && originalEntry.previousIds.length > 0) {
                // Use previousIds from JSON as dependencies
                task.dependencies = originalEntry.previousIds;
            } else {
                // Empty previousIds means no dependencies
                task.dependencies = [];
            }
        });

        // Set initial positions based on sequential order
        let currentX = 50;
        let currentY = 50;
        const horizontalSpacing = 600;
        const verticalSpacing = 200;
        let tasksInRow = 0;
        const maxTasksPerRow = 5;
        
        sortedTasks.forEach(task => {
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
        </div>
    );
};

export default FileUpload;
