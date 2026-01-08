import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;
  private apiKey: string | undefined;

  constructor() {
    // In a real app, strict env check. Here we allow silent fail if key missing to avoid crashing UI for demo
    this.apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      console.warn("API_KEY not found in environment variables. AI features disabled.");
    }
  }

  async analyzeImage(base64Data: string, mimeType: string): Promise<{ description: string; tags: string[] }> {
    if (!this.apiKey || !this.ai) {
      throw new Error("API Key missing");
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: "Analyze this image for a media library. Provide a concise description (max 20 words) and a list of 5 relevant tags for searching."
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["description", "tags"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      return JSON.parse(text);

    } catch (error) {
      console.error("Gemini analysis failed:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();