// Cognito configuration for react-oidc-context
// Update these values for production deployment

const cognitoAuthConfig = {
    // OIDC authority (Cognito User Pool URL)
    authority: 'https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_hCjRk7DV8',

    // App Client ID (from Cognito console)
    client_id: '3hkapm135pqi7k15ealrug5ar1',

    // Redirect URI after login - must match Cognito app client settings
    redirect_uri: import.meta.env.PROD
        ? 'https://your-cloudfront-domain.com/admin/inbox'  // TODO: Update for production
        : 'http://localhost:3000/admin/inbox',

    // OAuth2 response type
    response_type: 'code',

    // Scopes to request
    scope: 'email openid phone',

    // Cognito domain for logout
    cognitoDomain: 'https://eu-central-1hcjrk7dv8.auth.eu-central-1.amazoncognito.com',

    // Logout redirect URI
    logoutUri: import.meta.env.PROD
        ? 'https://your-cloudfront-domain.com/'  // TODO: Update for production
        : 'http://localhost:3000/',
};

export default cognitoAuthConfig;
