import { GoogleGenAI, Type } from "@google/genai";
import { LocalDNA, PlaceRecommendation, UserLocation } from "../types";
import { MOCK_RECOMMENDATIONS } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateRecommendations = async (
  city: string,
  dna: LocalDNA,
  userLocation?: UserLocation
): Promise<PlaceRecommendation[]> => {
  const ai = getClient();
  
  if (!ai) {
    console.warn("No API Key found. Using mock data.");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return MOCK_RECOMMENDATIONS;
  }

  let locationContext = `City: ${city}`;
  if (userLocation) {
    locationContext = `
      User's Exact Location: ${userLocation.lat}, ${userLocation.lng} (Lat/Lng).
      The user is physically located here.
    `;
  }

  const prompt = `
    You are LocalMind, an elite AI local guide for India.
    ${locationContext}
    
    User DNA Profile:
    - Budget: ${dna.budget}
    - Crowd Tolerance: ${dna.crowdPreference}
    - Lifestyle: ${dna.lifestyle}
    - Active Hours: ${dna.timePreference}
    - Food Style: ${dna.foodPreference.join(", ")}

    Task: Recommend 5 authentic local spots or "hidden gems" that strictly match this DNA.
    
    RULES:
    1. **Name Accuracy**: Use the EXACT, searchable name of the place as it would appear on Google Maps.
    2. **Avoid Tourist Traps**: Focus on authentic, local favorites.
    3. **Indian Context**: Ensure cultural relevance.
    4. **Coordinates**: I will fetch the REAL coordinates and images from Google Maps separately. You just need to provide the name and the reasoning.
    5. **Reasoning**: Explain WHY this specific place fits the user's specific DNA (e.g., "Because you are a Night Owl student...").
    6. **Tags**: Provide 3 short tags (e.g., "Street Food", "Historic", "View").

    Return a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              localAuthenticityScore: { type: Type.NUMBER },
              bestTime: { type: Type.STRING },
              aiReasoning: { type: Type.STRING },
              crowdBadge: { type: Type.STRING, enum: ["Hidden Gem", "Local Favorite", "Buzzing"] },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });

    if (response.text) {
      let cleanText = response.text;
      // Strip markdown code blocks if present (Gemini sometimes adds them despite MIME type)
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const data = JSON.parse(cleanText);
      // We add temporary mock coordinates here, but they will be overwritten by the Map Service
      return data.map((item: any, index: number) => ({
        ...item,
        id: item.id || `gen-${index}-${Date.now()}`,
        coordinates: { lat: 0, lng: 0 }, // Placeholder, will be hydrated
        touristScore: 100 - (item.localAuthenticityScore || 50)
      }));
    }
    return MOCK_RECOMMENDATIONS;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return MOCK_RECOMMENDATIONS;
  }
};
