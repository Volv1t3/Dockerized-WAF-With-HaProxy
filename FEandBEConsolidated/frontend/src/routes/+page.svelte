<script>
	/**
	 * @fileoverview Landing page component for AgriCommerce.
	 * @module routes/+page
	 * @description This component serves as the homepage for the AgriCommerce application, featuring a hero section, product highlights, a newsletter signup form, and a preview of featured products. It showcases the agricultural theme and design elements.
	 * @dependencies svelte
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { onMount } from 'svelte';
	
	// Newsletter signup state
	/**
	 * @type {string} email - Binds to the email input field for newsletter signup.
	 * @type {boolean} isSubmitting - Controls the submission state of the newsletter form, disabling inputs and changing button text.
	 * @type {string} submitMessage - Displays feedback to the user after newsletter submission (success or error).
	 */
	let email = '';
	let isSubmitting = false;
	let submitMessage = '';
	
	/**
	 * @function handleNewsletterSignup
	 * @description Handles the submission of the newsletter signup form. It simulates an asynchronous signup process and provides user feedback.
	 * @param {Event} event - The form submission event.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Prevent form default submission behavior.
	 *   2. Check if the email input is empty; if so, exit.
	 *   3. Set `isSubmitting` to true and clear previous messages.
	 *   4. Simulate an asynchronous operation (e.g., API call) using `setTimeout`.
	 *   5. On successful simulation, set a success message and clear the email input.
	 *   6. On error, set an error message.
	 *   7. Reset `isSubmitting` to false in a `finally` block.
	 */
	async function handleNewsletterSignup() {
		// Step 1: Prevent form default submission behavior.
		// (Handled by on:submit|preventDefault in template)
		
		// Step 2: Validate email input.
		if (!email.trim()) return;
		
		// Step 3: Set submission state.
		isSubmitting = true;
		submitMessage = '';
		
		try {
			// Step 4: Simulate newsletter signup (replace with actual API call in production).
			await new Promise(resolve => setTimeout(resolve, 1000));
			// Step 5: Set success message and clear form.
			submitMessage = 'Thank you for subscribing to our newsletter!';
			email = '';
		} catch (error) {
			// Step 6: Set error message.
			submitMessage = 'Something went wrong. Please try again.';
		} finally {
			// Step 7: Reset submission state.
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>AgriCommerce - Quality Agricultural Products</title>
	<meta name="description" content="Discover quality agricultural products and sustainable farming practices. Connect with local farmers and find the best produce for your needs." />
</svelte:head>

<!-- Hero Section -->
<section class="hero">
	<div class="hero-content container">
		<div class="hero-text">
			<h1 class="hero-title">
				Quality Agricultural Products
				<span class="text-primary">From Farm to Table</span>
			</h1>
			<p class="hero-description">
				Discover fresh, sustainable agricultural products directly from local farmers. 
				We connect communities with quality produce and promote sustainable farming practices.
			</p>
			<div class="hero-actions">
				<a href="/store" class="btn btn-primary btn-large">
					🛒 Shop Now
				</a>
				<a href="/about" class="btn btn-outline btn-large">
					Learn More
				</a>
			</div>
		</div>
		<div class="hero-image">
			<div class="hero-image-placeholder">
				<span class="hero-icon">🌾</span>
				<p>Beautiful farmland imagery</p>
			</div>
		</div>
	</div>
</section>

<!-- Highlights Section -->
<section class="highlights py-8">
	<div class="container">
		<h2 class="section-title text-center">Why Choose AgriCommerce</h2>
		<div class="highlights-grid">
			<div class="highlight-card card">
				<div class="highlight-icon">🥕</div>
				<h3>Fresh Products</h3>
				<p>
					Direct from local farms, our products are harvested at peak freshness 
					and delivered quickly to maintain quality and nutritional value.
				</p>
				<a href="/products" class="highlight-link">Browse Products →</a>
			</div>
			
			<div class="highlight-card card">
				<div class="highlight-icon">🌱</div>
				<h3>Sustainable Practices</h3>
				<p>
					We partner with farmers who use environmentally responsible methods, 
					promoting soil health and biodiversity for future generations.
				</p>
				<a href="/about" class="highlight-link">Our Mission →</a>
			</div>
			
			<div class="highlight-card card">
				<div class="highlight-icon">🏷️</div>
				<h3>Seasonal Offers</h3>
				<p>
					Take advantage of seasonal discounts and special promotions on 
					fresh produce and agricultural supplies throughout the year.
				</p>
				<a href="/discounts" class="highlight-link">View Offers →</a>
			</div>
			
			<div class="highlight-card card">
				<div class="highlight-icon">🤝</div>
				<h3>Community Support</h3>
				<p>
					By choosing AgriCommerce, you're supporting local farming communities 
					and contributing to sustainable agricultural development.
				</p>
				<a href="/history" class="highlight-link">Our Story →</a>
			</div>
		</div>
	</div>
</section>

<!-- Newsletter Section -->
<section class="newsletter py-8">
	<div class="container">
		<div class="newsletter-content">
			<div class="newsletter-text">
				<h2>Stay Updated</h2>
				<p>
					Get the latest news about seasonal products, farming tips, 
					and exclusive offers delivered to your inbox.
				</p>
			</div>
			<form class="newsletter-form" on:submit|preventDefault={handleNewsletterSignup}>
				<div class="newsletter-input-group">
					<input
						type="email"
						bind:value={email}
						placeholder="Enter your email address"
						required
						disabled={isSubmitting}
						class="newsletter-input"
					/>
					<button 
						type="submit" 
						class="btn btn-secondary"
						disabled={isSubmitting || !email.trim()}
					>
						{isSubmitting ? 'Subscribing...' : 'Subscribe'}
					</button>
				</div>
				{#if submitMessage}
					<p class="newsletter-message" class:success={submitMessage.includes('Thank you')}>
						{submitMessage}
					</p>
				{/if}
			</form>
		</div>
	</div>
</section>

<!-- Featured Products Preview -->
<section class="featured-products py-8">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title">Featured Products</h2>
			<a href="/products" class="btn btn-outline">View All Products</a>
		</div>
		<div class="products-preview">
			<div class="product-card card">
				<div class="product-image">🥬</div>
				<h3>Organic Lettuce</h3>
				<p class="product-price">$3.99</p>
				<p class="product-description">Fresh, crispy organic lettuce grown locally</p>
			</div>
			<div class="product-card card">
				<div class="product-image">🍅</div>
				<h3>Heirloom Tomatoes</h3>
				<p class="product-price">$5.49</p>
				<p class="product-description">Vine-ripened heirloom tomatoes, full of flavor</p>
			</div>
			<div class="product-card card">
				<div class="product-image">🥕</div>
				<h3>Rainbow Carrots</h3>
				<p class="product-price">$2.99</p>
				<p class="product-description">Colorful, sweet carrots packed with nutrients</p>
			</div>
		</div>
	</div>
</section>

<style>
	/* Hero Section Styles */
	.hero {
		background: linear-gradient(135deg, var(--color-neutral-light) 0%, var(--color-neutral) 100%);
		padding: var(--space-16) 0;
		min-height: 70vh;
		display: flex;
		align-items: center;
	}
	
	.hero-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-12);
		align-items: center;
	}
	
	.hero-title {
		font-size: var(--text-4xl);
		font-weight: 700;
		line-height: 1.1;
		margin-bottom: var(--space-6);
	}
	
	.hero-description {
		font-size: var(--text-lg);
		color: #6B7280;
		margin-bottom: var(--space-8);
		line-height: 1.6;
	}
	
	.hero-actions {
		display: flex;
		gap: var(--space-4);
		flex-wrap: wrap;
	}
	
	.btn-large {
		padding: var(--space-4) var(--space-8);
		font-size: var(--text-lg);
	}
	
	.hero-image-placeholder {
		background-color: var(--color-primary-light);
		border-radius: var(--radius-xl);
		padding: var(--space-16);
		text-align: center;
		color: var(--color-primary-dark);
		min-height: 300px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.hero-icon {
		font-size: 4rem;
		margin-bottom: var(--space-4);
	}
	
	/* Highlights Section */
	.highlights {
		background-color: var(--color-neutral-white);
	}
	
	.section-title {
		margin-bottom: var(--space-12);
		color: var(--color-neutral-dark);
	}
	
	.highlights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-6);
	}
	
	.highlight-card {
		text-align: center;
		transition: transform var(--transition-normal);
	}
	
	.highlight-card:hover {
		transform: translateY(-4px);
	}
	
	.highlight-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}
	
	.highlight-link {
		color: var(--color-primary);
		font-weight: 500;
		text-decoration: none;
		display: inline-block;
		margin-top: var(--space-4);
	}
	
	.highlight-link:hover {
		color: var(--color-primary-dark);
	}
	
	/* Newsletter Section */
	.newsletter {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: var(--color-neutral-white);
	}
	
	.newsletter-content {
		max-width: 600px;
		margin: 0 auto;
		text-align: center;
	}
	
	.newsletter-text h2 {
		color: var(--color-neutral-white);
		margin-bottom: var(--space-4);
	}
	
	.newsletter-text p {
		font-size: var(--text-lg);
		margin-bottom: var(--space-8);
		opacity: 0.9;
	}
	
	.newsletter-input-group {
		display: flex;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}
	
	.newsletter-input {
		flex: 1;
		border: none;
		border-radius: var(--radius-md);
	}
	
	.newsletter-message {
		font-size: var(--text-sm);
		margin-top: var(--space-3);
	}
	
	.newsletter-message.success {
		color: var(--color-primary-accent);
	}
	
	/* Featured Products Section */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-8);
	}
	
	.products-preview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-6);
	}
	
	.product-card {
		text-align: center;
		transition: transform var(--transition-normal);
	}
	
	.product-card:hover {
		transform: translateY(-2px);
	}
	
	.product-image {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}
	
	.product-price {
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-2);
	}
	
	.product-description {
		color: #6B7280;
		font-size: var(--text-sm);
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-content {
			grid-template-columns: 1fr;
			text-align: center;
		}
		
		.hero-title {
			font-size: var(--text-3xl);
		}
		
		.newsletter-input-group {
			flex-direction: column;
		}
		
		.section-header {
			flex-direction: column;
			gap: var(--space-4);
			text-align: center;
		}
	}
</style>