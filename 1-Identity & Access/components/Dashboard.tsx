import React, { useMemo } from 'react';
import { UserService, AuditService } from '../services/store';
import { GlassCard } from './ui/GlassCard';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Users, UserPlus, Activity, ShieldAlert } from 'lucide-react';
import { Role } from '../types';

export const Dashboard: React.FC = () => {
  const users = UserService.getAll();
  const logs = AuditService.getAll();

  // Calculate stats
  const activeUsers = users.filter(u => u.status === 'active').length;
  const recentLogs = logs.slice(0, 5);

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(Role).forEach(r => counts[r] = 0);
    users.forEach(u => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [users]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">System overview and statistics</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Total Users</p>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Active Now</p>
            <p className="text-2xl font-bold text-white">{activeUsers}</p>
          </div>
        </GlassCard>
        
        <GlassCard className="flex items-center gap-4">
           <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
             <Activity size={24} />
           </div>
           <div>
             <p className="text-sm text-zinc-400">Total Events</p>
             <p className="text-2xl font-bold text-white">{logs.length}</p>
           </div>
         </GlassCard>
         
         <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-500/10 text-red-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Security Alerts</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Chart */}
        <GlassCard className="lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">User Distribution by Role</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleDistribution}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex gap-3 text-sm border-b border-white/5 pb-3 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-zinc-200">{log.details}</p>
                  <div className="flex justify-between items-center mt-1">
                      <p className="text-zinc-500 text-xs">by {log.performerName}</p>
                      <p className="text-zinc-600 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};