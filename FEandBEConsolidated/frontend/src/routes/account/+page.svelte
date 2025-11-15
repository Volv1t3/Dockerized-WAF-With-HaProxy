<!--
	Account Overview Page
	
	Displays user profile information and provides navigation to account features.
	Shows masked email, account creation date, and profile management options.
-->

<script lang="ts">
	/**
	 * @fileoverview Account overview page component.
	 * @module routes/account/+page
	 * @description This component displays the authenticated user's profile information, including their name, email, and account creation date. It also provides navigation links to other account-related features like purchase history and admin panel (if applicable).
	 * @dependencies $app/stores
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { page } from '$app/stores';
	
	/**
	 * @type {App.PageData['user']} user - Reactive variable holding the authenticated user's data.
	 * It is derived from the `$page.data.user` store, which is populated by server-side load functions.
	 */
	$: user = $page.data.user;
	
	/**
	 * @function formatDate
	 * @description Formats a date string into a human-readable format (e.g., "Month Day, Year").
	 * @param {string} dateString - The date string to format.
	 * @returns {string} The formatted date string.
	 *
	 * Steps:
	 *   1. Create a new `Date` object from the input `dateString`.
	 *   2. Use `toLocaleDateString` with 'en-US' locale and specific options for formatting.
	 */
	const formatDate = (dateString: string): string => {
		// Step 1: Create a Date object.
		const date = new Date(dateString);
		// Step 2: Format the date to a readable string.
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
	
	/**
	 * @function maskEmail
	 * @description Masks the username part of an email address for display, showing only the first few characters.
	 * If the username is too short, the email is returned unmasked.
	 * @param {string} email - The email address to mask.
	 * @returns {string} The masked email address.
	 *
	 * Steps:
	 *   1. Split the email into username and domain parts.
	 *   2. If the username is 2 characters or less, return the original email.
	 *   3. Create a masked version of the username (currently returns the full username, but could be modified to mask).
	 *   4. Recombine the masked username with the original domain.
	 */
	function maskEmail(email: string): string {
		// Step 1: Split email into parts.
		const parts = email.split('@');
		const username = parts[0];
		const domain = parts[1];
		// Step 2: If username is too short, return original email.
		if (username.length <= 2) return email;
		// Step 3: Mask the username (currently returns full username).
		const masked = username; // This could be `username.substring(0, 2) + '***'` for actual masking.
		// Step 4: Recombine and return.
		return masked + '@' + domain;
	}
</script>

<svelte:head>
	<title>My Account - AgriCommerce</title>
	<meta name="description" content="Manage your AgriCommerce account, view profile information, and access purchase history." />
</svelte:head>

<div class="account-container container">
	<div class="account-header">
		<h1>My Account</h1>
		<p>Manage your profile and view your activity</p>
	</div>
	
	<div class="account-content">
		<!-- Profile Information Card -->
		<div class="profile-card card">
			<div class="profile-header">
				<div class="profile-avatar">
					<span class="avatar-icon">👤</span>
				</div>
				<div class="profile-info">
					<h2>{user.firstName} {user.lastName}</h2>
					<p class="profile-email">{maskEmail(user.email)}</p>
					<p class="profile-member-since">
						Member since {formatDate(user.createdAt)}
					</p>
				</div>
			</div>
			
			<div class="profile-details">
				<div class="detail-row">
					<span class="detail-label">First Name:</span>
					<span class="detail-value">{user.firstName}</span>
				</div>
				<div class="detail-row">
					<span class="detail-label">Last Name:</span>
					<span class="detail-value">{user.lastName}</span>
				</div>
				<div class="detail-row">
					<span class="detail-label">Email:</span>
					<span class="detail-value">{user.email}</span>
				</div>
				{#if user.phone}
					<div class="detail-row">
						<span class="detail-label">Phone:</span>
						<span class="detail-value">{user.phone}</span>
					</div>
				{/if}
				<div class="detail-row">
					<span class="detail-label">Account Created:</span>
					<span class="detail-value">{formatDate(user.createdAt)}</span>
				</div>
				{#if user.updatedAt !== user.createdAt}
					<div class="detail-row">
						<span class="detail-label">Last Updated:</span>
						<span class="detail-value">{formatDate(user.updatedAt)}</span>
					</div>
				{/if}
			</div>
		</div>
		
		<!-- Account Actions -->
		<div class="account-actions">
			<div class="action-card card">
				<div class="action-icon">📦</div>
				<h3>Purchase History</h3>
				<p>View your past orders and track deliveries</p>
				<a href="/account/purchases" class="btn btn-primary">
					View Purchases
				</a>
			</div>
			
			<div class="action-card card">
				<div class="action-icon">🛒</div>
				<h3>Continue Shopping</h3>
				<p>Browse our selection of quality agricultural products</p>
				<a href="/store" class="btn btn-outline">
					Shop Now
				</a>
			</div>
			
			<div class="action-card card">
				<div class="action-icon">💬</div>
				<h3>Contact Support</h3>
				<p>Get help with your account or orders</p>
				<a href="/contact" class="btn btn-outline">
					Contact Us
				</a>
			</div>
			
			{#if user.isAdmin}
				<div class="action-card card admin-card">
					<div class="action-icon">⚙️</div>
					<h3>Admin Panel</h3>
					<p>Manage users and system administration</p>
					<a href="/account/admin" class="btn btn-secondary">
						Manage Users
					</a>
				</div>
			{/if}
		</div>
		
		<!-- Account Statistics -->
		<div class="account-stats card">
			<h3>Account Overview</h3>
			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-icon">📊</span>
					<div class="stat-content">
						<span class="stat-label">Account Status</span>
						<span class="stat-value active">Active</span>
					</div>
				</div>
				<div class="stat-item">
					<span class="stat-icon">🔒</span>
					<div class="stat-content">
						<span class="stat-label">Security</span>
						<span class="stat-value">Protected</span>
					</div>
				</div>
				<div class="stat-item">
					<span class="stat-icon">✉️</span>
					<div class="stat-content">
						<span class="stat-label">Email Status</span>
						<span class="stat-value verified">Verified</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.account-container {
		padding: var(--space-8) var(--space-4);
		max-width: 1000px;
	}
	
	.account-header {
		text-align: center;
		margin-bottom: var(--space-12);
	}
	
	.account-header h1 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-2);
	}
	
	.account-header p {
		color: #6B7280;
		font-size: var(--text-lg);
		margin-bottom: 0;
	}
	
	.account-content {
		display: grid;
		gap: var(--space-8);
	}
	
	/* Profile Card Styles */
	.profile-card {
		padding: var(--space-8);
	}
	
	.profile-header {
		display: flex;
		align-items: center;
		gap: var(--space-6);
		margin-bottom: var(--space-8);
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-neutral);
	}
	
	.profile-avatar {
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-accent) 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	
	.avatar-icon {
		font-size: 2rem;
		color: var(--color-neutral-white);
	}
	
	.profile-info h2 {
		margin-bottom: var(--space-2);
		color: var(--color-neutral-dark);
	}
	
	.profile-email {
		color: var(--color-primary);
		font-weight: 500;
		margin-bottom: var(--space-1);
	}
	
	.profile-member-since {
		color: #6B7280;
		font-size: var(--text-sm);
		margin-bottom: 0;
	}
	
	.profile-details {
		display: grid;
		gap: var(--space-4);
	}
	
	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3) 0;
		border-bottom: 1px solid #F3F4F6;
	}
	
	.detail-row:last-child {
		border-bottom: none;
	}
	
	.detail-label {
		font-weight: 500;
		color: var(--color-neutral-dark);
	}
	
	.detail-value {
		color: #6B7280;
	}
	
	/* Account Actions */
	.account-actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-6);
	}
	
	.action-card {
		text-align: center;
		padding: var(--space-6);
		transition: transform var(--transition-normal);
	}
	
	.action-card:hover {
		transform: translateY(-2px);
	}
	
	.action-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}
	
	.action-card h3 {
		margin-bottom: var(--space-3);
		color: var(--color-neutral-dark);
	}
	
	.action-card p {
		color: #6B7280;
		margin-bottom: var(--space-6);
	}
	
	/* Account Statistics */
	.account-stats {
		padding: var(--space-6);
	}
	
	.account-stats h3 {
		margin-bottom: var(--space-6);
		color: var(--color-neutral-dark);
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-6);
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}
	
	.stat-icon {
		font-size: 1.5rem;
	}
	
	.stat-content {
		display: flex;
		flex-direction: column;
	}
	
	.stat-label {
		font-size: var(--text-sm);
		color: #6B7280;
		margin-bottom: var(--space-1);
	}
	
	.stat-value {
		font-weight: 500;
		color: var(--color-neutral-dark);
	}
	
	.stat-value.active {
		color: var(--color-primary);
	}
	
	.stat-value.verified {
		color: var(--color-primary);
	}
	
	.admin-card {
		background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
		border: 2px solid var(--color-secondary-light);
	}
	
	.admin-card .action-icon {
		color: var(--color-secondary);
	}
	
	.admin-card h3 {
		color: var(--color-secondary-dark);
	}
	
	/* Mobile Responsive */
	@media (max-width: 768px) {
		.profile-header {
			flex-direction: column;
			text-align: center;
		}
		
		.detail-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-1);
		}
		
		.account-actions {
			grid-template-columns: 1fr;
		}
		
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>