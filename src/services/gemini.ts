import { GoogleGenAI, Type } from "@google/genai";
import { Movie } from "../types";

const STORAGE_KEY = 'gemini_api_key';

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return (process.env.GEMINI_API_KEY || '').trim();
}

export function setStoredApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function removeStoredApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function hasApiKey(): boolean {
  return Boolean(getStoredApiKey());
}

export function getMaskedApiKey(): string {
  const key = getStoredApiKey();
  if (!key) return '';
  if (key.length <= 4) return '••••';
  const last4 = key.slice(-4);
  return `••••••••••••••••${last4}`;
}

function getAvailableApiKeys(): string[] {
  const keys: string[] = [];
  const stored = getStoredApiKey();
  if (stored) keys.push(stored);

  if (process.env.GEMINI_API_KEY && !keys.includes(process.env.GEMINI_API_KEY)) {
    keys.push(process.env.GEMINI_API_KEY);
  }
  if (process.env.GEMINI_API_KEY_2 && !keys.includes(process.env.GEMINI_API_KEY_2)) {
    keys.push(process.env.GEMINI_API_KEY_2);
  }
  if (process.env.GEMINI_API_KEY_3 && !keys.includes(process.env.GEMINI_API_KEY_3)) {
    keys.push(process.env.GEMINI_API_KEY_3);
  }

  return keys.filter(k => Boolean(k && k.trim()));
}

const movieSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    year: { type: Type.STRING },
    genre: { type: Type.ARRAY, items: { type: Type.STRING } },
    rating: { type: Type.STRING },
    description: { type: Type.STRING },
    director: { type: Type.STRING },
    runtime: { type: Type.STRING },
    releaseDate: { type: Type.STRING },
    posterUrl: { type: Type.STRING, description: "A REAL, high-quality, publicly accessible URL for the movie's official poster (e.g., from TMDB, IMDb, or official movie sites)." },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    isMustWatch: { type: Type.BOOLEAN }
  },
  required: ["title", "year", "genre", "rating", "description", "director", "runtime", "releaseDate", "posterUrl", "tags"]
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: { type: Type.STRING, description: "A brief analysis of the user's request and why these movies were chosen." },
    recommendations: {
      type: Type.ARRAY,
      items: movieSchema
    }
  },
  required: ["analysis", "recommendations"]
};

export async function getMovieRecommendations(prompt: string, history: { role: string; content: string }[]) {
  const keys = getAvailableApiKeys();
  if (keys.length === 0) {
    throw new Error("GEMINI_KEY_MISSING");
  }

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
  
  const contents = [
    ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  let lastError: any = null;

  for (const key of keys) {
    const ai = new GoogleGenAI({ apiKey: key });

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: contents as any,
          config: {
            systemInstruction: `You are "The Digital Curator", a sophisticated AI cinematic expert for the app "What'sYourMov". 
            Your goal is to recommend visually stunning, high-quality films based on user preferences.
            Focus on cinematography, mood, and philosophical themes.
            Always provide 3 recommendations.
            
            CRITICAL: You MUST provide a REAL, WORKING URL for the official movie poster. 
            Use the googleSearch tool to find the EXACT poster image URL. 
            
            STEPS TO FIND POSTER:
            1. Search for "[Movie Name] [Year] official poster image direct link".
            2. Look for URLs from:
               - image.tmdb.org (e.g., https://image.tmdb.org/t/p/w500/...)
               - m.media-amazon.com (e.g., https://m.media-amazon.com/images/M/...)
               - wikimedia.org
            3. Ensure the URL ends in .jpg, .jpeg, or .png.
            4. DO NOT hallucinate or make up a URL. If you cannot find a direct image link, provide a high-quality descriptive Unsplash URL as a last resort, but you MUST try to find the real one first.`,
            responseMimeType: "application/json",
            responseSchema: responseSchema as any,
            tools: [{ googleSearch: {} }]
          }
        });

        return JSON.parse(response.text || "{}");
      } catch (error: any) {
        console.error(`API call failed with model ${model} and key ${key.substring(0, 6)}...:`, error);
        lastError = error;
      }
    }
  }

  throw lastError || new Error("All API attempts failed. Please verify your Gemini API key.");
}
