import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";

const TransactionSchema = z.object({
  clientId: z.string(),
  productCode: z.string(),
  transactionType: z.enum(["PURCHASE", "REDEMPTION", "SWITCH"]),
  amount: z.number().positive(),
  folioNumber: z.string().optional(),
});

export async function POST(request: Request) {
  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase credentials missing" },
      { status: 500 },
    );
  }

  const payload = TransactionSchema.parse(await request.json());
  const advisorId = await getCurrentAdvisorId();

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

  // BSE Star MF API integration
  const bseApiKey = process.env.BSE_STAR_API_KEY;
  if (!bseApiKey) {
    return NextResponse.json(
      { error: "BSE Star API not configured" },
      { status: 500 },
    );
  }

  try {
    // Call BSE Star API (replace with actual endpoint)
    const transactionResponse = await fetch(
      "https://api.bseindia.com/BseStarAPI/Transaction",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bseApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: payload.clientId,
          scheme_code: payload.productCode,
          transaction_type: payload.transactionType,
          amount: payload.amount,
          folio_number: payload.folioNumber,
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
      product_code: payload.productCode,
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
    console.error("Transaction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Transaction failed",
      },
      { status: 500 },
    );
  }
}

