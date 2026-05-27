export const fetchAQIData = async (cityInput) => {
  try {
    // Handle both string and object input
    const city = typeof cityInput === 'object' && cityInput !== null 
        ? (cityInput.city || 'Indore') 
        : (cityInput || 'Indore');

    const response = await fetch(`http://localhost:5000/api/aqi/${encodeURIComponent(city)}`);
    
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Failed to parse server response: ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch AQI data: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error("Error fetching AQI data from backend:", error);
    throw error;
  }
};
