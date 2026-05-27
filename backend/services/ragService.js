const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

const getFallbackAdvisory = (category, ragContext) => {
    return {
        health_advisory: `[Fallback AI] ${ragContext}`,
        risk_groups: category === 'Good' ? ['None'] : ['Children', 'Elderly', 'Asthma patients'],
        precautions: category === 'Good' ? ['Enjoy the outdoors'] : ['Wear mask outdoors', 'Limit heavy exertion', 'Use air purifiers indoors'],
        activity_suggestion: category === 'Good' ? 'Perfect for outdoor exercise.' : 'Unsafe for prolonged outdoor activity.'
    };
};

const generateAdvisory = async (aqi, category) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            console.log("[Gemini API] API Key missing, using fallback generation...");
            const dummyContext = `General guideline for ${category}`; 
            return getFallbackAdvisory(category, dummyContext);
        }

        // Get True RAG context
        let ragContext = "No specific guidelines available.";
        try {
            const guidelinesPath = path.join(__dirname, '../data/health_guidelines.json');
            const data = fs.readFileSync(guidelinesPath, 'utf8');
            const parsed = JSON.parse(data);
            const found = parsed.guidelines.find(g => g.category.toLowerCase() === category.toLowerCase());
            if (found) {
                ragContext = found.context;
            }
        } catch (err) {
            console.error("Error reading RAG guidelines:", err.message);
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a professional health advisory system expert for Air Quality in India.
Given the following Air Quality Index (AQI) data, generate a structured JSON health advisory.
Ensure the response is ONLY a strictly valid JSON object.

[Retrieval Context - Medical Guidelines for ${category}]
${ragContext}

AQI Data:
AQI Value: ${aqi}
Category: ${category}

Based on the RAG Medical Guidelines and data, return a JSON object with this EXACT structure (populate intelligently):
{
  "health_advisory": "Explain health impact of AQI based on the Retrieval Context",
  "risk_groups": [
    "Children",
    "Elderly",
    "Asthma patients",
    "Heart patients"
  ],
  "precautions": [
    "Wear mask",
    "Avoid outdoor exercise",
    "Close windows",
    "Use air purifier"
  ],
  "activity_suggestion": "Safe / Unsafe for outdoor activity"
}`;


        // We use gemini-2.5-flash as default, or whatever available model the user can access.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const rawText = response.text;
        const parsedJson = JSON.parse(rawText);

        return parsedJson;

    } catch (error) {
        console.error('Generative AI Error:', error.message);
        console.log("Falling back to local advisory generation...");
        return getFallbackAdvisory(category, "Service temporarily unavailable due to capacity limits. Please act according to the AQI category.");
    }
};

module.exports = {
    generateAdvisory
};
