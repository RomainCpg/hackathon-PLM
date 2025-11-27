const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { readData, writeData } = require('./storage');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

function now() {
  return Date.now();
}

// GET all records
app.get('/records', async (req, res) => {
  const data = await readData();
  res.json(data);
});

// GET one record by Poste (falls back to id if present)
app.get('/records/:poste', async (req, res) => {
  const poste = Number(req.params.poste);
  const data = await readData();
  const rec = data.find(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (!rec) return res.status(404).json({ error: 'Not found' });
  res.json(rec);
});

// Create a new record — assign next `Poste` if not provided
app.post('/records', async (req, res) => {
  const data = await readData();
  const nextPoste = data.reduce((m, r) => Math.max(m, Number(r.Poste) || 0), 0) + 1;
  const providedPoste = req.body.Poste ? Number(req.body.Poste) : null;
  const rec = Object.assign({}, req.body, { Poste: providedPoste || nextPoste, createdAt: now() });
  if (!Array.isArray(rec.Personnes)) rec.Personnes = [];
  if (!Array.isArray(rec.Pièces)) rec.Pièces = [];
  data.push(rec);
  await writeData(data);
  res.status(201).json(rec);
});

// Update record by Poste
app.put('/records/:poste', async (req, res) => {
  const poste = Number(req.params.poste);
  const data = await readData();
  const idx = data.findIndex(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const base = data[idx];
  const updated = Object.assign({}, base, req.body, { Poste: base.Poste });
  data[idx] = updated;
  await writeData(data);
  res.json(updated);
});

// Delete record by Poste
app.delete('/records/:poste', async (req, res) => {
  const poste = Number(req.params.poste);
  let data = await readData();
  const idx = data.findIndex(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.splice(idx, 1);
  await writeData(data);
  res.status(204).send();
});

// Add a personne
app.post('/records/:poste/personnes', async (req, res) => {
  const poste = Number(req.params.poste);
  const data = await readData();
  const rec = data.find(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (!rec) return res.status(404).json({ error: 'Record not found' });
  if (!rec.Personnes) rec.Personnes = [];
  const personne = req.body;
  // require Matricule
  if (!personne.Matricule) return res.status(400).json({ error: 'Matricule required' });
  const exists = rec.Personnes.find(p => p.Matricule === personne.Matricule);
  if (exists) return res.status(409).json({ error: 'Matricule already exists' });
  rec.Personnes.push(personne);
  await writeData(data);
  res.status(201).json(personne);
});

// Update a personne by Matricule
app.put('/records/:poste/personnes/:matricule', async (req, res) => {
  const poste = Number(req.params.poste);
  const matricule = req.params.matricule;
  const data = await readData();
  const rec = data.find(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (!rec) return res.status(404).json({ error: 'Record not found' });
  const idx = (rec.Personnes || []).findIndex(p => p.Matricule === matricule);
  if (idx === -1) return res.status(404).json({ error: 'Personne not found' });
  rec.Personnes[idx] = Object.assign({}, rec.Personnes[idx], req.body, { Matricule: matricule });
  await writeData(data);
  res.json(rec.Personnes[idx]);
});

// Delete a personne
app.delete('/records/:poste/personnes/:matricule', async (req, res) => {
  const poste = Number(req.params.poste);
  const matricule = req.params.matricule;
  const data = await readData();
  const rec = data.find(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (!rec) return res.status(404).json({ error: 'Record not found' });
  const idx = (rec.Personnes || []).findIndex(p => p.Matricule === matricule);
  if (idx === -1) return res.status(404).json({ error: 'Personne not found' });
  rec.Personnes.splice(idx, 1);
  await writeData(data);
  res.status(204).send();
});

// Add a pièce
app.post('/records/:poste/pieces', async (req, res) => {
  const poste = Number(req.params.poste);
  const data = await readData();
  const rec = data.find(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (!rec) return res.status(404).json({ error: 'Record not found' });
  if (!rec.Pièces) rec.Pièces = [];
  const piece = req.body;
  if (!piece.Référence) return res.status(400).json({ error: 'Référence required' });
  const exists = rec.Pièces.find(p => p.Référence === piece.Référence);
  if (exists) return res.status(409).json({ error: 'Référence already exists' });
  rec.Pièces.push(piece);
  await writeData(data);
  res.status(201).json(piece);
});

// Update a pièce by Référence
app.put('/records/:poste/pieces/:ref', async (req, res) => {
  const poste = Number(req.params.poste);
  const ref = req.params.ref;
  const data = await readData();
  const rec = data.find(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (!rec) return res.status(404).json({ error: 'Record not found' });
  const idx = (rec.Pièces || []).findIndex(p => p.Référence === ref);
  if (idx === -1) return res.status(404).json({ error: 'Pièce not found' });
  rec.Pièces[idx] = Object.assign({}, rec.Pièces[idx], req.body, { Référence: ref });
  await writeData(data);
  res.json(rec.Pièces[idx]);
});

// Delete a pièce
app.delete('/records/:poste/pieces/:ref', async (req, res) => {
  const poste = Number(req.params.poste);
  const ref = req.params.ref;
  const data = await readData();
  const rec = data.find(r => (Number(r.Poste) === poste) || (Number(r.id) === poste));
  if (!rec) return res.status(404).json({ error: 'Record not found' });
  const idx = (rec.Pièces || []).findIndex(p => p.Référence === ref);
  if (idx === -1) return res.status(404).json({ error: 'Pièce not found' });
  rec.Pièces.splice(idx, 1);
  await writeData(data);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
