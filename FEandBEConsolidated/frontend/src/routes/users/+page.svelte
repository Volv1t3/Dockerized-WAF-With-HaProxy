<!--
	VULNERABLE User Request Page
	
	This page allows executing arbitrary SQL commands with NO validation,
	making it vulnerable to SQL injection attacks.
-->

<script>
	import { onMount } from 'svelte';
	
	let command = '';
	let requestMethod = 'url'; // 'url' or 'json'
	let result = null;
	let loading = false;
	let error = '';
	let schema = null;
	
	/**
	 * VULNERABLE: Execute any SQL command without validation
	 */
	async function executeCommand() {
		if (!command.trim()) return;
		
		loading = true;
		error = '';
		result = null;
		
		try {
			let response;
			
			if (requestMethod === 'url') {
				// Send as URL parameter
				response = await fetch(`/api/vulnerable/performUserRequest?command=${encodeURIComponent(command)}`, {
					method: 'GET',
					credentials: 'include'
				});
			} else {
				// Send as JSON body
				response = await fetch(`/api/vulnerable/performUserRequest`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({ command })
				});
			}
			
			const data = await response.json();
			
			if (response.ok) {
				result = data;
			} else {
				error = data.error || 'Request failed';
				result = data; // Show error details
			}
		} catch (err) {
			error = 'Network error occurred';
			console.error('Command error:', err);
		} finally {
			loading = false;
		}
	}
	
	/**
	 * Load database schema for visualization
	 */
	async function loadSchema() {
		try {
			const response = await fetch(`/api/schema`);
			if (response.ok) {
				schema = await response.json();
			}
		} catch (err) {
			console.error('Schema load error:', err);
		}
	}
	
	onMount(() => {
		loadSchema();
	});
	
	function handleKeydown(event) {
		if (event.key === 'Enter' && event.ctrlKey) {
			executeCommand();
		}
	}
</script>

<svelte:head>
	<title>User Requests - AgriCommerce</title>
	<meta name="description" content="Execute user-level database requests" />
</svelte:head>

