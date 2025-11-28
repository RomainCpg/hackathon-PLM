import React, { useEffect, useState } from 'react';
import type { Incident } from '../services/api';
import { getIncidents, deleteIncident } from '../services/api';
import '../styles/IncidentsManager.css';

const formatDate = (ts: number) => {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return String(ts);
  }
};

const getSeverityClass = (severity: string): string => {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'critique':
      return 'severity-critical';
    case 'high':
    case 'élevée':
      return 'severity-high';
    case 'medium':
    case 'moyen':
    case 'moyenne':
      return 'severity-medium';
    case 'low':
    case 'basse':
    case 'faible':
      return 'severity-low';
    default:
      return 'severity-low';
  }
};

const getSeverityLabel = (severity: string): string => {
  const labels: Record<string, string> = {
    'critical': '🔴 CRITIQUE',
    'critique': '🔴 CRITIQUE',
    'high': '🟠 ÉLEVÉE',
    'élevée': '🟠 ÉLEVÉE',
    'medium': '🟡 MOYEN',
    'moyen': '🟡 MOYEN',
    'moyenne': '🟡 MOYEN',
    'low': '🟢 BASSE',
    'basse': '🟢 BASSE',
    'faible': '🟢 BASSE'
  };
  return labels[severity?.toLowerCase()] || severity;
};

const IncidentsManager: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    const ok = window.confirm('🗑️ Supprimer cet incident ? Cette action est irréversible.');
    if (!ok) return;
    try {
      await deleteIncident(id);
      setIncidents(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      window.alert('Erreur lors de la suppression: ' + (err?.message || String(err)));
    }
  };

  return (
    <div className="incidents-manager">
      <div className="incidents-header">
        <h3>🚨 Incidents en Cours</h3>
        <div className="incidents-controls">
          <button onClick={load} className="refresh-btn">↻ Actualiser</button>
        </div>
      </div>

      <div className="incidents-content">
        {/* QR Code Section */}
        <div className="qr-section">
          <h4>📱 Scanner pour créer un incident</h4>
          <img src="/qr_incident.png" alt="QR Code pour incidents" />
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="incidents-loading">
            <p>⏳ Chargement des incidents...</p>
          </div>
        ) : error ? (
          <div className="incidents-error">
            <p>❌ Erreur: {error}</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="incidents-empty">
            <p>✅ Aucun incident enregistré</p>
          </div>
        ) : (
          <div className="incidents-table-wrapper">
            <table className="incidents-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Poste</th>
                  <th>Date & Heure</th>
                  <th>Sévérité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => (
                  <tr key={inc.id}>
                    <td><strong>#{inc.id}</strong></td>
                    <td className="poste-cell">Poste {inc.Poste}</td>
                    <td className="timestamp-cell">{formatDate(inc.timestamp)}</td>
                    <td>
                      <span className={`severity-badge ${getSeverityClass(inc.severity)}`}>
                        {getSeverityLabel(inc.severity)}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(inc.id)} className="delete-btn">
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentsManager;
