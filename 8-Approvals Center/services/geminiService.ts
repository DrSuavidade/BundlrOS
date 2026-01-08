import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  // Graceful fallback if key is missing to avoid crashing the whole app logic,
  // though the prompt implies we should assume it exists.
  const key = (typeof process !== 'undefined' ? process.env?.API_KEY : null) || 'dummy_key';
  return new GoogleGenAI({ apiKey: key });
};

export const GeminiService = {
  /**
   * Summarizes a complex approval request description.
   */
  summarizeRequest: async (description: string): Promise<string> => {
    try {
      if (typeof process === 'undefined' || !process.env?.API_KEY) return "AI Summary unavailable (No API Key)";

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize the following approval request description into one concise, clear sentence for a dashboard view:\n\n"${description}"`,
      });

      return response.text || "Could not generate summary.";
    } catch (error) {
      console.error("Gemini Summarize Error:", error);
      return "Unable to summarize at this time.";
    }
  },

  /**
   * Drafts a polite message based on the decision.
   */
  draftResponse: async (action: 'APPROVE' | 'REJECT', context: string): Promise<string> => {
    try {
      if (typeof process === 'undefined' || !process.env?.API_KEY) return "";

      const ai = getAiClient();
      const prompt = action === 'APPROVE'
        ? `Draft a short, professional approval message for this request: "${context}". Tone: Positive and concise.`
        : `Draft a polite, constructive rejection message for this request: "${context}". Tone: Empathetic but firm. Ask for revisions if necessary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || "";
    } catch (error) {
      console.error("Gemini Draft Error:", error);
      return "";
    }
  },

  /**
   * Analyzes the request to detect urgency or specific sentiment
   */
  analyzeUrgency: async (text: string): Promise<{ urgency: 'HIGH' | 'MEDIUM' | 'LOW', reason: string }> => {
    try {
      if (typeof process === 'undefined' || !process.env?.API_KEY) return { urgency: 'LOW', reason: 'AI offline' };

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the urgency of this text. Return JSON with keys 'urgency' (HIGH, MEDIUM, LOW) and 'reason'. Text: "${text}"`,
        config: { responseMimeType: 'application/json' }
      });

      const jsonStr = response.text || "{}";
      return JSON.parse(jsonStr);
    } catch (e) {
      return { urgency: 'LOW', reason: 'Error analyzing' };
    }
  }
};