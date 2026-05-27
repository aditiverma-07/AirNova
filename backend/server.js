require('dotenv').config();

console.log(
  process.env.OPENWEATHER_API_KEY
    ? "API KEY LOADED"
    : "API KEY MISSING"
);

if (!process.env.OPENWEATHER_API_KEY) {
  throw new Error("OPENWEATHER_API_KEY missing");
}
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const aqiRoutes = require('./routes/aqi.routes');
const { initDB } = require('./services/dbService');

const app = express();

// Initialize JSON Database
initDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/aqi', aqiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
