import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, Info, Trash2, HelpCircle } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  type = 'info',
  isLoading = false,
}) => {
  const { t } = useTranslation();
  
  // Defaults using translation if not provided
  const finalConfirmLabel = confirmLabel || t('common.confirm');
  const finalCancelLabel = cancelLabel || t('common.cancel');

  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-100',
      btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-600" />,
      bg: 'bg-red-100',
      btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    info: {
      icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-100',
      btn: 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-900',
    },
    success: {
      icon: <Info className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-100',
      btn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${typeStyles[type].bg}`}>
              {typeStyles[type].icon}
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <div className="text-slate-600 text-sm leading-relaxed mb-6">
            {message}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {finalCancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center ${typeStyles[type].btn}`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                finalConfirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;