import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MockService } from '../services/mockData';
import { SystemEvent, Status } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Search, Filter, RefreshCw, ChevronRight } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

  const fetchEvents = async () => {
    setLoading(true);
    const data = await MockService.getEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    // Simulate real-time polling
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Events</h1>
          <p className="text-slate-400">Real-time event stream and processing status.</p>
        </div>
        <button 
          onClick={fetchEvents} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search events, clients or types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
        </div>
        <div className="md:col-span-3">
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500/50"
            >
              <option value="all">All Statuses</option>
              <option value={Status.SUCCESS}>Success</option>
              <option value={Status.FAILED}>Failed</option>
              <option value={Status.WAITING}>Waiting</option>
              <option value={Status.RUNNING}>Running</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <th className="px-6 py-4 font-semibold">Event ID</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading events...</td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No events found matching your filters.</td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-300">{event.id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{event.clientId}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(event.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={event.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/events/${event.id}`} 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-900/60 border-t border-slate-800 px-6 py-3 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredEvents.length} events</span>
            <div className="flex gap-2">
                <button className="hover:text-slate-300 disabled:opacity-50" disabled>Previous</button>
                <button className="hover:text-slate-300 disabled:opacity-50" disabled>Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};
