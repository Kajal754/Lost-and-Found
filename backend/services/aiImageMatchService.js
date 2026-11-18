function enabled() {
  return process.env.AI_IMAGE_MATCH_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY);
}

async function compareItemPhotos(lostItem, foundItem) {
  if (!enabled()) return null;
  const lostImage = lostItem.images?.[0] || lostItem.image;
  const foundImage = foundItem.images?.[0] || foundItem.image;
  if (typeof lostImage !== "string" || typeof foundImage !== "string" || !lostImage.startsWith("data:image/") || !foundImage.startsWith("data:image/")) return null;
  // Keep old, uncompressed uploads out of provider calls; new uploads are resized in the browser.
  if (lostImage.length > 1_500_000 || foundImage.length > 1_500_000) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-4.1-mini",
        store: false,
        max_output_tokens: 100,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "Compare the two item photos for whether they show the same physical object. Ignore background and camera angle. Return only JSON: {\"similarity\": integer from 0 to 100}. Do not use titles or descriptions; judge visible object identity and details only." },
            { type: "input_image", image_url: lostImage, detail: "low" },
            { type: "input_image", image_url: foundImage, detail: "low" },
          ],
        }],
      }),
    });
    if (!response.ok) {
      console.warn(`AI photo match unavailable (HTTP ${response.status}); using local visual matching.`);
      return null;
    }
    const payload = await response.json();
    const responseText = payload.output_text || (payload.output || []).flatMap((item) => item.content || []).filter((part) => part.type === "output_text").map((part) => part.text).join("\n");
    const output = String(responseText || "").match(/\{[^{}]*\}/)?.[0];
    if (!output) return null;
    const similarity = Number(JSON.parse(output).similarity);
    return Number.isFinite(similarity) ? Math.max(0, Math.min(100, Math.round(similarity))) : null;
  } catch (error) {
    console.warn("AI photo match unavailable; using local visual matching.", error.message);
    return null;
  }
}

module.exports = { compareItemPhotos };
