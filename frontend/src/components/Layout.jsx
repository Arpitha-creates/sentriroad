import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, ClipboardList, Drone, LogOut, Zap } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const items = [];
  if (user?.role === 'citizen') items.push({ to: '/citizen', label: 'My Reports', icon: ClipboardList });
  if (user?.role === 'authority' || user?.role === 'admin') { items.push({ to: '/authority', label: 'Dashboard', icon: Activity }); items.push({ to: '/drone', label: 'Drone Ops', icon: Drone }); }
  if (user?.role === 'crew') items.push({ to: '/crew', label: 'My Work Orders', icon: ClipboardList });
  items.push({ to: '/demo', label: 'Demo Mode', icon: Zap });
  return (
    <div className="min-h-screen flex bg-sentri-bg">
      <aside className="w-64 bg-sentri-dark text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/10"><Link to="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-sentri-accent flex items-center justify-center font-bold text-sentri-dark">S</div><div><div className="font-bold text-lg leading-none">SentriRoad</div><div className="text-xs text-white/50 mt-0.5">AI Road Inspector</div></div></Link></div>
        <nav className="flex-1 p-4 space-y-1">{items.map(({ to, label, icon: Icon }) => { const active = loc.pathname === to || loc.pathname.startsWith(to + '/'); return <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}><Icon size={18} />{label}</Link>; })}</nav>
        <div className="p-4 border-t border-white/10"><div className="flex items-center justify-between"><div className="min-w-0"><div className="text-sm font-medium truncate">{user?.name}</div><div className="text-xs text-white/40 capitalize">{user?.role}</div></div><button onClick={logout} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white" title="Logout"><LogOut size={16} /></button></div></div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
