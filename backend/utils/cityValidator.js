const indianCities = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
  'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur',
  'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad',
  'Tiruchirappalli', 'Puducherry'
];

const isIndianCity = (cityName) => {
    // Normalize and clean strings for comparison
    const searchParam = cityName.toLowerCase().trim();
    
    // Check main predefined list
    if (indianCities.some(city => city.toLowerCase() === searchParam || searchParam.includes(city.toLowerCase()))) {
        return true;
    }
    
    // Fallback: If it specifically includes ", india" or " india" we might allow it,
    // but the strict approach is checking our recognized list.
    if (searchParam.endsWith('india')) {
        return true;
    }

    return false;
};

module.exports = {
    isIndianCity,
    indianCities
};
