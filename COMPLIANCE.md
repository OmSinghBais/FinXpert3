## Compliance Playbook

This document captures baseline controls covering both insurance onboarding
(IRDAI) and mutual fund (MF) marketing campaigns (SEBI/AMFI). Update these
sections as you add partners or receive new regulator circulars.

---

### 1. Insurance Onboarding (IRDAI Scope)

| Control | Implementation Notes |
| --- | --- |
| **Regulator tagging** | Mark every insurance adapter/log entry with `regulator: IRDAI` so audit exports can be filtered quickly. |
| **Client consent** | Collect explicit digital consent before hitting insurer APIs; store a signed payload or PDF hash per client. |
| **Audit logging** | Extend `agent_logs` (or create `transaction_logs`) to capture request payload metadata, advisor ID, client ID, and response codes. Retain for **7 years** per IRDAI guidance. |
| **Encryption & transport** | Keep data encrypted at rest (Supabase Postgres + cloud KMS) and enforce HTTPS/TLS 1.2+ for all calls. |
| **Access control & RLS** | Add `advisor_id` / `tenant_id` columns to insurance tables and update RLS policies so advisors only see their clients’ policies. |
| **Periodic reviews** | Schedule quarterly IRDAI compliance reviews; document incident reporting timelines and owners. |

Immediate next steps:
1. Create (or extend) a `transaction_logs` table with regulator + provider metadata and seven-year retention.
2. Update insurance adapters to require a `consent_record_id`.
3. Assign an IRDAI liaison in the ops playbook.

---

### 2. Mutual Fund Campaigns (SEBI / AMFI Scope)

| Control | Implementation Notes |
| --- | --- |
| **Template approval** | Only send SEBI/AMFI-approved templates (WhatsApp/SMS/email). Store template IDs + approval references in Supabase. |
| **Opt-in tracking** | Log opt-in/opt-out per channel, tie it to the advisor + client record, and block sends for non-consenting clients. |
| **Attribution** | When an advisor triggers a campaign, log advisor ID, client segment, template ID, and delivery status for SEBI audits. |
| **Rate/frequency limits** | Implement throttling aligned with AMFI guidance (e.g., no more than N promotional pings per week). |
| **RLS & masking** | Campaign tables must include `advisor_id` / `tenant_id` and enforce RLS. Mask PII in aggregate analytics dashboards. |
| **Monitoring** | Stream campaign send logs to the monitoring stack (Slack/Logflare) and set alerts for delivery failures or policy violations. |

Immediate next steps:
1. Extend `campaign_templates` with `template_id`, `approval_ref`, and `regulator`.
2. Create a `campaign_sends` table capturing advisor ID, client ID, channel, template ID, opt-in state, and outcomes.
3. Add API routes that enforce opt-in + rate limits before dispatching WhatsApp/SMS/email.

---

### Summary Checklist
- [ ] Add regulator metadata + retention policy to logging schema.
- [ ] Implement consent capture & storage before insurance data pulls.
- [ ] Introduce `advisor_id` / `tenant_id` columns + RLS for all sensitive tables.
- [ ] Track template approvals, opt-ins, and per-advisor send limits.
- [ ] Document quarterly compliance review cadence and owners.

