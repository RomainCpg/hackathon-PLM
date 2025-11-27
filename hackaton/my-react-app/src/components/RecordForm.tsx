import { useState, useEffect } from 'react';
import type { Record } from '../services/api';

interface RecordFormProps {
  record: Record | null;
  onSubmit: (record: Record) => void;
  onClose: () => void;
}

const RecordForm = ({ record, onSubmit, onClose }: RecordFormProps) => {
  const [formData, setFormData] = useState<Record>({
    Poste: 0,
    Nom: '',
    'Nombre pièces': 0,
    Référence: '',
    'Temps Prévu': '',
    'Temps Réel': '',
    'Heure Début': '',
    'Heure Fin': '',
    Date: 0,
    'Aléas Industriels': '',
    'Cause Potentielle': '',
  });

  useEffect(() => {
    if (record) {
      setFormData(record);
    }
  }, [record]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'Poste' || name === 'Nombre pièces' || name === 'Date'
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Poste) {
      alert('Le numéro de poste est requis');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content record-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{record ? '✏️ Modifier le record' : '➕ Nouveau record'}</h2>
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="Poste">
                Poste <span className="required">*</span>
              </label>
              <input
                type="number"
                id="Poste"
                name="Poste"
                value={formData.Poste}
                onChange={handleChange}
                disabled={!!record}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Nom">Nom</label>
              <input
                type="text"
                id="Nom"
                name="Nom"
                value={formData.Nom || ''}
                onChange={handleChange}
                placeholder="ex: Stickers réacteur"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Nombre pièces">Nombre de pièces</label>
              <input
                type="number"
                id="Nombre pièces"
                name="Nombre pièces"
                value={formData['Nombre pièces'] || 0}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Référence">Référence</label>
              <input
                type="text"
                id="Référence"
                name="Référence"
                value={formData.Référence || ''}
                onChange={handleChange}
                placeholder="ex: C995"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Temps Prévu">Temps prévu</label>
              <input
                type="text"
                id="Temps Prévu"
                name="Temps Prévu"
                value={formData['Temps Prévu'] || ''}
                onChange={handleChange}
                placeholder="ex: 00:05:00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Temps Réel">Temps réel</label>
              <input
                type="text"
                id="Temps Réel"
                name="Temps Réel"
                value={formData['Temps Réel'] || ''}
                onChange={handleChange}
                placeholder="ex: 00:07:30"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Heure Début">Heure début</label>
              <input
                type="text"
                id="Heure Début"
                name="Heure Début"
                value={formData['Heure Début'] || ''}
                onChange={handleChange}
                placeholder="ex: 08:51:30"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Heure Fin">Heure fin</label>
              <input
                type="text"
                id="Heure Fin"
                name="Heure Fin"
                value={formData['Heure Fin'] || ''}
                onChange={handleChange}
                placeholder="ex: 08:59:00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Date">Date (timestamp)</label>
              <input
                type="number"
                id="Date"
                name="Date"
                value={formData.Date || 0}
                onChange={handleChange}
                placeholder="ex: 1693785600000"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="Aléas Industriels">Aléas industriels</label>
              <textarea
                id="Aléas Industriels"
                name="Aléas Industriels"
                value={formData['Aléas Industriels'] || ''}
                onChange={handleChange}
                rows={3}
                placeholder="ex: Défaut positionnement étiquettes"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="Cause Potentielle">Cause potentielle</label>
              <textarea
                id="Cause Potentielle"
                name="Cause Potentielle"
                value={formData['Cause Potentielle'] || ''}
                onChange={handleChange}
                rows={3}
                placeholder="ex: Systèmes automatisation"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {record ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordForm;
