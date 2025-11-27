import { useState, useEffect } from 'react';
import {
  getAllRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  type Record,
} from '../services/api';
import RecordForm from './RecordForm';
import PersonneManager from './PersonneManager';
import PieceManager from './PieceManager';
import '../styles/RecordManager.css';

const RecordManager = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [showPersonnes, setShowPersonnes] = useState(false);
  const [showPieces, setShowPieces] = useState(false);

  // Charger tous les records au démarrage
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllRecords();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Error loading records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecord = async (poste: number) => {
    try {
      const record = await getRecord(poste);
      setSelectedRecord(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sélection');
      console.error('Error selecting record:', err);
    }
  };

  const handleCreateRecord = async (record: Record) => {
    try {
      await createRecord(record);
      await loadRecords();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      console.error('Error creating record:', err);
    }
  };

  const handleUpdateRecord = async (record: Record) => {
    try {
      await updateRecord(record.Poste, record);
      await loadRecords();
      if (selectedRecord?.Poste === record.Poste) {
        setSelectedRecord(record);
      }
      setShowForm(false);
      setEditingRecord(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      console.error('Error updating record:', err);
    }
  };

  const handleDeleteRecord = async (poste: number) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le record ${poste} ?`)) {
      return;
    }

    try {
      await deleteRecord(poste);
      await loadRecords();
      if (selectedRecord?.Poste === poste) {
        setSelectedRecord(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error('Error deleting record:', err);
    }
  };

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleManagePersonnes = (record: Record) => {
    setSelectedRecord(record);
    setShowPersonnes(true);
  };

  const handleManagePieces = (record: Record) => {
    setSelectedRecord(record);
    setShowPieces(true);
  };

  return (
    <div className="record-manager">
      <div className="manager-header">
        <h1>📦 Gestion des Records</h1>
        <div className="header-actions">
          <button onClick={loadRecords} className="btn-refresh" disabled={isLoading}>
            🔄 Actualiser
          </button>
          <button onClick={() => setShowForm(true)} className="btn-create">
            ➕ Nouveau Record
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="manager-content">
        {/* Liste des records */}
        <div className="records-list">
          <h2>Records ({records.length})</h2>
          {isLoading ? (
            <div className="loading">Chargement...</div>
          ) : records.length === 0 ? (
            <div className="empty-state">
              <p>Aucun record disponible</p>
              <button onClick={() => setShowForm(true)}>Créer le premier</button>
            </div>
          ) : (
            <div className="record-cards">
              {records.map((record) => (
                <div
                  key={record.Poste}
                  className={`record-card ${selectedRecord?.Poste === record.Poste ? 'selected' : ''}`}
                  onClick={() => handleSelectRecord(record.Poste)}
                >
                  <div className="record-card-header">
                    <h3>Poste {record.Poste}</h3>
                    <div className="record-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(record);
                        }}
                        className="btn-icon"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecord(record.Poste);
                        }}
                        className="btn-icon btn-danger"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="record-card-body">
                    {record.Nom && <p>📝 {record.Nom}</p>}
                    {record['Nombre pièces'] && (
                      <p>📊 Pièces: {record['Nombre pièces']}</p>
                    )}
                    {record['Temps Prévu'] && (
                      <p>⏱️ Temps prévu: {record['Temps Prévu']}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détails du record sélectionné */}
        {selectedRecord && (
          <div className="record-details">
            <div className="details-header">
              <h2>Poste {selectedRecord.Poste}</h2>
              <button onClick={() => setSelectedRecord(null)} className="btn-close">
                ✕
              </button>
            </div>
            <div className="details-content">
              <div className="detail-section">
                <h3>Informations</h3>
                {Object.entries(selectedRecord).map(([key, value]) => {
                  if (key === 'Personnes' || key === 'Pièces') return null;
                  return (
                    <div key={key} className="detail-row">
                      <strong>{key}:</strong>
                      <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="detail-actions">
                <button
                  onClick={() => handleManagePersonnes(selectedRecord)}
                  className="btn-manage"
                >
                  👥 Gérer les Personnes
                </button>
                <button
                  onClick={() => handleManagePieces(selectedRecord)}
                  className="btn-manage"
                >
                  🔧 Gérer les Pièces
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <RecordForm
          record={editingRecord}
          onSubmit={editingRecord ? handleUpdateRecord : handleCreateRecord}
          onClose={handleCloseForm}
        />
      )}

      {showPersonnes && selectedRecord && (
        <PersonneManager
          record={selectedRecord}
          onClose={() => {
            setShowPersonnes(false);
            handleSelectRecord(selectedRecord.Poste);
          }}
        />
      )}

      {showPieces && selectedRecord && (
        <PieceManager
          record={selectedRecord}
          onClose={() => {
            setShowPieces(false);
            handleSelectRecord(selectedRecord.Poste);
          }}
        />
      )}
    </div>
  );
};

export default RecordManager;
