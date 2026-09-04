/**
 * Auth middleware - JWT + role-based access
 */
const jwt = require("jsonwebtoken");
const config = require("../config");
const { Users } = require("../models");
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token" } });
  try { const decoded = jwt.verify(token, config.jwtSecret); const user = Users.findById(decoded.userId); if (!user) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid token" } }); req.user = user; next(); }
  catch (err) { return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }); }
}
function requireRole(...roles) { return (req, res, next) => { if (!roles.includes(req.user.role)) return res.status(403).json({ error: { code: "FORBIDDEN", message: `Requires role: ${roles.join(" or ")}` } }); next(); }; }
module.exports = { requireAuth, requireRole };
