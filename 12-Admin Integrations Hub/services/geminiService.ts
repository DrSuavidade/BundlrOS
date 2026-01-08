import { GoogleGenAI, Type } from "@google/genai";
import { FieldMapping } from "../types";

const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateSmartMappings = async (
  sourceFields: string[],
  destinationFields: string[]
): Promise<FieldMapping[]> => {
  if (!apiKey || !ai) {
    console.warn("No API Key provided for Gemini.");
    return [];
  }

  try {
    const prompt = `
      I have two lists of data fields from different systems. 
      Source Fields: ${JSON.stringify(sourceFields)}
      Destination Fields: ${JSON.stringify(destinationFields)}
      
      Please generate the most logical field mappings between them. 
      Return a JSON array of objects with 'sourceField' and 'destinationField'.
      Only map fields that are semantically similar. Ignore unmatched fields.
    `;

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
              sourceField: { type: Type.STRING },
              destinationField: { type: Type.STRING },
            },
            required: ["sourceField", "destinationField"]
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as FieldMapping[];
  } catch (error) {
    console.error("Gemini mapping failed:", error);
    return [];
  }
};

export const analyzeErrorLog = async (errorLog: string, providerName: string): Promise<string> => {
  if (!apiKey || !ai) return "AI analysis unavailable (Missing API Key).";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a senior DevOps engineer. Analyze this error log from a ${providerName} integration:
        "${errorLog}"
        
        Provide a concise, 1-sentence explanation of what is wrong and a 1-sentence recommendation to fix it.
        Keep it technical but readable.
      `,
    });
    return response.text || "Could not analyze error.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI Analysis failed due to network or key issues.";
  }
};