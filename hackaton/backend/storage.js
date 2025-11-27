const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data', 'data.json');

async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch (err) {
    const dir = path.dirname(DATA_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_PATH, '[]', 'utf8');
  }
}

// Simple in-memory mutex to avoid concurrent writes in this single-process server
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

async function readData() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeData(data) {
  return _withWriteLock(async () => {
    await ensureDataFile();
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  });
}

module.exports = { readData, writeData, DATA_PATH };
