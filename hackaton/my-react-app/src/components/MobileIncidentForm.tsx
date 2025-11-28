import React, { useEffect, useState } from 'react'
import '../styles/MobileIncidentForm.css'
import { API_BASE_URL } from '../services/api'

type PosteRecord = {
  id: number
  Poste: number
  name?: string
}

const MobileIncidentForm: React.FC = () => {
  const [postes, setPostes] = useState<PosteRecord[]>([])
  const [selectedPoste, setSelectedPoste] = useState<number | ''>('')
  const [severity, setSeverity] = useState<string>('high')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // load valid Poste options from public data file
    fetch('/data/data.json')
      .then(res => res.json())
      .then((data: PosteRecord[]) => {
        setPostes(data)
        if (data.length) setSelectedPoste(data[0].Poste)
      })
      .catch(() => setPostes([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    if (selectedPoste === '') {
      setStatusMessage('Sélectionnez un poste valide')
      return
    }

    // validate against loaded postes
    const valid = postes.some(p => p.Poste === Number(selectedPoste))
    if (!valid) {
      setStatusMessage('Le poste sélectionné est invalide')
      return
    }

    const newIncident = {
      id: Date.now(),
      Poste: Number(selectedPoste),
      timestamp: Date.now(),
      severity
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident)
      })

      if (res.ok) {
        setStatusMessage('Incident créé avec succès')
        setSeverity('high')
        // keep selected poste
      } else {
        const text = await res.text()
        setStatusMessage('Erreur serveur: ' + (text || res.statusText))
      }
    } catch (err: any) {
      setStatusMessage('Impossible de joindre le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mobile-incident-root">
      <header className="mobile-incident-header">
        <h1>Créer un Incident</h1>
        <p className="hint">Mobile only — utilisez `/incident` sur smartphone</p>
      </header>

      <form className="mobile-incident-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Poste</span>
          <select
            value={selectedPoste}
            onChange={e => setSelectedPoste(e.target.value === '' ? '' : Number(e.target.value))}
          >
            {postes.length === 0 && <option value="">Chargement…</option>}
            {postes.map(p => (
              <option key={p.id} value={p.Poste}>{p.name ?? `Poste ${p.Poste}`}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sévérité</span>
          <select value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </label>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Envoi…' : 'Signaler Incident'}
        </button>

        {statusMessage && <div className="status">{statusMessage}</div>}
      </form>

      <footer className="mobile-incident-footer">
        <small>Timestamp ajouté automatiquement.</small>
      </footer>
    </div>
  )
}

export default MobileIncidentForm
