/**
 * @fileoverview Centralized API utilities for backend communication.
 * @module lib/api
 * @description This file provides a centralized configuration for the backend API's base URL and a wrapper function for making API requests. It ensures that all outgoing requests include credentials (cookies) and have the correct content type.
 * @dependencies None
 * @exports API_BASE_URL - The base URL for the backend API.
 * @exports apiRequest - An async function to make requests to the backend API.
 * @author Gemini
 * @lastModified 2025-11-11
 */

/**
 * API Configuration
 * 
 * Centralized API base URL configuration for backend communication
 */

// Step 1: Define the base URL for the API, differentiating between production and development environments.
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
	? 'http://backend:33771'  // Production backend
	: 'http://backend:33771'; // Development backend

/**
 * @function apiRequest
 * @description Makes an API request to the backend with proper configuration, including credentials and headers.
 * @param {string} endpoint - The API endpoint to call (e.g., '/users').
 * @param {RequestInit} [options={}] - Optional fetch options to override defaults.
 * @returns {Promise<Response>} A promise that resolves to the fetch Response object.
 *
 * Steps:
 *   1. Construct the full URL by combining the base URL and the endpoint.
 *   2. Execute the fetch request with 'credentials: include' to send cookies.
 *   3. Set the 'Content-Type' header to 'application/json'.
 *   4. Return the fetch promise.
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
	// Step 1: Construct the full URL.
	const url = `${API_BASE_URL}${endpoint}`;
	
	// Step 2: Execute and return the fetch request with default options.
	return fetch(url, {
		...options,
		credentials: 'include', // Include cookies for authentication
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	});
}
