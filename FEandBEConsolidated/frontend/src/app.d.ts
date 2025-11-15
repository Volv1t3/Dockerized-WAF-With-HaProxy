/**
 * @fileoverview Extends SvelteKit's built-in types with application-specific interfaces.
 * @module app.d
 * @description This file defines global types for the AgriCommerce frontend application, including interfaces for application errors, server-side locals (e.g., authenticated user data), and page data.
 * @dependencies @prisma/client (for PrismaClient type, though not directly used in runtime here)
 * @exports App.Error - Interface for application-specific error objects.
 * @exports App.Locals - Interface for server-side request context.
 * @exports App.PageData - Interface for data passed to SvelteKit pages.
 * @exports App.Platform - Interface for platform-specific data.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import type { PrismaClient } from '@prisma/client';

declare global {
	namespace App {
		/**
		 * @interface Error
		 * @description Defines the structure for application-specific error objects.
		 * @property {string} [code] - An optional error code.
		 * @property {string} message - A descriptive error message.
		 */
		interface Error {
			code?: string;
			message: string;
		}
		
		/**
		 * @interface Locals
		 * @description Represents the server-side request context, available in all server-side code (e.g., hooks, load functions).
		 * @property {object | null} user - The current authenticated user object, or `null` if unauthenticated.
		 * @property {string} user.id - The unique identifier of the authenticated user.
		 * @property {string} user.email - The email address of the authenticated user.
		 */
		interface Locals {
			/**
			 * Current authenticated user or null if not authenticated
			 */
			user: {
				id: string;
				email: string;
			} | null;
		}
		
		/**
		 * @interface PageData
		 * @description Defines the structure of data that is passed from server-side `load` functions to SvelteKit pages.
		 * @property {object | null} [user] - Optional user data available to the page.
		 * @property {string} user.id - The unique identifier of the user.
		 * @property {string} user.email - The email address of the user.
		 * @property {string} [user.firstName] - The first name of the user.
		 * @property {string} [user.lastName] - The last name of the user.
		 * @property {string} [user.phone] - The phone number of the user.
		 */
		interface PageData {
			user?: {
				id: string;
				email: string;
				firstName?: string;
				lastName?: string;
				phone?: string;
			} | null;
		}
		
		/**
		 * @interface Platform
		 * @description Placeholder interface for platform-specific data, as defined by SvelteKit.
		 */
		interface Platform {}
	}
}

export {};