#!/usr/bin/env node

// Simple script to check which environment variables are loaded

console.log('\n=== Environment Check ===\n');

const getProjectRef = (url) => {
  const match = url?.match(/https:\/\/([^.]+)/);
  return match ? match[1] : 'unknown';
};

// Check Supabase settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = getProjectRef(supabaseUrl);

console.log(`Supabase URL: ${supabaseUrl || 'Not set'}`);
console.log(`Project Reference: ${projectRef}`);

// Determine environment
let environment = 'unknown';
if (projectRef.includes('nqmtrmbobbika')) {
  environment = 'DEVELOPMENT';
} else if (projectRef.includes('fduuujxzwwr')) {
  environment = 'PRODUCTION';
} else {
  environment = process.env.NODE_ENV || 'unknown';
}

console.log(`\nDetected Environment: ${environment}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);

// Check Stripe settings
const stripeKey = process.env.STRIPE_SECRET_KEY;
const isTestMode = stripeKey?.startsWith('sk_test_');

console.log(`\nStripe Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);

console.log('\n=== End Environment Check ===\n');