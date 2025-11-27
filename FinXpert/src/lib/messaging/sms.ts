/**
 * SMS integration via Twilio
 */

export type SMSMessage = {
  to: string; // Phone number with country code
  message: string;
};

export type SMSResponse = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendSMS(message: SMSMessage): Promise<SMSResponse> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn(
      "Twilio credentials missing. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to .env.local",
    );
    return {
      success: false,
      error: "Twilio credentials not configured",
    };
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: message.to,
          Body: message.message,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Twilio API error:", error);
      return {
        success: false,
        error: error.message || "Failed to send SMS",
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.sid,
    };
  } catch (error) {
    console.error("SMS send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

