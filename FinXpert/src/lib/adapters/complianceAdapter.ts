import { getSupabaseServerClient } from "@/lib/supabase/serverClient";

export type ComplianceFlag = {
  id: string;
  title: string;
  description: string | null;
  severity: "Low" | "Medium" | "High";
  status: string;
};

const MOCK_FLAGS: ComplianceFlag[] = [
  {
    id: "flag-1",
    title: "SEBI risk profile refresh",
    description:
      "12 clients have outdated risk profiles (>12 months). Collect updated MFD declarations.",
    severity: "High",
    status: "OPEN",
  },
  {
    id: "flag-2",
    title: "AMFI ARN renewal",
    description:
      "ARN-12345 expires in 45 days. Submit documents to avoid MF transaction blocks.",
    severity: "Medium",
    status: "OPEN",
  },
];

export async function fetchComplianceFlags(): Promise<ComplianceFlag[]> {
  const client = getSupabaseServerClient();
  if (!client) {
    return MOCK_FLAGS;
  }

  const { data, error } = await client
    .from("compliance_flags")
    .select("id, title, description, severity, status")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("compliance_flags query failed, returning mock data", error);
    return MOCK_FLAGS;
  }

  if (!data) {
    return [];
  }

  return data.map((flag) => ({
    id: flag.id,
    title: flag.title,
    description: flag.description,
    severity: flag.severity,
    status: flag.status,
  }));
}

