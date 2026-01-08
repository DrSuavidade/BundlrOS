import { GoogleGenAI, Type } from "@google/genai";
import { IntakeItem, Priority, AIAnalysisResult } from "../types";

const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeIntakeItem = async (item: IntakeItem): Promise<AIAnalysisResult> => {
  if (!apiKey || !ai) {
    throw new Error("API Key not found in environment variables.");
  }

  const prompt = `
    You are an expert IT and Operations Triage Officer.
    Analyze the following intake request and provide structured triage data.
    
    Request Title: "${item.title}"
    Request Description: "${item.description}"
    Client: "${item.client}"
    Requestor: "${item.requestor}"

    Determine the appropriate Priority (Low, Medium, High, Critical) based on urgency and impact.
    Summarize the issue in one sentence.
    Suggest a Category (e.g., "Hardware", "Access", "Bug", "Feature", "Infrastructure").
    List 2-3 immediate next steps for the agent.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPriority: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
            },
            suggestedCategory: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            summary: { type: Type.STRING },
            nextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["suggestedPriority", "reasoning", "suggestedCategory", "summary", "nextSteps"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const result = JSON.parse(jsonText);

    // Map string to enum just to be safe, though schema enforces it
    let priorityEnum = Priority.MEDIUM;
    switch (result.suggestedPriority) {
      case "Low": priorityEnum = Priority.LOW; break;
      case "High": priorityEnum = Priority.HIGH; break;
      case "Critical": priorityEnum = Priority.CRITICAL; break;
    }

    return {
      suggestedPriority: priorityEnum,
      suggestedCategory: result.suggestedCategory,
      reasoning: result.reasoning,
      summary: result.summary,
      nextSteps: result.nextSteps,
    };

  } catch (error) {
    console.error("Gemini Triage Error:", error);
    throw error;
  }
};
