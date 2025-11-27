import { getSupabaseServerClient } from "@/lib/supabase/serverClient";

export type CampaignTemplate = {
  id: string;
  channel: "WhatsApp" | "SMS" | "Email";
  title: string;
  body: string;
  cta?: string | null;
};

const MOCK_CAMPAIGNS: CampaignTemplate[] = [
  {
    id: "tmpl-wa",
    channel: "WhatsApp",
    title: "MF Top-Up Reminder",
    body: "Hi {{name}}, your SIP is on track. Invest an extra ₹5K this month to stay ahead of your retirement target.",
    cta: "Launch WhatsApp Flow",
  },
  {
    id: "tmpl-sms",
    channel: "SMS",
    title: "Loan EMI Alert",
    body: "Reminder: EMI for {{product}} is due on {{date}}. Reply YES to schedule auto-pay.",
    cta: "Send SMS",
  },
  {
    id: "tmpl-email",
    channel: "Email",
    title: "AIF Discovery Call",
    body: "Invite HNI clients to a 15-min call on curated AIF opportunities with higher yield potential.",
    cta: "Send Email",
  },
];

export async function fetchCampaignTemplates(): Promise<CampaignTemplate[]> {
  const client = getSupabaseServerClient();
  if (!client) {
    return MOCK_CAMPAIGNS;
  }

  const { data, error } = await client
    .from("campaign_templates")
    .select("id, channel, title, body, cta")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("campaign_templates query failed, returning mock data", error);
    return MOCK_CAMPAIGNS;
  }

  if (!data) {
    return [];
  }

  return data.map((template) => ({
    id: template.id,
    channel: template.channel,
    title: template.title,
    body: template.body,
    cta: template.cta,
  }));
}

