import React, { useState } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, FileText, User, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store';
import AttachmentInput from '../components/AttachmentInput';
import StatusBadge from '../components/StatusBadge';

// Convert Unix timestamp (seconds) to date string
const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

const UserCasePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storedKey = useStore((state) => state.currentSecretKey);

  // Key can come from router state (redirect from login) or session store
  const secretKey = location.state?.secretKey || storedKey;

  const [replyText, setReplyText] = useState('');
  const [files, setFiles] = useState([]);

  // 1. Fetch Report Data using secretKey
  const { data, isLoading, isError } = useQuery({
    queryKey: ['report', secretKey],
    queryFn: () => api.getReportBySecretKey(secretKey),
    enabled: !!secretKey,
    refetchInterval: 30000, // Poll every 30s
    retry: false,
  });

  const replyMutation = useMutation({
    mutationFn: () => api.replyToReport(data?.report?.reportId, replyText, 'REPORTER', files),
    onSuccess: () => {
      setReplyText('');
      setFiles([]);
      toast.success('Reply sent');
      queryClient.invalidateQueries({ queryKey: ['report', secretKey] });
    },
    onError: () => toast.error('Failed to send reply'),
  });

  if (!secretKey) {
    return <Navigate to="/check" replace />;
  }

  if (isLoading) return <div className="text-center py-20">Loading secure thread...</div>;
  if (isError || !data) return <div className="text-center py-20 text-red-600">Error loading report. Session may have expired.</div>;

  // Extract report and messages from API response
  const { report, messages } = data;

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
              Report ID: <span className="font-mono">{report.reportId.substring(0, 8)}</span> • Created: {formatDate(report.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="space-y-6 mb-8">
        {/* Initial Reporter Message (from report.message) */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl p-5 bg-blue-50 border border-blue-100 rounded-tr-none">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase text-blue-700">You</span>
              <span className="text-xs text-slate-400">{formatDate(report.createdAt)}</span>
            </div>
            <p className="text-slate-800 whitespace-pre-wrap">{report.message}</p>

            {report.attachments && report.attachments.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/50 space-y-2">
                {report.attachments.map((att, i) => (
                  <div key={i} className="flex items-center text-sm text-slate-600 bg-white/50 p-2 rounded border border-slate-200/50">
                    <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="truncate">{att.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Messages */}
        {messages?.map((msg) => {
          const isReporter = msg.sender === 'REPORTER';
          return (
            <div
              key={msg.id}
              className={`flex ${isReporter ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-5 ${isReporter ? 'bg-blue-50 border border-blue-100 rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none shadow-sm'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isReporter ? (
                    <User className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                  )}
                  <span className={`text-xs font-bold uppercase ${isReporter ? 'text-blue-700' : 'text-amber-700'}`}>
                    {isReporter ? 'You' : 'Compliance Team'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">{msg.message}</p>

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
          );
        })}
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
