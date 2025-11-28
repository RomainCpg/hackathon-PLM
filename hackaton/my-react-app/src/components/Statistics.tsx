import { useMemo, useState, useEffect } from 'react';
import type { Task } from '../types';
import { getAllRecords, type Record } from '../services/api';
import '../styles/Statistics.css';

interface StatisticsProps {
  tasks: Task[];
}

interface TaskLateness {
  taskId: string;
  taskTitle: string;
  lateness: number;
  prevu: number;
  reel: number;
}

interface CauseLateness {
  cause: string;
  totalLateness: number;
  occurrences: number;
  averageLateness: number;
}

interface AleasLateness {
  aleas: string;
  totalLateness: number;
  occurrences: number;
  averageLateness: number;
}

// Convert API Record to Task
const convertRecordToTask = (record: Record): Task => {
  return {
    id: `task-${record.Poste}`,
    title: `Poste ${record.Poste}: ${record.Nom || 'Sans nom'}`,
    description: record['Aléas Industriels'] || record['Cause Potentielle'] || '',
    createdAt: new Date().toISOString(),
    order: record.Poste,
    poste: record.Poste,
    nombrePieces: record['Nombre pièces'],
    'tempsPrévu': record['Temps Prévu'],
    'tempsRéel': record['Temps Réel'],
    'aléasIndustriels': record['Aléas Industriels'],
    causePotentielle: record['Cause Potentielle'],
    heureDebut: record['Heure Début'],
    heureFin: record['Heure Fin'],
    horaireDepart: record['Heure Début'],
    horaireFin: record['Heure Fin'],
    dateDebut: record.Date,
    personnes: record.Personnes,
    'pièces': record.Pièces,
    dependencies: record.previousIds || [],
  };
};

