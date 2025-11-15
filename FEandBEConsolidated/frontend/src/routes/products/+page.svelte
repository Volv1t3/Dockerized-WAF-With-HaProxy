<!--
	Products List Page
	
	Displays all products with search and filtering capabilities.
	Similar to store but focused on product browsing.
-->

<script>
	/**
	 * @fileoverview Products list page component.
	 * @module routes/products/+page
	 * @description This component displays a paginated list of agricultural products, offering search functionality. It fetches product data from a backend API and presents it in a grid layout, with options to view product details.
	 * @dependencies svelte, $app/stores, $app/navigation
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	/**
	 * @type {any[]} products - Array to store the list of products fetched from the API.
	 * @type {boolean} isLoading - Flag to indicate if product data is currently being loaded.
	 * @type {string} error - Stores any error message that occurs during API calls.
	 * @type {string} searchQuery - The current search query applied to the product list.
	 * @type {string} inputValue - Binds to the search input field.
	 * @type {number} currentPage - The current page number for pagination.
	 * @type {number} totalPages - The total number of pages available for the current product list.
	 * @type {number} totalCount - The total number of products matching the current criteria.
	 */
	let products = [];
	let isLoading = true;
	let error = '';
	let searchQuery = '';
	let inputValue = '';
	let currentPage = 1;
	let totalPages = 1;
	let totalCount = 0;
	
	// Cart functionality
	/** @type {Record<string, number>} */
	let quantities = {}; // Track quantity for each product
	let showToast = false;
	let toastMessage = '';
	
	function setQuantity(productId, quantity) {
		if (quantity < 1) quantity = 1;
		console.log('Setting quantity for product:', productId, 'to:', quantity);
		quantities[productId] = quantity;
		quantities = { ...quantities }; // Force reactivity
		console.log('Updated quantities:', quantities);
	}
	
	function getQuantity(productId) {
		if (!(productId in quantities)) {
			quantities[productId] = 1;
			quantities = { ...quantities };
		}
		const qty = quantities[productId];
		console.log('Getting quantity for product:', productId, 'returning:', qty);
		return qty;
	}
	
	async function addToCart(product) {
		const quantity = getQuantity(product.id);
		
		try {
			// Get existing cart
			const existingCart = JSON.parse(localStorage.getItem('agricommerce_cart') || '[]');
			
			// Check if product already in cart
			const existingIndex = existingCart.findIndex(item => item.productId === product.id);
			
			if (existingIndex >= 0) {
				// Update quantity
				existingCart[existingIndex].quantity += quantity;
			} else {
				// Add new item
				existingCart.push({
					productId: product.id,
					name: product.name,
					priceCents: product.priceCents,
					imageUrl: product.imageUrl,
					quantity
				});
			}
			
			// Save to localStorage
			localStorage.setItem('agricommerce_cart', JSON.stringify(existingCart));
			
			// Reset quantity for this product
			setQuantity(product.id, 1);
			
			// Show success message
			showToastMessage(`${product.name} has been successfully added to your shopping cart. You can continue shopping or proceed to checkout when ready.`);
			
		} catch (error) {
			console.error('Add to cart error:', error);
			showToastMessage('Failed to add item to cart');
		}
	}
	
	function showToastMessage(message) {
		toastMessage = message;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}
	
	/**
	 * @function loadProducts
	 * @description Fetches a paginated and optionally filtered list of products from the backend API.
	 * Handles loading states and error reporting.
	 * @fires api/products - A GET request to the backend for product data.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Log a message indicating the start of product loading.
	 *   2. Set `isLoading` to true and clear any previous errors.
	 *   3. Construct URL search parameters for pagination (`page`, `pageSize`) and search query (`q`).
	 *   4. Construct the full API URL.
	 *   5. Log the URL being fetched for debugging.
	 *   6. Make a GET request to the API, including credentials.
	 *   7. Log the response status for debugging.
	 *   8. If the response is OK, parse the JSON data and update `products`, `totalPages`, and `totalCount`.
	 *   9. If the response is not OK, parse the error data, log it, and set the `error` message.
	 *   10. Catch any network errors, log them, and set a generic error message.
	 *   11. Set `isLoading` to false in the `finally` block and log the number of products loaded.
	 */
	async function loadProducts() {
		console.log('Loading products...');
		try {
			// Step 2: Set loading state and clear errors.
			isLoading = true;
			error = '';
			
			// Step 3: Construct URL search parameters.
			const params = new URLSearchParams({
				page: currentPage.toString(),
				pageSize: '12'
			});
			
			if (searchQuery.trim()) {
				params.set('q', searchQuery.trim());
			}
			
			// Step 4: Construct the full API URL.
			const url = `/api/products?${params}`;
			console.log('Fetching:', url);
			
			// Step 6: Make a GET request to the API.
			const response = await fetch(url, { credentials: 'include' });
			console.log('Response status:', response.status);
			
			// Step 8: Process successful response.
			if (response.ok) {
				const data = await response.json();
				console.log('API Response:', data);
				products = data.products || [];
				totalPages = data.pagination?.totalPages || 1;
				totalCount = data.pagination?.totalCount || 0;
				
				// Initialize quantities for all products
				products.forEach(product => {
					if (!(product.id in quantities)) {
						quantities[product.id] = 1;
					}
				});
				quantities = { ...quantities };
			} else {
				// Step 9: Handle API errors.
				const errorData = await response.json();
				console.error('API Error:', errorData);
				error = errorData.error?.message || 'Failed to load products';
			}
		} catch (err) {
			// Step 10: Handle network errors.
			console.error('Load products error:', err);
			error = 'Network error. Please try again.';
		} finally {
			// Step 11: Reset loading state and log completion.
			isLoading = false;
			console.log('Loading finished. Products:', products.length);
		}
	}
	
	/**
	 * @function handleSearch
	 * @description Initiates a product search based on the `inputValue`.
	 * It updates the URL's query parameters and triggers a page navigation.
	 * @param {Event} event - The form submission event.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Create new URL search parameters.
	 *   2. If `inputValue` is not empty, set the 'q' parameter.
	 *   3. Set the 'page' parameter to '1' to reset pagination for a new search.
	 *   4. Navigate to the updated URL, replacing the current history state.
	 */
	function handleSearch() {
		// Step 1: Create new URL search parameters.
		const params = new URLSearchParams();
		// Step 2: Set 'q' parameter if search input is not empty.
		if (inputValue.trim()) {
			params.set('q', inputValue.trim());
		}
		// Step 3: Reset page to 1 for new search.
		params.set('page', '1');
		
		// Step 4: Navigate to the new URL.
		goto(`/products?${params.toString()}`, { replaceState: true });
	}
	
	/**
	 * @function goToPage
	 * @description Navigates to a specified page number in the product list.
	 * It updates the URL's 'page' query parameter and triggers a page navigation.
	 * @param {number} pageNumber - The target page number.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Get current URL search parameters.
	 *   2. Set the 'page' parameter to the `pageNumber`.
	 *   3. Navigate to the updated URL, replacing the current history state.
	 */
	function goToPage(pageNumber) {
		// Step 1: Get current URL search parameters.
		const params = new URLSearchParams($page.url.searchParams);
		// Step 2: Set the new page number.
		params.set('page', pageNumber.toString());
		// Step 3: Navigate to the new URL.
		goto(`/products?${params.toString()}`, { replaceState: true });
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
	function formatPrice(cents) {
		// Step 1: Create a number formatter for USD.
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(cents / 100); // Step 2 & 3: Convert cents to dollars and format.
	}
	
	// Life-cycle method: onMount
	// Step 1: Initialize search query, input value, and current page from URL parameters.
	// Step 2: Load products when the component is first mounted with timeout to show animation.
	onMount(() => {
		const urlSearchParams = $page.url.searchParams;
		searchQuery = urlSearchParams.get('q') || '';
		inputValue = searchQuery;
		currentPage = parseInt(urlSearchParams.get('page') || '1', 10);
		
		// Add timeout to ensure loading animation is visible
		setTimeout(() => {
			loadProducts();
		}, 500);
	});
	
	// Reactive statement: React to URL changes
	// Step 1: Check if running in a browser environment.
	// Step 2: Get current URL parameters.
	// Step 3: Parse new page number and search query from URL.
	// Step 4: If page or query has changed, update state and reload products.
	$: if (typeof window !== 'undefined') {
		const urlParams = $page.url.searchParams;
		const newPage = parseInt(urlParams.get('page') || '1', 10);
		const newQuery = urlParams.get('q') || '';
		
		if (newPage !== currentPage || newQuery !== searchQuery) {
			currentPage = newPage;
			searchQuery = newQuery;
			inputValue = newQuery;
			
			// Add timeout to ensure loading animation is visible
			setTimeout(() => {
				loadProducts();
			}, 500);
		}
	}
</script>

<svelte:head>
	<title>Products - AgriCommerce</title>
	<meta name="description" content="Browse our complete selection of quality agricultural products from local farmers." />
</svelte:head>

<!-- Toast Notification -->
{#if showToast}
	<div class="toast">
		{toastMessage}
	</div>
{/if}

<div class="products-container container">
	<div class="products-header">
		<h1>All Products</h1>
		<p>Browse our complete selection of quality agricultural products</p>
	</div>
	
	<div class="search-section">
		<form class="search-form" on:submit|preventDefault={handleSearch}>
			<div class="search-input-group">
				<input
					type="text"
					bind:value={inputValue}
					placeholder="Search products..."
					class="search-input"
				/>
				<button type="submit" class="btn btn-primary">
					🔍 Search
				</button>
			</div>
		</form>
	</div>
	
	<div class="products-content">
		{#if isLoading}
			<div class="loading-state">
				<img src='/SpinnerForLoading.gif' alt='Loading animation' width='60' height='60'/>
				<p>Loading products...</p>
			</div>
		{:else if error}
			<div class="error-state card">
				<div class="error-icon">⚠️</div>
				<h3>Unable to Load Products</h3>
				<p>{error}</p>
				<button class="btn btn-primary" on:click={loadProducts}>
					Try Again
				</button>
			</div>
		{:else if products.length === 0}
			<div class="empty-state card">
				<div class="empty-icon">🔍</div>
				<h3>No Products Found</h3>
				<p>
					{searchQuery 
						? `No products match "${searchQuery}". Try a different search term.`
						: 'No products are currently available.'
					}
				</p>
			</div>
		{:else}
			<div class="products-grid">
				{#each products as product (product.id)}
					<div class="product-card card">
						<div class="product-image">
							<span class="product-placeholder">🥬</span>
						</div>
						<div class="product-info">
							<h3 class="product-name">{product.name}</h3>
							<p class="product-summary">{product.summary}</p>
							<div class="product-price">{formatPrice(product.priceCents)}</div>
						</div>
						<div class="product-actions">
							<div class="cart-controls">
								<div class="quantity-controls">
									<button on:click={() => setQuantity(product.id, getQuantity(product.id) - 1)}>-</button>
									<input type="number" bind:value={quantities[product.id]} on:input={(e) => setQuantity(product.id, parseInt(e.target.value) || 1)} min="1" />
									<button on:click={() => setQuantity(product.id, getQuantity(product.id) + 1)}>+</button>
								</div>
								<button class="btn btn-primary add-to-cart" on:click={() => addToCart(product)}>
									Add to Cart
								</button>
							</div>
							<a href="/products/{product.slug}" class="btn btn-outline btn-full">
								View Details
							</a>
						</div>
					</div>
				{/each}
			</div>
			
			{#if totalPages > 1}
				<div class="pagination">
					<button
						class="btn btn-outline"
						disabled={currentPage <= 1}
						on:click={() => goToPage(currentPage - 1)}
					>
						← Previous
					</button>
					
					<span class="pagination-info">
						Page {currentPage} of {totalPages}
					</span>
					
					<button
						class="btn btn-outline"
						disabled={currentPage >= totalPages}
						on:click={() => goToPage(currentPage + 1)}
					>
						Next →
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.products-container {
		padding: var(--space-8) var(--space-4);
	}
	
	.products-header {
		text-align: center;
		margin-bottom: var(--space-8);
	}
	
	.products-header h1 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-2);
	}
	
	.products-header p {
		color: #6B7280;
		font-size: var(--text-lg);
		margin-bottom: 0;
	}
	
	.search-section {
		margin-bottom: var(--space-8);
	}
	
	.search-form {
		max-width: 500px;
		margin: 0 auto;
	}
	
	.search-input-group {
		display: flex;
		gap: var(--space-3);
	}
	
	.search-input {
		flex: 1;
	}
	
	.loading-state {
		text-align: center;
		align-items: center;
		display: block;
		align-content: center;
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
	
	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-6);
		margin-bottom: var(--space-8);
	}
	
	.product-card {
		display: flex;
		flex-direction: column;
		transition: transform var(--transition-normal);
	}
	
	.product-card:hover {
		transform: translateY(-4px);
	}
	
	.product-image {
		height: 200px;
		background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-accent) 100%);
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-4);
	}
	
	.product-placeholder {
		font-size: 4rem;
		opacity: 0.7;
	}
	
	.product-info {
		flex: 1;
		margin-bottom: var(--space-4);
	}
	
	.product-name {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-2);
		font-size: var(--text-lg);
	}
	
	.product-summary {
		color: #6B7280;
		font-size: var(--text-sm);
		margin-bottom: var(--space-3);
		line-height: 1.5;
	}
	
	.product-price {
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--color-primary);
	}
	
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--space-4);
		margin-top: var(--space-8);
	}
	
	.pagination-info {
		color: #6B7280;
		font-size: var(--text-sm);
	}
	
	.cart-controls {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}
	
	.quantity-controls {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex: 1;
	}
	
	.quantity-controls button {
		width: 32px;
		height: 32px;
		border: 1px solid var(--color-neutral);
		background: white;
		cursor: pointer;
		border-radius: var(--radius-sm);
		font-weight: 600;
	}
	
	.quantity-controls input {
		width: 50px;
		text-align: center;
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-sm);
		padding: var(--space-1);
		height: 32px;
	}
	
	.add-to-cart {
		flex: 2;
		height: 32px;
		padding: 0 var(--space-2);
		font-size: var(--text-sm);
	}
	
	.btn-full {
		width: 100%;
	}
	
	.toast {
		position: fixed;
		top: var(--space-4);
		right: var(--space-4);
		background: var(--color-primary);
		color: white;
		padding: var(--space-4) var(--space-6);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: 1001;
		max-width: 400px;
		animation: slideInRight 0.3s ease-out;
	}
	
	@keyframes slideInRight {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
	
	@media (max-width: 768px) {
		.search-input-group {
			flex-direction: column;
		}
		
		.products-grid {
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		}
		
		.cart-controls {
			flex-direction: column;
			gap: var(--space-2);
		}
		
		.quantity-controls {
			justify-content: center;
		}
	}
</style>