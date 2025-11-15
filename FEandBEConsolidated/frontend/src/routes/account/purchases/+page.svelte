<!--
	Purchase History Page
	
	Displays user's purchase history with items, dates, and totals.
	Includes pagination and detailed purchase information.
-->

<script lang="ts">
	/**
	 * @fileoverview Purchase history page component.
	 * @module routes/account/purchases/+page
	 * @description This component displays a user's past purchase orders, including details like order ID, date, total amount, and a list of purchased items. It handles loading states, errors, and an empty state for users with no purchases.
	 * @dependencies svelte, $app/stores
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	// Component state
	/**
	 * @type {any[]} purchases - Array to store the user's purchase history.
	 * @type {boolean} isLoading - Flag to indicate if purchase data is currently being loaded.
	 * @type {string} error - Stores any error message that occurs during API calls.
	 */
	let purchases: any[] = [];
	let isLoading = true;
	let error = '';
	
	// Get user data from page data
	/**
	 * @type {App.PageData['user']} user - Reactive variable holding the authenticated user's data.
	 * It is derived from the `$page.data.user` store, which is populated by server-side load functions.
	 */
	$: user = $page.data.user;
	
	/**
	 * @function loadPurchases
	 * @description Fetches the user's purchase history from the backend API.
	 * Handles loading states and error reporting.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Set `isLoading` to true and clear any previous errors.
	 *   2. Make a GET request to the `/api/purchases` endpoint, including credentials.
	 *   3. If the response is OK, parse the JSON data and update the `purchases` array.
	 *   4. If the response is not OK, parse the error data and set the `error` message.
	 *   5. Catch any network errors and set a generic error message.
	 *   6. Set `isLoading` to false in the `finally` block.
	 */
	async function loadPurchases() {
		try {
			// Step 1: Set loading state and clear errors.
			isLoading = true;
			error = '';
			
			// Step 2: Fetch purchase data from the API.
			const response = await fetch('/api/purchases', {
				credentials: 'include'
			});
			
			// Step 3: Process the response.
			if (response.ok) {
				purchases = await response.json();
			} else {
				// Step 4: Handle API errors.
				const errorData = await response.json();
				error = errorData.error?.message || 'Failed to load purchase history';
			}
		} catch (err) {
			// Step 5: Handle network errors.
			console.error('Load purchases error:', err);
			error = 'Network error. Please try again.';
		} finally {
			// Step 6: Reset loading state.
			isLoading = false;
		}
	}
	
	/**
	 * @function formatPrice
	 * @description Formats a price from cents into a currency string (e.g., "$12.34").
	 * @param {number} cents - The price in cents.
	 * @returns {string} The formatted currency string.
	 *
	 * Steps:
	 *   1. Create a new `Intl.NumberFormat` instance for USD currency.
	 *   2. Divide the `cents` value by 100 to get dollars.
	 *   3. Format the number using the created formatter.
	 */
	function formatPrice(cents: number): string {
		// Step 1: Create a number formatter for USD.
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		});
		// Step 2 & 3: Convert cents to dollars and format.
		return formatter.format(cents / 100);
	}
	
	/**
	 * @function formatDate
	 * @description Formats a date string into a short, human-readable format including time (e.g., "Nov 11, 2025, 10:30 AM").
	 * @param {string} dateString - The date string to format.
	 * @returns {string} The formatted date and time string.
	 *
	 * Steps:
	 *   1. Create a new `Date` object from the input `dateString`.
	 *   2. Use `toLocaleDateString` with 'en-US' locale and specific options for formatting date and time.
	 */
	function formatDate(dateString: string): string {
		// Step 1: Create a Date object.
		const date = new Date(dateString);
		// Step 2: Format the date and time to a readable string.
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	/**
	 * @function getTotalItems
	 * @description Calculates the total quantity of items across all products in a purchase.
	 * @param {any[]} items - An array of item objects, each with a `quantity` property.
	 * @returns {number} The total number of items.
	 *
	 * Steps:
	 *   1. Use the `reduce` method to sum the `quantity` of each item in the array.
	 */
	function getTotalItems(items: any[]): number {
		// Step 1: Sum the quantities of all items.
		return items.reduce((total, item) => total + item.quantity, 0);
	}
	
	// Life-cycle method: onMount
	// Step 1: Load purchases when the component is first mounted.
	onMount(loadPurchases);
</script>

<svelte:head>
	<title>Purchase History - AgriCommerce</title>
	<meta name="description" content="View your AgriCommerce purchase history and order details." />
</svelte:head>

<div class="purchases-container container">
	<div class="purchases-header">
		<div class="header-content">
			<h1>Purchase History</h1>
			<p>View your past orders and purchase details</p>
		</div>
		<a href="/account" class="btn btn-outline">
			← Back to Account
		</a>
	</div>
	
	<div class="purchases-content">
		{#if isLoading}
			<!-- Loading State -->
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading your purchase history...</p>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="error-state card">
				<div class="error-icon">⚠️</div>
				<h3>Unable to Load Purchases</h3>
				<p>{error}</p>
				<button class="btn btn-primary" on:click={loadPurchases}>
					Try Again
				</button>
			</div>
		{:else if purchases.length === 0}
			<!-- Empty State -->
			<div class="empty-state card">
				<div class="empty-icon">🛒</div>
				<h3>No Purchases Yet</h3>
				<p>You haven't made any purchases yet. Start shopping to see your order history here.</p>
				<a href="/store" class="btn btn-primary">
					Start Shopping
				</a>
			</div>
		{:else}
			<!-- Purchases List -->
			<div class="purchases-list">
				{#each purchases as purchase (purchase.id)}
					<div class="purchase-card card">
						<div class="purchase-header">
							<div class="purchase-info">
								<h3>Order #{purchase.id.slice(-8).toUpperCase()}</h3>
								<p class="purchase-date">{formatDate(purchase.createdAt)}</p>
							</div>
							<div class="purchase-total">
								<span class="total-label">Total</span>
								<span class="total-amount">{formatPrice(purchase.totalCents)}</span>
							</div>
						</div>
						
						<div class="purchase-summary">
							<span class="items-count">
								{getTotalItems(purchase.items)} item{getTotalItems(purchase.items) !== 1 ? 's' : ''}
							</span>
						</div>
						
						<div class="purchase-items">
							<h4>Items Purchased</h4>
							<div class="items-list">
								{#each purchase.items as item (item.id)}
									<div class="item-row">
										<div class="item-info">
											<span class="item-name">{item.product.name}</span>
											<span class="item-quantity">Qty: {item.quantity}</span>
										</div>
										<span class="item-price">
											{formatPrice(item.priceCentsAtPurchase)}
										</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.purchases-container {
		padding: var(--space-8) var(--space-4);
		max-width: 800px;
	}
	
	.purchases-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-8);
		gap: var(--space-4);
	}
	
	.header-content h1 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-2);
	}
	
	.header-content p {
		color: #6B7280;
		margin-bottom: 0;
	}
	
	/* Loading State */
	.loading-state {
		text-align: center;
		padding: var(--space-16);
	}
	
	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-neutral);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto var(--space-4);
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Error and Empty States */
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
	
	.error-state h3,
	.empty-state h3 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
	}
	
	.error-state p,
	.empty-state p {
		color: #6B7280;
		margin-bottom: var(--space-8);
	}
	
	/* Purchases List */
	.purchases-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}
	
	.purchase-card {
		padding: var(--space-6);
		transition: box-shadow var(--transition-normal);
	}
	
	.purchase-card:hover {
		box-shadow: var(--shadow-md);
	}
	
	.purchase-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-neutral);
	}
	
	.purchase-info h3 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-1);
		font-size: var(--text-lg);
	}
	
	.purchase-date {
		color: #6B7280;
		font-size: var(--text-sm);
		margin-bottom: 0;
	}
	
	.purchase-total {
		text-align: right;
	}
	
	.total-label {
		display: block;
		color: #6B7280;
		font-size: var(--text-sm);
		margin-bottom: var(--space-1);
	}
	
	.total-amount {
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--color-primary);
	}
	
	.purchase-summary {
		margin-bottom: var(--space-6);
	}
	
	.items-count {
		color: #6B7280;
		font-size: var(--text-sm);
	}
	
	.purchase-items h4 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
		font-size: var(--text-base);
	}
	
	.items-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	
	.item-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3);
		background-color: var(--color-neutral-light);
		border-radius: var(--radius-md);
	}
	
	.item-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	
	.item-name {
		font-weight: 500;
		color: var(--color-neutral-dark);
	}
	
	.item-quantity {
		font-size: var(--text-sm);
		color: #6B7280;
	}
	
	.item-price {
		font-weight: 500;
		color: var(--color-primary);
	}
	
	/* Mobile Responsive */
	@media (max-width: 768px) {
		.purchases-header {
			flex-direction: column;
			align-items: stretch;
		}
		
		.purchase-header {
			flex-direction: column;
			gap: var(--space-4);
		}
		
		.purchase-total {
			text-align: left;
		}
		
		.item-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-2);
		}
	}
</style>