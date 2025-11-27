import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";
import { Plus, ArrowRight } from "lucide-react";

type Transaction = {
  id: string;
  client_id: string;
  product_code: string;
  transaction_type: string;
  amount: number;
  status: string;
  external_transaction_id: string | null;
  created_at: string;
};

async function getTransactions(): Promise<Transaction[]> {
  const client = getSupabaseServerClient();
  if (!client) {
    return [];
  }

  const advisorId = await getCurrentAdvisorId();
  const { data, error } = await client
    .from("transactions")
    .select("id, client_id, product_code, transaction_type, amount, status, external_transaction_id, created_at")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data;
}

const statusColors = {
  COMPLETED: "bg-emerald-500/20 text-emerald-200",
  PENDING: "bg-amber-500/20 text-amber-200",
  FAILED: "bg-rose-500/20 text-rose-200",
  CANCELLED: "bg-slate-500/20 text-slate-300",
};

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="min-h-screen bg-slate-950 py-16 text-white">
      <main className="mx-auto w-full max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Transactions</h1>
            <p className="mt-2 text-slate-400">
              View and manage all financial transactions
            </p>
          </div>
          <Link
            href="/transactions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
          >
            <Plus className="h-5 w-5" />
            New Transaction
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/60 p-12 text-center">
            <p className="text-slate-400">No transactions yet</p>
            <Link
              href="/transactions/new"
              className="mt-4 inline-flex items-center gap-2 text-emerald-400 transition hover:text-emerald-300"
            >
              Create your first transaction
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/60">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/5 bg-slate-800/80">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Client</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Product</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Type</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Amount</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-300">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-white/5 transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(txn.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {txn.client_id}
                    </td>
                    <td className="px-6 py-4 text-slate-200">{txn.product_code}</td>
                    <td className="px-6 py-4 text-slate-300">{txn.transaction_type}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      ₹{txn.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[txn.status as keyof typeof statusColors] ||
                          statusColors.PENDING
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {txn.external_transaction_id || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

