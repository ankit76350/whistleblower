import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { setAuthToken } from '../services/api';

/**
 * Component that syncs the auth token from react-oidc-context to the api module
 * This allows api.js to include the Bearer token in API calls
 */
const AuthTokenSync = ({ children }) => {
    const auth = useAuth();

    useEffect(() => {
        if (auth.isAuthenticated) {
            // Prefer ID Token as it contains user attributes (claims) like email
            setAuthToken(auth.user?.id_token || auth.user?.access_token);
        } else {
            setAuthToken(null);
        }
    }, [auth.isAuthenticated, auth.user?.access_token, auth.user?.id_token]);

    return children;
};

export default AuthTokenSync;
