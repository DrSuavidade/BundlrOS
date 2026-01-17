import { KPIRecord } from "../types";

// Access the key. In Vite, usually import.meta.env.VITE_...
// We'll support both for flexibility.
const getApiKey = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env.VITE_OPEN_ROUTER_KEY;
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env.VITE_OPEN_ROUTER_KEY || process.env.OPEN_ROUTER_KEY;
  }
  return '';
};

const OPEN_ROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// List of free models to try - focusing on the only one confirmed to exist
const FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-thinking-exp:free", // One last potential backup
];

export const generateReportNarrative = async (
  period: string,
  kpis: KPIRecord[]
): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("OpenRouter API Key is missing.");
    return "# Configuration Error\n\nOpenRouter API Key is missing. Please add `VITE_OPEN_ROUTER_KEY` to your environment variables.";
  }

  const kpiDataString = kpis.map(k =>
    `- ${k.name} (${k.category}): ${k.value} ${k.unit} (Prev: ${k.previousValue} ${k.unit})`
  ).join('\n');

  const systemPrompt = `You are a world-class Chief Financial Officer and Strategy Consultant. Write an executive narrative report based on the provided data.`;

  const userPrompt = `
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

  let lastError: any = null;

  // Try verified models with aggressive retries
  for (const model of FREE_MODELS) {
    // Retry up to 2 times with long delays
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Report] Attempting generation with model: ${model} (Attempt ${attempt})`);

        const response = await fetch(OPEN_ROUTER_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "BundlrOS",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ]
          })
        });

        if (!response.ok) {
          const errText = await response.text();

          // If 404, model doesn't exist, don't retry locally, move to next model
          if (response.status === 404) {
            throw new Error(`STATUS_404: ${errText}`);
          }

          throw new Error(`Status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          return content;
        } else {
          throw new Error("Empty response content");
        }

      } catch (error: any) {
        console.warn(`[Report] Model ${model} failed attempt ${attempt}:`, error);
        lastError = error;

        if (error.message && error.message.includes('STATUS_404')) {
          break; // Move to next model immediately
        }

        // If it's a 429 (Rate Limit), wait a significant amount of time
        if (error.message && error.message.includes('429')) {
          const waitTime = 20000; // Wait 20 seconds
          console.log(`[Report] Rate limited on ${model}. Waiting ${waitTime}ms...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue; // Retry inner loop
        }

        // Other errors, break inner loop to try next model
        break;
      }
    }
  }

  // Fallback if all AI attempts fail
  console.error("All AI models failed. Returning fallback template.", lastError);
  return `# Executive Summary - ${period} (Offline Mode)

**Note:** The AI service is currently experiencing high traffic. This is an automatically generated placeholder based on your data.

## Financial Performance
Your KPIs indicate activity in these areas:
${kpis.slice(0, 3).map(k => `- **${k.name}**: ${k.value} ${k.unit}`).join('\n')}

## Recommendations
- Please try generating this report again in a few minutes when AI capacity restores.
- Review the specific KPIs in the dashboard for detailed insights.

*Generated by BundlrOS Fallback System*`;
};