/**
 * @fileoverview Server load function for the account layout, protecting authenticated routes.
 * @module routes/account/+layout.server
 * @description This server load function ensures that only authenticated users can access routes under `/account`. If a user is not authenticated, they are redirected to the sign-in page, with their intended destination preserved as a redirect parameter.
 * @dependencies @sveltejs/kit, ./$types (for LayoutServerLoad type)
 * @exports load - The SvelteKit server load function for the account layout.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * @function load
 * @description SvelteKit server load function for the account layout.
 * It checks for user authentication and redirects unauthenticated users to the sign-in page.
 * If authenticated, it passes the user data to the account pages.
 * @param {object} params - Parameters object provided by SvelteKit.
 * @param {App.Locals} params.locals - SvelteKit locals object, containing the authenticated user data set by `hooks.server.ts`.
 * @param {URL} params.url - The current URL object, used for redirecting back after sign-in.
 * @returns {object} An object containing the authenticated user's profile data.
 * @property {App.Locals['user']} user - The authenticated user object.
 * @throws {Redirect} Throws a SvelteKit `redirect` to the sign-in page if the user is not authenticated.
 *
 * Steps:
 *   1. Check if `locals.user` is null, indicating an unauthenticated user.
 *   2. If unauthenticated, construct a redirect URL to the sign-in page, including the current path as a `redirect` query parameter.
 *   3. Throw the SvelteKit `redirect` function to initiate the redirection.
 *   4. If authenticated, return the `locals.user` object to make it available to child pages.
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Step 1: Check if user is authenticated (user data is set by hooks.server.ts).
	if (!locals.user) {
		// Step 2 & 3: If not authenticated, redirect to the sign-in page, preserving the current URL.
		throw redirect(302, `/auth/sign-in?redirect=${encodeURIComponent(url.pathname)}`);
	}
	
	// Step 4: Return user data from locals (already fetched by hooks.server.ts) for use in account pages.
	return {
		user: locals.user
	};
};
