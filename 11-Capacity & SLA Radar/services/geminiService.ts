import { GoogleGenAI } from "@google/genai";
import { Client, IntakeItem } from '../types';

// Initialize Gemini Client
const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeRisks = async (
  clients: Client[],
  intakeItems: IntakeItem[]
): Promise<string> => {
  if (!apiKey || !ai) {
    return "API Key not configured. Unable to perform AI analysis.";
  }

  const highRiskClients = clients.filter(c => c.riskScore > 60);
  const criticalIntake = intakeItems.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');

  const prompt = `
    You are an expert COO assistant for an Operations Center.
    Analyze the following operational snapshot and provide a concise, bulleted executive summary.
    Focus on immediate risks and actionable mitigation strategies. Be direct.

    High Risk Clients:
    ${JSON.stringify(highRiskClients, null, 2)}

    Critical Intake Items (Actionable List):
    ${JSON.stringify(criticalIntake, null, 2)}

    Output format:
    ## Executive Summary
    [Brief overview of health]

    ## Key Risks
    - [Client Name]: [Issue] -> [Recommended Action]

    ## Strategic Recommendation
    [One sentence strategic move]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating analysis. Please try again later.";
  }
};