import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProductSnapshot } from "./adapters";

type LlmResult = {
  summary: string;
  rationale: string;
};

let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Falling back to mock summary.");
    return null;
  }

  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

export async function buildAdvisorInsight(
  prompt: string,
  positions: ProductSnapshot[],
  holdingsSummary?: string,
): Promise<LlmResult> {
  const client = getGeminiClient();
  if (!client) {
    return fallbackInsight(positions);
  }

  try {
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.4,
      },
      systemInstruction:
        "You are FinXpert, an AI assistant helping financial advisors prioritize actions across mutual funds, loans, insurance, and alternate products. Respond with concise summaries and rationales.",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                prompt,
                positions,
                holdingsSummary,
              }),
            },
          ],
        },
      ],
    });

    const text = result.response.text() ?? "";
    const [summary, rationale] = text.split("\n\nRationale:");

    return {
      summary:
        summary?.trim() ||
        "Unable to parse AI response. Please review the advisor dashboard manually.",
      rationale:
        rationale?.trim() ||
        "LLM returned no rationale. Validate data sources before taking action.",
    };
  } catch (error) {
    console.warn("Gemini completion failed. Reverting to fallback insight.", error);
    return fallbackInsight(positions);
  }
}

function fallbackInsight(positions: ProductSnapshot[]): LlmResult {
  const mfPositions = positions.filter((p) => p.type === "MUTUAL_FUND").length;
  const loanPositions = positions.filter((p) => p.type === "LOAN").length;

  const summary = `Monitor ${loanPositions} loan accounts for cash stress and rebalance ${mfPositions} mutual fund holdings showing >8% gain.`;
  const rationale =
    "Fallback guidance because the LLM is unavailable. Focus on overlapping clients across loans + MFs to protect AUM.";

  return { summary, rationale };
}

