const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

const initDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ history: [] }, null, 2));
  }
};

const getHistory = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data).history;
  } catch (error) {
    console.error('Error reading DB:', error.message);
    return [];
  }
};

const addHistory = (record) => {
  try {
    const history = getHistory();
    // Keep only last 50 queries to avoid large file
    if (history.length >= 50) {
      history.pop();
    }
    history.unshift({
      ...record,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(DB_PATH, JSON.stringify({ history }, null, 2));
  } catch (error) {
    console.error('Error writing DB:', error.message);
  }
};

module.exports = {
  initDB,
  getHistory,
  addHistory
};
