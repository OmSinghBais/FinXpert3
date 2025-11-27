import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/serverClient";
import { getCurrentAdvisorId } from "@/lib/advisorContext";
import { sendWhatsAppMessage } from "@/lib/messaging/whatsapp";
import { sendSMS } from "@/lib/messaging/sms";
import { sendEmail } from "@/lib/messaging/email";

const SendCampaignSchema = z.object({
  templateId: z.string().uuid(),
  clientIds: z.array(z.string()),
  channel: z.enum(["WhatsApp", "SMS", "Email"]),
});

export async function POST(request: Request) {
  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase credentials missing" },
      { status: 500 },
    );
  }

  const payload = SendCampaignSchema.parse(await request.json());
  const advisorId = await getCurrentAdvisorId();

  // Fetch template
  const { data: template, error: templateError } = await client
    .from("campaign_templates")
    .select("channel, title, body, cta")
    .eq("id", payload.templateId)
    .eq("advisor_id", advisorId)
    .single();

  if (templateError || !template) {
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 },
    );
  }

  // Fetch clients
  const { data: clients, error: clientsError } = await client
    .from("clients")
    .select("id, name, email")
    .in("id", payload.clientIds)
    .eq("advisor_id", advisorId);

  if (clientsError || !clients) {
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }

  // Send messages
  const results = await Promise.all(
    clients.map(async (client) => {
      const personalizedBody = template.body
        .replace(/{{name}}/g, client.name)
        .replace(/{{clientId}}/g, client.id);

      let result;
      switch (payload.channel) {
        case "WhatsApp":
          result = await sendWhatsAppMessage({
            to: `+91${client.id}`, // Replace with actual phone number field
            message: personalizedBody,
            templateId: undefined, // Use approved template ID if available
          });
          break;
        case "SMS":
          result = await sendSMS({
            to: `+91${client.id}`, // Replace with actual phone number field
            message: personalizedBody,
          });
          break;
        case "Email":
          result = await sendEmail({
            to: client.email || "",
            toName: client.name,
            subject: template.title,
            html: personalizedBody,
            text: personalizedBody,
          });
          break;
      }

      // Log campaign send
      await client.from("campaign_sends").insert({
        template_id: payload.templateId,
        client_id: client.id,
        channel: payload.channel,
        advisor_id: advisorId,
        status: result.success ? "SENT" : "FAILED",
        error: result.error,
        sent_at: new Date().toISOString(),
      });

      return {
        clientId: client.id,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    }),
  );

  return NextResponse.json({
    success: true,
    results,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  });
}

