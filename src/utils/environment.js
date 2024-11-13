const getEnvironmentConfig = () => {
  // Add debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Environment Variables:', {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
      STRIPE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
      FRONTEND_URL: process.env.FRONTEND_URL,
    });
  }

  // Validate required environment variables
  const validateEnvVars = (envVars) => {
    const missing = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }
    return envVars;
  };

  switch (process.env.NODE_ENV) {
    case 'development':
      return validateEnvVars({
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321',
        supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
        stripeKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
        frontendUrl: 'http://localhost:3000'
      });
    case 'production':
      return validateEnvVars({
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
        supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
        stripeKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
        frontendUrl: process.env.FRONTEND_URL
      });
    default:
      throw new Error(`Unknown environment: ${process.env.NODE_ENV}`);
  }
};

export default getEnvironmentConfig; 