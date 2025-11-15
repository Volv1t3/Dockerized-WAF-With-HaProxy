<!--
	Shopping Cart Page
	
	Displays cart items and handles checkout with payment processing.
-->

<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	// Cart state
	let cartItems = [];
	let showPayment = false;
	let isProcessing = false;
	let showToast = false;
	let toastMessage = '';
	
	// Payment form state
	let cardType = 'visa';
	let cardNumber = '';
	let expiryDate = '';
	let cvv = '';
	let cardholderName = '';
	
	$: user = $page.data.user;
	$: total = cartItems.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
	$: totalFormatted = (total / 100).toFixed(2);
	
	onMount(() => {
		loadCart();
	});
	
	function loadCart() {
		const stored = localStorage.getItem('agricommerce_cart');
		cartItems = stored ? JSON.parse(stored) : [];
	}
	
	function saveCart() {
		localStorage.setItem('agricommerce_cart', JSON.stringify(cartItems));
	}
	
	function updateQuantity(productId, newQuantity) {
		if (newQuantity <= 0) {
			removeItem(productId);
			return;
		}
		
		cartItems = cartItems.map(item => 
			item.productId === productId ? { ...item, quantity: newQuantity } : item
		);
		saveCart();
	}
	
	function removeItem(productId) {
		cartItems = cartItems.filter(item => item.productId !== productId);
		saveCart();
	}
	
	function clearCart() {
		cartItems = [];
		localStorage.removeItem('agricommerce_cart');
	}
	
	async function processPayment() {
		
		if (cartItems.length === 0) {
			showToastMessage('Your cart is empty');
			return;
		}
		
		isProcessing = true;
		
		try {
			const response = await fetch('/api/cart/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					items: cartItems,
					paymentInfo: { cardType, cardNumber, expiryDate, cvv, cardholderName }
				})
			});
			
			const data = await response.json();
			
			if (response.ok) {
				clearCart();
				showPayment = false;
				
				// Generate random delivery date (7-14 days from now)
				const deliveryDays = Math.floor(Math.random() * 8) + 7; // 7-14 days
				const deliveryDate = new Date();
				deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
				const formattedDate = deliveryDate.toLocaleDateString('en-US', { 
					weekday: 'long', 
					year: 'numeric', 
					month: 'long', 
					day: 'numeric' 
				});
				
				showToastMessage(`Your order has been successfully processed and confirmed. Thank you for choosing AgriCommerce! Your fresh agricultural products will be carefully prepared and delivered to your address by ${formattedDate}. You will receive a tracking confirmation via email shortly.`);
			} else {
				showToastMessage(data.error?.message || 'Payment failed. Please try again.');
			}
		} catch (error) {
			console.error('Payment error:', error);
			showToastMessage('Network error. Please try again.');
		} finally {
			isProcessing = false;
		}
	}
	
	function showToastMessage(message) {
		toastMessage = message;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}
</script>

<svelte:head>
	<title>Shopping Cart - AgriCommerce</title>
</svelte:head>

