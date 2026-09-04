/**
 * AI Service Client
 */
const axios = require("axios");
const config = require("../config");
async function runDetection(imageUrl) {
  try { const response = await axios.post(`${config.aiServiceUrl}/detect`, { image_url: imageUrl }, { timeout: 10000 }); return { ...response.data, source_type: "MODEL" }; }
  catch (err) { console.warn(`[AI SERVICE] Unreachable. Using mock inference.`); return mockDetection(imageUrl); }
}
function mockDetection(imageUrl) {
  const hash = imageUrl.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const isPothole = hash % 3 !== 2;
  const confidence = 0.75 + (hash % 20) / 100;
  const x = 0.2 + (hash % 30) / 100; const y = 0.35 + (hash % 25) / 100; const w = 0.15 + (hash % 15) / 100; const h = 0.1 + (hash % 10) / 100;
  return { damage_type: isPothole ? "pothole" : "crack", confidence: Math.round(confidence * 100) / 100, bounding_box: [Math.round(x * 100) / 100, Math.round(y * 100) / 100, Math.round(w * 100) / 100, Math.round(h * 100) / 100], num_detections: 1, source_type: "DEMO", note: "Mock inference - start AI service for real detection." };
}
module.exports = { runDetection };
