/**
 * Application configuration
 * @type {Object}
 */
const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_KEY,
    options: {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation",
      },
      db: {
        schema: "public",
      },
    },
  },
};

/**
 * Validates required environment variables
 * @throws {Error} If required environment variables are missing
 */
const validateConfig = () => {
  const required = [
    ["REACT_APP_SUPABASE_URL", config.supabase.url],
    ["REACT_APP_SUPABASE_KEY", config.supabase.key],
  ];

  const missing = required.filter(([name, value]) => !value);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${
        missing.map(([name]) => name).join(", ")
      }`,
    );
  }
};

validateConfig();

export default config;
