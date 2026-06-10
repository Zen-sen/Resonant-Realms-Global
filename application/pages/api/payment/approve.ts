import type { NextApiRequest, NextApiResponse } from "next";

const PI_API_URL = "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: "Missing paymentId" });
  }

  console.log(`[Payment/Approve] Approving payment: ${paymentId}`);

  // Dev sandbox: skip real Pi Network API call
  if (!PI_API_KEY) {
    console.log("[Payment/Approve] No PI_API_KEY set — sandbox approval granted.");
    return res.status(200).json({ success: true, sandbox: true, paymentId });
  }

  try {
    const response = await fetch(`${PI_API_URL}/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Payment/Approve] Pi API error:", errorText);
      return res.status(502).json({ error: "Pi Network approval failed", details: errorText });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error("[Payment/Approve] Network error:", error.message);
    return res.status(500).json({ error: "Approval pipeline failed." });
  }
}
