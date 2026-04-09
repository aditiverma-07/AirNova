const axios = require('axios');

const getIndianCPCBB_Category = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
};

const fetchAQI = async (city) => {
  try {
    const token = process.env.WAQI_TOKEN;
    // Special handling: Since WAQI is global, appending ' india' or relying on WAQI's own search mapping.
    // For WAQI, feed/city works well, e.g., /feed/delhi/?token=...
    const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${token}`;
    
    const response = await axios.get(url);
    const result = response.data;

    // WAQI returns status ok or error
    if (result.status !== 'ok' || !result.data || typeof result.data === 'string') {
        // Sometimes it returns 'Unknown station' in data for invalid cities
        return null; 
    }

    const currentData = result.data;
    const aqi = currentData.aqi || 0;
    
    // WAQI stores specific pollutant values under iaqi
    const iaqi = currentData.iaqi || {};
    const pollutants = {
        pm25: iaqi.pm25 ? iaqi.pm25.v : 0,
        pm10: iaqi.pm10 ? iaqi.pm10.v : 0,
        no2: iaqi.no2 ? iaqi.no2.v : 0,
        so2: iaqi.so2 ? iaqi.so2.v : 0,
        co: iaqi.co ? iaqi.co.v : 0,
        o3: iaqi.o3 ? iaqi.o3.v : 0,
    };

    return {
        city: currentData.city ? currentData.city.name : city,
        state: 'India', // Optional placeholder depending on specific API return capabilities
        aqi: aqi,
        category: getIndianCPCBB_Category(aqi),
        pollutants: pollutants
    };

  } catch (error) {
    console.error(`Error fetching AQI for ${city}:`, error.message);
    throw error;
  }
};

module.exports = {
    fetchAQI
};
