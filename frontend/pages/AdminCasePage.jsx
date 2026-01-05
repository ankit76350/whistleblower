import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { Send, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import AttachmentInput from '../components/AttachmentInput';
import Modal from '../components/Modal';
import { useWebSocket } from '../hooks/useWebSocket';

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

// Convert backend status (e.g., IN_PROGRESS) to human-readable format
const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\B\w+/g, c => c.toLowerCase());
};

const AdminCasePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAuth();

  // Get user's email from Cognito JWT
  const userEmail = auth.user?.profile?.email;

  const [replyText, setReplyText] = useState('');
  const [files, setFiles] = useState([]);

  // Status change confirmation state
  const [pendingStatus, setPendingStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

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
      // Note: The backend logic might already broadcast this if triggered by API, 
      // but usually the API and WebSocket are separate. 
      // If the API lambda notifies the connection, we don't need to send it manually here.
      // However, per the user request, "so that they can talk in the real time",
      // and usually with this pattern we send via WS OR API.
      // If we send via API, the API should persist and broadcast.
      // If we send via WS, the WS handler usually persists and broadcasts.
      // The current existing code persists via API.
      // We will assume the API persists, and we use WS just to notify/update OR
      // we just use WS to send message if the backend WS handler does persistence.
      // Given the user said "interrgate... so they can talk in real time",
      // and provided a "sendMessage" action in the test-client HTML,
      // it implies the WS handler handles 'sendMessage'.
      // HOWEVER, the existing code uses `api.replyToReport`.
      // Let's stick to the existing API for persistence and utilize WS for notifications if the backend handles it,
      // OR we can try to send via WS `sendMessage` action which might just broadcast.

      // Let's TRY sending via WS as well to ensure immediate UI update on the other end
      // if the backend API doesn't trigger a WS broadcast.
      // But if the backend 'sendMessage' action broadcasts to everyone including sender, we might get duplicates.
      // Let's assume for now we just listen. If the user meant purely WS chat replacing API, that's a bigger change.
      // But usually "integrate" means add on top.

      // Actually, looking at the test client, it sends a message via WS.
      // Let's use the sendMessage from hook ONLY if we want to bypass HTTP API,
      // but we probably want to keep using HTTP API for persistence (attachments etc) and consistency.
      // UNLESS the user wants the chat to be PURELY WebSocket?
      // "interrgate ... so that they can talk in the real time"

      // If I use `sendMessage` from WS, does it save to DB? The user didn't show the backend code for `SendMessageHandler`.
      // I'll stick to API for saving, and assume I should maybe send a signal or just rely on the other side receiving it?
      // Wait, if the other side is on the same page, they need to receive it.
      // If I am on AdminPage, and I reply via API, the data is saved.
      // Does the backend broadcast this to the User? Unknown.
      // To be safe and ensure real-time "talk", I will use `sendMessage` from WS hook *in addition* 
      // possibly, OR just rely on polling? No, user wants real time.

      // Let's send the text via WS too so it appears instantly on the other side.
      if (replyText.trim()) {
        sendMessage(replyText);
      }

      setReplyText('');
      setFiles([]);
      toast.success('Reply sent');
      queryClient.invalidateQueries({ queryKey: ['report-admin', tenantId, id] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status) => api.updateReportStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['report-admin', tenantId, id] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports', tenantId] });
      setShowStatusModal(false);
      setPendingStatus(null);
    }
  });

  const isLoading = isLoadingTenants || (tenantId && isLoadingReport);

  if (isLoading || !data) return <div className="p-10 text-center">Loading case...</div>;

  // Extract report and messages from the API response
  const { report, messages } = data;

  // Merge historical messages with live messages
  // We need to deduplicate based on ID or content/timestamp if possible.
  // For now, let's just append live messages that render.
  // Note: If `sendMessage` sends via WS and also API saves it, we might get duplicates on reload
  // But for "live" chat unrelated to persistence, or if persistence is slow, this helps.
  // Actually, better to just display live messages at the bottom.

  // Filter out live messages that might be duplicates if we re-fetched them?
  // Let's simpler: Display API messages + Live messages that came AFTER page load.
  // But duplicate handling is tricky without unique IDs.
  // For now, simple append.

  const handleStatusSelect = (newStatus) => {
    if (newStatus === report.status) return;

    // Show warning for final statuses
    if (newStatus === BackendStatus.Closed || newStatus === BackendStatus.Canceled) {
      setPendingStatus(newStatus);
      setShowStatusModal(true);
    } else {
      statusMutation.mutate(newStatus);
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      statusMutation.mutate(pendingStatus);
    }
  };

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
            <span>ID: {report.reportId}</span>
            <span>•</span>
            <span>{formatDate(report.createdAt)}</span>
            {isConnected ? <span className="text-green-500 text-xs font-bold">• Live</span> : <span className="text-slate-300 text-xs">• Offline</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          <select
            value={report.status}
            onChange={(e) => handleStatusSelect(e.target.value)}
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
                  <div key={i} className="flex items-center p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                    <div className="font-medium truncate flex-1">{att.name}</div>
                    <div className="text-slate-400 ml-2">{(att.size / 1024).toFixed(0)}KB</div>
                  </div>
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
                    {isAdmin ? 'Compliance Team (You)' : 'Reporter'}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(msg.createdAt)}</span>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap">{msg.message}</p>
                {/* Attachment View */}
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
          );
        })}

        {/* Live WebSocket Messages */}
        {liveMessages.filter(liveMsg => {
          // Deduplicate: Don't show live message if it's already in the historical messages
          // This prevents "double" messages when polling fetches the message we just received via WS
          return !messages?.some(histMsg =>
            histMsg.message === liveMsg.message &&
            // Simple heuristic logic to match recent duplicates
            (Date.now() - new Date(histMsg.createdAt * 1000).getTime() < 120000) // matches within last 2 mins
          );
        }).map((msg, index) => {
          // Try to determine sender. The message object from WS might have 'sender' or 'userType'
          // If not, we might default to 'Reporter' if we are Admin, unless we sent it?
          // But if we sent it via WS, we receive it back usually?
          // Let's assume the WS message structure.
          // Based on hook, it might be just { message: ... } or parsed JSON.
          // If parsed JSON has 'sender', use it.
          const sender = msg.sender || (msg.userType === 'ADMIN' ? 'COMPLIANCE_TEAM' : 'REPORTER'); // heuristic
          const isAdmin = sender === 'COMPLIANCE_TEAM' || sender === 'ADMIN';

          return (
            <div key={`live-${index}`} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-4 shadow-sm ${isAdmin ? 'bg-white border border-slate-200' : 'bg-blue-50 border border-blue-100'}`}>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className={`text-xs font-bold uppercase ${isAdmin ? 'text-slate-700' : 'text-blue-700'}`}>
                    {isAdmin ? 'Compliance Team (You)' : 'Reporter'}
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

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => { setShowStatusModal(false); setPendingStatus(null); }}
        onConfirm={confirmStatusChange}
        isLoading={statusMutation.isPending}
        title={`Set status to ${formatStatus(pendingStatus)}?`}
        type="warning"
        confirmLabel={`Confirm ${formatStatus(pendingStatus)}`}
        message={
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <p>
                Setting a case to <strong>{formatStatus(pendingStatus)}</strong> typically signals the end of the investigation.
                The whistleblower will see this update immediately using their Secret Key.
              </p>
            </div>
            <p className="text-slate-600 text-sm">
              Are you sure you want to mark this case as <strong>{formatStatus(pendingStatus)}</strong>?
            </p>
          </div>
        }
      />
    </div>
  );
};

export default AdminCasePage;