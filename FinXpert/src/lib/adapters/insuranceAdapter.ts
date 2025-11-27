import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";
import type {
  AdapterResult,
  ProductSnapshot,
  ProductPositionRow,
} from "./types";
import { PRODUCT_POSITIONS_TABLE } from "./types";

const ADAPTER_NAME = "insuranceAdapter";

type SetuPolicy = {
  client_id?: string;
  customer_id?: string;
  policy_number?: string;
  product_code?: string;
  product_name?: string;
  premium_paid?: number;
  surrender_value?: number;
  sum_assured?: number;
  premium?: number;
  term?: number;
  status?: string;
};

type ICICIPruPolicy = {
  client_id: string;
  policy_number: string;
  product_name: string;
  premium_paid: number;
  fund_value?: number;
  sum_assured: number;
  premium: number;
  term: number;
  status: string;
};

// Mock insurance data
const mockInsurance: ProductSnapshot[] = [
  {
    clientId: "CLT-001",
    productCode: "INS-TERM-01",
    productName: "Term Life Insurance",
    type: "INSURANCE",
    amountInvested: 50000,
    currentValue: 50000,
    metadata: {
      sumAssured: 5000000,
      premium: 50000,
      term: 20,
      status: "ACTIVE",
    },
  },
];

// Setu API integration (sandbox: https://sandbox.api-setu.in/)
async function fetchFromSetuAPI(): Promise<ProductSnapshot[] | null> {
  const apiKey = process.env.SETU_API_KEY;
  const apiSecret = process.env.SETU_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn("Setu API credentials missing. Add SETU_API_KEY and SETU_API_SECRET to .env.local");
    return null;
  }

  try {
    // Step 1: Get OAuth token from Setu
    const tokenResponse = await fetch("https://api-setu.in/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Setu OAuth failed:", await tokenResponse.text());
      return null;
    }

    const { access_token } = await tokenResponse.json();

    // Step 2: Fetch insurance policies (replace with actual Setu endpoint)
    const policiesResponse = await fetch(
      "https://api-setu.in/v1/insurance/policies",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (!policiesResponse.ok) {
      console.error("Setu policies fetch failed:", await policiesResponse.text());
      return null;
    }

    const policies = (await policiesResponse.json()) as SetuPolicy[];

    // Step 3: Normalize to ProductSnapshot format
    return policies.map((policy) => ({
      clientId: policy.client_id || policy.customer_id,
      productCode: policy.policy_number || policy.product_code,
      productName: policy.product_name || "Insurance Policy",
      type: "INSURANCE" as const,
      amountInvested: policy.premium_paid || 0,
      currentValue: policy.surrender_value || policy.premium_paid || 0,
      metadata: {
        sumAssured: policy.sum_assured,
        premium: policy.premium,
        term: policy.term,
        status: policy.status,
        provider: "Setu",
      },
    }));
  } catch (error) {
    console.error("Setu API error:", error);
    return null;
  }
}

// ICICI Prudential API integration
async function fetchFromICICIPruAPI(): Promise<ProductSnapshot[] | null> {
  const apiKey = process.env.ICICI_PRU_API_KEY;
  const apiSecret = process.env.ICICI_PRU_API_SECRET;

  if (!apiKey || !apiSecret) {
    return null;
  }

  try {
    // OAuth Proxy v1 to get token
    const tokenResponse = await fetch(
      "https://api.iciciprudential.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: apiKey,
          client_secret: apiSecret,
          grant_type: "client_credentials",
        }),
      },
    );

    if (!tokenResponse.ok) {
      return null;
    }

    const { access_token } = await tokenResponse.json();

    // Fetch policy details (replace with actual ICICI Pru endpoint)
    const policiesResponse = await fetch(
      "https://api.iciciprudential.com/v1/policies",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    if (!policiesResponse.ok) {
      return null;
    }

    const policies = (await policiesResponse.json()) as ICICIPruPolicy[];

    return policies.map((policy) => ({
      clientId: policy.client_id,
      productCode: policy.policy_number,
      productName: policy.product_name,
      type: "INSURANCE" as const,
      amountInvested: policy.premium_paid,
      currentValue: policy.fund_value || policy.premium_paid,
      metadata: {
        sumAssured: policy.sum_assured,
        premium: policy.premium,
        term: policy.term,
        status: policy.status,
        provider: "ICICI Prudential",
      },
    }));
  } catch (error) {
    console.error("ICICI Prudential API error:", error);
    return null;
  }
}

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
    .eq("type", "INSURANCE")
    .eq("advisor_id", advisorId);

  if (error) {
    console.error("Supabase insuranceAdapter error:", error);
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

export async function fetchInsuranceData(): Promise<AdapterResult> {
  // Try Setu API first, then ICICI Pru, then Supabase, then mock
  const setuData = await fetchFromSetuAPI();
  if (setuData && setuData.length > 0) {
    return {
      adapter: `${ADAPTER_NAME}-setu`,
      data: setuData,
      fetchedAt: new Date().toISOString(),
    };
  }

  const iciciData = await fetchFromICICIPruAPI();
  if (iciciData && iciciData.length > 0) {
    return {
      adapter: `${ADAPTER_NAME}-icici`,
      data: iciciData,
      fetchedAt: new Date().toISOString(),
    };
  }

  const supabaseData = await fetchFromSupabase();
  const data =
    supabaseData && supabaseData.length > 0
      ? supabaseData
      : await mockFallback();

  if (!supabaseData || supabaseData.length === 0) {
    console.warn(
      "insuranceAdapter falling back to mock data. Populate product_positions with type=INSURANCE rows or configure Setu/ICICI Pru APIs.",
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
  return mockInsurance;
}

