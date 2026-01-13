import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { useTranslation } from 'react-i18next';
import { Send, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import AttachmentInput from '../components/AttachmentInput';
import Modal from '../components/Modal';
import { useWebSocket } from '../hooks/useWebSocket';
import FilePreviewModal from '../components/FilePreviewModal';

// Backend status values (uppercase)
const BackendStatus = {
  New: 'NEW',
  Received: 'RECEIVED',
  InProgress: 'IN_PROGRESS',
  Closed: 'CLOSED',
  Canceled: 'CANCELED',
};

// Convert Unix timestamp (seconds) to date string
const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

const AdminCasePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAuth();

  // Get user's email from Cognito JWT
  const userEmail = auth.user?.profile?.email;

  const [replyText, setReplyText] = useState('');
  const [files, setFiles] = useState([]);



  // Modal State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');

  // First, fetch all tenants to find the one matching the user's email
  const { data: tenants, isLoading: isLoadingTenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: api.getTenants,
    enabled: !!userEmail,
  });

  // Find tenant that matches the logged-in user's email
  const userTenant = tenants?.find(t => t.email === userEmail);
  const tenantId = userTenant?.tenantId;

  // Then fetch the report for this tenant
  const { data, isLoading: isLoadingReport } = useQuery({
    queryKey: ['report-admin', tenantId, id],
    queryFn: () => api.getReport(tenantId, id),
    enabled: !!tenantId, // Only fetch when tenantId is available
  });

  // WebSocket Integration
  const { isConnected, messages: liveMessages, sendMessage } = useWebSocket(
    'wss://98gb1udew7.execute-api.eu-central-1.amazonaws.com/prod/',
    id,
    'ADMIN'
  );

  const replyMutation = useMutation({
    mutationFn: () => api.replyToReport(id, replyText, 'COMPLIANCE_TEAM', files),
    onSuccess: () => {
      // Send message via WebSocket for real-time update
      if (replyText.trim()) {
        sendMessage(replyText);
      }

      setReplyText('');
      setFiles([]);
      toast.success(t('userCase.replySent'));
      queryClient.invalidateQueries({ queryKey: ['report-admin', tenantId, id] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.updateReportStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['report-admin', tenantId, id] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports', tenantId] });
    },
    onError: (error) => {
      console.error('Status update failed:', error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  const isLoading = isLoadingTenants || (tenantId && isLoadingReport);

  if (isLoading || !data) return <div className="p-10 text-center">{t('userCase.loading')}</div>;

  // Extract report and messages from the API response
  const { report, messages } = data;



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
      setPreviewUrl(url);
      setPreviewName(getFileName(key));
      setPreviewOpen(true);
    } catch (error) {
      toast.error('Failed to open file');
    }
  };



  const activeStatus = report.status || BackendStatus.New;
  const formatStatus = (s) => t(`status.${s}`);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/admin/inbox')}
        className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('admin.backToInbox')}
      </button>

      {/* Admin Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{report.subject}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>ID: {report.reportId}</span>
            <span>•</span>
            <span>{formatDate(report.createdAt)}</span>
            {isConnected ? <span className="text-green-500 text-xs font-bold">• {t('userCase.live')}</span> : <span className="text-slate-300 text-xs">• {t('userCase.offline')}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">{t('common.status')}:</span>
          <select
            value={activeStatus}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            className="border border-slate-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
          >
            {Object.values(BackendStatus).map(s => (
              <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Thread */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-6 mb-6 space-y-6">
        {/* Initial Reporter Message (from report.message) */}
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-lg p-4 shadow-sm bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase text-blue-700">
                Reporter
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
          const isAdmin = msg.sender === 'COMPLIANCE_TEAM';
          return (
            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-4 shadow-sm ${isAdmin ? 'bg-white border border-slate-200' : 'bg-blue-50 border border-blue-100'}`}>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className={`text-xs font-bold uppercase ${isAdmin ? 'text-slate-700' : 'text-blue-700'}`}>
                    {isAdmin ? `${t('userCase.complianceTeam')} (${t('userCase.you')})` : 'Reporter'}
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
          return !messages?.some(histMsg =>
            histMsg.message === liveMsg.message &&
            (Date.now() - new Date(histMsg.createdAt * 1000).getTime() < 120000)
          );
        }).map((msg, index) => {
          const sender = msg.sender || (msg.userType === 'ADMIN' ? 'COMPLIANCE_TEAM' : 'REPORTER');
          const isAdmin = sender === 'COMPLIANCE_TEAM' || sender === 'ADMIN';

          return (
            <div key={`live-${index}`} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-4 shadow-sm ${isAdmin ? 'bg-white border border-slate-200' : 'bg-blue-50 border border-blue-100'}`}>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className={`text-xs font-bold uppercase ${isAdmin ? 'text-slate-700' : 'text-blue-700'}`}>
                    {isAdmin ? `${t('userCase.complianceTeam')} (${t('userCase.you')})` : 'Reporter'}
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
          <Shield className="w-4 h-4 mr-2" />
          {t('admin.officialResponse')}
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
            {t('userCase.sendReply')}
          </button>
        </div>
      </div>

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={previewUrl}
        fileName={previewName}
      />
    </div>
  );
};

export default AdminCasePage;