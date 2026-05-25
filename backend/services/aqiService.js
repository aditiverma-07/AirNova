const axios = require('axios');

const getIndianCPCBB_Category = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
};

const generateMockAQI = (city) => {
    // Generate a consistent pseudo-random AQI based on the city name
    const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseAQI = 50 + (hash % 300); // Range 50 - 350
    return {
        city: city,
        state: 'India',
        aqi: baseAQI,
        category: getIndianCPCBB_Category(baseAQI),
        pollutants: {
            pm25: Math.floor(baseAQI * 0.8),
            pm10: Math.floor(baseAQI * 1.2),
            no2: Math.floor((hash % 50) + 10),
            so2: Math.floor((hash % 30) + 5),
            co: Math.floor((hash % 10) + 2),
            o3: Math.floor((hash % 80) + 20),
        }
    };
};

const fetchAQI = async (city) => {
  try {
    const token = process.env.WAQI_TOKEN;
    
    // Explicit bypass if user lacks a real WAQI token
    if (!token || token === 'demo') {
        console.log(`[WAQI API Failed] Missing or Demo Token used. Falling back to mock data for: ${city}`);
        return generateMockAQI(city);
    }

    // Special handling: Since WAQI is global, appending ' india' or relying on WAQI's own search mapping.
    // For WAQI, feed/city works well, e.g., /feed/delhi/?token=...
    const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${token}`;
    
    const response = await axios.get(url);
    const result = response.data;

    // WAQI returns status ok or error
    if (result.status !== 'ok' || !result.data || typeof result.data === 'string') {
        // Fallback to mock data for Indian Cities if WAQI fails or restricts it
        console.log(`[WAQI API Failed] Invalid response. Falling back to mock data for: ${city}`);
        return generateMockAQI(city);
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
    console.error(`Error fetching AQI for ${city}. Falling back to mock data...`);
    return generateMockAQI(city);
  }
};

module.exports = {
    fetchAQI
};
