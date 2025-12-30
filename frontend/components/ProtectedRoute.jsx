import { useAuth } from 'react-oidc-context';

/**
 * Protected Route component using react-oidc-context
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
    const auth = useAuth();

    // Show loading while checking auth status
    if (auth.isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #334155',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px',
                    }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    // Handle auth errors
    if (auth.error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#ef4444' }}>Authentication Error: {auth.error.message}</p>
                    <button
                        onClick={() => auth.signinRedirect()}
                        style={{
                            marginTop: '16px',
                            padding: '12px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!auth.isAuthenticated) {
        // Trigger sign in redirect
        auth.signinRedirect();
        return null;
    }

    return children;
};

export default ProtectedRoute;
