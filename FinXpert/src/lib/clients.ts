import {
  fetchLoanData,
  fetchMutualFundData,
  ProductSnapshot,
} from "./adapters";
import { getSupabaseServerClient } from "./supabase/serverClient";
import { getCurrentAdvisorId } from "./advisorContext";

const FALLBACK_CLIENTS: Record<
  string,
  {
    name: string;
    segment: string;
    notes: string;
  }
> = {
  "CLT-001": {
    name: "Riya Malhotra",
    segment: "HNI",
    notes: "Owns MF + LAP products; open to PMS migration.",
  },
  "CLT-002": {
    name: "Arjun Sinha",
    segment: "Mass Affluent",
    notes: "Hybrid MF SIP plus term + health cover.",
  },
  "CLT-003": {
    name: "Sanjay Iyer",
    segment: "HNI",
    notes: "Large home loan with rate-switch opportunity.",
  },
};

export type ClientProfile = {
  id: string;
  name: string;
  segment: string;
  notes: string;
};

export type ClientPortfolio = {
  client: ClientProfile;
  positions: ProductSnapshot[];
  exposure: {
    invested: number;
    current: number;
  };
  productMix: Array<{ type: string; count: number }>;
};

export async function getClientPortfolio(
  clientId: string,
): Promise<ClientPortfolio | null> {
  const clientProfile = await fetchClientProfile(clientId);
  if (!clientProfile) {
    return null;
  }

  const [mutualFunds, loans] = await Promise.all([
    fetchMutualFundData(),
    fetchLoanData(),
  ]);

  const positions = [...mutualFunds.data, ...loans.data].filter(
    (position) => position.clientId === clientId,
  );

  const exposure = positions.reduce(
    (acc, position) => {
      acc.invested += position.amountInvested;
      acc.current += position.currentValue;
      return acc;
    },
    { invested: 0, current: 0 },
  );

  const mixMap = positions.reduce<Record<string, number>>((acc, position) => {
    acc[position.type] = (acc[position.type] ?? 0) + 1;
    return acc;
  }, {});

  const productMix = Object.entries(mixMap).map(([type, count]) => ({
    type,
    count,
  }));

  return {
    client: clientProfile,
    positions,
    exposure,
    productMix,
  };
}

async function fetchClientProfile(clientId: string): Promise<ClientProfile | null> {
  const client = getSupabaseServerClient();
  if (!client) {
    const fallback = FALLBACK_CLIENTS[clientId];
    return fallback
      ? {
          id: clientId,
          ...fallback,
        }
      : null;
  }

  const advisorId = getCurrentAdvisorId();
  const { data, error } = await client
    .from("clients")
    .select("id, name, segment, notes")
    .eq("id", clientId)
    .eq("advisor_id", advisorId)
    .single();

  if (error) {
    console.warn("Failed to fetch client profile:", error);
    return null;
  }

  if (!data) {
    const fallback = FALLBACK_CLIENTS[clientId];
    return fallback
      ? {
          id: clientId,
          ...fallback,
        }
      : null;
  }

  return {
    id: data.id,
    name: data.name,
    segment: data.segment,
    notes: data.notes ?? "",
  };
}