<!-- Toast Notification -->
{#if showToast}
	<div class="toast">
		{toastMessage}
	</div>
{/if}

<div class="cart-container">
	<div class="cart-content">
		<h1>Shopping Cart</h1>
		
		{#if cartItems.length === 0}
			<div class="empty-cart">
				<p>Your cart is empty</p>
				<a href="/products" class="btn btn-primary">Continue Shopping</a>
			</div>
		{:else}
			<div class="cart-items">
				{#each cartItems as item (item.productId)}
					<div class="cart-item">
						<div class="item-details">
							<h3>{item.name}</h3>
							<p class="item-price">${(item.priceCents / 100).toFixed(2)}</p>
						</div>
						<div class="quantity-controls">
							<button on:click={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
							<input type="number" bind:value={item.quantity} on:change={() => updateQuantity(item.productId, item.quantity)} min="1" />
							<button on:click={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
						</div>
						<div class="item-total">
							${((item.priceCents * item.quantity) / 100).toFixed(2)}
						</div>
						<button class="remove-btn" on:click={() => removeItem(item.productId)}>×</button>
					</div>
				{/each}
			</div>
			
			<div class="cart-summary">
				<div class="total">
					<strong>Total: ${totalFormatted}</strong>
				</div>
				<div class="cart-actions">
					<button class="btn btn-outline" on:click={clearCart}>Clear Cart</button>
					<button class="btn btn-primary" on:click={() => showPayment = true}>Checkout</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Payment Sidebar -->
{#if showPayment}
	<div class="payment-overlay" on:click={() => showPayment = false}>
		<div class="payment-sidebar" on:click|stopPropagation>
			<div class="payment-header">
				<h2>Payment Details</h2>
				<button class="close-btn" on:click={() => showPayment = false}>×</button>
			</div>
			
			<div class="payment-content">
				<div class="order-summary">
					<h3>Order Summary</h3>
					{#each cartItems as item}
						<div class="summary-item">
							<span>{item.name} × {item.quantity}</span>
							<span>${((item.priceCents * item.quantity) / 100).toFixed(2)}</span>
						</div>
					{/each}
					<div class="summary-total">
						<strong>Total: ${totalFormatted}</strong>
					</div>
				</div>
				
				<form class="payment-form" on:submit|preventDefault={processPayment}>
					<div class="form-group">
						<label for="cardType">Card Type</label>
						<select id="cardType" bind:value={cardType}>
							<option value="visa">Visa</option>
							<option value="mastercard">Mastercard</option>
							<option value="amex">American Express</option>
						</select>
					</div>
					
					<div class="form-group">
						<label for="cardholderName">Cardholder Name</label>
						<input id="cardholderName" type="text" bind:value={cardholderName} required />
					</div>
					
					<div class="form-group">
						<label for="cardNumber">Card Number</label>
						<input id="cardNumber" type="text" bind:value={cardNumber} placeholder="1234 5678 9012 3456" required />
					</div>
					
					<div class="form-row">
						<div class="form-group">
							<label for="expiryDate">Expiry Date</label>
							<input id="expiryDate" type="text" bind:value={expiryDate} placeholder="MM/YY" required />
						</div>
						<div class="form-group">
							<label for="cvv">CVV</label>
							<input id="cvv" type="text" bind:value={cvv} placeholder="123" required />
						</div>
					</div>
					
					<button type="submit" class="btn btn-primary btn-full" disabled={isProcessing}>
						{isProcessing ? 'Processing...' : `Pay $${totalFormatted}`}
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}

<style>
	.cart-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
	}
	
	.empty-cart {
		text-align: center;
		padding: var(--space-16);
	}
	
	.cart-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin-bottom: var(--space-8);
	}
	
	.cart-item {
		display: grid;
		grid-template-columns: 80px 1fr auto auto auto;
		gap: var(--space-4);
		align-items: center;
		padding: var(--space-4);
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-md);
	}
	
	.cart-item img {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: var(--radius-sm);
	}
	
	.item-details h3 {
		margin: 0 0 var(--space-1) 0;
		font-size: var(--text-lg);
	}
	
	.item-price {
		color: var(--color-primary);
		font-weight: 600;
		margin: 0;
	}
	
	.quantity-controls {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	
	.quantity-controls button {
		width: 32px;
		height: 32px;
		border: 1px solid var(--color-neutral);
		background: white;
		cursor: pointer;
		border-radius: var(--radius-sm);
	}
	
	.quantity-controls input {
		width: 60px;
		text-align: center;
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-sm);
		padding: var(--space-1);
	}
	
	.item-total {
		font-weight: 600;
		font-size: var(--text-lg);
	}
	
	.remove-btn {
		width: 32px;
		height: 32px;
		border: none;
		background: #ef4444;
		color: white;
		cursor: pointer;
		border-radius: var(--radius-sm);
		font-size: var(--text-lg);
	}
	
	.cart-summary {
		border-top: 2px solid var(--color-neutral);
		padding-top: var(--space-6);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.total {
		font-size: var(--text-xl);
	}
	
	.cart-actions {
		display: flex;
		gap: var(--space-4);
	}
	
	.payment-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		justify-content: flex-end;
	}
	
	.payment-sidebar {
		width: 500px;
		height: 100vh;
		background: white;
		overflow-y: auto;
		box-shadow: var(--shadow-lg);
	}
	
	.payment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-6);
		border-bottom: 1px solid var(--color-neutral);
	}
	
	.close-btn {
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		font-size: var(--text-xl);
		cursor: pointer;
	}
	
	.payment-content {
		padding: var(--space-6);
	}
	
	.order-summary {
		margin-bottom: var(--space-8);
		padding: var(--space-4);
		background: var(--color-neutral-light);
		border-radius: var(--radius-md);
	}
	
	.summary-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}
	
	.summary-total {
		border-top: 1px solid var(--color-neutral);
		padding-top: var(--space-2);
		margin-top: var(--space-4);
		font-size: var(--text-lg);
	}
	
	.payment-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
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
		max-width: 450px;
		line-height: 1.5;
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
		.cart-item {
			grid-template-columns: 60px 1fr;
			gap: var(--space-2);
		}
		
		.quantity-controls,
		.item-total,
		.remove-btn {
			grid-column: 1 / -1;
			justify-self: start;
		}
		
		.payment-sidebar {
			width: 100vw;
		}
		
		.cart-summary {
			flex-direction: column;
			gap: var(--space-4);
			align-items: stretch;
		}
	}
</style>