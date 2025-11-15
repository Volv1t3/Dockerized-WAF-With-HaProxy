/**
 * @fileoverview Database client initialization and configuration.
 * @module lib/db
 * @description This module initializes and exports a PrismaClient instance, configured to log database queries, errors, and warnings in development environments, and only errors in production.
 * @dependencies @prisma/client
 * @exports db - The PrismaClient instance for database interactions.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import { PrismaClient } from '@prisma/client';

/**
 * @constant {PrismaClient} db - The PrismaClient instance.
 * Configured to log database operations based on the `NODE_ENV` environment variable.
 * In 'development' mode, it logs 'query', 'error', and 'warn'.
 * In other environments (e.g., 'production'), it only logs 'error'.
 */
const db = new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

export { db };
