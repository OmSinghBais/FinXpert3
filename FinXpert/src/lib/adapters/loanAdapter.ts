import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";
import type {
  AdapterResult,
  ProductSnapshot,
  ProductPositionRow,
} from "./types";
import { PRODUCT_POSITIONS_TABLE } from "./types";

const ADAPTER_NAME = "loanAdapter";

const mockLoans: ProductSnapshot[] = [
  {
    clientId: "CLT-003",
    productCode: "LOAN-HL-01",
    productName: "Home Loan",
    type: "LOAN",
    amountInvested: 0,
    currentValue: -3200000,
    metadata: {
      interestRate: 0.085,
      nextDueDate: "2025-12-15",
      status: "ON_TRACK",
    },
  },
  {
    clientId: "CLT-001",
    productCode: "LOAN-LAP-07",
    productName: "Loan Against Property",
    type: "LOAN",
    amountInvested: 0,
    currentValue: -850000,
    metadata: {
      interestRate: 0.099,
      nextDueDate: "2025-12-28",
      status: "ATTENTION",
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
    .eq("type", "LOAN")
    .eq("advisor_id", advisorId);

  if (error) {
    console.error("Supabase loanAdapter error:", error);
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

export async function fetchLoanData(): Promise<AdapterResult> {
  const liveData = await fetchFromSupabase();
  const data =
    liveData && liveData.length > 0 ? liveData : (await mockFallback());
  if (!liveData || liveData.length === 0) {
    console.warn(
      "loanAdapter falling back to mock data. Populate product_positions with type=LOAN rows to serve live data.",
    );
  }

  return {
    adapter: ADAPTER_NAME,
    data,
    fetchedAt: new Date().toISOString(),
  };
}

async function mockFallback(): Promise<ProductSnapshot[]> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return mockLoans;
}

