export const environment = {
  // General settings
  production: true,
  apiUrl: 'https://backend-portfolio-v1-411a08a68df2.herokuapp.com',
  version: '1.0.0',
  appName: 'Portfolio App',
  logLevel: 'info', // Options: 'debug', 'info', 'warn', 'error'

  // Authentication settings
  auth: {
    tokenExpirySeconds: 3600,
    refreshTokenExpirySeconds: 86400,
    storageKey: 'auth_token',
    rememberMeKey: 'remember_me',
    loginPath: '/auth/login',
    signupPath: '/auth/signup',
  },

  // Analytics configuration
  analytics: {
    googleAnalyticsId: 'XX-XXXXXXXXX-X',
    enableAnalytics: true,
    hotjarId: 'XXXXXX',
    enableHeatmaps: true,
  },

  // Error tracking (Sentry)
  sentry: {
    dsn: 'https://sentry-dsn@sentry.io/id',
    environment: 'production',
    release: 'portfolio@1.0.0',
    tracing: true,
  },

  // Feature toggles
  features: {
    enableDarkMode: true,
    enableBetaFeatures: false,
    enableMaintenanceMode: false,
    showDebugInfo: false,
  },

  // Cache settings
  cache: {
    enabled: true,
    defaultTTLSeconds: 300,
    storageKeyPrefix: 'app_cache_',
  },

  // Third-party integrations
  integrations: {
    mailService: {
      endpoint: 'https://mail-service.com/send',
      apiKey: 'XXXX-XXXX-XXXX-XXXX',
    },
    paymentGateway: {
      provider: 'Stripe',
      publicKey: 'pk_live_XXXXXXX',
    },
    recaptcha: {
      siteKey: '6LXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX',
      secretKey: '6LXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX',
    },
  },

  // Logging configuration
  logging: {
    enableConsoleLogging: true,
    enableFileLogging: false,
    logFilePath: '/var/logs/app.log',
    logLevels: ['info', 'warn', 'error'],
  },

  // Environment settings
  environmentDetails: {
    name: 'production',
    region: 'EU-West',
    timezone: 'CET',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'it'],
  },
};
