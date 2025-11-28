import { useState, useEffect } from 'react';
import {
  addPersonne,
  updatePersonne,
  deletePersonne,
  getRecord,
  type Record,
  type Personne,
} from '../services/api';

interface PersonneManagerProps {
  record: Record;
  onClose: () => void;
}

const PersonneManager = ({ record, onClose }: PersonneManagerProps) => {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPersonne, setEditingPersonne] = useState<Personne | null>(null);
  const [formData, setFormData] = useState<Personne>({
    Matricule: '',
    Nom: '',
    Prénom: '',
    Qualification: '',
    Âge: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersonnes();
  }, []);

  const loadPersonnes = async () => {
    setIsLoading(true);
    try {
      const updatedRecord = await getRecord(record.Poste);
      setPersonnes((updatedRecord.Personnes as Personne[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Error loading personnes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.Matricule) {
      alert('Le matricule est requis');
      return;
    }

    try {
      await addPersonne(record.Poste, formData);
      await loadPersonnes();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      console.error('Error adding personne:', err);
    }
  };

  const handleUpdate = async () => {
    if (!editingPersonne) return;

    try {
      await updatePersonne(record.Poste, editingPersonne.Matricule, formData);
      await loadPersonnes();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      console.error('Error updating personne:', err);
    }
  };

  const handleDelete = async (matricule: string) => {
    if (!confirm(`Supprimer la personne ${matricule} ?`)) return;

    try {
      await deletePersonne(record.Poste, matricule);
      await loadPersonnes();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      console.error('Error deleting personne:', err);
    }
  };

  const handleEdit = (personne: Personne) => {
    setEditingPersonne(personne);
    setFormData(personne);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      Matricule: '',
      Nom: '',
      Prénom: '',
      Qualification: '',
      Âge: 0,
    });
    setShowForm(false);
    setEditingPersonne(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Âge' || name === 'Semaine' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPersonne) {
      handleUpdate();
    } else {
      handleAdd();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content personne-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Gestion des Personnes - Poste {record.Poste}</h2>
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
          {/* Liste des personnes */}
          <div className="personnes-list">
            <div className="list-header">
              <h3>Personnes assignées ({personnes.length})</h3>
              <button onClick={() => setShowForm(true)} className="btn-add">
                ➕ Ajouter
              </button>
            </div>

            {isLoading ? (
              <div className="loading">Chargement...</div>
            ) : personnes.length === 0 ? (
              <div className="empty-state">
                <p>Aucune personne assignée</p>
              </div>
            ) : (
              <div className="personnes-grid">
                {personnes.map((personne) => (
                  <div key={personne.Matricule} className="personne-card">
                    <div className="personne-info">
                      <h4>{personne.Prénom} {personne.Nom}</h4>
                      <p className="matricule">#{personne.Matricule}</p>
                      {personne.Qualification && <p className="fonction">{personne.Qualification}</p>}
                      {personne.Âge && <p className="fonction">Âge: {personne.Âge} ans</p>}
                    </div>
                    <div className="personne-actions">
                      <button
                        onClick={() => handleEdit(personne)}
                        className="btn-icon"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(personne.Matricule)}
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
              <h3>{editingPersonne ? 'Modifier' : 'Ajouter'} une personne</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="Matricule">
                    Matricule <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="Matricule"
                    name="Matricule"
                    value={formData.Matricule}
                    onChange={handleChange}
                    disabled={!!editingPersonne}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Nom">Nom</label>
                  <input
                    type="text"
                    id="Nom"
                    name="Nom"
                    value={formData.Nom}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Prénom">Prénom</label>
                  <input
                    type="text"
                    id="Prénom"
                    name="Prénom"
                    value={formData.Prénom}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Qualification">Qualification</label>
                  <input
                    type="text"
                    id="Qualification"
                    name="Qualification"
                    value={formData.Qualification || ''}
                    onChange={handleChange}
                    placeholder="ex: Opérateur Senior"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Âge">Âge</label>
                  <input
                    type="number"
                    id="Âge"
                    name="Âge"
                    value={formData.Âge || 0}
                    onChange={handleChange}
                    min="18"
                    max="70"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingPersonne ? 'Mettre à jour' : 'Ajouter'}
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

export default PersonneManager;
