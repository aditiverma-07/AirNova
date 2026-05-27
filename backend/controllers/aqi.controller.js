const { fetchAQI } = require('../services/aqiService');
const { generateAdvisory } = require('../services/ragService');
const NodeCache = require('node-cache');
const { getHistory, addHistory } = require('../services/dbService');

const myCache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

const getAqiForCity = async (req, res, next) => {
  try {
    const city = req.params.city || req.query.city;
    if (!city || city.trim() === '') {
      return res.status(400).json({ error: 'Enter valid Indian city' });
    }

    const cleanCity = city.trim();
    const cacheKey = cleanCity.toLowerCase();
    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
      addHistory({ city: cachedData.city, aqi: cachedData.aqi, category: cachedData.category });
      return res.json(cachedData);
    }

    // 1. Fetch real-time AQI and Pollutant data based on city
    let aqiData;
    try {
      aqiData = await fetchAQI(cleanCity);
    } catch (apiError) {
      console.error(`[Controller Error] Fetch failed for ${cleanCity}:`, apiError.message);
      const statusCode = apiError.status || 502;
      return res.status(statusCode).json({ error: apiError.message });
    }

    if (!aqiData) {
      return res.status(502).json({ error: 'Unable to fetch live AQI currently' });
    }

    // 2. Pass the AQI data to the RAG module to generate an AI advisory
    let aiAdvisory;
    try {
      aiAdvisory = await generateAdvisory(aqiData.aqi, aqiData.category);
    } catch (aiError) {
      console.error('Failed to generate AI advisory:', aiError);
      aiAdvisory = {
        health_advisory: 'Advisory generation temporarily unavailable.',
        risk_groups: ['All'],
        precautions: ['Follow local guidelines.'],
        activity_suggestion: 'Exercise caution.'
      };
    }

    // 3. Combine response payload
    const responsePayload = {
      city: aqiData.city,
      state: 'India',
      aqi: aqiData.aqi,
      category: aqiData.category,
      pollutants: aqiData.pollutants,
      timestamp: aqiData.timestamp,
      health_advisory: aiAdvisory.health_advisory,
      risk_groups: aiAdvisory.risk_groups,
      precautions: aiAdvisory.precautions,
      activity_suggestion: aiAdvisory.activity_suggestion || aiAdvisory.activity
    };

    // Store in cache
    myCache.set(cacheKey, responsePayload);

    // Save to history db
    addHistory({ city: responsePayload.city, aqi: responsePayload.aqi, category: responsePayload.category });

    res.json(responsePayload);
    
  } catch (error) {
    console.error('[Fatal Controller Error]:', error.message);
    res.status(502).json({ error: error.message || 'Unable to fetch live AQI currently' });
  }
};

const getHistoryData = (req, res, next) => {
  try {
    const history = getHistory();
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAqiForCity,
  getHistoryData
};
