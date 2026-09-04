import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import CrewDashboard from './pages/CrewDashboard';
import DroneDashboard from './pages/DroneDashboard';
import ReportDetail from './pages/ReportDetail';
import WorkOrderDetail from './pages/WorkOrderDetail';
import DemoMode from './pages/DemoMode';
import Layout from './components/Layout';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/citizen" element={<ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/authority" element={<ProtectedRoute roles={['authority', 'admin']}><AuthorityDashboard /></ProtectedRoute>} />
        <Route path="/crew" element={<ProtectedRoute roles={['crew']}><CrewDashboard /></ProtectedRoute>} />
        <Route path="/drone" element={<ProtectedRoute roles={['authority', 'admin']}><DroneDashboard /></ProtectedRoute>} />
        <Route path="/demo" element={<ProtectedRoute><DemoMode /></ProtectedRoute>} />
        <Route path="/reports/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />
        <Route path="/workorders/:id" element={<ProtectedRoute><WorkOrderDetail /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

function Home() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'citizen') return <Navigate to="/citizen" />;
  if (user.role === 'authority' || user.role === 'admin') return <Navigate to="/authority" />;
  if (user.role === 'crew') return <Navigate to="/crew" />;
  return null;
}
