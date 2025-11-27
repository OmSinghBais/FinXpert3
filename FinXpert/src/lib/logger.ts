import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId, getCurrentTenantId } from "@/lib/advisorContext";

type LogPayload = {
  scope: string;
  adapterInput?: unknown;
  prompt?: string;
  output?: unknown;
  error?: unknown;
};

const AGENT_LOG_TABLE = "agent_logs";

export async function logAgentInvocation(payload: LogPayload) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...payload,
  };

  console.log("FinXpert log:", JSON.stringify(entry, null, 2));
  await persistEntry(entry);
}

async function persistEntry(entry: LogPayload & { timestamp: string }) {
  const client = getSupabaseServerClient();
  if (!client) {
    return;
  }

  try {
    const advisorId = await getCurrentAdvisorId();
    const tenantId = await getCurrentTenantId();
    await client.from(AGENT_LOG_TABLE).insert({
      scope: entry.scope,
      prompt: entry.prompt ?? null,
      payload: entry,
      error: entry.error ?? null,
      advisor_id: advisorId,
      tenant_id: tenantId,
      created_at: entry.timestamp,
    });
  } catch (error) {
    console.warn("Failed to persist agent log to Supabase:", error);
  }
}

