"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner, ErrorAlert, SuccessAlert } from "@/components/ui/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type TransactionType = "MUTUAL_FUND" | "LOAN";
type MFTransactionType = "PURCHASE" | "REDEMPTION" | "SWITCH";
type LoanTransactionType = "DISBURSEMENT" | "REPAYMENT" | "PREPAYMENT";

export default function NewTransactionPage() {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<TransactionType>("MUTUAL_FUND");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const clientId = formData.get("clientId") as string;
    const productCode = formData.get("productCode") as string;
    const amount = parseFloat(formData.get("amount") as string);

    try {
      const endpoint =
        transactionType === "MUTUAL_FUND"
          ? "/api/transactions/mutual-fund"
          : "/api/transactions/loan";

      const payload =
        transactionType === "MUTUAL_FUND"
          ? {
              clientId,
              productCode,
              transactionType: formData.get("mfTransactionType") as MFTransactionType,
              amount,
              folioNumber: formData.get("folioNumber") as string | undefined,
            }
          : {
              clientId,
              loanProductCode: productCode,
              transactionType: formData.get("loanTransactionType") as LoanTransactionType,
              amount,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transaction failed");
      }

      setSuccess(`Transaction completed! ID: ${data.transactionId}`);
      setTimeout(() => {
        router.push("/transactions");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-16 text-white">
      <main className="mx-auto w-full max-w-3xl px-4">
        <Link
          href="/transactions"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transactions
        </Link>

        <div className="rounded-3xl bg-slate-900/80 p-8 shadow-2xl">
          <h1 className="mb-2 text-3xl font-semibold text-white">
            New Transaction
          </h1>
          <p className="mb-8 text-slate-400">
            Execute mutual fund or loan transactions
          </p>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
          {success && (
            <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />
          )}

          <div className="mb-6 flex gap-4">
            <button
              type="button"
              onClick={() => setTransactionType("MUTUAL_FUND")}
              className={`flex-1 rounded-xl px-4 py-3 font-semibold transition ${
                transactionType === "MUTUAL_FUND"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Mutual Fund
            </button>
            <button
              type="button"
              onClick={() => setTransactionType("LOAN")}
              className={`flex-1 rounded-xl px-4 py-3 font-semibold transition ${
                transactionType === "LOAN"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Loan
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Client ID
              </label>
              <input
                type="text"
                name="clientId"
                required
                placeholder="CLT-001"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Product Code
              </label>
              <input
                type="text"
                name="productCode"
                required
                placeholder={transactionType === "MUTUAL_FUND" ? "MF-BAL-01" : "LOAN-HL-01"}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {transactionType === "MUTUAL_FUND" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Transaction Type
                </label>
                <select
                  name="mfTransactionType"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="PURCHASE">Purchase</option>
                  <option value="REDEMPTION">Redemption</option>
                  <option value="SWITCH">Switch</option>
                </select>
              </div>
            )}

            {transactionType === "LOAN" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Transaction Type
                </label>
                <select
                  name="loanTransactionType"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="DISBURSEMENT">Disbursement</option>
                  <option value="REPAYMENT">Repayment</option>
                  <option value="PREPAYMENT">Prepayment</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                required
                min="1"
                step="0.01"
                placeholder="10000"
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {transactionType === "MUTUAL_FUND" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Folio Number (Optional)
                </label>
                <input
                  type="text"
                  name="folioNumber"
                  placeholder="FOLIO123"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-6 py-4 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processing...
                </>
              ) : (
                "Execute Transaction"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

