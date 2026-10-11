import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings, Users, ShieldAlert, Activity, CheckCircle2, UserCheck } from 'lucide-react';

export const AdminTelemetry: React.FC = () => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [telRes, userRes] = await Promise.all([
        api.get('/admin/telemetry'),
        api.get('/admin/users'),
      ]);
      setTelemetry(telRes.data);
      setUsers(userRes.data.users || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.post('/admin/users/role', { userId, role: newRole });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Role update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold uppercase mb-1">
          <Settings className="w-3.5 h-3.5" /> System Administration
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Enterprise Security Telemetry & RBAC Management
        </h1>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading System Telemetry...</div>
      ) : (
        <>
          {/* Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Scans</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">
                {telemetry?.telemetry?.totalScans || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Registered Users</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">
                {telemetry?.telemetry?.totalUsers || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Analyst Reviews</span>
                <UserCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">
                {telemetry?.telemetry?.totalReviews || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Critical / High Threats</span>
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-red-400">
                {(telemetry?.telemetry?.riskDistribution?.CRITICAL || 0) + (telemetry?.telemetry?.riskDistribution?.HIGH || 0)}
              </div>
            </div>
          </div>

          {/* User RBAC Management Table */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              User Roles & Permission Management (RBAC)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Current Role</th>
                    <th className="px-4 py-3">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-medium text-slate-200">{u.name}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200"
                        >
                          <option value="USER">USER</option>
                          <option value="SECURITY_ANALYST">SECURITY_ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
