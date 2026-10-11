import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { HistoryPage } from './pages/History';
import { AnalystTriage } from './pages/AnalystTriage';
import { AdminTelemetry } from './pages/AdminTelemetry';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const RoleRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-12 text-center font-mono text-slate-400">Verifying session...</div>;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route
                path="/analyst"
                element={
                  <RoleRoute allowedRoles={['SECURITY_ANALYST', 'ADMIN']}>
                    <AnalystTriage />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminTelemetry />
                  </RoleRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
            ScamShield AI • Enterprise Cyber Threat Engine • Zero-Trust Privacy Redaction Enabled
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
