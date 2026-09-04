import { io } from 'socket.io-client';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
let socket = null;
export function connectSocket(token) { if (socket) return socket; socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] }); return socket; }
export function joinRole(role) { if (socket) socket.emit('join_role', role); }
export function onAlert(cb) { if (socket) socket.on('critical_alert', cb); }
export function onStatusChange(cb) { if (socket) socket.on('status_change', cb); }
export function disconnectSocket() { if (socket) { socket.disconnect(); socket = null; } }
export { socket };
