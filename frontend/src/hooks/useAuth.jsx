import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const s = localStorage.getItem('sentriroad_user'); const t = localStorage.getItem('sentriroad_token'); if (s && t) setUser(JSON.parse(s)); setLoading(false); }, []);
  async function login(email, password) { const res = await api.post('/auth/login', { email, password }); const { token, user } = res.data; localStorage.setItem('sentriroad_token', token); localStorage.setItem('sentriroad_user', JSON.stringify(user)); setUser(user); return user; }
  function logout() { localStorage.removeItem('sentriroad_token'); localStorage.removeItem('sentriroad_user'); setUser(null); }
  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
