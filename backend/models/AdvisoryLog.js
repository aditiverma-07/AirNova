const mongoose = require('mongoose');

const advisoryLogSchema = new mongoose.Schema({
  aqi: { type: Number, required: true },
  category: { type: String, required: true },
  health_advisory: { type: String },
  risk_groups: { type: [String] },
  precautions: { type: [String] },
  activity: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdvisoryLog', advisoryLogSchema);
