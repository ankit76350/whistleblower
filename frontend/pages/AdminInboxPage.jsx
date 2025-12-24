import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Inbox, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { ReportStatus } from '../services/mockBackend';
import StatusBadge from '../components/StatusBadge';
import TimerIndicator from '../components/TimerIndicator';

const AdminInboxPage = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: api.getReports,
  });

  const filteredReports = reports
    ?.filter((r) => filter === 'All' || r.status === filter)
    .filter((r) =>
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.report_id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading inbox...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Case Inbox</h1>
        <div className="flex items-center space-x-2">
          {/* Mock stats */}
          <div className="bg-white px-3 py-1 rounded-md border border-slate-200 text-xs font-semibold text-slate-600">
            Open: {reports?.filter(r => r.status !== ReportStatus.Closed).length || 0}
          </div>
          <div className="bg-red-50 px-3 py-1 rounded-md border border-red-100 text-xs font-semibold text-red-600">
            Overdue: {reports?.filter(r => {
              const diff = Date.now() - new Date(r.created_at).getTime();
              return r.status === ReportStatus.New && diff > 7 * 24 * 60 * 60 * 1000;
            }).length || 0}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-300 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="All">All Statuses</option>
              <option value={ReportStatus.New}>New</option>
              <option value={ReportStatus.InProgress}>In Progress</option>
              <option value={ReportStatus.Resolved}>Resolved</option>
              <option value={ReportStatus.Closed}>Closed</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filteredReports?.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400">
              <Inbox className="w-12 h-12 mb-3 opacity-50" />
              <p>No reports found.</p>
            </div>
          ) : (
            filteredReports?.map((report) => (
              <Link
                key={report.report_id}
                to={`/admin/case/${report.report_id}`}
                className="block p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-2 h-2 mt-2 rounded-full ${report.status === ReportStatus.New ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-400">#{report.report_id}</span>
                        <StatusBadge status={report.status} />
                        <TimerIndicator createdAt={report.created_at} status={report.status} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{report.subject}</h3>
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-md">
                        {report.messages[report.messages.length - 1]?.text.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInboxPage;