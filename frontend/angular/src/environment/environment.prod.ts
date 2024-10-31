export const environment = {
  production: true,
  apiUrl: 'https://backend-portfolio-v1-411a08a68df2.herokuapp.com',
  logLevel: 'error',
  featureFlags: {
    enableNewFeatureX: false,
    enableExperimentalUI: false,
  },
  sentryDsn: 'https://sentry-dsn@sentry.io/id', // Sentry DSN
  googleAnalyticsId: 'XX-XXXXXXXXX-X', // Google Analytics ID
  authTokenExpiry: 3600, // Token expiration time
  defaultLanguage: 'en', // Default language
  supportedLanguages: ['en', 'it'], // Supported languages
};