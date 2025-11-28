export const API_BASE_URL = 'https://hackathon-plm-backend.rcproject.info';

// Types for API requests/responses matching your JSON structure
export interface Record {
  Poste: number;
  Nom?: string;
  'Nombre pièces'?: number;
  Référence?: string;
  'Temps Prévu'?: string;
  Date?: number;
  'Heure Début'?: string;
  'Heure Fin'?: string;
  'Temps Réel'?: string;
  'Aléas Industriels'?: string;
  'Cause Potentielle'?: string;
  Personnes?: Personne[];
  Pièces?: Piece[];
  nextId?: number | null; // ID du prochain poste dans le workflow
  [key: string]: any;
}

export interface Personne {
  Matricule: string;
  Prénom?: string;
  Nom?: string;
  Semaine?: number;
  Âge?: number;
  Qualification?: string;
  Habilitations?: string[];
  'Niveau assemblage'?: number;
  'Niveau électrique'?: number;
  'Niveau mécanique'?: number;
  'Niveau plan'?: number;
  'Niveau qualité'?: number;
  'Niveau soudure'?: number;
  'Coût horaire (€)'?: number;
  "Niveau d'expérience"?: string;
  'Commentaire de carrière'?: string;
  [key: string]: any;
}

export interface Piece {
  Référence: string;
  Désignation?: string;
  Quantité?: number;
  Fournisseur?: string;
  'Délai Approvisionnement'?: string;
  Criticité?: string;
  'Masse (kg)'?: number;
  'Coût achat pièce (€)'?: number;
  'Temps CAO (h)'?: number;
  [key: string]: any;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  return response.json();
}

// ==================== RECORDS ROUTES ====================

/**
 * Get all records
 */
export async function getAllRecords(): Promise<Record[]> {
  const response = await fetch(`${API_BASE_URL}/records`);
  return handleResponse<Record[]>(response);
}

/**
 * Get a single record by Poste
 */
export async function getRecord(poste: number): Promise<Record> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}`);
  return handleResponse<Record>(response);
}

/**
 * Create a new record
 */
export async function createRecord(record: Record): Promise<Record> {
  const response = await fetch(`${API_BASE_URL}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });
  return handleResponse<Record>(response);
}

/**
 * Update an existing record
 */
export async function updateRecord(poste: number, record: Partial<Record>): Promise<Record> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });
  return handleResponse<Record>(response);
}

/**
 * Delete a record
 */
export async function deleteRecord(poste: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
}

// ==================== PERSONNES ROUTES ====================

/**
 * Add a personne to a record
 */
export async function addPersonne(poste: number, personne: Personne): Promise<Personne> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}/personnes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(personne),
  });
  return handleResponse<Personne>(response);
}

/**
 * Update a personne in a record
 */
export async function updatePersonne(
  poste: number,
  matricule: string,
  personne: Partial<Personne>
): Promise<Personne> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}/personnes/${matricule}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(personne),
  });
  return handleResponse<Personne>(response);
}

/**
 * Delete a personne from a record
 */
export async function deletePersonne(poste: number, matricule: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}/personnes/${matricule}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
}

// ==================== PIECES ROUTES ====================

/**
 * Add a pièce to a record
 */
export async function addPiece(poste: number, piece: Piece): Promise<Piece> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}/pieces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(piece),
  });
  return handleResponse<Piece>(response);
}

/**
 * Update a pièce in a record
 */
export async function updatePiece(
  poste: number,
  ref: string,
  piece: Partial<Piece>
): Promise<Piece> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}/pieces/${ref}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(piece),
  });
  return handleResponse<Piece>(response);
}

/**
 * Delete a pièce from a record
 */
export async function deletePiece(poste: number, ref: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/records/${poste}/pieces/${ref}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Batch fetch multiple records
 */
export async function getRecordsBatch(postes: number[]): Promise<Record[]> {
  const promises = postes.map(poste => getRecord(poste));
  return Promise.all(promises);
}

/**
 * Check if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/records`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}
