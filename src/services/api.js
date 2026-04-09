export const fetchAQIData = async (cityInput) => {
  try {
    // Handle both string and object input
    const city = typeof cityInput === 'object' && cityInput !== null 
        ? (cityInput.city || 'Indore') 
        : (cityInput || 'Indore');

    const response = await fetch(`http://localhost:5000/api/aqi?city=${encodeURIComponent(city)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch AQI data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching AQI data from backend:", error);
    throw error;
  }
};
