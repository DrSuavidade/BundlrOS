import { GoogleGenAI } from "@google/genai";
import { KPIRecord } from "../types";

const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateReportNarrative = async (
  period: string,
  kpis: KPIRecord[]
): Promise<string> => {
  if (!apiKey) {
    return "# Configuration Error\n\nAPI Key is missing. Please check your environment variables.";
  }

  const kpiDataString = kpis.map(k =>
    `- ${k.name} (${k.category}): ${k.value} (Prev: ${k.previousValue})`
  ).join('\n');

  const prompt = `
    You are a world-class Chief Financial Officer and Strategy Consultant.
    
    Task: Write an executive narrative report for the period: ${period}.
    
    Data:
    ${kpiDataString}
    
    Guidelines:
    1. Title the report "Executive Summary - ${period}".
    2. Do not just list numbers. Tell the story of what happened.
    3. Highlight major wins (significant increases in growth or revenue).
    4. Point out areas of concern (churn, cost increases) with diplomatic but clear language.
    5. Use valid Markdown formatting. Use H2 (##) for section headers like "Financial Performance", "Growth Trajectory", and "Strategic Recommendations".
    6. Keep it concise, elegant, and readable. Avoid bullet point overload. Use paragraphs.
    7. Conclude with a brief sentiment analysis of the business health.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return `Error generating report: ${(error as Error).message}`;
  }
};