/**
 * @fileoverview SvelteKit server hooks for authentication and security headers.
 * @module hooks.server
 * @description This file defines the main server hook (`handle`) that runs on every request. It handles user authentication by calling a backend API and sets various security-related HTTP headers, including a Content Security Policy (CSP).
 * @dependencies ./hooks.server.env, @sveltejs/kit
 * @exports handle - The main SvelteKit server hook.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import './hooks.server.env';
import type { Handle } from '@sveltejs/kit';

/**
 * @function handle
 * @description Main SvelteKit request handler hook.
 * Processes authentication by calling the backend `/api/me` endpoint and sets security headers for all responses.
 * @param {object} params - SvelteKit handle parameters.
 * @param {RequestEvent} params.event - The SvelteKit request event object, containing `request` and `locals`.
 * @param {function} params.resolve - The function to continue processing the request.
 * @returns {Promise<Response>} A promise that resolves to the modified Response object with security headers and authentication context.
 *
 * Steps:
 *   1. Initialize `event.locals.user` to `null` to represent an unauthenticated state.
 *   2. Attempt to retrieve the 'cookie' header from the incoming request.
 *   3. If a cookie header exists, make a fetch request to the backend `/api/me` endpoint, forwarding the cookie.
 *   4. If the backend response is OK, parse the user data and assign it to `event.locals.user`.
 *   5. Catch and log any errors that occur during the authentication check.
 *   6. Call `resolve(event)` to continue the request processing chain and get the initial response.
 *   7. Set various security HTTP headers on the response (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
 *   8. Set a Content-Security-Policy (CSP) header, noting it's relaxed due to external WAF handling.
 *   9. Return the modified response.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Step 1: Initialize user as null (unauthenticated).
	event.locals.user = null;
	
	// Step 2: Check authentication by calling backend API.
	try {
		// Step 3: Get the cookie header from the request.
		const cookieHeader = event.request.headers.get('cookie');
		
		// Step 4: If cookies are present, attempt to authenticate with the backend.
		if (cookieHeader) {
			const backendUrl = process.env.BACKEND_URL || 'http://localhost:33771';
			const response = await fetch(`${backendUrl}/api/me`, {
				headers: { cookie: cookieHeader }
			});
			
			// Step 5: If authentication is successful, set the user in locals.
			if (response.ok) {
				const user = await response.json();
				event.locals.user = user;
			}
		}
	} catch (error) {
		// Step 6: Log any authentication check failures.
		console.error('Auth check failed:', error);
	}
	
	// Step 7: Process the request and get the initial response.
	const response = await resolve(event);
	
	// Step 8: Add security headers to all responses.
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	
	// Step 9: Set a Content-Security-Policy header.
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:; img-src * data:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; font-src * data:; connect-src *"
	);
	
	// Step 10: Return the response with added headers.
	return response;
};