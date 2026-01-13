import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Briefcase, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { api, setAuthToken } from '../services/api';
import { useAuth } from 'react-oidc-context';


const Layout = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const auth = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(false);

  React.useEffect(() => {
    if (isAdminRoute) {
      if (auth.isLoading) return; // Wait for auth to load

      const checkRole = async () => {
        try {
          // Ensure token is set to avoid race condition with AuthTokenSync
          // Use ID Token if available to ensure email claim is present
          const token = auth.user?.id_token || auth.user?.access_token;
          if (token) {
            setAuthToken(token);
          }

          const user = await api.getCurrentUser();
          if (user && user.role === 'SUPERADMIN') {
            setIsSuperAdmin(true);
          } else {
            setIsSuperAdmin(false);
          }
        } catch (e) {
          console.error("Failed to check role", e);
          setIsSuperAdmin(false);
        }
      };
      if (auth.isAuthenticated) {
        checkRole();
      }
    }
  }, [isAdminRoute, auth.isLoading, auth.isAuthenticated, auth.user?.access_token, auth.user?.id_token]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">WB<span className="text-blue-600">Box</span></span>
          </Link>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link
              to="/check"
              className={`text-sm font-medium transition-colors ${location.pathname === '/check' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t('layout.checkStatus')}
            </Link>

            <Link
              to="/admin/inbox"
              className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${location.pathname.startsWith('/admin') ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
            >
              <Briefcase className="w-3 h-3 mr-1" />
              {t('layout.adminPortal')}
            </Link>

            {location.pathname.startsWith('/admin') && (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4 ml-4">
                <Link to="/admin/inbox" className={`text-sm font-medium ${location.pathname.includes('/admin/inbox') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>
                  {t('layout.inbox')}
                </Link>
                {isSuperAdmin && (
                  <Link to="/admin/tenants" className={`text-sm font-medium flex items-center ${location.pathname === '/admin/tenants' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>
                    <Users className="w-4 h-4 mr-1" />
                    {t('layout.tenants')}
                  </Link>
                )}

              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400">
            {t('layout.footerText')}
            <span className="block mt-1">{t('layout.footerSubtext')}</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
