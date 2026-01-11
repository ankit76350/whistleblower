import { useAuth } from 'react-oidc-context';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

/**
 * Admin Login Page using react-oidc-context
 * Provides login/logout functionality with Cognito Hosted UI
 */
const AdminLoginPage = () => {
    const auth = useAuth();
    const { t } = useTranslation();

    // Show loading state
    if (auth.isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6 font-sans text-slate-900">
                <div className="bg-slate-100 rounded-2xl p-12 text-center w-full max-w-md border border-slate-200">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold mb-4">{t('common.loading')}</h2>
                </div>
            </div>
        );
    }

    // Show error state
    if (auth.error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6 font-sans text-slate-900">
                <div className="bg-slate-100 rounded-2xl p-12 text-center w-full max-w-md border border-slate-200">
                    <div className="text-5xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-4">{t('common.error')}</h2>
                    <p className="text-slate-500 mb-6">{auth.error.message}</p>
                    <button
                        onClick={() => auth.signinRedirect()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/30"
                    >
                        {t('common.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6 font-sans text-slate-900">
            <div className="bg-slate-100 rounded-2xl p-12 text-center w-full max-w-md border border-slate-200 shadow-xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('admin.portalLogin')}
                </h1>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                    {t('admin.portalSubtitle')}
                </p>
                <button
                    onClick={() => auth.signinRedirect()}
                    className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    {t('admin.loginButton')}
                </button>
            </div>
            <p className="mt-8 text-xs text-slate-400 font-medium">
                Protected by Enterprise Grade Security
            </p>
        </div>
    );
};

export default AdminLoginPage;
