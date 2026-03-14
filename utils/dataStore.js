const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJson(file, fallback = []) {
  const target = path.join(DATA_DIR, file);
  if (!fs.existsSync(target)) return fallback;
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

function writeJson(file, data) {
  const target = path.join(DATA_DIR, file);
  fs.writeFileSync(target, JSON.stringify(data, null, 2));
}

function nextId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;
}

module.exports = { readJson, writeJson, nextId };
