import { getServerUser } from "./supabase/serverAuth";

/**
 * Advisor context helper
 * 
 * Reads from Supabase auth session
 * Falls back to env var or default if not authenticated
 */

export async function getCurrentAdvisorId(): Promise<string> {
  try {
    const user = await getServerUser();
    if (user) {
      // Use user ID as advisor ID, or read from user metadata
      return (user.user_metadata?.advisor_id as string) || user.id;
    }
  } catch {
    // Fallback if auth fails
  }
  return process.env.DEFAULT_ADVISOR_ID || "ADV-001";
}

export async function getCurrentTenantId(): Promise<string> {
  try {
    const user = await getServerUser();
    if (user) {
      return (user.user_metadata?.tenant_id as string) || "TENANT-001";
    }
  } catch {
    // Fallback if auth fails
  }
  return process.env.DEFAULT_TENANT_ID || "TENANT-001";
}

