import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";
import type {
  AdapterResult,
  ProductSnapshot,
  ProductPositionRow,
} from "./types";
import { PRODUCT_POSITIONS_TABLE } from "./types";

const ADAPTER_NAME = "aifAdapter";

const mockAIF: ProductSnapshot[] = [
  {
    clientId: "CLT-001",
    productCode: "AIF-CAT1-01",
    productName: "Category I AIF - Infrastructure",
    type: "INSURANCE", // Using INSURANCE type for now, can add AIF type later
    amountInvested: 5000000,
    currentValue: 5750000,
    metadata: {
      category: "Category I",
      lockIn: 36,
      irr: 0.15,
      status: "ACTIVE",
    },
  },
];

async function fetchFromSupabase(): Promise<ProductSnapshot[] | null> {
  const client = getSupabaseServerClient();
  if (!client) {
    return null;
  }

  const advisorId = await getCurrentAdvisorId();
  // Filter by metadata containing AIF indicators
  const { data, error } = await client
    .from<ProductPositionRow>(PRODUCT_POSITIONS_TABLE)
    .select(
      "client_id, product_code, product_name, type, amount_invested, current_value, metadata",
    )
    .eq("advisor_id", advisorId)
    .or("product_code.ilike.%AIF%,metadata->>category.ilike.%AIF%");

  if (error) {
    console.error("Supabase aifAdapter error:", error);
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

export async function fetchAifData(): Promise<AdapterResult> {
  const supabaseData = await fetchFromSupabase();
  const data =
    supabaseData && supabaseData.length > 0
      ? supabaseData
      : await mockFallback();

  if (!supabaseData || supabaseData.length === 0) {
    console.warn(
      "aifAdapter falling back to mock data. Populate product_positions with AIF products.",
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
  return mockAIF;
}

