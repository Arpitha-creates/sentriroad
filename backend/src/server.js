/**
 * SENTRIROAD BACKEND - MAIN SERVER
 */
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const morgan = require("morgan");
const ROOT = path.resolve(__dirname, "..");
const config = require(path.join(ROOT, "config"));
const { setIo } = require(path.join(ROOT, "services", "notification"));
const authRoutes = require(path.join(ROOT, "routes", "auth"));
const reportRoutes = require(path.join(ROOT, "routes", "reports"));
const workOrderRoutes = require(path.join(ROOT, "routes", "workorders"));
const metricsRoutes = require(path.join(ROOT, "routes", "metrics"));
const uploadRoutes = require(path.join(ROOT, "routes", "uploads"));
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST", "PATCH"] } });
io.on("connection", (socket) => {
  console.log(`[SOCKET.IO] Connected: ${socket.id}`);
  socket.on("join_role", (role) => { socket.join(role); console.log(`[SOCKET.IO] ${socket.id} joined: ${role}`); });
  socket.on("disconnect", () => console.log(`[SOCKET.IO] Disconnected: ${socket.id}`));
});
setIo(io);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.get("/", (req, res) => { res.json({ status: "ok", service: "sentriroad-backend", version: "1.0.0", prefix: "/api/v1", ai_service: config.aiServiceUrl }); });
const PREFIX = "/api/v1";
app.use(`${PREFIX}/auth`, authRoutes);
app.use(`${PREFIX}/uploads`, uploadRoutes);
app.use(`${PREFIX}/reports`, reportRoutes);
app.use(`${PREFIX}/workorders`, workOrderRoutes);
app.use(`${PREFIX}/metrics`, metricsRoutes);
app.use(`${PREFIX}`, metricsRoutes);
app.use((req, res) => { res.status(404).json({ error: { code: "NOT_FOUND", message: `Route not found: ${req.method} ${req.path}` } }); });
app.use((err, req, res, next) => { console.error("[UNHANDLED ERROR]", err); res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }); });
server.listen(config.port, () => {
  console.log(`\n  SentriRoad Backend running on http://localhost:${config.port}${PREFIX}`);
  console.log(`  AI Service: ${config.aiServiceUrl}`);
  console.log(`  Socket.IO: enabled\n`);
});
module.exports = { app, server, io };
