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
        max_tokens: 600,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: `You are a concise maritime intelligence analyst. Search for the very latest news on the Strait of Hormuz crisis. Return a tight 3-paragraph intelligence brief (plain HTML with <p> tags and <strong> for key terms). Focus on: (1) latest ship traffic / transit activity, (2) key military/diplomatic developments, (3) economic/market impact. Be factual, concise, max 180 words total. Do NOT use markdown, bullet points, or headers — just 3 <p> blocks.`,
        messages: [{ role: "user", content: `Latest Strait of Hormuz crisis update today ${new Date().toDateString()}?` }]
      })
    });

    const data = await response.json();
    let text = "";
    for (const block of data.content || []) {
      if (block.type === "text") { text = block.text; break; }
    }

    if (!text) return res.status(500).json({ error: "No content returned" });
    if (!text.includes("<p>")) {
      text = text.split("\n\n").filter(Boolean).map(p => `<p>${p.trim()}</p>`).join("");
    }

    res.status(200).json({ html: text, timestamp: new Date().toUTCString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
