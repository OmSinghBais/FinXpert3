/**
 * Advisor context helper
 * 
 * In production, this would read from:
 * - JWT token claims
 * - Session storage
 * - Request headers
 * 
 * For now, defaults to 'ADV-001' but can be overridden via env var
 */

export function getCurrentAdvisorId(): string {
  // TODO: Read from auth token/session in production
  return process.env.DEFAULT_ADVISOR_ID || "ADV-001";
}

export function getCurrentTenantId(): string {
  // TODO: Read from auth token/session in production
  return process.env.DEFAULT_TENANT_ID || "TENANT-001";
}

