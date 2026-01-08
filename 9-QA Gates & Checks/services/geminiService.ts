import { GoogleGenAI } from "@google/genai";
import { ChecklistItem } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeFailure = async (deliverableName: string, failedItems: ChecklistItem[]): Promise<string> => {
  if (!apiKey) {
    return "API Key not configured. Unable to perform AI analysis.";
  }

  try {
    const failuresText = failedItems.map(item => 
      `- [${item.category.toUpperCase()}] ${item.label}: ${item.logs || item.evidence || 'No details provided'}`
    ).join('\n');

    const prompt = `
      You are a Senior QA Engineer analyzing automated test failures for a software deliverable.
      
      Deliverable: "${deliverableName}"
      
      Failures detected:
      ${failuresText}
      
      Please provide a concise, technical root cause analysis and a suggested fix for each failure. 
      Keep the tone professional and direct. Format with clear headings or bullet points.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful, precise QA expert system.",
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Failed to connect to AI analysis service. Please check your network or API key.";
  }
};