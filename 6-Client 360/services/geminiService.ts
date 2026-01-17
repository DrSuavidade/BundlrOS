import { ClientData } from "../types";

// Access the OpenRouter API key
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

// List of free models to try
const FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-thinking-exp:free",
];

export const generateClientInsight = async (clientData: ClientData): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("OpenRouter API Key is missing.");
    return "AI insights are unavailable. Please add `VITE_OPEN_ROUTER_KEY` to your environment variables.";
  }

  // Prepare a concise context for the model
  const context = `
    Client: ${clientData.name} (${clientData.tier} Tier)
    Industry: ${clientData.industry}
    Contracts: ${clientData.contracts.length} total (${clientData.contracts.filter(c => c.status === 'active').length} active)
    ${clientData.contracts.map(c => `- ${c.title}: $${c.value} (${c.status})`).join('\n')}
    Deliverables: ${clientData.deliverables.length} total
    ${clientData.deliverables.map(d => `- ${d.title}: ${d.status} (${d.progress}% complete)`).join('\n')}
    Inbox: ${clientData.inbox.length} messages, ${clientData.inbox.filter(m => !m.read).length} unread
    QA Status: ${clientData.qa.map(q => `${q.metric}: ${q.status}`).join(', ')}
  `;

  const systemPrompt = `You are a senior account manager and client success specialist. You provide brief, actionable insights about client health and engagement.`;

  const userPrompt = `
    Based on the following client data snapshot, provide a brief, 2-3 sentence executive summary of the client's current health and any immediate attention points.
    Be professional, direct, and action-oriented. Focus on business impact.
    
    Data:
    ${context}
  `;

  let lastError: any = null;

  // Try models with retries
  for (const model of FREE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Client360] Attempting AI insight with model: ${model} (Attempt ${attempt})`);

        const response = await fetch(OPEN_ROUTER_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "BundlrOS Client 360",
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

          // If 404, model doesn't exist, move to next model
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
        console.warn(`[Client360] Model ${model} failed attempt ${attempt}:`, error);
        lastError = error;

        if (error.message && error.message.includes('STATUS_404')) {
          break; // Move to next model immediately
        }

        // If rate limited, wait and retry
        if (error.message && error.message.includes('429')) {
          const waitTime = 15000;
          console.log(`[Client360] Rate limited. Waiting ${waitTime}ms...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }

        break;
      }
    }
  }

  // Fallback if all AI attempts fail
  console.error("[Client360] All AI models failed.", lastError);
  return `Unable to generate AI insight at this time. The client has ${clientData.contracts.length} contracts and ${clientData.deliverables.filter(d => d.status === 'on-track').length} deliverables in progress.`;
};
