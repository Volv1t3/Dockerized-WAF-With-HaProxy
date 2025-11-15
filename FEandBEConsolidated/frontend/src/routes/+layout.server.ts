/**
 * @fileoverview Root layout server load function for providing global user authentication state.
 * @module routes/+layout.server
 * @description This server load function runs on every page load to ensure that the authenticated user's information is consistently available to all pages and layouts throughout the application. The user data is populated by the authentication middleware defined in `hooks.server.ts`.
 * @dependencies ./$types (for LayoutServerLoad type)
 * @exports load - The SvelteKit server load function for the root layout.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import type { LayoutServerLoad } from './$types';

/**
 * @function load
 * @description SvelteKit server load function for the root layout.
 * It retrieves the authenticated user information from `event.locals` and makes it available as page data to all child layouts and pages.
 * @param {object} params - Parameters object provided by SvelteKit.
 * @param {App.Locals} params.locals - SvelteKit locals object, containing the authenticated user data set by `hooks.server.ts`.
 * @returns {object} An object containing the user's authentication state.
 * @property {App.Locals['user']} user - The authenticated user object or `null`.
 *
 * Steps:
 *   1. Access the `locals` object from the SvelteKit `event` parameter.
 *   2. Extract the `user` property from `locals`.
 *   3. Return an object with the `user` property, making it available as page data.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	// Step 1, 2, & 3: Pass user authentication state from locals to all pages.
	return {
		user: locals.user
	};
};
