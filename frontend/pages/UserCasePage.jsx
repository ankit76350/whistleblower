import React, { useState } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, FileText, User, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store';
import AttachmentInput from '../components/AttachmentInput';
import StatusBadge from '../components/StatusBadge';
// Removed import from types

const UserCasePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storedKey = useStore((state) => state.currentSecretKey);

  // Key can come from router state (redirect from login) or session store
  const secretKey = location.state?.secretKey || storedKey;

  const [replyText, setReplyText] = useState('');
  const [files, setFiles] = useState([]);

  // 1. Fetch Report Data
  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', id],
    queryFn: () => api.getReport(id),
    enabled: !!id && !!secretKey,
    refetchInterval: 30000, // Poll every 30s
    retry: false,
  });

  const replyMutation = useMutation({
    mutationFn: () => api.replyToReport(id, replyText, 'reporter', files),
    onSuccess: () => {
      setReplyText('');
      setFiles([]);
      toast.success('Reply sent');
      queryClient.invalidateQueries({ queryKey: ['report', id] });
    },
    onError: () => toast.error('Failed to send reply'),
  });

  if (!secretKey) {
    return <Navigate to="/check" replace />;
  }

  if (isLoading) return <div className="text-center py-20">Loading secure thread...</div>;
  if (isError || !report) return <div className="text-center py-20 text-red-600">Error loading report. Session may have expired.</div>;

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{report.subject}</h1>
              <StatusBadge status={report.status} />
            </div>
            <p className="text-sm text-slate-500">
              Report ID: <span className="font-mono">{report.report_id}</span> • Created: {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="space-y-6 mb-8">
        {report.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === 'reporter' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-5 ${msg.from === 'reporter' ? 'bg-blue-50 border border-blue-100 rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none shadow-sm'}`}>
              <div className="flex items-center gap-2 mb-2">
                {msg.from === 'reporter' ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                )}
                <span className={`text-xs font-bold uppercase ${msg.from === 'reporter' ? 'text-blue-700' : 'text-amber-700'}`}>
                  {msg.from === 'reporter' ? 'You' : 'Compliance Team'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap">{msg.text}</p>

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/50 space-y-2">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-600 bg-white/50 p-2 rounded border border-slate-200/50">
                      <FileText className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Post a Reply</h3>
        <form onSubmit={handleReply}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] mb-3"
            placeholder="Type your message here..."
          />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <AttachmentInput files={files} onChange={setFiles} maxFiles={3} />
            </div>
            <button
              type="submit"
              disabled={replyMutation.isPending || !replyText.trim()}
              className="ml-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors disabled:bg-slate-300"
            >
              <Send className="w-4 h-4 mr-2" />
              Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCasePage;
