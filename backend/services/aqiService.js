const axios = require('axios');

const getCategory = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  if (aqi <= 300) return 'Very Poor';
  return 'Severe';
};

// Breakpoint calculator for CPCB AQI scale
const getSubAQI = (c, cMin, cMax, iMin, iMax) => {
  return Math.round(((iMax - iMin) / (cMax - cMin)) * (c - cMin) + iMin);
};

const calculateAQIPoint = (c, breakpoints) => {
  for (let bp of breakpoints) {
    if (c >= bp.cMin && c <= bp.cMax) {
      return getSubAQI(c, bp.cMin, bp.cMax, bp.iMin, bp.iMax);
    }
  }
  return 500;
};

const calculateIndianAQI = (pm25, pm10) => {
  const pm25BPs = [
    { cMin: 0, cMax: 30, iMin: 0, iMax: 50 },
    { cMin: 30, cMax: 60, iMin: 51, iMax: 100 },
    { cMin: 60, cMax: 90, iMin: 101, iMax: 200 },
    { cMin: 90, cMax: 120, iMin: 201, iMax: 300 },
    { cMin: 120, cMax: 250, iMin: 301, iMax: 500 }
  ];
  
  const pm10BPs = [
    { cMin: 0, cMax: 50, iMin: 0, iMax: 50 },
    { cMin: 50, cMax: 100, iMin: 51, iMax: 100 },
    { cMin: 100, cMax: 250, iMin: 101, iMax: 200 },
    { cMin: 250, cMax: 350, iMin: 201, iMax: 300 },
    { cMin: 350, cMax: 430, iMin: 301, iMax: 500 }
  ];

  const aqiPM25 = calculateAQIPoint(pm25, pm25BPs);
  const aqiPM10 = calculateAQIPoint(pm10, pm10BPs);
  return Math.max(aqiPM25, aqiPM10);
};

// Retry helper
const fetchWithRetry = async (url, options = {}, retries = 3, timeoutMs = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await axios({
      ...options,
      url,
      signal: controller.signal,
      timeout: timeoutMs
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('aborted');
    const isServerError = error.response && error.response.status >= 500;
    
    if (retries > 0 && (isTimeout || isServerError || !error.response)) {
      console.log(`[Retry] Retrying API request to: ${url.split('?')[0]}. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1, timeoutMs);
    }
    throw error;
  }
};

const parseError = (err) => {
  if (err.response) {
    const status = err.response.status;
    if (status === 401 || status === 403) {
      const e = new Error("AQI API key missing or invalid");
      e.status = status;
      return e;
    }
    if (status === 404) {
      const e = new Error("City not found");
      e.status = 404;
      return e;
    }
    if (status === 429) {
      const e = new Error("API Rate Limit Exceeded");
      e.status = 429;
      return e;
    }
    if (status >= 500) {
      const e = new Error("AQI Provider Error");
      e.status = 500;
      return e;
    }
    const e = new Error(`HTTP Error ${status}`);
    e.status = status;
    return e;
  }
  if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.message.includes('aborted')) {
    const e = new Error("API Request Timeout");
    e.status = 504;
    return e;
  }
  const e = new Error("Check Internet/API availability");
  e.status = 503;
  return e;
};

// Fetch AQI logic using strictly OpenWeather
const fetchAQI = async (city) => {
  const token = process.env.OPENWEATHER_API_KEY;
  const formattedCity = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const invalidKeys = ['your_openweather_api_key', 'demo', 'demo_key', 'sample_key', 'test_key', 'your_real_api_key', 'your_api_key_here', 'your_api_key_placeholder'];
  if (!token || token.trim() === '' || invalidKeys.includes(token.toLowerCase().trim())) {
    const err = new Error("AQI API key missing or invalid");
    err.status = 401;
    throw err;
  }

  // 1. Get Coordinates using OpenWeather Geocoding API
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},IN&limit=1&appid=${token}`;
  console.log("Requested City:", formattedCity);
  console.log("API URL:", geoUrl.replace(token, 'REDACTED_KEY'));

  let lat, lon;
  try {
    const geoResponse = await fetchWithRetry(geoUrl, {}, 3, 10000);
    console.log("Response Status:", geoResponse.status);
    console.log("API Response:", geoResponse.data);

    if (geoResponse.data && geoResponse.data.length > 0) {
      const match = geoResponse.data[0];
      lat = parseFloat(match.lat);
      lon = parseFloat(match.lon);
    } else {
      const err = new Error("City not found");
      err.status = 404;
      throw err;
    }
  } catch (geoErr) {
    console.error(`[OpenWeather Geocoding Failed]`, geoErr.message);
    throw parseError(geoErr);
  }

  // 2. Fetch AQI data using OpenWeather Air Pollution API
  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${token}`;
  console.log("Requested City:", formattedCity);
  console.log("API URL:", aqiUrl.replace(token, 'REDACTED_KEY'));

  try {
    const aqiResponse = await fetchWithRetry(aqiUrl, {}, 3, 10000);
    console.log("Response Status:", aqiResponse.status);
    console.log("API Response:", aqiResponse.data);

    if (aqiResponse.data && aqiResponse.data.list && aqiResponse.data.list.length > 0) {
      const item = aqiResponse.data.list[0];
      const comps = item.components || {};
      
      const pm25 = comps.pm2_5 || 0;
      const pm10 = comps.pm10 || 0;
      const aqiValue = calculateIndianAQI(pm25, pm10);

      return {
        city: formattedCity,
        station: `OpenWeather Station (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        aqi: aqiValue,
        category: getCategory(aqiValue),
        pollutants: {
          pm25: pm25,
          pm10: pm10,
          no2: comps.no2 || 0,
          so2: comps.so2 || 0,
          co: comps.co || 0,
          o3: comps.o3 || 0
        },
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error("Invalid AQI response structure");
    }
  } catch (aqiErr) {
    console.error(`[OpenWeather Air Pollution Failed]`, aqiErr.message);
    throw parseError(aqiErr);
  }
};

module.exports = {
  fetchAQI
};
