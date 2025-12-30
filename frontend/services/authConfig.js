// Cognito configuration for react-oidc-context
// All values are loaded from environment variables for easy production deployment
// See .env.example for required variables

const cognitoAuthConfig = {
    // OIDC authority (Cognito User Pool URL)
    authority: import.meta.env.VITE_COGNITO_AUTHORITY,

    // App Client ID (from Cognito console)
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,

    // Redirect URI after login - must match Cognito app client settings
    redirect_uri: import.meta.env.VITE_REDIRECT_URI,

    // OAuth2 response type
    response_type: 'code',

    // Scopes to request
    scope: 'email openid phone',

    // Cognito domain for logout
    cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN,

    // Logout redirect URI
    logoutUri: import.meta.env.VITE_LOGOUT_URI,
};

export default cognitoAuthConfig;
