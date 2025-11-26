# Documentation API

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### 1. Projets

#### GET /api/projects
Récupère la liste de tous les projets.

**Réponse :**
```json
[
  {
    "id": "1",
    "name": "Projet Airplus",
    "description": "Description du projet",
    "status": "active",
    "createdAt": "2025-11-26T10:00:00.000Z",
    "tasks": [...]
  }
]
```

#### GET /api/projects/:id
Récupère un projet spécifique par son ID.

**Paramètres :**
- `id` : ID du projet

**Réponse :**
```json
{
  "id": "1",
  "name": "Projet Airplus",
  "description": "Description du projet",
  "status": "active",
  "createdAt": "2025-11-26T10:00:00.000Z",
  "tasks": [...]
}
```

#### POST /api/projects
Crée un nouveau projet.

**Body :**
```json
{
  "name": "Nouveau Projet",
  "description": "Description",
  "status": "active"
}
```

**Réponse :**
```json
{
  "id": "2",
  "name": "Nouveau Projet",
  "description": "Description",
  "status": "active",
  "createdAt": "2025-11-26T10:00:00.000Z",
  "tasks": []
}
```

#### PUT /api/projects/:id
Met à jour un projet existant.

**Paramètres :**
- `id` : ID du projet

**Body :**
```json
{
  "name": "Projet Modifié",
  "status": "completed"
}
```

**Réponse :**
```json
{
  "id": "1",
  "name": "Projet Modifié",
  "description": "Description",
  "status": "completed",
  "createdAt": "2025-11-26T10:00:00.000Z",
  "tasks": [...]
}
```

#### DELETE /api/projects/:id
Supprime un projet.

**Paramètres :**
- `id` : ID du projet

**Réponse :** 204 No Content

---

### 2. Tâches

#### POST /api/projects/:id/tasks
Ajoute une nouvelle tâche à un projet.

**Paramètres :**
- `id` : ID du projet

**Body :**
```json
{
  "title": "Nouvelle tâche",
  "description": "Description de la tâche",
  "status": "todo",
  "department": "clients",
  "assignedTo": "Jean Dupont",
  "dueDate": "2025-12-01T00:00:00.000Z",
  "order": 0
}
```

**Réponse :**
```json
{
  "id": "4",
  "title": "Nouvelle tâche",
  "description": "Description de la tâche",
  "status": "todo",
  "department": "clients",
  "assignedTo": "Jean Dupont",
  "dueDate": "2025-12-01T00:00:00.000Z",
  "createdAt": "2025-11-26T10:00:00.000Z",
  "order": 0
}
```

#### PUT /api/projects/:projectId/tasks/:taskId
Met à jour une tâche existante.

**Paramètres :**
- `projectId` : ID du projet
- `taskId` : ID de la tâche

**Body :**
```json
{
  "status": "in-progress",
  "assignedTo": "Marie Martin"
}
```

**Réponse :**
```json
{
  "id": "4",
  "title": "Nouvelle tâche",
  "description": "Description de la tâche",
  "status": "in-progress",
  "department": "clients",
  "assignedTo": "Marie Martin",
  "dueDate": "2025-12-01T00:00:00.000Z",
  "createdAt": "2025-11-26T10:00:00.000Z",
  "order": 0
}
```

#### DELETE /api/projects/:projectId/tasks/:taskId
Supprime une tâche.

**Paramètres :**
- `projectId` : ID du projet
- `taskId` : ID de la tâche

**Réponse :** 204 No Content

---

### 3. Statistiques

#### GET /api/stats
Récupère les statistiques globales.

**Réponse :**
```json
{
  "totalProjects": 5,
  "activeProjects": 3,
  "completedProjects": 2,
  "totalTasks": 25,
  "tasksByStatus": {
    "todo": 8,
    "inProgress": 10,
    "review": 4,
    "done": 3
  }
}
```

---

### 4. Santé

#### GET /health
Vérifie l'état du serveur.

**Réponse :**
```json
{
  "status": "OK",
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```

---

## Codes de statut HTTP

- `200 OK` : Requête réussie
- `201 Created` : Ressource créée avec succès
- `204 No Content` : Suppression réussie
- `404 Not Found` : Ressource non trouvée
- `500 Internal Server Error` : Erreur serveur

## Types de données

### Status de projet
- `active` : Projet actif
- `completed` : Projet terminé
- `on-hold` : Projet en pause

### Status de tâche
- `todo` : À faire
- `in-progress` : En cours
- `review` : En révision
- `done` : Terminé

### Départements
- `clients` : Département clients
- `logistics` : Département logistique
- `services` : Département services

## Exemples avec curl

### Créer un projet
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nouveau Projet",
    "description": "Description du projet",
    "status": "active"
  }'
```

### Ajouter une tâche
```bash
curl -X POST http://localhost:3001/api/projects/1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma tâche",
    "description": "Description",
    "status": "todo",
    "department": "clients"
  }'
```

### Récupérer les stats
```bash
curl http://localhost:3001/api/stats
```
