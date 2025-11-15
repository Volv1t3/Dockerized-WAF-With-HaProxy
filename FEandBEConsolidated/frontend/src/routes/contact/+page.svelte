<!--
	Contact Page
	
	Contact form for user inquiries with validation and submission handling.
	Includes company information and contact details.
-->

<script>
	/**
	 * @fileoverview Contact Us page component.
	 * @module routes/contact/+page
	 * @description This component provides a contact form for user inquiries, including validation and submission handling. It also displays company contact information and a frequently asked questions (FAQ) section.
	 * @dependencies None
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	// Form state
	/**
	 * @type {string} name - Binds to the full name input field.
	 * @type {string} email - Binds to the email address input field.
	 * @type {string} message - Binds to the message textarea.
	 * @type {boolean} isSubmitting - Flag to indicate if the form is currently being submitted.
	 * @type {'idle' | 'success' | 'error'} submitStatus - Status of the form submission.
	 * @type {string} submitMessage - Message displayed to the user after form submission.
	 * @type {object} errors - Stores field-specific validation errors.
	 */
	let name = '';
	let email = '';
	let message = '';
	let isSubmitting = false;
	let submitStatus = 'idle';
	let submitMessage = '';
	let errors = {};
	
	/**
	 * @function handleSubmit
	 * @description Handles the submission of the contact form. It sends the form data to the backend API, processes the response, and provides user feedback.
	 * @param {Event} event - The form submission event.
	 * @fires api/contact - A POST request to the backend for submitting contact inquiries.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Prevent form default submission behavior.
	 *   2. If already submitting, exit the function.
	 *   3. Reset `errors`, `submitStatus`, `submitMessage`, and set `isSubmitting` to true.
	 *   4. Send a POST request to the backend contact API endpoint with form data.
	 *   5. If the response is OK, set `submitStatus` to 'success', display a success message, and clear the form fields.
	 *   6. If the response is not OK, set `submitStatus` to 'error' and handle different error types:
	 *      a. If it's a validation error with details, populate the `errors` object.
	 *      b. Otherwise, set a generic error message.
	 *   7. Catch any network errors and set `submitStatus` to 'error' with a network error message.
	 *   8. Reset `isSubmitting` to false in a `finally` block.
	 */
	async function handleSubmit() {
		// Step 1 & 2: Prevent default submission and check if already submitting.
		if (isSubmitting) return;
		
		// Step 3: Reset state.
		errors = {};
		submitStatus = 'idle';
		submitMessage = '';
		isSubmitting = true;
		
		try {
			// Step 4: Send contact form data to the backend.
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ name, email, message })
			});
			
			const data = await response.json();
			
			// Step 5: Process successful submission.
			if (response.ok) {
				submitStatus = 'success';
				submitMessage = data.message || 'Thank you for your message. We will get back to you soon!';
				// Clear form on success
				name = '';
				email = '';
				message = '';
			} else {
				// Step 6: Handle submission failures.
				submitStatus = 'error';
				if (data.error?.code === 'VALIDATION_ERROR' && data.error.details) {
					// Populate field-specific errors.
					errors = data.error.details;
				} else {
					// Set a generic error message.
					submitMessage = data.error?.message || 'Failed to send message. Please try again.';
				}
			}
		} catch (error) {
			// Step 7: Handle network errors.
			console.error('Contact form error:', error);
			submitStatus = 'error';
			submitMessage = 'Network error. Please check your connection and try again.';
		} finally {
			// Step 8: Reset submitting state.
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Contact Us - AgriCommerce</title>
	<meta name="description" content="Get in touch with AgriCommerce. We're here to help with your questions about our products and services." />
</svelte:head>

<div class="contact-container container">
	<div class="contact-header">
		<h1>Contact Us</h1>
		<p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
	</div>
	
	<div class="contact-content">
		<!-- Contact Form -->
		<div class="contact-form-section">
			<div class="form-card card">
				<h2>Send us a Message</h2>
				
				<form class="contact-form" on:submit|preventDefault={handleSubmit}>
					<!-- Status Messages -->
					{#if submitStatus === 'success'}
						<div class="success-message">
							✅ {submitMessage}
						</div>
					{:else if submitStatus === 'error' && submitMessage}
						<div class="error-message">
							❌ {submitMessage}
						</div>
					{/if}
					
					<!-- Name Field -->
					<div class="form-group">
						<label for="name">Full Name</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							disabled={isSubmitting}
							class:error={errors.name}
							placeholder="Enter your full name"
						/>
						{#if errors.name}
							<span class="field-error">{errors.name}</span>
						{/if}
					</div>
					
					<!-- Email Field -->
					<div class="form-group">
						<label for="email">Email Address</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							disabled={isSubmitting}
							class:error={errors.email}
							placeholder="Enter your email address"
						/>
						{#if errors.email}
							<span class="field-error">{errors.email}</span>
						{/if}
					</div>
					
					<!-- Message Field -->
					<div class="form-group">
						<label for="message">Message</label>
						<textarea
							id="message"
							bind:value={message}
							required
							disabled={isSubmitting}
							class:error={errors.message}
							placeholder="Tell us how we can help you..."
							rows="6"
						></textarea>
						{#if errors.message}
							<span class="field-error">{errors.message}</span>
						{/if}
						<small class="field-hint">
							Please provide as much detail as possible so we can assist you better.
						</small>
					</div>
					
					<!-- Submit Button -->
					<button
						type="submit"
						class="btn btn-primary btn-full"
						disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
					>
						{isSubmitting ? 'Sending Message...' : 'Send Message'}
					</button>
				</form>
			</div>
		</div>
		
		<!-- Contact Information -->
		<div class="contact-info-section">
			<div class="info-card card">
				<h2>Get in Touch</h2>
				<div class="contact-methods">
					<div class="contact-method">
						<div class="method-icon">📧</div>
						<div class="method-content">
							<h4>Email</h4>
							<p>info@agricommerce.com</p>
							<small>We typically respond within 24 hours</small>
						</div>
					</div>
					
					<div class="contact-method">
						<div class="method-icon">📞</div>
						<div class="method-content">
							<h4>Phone</h4>
							<p>+1 (555) 123-4567</p>
							<small>Monday - Friday, 9 AM - 6 PM EST</small>
						</div>
					</div>
					
					<div class="contact-method">
						<div class="method-icon">📍</div>
						<div class="method-content">
							<h4>Address</h4>
							<p>123 Farm Road<br>Agricultural Valley, AV 12345</p>
							<small>Visit our farm store</small>
						</div>
					</div>
				</div>
			</div>
			
			<div class="info-card card">
				<h2>Frequently Asked Questions</h2>
				<div class="faq-list">
					<div class="faq-item">
						<h4>What are your delivery areas?</h4>
						<p>We deliver fresh produce within a 50-mile radius of our farm. Check our delivery page for specific areas.</p>
					</div>
					<div class="faq-item">
						<h4>How do you ensure product freshness?</h4>
						<p>All products are harvested within 24 hours of delivery and stored in optimal conditions to maintain freshness.</p>
					</div>
					<div class="faq-item">
						<h4>Do you offer bulk orders?</h4>
						<p>Yes! We offer special pricing for bulk orders. Contact us directly to discuss your needs.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.contact-container {
		padding: var(--space-8) var(--space-4);
		max-width: 1200px;
	}
	
	.contact-header {
		text-align: center;
		margin-bottom: var(--space-12);
	}
	
	.contact-header h1 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
	}
	
	.contact-header p {
		color: #6B7280;
		font-size: var(--text-lg);
		max-width: 600px;
		margin: 0 auto;
	}
	
	.contact-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
	}
	
	/* Form Section */
	.form-card {
		padding: var(--space-8);
	}
	
	.form-card h2 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-6);
	}
	
	.contact-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	
	textarea {
		resize: vertical;
		min-height: 120px;
	}
	
	.field-hint {
		color: #6B7280;
		font-size: var(--text-xs);
	}
	
	.btn-full {
		width: 100%;
	}
	
	.success-message {
		background-color: #F0FDF4;
		color: #166534;
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid #BBF7D0;
	}
	
	.error-message {
		background-color: #FEF2F2;
		color: #DC2626;
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid #FECACA;
	}
	
	.field-error {
		color: #DC2626;
		font-size: var(--text-sm);
	}
	
	input.error,
	textarea.error {
		border-color: #DC2626;
	}
	
	/* Contact Info Section */
	.contact-info-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	
	.info-card {
		padding: var(--space-6);
	}
	
	.info-card h2 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-6);
	}
	
	.contact-methods {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	
	.contact-method {
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
	}
	
	.method-icon {
		font-size: 1.5rem;
		width: 40px;
		height: 40px;
		background-color: var(--color-primary-light);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	
	.method-content h4 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-1);
	}
	
	.method-content p {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-1);
		font-weight: 500;
	}
	
	.method-content small {
		color: #6B7280;
		font-size: var(--text-sm);
	}
	
	/* FAQ Section */
	.faq-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	
	.faq-item {
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-neutral);
	}
	
	.faq-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
	
	.faq-item h4 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-2);
		font-size: var(--text-base);
	}
	
	.faq-item p {
		color: #6B7280;
		font-size: var(--text-sm);
		line-height: 1.6;
		margin-bottom: 0;
	}
	
	/* Mobile Responsive */
	@media (max-width: 768px) {
		.contact-content {
			grid-template-columns: 1fr;
		}
		
		.contact-method {
			flex-direction: column;
			text-align: center;
		}
	}
</style>