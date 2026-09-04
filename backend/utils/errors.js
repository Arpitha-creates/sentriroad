/**
 * Error helper
 */
function apiError(res, status, code, message) { return res.status(status).json({ error: { code, message } }); }
module.exports = { apiError };
