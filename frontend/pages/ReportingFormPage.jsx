import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lock, Send, ShieldCheck, Info } from 'lucide-react';
import { api } from '../services/api';
import AttachmentInput from '../components/AttachmentInput';

const ReportingFormPage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);

  const mutation = useMutation({
    mutationFn: async () => {
      return api.createReport(subject, message, files);
    },
    onSuccess: (data) => {
      // Navigate to success page with secret key
      // We pass the key in state to avoid putting it in URL query params if possible, 
      // but query params are requested by the prompt structure "GET /thanks?secret_key=XXX"
      // I will follow the prompt's URL structure for strict compliance.
      navigate(`/thanks?secret_key=${data.secret_key}`);
    },
    onError: () => {
      toast.error('Failed to submit report. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || message.length < 10) {
      toast.error('Please fill in all required fields.');
      return;
    }
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className={`
                w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-semibold text-lg shadow-md hover:shadow-lg transition-all
                ${mutation.isPending ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}
              `}
            >
              {mutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Encrypting & Sending...
                </span>
              ) : (
                <span className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Submit Securely
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportingFormPage;
