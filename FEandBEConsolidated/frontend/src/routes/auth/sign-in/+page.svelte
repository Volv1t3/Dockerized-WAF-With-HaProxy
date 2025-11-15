<!--
	Sign In Page
	
	User authentication form with email and password fields.
	Includes password visibility toggle and link to sign up page.
-->

<script>
	/**
	 * @fileoverview User sign-in page component.
	 * @module routes/auth/sign-in/+page
	 * @description This component provides a form for users to sign in to their AgriCommerce account using their email and password. It includes features like password visibility toggle, error handling, and redirection after successful authentication.
	 * @dependencies $app/navigation, $app/stores
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	
	// Form state
	/**
	 * @type {string} email - Binds to the email input field.
	 * @type {string} password - Binds to the password input field.
	 * @type {boolean} showPassword - Controls the visibility of the password input.
	 * @type {boolean} isSubmitting - Flag to indicate if the form is currently being submitted.
	 * @type {Record<string, string>} errors - Stores field-specific validation errors.
	 * @type {string} generalError - Stores a general error message for the form.
	 */
	let email = '';
	let password = '';
	let showPassword = false;
	let isSubmitting = false;
	/** @type {Record<string, string>} */
	let errors = {};
	let generalError = '';
	
	// Get redirect URL from query params (for post-auth navigation)
	/**
	 * @type {string} redirectTo - The URL to redirect to after successful sign-in.
	 * Defaults to '/account' if no `redirect` query parameter is present.
	 */
	$: redirectTo = $page.url.searchParams.get('redirect') || '/account';
	
	// VULNERABLE: Validation functions removed to allow SQL injection
	function validateEmail() {
		// No validation - allows any input including SQL injection
	}
	
	function validatePassword() {
		// No validation - allows any input including SQL injection
	}
	
	/**
	 * @function togglePasswordVisibility
	 * @description Toggles the `showPassword` boolean state, which controls whether the password input field is of type 'password' or 'text'.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Invert the current value of `showPassword`.
	 */
	function togglePasswordVisibility() {
		// Step 1: Toggle password visibility state.
		showPassword = !showPassword;
	}
	
	/**
	 * @function handleSubmit
	 * @description Handles the form submission for user sign-in. It sends the user's credentials to the backend API, processes the response, and handles redirection or error display.
	 * @param {Event} event - The form submission event.
	 * @fires api/auth/sign-in - A POST request to the backend for user authentication.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Prevent form default submission behavior.
	 *   2. If already submitting, exit the function.
	 *   3. Reset `errors` and `generalError`, and set `isSubmitting` to true.
	 *   4. Send a POST request to the backend sign-in API endpoint with email and password.
	 *   5. Log the response status and data for debugging.
	 *   6. If the response is OK, log success and redirect the user to `redirectTo` by forcing a full page reload to ensure SvelteKit's auth state is updated.
	 *   7. If the response is not OK, handle different error types:
	 *      a. If it's a validation error with details, populate the `errors` object.
	 *      b. Otherwise, set a `generalError` message.
	 *   8. Catch any network errors and set a generic `generalError` message.
	 *   9. Reset `isSubmitting` to false in a `finally` block.
	 */
	async function handleSubmit() {
		// Step 1 & 2: Prevent default submission and check if already submitting.
		if (isSubmitting) return;
		
		// Step 3: Reset errors and set submitting state.
		errors = {};
		generalError = '';
		
		// VULNERABLE: Client-side validation removed to allow SQL injection
		// No validation performed - allows any input
		
		isSubmitting = true;
		
		try {
			console.log('Attempting sign-in...');
			// Step 4: Send sign-in request to the backend.
			const response = await fetch('/api/auth/sign-in', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ email, password })
			});
			
			console.log('Response status:', response.status);
			const data = await response.json();
			console.log('Response data:', data);
			
			// Step 6: Process successful sign-in.
			if (response.ok) {
				console.log('Sign-in successful, redirecting to:', redirectTo);
				// Force page reload to ensure auth state is updated across SvelteKit.
				window.location.href = redirectTo;
			} else {
				// Step 7: Handle sign-in failures.
				console.log('Sign-in failed:', data);
				if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
					// Populate field-specific errors.
					errors = data.error.details;
				} else {
					// Set a general error message.
					generalError = data.error?.message || 'Sign in failed. Please try again.';
				}
			}
		} catch (error) {
			// Step 8: Handle network errors.
			console.error('Sign in error:', error);
			generalError = 'Network error. Please check your connection and try again.';
		} finally {
			// Step 9: Reset submitting state.
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In - AgriCommerce</title>
	<meta name="description" content="Sign in to your AgriCommerce account to access your profile and purchase history." />
</svelte:head>

<div class="auth-container">
	<div class="auth-card card">
		<div class="auth-header">
			<h1>Welcome Back</h1>
			<p>Sign in to your AgriCommerce account</p>
		</div>
		
		<form class="auth-form" on:submit|preventDefault={handleSubmit}>
			<!-- General Error Message -->
			{#if generalError}
				<div class="error-message">
					{generalError}
				</div>
			{/if}
			
			<!-- Email Field -->
			<div class="form-group">
				<label for="email">Email Address</label>
				<input
					id="email"
					type="text"
					autocomplete="email"
					bind:value={email}
					on:blur={validateEmail}
					required
					disabled={isSubmitting}
					class:error={errors?.email}
					placeholder="Enter your email address"
				/>
				{#if errors?.email}
					<span class="field-error">{errors.email}</span>
				{/if}
			</div>
			
			<!-- Password Field -->
			<div class="form-group">
				<label for="password">Password</label>
				<div class="password-input-group">
					{#if showPassword}
						<input
							id="password"
							type="text"
							autocomplete="current-password"
							bind:value={password}
							on:blur={validatePassword}
							required
							disabled={isSubmitting}
							class:error={errors?.password}
							aria-errormessage={errors?.password}
							placeholder="Enter your password"
						/>
					{:else}
						<input
							id="password"
							type="password"
							autocomplete="current-password"
							bind:value={password}
							on:blur={validatePassword}
							required
							disabled={isSubmitting}
							class:error={errors?.password}
							aria-errormessage={errors?.password}
							placeholder="Enter your password"
						/>
					{/if}
					<button
						type="button"
						class="password-toggle"
						on:click={togglePasswordVisibility}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						<img 
							src={showPassword ? '/icons8-hide-100.png' : '/icons8-show-100.png'} 
							alt={showPassword ? 'Hide password' : 'Show password'}
							width="20" 
							height="20"
						/>
					</button>
				</div>
				{#if errors?.password}
					<span class="field-error">{errors.password}</span>
				{/if}
			</div>
			
			<!-- Submit Button -->
			<button
				type="submit"
				class="btn btn-primary btn-full"
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Signing In...' : 'Sign In'}
			</button>
		</form>
		
		<!-- Sign Up Link -->
		<div class="auth-footer">
			<p>
				Don't have an account?
				<a href="/auth/sign-up" class="auth-link">Sign up here</a>
			</p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		min-height: calc(100vh - 8rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-8) var(--space-4);
		background: linear-gradient(135deg, var(--color-neutral-light) 0%, var(--color-neutral) 100%);
	}
	
	.auth-card {
		width: 100%;
		max-width: 400px;
		padding: var(--space-8);
	}
	
	.auth-header {
		text-align: center;
		margin-bottom: var(--space-8);
	}
	
	.auth-header h1 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-2);
	}
	
	.auth-header p {
		color: #6B7280;
		margin-bottom: 0;
	}
	
	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	
	.password-input-group {
		position: relative;
		display: flex;
		align-items: center;
	}
	
	.password-input-group input {
		padding-right: var(--space-12);
	}
	
	.password-toggle {
		position: absolute;
		right: var(--space-3);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-1);
		color: #6B7280;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.password-toggle:hover {
		opacity: 0.7;
	}
	
	.password-toggle img {
		filter: brightness(0) saturate(100%) invert(47%) sepia(8%) saturate(1077%) hue-rotate(201deg) brightness(93%) contrast(86%);
	}
	
	.password-toggle:hover img {
		filter: brightness(0) saturate(100%) invert(47%) sepia(98%) saturate(2618%) hue-rotate(88deg) brightness(94%) contrast(89%);
	}
	
	.btn-full {
		width: 100%;
	}
	
	.error-message {
		background-color: #FEF2F2;
		color: #DC2626;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid #FECACA;
		font-size: var(--text-sm);
	}
	
	.field-error {
		color: #DC2626;
		font-size: var(--text-sm);
	}
	
	input.error {
		border-color: #DC2626;
	}
	
	input.error:focus {
		border-color: #DC2626;
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}
	
	.auth-footer {
		text-align: center;
		margin-top: var(--space-6);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-neutral);
	}
	
	.auth-footer p {
		color: #6B7280;
		margin-bottom: 0;
	}
	
	.auth-link {
		color: var(--color-primary);
		font-weight: 500;
		text-decoration: none;
	}
	
	.auth-link:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}
</style>