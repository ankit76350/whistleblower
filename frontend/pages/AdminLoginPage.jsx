import { useAuth } from 'react-oidc-context';

/**
 * Admin Login Page using react-oidc-context
 * Provides login/logout functionality with Cognito Hosted UI
 */
const AdminLoginPage = () => {
    const auth = useAuth();

    // Show loading state
    if (auth.isLoading) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={spinnerStyle}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <h2 style={{ margin: '0 0 16px', fontSize: '24px' }}>Loading...</h2>
                </div>
            </div>
        );
    }

    // Show error state
    if (auth.error) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                    <h2 style={{ margin: '0 0 16px', fontSize: '24px' }}>Authentication Error</h2>
                    <p style={{ color: '#94a3b8', margin: '0 0 24px' }}>{auth.error.message}</p>
                    <button
                        style={buttonStyle}
                        onClick={() => auth.signinRedirect()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

   
};

// Styles
const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#e2e8f0',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '20px',
};

const cardStyle = {
    backgroundColor: '#e2e8f0',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    // boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    maxWidth: '420px',
    width: '100%',
    border: '1px solid #e2e8f0',
};

const spinnerStyle = {
    width: '48px',
    height: '48px',
    border: '4px solid #334155',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
};

const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
};


export default AdminLoginPage;
