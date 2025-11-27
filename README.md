# FinXpert3

FinXpert3 is a lightweight financial analytics AI agent scaffold. Use it as
the starting point for prototypes that need quick, explainable insights on
portfolios, risk snapshots, or market summaries.

## Key Ideas (Section 1 Implementation Plan)
- **Modular data adapters**  
  - Create one adapter per provider inside `FinXpert/src/lib/adapters/` (e.g., `mutualFundAdapter.ts`, `loanAdapter.ts`).  
  - Each adapter exposes `fetchData()` returning normalized objects (`{ clientId, productCode, nav, ... }`).  
  - The agent layer only depends on the adapter interface, so swapping APIs never touches prompt logic.
- **Attach data context to AI output**  
  - When calling your LLM helper, pass both the prompt and the structured data payload.  
  - Return a composite object `{ summary, rationale, sourceData }` and surface the `rationale` + key metrics in the UI so advisors see why the model recommended an action.
- **Full logging trail**  
  - Wrap every agent invocation in a logger that captures the adapter input, prompt, model output, and errors via `console.log(JSON.stringify(...))` or your preferred logger.  
  - Pipe logs to CloudWatch/ELK later, but starting with `console.log` keeps local audits trivial.

## Platform Overview
FinXpert is an AI-powered CRM and financial product distribution platform built
for financial advisors, mutual fund distributors, and wealth managers. It helps
firms manage clients, distribute multi-asset products, and grow assets under
management through automation and AI insights.

## Quick Start
1. `cd FinXpert && npm install` to make sure dependencies are fresh.
2. Copy `env.sample` to `.env.local` and paste your Supabase + Gemini keys.
3. `npm run dev` to start the Next.js + Tailwind UI playground.
4. Wire up a data adapter (REST, CSV, DB) and pass its output into the agent.

## Error Handling
Always capture failures and store them through `console.log` for traceability:

```
try {
  await runFinXpertAgent();
} catch (error) {
  console.log('FinXpert3 error:', error);
}
```

Keeping the error trail in `console.log` lets you pipe logs to whichever
observability stack you prefer without changing the code above.

## Supabase Integration
- Configure tables:
  - `product_positions`: columns `client_id`, `product_code`, `product_name`, `type`, `amount_invested`, `current_value`, `metadata` (JSONB).
  - `agent_logs`: columns `created_at` (timestamp), `scope`, `prompt`, `payload` (JSONB), `error`.
- `clients`, `client_tasks`, `compliance_flags`, and `campaign_templates` table DDL lives in `FinXpert/supabase` — run those scripts to hydrate your project.
- Use the REST endpoints under `src/app/api/clients/[id]/tasks` to create/update tasks if you prefer HTTP over direct Supabase calls.
- Populate `product_positions` with rows where `type` is `MUTUAL_FUND` or `LOAN` to replace mock data.
- Provide `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` inside `.env.local`.
- The adapters automatically query Supabase when credentials exist; otherwise they fall back to the seeded mocks and warn via `console`.
- Apply the RLS policies in `FinXpert/supabase/rls_product_positions.sql` and `rls_agent_logs.sql` to keep anon/service roles scoped correctly.
- Use the REST endpoints under `src/app/api/clients/[id]/tasks` to create/update tasks if you prefer HTTP over direct Supabase calls.

## Compliance Checklist
- Review `COMPLIANCE.md` for IRDAI (insurance onboarding) and SEBI/AMFI (MF campaigns) controls.
- Attach regulator tags + consent IDs to every adapter before moving beyond sandbox data.
- Schedule quarterly compliance reviews and document outcomes in your ops runbook.

## LLM Integration
- Set `GEMINI_API_KEY` in `.env.local`.
- The `runFinXpertAgent` helper now calls Gemini (`gemini-1.5-flash`) via `src/lib/llm.ts`, passing the normalized holdings.
- If the key is missing or the API fails, FinXpert falls back to deterministic guidance so the UI never breaks.

## Automated Monitoring
- Supabase trigger script lives in `FinXpert/supabase/agent_log_notifications.sql`.
- Apply it through the SQL editor to broadcast each insert on `agent_logs` via `pg_notify('agent_log_channel', ...)`.
- Subscribe through Supabase Realtime or an Edge Function to forward alerts to Slack/Logflare and add rate-based monitoring.

## What It Does
- AI-driven CRM for onboarding, reminders, and personalized communication
- Distribution hub for mutual funds, loans, insurance, alternate investments
- Automated WhatsApp/SMS/email outreach to keep clients engaged
- AI recommendations to grow AUM and surface cross-sell opportunities
- Unified dashboards to track transactions, portfolios, and compliance

## Key Features
- Multi-product distribution with integrated APIs for one-click transactions
- Smart insights for portfolio optimization and revenue growth
- Automated campaigns and drip journeys across WhatsApp, SMS, and email
- Detailed reports and analytics for performance and engagement tracking
- Responsive web/mobile experience with enterprise-grade security
- Built-in compliance guardrails (SEBI/AMFI alignment, access controls, audit)

## Target Users
- Independent Financial Advisors (IFAs)
- Mutual Fund Distributors (MFDs)
- Wealth managers and relationship managers
- Small and mid-sized advisory firms expanding digital operations

## Value Proposition
- Save time by automating client outreach, onboarding, and reminders
- Grow faster with AI-powered insights tied to AUM and product distribution
- Build trust through consistent, personalized engagement at scale
- Operate smoothly with a unified stack for CRM, transactions, and compliance