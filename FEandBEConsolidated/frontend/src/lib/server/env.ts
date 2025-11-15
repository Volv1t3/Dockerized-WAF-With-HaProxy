/**
 * @fileoverview Validates and provides typed access to environment variables.
 * @module lib/server/env
 * @description This file ensures that all required environment variables are present and correctly typed at startup. It provides a cached configuration object to avoid repeated validation.
 * @dependencies None
 * @exports {EnvConfig} - Interface for the environment configuration.
 * @exports {validateEnv} - Function to validate and return environment variables.
 * @exports {getEnvConfig} - Function to get the cached, validated environment configuration.
 * @exports {isAuthEnabled} - Function to check if JWT authentication is configured.
 * @author Gemini
 * @lastModified 2025-11-11
 */

/**
 * @interface EnvConfig
 * @description Defines the shape of the application's environment configuration.
 * @property {string} DATABASE_URL - The connection string for the database.
 * @property {string} [JWT_SECRET] - The secret key for signing JWTs.
 * @property {'development' | 'production' | 'test'} NODE_ENV - The application's runtime environment.
 * @property {number} PORT - The port on which the server will run.
 */
export interface EnvConfig {
	DATABASE_URL: string;
	JWT_SECRET?: string;
	NODE_ENV: 'development' | 'production' | 'test';
	PORT: number;
}

/**
 * @function validateEnv
 * @description Validates the presence and format of required environment variables.
 * @returns {EnvConfig} A validated environment configuration object.
 * @throws {Error} If any required environment variables are missing or invalid.
 *
 * Steps:
 *   1. Initialize an empty array to collect error messages.
 *   2. Check for the required DATABASE_URL.
 *   3. Check for the optional JWT_SECRET and issue a warning if it's missing.
 *   4. Validate that NODE_ENV is one of the allowed values.
 *   5. Validate that PORT is a valid number.
 *   6. If there are any errors, throw a single error with all messages.
 *   7. Return the validated configuration object.
 */
export function validateEnv(): EnvConfig {
	// Step 1: Initialize an error collector.
	const errors: string[] = [];
	
	// Step 2: Validate DATABASE_URL.
	const DATABASE_URL = process.env.DATABASE_URL;
	if (!DATABASE_URL) {
		errors.push('DATABASE_URL is required');
	}
	
	// Step 3: Validate JWT_SECRET.
	const JWT_SECRET = process.env.JWT_SECRET;
	if (!JWT_SECRET) {
		// This is a side effect, but acceptable for startup warnings.
		console.warn('⚠️  JWT_SECRET not set - authentication features will be disabled');
	}
	
	// Step 4: Validate NODE_ENV.
	const NODE_ENV = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'];
	if (!['development', 'production', 'test'].includes(NODE_ENV)) {
		errors.push('NODE_ENV must be development, production, or test');
	}
	
	// Step 5: Validate PORT.
	const PORT = parseInt(process.env.PORT || '3000', 10);
	if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
		errors.push('PORT must be a valid port number (1-65535)');
	}
	
	// Step 6: Check for and throw errors.
	if (errors.length > 0) {
		throw new Error(`Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
	}
	
	// Step 7: Return the validated configuration.
	return {
		DATABASE_URL: DATABASE_URL!,
		JWT_SECRET,
		NODE_ENV,
		PORT
	};
}

/**
 * @description A cached copy of the environment configuration to prevent re-validation.
 * @type {EnvConfig | null}
 */
let cachedConfig: EnvConfig | null = null;

/**
 * @function getEnvConfig
 * @description Retrieves the validated environment configuration, caching it on the first call.
 * @returns {EnvConfig} The validated and cached environment configuration.
 *
 * Steps:
 *   1. Check if the configuration has already been cached.
 *   2. If not cached, call validateEnv() and store the result.
 *   3. Return the cached configuration.
 */
export function getEnvConfig(): EnvConfig {
	// Step 1: Check for a cached version.
	if (!cachedConfig) {
		// Step 2: If not cached, validate and cache the configuration.
		cachedConfig = validateEnv();
	}
	// Step 3: Return the cached configuration.
	return cachedConfig;
}

/**
 * @function isAuthEnabled
 * @description Checks if JWT authentication is available by verifying the presence of JWT_SECRET.
 * @returns {boolean} True if JWT_SECRET is configured, otherwise false.
 *
 * Steps:
 *   1. Check for the existence of the JWT_SECRET environment variable.
 *   2. Return true if it exists, false otherwise.
 */
export function isAuthEnabled(): boolean {
	// Step 1 & 2: Check for JWT_SECRET and return the boolean result.
	return !!process.env.JWT_SECRET;
}
