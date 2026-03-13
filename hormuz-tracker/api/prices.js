export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: `You are a financial data assistant. Search for CURRENT prices of Brent crude oil, WTI crude oil, EU natural gas TTF, and US average retail gasoline. Return ONLY a valid JSON object with no extra text or markdown:
{"brent": <number>, "wti": <number>, "ttf": <number>, "gas": <number>}
Where brent/wti are USD/barrel, ttf is EUR/MWh, gas is USD/gallon. Use only numbers.`,
        messages: [{ role: "user", content: `Current prices for Brent crude, WTI crude, EU TTF natural gas, and US average gasoline today ${new Date().toDateString()}?` }]
      })
    });

    const data = await response.json();
    let prices = null;

    for (const block of data.content || []) {
      if (block.type === "text") {
        try {
          const clean = block.text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          if (parsed.brent) { prices = parsed; break; }
        } catch (e) {
          const b = block.text.match(/brent["\s:]+(\d+\.?\d*)/i);
          const w = block.text.match(/wti["\s:]+(\d+\.?\d*)/i);
          const t = block.text.match(/ttf["\s:]+(\d+\.?\d*)/i);
          const g = block.text.match(/gas["\s:]+(\d+\.?\d*)/i);
          if (b) { prices = { brent: +b[1], wti: w ? +w[1] : null, ttf: t ? +t[1] : null, gas: g ? +g[1] : null }; break; }
        }
      }
    }

    if (!prices) return res.status(500).json({ error: "Could not parse prices" });
    res.status(200).json({ prices, timestamp: new Date().toUTCString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
