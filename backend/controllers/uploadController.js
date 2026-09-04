/**
 * Upload Controller
 */
const { apiError } = require("../utils/errors");
function getSignedUrl(req, res) {
  const { filename, content_type } = req.body || {};
  if (!filename || !content_type) return apiError(res, 400, "VALIDATION_ERROR", "filename and content_type are required");
  const filePath = `uploads/${req.user.id}/${Date.now()}-${filename}`;
  res.json({ upload_url: `https://mock-storage.sentriroad.example.com/upload?path=${encodeURIComponent(filePath)}`, file_path: filePath, public_url_after_upload: `https://picsum.photos/seed/${encodeURIComponent(filePath)}/800/600`, expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() });
}
module.exports = { getSignedUrl };
