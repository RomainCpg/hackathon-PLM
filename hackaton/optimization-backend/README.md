# optimization-backend

Python Flask backend for Gantt chart optimization using OR-Tools.

Quick start (PowerShell on Windows):

```powershell
cd .\hackaton\optimization-backend
pip install -r requirements.txt
python app.py
```

Endpoints (base `http://localhost:5000`):

- `GET /` — health check, returns "Optimization Backend is running"
- `POST /get_optimal_gantt` — calculate optimal schedule (body: array of task objects)

## Optimization Endpoint Details

### `POST /get_optimal_gantt`

**Request body:** Array of task objects with timing and dependency information

**Response (200):** Same array with added `"Heure de début optimale"` field for each task

**Response (500):** `{"error": "Could not find an optimal schedule"}`

The optimization algorithm:
- Respects task dependencies
- Minimizes total completion time
- Uses `tempsRéel` for duration calculations
- Returns optimal start times in `"HH:MM:SS"` format

## Technical Stack

- **Flask** — web framework
- **Flask-CORS** — enables CORS for frontend communication
- **OR-Tools** — Google's optimization library for constraint programming

The optimization logic is in `rl_model.py`.