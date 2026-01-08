import { GoogleGenAI } from "@google/genai";
import { ClientData } from "../types";

// Note: In a real app, ensure API_KEY is set in your environment variables.
// The code assumes process.env.API_KEY is available.

export const generateClientInsight = async (clientData: ClientData): Promise<string> => {
  const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return "AI insights are unavailable (Mock: API Key missing).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Prepare a concise context for the model
    const context = `
      Client: ${clientData.name} (${clientData.tier} Tier)
      Contracts: ${clientData.contracts.length} (${clientData.contracts.filter(c => c.status === 'active').length} active)
      Deliverables: ${clientData.deliverables.map(d => `${d.title}: ${d.status} (${d.progress}%)`).join(', ')}
      Inbox: ${clientData.inbox.length} messages, ${clientData.inbox.filter(m => !m.read).length} unread.
      Recent QA Status: ${clientData.qa.map(q => `${q.metric}: ${q.status}`).join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a senior account manager assistant. 
        Based on the following client data snapshot, provide a brief, 3-sentence executive summary of the client's current health and immediate attention points.
        Be professional, direct, and action-oriented.
        
        Data:
        ${context}
      `,
    });

    return response.text || "Unable to generate insight.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating AI insight. Please try again later.";
  }
};
