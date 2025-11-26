// Structure d'une personne
export interface Personne {
    Nom: string;
    Prénom: string;
    Âge: number;
    Sexe: string;
    Poste: string;
    "Niveau d'expérience": string;
    "Années d'expérience": number;
    Spécialité: string;
    Formation: string;
    Certification?: string;
    "Date d'embauche": number;
    Email: string;
    Téléphone: string;
    Salaire: string;
    "Adresse du domicile": string;
    "Commentaire de carrière": string;
}

// Structure d'une pièce
export interface Piece {
    Référence: string;
    Nom: string;
    Catégorie: string;
    Matériau: string;
    Poids?: number;
    Fournisseur: string;
    "Prix unitaire"?: number;
    "Temps CAO (h)": number;
}

// Structure d'un poste de travail (workstation)
export interface Poste {
    Poste: number;
    Nom: string;
    "Nombre pièces": number;
    Référence: string | null;
    "Temps Prévu": string;
    Date: number;
    "Heure Début": string;
    "Heure Fin": string;
    "Temps Réel": string;
    "Aléas Industriels": string;
    "Cause Potentielle": string;
    Personnes: Personne[];
    Pièces: Piece[];
}

// Interface Task pour la compatibilité avec le code existant
export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    department: 'assembly' | 'integration' | 'finishing';
    assignedTo?: string;
    dueDate?: string;
    createdAt: string;
    order: number;
    // Données spécifiques au manufacturing
    posteNumber?: number;
    tempsPrevu?: string;
    tempsReel?: string;
    aleasIndustriels?: string;
    causePotentielle?: string;
    personnes?: Personne[];
    pieces?: Piece[];
    nombrePieces?: number;
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
