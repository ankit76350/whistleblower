import React, { useState } from 'react';
import { useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store';
import AttachmentInput from '../components/AttachmentInput';
import StatusBadge from '../components/StatusBadge';
import { useWebSocket } from '../hooks/useWebSocket';

// Convert Unix timestamp (seconds) to date string
const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

const UserCasePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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

  // WebSocket Integration
  // Use a heuristic or wait for data to get reportId. 
  // We can't init WS until we have reportId.
  const reportId = data?.report?.reportId;
  const { isConnected, messages: liveMessages, sendMessage } = useWebSocket(
    reportId ? 'wss://98gb1udew7.execute-api.eu-central-1.amazonaws.com/prod/' : null,
    reportId,
    'REPORTER'
  );

  const replyMutation = useMutation({
    mutationFn: () => api.replyToReport(data?.report?.reportId, replyText, 'REPORTER', files),
    onSuccess: () => {
      // Send message via WebSocket for real-time update
      if (replyText.trim()) {
        sendMessage(replyText);
      }

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

  if (isLoading) return <div className="p-10 text-center">Loading case...</div>;
  if (isError || !data) return <div className="p-10 text-center text-red-600">Error loading report. Session may have expired.</div>;

  // Extract report and messages from API response
  const { report, messages } = data;

  // Helper to extract filename from S3 key (UUID_filename)
  const getFileName = (key) => {
    if (!key) return 'File';
    const splitIndex = key.indexOf('_');
    if (splitIndex !== -1) {
      return key.substring(splitIndex + 1);
    }
    return key;
  };

  const handleFileClick = async (key) => {
    try {
      const url = await api.getFileUrl(key);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to open file');
    }
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/check')}
        className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Check Status
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{report.subject}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>ID: {report.reportId.substring(0, 8)}</span>
            <span>•</span>
            <span>{formatDate(report.createdAt)}</span>
            {isConnected ? <span className="text-green-500 text-xs font-bold">• Live</span> : <span className="text-slate-300 text-xs">• Offline</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Thread */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-6 mb-6 space-y-6">
        {/* Initial Reporter Message (from report.message) */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg p-4 shadow-sm bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase text-blue-700">
                You
              </span>
              <span className="text-xs text-slate-400">{formatDate(report.createdAt)}</span>
            </div>
            <p className="text-slate-800 whitespace-pre-wrap">{report.message}</p>
            {/* Attachments View */}
            {report.attachments?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.attachments.map((att, i) => (
                  <button
                    key={i}
                    onClick={() => handleFileClick(att)}
                    className="flex items-center p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs text-slate-600 transition-colors text-left"
                  >
                    <div className="font-medium truncate flex-1">{getFileName(att)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Messages */}
        {messages?.map((msg) => {
          const isReporter = msg.sender === 'REPORTER';
          return (
            <div key={msg.id} className={`flex ${isReporter ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-4 shadow-sm ${isReporter ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-slate-200'}`}>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className={`text-xs font-bold uppercase ${isReporter ? 'text-blue-700' : 'text-slate-700'}`}>
                    {isReporter ? 'You' : 'Compliance Team'}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">{msg.message}</p>
                {/* Attachment View */}
                {msg.attachments?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.attachments.map((att, i) => (
                      <button
                        key={i}
                        onClick={() => handleFileClick(att)}
                        className="flex items-center p-2 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs text-slate-600 transition-colors text-left"
                      >
                        <div className="font-medium truncate flex-1">{getFileName(att)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live WebSocket Messages */}
        {liveMessages.filter(liveMsg => {
          // Deduplicate: Don't show live message if it's already in the historical messages
          return !messages?.some(histMsg =>
            histMsg.message === liveMsg.message &&
            (Date.now() - new Date(histMsg.createdAt * 1000).getTime() < 120000) // matches within last 2 mins
          );
        }).map((msg, index) => {
          // Heuristics for sender
          const sender = msg.userType || msg.sender;
          const isReporter = sender === 'REPORTER';

          return (
            <div key={`live-${index}`} className={`flex ${isReporter ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-4 shadow-sm ${isReporter ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-slate-200'}`}>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className={`text-xs font-bold uppercase ${isReporter ? 'text-blue-700' : 'text-slate-700'}`}>
                    {isReporter ? 'You' : 'Compliance Team'}
                  </span>
                  <span className="text-xs text-slate-400">Just now</span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="flex items-center text-sm font-semibold text-slate-700 mb-3">
          <User className="w-4 h-4 mr-2" />
          Your Reply
        </h3>
        <form onSubmit={handleReply}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] mb-4"
            placeholder="Type your message here..."
          />
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <AttachmentInput files={files} onChange={setFiles} maxFiles={3} />
            </div>
            <button
              type="submit"
              disabled={replyMutation.isPending || !replyText.trim()}
              className="ml-4 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCasePage;
