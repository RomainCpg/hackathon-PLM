import { useState, useEffect } from 'react';
import {
  addPiece,
  updatePiece,
  deletePiece,
  getRecord,
  type Record,
  type Piece,
} from '../services/api';

interface PieceManagerProps {
  record: Record;
  onClose: () => void;
}

const PieceManager = ({ record, onClose }: PieceManagerProps) => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPiece, setEditingPiece] = useState<Piece | null>(null);
  const [formData, setFormData] = useState<Piece>({
    Référence: '',
    Désignation: '',
    Quantité: 0,
    Fournisseur: '',
    Criticité: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPieces();
  }, []);

  const loadPieces = async () => {
    setIsLoading(true);
    try {
      const updatedRecord = await getRecord(record.Poste);
      setPieces((updatedRecord.Pièces as Piece[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Error loading pieces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.Référence) {
      alert('La référence est requise');
      return;
    }

    try {
      await addPiece(record.Poste, formData);
      await loadPieces();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      console.error('Error adding piece:', err);
    }
  };

  const handleUpdate = async () => {
    if (!editingPiece) return;

    try {
      await updatePiece(record.Poste, editingPiece.Référence, formData);
      await loadPieces();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      console.error('Error updating piece:', err);
    }
  };

  const handleDelete = async (ref: string) => {
    if (!confirm(`Supprimer la pièce ${ref} ?`)) return;

    try {
      await deletePiece(record.Poste, ref);
      await loadPieces();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error('Error deleting piece:', err);
    }
  };

  const handleEdit = (piece: Piece) => {
    setEditingPiece(piece);
    setFormData(piece);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      Référence: '',
      Désignation: '',
      Quantité: 0,
      Fournisseur: '',
      Criticité: '',
    });
    setShowForm(false);
    setEditingPiece(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Quantité' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPiece) {
      handleUpdate();
    } else {
      handleAdd();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content piece-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔧 Gestion des Pièces - Poste {record.Poste}</h2>
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="manager-body">
          {/* Liste des pièces */}
          <div className="pieces-list">
            <div className="list-header">
              <h3>Pièces utilisées ({pieces.length})</h3>
              <button onClick={() => setShowForm(true)} className="btn-add">
                ➕ Ajouter
              </button>
            </div>

            {isLoading ? (
              <div className="loading">Chargement...</div>
            ) : pieces.length === 0 ? (
              <div className="empty-state">
                <p>Aucune pièce utilisée</p>
              </div>
            ) : (
              <div className="pieces-grid">
                {pieces.map((piece) => (
                  <div key={piece.Référence} className="piece-card">
                    <div className="piece-info">
                      <h4>{piece.Désignation || piece.Référence}</h4>
                      <p className="reference">Réf: {piece.Référence}</p>
                      {piece.Quantité !== undefined && (
                        <p className="quantity">Quantité: {piece.Quantité}</p>
                      )}
                      {piece.Fournisseur && (
                        <p className="quantity">Fournisseur: {piece.Fournisseur}</p>
                      )}
                      {piece.Criticité && (
                        <span className={`status status-${piece.Criticité.toLowerCase()}`}>
                          {piece.Criticité}
                        </span>
                      )}
                    </div>
                    <div className="piece-actions">
                      <button
                        onClick={() => handleEdit(piece)}
                        className="btn-icon"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(piece.Référence)}
                        className="btn-icon btn-danger"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="form-container">
              <h3>{editingPiece ? 'Modifier' : 'Ajouter'} une pièce</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="Référence">
                    Référence <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="Référence"
                    name="Référence"
                    value={formData.Référence}
                    onChange={handleChange}
                    disabled={!!editingPiece}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Désignation">Désignation</label>
                  <input
                    type="text"
                    id="Désignation"
                    name="Désignation"
                    value={formData.Désignation || ''}
                    onChange={handleChange}
                    placeholder="ex: Stickers_Peinture_Avion"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Quantité">Quantité</label>
                  <input
                    type="number"
                    id="Quantité"
                    name="Quantité"
                    value={formData.Quantité || 0}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Fournisseur">Fournisseur</label>
                  <input
                    type="text"
                    id="Fournisseur"
                    name="Fournisseur"
                    value={formData.Fournisseur || ''}
                    onChange={handleChange}
                    placeholder="ex: 3M Aerospace"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Criticité">Criticité</label>
                  <select
                    id="Criticité"
                    name="Criticité"
                    value={formData.Criticité || ''}
                    onChange={handleChange}
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingPiece ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PieceManager;
