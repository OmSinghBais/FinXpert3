/**
 * Email integration via SendGrid
 */

export type EmailMessage = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
};

export type EmailResponse = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendEmail(message: EmailMessage): Promise<EmailResponse> {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.warn(
      "SendGrid API key missing. Add SENDGRID_API_KEY to .env.local",
    );
    return {
      success: false,
      error: "SendGrid API key not configured",
    };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: message.to,
                name: message.toName,
              },
            ],
            subject: message.subject,
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "noreply@finxpert.com",
          name: "FinXpert",
        },
        content: [
          {
            type: "text/html",
            value: message.html,
          },
          ...(message.text
            ? [
                {
                  type: "text/plain",
                  value: message.text,
                },
              ]
            : []),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("SendGrid API error:", error);
      return {
        success: false,
        error: error || "Failed to send email",
      };
    }

    // SendGrid returns 202 Accepted with message ID in headers
    const messageId = response.headers.get("x-message-id");
    return {
      success: true,
      messageId: messageId || undefined,
    };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

