/**
 * @fileoverview Manages the database connection using a singleton Prisma client.
 * @module lib/server/db
 * @description This file is responsible for creating and managing a single instance of the Prisma client. It uses a global variable to prevent multiple instances during development hot-reloading and includes a graceful shutdown mechanism.
 * @dependencies @prisma/client, $app/environment
 * @exports db - The singleton PrismaClient instance.
 * @exports disconnectDb - A helper function to safely disconnect the Prisma client.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

/**
 * @global
 * @description Extends the global scope to cache the Prisma client in development.
 */
declare global {
	var __db__: PrismaClient;
}

/**
 * @function createPrismaClient
 * @description Creates and configures a new Prisma client instance.
 * @returns {PrismaClient} A configured Prisma client.
 *
 * Steps:
 *   1. Initialize PrismaClient with logging based on the environment.
 *   2. Configure the datasource URL from environment variables.
 *   3. Register a 'beforeExit' process hook for graceful shutdown.
 *   4. Return the newly created client.
 */
function createPrismaClient(): PrismaClient {
	// Step 1: Initialize client with environment-specific logging.
	const client = new PrismaClient({
		log: dev ? ['query', 'error', 'warn'] : ['error'],
		// Step 2: Configure the database connection URL.
		datasources: {
			db: {
				url: process.env.DATABASE_URL
			}
		}
	});

	// Step 3: Set up a listener for graceful shutdown.
	process.on('beforeExit', async () => {
		// Disconnect the client before the process exits.
		await client.$disconnect();
	});

	// Step 4: Return the configured client.
	return client;
}

/**
 * @constant {PrismaClient} db
 * @description The singleton Prisma client instance.
 * It reuses an existing instance in development to prevent connection issues from hot-reloading.
 */
// Check if a client instance already exists on the global object, otherwise create one.
export const db = globalThis.__db__ ?? createPrismaClient();

// In development, store the client instance globally to avoid creating new ones on hot-reload.
if (dev) {
	globalThis.__db__ = db;
}

/**
 * @function disconnectDb
 * @description A helper function to safely disconnect from the database.
 * This is primarily used in testing and shutdown scenarios.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Call the $disconnect method on the Prisma client.
 */
export async function disconnectDb(): Promise<void> {
	// Step 1: Disconnect the Prisma client.
	await db.$disconnect();
}
