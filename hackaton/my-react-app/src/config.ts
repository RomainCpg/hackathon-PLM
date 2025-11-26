// Configuration de l'application
export const config = {
    // URL de l'API backend
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',

    // Configuration des départements
    departments: [
        { id: 'clients', name: 'Clients', color: '#E3F2FD', icon: '👥' },
        { id: 'logistics', name: 'Logistics', color: '#FFF3E0', icon: '🚚' },
        { id: 'services', name: 'Services', color: '#F1F8E9', icon: '🔧' }
    ],

    // Configuration des statuts
    statuses: [
        { id: 'todo', name: 'À faire', color: '#9E9E9E' },
        { id: 'in-progress', name: 'En cours', color: '#2196F3' },
        { id: 'review', name: 'Révision', color: '#FF9800' },
        { id: 'done', name: 'Terminé', color: '#4CAF50' }
    ],

    // Configuration générale
    app: {
        name: 'Gestion de Projets',
        version: '1.0.0',
        description: 'Système de gestion de projets avec workflow'
    }
};
