<script>
	/**
	 * @fileoverview Generic error page component for the AgriCommerce application.
	 * @module routes/+error
	 * @description This component displays user-friendly error messages based on the HTTP status code. It provides navigation options to return home or go back to the previous page.
	 * @dependencies $app/stores, $app/navigation
	 * @exports default - The default Svelte error page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	/**
	 * @type {Error} error - Reactive variable holding the error object from `$page.error`.
	 * @type {number} status - Reactive variable holding the HTTP status code from `$page.status`.
	 */
	$: error = $page.error;
	$: status = $page.status;
	
	/**
	 * @function goHome
	 * @description Navigates the user to the application's home page (`/`).
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Call SvelteKit's `goto` function with the root path.
	 */
	function goHome() {
		// Step 1: Navigate to the home page.
		goto('/');
	}
	
	/**
	 * @function goBack
	 * @description Navigates the user back to the previous page in their browser history.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Call the browser's `history.back()` method.
	 */
	function goBack() {
		// Step 1: Go back in browser history.
		history.back();
	}
</script>

<svelte:head>
	<title>Error {status} - AgriCommerce</title>
</svelte:head>

<div class="error-container container">
	<div class="error-content card">
		<div class="error-icon">
			{#if status === 404}
				🔍
			{:else if status >= 500}
				⚠️
			{:else}
				❌
			{/if}
		</div>
		
		<h1 class="error-title">
			{#if status === 404}
				Page Not Found
			{:else if status >= 500}
				Server Error
			{:else}
				Something Went Wrong
			{/if}
		</h1>
		
		<p class="error-message">
			{#if status === 404}
				The page you're looking for doesn't exist or has been moved.
			{:else if status >= 500}
				We're experiencing technical difficulties. Please try again later.
			{:else}
				{error?.message || 'An unexpected error occurred.'}
			{/if}
		</p>
		
		<div class="error-details">
			<span class="error-code">Error {status}</span>
		</div>
		
		<div class="error-actions">
			<button class="btn btn-primary" on:click={goHome}>
				🏠 Go Home
			</button>
			<button class="btn btn-outline" on:click={goBack}>
				← Go Back
			</button>
		</div>
	</div>
</div>

<style>
	.error-container {
		min-height: calc(100vh - 8rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-8) var(--space-4);
	}
	
	.error-content {
		text-align: center;
		max-width: 500px;
		padding: var(--space-12);
	}
	
	.error-icon {
		font-size: 5rem;
		margin-bottom: var(--space-6);
	}
	
	.error-title {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
		font-size: var(--text-3xl);
	}
	
	.error-message {
		color: #6B7280;
		font-size: var(--text-lg);
		line-height: 1.6;
		margin-bottom: var(--space-6);
	}
	
	.error-details {
		margin-bottom: var(--space-8);
	}
	
	.error-code {
		background-color: var(--color-neutral-light);
		color: var(--color-neutral-dark);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-family: monospace;
		font-size: var(--text-sm);
	}
	
	.error-actions {
		display: flex;
		gap: var(--space-4);
		justify-content: center;
		flex-wrap: wrap;
	}
	
	@media (max-width: 480px) {
		.error-actions {
			flex-direction: column;
		}
	}
</style>