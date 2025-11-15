/**
 * @fileoverview Handles application startup validation and graceful shutdown procedures.
 * @module lib/server/startup
 * @description This module provides functions to validate essential application configurations (environment variables, database connection) during startup and to gracefully disconnect resources during shutdown.
 * @dependencies ./env, ./db
 * @exports validateStartup - Function to perform startup checks.
 * @exports gracefulShutdown - Function to handle application shutdown.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import { getEnvConfig, isAuthEnabled } from './env';
import { db } from './db';

/**
 * @function validateStartup
 * @description Performs critical validation checks during application initialization.
 * This includes environment variable configuration and database connectivity.
 * @returns {Promise<void>} A promise that resolves if all validations pass, or rejects with an error.
 * @throws {Error} If any startup validation fails.
 *
 * Steps:
 *   1. Log the start of the validation process.
 *   2. Validate environment configuration using `getEnvConfig`.
 *   3. Log the status of environment variables (NODE_ENV, PORT, DATABASE_URL).
 *   4. Check and log the status of JWT authentication.
 *   5. Test the database connection by connecting and executing a simple query.
 *   6. Log success if all checks pass.
 *   7. Catch any errors, log them, and re-throw to halt application startup.
 */
export async function validateStartup(): Promise<void> {
	console.log('🚀 Starting AgriCommerce application...');
	
	try {
		// Step 1 & 2: Validate environment configuration.
		console.log('📋 Validating environment configuration...');
		const config = getEnvConfig();
		// Step 3: Log environment status.
		console.log(`   ✅ Environment: ${config.NODE_ENV}`);
		console.log(`   ✅ Port: ${config.PORT}`);
		console.log(`   ✅ Database URL configured`);
		
		// Step 4: Check authentication configuration.
		if (isAuthEnabled()) {
			console.log('   ✅ JWT authentication enabled');
		} else {
			console.log('   ⚠️  JWT authentication disabled (JWT_SECRET not set)');
		}
		
		// Step 5: Test database connection.
		console.log('🗄️  Testing database connection...');
		await db.$connect();
		await db.$queryRaw`SELECT 1`; // Execute a simple query to verify connection.
		console.log('   ✅ Database connection successful');
		
		// Step 6: Log overall success.
		console.log('✅ Application startup validation complete');
		
	} catch (error) {
		// Step 7: Catch and re-throw errors.
		console.error('❌ Application startup validation failed:');
		console.error(error instanceof Error ? error.message : 'Unknown error');
		throw error;
	}
}

/**
 * @function gracefulShutdown
 * @description Handles the graceful shutdown of application resources, such as database connections.
 * @returns {Promise<void>} A promise that resolves when all resources are successfully shut down.
 *
 * Steps:
 *   1. Log the start of the shutdown process.
 *   2. Disconnect the database client.
 *   3. Log success if disconnection is successful.
 *   4. Catch and log any errors that occur during shutdown.
 */
export async function gracefulShutdown(): Promise<void> {
	console.log('🛑 Shutting down application...');
	
	try {
		// Step 1 & 2: Disconnect the database.
		await db.$disconnect();
		console.log('   ✅ Database connection closed');
		// Step 3: Log overall success.
		console.log('✅ Application shutdown complete');
	} catch (error) {
		// Step 4: Catch and log shutdown errors.
		console.error('❌ Error during shutdown:', error);
	}
}
