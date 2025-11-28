const fs = require('fs').promises;
const path = require('path');

const INCIDENTS_PATH = path.join(__dirname, 'data', 'incidents.json');

async function ensureIncidentsFile() {
  try {
    await fs.access(INCIDENTS_PATH);
  } catch (err) {
    const dir = path.dirname(INCIDENTS_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(INCIDENTS_PATH, '[]', 'utf8');
  }
}

let writeInProgress = false;
const pendingWrites = [];

async function _withWriteLock(fn) {
  if (writeInProgress) {
    return new Promise((resolve, reject) => {
      pendingWrites.push({ resolve, reject, fn });
    });
  }
  writeInProgress = true;
  try {
    const res = await fn();
    writeInProgress = false;
    if (pendingWrites.length) {
      const next = pendingWrites.shift();
      _withWriteLock(next.fn).then(next.resolve, next.reject);
    }
    return res;
  } catch (err) {
    writeInProgress = false;
    if (pendingWrites.length) {
      const next = pendingWrites.shift();
      _withWriteLock(next.fn).then(next.resolve, next.reject);
    }
    throw err;
  }
}

async function readIncidents() {
  await ensureIncidentsFile();
  const raw = await fs.readFile(INCIDENTS_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeIncidents(data) {
  return _withWriteLock(async () => {
    await ensureIncidentsFile();
    await fs.writeFile(INCIDENTS_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  });
}

module.exports = { readIncidents, writeIncidents, INCIDENTS_PATH };
