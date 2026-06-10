import type { NextApiRequest, NextApiResponse } from "next";

const PI_API_URL = "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({ error: "Missing paymentId or txid" });
  }

  console.log(`[Payment/Complete] Completing payment: ${paymentId} tx: ${txid}`);

  // Dev sandbox: simulate completion and asset delivery
  if (!PI_API_KEY) {
    console.log("[Payment/Complete] No PI_API_KEY set — sandbox completion. Delivering digital asset...");
    return res.status(200).json({
      success: true,
      sandbox: true,
      paymentId,
      txid,
      balanceUpdated: true,
    });
  }

  try {
    const response = await fetch(`${PI_API_URL}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Payment/Complete] Pi API error:", errorText);
      return res.status(502).json({ error: "Pi Network completion failed", details: errorText });
    }

    const data = await response.json();
    console.log(`[Payment/Complete] Verified tx ${txid}. Delivering asset...`);

    return res.status(200).json({ success: true, data, balanceUpdated: true });
  } catch (error: any) {
    console.error("[Payment/Complete] Network error:", error.message);
    return res.status(500).json({ error: "Completion pipeline failed." });
  }
}
