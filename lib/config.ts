// lib/config.ts
// Configuration variables accessible across the application

// Environment detection
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 
  "https://madvaki.app.n8n.cloud/webhook/submit-proposal";

// Default timeout settings for various operations (in milliseconds)
export const TOAST_DURATION = {
  DEFAULT: 20000, // Increased to 20 seconds
  ERROR: 20000,   // Increased to 20 seconds
  SUCCESS: 20000, // Increased to 20 seconds
}

// Test configuration
export const TEST_CONFIG = {
  // Wait time between test steps in ms
  STEP_INTERVAL: 1500,
  // How long to leave the final test result visible
  RESULT_DISPLAY: 3000,
  // Toast notification duration for test events
  TOAST_DURATION: 20000 // Increased to 20 seconds
}

// Feature flags
export const FEATURES = {
  ENABLE_TESTING: false, // Disabled to prevent auto-submission
  SHOW_TEST_UI: true,
  // If true, webhook errors in development are treated as "expected" and won't show as errors
  MOCK_WEBHOOK_SUCCESS: IS_DEVELOPMENT,
}

// API endpoints
export const API = {
  WEBHOOK: {
    PROPOSAL: N8N_WEBHOOK_URL,
  }
} 
