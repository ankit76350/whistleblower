import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck, Info, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import AttachmentInput from '../components/AttachmentInput';
import Modal from '../components/Modal';

const ReportingFormPage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Get tenant ID from URL params
  const { tenantId } = useParams();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) {
        throw new Error('No tenant ID provided');
      }
      return api.createReport(tenantId, subject, message, files);
    },
    onSuccess: (data) => {
      setShowConfirmModal(false);
      // API returns secretKey (camelCase), not secret_key
      navigate(`/thanks?secret_key=${data.secretKey}`);
    },
    onError: () => {
      setShowConfirmModal(false);
      toast.error('Failed to submit report. Please try again.');
    },
  });

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    if (!subject.trim() || message.length < 10) {
      toast.error('Please fill in all required fields (Message min 10 chars).');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    mutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Secure Reporting Box</h1>
        <p className="text-slate-600">
          Submit your report anonymously. We do not track your IP address, device information, or location.
        </p>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 p-4 mb-6 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
          <ShieldCheck className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-medium">
            Your connection is secure. No cookies are used. Credentials are omitted.
          </p>
        </div>

        <form onSubmit={handleSubmitAttempt} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Safety concern in Warehouse B"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                placeholder="Describe the incident or concern in detail..."
                required
                minLength={10}
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {message.length} chars
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Do not include personal details unless necessary.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Attachments (Optional)</label>
            <AttachmentInput files={files} onChange={setFiles} />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all bg-slate-900 hover:bg-slate-800"
            >
              <Lock className="w-5 h-5 mr-2" />
              Submit Securely
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmit}
        isLoading={mutation.isPending}
        title="Submit this report?"
        type="warning"
        confirmLabel="Yes, Submit Encrypted"
        message={
          <div className="space-y-4">
            <p>You are about to submit an anonymous report regarding:</p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase block">Subject</span>
              <span className="text-sm font-semibold text-slate-800">{subject}</span>
            </div>
            <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>
                <strong>IMPORTANT:</strong> On the next screen, you will receive a <strong>Secret Key</strong>.
                You MUST save it. It is the only way to check for replies or updates.
                We cannot recover it for you.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default ReportingFormPage;