/**
 * @fileoverview Handles JSON Web Token (JWT) creation, verification, and cookie management.
 * @module lib/server/jwt
 * @description This module provides functions for signing and verifying JWTs, and for creating and clearing authentication cookies. It uses HS256 algorithm and integrates with environment-specific settings for security.
 * @dependencies jsonwebtoken, $app/environment, ./env
 * @exports JWTPayload - Interface for the JWT payload.
 * @exports CookieOptions - Interface for cookie configuration options.
 * @exports signJWT - Function to sign a new JWT.
 * @exports verifyJWT - Function to verify and decode a JWT.
 * @exports getCookieOptions - Function to get environment-specific cookie options.
 * @exports getCookieName - Function to get the authentication cookie name.
 * @exports createAuthCookie - Function to create a Set-Cookie header string for authentication.
 * @exports clearAuthCookie - Function to create a Set-Cookie header string to clear authentication.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import jwt from 'jsonwebtoken';
import { dev } from '$app/environment';
import { isAuthEnabled } from './env';

/**
 * @constant {string} JWT_SECRET - The secret key used for signing JWTs, retrieved from environment variables.
 * @constant {string} JWT_ALGORITHM - The algorithm used for JWT signing (HS256).
 * @constant {string} JWT_EXPIRES_IN - The expiration time for access tokens (7 days).
 * @constant {string} COOKIE_NAME - The name of the authentication cookie.
 */
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRES_IN = '7d'; // Access token expiry
const COOKIE_NAME = 'agri_auth';

/**
 * @interface JWTPayload
 * @description Defines the structure of the data stored within the JWT.
 * @property {string} userId - The unique identifier of the user.
 * @property {string} email - The email address of the user.
 * @property {number} [iat] - Issued at timestamp.
 * @property {number} [exp] - Expiration timestamp.
 */
export interface JWTPayload {
	userId: string;
	email: string;
	iat?: number;
	exp?: number;
}

/**
 * @interface CookieOptions
 * @description Defines the options for setting the authentication cookie.
 * @property {boolean} httpOnly - If true, the cookie is inaccessible to client-side scripts.
 * @property {boolean} secure - If true, the cookie is sent only over HTTPS.
 * @property {'lax' | 'strict' | 'none'} sameSite - Controls when the cookie is sent with cross-site requests.
 * @property {string} path - The path for which the cookie is valid.
 * @property {number} maxAge - The maximum age of the cookie in seconds.
 */
export interface CookieOptions {
	httpOnly: boolean;
	secure: boolean;
	sameSite: 'lax' | 'strict' | 'none';
	path: string;
	maxAge: number;
}

/**
 * @function validateJWTSecret
 * @description Internal helper function to ensure JWT_SECRET is configured.
 * @throws {Error} If the JWT_SECRET environment variable is not set.
 *
 * Steps:
 *   1. Check if JWT_SECRET is undefined or null.
 *   2. If missing, throw an error.
 */
function validateJWTSecret(): void {
	// Step 1 & 2: Check for JWT_SECRET and throw if not found.
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET environment variable is required');
	}
}

/**
 * @function signJWT
 * @description Signs a JSON Web Token (JWT) with the provided user payload.
 * @param {object} payload - The data to be encoded into the JWT.
 * @param {string} payload.userId - The user's unique ID.
 * @param {string} payload.email - The user's email address.
 * @returns {string} The signed JWT string.
 * @throws {Error} If JWT_SECRET is not configured or signing fails.
 *
 * Steps:
 *   1. Validate that JWT_SECRET is set.
 *   2. Attempt to sign the payload using the configured secret, algorithm, and expiration.
 *   3. If signing fails, catch the error and re-throw with a descriptive message.
 */
