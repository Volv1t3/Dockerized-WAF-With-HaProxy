<script>
	/**
	 * @fileoverview Global layout component for the AgriCommerce frontend application.
	 * @module routes/+layout
	 * @description This component provides the overarching structure for the entire application, including the header navigation, main content area (slot), and footer. It manages global styling, user authentication state display, and responsive navigation.
	 * @dependencies ../app.css, $app/stores, $app/navigation
	 * @exports default - The default Svelte layout component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import '../app.css';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	
	// Get user data from page data (set by load functions)
	/**
	 * @type {App.PageData['user']} user - Reactive variable holding the authenticated user's data.
	 * It is derived from the `$page.data.user` store, which is populated by server-side load functions.
	 */
	$: user = $page.data.user;
	
	/**
	 * @function handleSignOut
	 * @description Handles the user sign-out process. It makes an API call to the backend to clear the authentication cookie, invalidates all SvelteKit load functions to refresh data, and then redirects the user to the home page.
	 * @fires api/auth/sign-out - A POST request to the backend to clear the authentication session.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Send a POST request to the backend sign-out API endpoint, including credentials (cookies).
	 *   2. Check if the response from the backend is successful.
	 *   3. If successful, call `invalidateAll()` to force a reload of all data on the client.
	 *   4. Redirect the user to the home page, replacing the current history state.
	 *   5. Catch and log any errors that occur during the sign-out process.
	 */
	async function handleSignOut() {
		try {
			// Step 1: Make an API call to the backend to sign out.
			const response = await fetch('/api/auth/sign-out', {
				method: 'POST',
				credentials: 'include' // Include cookies for session management.
			});
			
			// Step 2: Check if the sign-out request was successful.
			if (response.ok) {
				// Step 3: Invalidate all load functions to refetch data and update UI state.
				await invalidateAll();
				// Step 4: Redirect to the home page after successful sign out.
				goto('/', { replaceState: true });
			}
		} catch (error) {
			// Step 5: Log any errors during sign-out.
			console.error('Sign out failed:', error);
		}
	}
	
	// Navigation menu state for mobile
	/**
	 * @type {boolean} mobileMenuOpen - Controls the visibility of the mobile navigation menu.
	 */
	let mobileMenuOpen = false;
	
	/**
	 * @function toggleMobileMenu
	 * @description Toggles the `mobileMenuOpen` boolean state, which controls the visibility of the mobile navigation menu.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Invert the current value of `mobileMenuOpen`.
	 */
	function toggleMobileMenu() {
		// Step 1: Toggle the menu state.
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	/**
	 * @function closeMobileMenu
	 * @description Sets the `mobileMenuOpen` state to `false`, effectively closing the mobile navigation menu.
	 * This is typically called when a navigation link is clicked or when the user interacts outside the menu.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Set `mobileMenuOpen` to `false`.
	 */
	function closeMobileMenu() {
		// Step 1: Close the mobile menu.
		mobileMenuOpen = false;
	}
</script>

<!-- Main application structure -->
<div class="app">
	<!-- Header with navigation -->
	<header class="header">
		<nav class="nav container">
			<!-- Logo and brand -->
			<div class="nav-brand">
				<a href="/" class="brand-link" on:click={closeMobileMenu}>
					<span class="brand-icon">🌾</span>
					<span class="brand-text">AgriCommerce</span>
				</a>
			</div>
			
			<!-- Mobile menu toggle -->
			<button 
				class="mobile-menu-toggle"
				aria-label="Toggle navigation menu"
				on:click={toggleMobileMenu}
			>
				<span class="hamburger"></span>
				<span class="hamburger"></span>
				<span class="hamburger"></span>
			</button>
			
			<!-- Navigation links -->
			<div class="nav-links" class:nav-links-open={mobileMenuOpen}>
				<div class="nav-main">
					<a href="/" class="nav-link" on:click={closeMobileMenu}>Home</a>
					<a href="/store" class="nav-link" on:click={closeMobileMenu}>Store</a>
					<a href="/products" class="nav-link" on:click={closeMobileMenu}>Products</a>
					<a href="/discounts" class="nav-link" on:click={closeMobileMenu}>Offers</a>
					<a href="/about" class="nav-link" on:click={closeMobileMenu}>About</a>
					<a href="/contact" class="nav-link" on:click={closeMobileMenu}>Contact</a>
					<a href="/users" class="nav-link vulnerable" on:click={closeMobileMenu}>🔍 Users</a>
					<a href="/admin" class="nav-link vulnerable" on:click={closeMobileMenu}>⚠️ Admin</a>
					<a href="/shopping-cart" class="nav-link" on:click={closeMobileMenu}>🛒 Cart</a>
				</div>
				
				<!-- Authentication links -->
				<div class="nav-auth">
					{#if user}
						<!-- Authenticated user menu -->
						<a href="/account" class="nav-link" on:click={closeMobileMenu}>
							👤 {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
						</a>
						<button class="btn btn-outline" on:click={handleSignOut}>
							Sign Out
						</button>
					{:else}
						<!-- Guest user links -->
						<a href="/auth/sign-in" class="nav-link" on:click={closeMobileMenu}>Sign In</a>
						<a href="/auth/sign-up" class="btn btn-primary" on:click={closeMobileMenu}>Sign Up</a>
					{/if}
				</div>
			</div>
		</nav>
	</header>
	
	<!-- Main content area -->
	<main class="main">
		<slot />
	</main>
	
	<!-- Footer -->
	<footer class="footer">
		<div class="container">
			<div class="footer-content">
				<div class="footer-section">
					<h3>AgriCommerce</h3>
					<p  style="text-align: justify;">Connecting farmers with quality agricultural products and sustainable practices.</p>
				</div>
				
				<div class="footer-section">
					<h4>Quick Links</h4>
					<ul class="footer-links">
						<li><a href="/about">About Us</a></li>
						<li><a href="/history">Our History</a></li>
						<li><a href="/contact">Contact</a></li>
						<li><a href="/discounts">Current Offers</a></li>
					</ul>
				</div>
				
				<div class="footer-section">
					<h4>Products</h4>
					<ul class="footer-links">
						<li><a href="/products">All Products</a></li>
						<li><a href="/store">Storefront</a></li>
					</ul>
				</div>
				
				<div class="footer-section">
					<h4>Connect</h4>
					<p style='text-align:justify'>Follow us for updates on sustainable farming and new products.</p>
				</div>
			</div>
			
			<div class="footer-bottom">
				<p>&copy; 2025 AgriCommerce. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

<style>
	/* Header and Navigation Styles */
	.header {
		background-color: var(--color-neutral-white);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 100;
	}
	
	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-4);
		min-height: 4rem;
	}
	
	.nav-brand {
		display: flex;
		align-items: center;
	}
	
	.brand-link {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-heading);
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--color-primary);
		text-decoration: none;
	}
	
	.brand-icon {
		font-size: var(--text-2xl);
	}
	
	.mobile-menu-toggle {
		display: none;
		flex-direction: column;
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-2);
	}
	
	.hamburger {
		width: 1.5rem;
		height: 2px;
		background-color: var(--color-neutral-dark);
		margin: 2px 0;
		transition: var(--transition-fast);
	}
	
	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--space-8);
	}
	
	.nav-main {
		display: flex;
		align-items: center;
		gap: var(--space-6);
	}
	
	.nav-auth {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}
	
	.nav-link {
		font-weight: 500;
		color: var(--color-neutral-dark);
		transition: color var(--transition-fast);
	}
	
	.nav-link:hover {
		color: var(--color-primary);
	}
	
	.nav-link.vulnerable {
		color: #DC2626;
		font-weight: 600;
	}
	
	.nav-link.vulnerable:hover {
		color: #B91C1C;
		background-color: #FEF2F2;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
	}
	
	/* Main content area */
	.main {
		min-height: calc(100vh - 8rem);
		flex: 1;
	}
	
	/* Footer Styles */
	.footer {
		background-color: var(--color-neutral-dark);
		color: var(--color-neutral-light);
		margin-top: var(--space-16);
	}
	
	.footer-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-8);
		padding: var(--space-12) 0;
	}
	
	.footer-section h3,
	.footer-section h4 {
		color: var(--color-neutral-white);
		margin-bottom: var(--space-4);
	}
	
	.footer-links {
		list-style: none;
		padding: 0;
	}
	
	.footer-links li {
		margin-bottom: var(--space-2);
	}
	
	.footer-links a {
		color: var(--color-neutral);
		transition: color var(--transition-fast);
	}
	
	.footer-links a:hover {
		color: var(--color-primary-accent);
	}
	
	.footer-bottom {
		border-top: 1px solid #4B5563;
		padding: var(--space-6) 0;
		text-align: center;
		color: var(--color-neutral);
	}
	
	/* Mobile Responsive Design */
	@media (max-width: 768px) {
		.mobile-menu-toggle {
			display: flex;
		}
		
		.nav-links {
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background-color: var(--color-neutral-white);
			flex-direction: column;
			padding: var(--space-6);
			box-shadow: var(--shadow-lg);
			transform: translateY(-100%);
			opacity: 0;
			visibility: hidden;
			transition: all var(--transition-normal);
		}
		
		.nav-links-open {
			transform: translateY(0);
			opacity: 1;
			visibility: visible;
		}
		
		.nav-main,
		.nav-auth {
			flex-direction: column;
			width: 100%;
			gap: var(--space-4);
		}
		
		.nav-auth {
			border-top: 1px solid var(--color-neutral);
			padding-top: var(--space-4);
			margin-top: var(--space-4);
		}
	}
</style>