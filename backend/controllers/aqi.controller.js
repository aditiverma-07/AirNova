const { fetchAQI } = require('../services/aqiService');
const { generateAdvisory } = require('../services/ragService');
const NodeCache = require('node-cache');
const { getHistory, addHistory } = require('../services/dbService');

const myCache = new NodeCache({ stdTTL: 900 }); // 15 mins cache

const getAqiForCity = async (req, res, next) => {
  try {
    const city = req.query.city;
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required.' });
    }

    const cacheKey = city.toLowerCase();
    const cachedData = myCache.get(cacheKey);
    if (cachedData) {
      // Background async update to db history, but return cache immediately
      addHistory({ city: cachedData.city, aqi: cachedData.aqi, category: cachedData.category });
      return res.json(cachedData);
    }

    // 1. Fetch real-time AQI and Pollutant data based on city
    const aqiData = await fetchAQI(city);
    
    if (!aqiData) {
        return res.status(404).json({ error: 'City not found or data unavailable.', city });
    }

    // 2. Pass the AQI data to the RAG module to generate an AI advisory
    let aiAdvisory;
    try {
        aiAdvisory = await generateAdvisory(aqiData.aqi, aqiData.category);
    } catch (aiError) {
        console.error('Failed to generate AI advisory:', aiError);
        // Fallback or generic advisory in case the AI API fails
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
      state: aqiData.state || '', // WAQI might not neatly provide state; provide empty string or derived value
      aqi: aqiData.aqi,
      category: aqiData.category,
      pollutants: aqiData.pollutants,
      health_advisory: aiAdvisory.health_advisory,
      risk_groups: aiAdvisory.risk_groups,
      precautions: aiAdvisory.precautions,
      activity_suggestion: aiAdvisory.activity_suggestion
    };

    // Store in cache
    myCache.set(cacheKey, responsePayload);

    // Save to history db
    addHistory({ city: responsePayload.city, aqi: responsePayload.aqi, category: responsePayload.category });

    res.json(responsePayload);
    
  } catch (error) {
    next(error);
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
