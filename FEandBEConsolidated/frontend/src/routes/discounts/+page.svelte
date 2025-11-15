<!--
	Discounts Page
	
	Displays active promotional offers and discounts.
	Shows discount cards with details and validity periods.
-->

<script>
	/**
	 * @fileoverview Discounts page component.
	 * @module routes/discounts/+page
	 * @description This component displays a list of active promotional offers and discounts available on AgriCommerce. It fetches discount data from a backend API and presents it in a card-based layout, including details like percentage off, title, description, and validity period.
	 * @dependencies svelte
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { onMount } from 'svelte';
	
	/**
	 * @type {any[]} discounts - Array to store the list of active discounts fetched from the API.
	 * @type {boolean} isLoading - Flag to indicate if discount data is currently being loaded.
	 * @type {string} error - Stores any error message that occurs during API calls.
	 */
	let discounts = [];
	let isLoading = true;
	let error = '';
	
	/**
	 * @function loadDiscounts
	 * @description Fetches the list of active discounts from the backend API.
	 * Handles loading states and error reporting.
	 * @fires api/discounts - A GET request to the backend for active discounts.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Log a message indicating the start of discount loading.
	 *   2. Set `isLoading` to true and clear any previous errors.
	 *   3. Make a GET request to the `/api/discounts` endpoint, including credentials.
	 *   4. Log the response status for debugging.
	 *   5. If the response is OK, parse the JSON data and update the `discounts` array.
	 *   6. If the response is not OK, parse the error data, log it, and set the `error` message.
	 *   7. Catch any network errors, log them, and set a generic error message.
	 *   8. Set `isLoading` to false in the `finally` block and log the number of discounts loaded.
	 */
	async function loadDiscounts() {
		console.log('Loading discounts...');
		try {
			// Step 2: Set loading state and clear errors.
			isLoading = true;
			error = '';
			
			// Step 3: Fetch discount data from the API.
			const response = await fetch('/api/discounts', { credentials: 'include' });
			console.log('Discounts response status:', response.status);
			
			// Step 5: Process successful response.
			if (response.ok) {
				const data = await response.json();
				console.log('Discounts data:', data);
				discounts = data || [];
			} else {
				// Step 6: Handle API errors.
				const errorData = await response.json();
				console.error('Discounts API Error:', errorData);
				error = errorData.error?.message || 'Failed to load discounts';
			}
		} catch (err) {
			// Step 7: Handle network errors.
			console.error('Load discounts error:', err);
			error = 'Network error. Please try again.';
		} finally {
			// Step 8: Reset loading state and log completion.
			isLoading = false;
			console.log('Discounts loading finished. Count:', discounts.length);
		}
	}
	
	/**
	 * @function formatDate
	 * @description Formats a date string into a long, human-readable format (e.g., "November 11, 2025").
	 * @param {string} dateString - The date string to format.
	 * @returns {string} The formatted date string.
	 *
	 * Steps:
	 *   1. Create a new `Date` object from the input `dateString`.
	 *   2. Use `toLocaleDateString` with 'en-US' locale and specific options for formatting.
	 */
	function formatDate(dateString) {
		// Step 1 & 2: Format the date to a readable string.
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	// Life-cycle method: onMount
	// Step 1: Load discounts when the component is first mounted with timeout to show animation.
	onMount(() => {
		// Add timeout to ensure loading animation is visible
		setTimeout(() => {
			loadDiscounts();
		}, 500);
	});
</script>

<svelte:head>
	<title>Offers & Discounts - AgriCommerce</title>
	<meta name="description" content="Discover current offers and discounts on quality agricultural products at AgriCommerce." />
</svelte:head>

<div class="discounts-container container">
	<div class="discounts-header">
		<h1>Current Offers</h1>
		<p>Save on quality agricultural products with our seasonal discounts</p>
	</div>
	
	<div class="discounts-content">
		{#if isLoading}
			<div class="loading-state">
				<img src='/SpinnerForLoading.gif' alt='Loading animation' width='60' height='60'/>
				<p>Loading current offers...</p>
			</div>
		{:else if error}
			<div class="error-state card">
				<div class="error-icon">⚠️</div>
				<h3>Unable to Load Offers</h3>
				<p>{error}</p>
				<button class="btn btn-primary" on:click={loadDiscounts}>
					Try Again
				</button>
			</div>
		{:else if discounts.length === 0}
			<div class="empty-state card">
				<div class="empty-icon">🏷️</div>
				<h3>No Active Offers</h3>
				<p>Check back soon for new seasonal discounts and special promotions!</p>
				<a href="/store" class="btn btn-primary">
					Browse Products
				</a>
			</div>
		{:else}
			<div class="discounts-grid">
				{#each discounts as discount (discount.id)}
					<div class="discount-card card">
						<div class="discount-badge">
							{discount.percentOff}% OFF
						</div>
						<div class="discount-content">
							<h3>{discount.title}</h3>
							<p class="discount-description">{discount.description}</p>
							<div class="discount-validity">
								<span class="validity-label">Valid:</span>
								<span class="validity-dates">
									{formatDate(discount.startsAt)} - {formatDate(discount.endsAt)}
								</span>
							</div>
						</div>
						<div class="discount-actions">
							<a href="/store" class="btn btn-primary">
								Shop Now
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.discounts-container {
		padding: var(--space-8) var(--space-4);
	}
	
	.discounts-header {
		text-align: center;
		margin-bottom: var(--space-12);
	}
	
	.discounts-header h1 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-2);
	}
	
	.discounts-header p {
		color: #6B7280;
		font-size: var(--text-lg);
		margin-bottom: 0;
	}
	
	.loading-state {
		text-align: center;
		padding: var(--space-16);
	}
	
	.error-state,
	.empty-state {
		text-align: center;
		padding: var(--space-12);
		max-width: 500px;
		margin: 0 auto;
	}
	
	.error-icon,
	.empty-icon {
		font-size: 4rem;
		margin-bottom: var(--space-6);
	}
	
	.discounts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: var(--space-6);
	}
	
	.discount-card {
		position: relative;
		padding: var(--space-6);
		transition: transform var(--transition-normal);
		overflow: hidden;
	}
	
	.discount-card:hover {
		transform: translateY(-4px);
	}
	
	.discount-badge {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
		background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-accent) 100%);
		color: var(--color-neutral-white);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-lg);
		font-weight: 600;
		font-size: var(--text-lg);
		box-shadow: var(--shadow-md);
	}
	
	.discount-content {
		margin-bottom: var(--space-6);
		padding-right: var(--space-16);
	}
	
	.discount-content h3 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-3);
		font-size: var(--text-xl);
	}
	
	.discount-description {
		color: #6B7280;
		margin-bottom: var(--space-4);
		line-height: 1.6;
	}
	
	.discount-validity {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	
	.validity-label {
		font-size: var(--text-sm);
		color: #6B7280;
		font-weight: 500;
	}
	
	.validity-dates {
		color: var(--color-primary);
		font-weight: 500;
	}
	
	@media (max-width: 768px) {
		.discounts-grid {
			grid-template-columns: 1fr;
		}
		
		.discount-content {
			padding-right: 0;
			margin-bottom: var(--space-8);
		}
		
		.discount-badge {
			position: static;
			display: inline-block;
			margin-bottom: var(--space-4);
		}
	}
</style>