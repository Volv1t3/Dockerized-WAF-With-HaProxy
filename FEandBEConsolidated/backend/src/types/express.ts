/**
 * @fileoverview Extends the Express Request interface to include an authenticated user property.
 * @module types/express
 * @description This module provides TypeScript type definitions to augment the Express `Request` object, allowing `req.user` to store `AuthenticatedUser` data after successful authentication middleware processing.
 * @dependencies None
 * @exports AuthenticatedUser - Interface defining the structure of an authenticated user.
 * @author Gemini
 * @lastModified 2025-11-11
 */

/**
 * @interface AuthenticatedUser
 * @description Defines the structure of an authenticated user object that can be attached to the Express Request.
 * @property {string} id - The unique identifier of the user.
 * @property {string} email - The email address of the user.
 * @property {string} firstName - The first name of the user.
 * @property {string} lastName - The last name of the user.
 */
export interface AuthenticatedUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
}

declare global {
	namespace Express {
		/**
		 * @interface Request
		 * @description Augments the Express Request interface to include an optional `user` property.
		 * This property will hold `AuthenticatedUser` data if the request has been authenticated, otherwise it will be `null` or `undefined`.
		 * @property {AuthenticatedUser | null | undefined} user - The authenticated user's data.
		 */
		interface Request {
			user?: AuthenticatedUser | null;
		}
	}
}
