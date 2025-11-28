export interface Task {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    order: number;
    // Manufacturing fields from merged_json
    poste?: number;
    nombrePieces?: number;
    'tempsPrévu'?: string;
    'tempsRéel'?: string;
    'aléasIndustriels'?: string;
    causePotentielle?: string;
    heureDebut?: string;
    heureFin?: string;
    horaireDepart?: string;
    horaireFin?: string;
    dateDebut?: number;
    personnes?: any[];
    'pièces'?: any[];
    nextId?: number | null; // ID du prochain poste dans le workflow
    // Flow diagram fields
    dependencies?: string[]; // IDs of tasks that must complete before this one
    position?: { x: number; y: number }; // Position in flow diagram
}

export interface Project {
    id: string;
    name: string;
    description: string;
    tasks: Task[];
    createdAt: string;
    status: 'active' | 'completed' | 'on-hold';
}

export interface Department {
    id: string;
    name: string;
    color: string;
    icon: string;
}
