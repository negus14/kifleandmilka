interface SMSRecipient {
  phone: string;
  name: string;
}

interface SMStoResponse {
  success: boolean;
  message: string;
  message_id?: string;
}

export async function sendSMSBroadcast(
  recipients: SMSRecipient[],
  messageBody: string,
  senderId: string
): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.SMSTO_API_KEY;
  if (!apiKey) {
    throw new Error("SMS service not configured. Set SMSTO_API_KEY.");
  }

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    recipients.map((r) =>
      fetch("https://api.sms.to/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          to: r.phone,
          message: messageBody,
          sender_id: senderId,
        }),
      }).then(async (res) => {
        const data = (await res.json()) as SMStoResponse;
        if (!res.ok || !data.success) {
          throw new Error(data.message || `HTTP ${res.status}`);
        }
        return data;
      })
    )
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      sent++;
    } else {
      failed++;
      console.error("[SMS] SMS.to send failed:", result.reason);
    }
  }

  return { sent, failed };
}
