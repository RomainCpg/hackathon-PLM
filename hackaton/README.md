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
│   │   ├── services/      # Services API
│   │   ├── App.tsx        # Composant principal
│   │   └── main.tsx       # Point d'entrée
│   └── package.json
│
├── backend/               # Backend Node.js + Express
│   ├── index.js           # Serveur API principal
│   ├── storage.js         # Gestion des données
│   ├── package.json
│   └── README.md
│
└── optimization-backend/  # Backend Python pour optimisation
    ├── app.py             # API Flask pour l'optimisation
    ├── rl_model.py        # Modèle d'optimisation
    ├── requirements.txt   # Dépendances Python
    └── .gitignore
```

## 🛠️ Installation

### Prérequis
- **Node.js** (v16+)
- **Python** (v3.8+)
- **npm** ou **yarn**

### Frontend

```bash
cd my-react-app
npm install
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

### Backend Node.js (API principale)

```bash
cd backend
npm install
npm start
```

Le backend sera accessible sur `http://localhost:3000`

### Backend Python (Optimisation Gantt)

```bash
cd optimization-backend
pip install -r requirements.txt
python app.py
```

Le backend d'optimisation sera accessible sur `http://localhost:5000`

## 🎯 Utilisation

1. **Démarrer le backend Node.js** (API principale)
2. **Démarrer le backend Python** (API d'optimisation) - optionnel, uniquement pour l'optimisation du Gantt
3. **Démarrer le frontend**
4. Ouvrir `http://localhost:5173` dans votre navigateur

### Fonctionnalités disponibles :

- **Créer un projet** : Cliquez sur le bouton "+" dans la sidebar
- **Ajouter une tâche** : Cliquez sur "Nouvelle tâche" dans le board
- **Modifier une tâche** : Cliquez sur l'icône crayon sur une carte de tâche
- **Supprimer une tâche** : Cliquez sur l'icône poubelle
- **Changer de projet** : Cliquez sur un projet dans la sidebar
- **📊 Vue Grille / 🔀 Vue Diagramme / 📈 Vue Gantt** : Basculez entre les vues
- **📁 Importer JSON** : Uploadez des logs au format JSON pour créer des tâches automatiquement
- **🚀 Optimisation Gantt** : Dans la vue Gantt, utilisez le toggle "Initial/Optimisé" pour calculer un planning optimal

## 🎨 Architecture

### Frontend (React + TypeScript)
- **React 19** avec hooks
- **TypeScript** pour le typage
- **Vite** pour le bundling
- **React Flow** pour les diagrammes interactifs
- **CSS modules** pour les styles

### Backend Node.js (Express)
- **Express** pour l'API REST
- **CORS** pour la communication frontend-backend
- Gestion des données (records, incidents, personnes, pièces)
- Stockage en fichiers JSON

### Backend Python (Flask)
- **Flask** pour l'API d'optimisation
- **OR-Tools** pour l'optimisation de planification
- Calcul du planning optimal du diagramme de Gantt
- CORS activé pour communication avec le frontend

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

### Backend Node.js (port 3000)

#### Projets
- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet

#### Tâches
- `POST /api/projects/:id/tasks` - Ajouter une tâche
- `PUT /api/projects/:projectId/tasks/:taskId` - Modifier une tâche
- `DELETE /api/projects/:projectId/tasks/:taskId` - Supprimer une tâche

#### Records (données de production)
- `GET /records` - Liste des enregistrements
- `POST /records` - Créer un enregistrement
- `PUT /records/:poste` - Modifier un enregistrement
- `DELETE /records/:poste` - Supprimer un enregistrement

#### Incidents
- `GET /incidents` - Liste des incidents
- `POST /incidents` - Créer un incident
- `DELETE /incidents/:id` - Supprimer un incident

#### Stats
- `GET /api/stats` - Statistiques globales

### Backend Python (port 5000)

#### Optimisation
- `POST /get_optimal_gantt` - Calculer le planning optimal
  - Envoie un tableau de tâches au format JSON
  - Retourne les tâches avec le champ `"Heure de début optimale"` ajouté

## 🤝 Contribution

N'hésitez pas à ajouter de nouvelles fonctionnalités !

## 📄 Licence

MIT
