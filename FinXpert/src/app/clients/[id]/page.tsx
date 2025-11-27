import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientPortfolio } from "@/lib/clients";
import { fetchClientTasks } from "@/lib/adapters";
import { ClientTaskBoard } from "@/components/client/TaskBoard";

type Props = {
  params: {
    id: string;
  };
};

export default async function ClientWorkspace({ params }: Props) {
  const portfolio = await getClientPortfolio(params.id);

  if (!portfolio) {
    notFound();
  }

  const tasks = await fetchClientTasks(params.id);

  return (
    <div className="min-h-screen bg-slate-950 py-14 text-white">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl bg-slate-900/80 p-10 shadow-2xl">
        <section className="flex flex-col gap-4 rounded-2xl bg-slate-900/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">
              Client Workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {portfolio.client.name}
            </h1>
            <p className="text-sm text-slate-300">
              Segment: {portfolio.client.segment} · {portfolio.client.notes}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Back to control tower
          </Link>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Amount invested
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              ₹{portfolio.exposure.invested.toLocaleString("en-IN")}
            </p>
          </article>
          <article className="rounded-2xl bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Current value
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              ₹{portfolio.exposure.current.toLocaleString("en-IN")}
            </p>
          </article>
          <article className="rounded-2xl bg-slate-900/60 p-6">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Product mix
            </p>
            <ul className="mt-3 space-y-1 text-sm text-slate-300">
              {portfolio.productMix.map((mix) => (
                <li key={mix.type}>
                  {mix.count}× {mix.type.replace("_", " ").toLowerCase()}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl bg-slate-900/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Holdings overview
            </h2>
            <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-white">
              {portfolio.positions.length} positions
            </span>
          </div>
          <div className="mt-5 overflow-x-auto rounded-xl border border-white/5">
            <table className="min-w-full text-left text-sm text-slate-100">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Invested</th>
                  <th className="px-4 py-3">Current</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((position) => (
                  <tr
                    key={`${position.productCode}-${position.type}`}
                    className="border-t border-white/5 bg-white/0"
                  >
                    <td className="px-4 py-3">{position.productName}</td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
                      {position.type}
                    </td>
                    <td className="px-4 py-3">
                      ₹{position.amountInvested.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      ₹{position.currentValue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {position.metadata?.recommendation ||
                        position.metadata?.status ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ClientTaskBoard clientId={portfolio.client.id} initialTasks={tasks} />
      </main>
    </div>
  );
}