export function signJWT(payload: { userId: string; email: string }): string {
	// Step 1: Ensure JWT_SECRET is available.
	validateJWTSecret();
	
	try {
		// Step 2: Sign the JWT.
		return jwt.sign(payload, JWT_SECRET!, {
			algorithm: JWT_ALGORITHM,
			expiresIn: JWT_EXPIRES_IN
		});
	} catch (error) {
		// Step 3: Handle and re-throw signing errors.
		throw new Error(`Failed to sign JWT: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * @function verifyJWT
 * @description Verifies and decodes a given JWT token.
 * @param {string} token - The JWT string to verify.
 * @returns {JWTPayload | null} The decoded payload if the token is valid, otherwise null.
 *
 * Steps:
 *   1. Check if authentication is enabled; if not, return null with a warning.
 *   2. Check if JWT_SECRET is configured; if not, return null with an error.
 *   3. Attempt to verify the token using the secret and algorithm.
 *   4. If verification is successful, cast and return the decoded payload.
 *   5. If verification fails (e.g., token expired, malformed), log a warning and return null.
 */
export function verifyJWT(token: string): JWTPayload | null {
	// Step 1: Return null immediately if authentication is not enabled.
	if (!isAuthEnabled()) {
		console.warn('Authentication is not enabled - JWT_SECRET not configured');
		return null;
	}
	
	// Step 2: Ensure JWT_SECRET is available.
	if (!JWT_SECRET) {
		console.error('JWT_SECRET is not configured');
		return null;
	}
	
	try {
		// Step 3: Verify the token.
		const decoded = jwt.verify(token, JWT_SECRET, {
			algorithms: [JWT_ALGORITHM]
		}) as JWTPayload;
		
		// Step 4: Return the decoded payload.
		return decoded;
	} catch (error) {
		// Step 5: Handle verification errors.
		if (error instanceof jwt.TokenExpiredError) {
			console.warn('JWT token has expired');
		} else if (error instanceof jwt.JsonWebTokenError) {
			console.warn('JWT token is malformed:', error.message);
		} else {
			console.warn('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
		}
		return null;
	}
}

/**
 * @function getCookieOptions
 * @description Provides standard cookie options, adjusting 'secure' based on the environment.
 * @returns {CookieOptions} An object containing cookie configuration.
 *
 * Steps:
 *   1. Define httpOnly to prevent XSS.
 *   2. Set secure to true only in production environments.
 *   3. Set sameSite for CSRF protection.
 *   4. Set path to make the cookie available site-wide.
 *   5. Set maxAge for a 7-day expiration.
 *   6. Return the options object.
 */
export function getCookieOptions(): CookieOptions {
	return {
		httpOnly: true, // Step 1: Prevent XSS attacks.
		secure: !dev, // Step 2: HTTPS only in production.
		sameSite: 'lax', // Step 3: CSRF protection.
		path: '/', // Step 4: Available site-wide.
		maxAge: 60 * 60 * 24 * 7 // Step 5: 7 days in seconds.
	};
}

/**
 * @function getCookieName
 * @description Returns the predefined name for the authentication cookie.
 * @returns {string} The name of the authentication cookie.
 *
 * Steps:
 *   1. Return the COOKIE_NAME constant.
 */
export function getCookieName(): string {
	// Step 1: Return the cookie name.
	return COOKIE_NAME;
}

/**
 * @function createAuthCookie
 * @description Generates a 'Set-Cookie' header string for setting the authentication token.
 * @param {string} token - The JWT token to be stored in the cookie.
 * @returns {string} The formatted cookie string.
 *
 * Steps:
 *   1. Get the standard cookie options.
 *   2. Assemble the cookie parts including name, token, path, max-age, and same-site.
 *   3. Conditionally add HttpOnly and Secure attributes.
 *   4. Join all parts into a single string.
 */
export function createAuthCookie(token: string): string {
	// Step 1: Get cookie options.
	const options = getCookieOptions();
	// Step 2: Assemble base cookie parts.
	const cookieParts = [
		`${COOKIE_NAME}=${token}`,
		`Path=${options.path}`,
		`Max-Age=${options.maxAge}`,
		`SameSite=${options.sameSite}`
	];

	// Step 3: Conditionally add HttpOnly.
	if (options.httpOnly) {
		cookieParts.push('HttpOnly');
	}

	// Step 3: Conditionally add Secure.
	if (options.secure) {
		cookieParts.push('Secure');
	}

	// Step 4: Join and return the cookie string.
	return cookieParts.join('; ');
}

/**
 * @function clearAuthCookie
 * @description Generates a 'Set-Cookie' header string to clear the authentication cookie.
 * @returns {string} The formatted cookie string to clear authentication.
 *
 * Steps:
 *   1. Get the standard cookie options.
 *   2. Construct a cookie string with an empty value, path, zero max-age, HttpOnly, and Secure (if applicable).
 */
export function clearAuthCookie(): string {
	// Step 1: Get cookie options.
	const options = getCookieOptions();
	// Step 2: Construct and return the cookie string to clear the authentication cookie.
	return `${COOKIE_NAME}=; Path=${options.path}; Max-Age=0; HttpOnly; SameSite=${options.sameSite}${options.secure ? '; Secure' : ''}`;
}
