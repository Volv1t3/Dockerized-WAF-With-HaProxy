<!--
	Sign Up Page
	
	User registration form with email, password, name, and optional phone fields.
	Includes password confirmation and validation feedback.
-->

<script>
	/**
	 * @fileoverview User sign-up page component.
	 * @module routes/auth/sign-up/+page
	 * @description This component provides a form for new users to register an account with AgriCommerce. It collects email, password, first name, last name, and an optional phone number. It includes password confirmation, validation feedback, and handles form submission to the backend API.
	 * @dependencies $app/navigation
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { goto, invalidateAll } from '$app/navigation';
	
	// Form state
	/**
	 * @type {string} email - Binds to the email input field.
	 * {string} password - Binds to the password input field.
	 * {string} confirmPassword - Binds to the confirm password input field.
	 * {string} firstName - Binds to the first name input field.
	 * {string} lastName - Binds to the last name input field.
	 * {string} phone - Binds to the optional phone number input field.
	 * {boolean} showPassword - Controls the visibility of the password input.
	 * {boolean} showConfirmPassword - Controls the visibility of the confirm password input.
	 * {boolean} isSubmitting - Flag to indicate if the form is currently being submitted.
	 * {Record<String, String>} errors - Stores field-specific validation errors.
	 * {string} generalError - Stores a general error message for the form.
	 */
	let email = '';
	let password = '';
	let confirmPassword = '';
	let firstName = '';
	let lastName = '';
	let phone = '';
	let showPassword = false;
	let showConfirmPassword = false;
	let isSubmitting = false;
	/** @type {Record<string,string>}*/
	let errors = {};
	let generalError = '';
	
	/**
	 * @function togglePasswordVisibility
	 * @description Toggles the `showPassword` boolean state, which controls whether the main password input field is of type 'password' or 'text'.
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
	 * @function toggleConfirmPasswordVisibility
	 * @description Toggles the `showConfirmPassword` boolean state, which controls whether the confirm password input field is of type 'password' or 'text'.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Invert the current value of `showConfirmPassword`.
	 */
	function toggleConfirmPasswordVisibility() {
		// Step 1: Toggle confirm password visibility state.
		showConfirmPassword = !showConfirmPassword;
	}
	
	// VULNERABLE: All validation functions removed to allow SQL injection
	function validateFirstName() {
		// No validation - allows any input including SQL injection
	}
	
	function validateLastName() {
		// No validation - allows any input including SQL injection
	}
	
	function validateEmail() {
		// No validation - allows any input including SQL injection
	}
	
	function validatePassword() {
		// No validation - allows any input including SQL injection
	}
	
	function validatePasswordMatch() {
		// No validation - allows any input including SQL injection
	}
	
	/**
	 * @function handleSubmit
	 * @description Handles the form submission for user registration. It performs client-side password matching validation, sends the registration data to the backend API, and handles redirection or error display.
	 * @param {Event} event - The form submission event.
	 * @fires api/auth/sign-up - A POST request to the backend for user registration.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Prevent form default submission behavior.
	 *   2. If already submitting, exit the function.
	 *   3. Reset `errors` and `generalError`.
	 *   4. Perform client-side password match validation; if mismatch, exit.
	 *   5. Set `isSubmitting` to true.
	 *   6. Send a POST request to the backend sign-up API endpoint with user data.
	 *   7. If the response is OK, redirect the user to the account page.
	 *   8. If the response is not OK, handle different error types:
	 *      a. If it's a validation error with details, populate the `errors` object.
	 *      b. Otherwise, set a `generalError` message.
	 *   9. Catch any network errors and set a generic `generalError` message.
	 *   10. Reset `isSubmitting` to false in a `finally` block.
	 */
	async function handleSubmit() {
		// Step 1 & 2: Prevent default submission and check if already submitting.
		if (isSubmitting) return;
		
		// Step 3: Reset errors.
		errors = {};
		generalError = '';
		
		// VULNERABLE: Client-side validation removed to allow SQL injection
		// No validation performed - allows any input
		
		// Step 5: Set submitting state.
		isSubmitting = true;
		
		try {
			// Step 6: Send sign-up request to the backend.
			const response = await fetch('/api/auth/sign-up', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					email,
					password,
					firstName,
					lastName,
					phone: phone.trim() || undefined // Send phone only if not empty.
				})
			});
			
			const data = await response.json();
			
			// Step 7: Process successful registration.
			if (response.ok) {
				// Invalidate all data to refresh user state
				await invalidateAll();
				// Redirect to account page after successful sign-up.
				goto('/account', { replaceState: true });
			} else {
				// Step 8: Handle registration failures.
				if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
					// Populate field-specific errors.
					errors = data.error.details;
				} else {
					// Set a general error message.
					generalError = data.error?.message || 'Registration failed. Please try again.';
				}
			}
		} catch (error) {
			// Step 9: Handle network errors.
			console.error('Sign up error:', error);
			generalError = 'Network error. Please check your connection and try again.';
		} finally {
			// Step 10: Reset submitting state.
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up - AgriCommerce</title>
	<meta name="description" content="Create your AgriCommerce account to start shopping for quality agricultural products." />
</svelte:head>

<div class="auth-container">
	<div class="auth-card card">
		<div class="auth-header">
			<h1>Join AgriCommerce</h1>
			<p>Create your account to start shopping</p>
		</div>
		
		<form class="auth-form" on:submit|preventDefault={handleSubmit}>
			<!-- General Error Message -->
			{#if generalError}
				<div class="error-message">
					{generalError}
				</div>
			{/if}
			
			<!-- Name Fields -->
			<div class="form-row">
				<div class="form-group">
					<label for="firstName">First Name</label>
					<input
						id="firstName"
						type="text"
						bind:value={firstName}
						on:blur={validateFirstName}
						required
						disabled={isSubmitting}
						class:error={errors.firstName}
						placeholder="First name"
					/>
					{#if errors.firstName}
						<span class="field-error">{errors.firstName}</span>
					{/if}
				</div>
				
				<div class="form-group">
					<label for="lastName">Last Name</label>
					<input
						id="lastName"
						type="text"
						bind:value={lastName}
						on:blur={validateLastName}
						required
						disabled={isSubmitting}
						class:error={errors.lastName}
						placeholder="Last name"
					/>
					{#if errors.lastName}
						<span class="field-error">{errors.lastName}</span>
					{/if}
				</div>
			</div>
			
			<!-- Email Field -->
			<div class="form-group">
				<label for="email">Email Address</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					on:blur={validateEmail}
					required
					disabled={isSubmitting}
					class:error={errors.email}
					placeholder="Enter your email address"
				/>
				{#if errors.email}
					<span class="field-error">{errors.email}</span>
				{/if}
			</div>
			
			<!-- Phone Field (Optional) -->
			<div class="form-group">
				<label for="phone">Phone Number (Optional)</label>
				<input
					id="phone"
					type="tel"
					bind:value={phone}
					disabled={isSubmitting}
					class:error={errors.phone}
					placeholder="Enter your phone number"
				/>
				{#if errors.phone}
					<span class="field-error">{errors.phone}</span>
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
						aria-label={showPassword ? 'Hide password' : 'Show password'}>
						<img 
							src={showPassword ? '/icons8-hide-100.png' : '/icons8-show-100.png'} 
							alt={showPassword ? 'Hide password' : 'Show password'}
							width="20" 
							height="20"
						/>
					</button>
				</div>
				{#if errors.password}
					<span class="field-error">{errors.password}</span>
				{/if} 
				<small class="field-hint">
					Password must be at least 8 characters with 1 letter and 1 number
				</small>
			</div>
			<!-- Confirm Password Field -->
			<div class="form-group">
				<label for="confirmPassword">Confirm Password</label>
				<div class="password-input-group">
					{#if showConfirmPassword}
						<input
							id="confirmPassword"
							type="text"
							autocomplete="current-password"
							bind:value={confirmPassword}
							on:blur={validatePasswordMatch}
							required
							disabled={isSubmitting}
							class:error={errors.confirmPassword}
							placeholder="Confirm your password"
						/>
					{:else}
						<input
							id='confirmPassword'
							type='password'
							autocomplete="current-password"
							bind:value={confirmPassword}
							on:blur={validatePasswordMatch}
							required
							disabled={isSubmitting}
							class:error={errors.confirmPassword}
							placeholder="Confirm your password"
						/>
					{/if}
					<button
						type="button"
						class="password-toggle"
						on:click={toggleConfirmPasswordVisibility}
						aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
					>
						<img 
							src={showConfirmPassword ? '/icons8-hide-100.png' : '/icons8-show-100.png'} 
							alt={showConfirmPassword ? 'Hide password' : 'Show password'}
							width="20" 
							height="20"
						/>
					</button>
				</div>
				{#if errors.confirmPassword}
					<span class="field-error">{errors.confirmPassword}</span>
				{/if}
			</div>
			
			<!-- Submit Button -->
			<button
				type="submit"
				class="btn btn-primary btn-full"
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Creating Account...' : 'Create Account'}
			</button>
		</form>
		
		<!-- Sign In Link -->
		<div class="auth-footer">
			<p>
				Already have an account?
				<a href="/auth/sign-in" class="auth-link">Sign in here</a>
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
		max-width: 500px;
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
	
	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
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
		font-size: var(--text-lg);
	}
	
	.password-toggle:hover {
		color: var(--color-primary);
	}
	
	.field-hint {
		color: #6B7280;
		font-size: var(--text-xs);
		margin-top: var(--space-1);
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
	
	/* Mobile Responsive */
	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>