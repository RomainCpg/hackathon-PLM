# hackaton-backend

Simple file-based Express backend to store the JSON structure used in the hackathon.

Quick start (PowerShell on Windows):

```powershell
cd c:\Users\romai\Documents\ESILV\hackathonPLM\appli\hackathon-PLM\hackaton\backend
npm install
npm start
```

Endpoints (base `http://localhost:3000`):

- `GET /records` — list all records
- `GET /records/:poste` — get one record (records use `Poste` as primary id)
- `POST /records` — create record (body: record object)
- `PUT /records/:poste` — update record
- `DELETE /records/:poste` — delete record

- `POST /records/:poste/personnes` — add personne (body must include `Matricule`)
- `PUT /records/:poste/personnes/:matricule` — update personne
- `DELETE /records/:poste/personnes/:matricule` — delete personne

- `POST /records/:poste/pieces` — add pièce (body must include `Référence`)
- `PUT /records/:poste/pieces/:ref` — update pièce
- `DELETE /records/:poste/pieces/:ref` — delete pièce

The server stores data in `data/data.json`.

Incidents storage
- `GET /incidents` — list all incidents
- `GET /incidents/:id` — get one incident
- `POST /incidents` — create incident (body must include `Poste` linking to an existing record)
- `PUT /incidents/:id` — update incident
- `DELETE /incidents/:id` — delete incident

Incidents are stored in `data/incidents.json` and each incident must reference a valid `Poste` value from the main `data/data.json` file.
