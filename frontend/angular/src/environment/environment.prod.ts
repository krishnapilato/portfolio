export const environment = {
  production: true,
  apiUrl: 'https://backend-portfolio-v1-411a08a68df2.herokuapp.com',
  logLevel: 'info',
  auth: {
    tokenExpirySeconds: 3600,
    refreshTokenExpirySeconds: 86400,
    storageKey: 'auth_token',
  },
  analytics: {
    googleAnalyticsId: 'XX-XXXXXXXXX-X',
    enableAnalytics: true,
  },
  sentry: {
    dsn: 'https://sentry-dsn@sentry.io/id',
    environment: 'production',
  },
};