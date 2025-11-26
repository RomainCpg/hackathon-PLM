# Système de Gestion de Projets

Application complète de gestion de projets avec workflow visuel, inspirée de Tracepulse.

## 🚀 Fonctionnalités

- ✅ Gestion de projets multiples
- ✅ Système de tâches avec swimlanes (Clients, Logistics, Services)
- ✅ États de tâches: À faire, En cours, Révision, Terminé
- ✅ **Vue Diagramme Flow interactif avec React Flow** 🔥
- ✅ **Import de tâches depuis fichiers JSON** 📁
- ✅ API REST complète
- ✅ Interface moderne et responsive
- ✅ Drag & drop des nœuds dans le diagramme

## 📦 Structure du Projet

```
hackaton/
├── my-react-app/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── hooks/         # Custom hooks
│   │   ├── styles/        # Fichiers CSS
│   │   ├── types/         # Types TypeScript
│   │   ├── App.tsx        # Composant principal
│   │   └── main.tsx       # Point d'entrée
│   └── package.json
│
└── backend/               # Backend Node.js + Express
    ├── server.js          # Serveur API
    ├── package.json
    └── README.md
```

## 🛠️ Installation

### Frontend

```bash
cd my-react-app
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm run dev
```

Le backend sera accessible sur `http://localhost:3001`

## 🎯 Utilisation

1. Démarrer le backend en premier
2. Démarrer le frontend
3. Ouvrir `http://localhost:5173` dans votre navigateur

### Fonctionnalités disponibles :

- **Créer un projet** : Cliquez sur le bouton "+" dans la sidebar
- **Ajouter une tâche** : Cliquez sur "Nouvelle tâche" dans le board
- **Modifier une tâche** : Cliquez sur l'icône crayon sur une carte de tâche
- **Supprimer une tâche** : Cliquez sur l'icône poubelle
- **Changer de projet** : Cliquez sur un projet dans la sidebar
- **📊 Vue Grille / 🔀 Vue Diagramme** : Basculez entre les deux vues
- **📁 Importer JSON** : Uploadez des logs au format JSON pour créer des tâches automatiquement

## 🎨 Architecture

### Frontend (React + TypeScript)
- **React 19** avec hooks
- **TypeScript** pour le typage
- **Vite** pour le bundling
- **CSS modules** pour les styles

### Backend (Node.js + Express)
- **Express** pour l'API REST
- **CORS** pour la communication frontend-backend
- Base de données en mémoire (à migrer vers MongoDB/PostgreSQL)

## � Nouveauté: Diagramme Flow

### Vue Diagramme interactif
Visualisez vos workflows sous forme de diagramme de flux avec **React Flow** !

- Nœuds personnalisés par département et statut
- Connexions automatiques entre tâches
- Zoom, pan, drag & drop
- MiniMap pour navigation
- Animations pour les tâches en cours

### Import JSON
Importez vos logs/tâches depuis un fichier JSON :
```json
[
  {
    "title": "Ma tâche",
    "description": "Description",
    "status": "in-progress",
    "department": "clients"
  }
]
```

Voir `example-logs.json` et `FLOW_DIAGRAM.md` pour plus de détails.

## �🔧 Améliorations futures

- [x] Drag & drop pour déplacer les nœuds dans le diagramme
- [x] Import de fichiers JSON
- [ ] Export du diagramme en image
- [ ] Authentification utilisateur
- [ ] Base de données persistante (MongoDB/PostgreSQL)
- [ ] Notifications en temps réel (WebSocket)
- [ ] Export de données (PDF, Excel)
- [ ] Tableaux de bord et analytics
- [ ] Commentaires sur les tâches
- [ ] Pièces jointes
- [ ] Timeline des projets
- [ ] Filtres et recherche avancée

## 📝 API Endpoints

### Projets
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet

### Tâches
- `POST /api/projects/:id/tasks` - Ajouter une tâche
- `PUT /api/projects/:projectId/tasks/:taskId` - Modifier une tâche
- `DELETE /api/projects/:projectId/tasks/:taskId` - Supprimer une tâche

### Stats
- `GET /api/stats` - Statistiques globales

## 🤝 Contribution

N'hésitez pas à ajouter de nouvelles fonctionnalités !

## 📄 Licence

MIT
