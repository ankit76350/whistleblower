import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { ReportStatus } from '../services/mockBackend';
import StatusBadge from '../components/StatusBadge';
import AttachmentInput from '../components/AttachmentInput';

const AdminCasePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [replyText, setReplyText] = useState('');
  const [files, setFiles] = useState([]);

  const { data: report, isLoading } = useQuery({
    queryKey: ['report-admin', id],
    queryFn: () => api.getReport(id),
  });

  const replyMutation = useMutation({
    mutationFn: () => api.replyToReport(id, replyText, 'admin', files),
    onSuccess: () => {
      setReplyText('');
      setFiles([]);
      toast.success('Reply sent');
      queryClient.invalidateQueries({ queryKey: ['report-admin', id] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.updateReportStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['report-admin', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    }
  });

  if (isLoading || !report) return <div className="p-10 text-center">Loading case...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/admin/inbox')}
        className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Inbox
      </button>

      {/* Admin Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{report.subject}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>ID: {report.report_id}</span>
            <span>•</span>
            <span>{new Date(report.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          <select
            value={report.status}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            className="border border-slate-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
          >
            {Object.values(ReportStatus).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Thread */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-6 mb-6 space-y-6">
        {report.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-4 shadow-sm ${msg.from === 'admin' ? 'bg-white border border-slate-200' : 'bg-blue-50 border border-blue-100'}`}>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className={`text-xs font-bold uppercase ${msg.from === 'admin' ? 'text-slate-700' : 'text-blue-700'}`}>
                  {msg.from === 'admin' ? 'Compliance Team (You)' : 'Reporter'}
                </span>
                <span className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap">{msg.text}</p>
              {/* Admin Attachment View */}
              {msg.attachments?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="flex items-center p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                      <div className="font-medium truncate flex-1">{att.name}</div>
                      <div className="text-slate-400 ml-2">{(att.size / 1024).toFixed(0)}KB</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="flex items-center text-sm font-semibold text-slate-700 mb-3">
          <Shield className="w-4 h-4 mr-2" />
          Official Response
        </h3>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] mb-4"
          placeholder="Write an official response..."
        />
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <AttachmentInput files={files} onChange={setFiles} />
          </div>
          <button
            onClick={() => replyMutation.mutate()}
            disabled={replyMutation.isPending || !replyText.trim()}
            className="ml-4 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCasePage;
