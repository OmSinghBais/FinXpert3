import Link from "next/link";
import { runFinXpertAgent } from "@/lib/agent";
import { fetchCampaignTemplates, fetchComplianceFlags } from "@/lib/adapters";

export default async function Home() {
  const [agentResponse, campaignTemplates, complianceAlerts] = await Promise.all([
    runFinXpertAgent("Surface the most urgent advisor actions for today."),
    fetchCampaignTemplates(),
    fetchComplianceFlags(),
  ]);

  const clientFocus = [
    {
      id: "CLT-001",
      name: "Riya Malhotra",
      opportunity: "Rebalance MF + LAP exposure",
      value: "₹18.5L AUM",
    },
    {
      id: "CLT-002",
      name: "Arjun Sinha",
      opportunity: "Upsell to Hybrid MF + Insurance",
      value: "₹9.2L AUM",
    },
    {
      id: "CLT-003",
      name: "Sanjay Iyer",
      opportunity: "Home Loan rate switch opportunity",
      value: "₹32L liability",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-16 text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl bg-slate-900/80 p-10 shadow-2xl">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            FinXpert Control Tower
          </p>
          <h1 className="text-3xl font-semibold text-white">
            AI snapshot for your book of business
          </h1>
          <p className="text-slate-300">
            Data is mocked until you connect live adapters. The agent summary
            below illustrates how insights + context appear inside the dashboard.
          </p>
        </header>

        <section className="rounded-2xl bg-slate-800/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Summary
          </p>
          <p className="mt-2 text-xl font-medium text-white">
            {agentResponse.summary}
          </p>
          <p className="mt-3 text-sm text-slate-300">
            {agentResponse.rationale}
          </p>
        </section>

        <section className="rounded-2xl bg-slate-800/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Source data
              </p>
              <p className="text-sm text-slate-300">
                Direct feed from modular adapters with console.log audit trail
              </p>
            </div>
            <span className="rounded-full bg-cyan-500/20 px-4 py-1 text-xs font-semibold text-cyan-200">
              {agentResponse.sourceData.length} records
            </span>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-white/5">
            <table className="min-w-full text-left text-sm text-slate-100">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Invested</th>
                  <th className="px-4 py-3">Current</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {agentResponse.sourceData.map((item) => (
                  <tr
                    key={`${item.clientId}-${item.productCode}`}
                    className="border-t border-white/5 bg-white/0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">
                      {item.clientId}
                    </td>
                    <td className="px-4 py-3">{item.productName}</td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
                      {item.type}
                    </td>
                    <td className="px-4 py-3">
                      ₹{item.amountInvested.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      ₹{item.currentValue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {item.metadata?.recommendation ||
                        item.metadata?.status ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {campaignTemplates.map((template) => (
            <article
              key={template.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                {template.channel}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {template.title}
              </h3>
              <p className="mt-3 text-sm text-slate-300">{template.body}</p>
              <button className="mt-4 inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20">
                {template.cta ?? "Launch Campaign"}
              </button>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-rose-300">
                  Compliance Alerts
                </p>
                <p className="text-sm text-slate-300">
                  Hook to `compliance_flags` table later
                </p>
              </div>
              <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-100">
                {complianceAlerts.length} open
              </span>
            </div>
            <ul className="mt-5 space-y-4">
              {complianceAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-xl border border-white/5 bg-slate-800/80 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {alert.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    {alert.description}
                  </p>
                  <span className="mt-3 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {alert.severity} priority
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                  Client Drill-Down
                </p>
                <p className="text-sm text-slate-300">
                  Link to `/clients/[id]` for detailed workflows
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {clientFocus.map((client) => (
                <div
                  key={client.id}
                  className="flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-800/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {client.name}
                    </p>
                    <p className="text-xs text-slate-400">{client.opportunity}</p>
                    <p className="text-xs text-slate-500">{client.value}</p>
                  </div>
                  <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                  >
                    Open Workspace
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
