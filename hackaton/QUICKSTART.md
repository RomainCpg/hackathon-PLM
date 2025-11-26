# Guide de Démarrage Rapide

## 🚀 Démarrage en 3 étapes

### 1. Backend
```bash
cd backend
npm install
node --watch server.js
```
✅ Backend sur http://localhost:3001

### 2. Frontend
```bash
cd my-react-app
npm install
npm run dev
```
✅ Frontend sur http://localhost:5173

### 3. Ouvrir dans le navigateur
Allez sur http://localhost:5173

## 📋 Fonctionnalités implémentées

### ✅ Gestion de projets
- Créer/modifier/supprimer des projets
- Sélectionner un projet actif
- Vue d'ensemble des projets dans la sidebar

### ✅ Gestion de tâches
- Créer/modifier/supprimer des tâches
- Organisation par département (Clients, Logistics, Services)
- États de tâches (À faire, En cours, Révision, Terminé)
- Affichage en grille avec swimlanes

### ✅ Interface utilisateur
- Design moderne et responsive
- Couleurs distinctes par département
- Modals pour la création/édition
- Indicateurs visuels de statut

## 🎨 Architecture technique

### Frontend
- **React 19** + **TypeScript**
- **Vite** comme bundler
- Composants modulaires et réutilisables
- Hooks personnalisés pour l'API
- CSS modular

### Backend
- **Node.js** + **Express**
- API RESTful
- CORS activé
- Base de données en mémoire (pour l'instant)

## 📝 Prochaines étapes suggérées

1. **Drag & Drop** : Permettre de déplacer les tâches entre colonnes
2. **Authentification** : Ajouter un système de login
3. **Base de données** : Connecter MongoDB ou PostgreSQL
4. **Temps réel** : WebSocket pour la collaboration
5. **Export** : Générer des rapports PDF/Excel
6. **Notifications** : Alertes pour les échéances
7. **Commentaires** : Discussions sur les tâches
8. **Pièces jointes** : Upload de fichiers
9. **Recherche** : Filtrer et rechercher les tâches
10. **Analytics** : Tableaux de bord avec statistiques

## 🛠️ Personnalisation

### Ajouter un nouveau département
1. Modifier `types/index.ts` pour ajouter le type
2. Ajouter le département dans `ProjectBoard.tsx`
3. Personnaliser la couleur et l'icône

### Ajouter un nouveau statut
1. Modifier `types/index.ts`
2. Ajouter le statut dans `ProjectBoard.tsx`
3. Adapter le CSS si nécessaire

### Modifier l'API
1. Ouvrir `backend/server.js`
2. Ajouter vos endpoints
3. Mettre à jour `hooks/useProjects.ts` si nécessaire

## 📦 Structure des fichiers

```
my-react-app/src/
├── components/
│   ├── ProjectBoard.tsx    # Board principal avec grille
│   ├── TaskCard.tsx         # Carte de tâche individuelle
│   └── Sidebar.tsx          # Sidebar avec liste de projets
├── hooks/
│   └── useProjects.ts       # Hook pour appels API
├── styles/
│   ├── ProjectBoard.css
│   ├── TaskCard.css
│   └── Sidebar.css
├── types/
│   └── index.ts             # Types TypeScript
├── App.tsx                  # Composant racine
└── main.tsx                 # Point d'entrée

backend/
├── server.js                # Serveur Express avec API
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Le backend ne démarre pas
- Vérifiez que le port 3001 est libre
- Vérifiez que Node.js est installé (`node --version`)

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend tourne sur http://localhost:3001
- Vérifiez les CORS dans `server.js`

### Erreurs TypeScript
- Exécutez `npm install` dans le dossier frontend
- Redémarrez le serveur de développement

## 💡 Conseils

- Utilisez les DevTools React pour debugger
- Consultez la console du navigateur pour les erreurs
- Les données sont perdues au redémarrage (DB en mémoire)
- Pour tester l'API : utilisez Postman ou curl

Bon développement ! 🎉
