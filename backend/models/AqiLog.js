const mongoose = require('mongoose');

const aqiLogSchema = new mongoose.Schema({
  city: { type: String, required: true },
  state: { type: String },
  aqi: { type: Number, required: true },
  category: { type: String, required: true },
  pollutants: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AqiLog', aqiLogSchema);
