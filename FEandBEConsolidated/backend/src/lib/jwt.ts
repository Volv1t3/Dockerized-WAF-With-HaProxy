/**
 * @fileoverview Handles JSON Web Token (JWT) creation and verification for the backend.
 * @module lib/jwt
 * @description This module provides utility functions for signing and verifying JWTs, and for retrieving the authentication cookie name. It uses HS256 algorithm and relies on a `JWT_SECRET` environment variable.
 * @dependencies jsonwebtoken
 * @exports JWTPayload - Interface for the JWT payload.
 * @exports signJWT - Function to sign a new JWT.
 * @exports verifyJWT - Function to verify and decode a JWT.
 * @exports getCookieName - Function to get the authentication cookie name.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import jwt from 'jsonwebtoken';

/**
 * @constant {string} JWT_SECRET - The secret key used for signing JWTs, retrieved from environment variables.
 * @throws {Error} If JWT_SECRET is not defined in the environment.
 */
const JWT_SECRET = process.env.JWT_SECRET!;
/**
 * @constant {string} JWT_EXPIRES_IN - The expiration time for access tokens (7 days).
 */
const JWT_EXPIRES_IN = '7d';
/**
 * @constant {string} COOKIE_NAME - The name of the authentication cookie.
 */
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
 * @function signJWT
 * @description Signs a JSON Web Token (JWT) with the provided user payload.
 * @param {object} payload - The data to be encoded into the JWT.
 * @param {string} payload.userId - The user's unique ID.
 * @param {string} payload.email - The user's email address.
 * @returns {string} The signed JWT string.
 * @throws {Error} If JWT_SECRET is not configured or signing fails.
 *
 * Steps:
 *   1. Use `jwt.sign` to create a new token.
 *   2. Provide the payload, `JWT_SECRET`, algorithm ('HS256'), and expiration time.
 */
export function signJWT(payload: { userId: string; email: string }): string {
	// Step 1 & 2: Sign the JWT with the payload, secret, algorithm, and expiry.
	return jwt.sign(payload, JWT_SECRET, {
		algorithm: 'HS256',
		expiresIn: JWT_EXPIRES_IN
	});
}

/**
 * @function verifyJWT
 * @description Verifies and decodes a given JWT token.
 * @param {string} token - The JWT string to verify.
 * @returns {JWTPayload | null} The decoded payload if the token is valid, otherwise null.
 *
 * Steps:
 *   1. Attempt to verify the token using `jwt.verify` with the `JWT_SECRET` and expected algorithm.
 *   2. If verification is successful, cast the decoded payload to `JWTPayload` and return it.
 *   3. If verification fails (e.g., token expired, malformed, invalid signature), catch the error and return `null`.
 */
export function verifyJWT(token: string): JWTPayload | null {
	try {
		// Step 1 & 2: Verify the token and return the decoded payload.
		return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JWTPayload;
	} catch (error) {
		// Step 3: Return null if verification fails.
		return null;
	}
}

/**
 * @function getCookieName
 * @description Returns the predefined name for the authentication cookie.
 * @returns {string} The name of the authentication cookie.
 *
 * Steps:
 *   1. Return the `COOKIE_NAME` constant.
 */
export function getCookieName(): string {
	// Step 1: Return the cookie name.
	return COOKIE_NAME;
}
