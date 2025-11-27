/**
 * WhatsApp Business API integration
 * Supports WhatsApp Cloud API and Business API
 */

export type WhatsAppMessage = {
  to: string; // Phone number with country code (e.g., +919876543210)
  message: string;
  templateId?: string; // For approved templates
};

export type WhatsAppResponse = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendWhatsAppMessage(
  message: WhatsAppMessage,
): Promise<WhatsAppResponse> {
  const apiKey = process.env.WHATSAPP_BUSINESS_API_KEY;
  const phoneId = process.env.WHATSAPP_BUSINESS_PHONE_ID;

  if (!apiKey || !phoneId) {
    console.warn(
      "WhatsApp API credentials missing. Add WHATSAPP_BUSINESS_API_KEY and WHATSAPP_BUSINESS_PHONE_ID to .env.local",
    );
    return {
      success: false,
      error: "WhatsApp API credentials not configured",
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: message.to,
          type: message.templateId ? "template" : "text",
          ...(message.templateId
            ? {
                template: {
                  name: message.templateId,
                  language: { code: "en" },
                },
              }
            : {
                text: { body: message.message },
              }),
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("WhatsApp API error:", error);
      return {
        success: false,
        error: error.error?.message || "Failed to send WhatsApp message",
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