<div class="container">
	<div class="header">
		<h1>User Database Requests</h1>
		<p class="warning">⚠️ VULNERABLE: This page executes raw SQL commands for security testing</p>
	</div>
	
	<div class="query-section">
		<div class="input-group">
			<label for="command">SQL Command:</label>
			<textarea
				id="command"
				bind:value={command}
				on:keydown={handleKeydown}
				placeholder="SELECT * FROM users WHERE id = '1'"
				class="command-input"
				rows="3"
			></textarea>
		</div>
		
		<div class="method-selection">
			<label>Request Method:</label>
			<div class="radio-group">
				<label class="radio-label">
					<input type="radio" bind:group={requestMethod} value="url" />
					URL Parameter
				</label>
				<label class="radio-label">
					<input type="radio" bind:group={requestMethod} value="json" />
					JSON Body
				</label>
			</div>
		</div>
		
		<button 
			on:click={executeCommand}
			disabled={loading || !command.trim()}
			class="btn btn-primary"
		>
			{loading ? 'Executing...' : 'Execute Command'}
		</button>
		
		<div class="examples">
			<h3>Example Commands:</h3>
			<ul>
				<li><code>SELECT * FROM users LIMIT 5</code></li>
				<li><code>SELECT email, firstName FROM users WHERE email LIKE '%admin%'</code></li>
				<li><code>SELECT * FROM products WHERE priceCents > 1000</code></li>
				<li><code>SELECT COUNT(*) as total FROM users</code></li>
			</ul>
		</div>
	</div>
	
	{#if error}
		<div class="error-message">
			<h3>Error:</h3>
			<pre>{error}</pre>
		</div>
	{/if}
	
	{#if result}
		<div class="results-section">
			<h2>Query Results</h2>
			<div class="result-info">
				<p><strong>Command:</strong> <code>{result.command}</code></p>
				<p><strong>Method:</strong> {result.source}</p>
				<p><strong>Timestamp:</strong> {result.timestamp}</p>
			</div>
			
			{#if result.result && Array.isArray(result.result) && result.result.length > 0}
				<div class="table-container">
					<table class="results-table">
						<thead>
							<tr>
								{#each Object.keys(result.result[0]) as column}
									<th>{column}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each result.result as row}
								<tr>
									{#each Object.values(row) as value}
										<td class:sensitive={String(value).includes('$')}>{value}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="no-results">
					<p>Query executed successfully but returned no data.</p>
					<pre>{JSON.stringify(result.result, null, 2)}</pre>
				</div>
			{/if}
		</div>
	{/if}
	
	{#if schema}
		<div class="schema-section">
			<h2>Database Schema</h2>
			<div class="tables-grid">
				{#each schema.tables as table}
					<div class="table-card">
						<h3>{table.name}</h3>
						<div class="columns">
							{#each table.columns as column}
								<div class="column" class:primary={column.primaryKey} class:unique={column.unique}>
									<span class="column-name">{column.name}</span>
									<span class="column-type">{column.type}</span>
									{#if column.primaryKey}<span class="badge pk">PK</span>{/if}
									{#if column.unique}<span class="badge unique">UNIQUE</span>{/if}
									{#if column.foreignKey}<span class="badge fk">FK → {column.foreignKey}</span>{/if}
								</div>
							{/each}
						</div>
						{#if table.relations && table.relations.length > 0}
							<div class="relations">
								<strong>Relations:</strong> {table.relations.join(', ')}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-6);
	}
	
	.header {
		text-align: center;
		margin-bottom: var(--space-8);
	}
	
	.warning {
		color: #DC2626;
		font-weight: bold;
		background: #FEF2F2;
		padding: var(--space-2);
		border-radius: var(--radius-md);
		border: 1px solid #FECACA;
	}
	
	.query-section {
		background: white;
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-neutral);
		margin-bottom: var(--space-8);
	}
	
	.input-group {
		margin-bottom: var(--space-4);
	}
	
	.input-group label {
		display: block;
		margin-bottom: var(--space-2);
		font-weight: 500;
	}
	
	.command-input {
		width: 100%;
		padding: var(--space-3);
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-md);
		font-family: 'Courier New', monospace;
		font-size: var(--text-sm);
		resize: vertical;
	}
	
	.method-selection {
		margin-bottom: var(--space-4);
	}
	
	.method-selection label {
		display: block;
		margin-bottom: var(--space-2);
		font-weight: 500;
	}
	
	.radio-group {
		display: flex;
		gap: var(--space-4);
	}
	
	.radio-label {
		display: flex !important;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		font-weight: normal !important;
		margin-bottom: 0 !important;
	}
	
	.examples {
		background: #F3F4F6;
		padding: var(--space-4);
		border-radius: var(--radius-md);
		margin-top: var(--space-4);
	}
	
	.examples h3 {
		margin-top: 0;
		color: #374151;
	}
	
	.examples code {
		background: #1F2937;
		color: #F9FAFB;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-family: 'Courier New', monospace;
	}
	
	.error-message {
		background-color: #FEF2F2;
		color: #DC2626;
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid #FECACA;
		margin-bottom: var(--space-6);
	}
	
	.error-message pre {
		white-space: pre-wrap;
		word-break: break-word;
	}
	
	.results-section {
		background: white;
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-neutral);
		margin-bottom: var(--space-8);
	}
	
	.result-info {
		background: #F9FAFB;
		padding: var(--space-3);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-4);
	}
	
	.result-info code {
		background: #1F2937;
		color: #F9FAFB;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-family: 'Courier New', monospace;
	}
	
	.table-container {
		overflow-x: auto;
		border: 1px solid var(--color-neutral);
		border-radius: var(--radius-md);
	}
	
	.results-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}
	
	.results-table th,
	.results-table td {
		padding: var(--space-2) var(--space-3);
		border-bottom: 1px solid var(--color-neutral);
		text-align: left;
	}
	
	.results-table th {
		background: #F9FAFB;
		font-weight: 600;
		color: #374151;
	}
	
	.results-table td.sensitive {
		background: #FEF2F2;
		color: #DC2626;
		font-family: 'Courier New', monospace;
		word-break: break-all;
	}
	
	.no-results {
		text-align: center;
		padding: var(--space-8);
		color: #6B7280;
	}
	
	.no-results pre {
		background: #F3F4F6;
		padding: var(--space-3);
		border-radius: var(--radius-md);
		text-align: left;
		margin-top: var(--space-4);
	}
	
	.schema-section {
		background: white;
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-neutral);
	}
	
	.tables-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-4);
	}
	
	.table-card {
		background: #F9FAFB;
		padding: var(--space-4);
		border-radius: var(--radius-md);
		border: 1px solid #E5E7EB;
	}
	
	.table-card h3 {
		margin-top: 0;
		color: #1F2937;
		border-bottom: 2px solid #3B82F6;
		padding-bottom: var(--space-2);
	}
	
	.column {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) 0;
		border-bottom: 1px solid #E5E7EB;
	}
	
	.column:last-child {
		border-bottom: none;
	}
	
	.column-name {
		font-weight: 500;
		color: #1F2937;
		min-width: 100px;
	}
	
	.column-type {
		color: #6B7280;
		font-family: 'Courier New', monospace;
		font-size: var(--text-xs);
		flex: 1;
	}
	
	.badge {
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.badge.pk {
		background: #FEF3C7;
		color: #92400E;
	}
	
	.badge.unique {
		background: #DBEAFE;
		color: #1E40AF;
	}
	
	.badge.fk {
		background: #F3E8FF;
		color: #7C3AED;
	}
	
	.relations {
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid #E5E7EB;
		font-size: var(--text-sm);
		color: #6B7280;
	}
</style>