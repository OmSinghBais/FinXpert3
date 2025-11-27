import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";

const LoanTransactionSchema = z.object({
  clientId: z.string(),
  loanProductCode: z.string(),
  transactionType: z.enum(["DISBURSEMENT", "REPAYMENT", "PREPAYMENT"]),
  amount: z.number().positive(),
});

export async function POST(request: Request) {
  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase credentials missing" },
      { status: 500 },
    );
  }

  const payload = LoanTransactionSchema.parse(await request.json());
  const advisorId = getCurrentAdvisorId();

  // Verify client belongs to advisor
  const { data: clientData, error: clientError } = await client
    .from("clients")
    .select("id")
    .eq("id", payload.clientId)
    .eq("advisor_id", advisorId)
    .single();

  if (clientError || !clientData) {
    return NextResponse.json(
      { error: "Client not found or access denied" },
      { status: 404 },
    );
  }

  // Loan partner API integration
  const loanApiKey = process.env.LOAN_PARTNER_API_KEY;
  if (!loanApiKey) {
    return NextResponse.json(
      { error: "Loan partner API not configured" },
      { status: 500 },
    );
  }

  try {
    // Call loan partner API (replace with actual endpoint)
    const transactionResponse = await fetch(
      "https://api.loanpartner.com/v1/transactions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loanApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: payload.clientId,
          loan_product_code: payload.loanProductCode,
          transaction_type: payload.transactionType,
          amount: payload.amount,
        }),
      },
    );

    if (!transactionResponse.ok) {
      const error = await transactionResponse.json();
      return NextResponse.json(
        { error: error.message || "Transaction failed" },
        { status: transactionResponse.status },
      );
    }

    const transactionData = await transactionResponse.json();

    // Log transaction in Supabase
    await client.from("transactions").insert({
      client_id: payload.clientId,
      advisor_id: advisorId,
      product_code: payload.loanProductCode,
      transaction_type: payload.transactionType,
      amount: payload.amount,
      status: "COMPLETED",
      external_transaction_id: transactionData.transaction_id,
      metadata: transactionData,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      transactionId: transactionData.transaction_id,
      status: "COMPLETED",
    });
  } catch (error) {
    console.error("Loan transaction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Transaction failed",
      },
      { status: 500 },
    );
  }
}

