import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTenants } from '../store/tenantsSlice';
import { Plus, Search, Building2, Mail, Calendar, CheckCircle2, XCircle, Loader2, Edit2, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const AdminTenantsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState(null);

  // Modal State
  const [modalType, setModalType] = useState(null);
  const [pendingTenant, setPendingTenant] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  // New/Edit tenant form state
  const [formData, setFormData] = useState({ email: '', companyName: '' });

  const dispatch = useDispatch();
  const { items: tenants, loading: isLoading, error } = useSelector((state) => state.tenants);

  useEffect(() => {
    dispatch(fetchTenants());
  }, [dispatch]);

  const onMutationSuccess = () => {
    dispatch(fetchTenants());
  };

  const createTenantMutation = useMutation({
    mutationFn: () => api.createTenant(formData.email, formData.companyName),
    onSuccess: () => {
      toast.success('Tenant created successfully');
      onMutationSuccess();
      setIsAdding(false);
      setModalType(null);
      resetForm();
    },
    onError: () => toast.error('Failed to create tenant')
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateTenant(id, data),
    onSuccess: () => {
      toast.success('Tenant updated successfully');
      onMutationSuccess();
      setEditingTenantId(null);
      setModalType(null);
      setPendingTenant(null);
      resetForm();
    },
    onError: () => toast.error('Failed to update tenant')
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (id) => api.deleteTenant(id),
    onSuccess: () => {
      toast.success('Tenant deleted successfully');
      onMutationSuccess();
      setModalType(null);
      setPendingTenant(null);
    },
    onError: () => toast.error('Failed to delete tenant')
  });

  const resetForm = () => setFormData({ email: '', companyName: '' });

  const startEdit = (tenant) => {
    setEditingTenantId(tenant.id);
    setFormData({ email: tenant.email, companyName: tenant.companyName });
    setIsAdding(false);
  };

  // Submission Handlers (Open Modals)
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.companyName) return toast.error('Please fill in all fields');
    setModalType('create');
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingTenantId) return;
    setModalType('update');
  };

  const handleStatusChangeRequest = (tenant, newStatus) => {
    if (tenant.active === newStatus) return;
    setPendingTenant(tenant);
    setPendingStatus(newStatus);
    setModalType('status');
  };

  const handleDeleteRequest = (tenant) => {
    setPendingTenant(tenant);
    setModalType('delete');
  };

  const tenantsList = Array.isArray(tenants) ? tenants : [];
  const filteredTenants = tenantsList.filter(t =>
    t.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tenantId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tenant Management</h1>
          <p className="text-slate-500 text-sm">Manage organizations using the Whistleblower Box.</p>
        </div>
        {!isAdding && !editingTenantId && (
          <button
            onClick={() => { setIsAdding(true); resetForm(); }}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </button>
        )}
      </div>

      {(isAdding || editingTenantId) && (
        <div className="bg-white border border-blue-100 rounded-xl p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {isAdding ? 'Create New Tenant' : 'Update Tenant Info'}
            </h2>
            <button
              onClick={() => { setIsAdding(false); setEditingTenantId(null); resetForm(); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={isAdding ? handleCreateSubmit : handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@company.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-[42px] bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center justify-center transition-all"
              >
                {isAdding ? <Plus className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isAdding ? 'Review & Create' : 'Review & Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Fetching tenants...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500 font-medium">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    Error: {error}
                  </td>
                </tr>
              ) : filteredTenants?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No tenants found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTenants?.map((tenant) => (
                  <tr key={tenant.id} className={`transition-colors group ${editingTenantId === tenant.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-blue-50 transition-colors">
                          <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{tenant.companyName}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">ID: {tenant.tenantId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="w-4 h-4 mr-2 text-slate-400" />
                        {tenant.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={tenant.active ? 'true' : 'false'}
                        onChange={(e) => handleStatusChangeRequest(tenant, e.target.value === 'true')}
                        className={`text-xs font-bold py-1 px-3 rounded-full border outline-none cursor-pointer transition-all ${tenant.active
                          ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-500'
                          : 'bg-slate-100 text-slate-600 border-slate-200 focus:ring-slate-400'
                          }`}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => startEdit(tenant)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(tenant)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modals */}

      {/* ADD TENANT MODAL */}
      <Modal
        isOpen={modalType === 'create'}
        onClose={() => setModalType(null)}
        onConfirm={() => createTenantMutation.mutate()}
        isLoading={createTenantMutation.isPending}
        title="Add New Tenant?"
        type="info"
        confirmLabel="Yes, Create Tenant"
        message={
          <div className="space-y-3">
            <p>Are you sure you want to add this tenant to the system?</p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Company:</span>
                <span className="text-slate-900 font-semibold">{formData.companyName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Admin Email:</span>
                <span className="text-slate-900 font-semibold">{formData.email}</span>
              </div>
            </div>
          </div>
        }
      />

      {/* UPDATE TENANT MODAL */}
      <Modal
        isOpen={modalType === 'update'}
        onClose={() => setModalType(null)}
        onConfirm={() => {
          const tenant = tenants.find(t => t.id === editingTenantId);
          if (tenant) {
            updateTenantMutation.mutate({
              id: tenant.tenantId,
              data: { email: formData.email, companyName: formData.companyName }
            });
          }
        }}
        isLoading={updateTenantMutation.isPending}
        title="Update Tenant Info?"
        type="warning"
        confirmLabel="Update Info"
        message={
          <div className="space-y-3">
            <p>You are about to modify the information for this tenant. Please confirm the new details:</p>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-600 font-bold uppercase">New Company Name:</span>
                <span className="text-slate-900 font-semibold">{formData.companyName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-amber-600 font-bold uppercase">New Admin Email:</span>
                <span className="text-slate-900 font-semibold">{formData.email}</span>
              </div>
            </div>
          </div>
        }
      />

      {/* STATUS CHANGE MODAL */}
      <Modal
        isOpen={modalType === 'status'}
        onClose={() => { setModalType(null); setPendingTenant(null); }}
        onConfirm={() => pendingTenant && updateTenantMutation.mutate({
          id: pendingTenant.tenantId,
          data: { active: pendingStatus }
        })}
        isLoading={updateTenantMutation.isPending}
        title="Change Tenant Status?"
        type="warning"
        confirmLabel={`Switch to ${pendingStatus ? 'Active' : 'Inactive'}`}
        message={
          <div className="space-y-3">
            <p>Are you sure you want to change the status of <strong>{pendingTenant?.companyName}</strong>?</p>
            <p className="text-xs text-slate-500">
              {pendingStatus
                ? "This will re-enable all whistleblower reporting features for this company."
                : "This will suspend whistleblower reporting features for this company immediately."}
            </p>
          </div>
        }
      />

      {/* DELETE MODAL */}
      <Modal
        isOpen={modalType === 'delete'}
        onClose={() => { setModalType(null); setPendingTenant(null); }}
        onConfirm={() => pendingTenant && deleteTenantMutation.mutate(pendingTenant.tenantId)}
        isLoading={deleteTenantMutation.isPending}
        title="Delete Tenant Permanently?"
        type="danger"
        confirmLabel="Delete Everything"
        message={
          <div className="space-y-3 text-red-700">
            <p className="font-bold">This action is irreversible.</p>
            <p className="text-sm">
              All data related to <strong>{pendingTenant?.companyName}</strong> will be removed from the system.
              Whistleblowers will no longer be able to access their reports for this tenant.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default AdminTenantsPage;