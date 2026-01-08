import React, { useEffect, useState } from 'react';
import { MockService } from '../services/mockData';
import { Status, SystemEvent } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    waiting: 0,
    hourlyData: [] as any[]
  });

  useEffect(() => {
    const loadStats = async () => {
      const events = await MockService.getEvents();
      const total = events.length;
      const success = events.filter(e => e.status === Status.SUCCESS).length;
      const failed = events.filter(e => e.status === Status.FAILED).length;
      const waiting = events.filter(e => e.status === Status.WAITING || e.status === Status.RUNNING).length;

      // Mock hourly distribution
      const hourlyData = [
        { name: '10:00', events: 12, failed: 1 },
        { name: '11:00', events: 19, failed: 0 },
        { name: '12:00', events: 15, failed: 2 },
        { name: '13:00', events: 25, failed: 1 },
        { name: '14:00', events: 32, failed: 4 },
        { name: '15:00', events: 20, failed: 0 },
      ];

      setStats({ total, success, failed, waiting, hourlyData });
    };
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400">System overview and health metrics.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Events" 
          value={stats.total} 
          icon={Activity} 
          color="text-indigo-400" 
          bg="bg-indigo-400/10" 
          border="border-indigo-400/20"
        />
        <StatCard 
          title="Successful Runs" 
          value={stats.success} 
          icon={CheckCircle} 
          color="text-emerald-400" 
          bg="bg-emerald-400/10" 
          border="border-emerald-400/20"
        />
        <StatCard 
          title="Failed Events" 
          value={stats.failed} 
          icon={AlertTriangle} 
          color="text-rose-400" 
          bg="bg-rose-400/10" 
          border="border-rose-400/20"
        />
        <StatCard 
          title="Pending / Active" 
          value={stats.waiting} 
          icon={Clock} 
          color="text-amber-400" 
          bg="bg-amber-400/10" 
          border="border-amber-400/20"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-6">Event Volume (Last 6 Hours)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hourlyData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#cbd5e1' }}
                  cursor={{fill: '#1e293b'}}
                />
                <Bar dataKey="events" name="Total Events" radius={[4, 4, 0, 0]}>
                   {stats.hourlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#6366f1" />
                    ))}
                </Bar>
                <Bar dataKey="failed" name="Failed" radius={[4, 4, 0, 0]} fill="#fb7185" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-sm">Webhook Latency</span>
                    <span className="text-emerald-400 font-mono font-medium">45ms</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-sm">Queue Depth</span>
                    <span className="text-slate-200 font-mono font-medium">12</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-sm">Success Rate</span>
                    <span className="text-emerald-400 font-mono font-medium">98.2%</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                     <p className="text-xs text-slate-500 leading-relaxed">
                        System performing within normal parameters. No major outages detected in the last 24h.
                     </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<any> = ({ title, value, icon: Icon, color, bg, border }) => (
  <div className={`p-6 rounded-xl border backdrop-blur-sm bg-slate-900/40 ${border}`}>
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${bg}`}>
        <Icon className={color} size={24} />
      </div>
    </div>
  </div>
);
