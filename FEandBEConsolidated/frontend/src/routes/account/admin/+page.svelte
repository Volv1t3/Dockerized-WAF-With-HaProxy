<!--
	Admin User Management Page
	
	Allows admin users to view, edit, and delete user accounts.
	Restricted to admin@agricommerce.com only.
-->

<script lang="ts">
	/**
	 * @fileoverview Admin user management page component.
	 * @module routes/account/admin/+page
	 * @description This component provides an interface for administrators to view, edit, and delete user accounts. Access is restricted to users with admin privileges. It fetches user data from a backend API and handles CRUD operations for user management.
	 * @dependencies svelte, $app/stores
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	/**
	 * @type {any[]} users - Array to store the list of user accounts fetched from the API.
	 * @type {boolean} isLoading - Flag to indicate if user data is currently being loaded.
	 * @type {string} error - Stores any error message that occurs during API calls.
	 * @type {any | null} editingUser - Stores the user object currently being edited, or null if no user is being edited.
	 * @type {{ firstName: string; lastName: string; phone: string }} editForm - Object to bind input values for the user edit form.
	 */
	let users: any[] = [];
	let isLoading = true;
	let error = '';
	let editingUser: any = null;
	let editForm = { firstName: '', lastName: '', phone: '' };
	
	/**
	 * @type {App.PageData['user']} user - Reactive variable holding the authenticated user's data.
	 * It is derived from the `$page.data.user` store, which is populated by server-side load functions.
	 */
	$: user = $page.data.user;
	
	/**
	 * @function loadUsers
	 * @description Fetches the list of all user accounts from the backend API.
	 * Handles loading states and error reporting.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Set `isLoading` to true and clear any previous errors.
	 *   2. Make a GET request to the `/api/admin/users` endpoint, including credentials.
	 *   3. If the response is OK, parse the JSON data and update the `users` array.
	 *   4. If the response is not OK, parse the error data and set the `error` message.
	 *   5. Catch any network errors and set a generic error message.
	 *   6. Set `isLoading` to false in the `finally` block.
	 */
	async function loadUsers() {
		try {
			// Step 1: Set loading state and clear errors.
			isLoading = true;
			error = '';
			
			// Step 2: Fetch user data from the admin API.
			const response = await fetch('/api/admin/users', {
				credentials: 'include'
			});
			
			// Step 3: Process the response.
			if (response.ok) {
				users = await response.json();
			} else {
				// Step 4: Handle API errors.
				const errorData = await response.json();
				error = errorData.error?.message || 'Failed to load users';
			}
		} catch (err) {
			// Step 5: Handle network errors.
			console.error('Load users error:', err);
			error = 'Network error. Please try again.';
		} finally {
			// Step 6: Reset loading state.
			isLoading = false;
		}
	}
	
	/**
	 * @function deleteUser
	 * @description Deletes a user account via the backend API after user confirmation.
	 * @param {string} userId - The ID of the user to delete.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Prompt the user for confirmation before proceeding with deletion.
	 *   2. If confirmed, send a DELETE request to the `/api/admin/users/:userId` endpoint.
	 *   3. If the response is OK, filter the deleted user out of the local `users` array.
	 *   4. If the response is not OK, display an alert with the error message.
	 *   5. Catch any network errors and display a generic alert.
	 */
	async function deleteUser(userId: string) {
		// Step 1: Confirm deletion with the user.
		if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
			return;
		}
		
		try {
			// Step 2: Send DELETE request to the API.
			const response = await fetch(`/api/admin/users/${userId}`, {
				method: 'DELETE',
				credentials: 'include'
			});
			
			// Step 3: Process the response.
			if (response.ok) {
				// Filter out the deleted user from the local state.
				users = users.filter(u => u.id !== userId);
			} else {
				// Step 4: Handle API errors.
				const errorData = await response.json();
				alert(errorData.error?.message || 'Failed to delete user');
			}
		} catch (err) {
			// Step 5: Handle network errors.
			console.error('Delete user error:', err);
			alert('Network error. Please try again.');
		}
	}
	
	/**
	 * @function startEdit
	 * @description Initializes the edit form with the data of the user to be edited.
	 * @param {any} userToEdit - The user object whose data will populate the edit form.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Set `editingUser` to the user object being edited.
	 *   2. Populate `editForm` with the current `firstName`, `lastName`, and `phone` of `userToEdit`.
	 */
	function startEdit(userToEdit: any) {
		// Step 1: Set the user being edited.
		editingUser = userToEdit;
		// Step 2: Populate the edit form fields.
		editForm = {
			firstName: userToEdit.firstName,
			lastName: userToEdit.lastName,
			phone: userToEdit.phone || ''
		};
	}
	
	/**
	 * @function cancelEdit
	 * @description Clears the `editingUser` and `editForm` states, effectively canceling the edit operation.
	 * @returns {void}
	 *
	 * Steps:
	 *   1. Set `editingUser` to `null`.
	 *   2. Reset `editForm` to its initial empty state.
	 */
	function cancelEdit() {
		// Step 1: Clear the user being edited.
		editingUser = null;
		// Step 2: Reset the edit form.
		editForm = { firstName: '', lastName: '', phone: '' };
	}
	
	/**
	 * @function saveEdit
	 * @description Saves the changes made to a user's profile via the backend API.
	 * @returns {Promise<void>}
	 *
	 * Steps:
	 *   1. Send a PUT request to the `/api/admin/users/:userId` endpoint with the updated `editForm` data.
	 *   2. If the response is OK, update the `users` array with the `updatedUser` data.
	 *   3. Call `cancelEdit()` to close the edit form.
	 *   4. If the response is not OK, display an alert with the error message.
	 *   5. Catch any network errors and display a generic alert.
	 */
	async function saveEdit() {
		try {
			// Step 1: Send PUT request to update user data.
			const response = await fetch(`/api/admin/users/${editingUser.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(editForm)
			});
			
			// Step 2: Process the response.
			if (response.ok) {
				const updatedUser = await response.json();
				// Update the user in the local state.
				users = users.map(u => u.id === editingUser.id ? { ...u, ...updatedUser } : u);
				// Step 3: Close the edit form.
				cancelEdit();
			} else {
				// Step 4: Handle API errors.
				const errorData = await response.json();
				alert(errorData.error?.message || 'Failed to update user');
			}
		} catch (err) {
			// Step 5: Handle network errors.
			console.error('Update user error:', err);
			alert('Network error. Please try again.');
		}
	}
	
	/**
	 * @function formatDate
	 * @description Formats a date string into a short, human-readable format (e.g., "Nov 11, 2025").
	 * @param {string} dateString - The date string to format.
	 * @returns {string} The formatted date string.
	 *
	 * Steps:
	 *   1. Create a new `Date` object from the input `dateString`.
	 *   2. Use `toLocaleDateString` with 'en-US' locale and specific options for formatting.
	 */
	function formatDate(dateString: string): string {
		// Step 1 & 2: Format the date to a readable string.
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	
	// Life-cycle method: onMount
	// Step 1: Load users when the component is first mounted.
	onMount(loadUsers);
</script>

<svelte:head>
	<title>Admin - User Management - AgriCommerce</title>
	<meta name="description" content="Admin panel for managing AgriCommerce users" />
</svelte:head>

<div class="admin-container container">
	<div class="admin-header">
		<div class="header-content">
			<h1>User Management</h1>
			<p>Manage user accounts and permissions</p>
		</div>
		<a href="/account" class="btn btn-outline">
			← Back to Account
		</a>
	</div>
	
	<div class="admin-content">
		{#if isLoading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading users...</p>
			</div>
		{:else if error}
			<div class="error-state card">
				<div class="error-icon">⚠️</div>
				<h3>Unable to Load Users</h3>
				<p>{error}</p>
				<button class="btn btn-primary" on:click={loadUsers}>
					Try Again
				</button>
			</div>
		{:else}
			<div class="users-table-container">
				<div class="table-header">
					<h2>All Users ({users.length})</h2>
				</div>
				
				<div class="users-table">
					{#each users as userItem (userItem.id)}
						<div class="user-row card">
							{#if editingUser?.id === userItem.id}
								<div class="user-edit-form">
									<div class="edit-fields">
										<div class="field-group">
											<label>First Name</label>
											<input type="text" bind:value={editForm.firstName} />
										</div>
										<div class="field-group">
											<label>Last Name</label>
											<input type="text" bind:value={editForm.lastName} />
										</div>
										<div class="field-group">
											<label>Phone</label>
											<input type="text" bind:value={editForm.phone} />
										</div>
									</div>
									<div class="edit-actions">
										<button class="btn btn-primary btn-small" on:click={saveEdit}>
											Save
										</button>
										<button class="btn btn-outline btn-small" on:click={cancelEdit}>
											Cancel
										</button>
									</div>
								</div>
							{:else}
								<div class="user-info">
									<div class="user-details">
										<div class="user-name">
											{userItem.firstName} {userItem.lastName}
											{#if userItem.email === 'admin@agricommerce.com'}
												<span class="admin-badge">Admin</span>
											{/if}
										</div>
										<div class="user-email">{userItem.email}</div>
										<div class="user-meta">
											{#if userItem.phone}
												<span>📞 {userItem.phone}</span>
											{/if}
											<span>📅 Joined {formatDate(userItem.createdAt)}</span>
										</div>
									</div>
									<div class="user-actions">
										<button class="btn btn-outline btn-small" on:click={() => startEdit(userItem)}>
											Edit
										</button>
										{#if userItem.id !== user.id}
											<button class="btn btn-danger btn-small" on:click={() => deleteUser(userItem.id)}>
												Delete
											</button>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-container {
		padding: var(--space-8) var(--space-4);
		max-width: 1000px;
	}
	
	.admin-header {
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
	
	.loading-state {
		text-align: center;
		padding: var(--space-16);
	}
	
	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-neutral);
		border-top: 3px solid var(--color-secondary);
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
	}
	
	.error-icon {
		font-size: 4rem;
		margin-bottom: var(--space-6);
	}
	
	.table-header {
		margin-bottom: var(--space-6);
	}
	
	.table-header h2 {
		color: var(--color-neutral-dark);
		margin-bottom: 0;
	}
	
	.users-table {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	
	.user-row {
		padding: var(--space-6);
		transition: box-shadow var(--transition-normal);
	}
	
	.user-row:hover {
		box-shadow: var(--shadow-md);
	}
	
	.user-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}
	
	.user-name {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-1);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	
	.admin-badge {
		background-color: var(--color-secondary);
		color: var(--color-neutral-white);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 500;
	}
	
	.user-email {
		color: var(--color-primary);
		margin-bottom: var(--space-2);
	}
	
	.user-meta {
		display: flex;
		gap: var(--space-4);
		font-size: var(--text-sm);
		color: #6B7280;
	}
	
	.user-actions {
		display: flex;
		gap: var(--space-2);
	}
	
	.btn-small {
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
	}
	
	.btn-danger {
		background-color: #DC2626;
		color: var(--color-neutral-white);
		border: none;
	}
	
	.btn-danger:hover {
		background-color: #B91C1C;
	}
	
	.user-edit-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	
	.edit-fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
	}
	
	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	
	.field-group label {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-neutral-dark);
	}
	
	.field-group input {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-md);
	}
	
	.edit-actions {
		display: flex;
		gap: var(--space-2);
		justify-content: flex-end;
	}
	
	@media (max-width: 768px) {
		.admin-header {
			flex-direction: column;
			align-items: stretch;
		}
		
		.user-info {
			flex-direction: column;
			align-items: flex-start;
		}
		
		.user-meta {
			flex-direction: column;
			gap: var(--space-1);
		}
		
		.edit-fields {
			grid-template-columns: 1fr;
		}
	}
</style>