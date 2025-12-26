import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useStore } from '../store';

const SecretKeyLoginPage = () => {
  const [inputKey, setInputKey] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const setStoreKey = useStore((state) => state.setSecretKey);

  const mutation = useMutation({
    mutationFn: (key) => api.lookupReport(key),
    onSuccess: (data, variables) => {
      // If remember me is checked, save to session store
      if (remember) {
        setStoreKey(variables);
      } else {
        setStoreKey(null);
      }
      navigate(`/case/${data.reportId}`, { state: { secretKey: variables } });
    },
    onError: () => {
      toast.error('Report not found. Please check your Secret Key.');
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    mutation.mutate(inputKey.trim());
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Check Status</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your Secret Key to view your report.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="secretKey" className="sr-only">Secret Key</label>
            <input
              id="secretKey"
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-center placeholder-slate-400"
              placeholder="Paste your Secret Key here"
              required
            />
          </div>

          <div className="flex items-center justify-center">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-slate-600">
              Remember in this browser session
            </label>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex items-center justify-center py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-70"
          >
            {mutation.isPending ? 'Verifying...' : 'Access Report'}
            {!mutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecretKeyLoginPage;
