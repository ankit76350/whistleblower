import cognitoAuthConfig from './authConfig';

/**
 * Auth service helper functions for react-oidc-context
 * Most auth logic is handled by the useAuth hook from react-oidc-context
 * This file provides helper functions for logout and token access
 */

/**
 * Get the logout URL for Cognito
 * react-oidc-context doesn't handle Cognito logout properly,
 * so we need to redirect manually
 */
export const getLogoutUrl = () => {
    const params = new URLSearchParams({
        client_id: cognitoAuthConfig.client_id,
        logout_uri: cognitoAuthConfig.logoutUri,
    });

    return `${cognitoAuthConfig.cognitoDomain}/logout?${params.toString()}`;
};

/**
 * Clear all oidc-client related storage
 */
export const clearAuthStorage = () => {
    // Clear sessionStorage items related to oidc-client
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('oidc.') || key.includes('oidc'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));

    // Also clear localStorage in case oidc-client uses it
    const localKeysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('oidc.') || key.includes('oidc'))) {
            localKeysToRemove.push(key);
        }
    }
    localKeysToRemove.forEach(key => localStorage.removeItem(key));
};


/**
 * Complete logout with auth object
 * Use this from components with access to useAuth
 * IMPORTANT: Redirects IMMEDIATELY to prevent race conditions
 */
export const completeLogout = (auth) => {
    // Get logout URL first
    const logoutUrl = getLogoutUrl();

    // Clear all storage
    clearAuthStorage();

    // IMMEDIATELY redirect - use replace to prevent back button issues
    // Don't await anything to prevent React from re-rendering
    window.location.replace(logoutUrl);
};

/**
 * Get access token from auth user object
 */
export const getAccessToken = (user) => {
    return user?.access_token || null;
};

/**
 * Get ID token from auth user object
 */
export const getIdToken = (user) => {
    return user?.id_token || null;
};

export default {
    getLogoutUrl,
    clearAuthStorage,
    completeLogout,
    getAccessToken,
    getIdToken,
};

