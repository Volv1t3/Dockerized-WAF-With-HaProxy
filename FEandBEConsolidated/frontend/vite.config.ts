/**
 * Vite Configuration for SvelteKit
 * 
 * Configures Vite build tool with SvelteKit plugin and Vitest for testing.
 * Optimizes build process and enables hot module replacement in development.
 */
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// Include test files in src directory
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	// Server configuration for development
	server: {
		port: 34771,
		host: true // Allow external connections for Docker
	},
	// Preview server configuration for production builds
	preview: {
		port: 34771,
		host: true,
		allowedHosts: ['agricommerce.evolvlabs.com']
	},
	// Build optimizations
	build: {
		// Target modern browsers for better performance
		target: 'es2020',
		// Disable source maps in production to prevent 404 errors
		sourcemap: false
	}
});