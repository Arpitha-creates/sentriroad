/**
 * Notification Service
 */
let io = null;
function setIo(socketIo) { io = socketIo; }
function notify(event, payload, targetRole = null) { const n = { event, payload, target_role: targetRole, sent_at: new Date().toISOString() }; console.log(`[NOTIFICATION] ${event} -> ${targetRole || "all"}`); if (io) { if (targetRole) io.to(targetRole).emit(event, payload); else io.emit(event, payload); } return n; }
module.exports = { notify, setIo };
