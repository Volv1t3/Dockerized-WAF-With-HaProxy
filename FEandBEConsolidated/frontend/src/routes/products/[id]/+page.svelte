<!--
	Product Detail Page
	
	Displays detailed information for a specific product.
	Shows product description, price, and related information.
-->

<script>
	/**
	 * @fileoverview Product detail page component.
	 * @module routes/products/[id]/+page
	 * @description This component displays comprehensive details for a single product, identified by its ID in the URL parameters. It fetches product data from a backend API, including its name, summary, price, description, and other relevant attributes. It also handles loading states and error display.
	 * @dependencies svelte, $app/stores
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	/**
	 * @type {any | null} product - Stores the detailed product object fetched from the API, or null if not loaded.
	 * @type {boolean} isLoading - Flag to indicate if product data is currently being loaded.
	 * @type {string} error - Stores any error message that occurs during API calls.
	 */
	let product = null;
	let isLoading = true;
	let error = '';
	
	// Cart functionality
	let quantity = 1;
	let showToast = false;
	let toastMessage = '';
	
	function setQuantity(newQuantity) {
		if (newQuantity < 1) newQuantity = 1;
		quantity = newQuantity;
	}
	
	async function addToCart() {
		if (!product) return;
		
		try {
			const existingCart = JSON.parse(localStorage.getItem('agricommerce_cart') || '[]');
			const existingIndex = existingCart.findIndex(item => item.productId === product.id);
			
			if (existingIndex >= 0) {
				existingCart[existingIndex].quantity += quantity;
			} else {
				existingCart.push({
					productId: product.id,
					name: product.name,
					priceCents: product.priceCents,
					imageUrl: product.imageUrl,
					quantity
				});
			}
			
			localStorage.setItem('agricommerce_cart', JSON.stringify(existingCart));
			quantity = 1;
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
	 * @type {string} productId - Reactive variable holding the product ID extracted from the URL parameters.
	 */
	$: productId = $page.params.id;
	
	/**
	 * @function loadProduct
	 * @description Fetches the detailed information for a specific product from the backend API using its `productId`.
	 * Handles loading states and error reporting.
	 * @fires api/products/:id - A GET request to the backend for a specific product.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Set `isLoading` to true and clear any previous errors.
	 *   2. Make a GET request to the `/api/products/:productId` endpoint, including credentials.
	 *   3. If the response is OK, parse the JSON data and update the `product` state.
	 *   4. If the response is not OK, parse the error data and set the `error` message.
	 *   5. Catch any network errors and set a generic error message.
	 *   6. Set `isLoading` to false in the `finally` block.
	 */
	async function loadProduct() {
		try {
			// Step 1: Set loading state and clear errors.
			isLoading = true;
			error = '';
			
			// Step 2: Fetch product data from the API.
			const response = await fetch(`/api/products/${productId}`, { credentials: 'include' });
			
			// Step 3: Process successful response.
			if (response.ok) {
				product = await response.json();
			} else {
				// Step 4: Handle API errors.
				const errorData = await response.json();
				error = errorData.error?.message || 'Product not found';
			}
		} catch (err) {
			// Step 5: Handle network errors.
			console.error('Load product error:', err);
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
	function formatPrice(cents) {
		// Step 1: Create a number formatter for USD.
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(cents / 100); // Step 2 & 3: Convert cents to dollars and format.
	}
	
	// Life-cycle method: onMount
	// Step 1: Load product details when the component is first mounted, if `productId` is available.
	onMount(() => {
		if (productId) {
			loadProduct();
		}
	});
	
	// Reactive statement: Reload product if `productId` changes (e.g., navigating between product pages).
	// Step 1: Check if `productId` exists and if running in a browser environment.
	// Step 2: Call `loadProduct` whenever `productId` changes.
	$: if (productId && typeof window !== 'undefined') {
		loadProduct();
	}
</script>

<svelte:head>
	<title>{product ? `${product.name} - AgriCommerce` : 'Product - AgriCommerce'}</title>
	<meta name="description" content={product ? product.summary : 'Quality agricultural product from AgriCommerce'} />
</svelte:head>

{#if showToast}
	<div class="toast">
		{toastMessage}
	</div>
{/if}

<div class="product-container container">
	{#if isLoading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading product details...</p>
		</div>
	{:else if error}
		<div class="error-state card">
			<div class="error-icon">⚠️</div>
			<h3>Product Not Found</h3>
			<p>{error}</p>
			<div class="error-actions">
				<a href="/products" class="btn btn-primary">
					← Back to Products
				</a>
				<button class="btn btn-outline" on:click={loadProduct}>
					Try Again
				</button>
			</div>
		</div>
	{:else if product}
		<div class="product-detail">
			<div class="product-breadcrumb">
				<a href="/products">Products</a>
				<span>›</span>
				<span>{product.name}</span>
			</div>
			
			<div class="product-content">
				<div class="product-image-section">
					<div class="product-image-large">
						<span class="product-placeholder">🥬</span>
					</div>
				</div>
				
				<div class="product-info-section">
					<h1 class="product-title">{product.name}</h1>
					<p class="product-summary">{product.summary}</p>
					<div class="product-price-large">{formatPrice(product.priceCents)}</div>
					
					<div class="product-description">
						<h3>Description</h3>
						<p>{product.description}</p>
					</div>
					
					<div class="cart-section">
						<div class="quantity-controls-large">
							<button on:click={() => setQuantity(quantity - 1)}>-</button>
							<input type="number" bind:value={quantity} on:input={(e) => setQuantity(parseInt(e.target.value) || 1)} min="1" />
							<button on:click={() => setQuantity(quantity + 1)}>+</button>
						</div>
						<button class="btn btn-primary btn-large add-to-cart-large" on:click={addToCart}>
							🛒 Add to Cart
						</button>
					</div>
					
					<div class="product-actions">
						<button class="btn btn-outline btn-large">
							❤️ Save for Later
						</button>
					</div>
					
					<div class="product-details">
						<h4>Product Details</h4>
						<div class="detail-grid">
							<div class="detail-item">
								<span class="detail-label">Product ID:</span>
								<span class="detail-value">{product.id.slice(-8).toUpperCase()}</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">Category:</span>
								<span class="detail-value">Fresh Produce</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">Origin:</span>
								<span class="detail-value">Local Farm</span>
							</div>
							<div class="detail-item">
								<span class="detail-label">Organic:</span>
								<span class="detail-value">Yes</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.product-container {
		padding: var(--space-8) var(--space-4);
		max-width: 1200px;
	}
	
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
	
	.error-state {
		text-align: center;
		padding: var(--space-12);
		max-width: 500px;
		margin: 0 auto;
	}
	
	.error-icon {
		font-size: 4rem;
		margin-bottom: var(--space-6);
	}
	
	.error-actions {
		display: flex;
		gap: var(--space-4);
		justify-content: center;
		flex-wrap: wrap;
		margin-top: var(--space-6);
	}
	
	.product-breadcrumb {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-8);
		font-size: var(--text-sm);
		color: #6B7280;
	}
	
	.product-breadcrumb a {
		color: var(--color-primary);
		text-decoration: none;
	}
	
	.product-breadcrumb a:hover {
		text-decoration: underline;
	}
	
	.product-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-12);
		align-items: start;
	}
	
	.product-image-large {
		width: 100%;
		height: 400px;
		background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-accent) 100%);
		border-radius: var(--radius-xl);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.product-placeholder {
		font-size: 8rem;
		opacity: 0.7;
	}
	
	.product-title {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
		font-size: var(--text-3xl);
	}
	
	.product-summary {
		color: #6B7280;
		font-size: var(--text-lg);
		margin-bottom: var(--space-6);
		line-height: 1.6;
	}
	
	.product-price-large {
		font-size: var(--text-4xl);
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: var(--space-8);
	}
	
	.product-description {
		margin-bottom: var(--space-8);
	}
	
	.product-description h3 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
	}
	
	.product-description p {
		color: #6B7280;
		line-height: 1.7;
	}
	
	.cart-section {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		align-items: center;
	}
	
	.quantity-controls-large {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	
	.quantity-controls-large button {
		width: 40px;
		height: 40px;
		border: 1px solid var(--color-neutral);
		background: white;
		cursor: pointer;
		border-radius: var(--radius-sm);
		font-weight: 600;
		font-size: var(--text-lg);
	}
	
	.quantity-controls-large input {
		width: 80px;
		text-align: center;
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-sm);
		padding: var(--space-2);
		height: 40px;
		font-size: var(--text-lg);
	}
	
	.add-to-cart-large {
		flex: 1;
		min-width: 200px;
	}
	
	.product-actions {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
		flex-wrap: wrap;
	}
	
	.btn-large {
		padding: var(--space-4) var(--space-8);
		font-size: var(--text-lg);
	}
	
	.product-details h4 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
	}
	
	.detail-grid {
		display: grid;
		gap: var(--space-3);
	}
	
	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--color-neutral);
	}
	
	.detail-item:last-child {
		border-bottom: none;
	}
	
	.detail-label {
		font-weight: 500;
		color: var(--color-neutral-dark);
	}
	
	.detail-value {
		color: #6B7280;
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
		.product-content {
			grid-template-columns: 1fr;
		}
		
		.product-image-large {
			height: 300px;
		}
		
		.product-placeholder {
			font-size: 6rem;
		}
		
		.product-actions {
			flex-direction: column;
		}
		
		.error-actions {
			flex-direction: column;
			align-items: center;
		}
		
		.cart-section {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-4);
		}
		
		.quantity-controls-large {
			justify-content: center;
		}
		
		.add-to-cart-large {
			min-width: auto;
		}
	}
</style>