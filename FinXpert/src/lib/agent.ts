import {
  fetchLoanData,
  fetchMutualFundData,
  AdapterResult,
  ProductSnapshot,
} from "./adapters";
import { logAgentInvocation } from "./logger";
import { buildAdvisorInsight } from "./llm";

export type AgentResponse = {
  summary: string;
  rationale: string;
  sourceData: ProductSnapshot[];
};

function describeHoldings(data: ProductSnapshot[]): string {
  const byType = data.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(byType)
    .map(([type, count]) => `${count} ${type.toLowerCase()} items`)
    .join(", ");
}

export async function runFinXpertAgent(prompt: string): Promise<AgentResponse> {
  const scope = "finxpert-agent";

  try {
    const adapterResults: AdapterResult[] = await Promise.all([
      fetchMutualFundData(),
      fetchLoanData(),
    ]);

    const flattened: ProductSnapshot[] = adapterResults.flatMap(
      (result) => result.data,
    );

    const holdingsSummary = describeHoldings(flattened);
    const { summary, rationale } = await buildAdvisorInsight(
      `${prompt}\n\nHoldings summary: ${holdingsSummary}`,
      flattened,
      holdingsSummary,
    );

    const response: AgentResponse = {
      summary,
      rationale,
      sourceData: flattened,
    };

    await logAgentInvocation({
      scope,
      adapterInput: adapterResults,
      prompt,
      output: response,
    });

    return response;
  } catch (error) {
    await logAgentInvocation({
      scope,
      prompt,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