function Statistics({ tasks }: StatisticsProps) {
  // State for API data
  const [apiTasks, setApiTasks] = useState<Task[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoadingApi(true);
        setApiError(null);
        const records = await getAllRecords();
        const convertedTasks = records.map(convertRecordToTask);
        setApiTasks(convertedTasks);
      } catch (error) {
        console.error('Error fetching records:', error);
        setApiError('Erreur lors du chargement des données');
      } finally {
        setIsLoadingApi(false);
      }
    };

    fetchRecords();
  }, []);

  // Use API tasks instead of props tasks
  const allTasks = apiTasks.length > 0 ? apiTasks : tasks;

  const statistics = useMemo(() => {
    let totalLateness = 0;
    const taskLatenessMap = new Map<string, TaskLateness>();
    const causeLatenessMap = new Map<string, { total: number; count: number }>();
    const aleasLatenessMap = new Map<string, { total: number; count: number }>();

    allTasks.forEach(task => {
      const tempsPrevuStr = task['tempsPrévu'];
      const tempsReelStr = task['tempsRéel'];

      if (tempsPrevuStr && tempsReelStr) {
        // Parse time strings (format: "HH:MM:SS" or "HH:MM")
        const parseTime = (timeStr: string): number => {
          const parts = timeStr.split(':').map(Number);
          if (parts.length === 3) {
            return parts[0] * 60 + parts[1] + parts[2] / 60;
          } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
          }
          return 0;
        };

        const prevuMinutes = parseTime(tempsPrevuStr);
        const reelMinutes = parseTime(tempsReelStr);
        const lateness = reelMinutes - prevuMinutes;

        if (lateness > 0) {
          totalLateness += lateness;

          // Track task lateness
          taskLatenessMap.set(task.id, {
            taskId: task.id,
            taskTitle: task.title,
            lateness,
            prevu: prevuMinutes,
            reel: reelMinutes
          });

          // Track cause lateness
          if (task.causePotentielle) {
            const existing = causeLatenessMap.get(task.causePotentielle) || { total: 0, count: 0 };
            causeLatenessMap.set(task.causePotentielle, {
              total: existing.total + lateness,
              count: existing.count + 1
            });
          }

          // Track aléas lateness
          if (task['aléasIndustriels']) {
            const existing = aleasLatenessMap.get(task['aléasIndustriels']) || { total: 0, count: 0 };
            aleasLatenessMap.set(task['aléasIndustriels'], {
              total: existing.total + lateness,
              count: existing.count + 1
            });
          }
        }
      }
    });

    // Convert to sorted arrays
    const taskLateness = Array.from(taskLatenessMap.values())
      .sort((a, b) => b.lateness - a.lateness);

    const causeLateness: CauseLateness[] = Array.from(causeLatenessMap.entries())
      .map(([cause, data]) => ({
        cause,
        totalLateness: data.total,
        occurrences: data.count,
        averageLateness: data.total / data.count
      }))
      .sort((a, b) => b.totalLateness - a.totalLateness);

    const aleasLateness: AleasLateness[] = Array.from(aleasLatenessMap.entries())
      .map(([aleas, data]) => ({
        aleas,
        totalLateness: data.total,
        occurrences: data.count,
        averageLateness: data.total / data.count
      }))
      .sort((a, b) => b.totalLateness - a.totalLateness);

    return {
      totalLateness,
      taskLateness,
      causeLateness,
      aleasLateness,
      totalTasksWithLateness: taskLateness.length,
      totalTasks: allTasks.length
    };
  }, [allTasks]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  // Show loading state
  if (isLoadingApi) {
    return (
      <div className="statistics-container">
        <div className="loading-state">
          <p>⏳ Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Show API error if any
  if (apiError) {
    return (
      <div className="statistics-container">
        <div className="error-message">
          ⚠️ {apiError}
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <h2 className="statistics-title">📊 Statistiques de Retard</h2>

      {/* Summary Cards */}
      <div className="stats-summary">
        <div className="stat-card total">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Retard Total Cumulé</div>
            <div className="stat-value">{formatTime(statistics.totalLateness)}</div>
          </div>
        </div>
        <div className="stat-card tasks">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">Tâches en Retard</div>
            <div className="stat-value">
              {statistics.totalTasksWithLateness} / {statistics.totalTasks}
            </div>
            <div className="stat-subtitle">
              {statistics.totalTasks > 0 
                ? `${Math.round((statistics.totalTasksWithLateness / statistics.totalTasks) * 100)}%`
                : '0%'}
            </div>
          </div>
        </div>
        <div className="stat-card average">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Retard Moyen</div>
            <div className="stat-value">
              {statistics.totalTasksWithLateness > 0
                ? formatTime(statistics.totalLateness / statistics.totalTasksWithLateness)
                : '0h 0min'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Tasks with Most Lateness */}
      <div className="stats-section">
        <h3 className="section-title">🎯 Tâches avec le Plus de Retard</h3>
        {statistics.taskLateness.length > 0 ? (
          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Tâche</th>
                  <th>Temps Prévu</th>
                  <th>Temps Réel</th>
                  <th>Retard</th>
                </tr>
              </thead>
              <tbody>
                {statistics.taskLateness.slice(0, 10).map((task, index) => (
                  <tr key={task.taskId}>
                    <td className="rank-cell">
                      <span className={`rank-badge ${index < 3 ? 'top-three' : ''}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="task-cell">{task.taskTitle}</td>
                    <td>{formatTime(task.prevu)}</td>
                    <td>{formatTime(task.reel)}</td>
                    <td className="lateness-cell">
                      <span className="lateness-badge">{formatTime(task.lateness)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">Aucune tâche en retard</div>
        )}
      </div>

      {/* Top Causes */}
      <div className="stats-section">
        <h3 className="section-title">⚠️ Causes Principales de Retard</h3>
        {statistics.causeLateness.length > 0 ? (
          <div className="stats-grid">
            {statistics.causeLateness.map((cause, index) => (
              <div key={cause.cause} className="cause-card">
                <div className="cause-header">
                  <span className="cause-rank">#{index + 1}</span>
                  <span className="cause-occurrences">{cause.occurrences} occurrence{cause.occurrences > 1 ? 's' : ''}</span>
                </div>
                <div className="cause-name">{cause.cause}</div>
                <div className="cause-stats">
                  <div className="cause-stat">
                    <span className="cause-stat-label">Total:</span>
                    <span className="cause-stat-value">{formatTime(cause.totalLateness)}</span>
                  </div>
                  <div className="cause-stat">
                    <span className="cause-stat-label">Moyenne:</span>
                    <span className="cause-stat-value">{formatTime(cause.averageLateness)}</span>
                  </div>
                </div>
                <div className="cause-bar">
                  <div 
                    className="cause-bar-fill" 
                    style={{ 
                      width: `${(cause.totalLateness / statistics.causeLateness[0].totalLateness) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Aucune cause enregistrée</div>
        )}
      </div>

      {/* Top Aléas */}
      <div className="stats-section">
        <h3 className="section-title">🔧 Aléas Industriels Causant le Plus de Retard</h3>
        {statistics.aleasLateness.length > 0 ? (
          <div className="stats-grid">
            {statistics.aleasLateness.map((aleas, index) => (
              <div key={aleas.aleas} className="aleas-card">
                <div className="aleas-header">
                  <span className="aleas-rank">#{index + 1}</span>
                  <span className="aleas-occurrences">{aleas.occurrences} occurrence{aleas.occurrences > 1 ? 's' : ''}</span>
                </div>
                <div className="aleas-name">{aleas.aleas}</div>
                <div className="aleas-stats">
                  <div className="aleas-stat">
                    <span className="aleas-stat-label">Total:</span>
                    <span className="aleas-stat-value">{formatTime(aleas.totalLateness)}</span>
                  </div>
                  <div className="aleas-stat">
                    <span className="aleas-stat-label">Moyenne:</span>
                    <span className="aleas-stat-value">{formatTime(aleas.averageLateness)}</span>
                  </div>
                </div>
                <div className="aleas-bar">
                  <div 
                    className="aleas-bar-fill" 
                    style={{ 
                      width: `${(aleas.totalLateness / statistics.aleasLateness[0].totalLateness) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Aucun aléas enregistré</div>
        )}
      </div>
    </div>
  );
}

export default Statistics;
