/**
 * Auth Controller
 */
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");
const { Users } = require("../models");
const { apiError } = require("../utils/errors");
function signToken(userId) { return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" }); }
async function signup(req, res) {
  const { name, email, password, role, phone } = req.body || {};
  if (!name || !email || !password || !role) return apiError(res, 400, "VALIDATION_ERROR", "name, email, password, and role are required");
  if (!["citizen", "authority", "crew", "admin"].includes(role)) return apiError(res, 400, "VALIDATION_ERROR", "role must be citizen, authority, crew, or admin");
  if (Users.findByEmail(email)) return apiError(res, 409, "VALIDATION_ERROR", "Email already registered");
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = Users.create({ name, email, phone, role });
  user._passwordHash = hashedPassword;
  res.status(201).json({ token: signToken(user.id), user });
}
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return apiError(res, 400, "VALIDATION_ERROR", "email and password are required");
  const user = Users.findByEmail(email);
  if (!user) return apiError(res, 401, "UNAUTHORIZED", "Invalid email or password");
  if (user._passwordHash) { const valid = await bcrypt.compare(password, user._passwordHash); if (!valid) return apiError(res, 401, "UNAUTHORIZED", "Invalid email or password"); }
  res.json({ token: signToken(user.id), user });
}
function me(req, res) { res.json(req.user); }
module.exports = { signup, login, me };
