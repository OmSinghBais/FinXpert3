import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";
import type {
  AdapterResult,
  ProductSnapshot,
  ProductPositionRow,
} from "./types";
import { PRODUCT_POSITIONS_TABLE } from "./types";

const ADAPTER_NAME = "mutualFundAdapter";

const mockHoldings: ProductSnapshot[] = [
  {
    clientId: "CLT-001",
    productCode: "MF-BAL-01",
    productName: "Balanced Advantage Fund",
    type: "MUTUAL_FUND",
    amountInvested: 250000,
    currentValue: 272500,
    metadata: {
      expenseRatio: 0.012,
      recommendation: "Hold",
    },
  },
  {
    clientId: "CLT-002",
    productCode: "MF-LS-02",
    productName: "Large & Midcap Fund",
    type: "MUTUAL_FUND",
    amountInvested: 100000,
    currentValue: 121000,
    metadata: {
      expenseRatio: 0.011,
      recommendation: "Review",
    },
  },
];

async function fetchFromSupabase(): Promise<ProductSnapshot[] | null> {
  const client = getSupabaseServerClient();
  if (!client) {
    return null;
  }

  const advisorId = getCurrentAdvisorId();
  const { data, error } = await client
    .from<ProductPositionRow>(PRODUCT_POSITIONS_TABLE)
    .select(
      "client_id, product_code, product_name, type, amount_invested, current_value, metadata",
    )
    .eq("type", "MUTUAL_FUND")
    .eq("advisor_id", advisorId);

  if (error) {
    console.error("Supabase mutualFundAdapter error:", error);
    return null;
  }

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    clientId: row.client_id,
    productCode: row.product_code,
    productName: row.product_name,
    type: row.type,
    amountInvested: row.amount_invested,
    currentValue: row.current_value,
    metadata: row.metadata ?? undefined,
  }));
}

export async function fetchMutualFundData(): Promise<AdapterResult> {
  const liveData = await fetchFromSupabase();
  const data =
    liveData && liveData.length > 0 ? liveData : (await mockFallback());
  if (!liveData || liveData.length === 0) {
    console.warn(
      "mutualFundAdapter falling back to mock data. Populate product_positions with type=MUTUAL_FUND rows to serve live data.",
    );
  }

  return {
    adapter: ADAPTER_NAME,
    data,
    fetchedAt: new Date().toISOString(),
  };
}

async function mockFallback(): Promise<ProductSnapshot[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockHoldings;
}

