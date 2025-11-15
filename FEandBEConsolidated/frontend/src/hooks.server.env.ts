/**
 * @fileoverview Loads and logs the status of environment variables at application startup.
 * @module hooks.server.env
 * @description This script runs before other server code to ensure environment variables are loaded and to provide a clear log of their status, aiding in debugging configuration issues.
 * @dependencies None
 * @exports None (primarily side effects for logging)
 * @author Gemini
 * @lastModified 2025-11-11
 */

// Log environment status on startup
// Step 1: Log a general message indicating environment variable loading.
console.log('🔧 Loading environment variables...');
// Step 2: Check and log the status of DATABASE_URL.
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
// Step 3: Check and log the status of JWT_SECRET.
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
// Step 4: Log the current NODE_ENV, defaulting to 'development' if not set.
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
// Step 5: Log the current PORT, defaulting to '3000' if not set.
console.log('PORT:', process.env.PORT || '3000');