import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Building2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const data = await api.getTenants();
        // Filter only active tenants
        const activeTenants = data.filter(t => t.active);
        setTenants(activeTenants);
        if (activeTenants.length > 0) {
          setSelectedTenant(activeTenants[0].tenantId);
        }
      } catch (err) {
        console.error('Failed to fetch tenants:', err);
        setError('Failed to load organizations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const handleSubmit = () => {
    if (selectedTenant) {
      navigate(`/company/${selectedTenant}/report`);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="max-w-lg w-full mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Secure Whistleblower Box
          </h1>
          <p className="text-lg text-slate-600">
            Submit confidential reports anonymously. Your identity is protected.
          </p>
        </div>

        {/* Tenant Selection Card */}
        <div className="bg-white shadow-lg border border-slate-200 rounded-2xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">
              Select Organization
            </label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-500">Loading organizations...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm py-4">{error}</div>
            ) : tenants.length === 0 ? (
              <div className="text-slate-500 text-sm py-4">No organizations available</div>
            ) : (
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                >
                  {tenants.map((tenant) => (
                    <option key={tenant.tenantId} value={tenant.tenantId}>
                      {tenant.companyName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedTenant || isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Submit Anonymous Report
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="mt-4 text-xs text-slate-500">
            Your connection is secure. No cookies or tracking used.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
