<!--
	Our History Page
	
	Static timeline showcasing AgriCommerce's journey and milestones.
	Features a vertical timeline with key events and achievements.
-->

<script>
	/**
	 * @fileoverview Our History page component.
	 * @module routes/history/+page
	 * @description This component presents a static timeline detailing the key milestones and journey of AgriCommerce, from its founding to its future vision. It highlights the company's growth, commitment to sustainability, and community involvement.
	 * @dependencies None
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
</script>

<svelte:head>
	<title>Our History - AgriCommerce</title>
	<meta name="description" content="Discover the journey of AgriCommerce from a small farming initiative to a leading agricultural marketplace." />
</svelte:head>

<div class="history-container container">
	<div class="history-header">
		<h1>Our History</h1>
		<p>The journey of sustainable agriculture and community growth</p>
	</div>
	
	<div class="timeline">
		<div class="timeline-item">
			<div class="timeline-marker">🌱</div>
			<div class="timeline-content">
				<h3>2018 - The Beginning</h3>
				<ul>
					<li>Founded by three agricultural engineering students</li>
					<li>Started with a small organic farm in rural Ecuador</li>
					<li>First harvest of 500kg of organic vegetables</li>
					<li>Established direct relationships with 5 local families</li>
				</ul>
			</div>
		</div>
		
		<div class="timeline-item">
			<div class="timeline-marker">🚜</div>
			<div class="timeline-content">
				<h3>2019 - Expansion</h3>
				<ul>
					<li>Acquired modern farming equipment and irrigation systems</li>
					<li>Expanded to 50 hectares of cultivated land</li>
					<li>Introduced crop rotation and sustainable farming practices</li>
					<li>Partnered with 15 additional local farmers</li>
					<li>Launched first community-supported agriculture program</li>
				</ul>
			</div>
		</div>
		
		<div class="timeline-item">
			<div class="timeline-marker">🏪</div>
			<div class="timeline-content">
				<h3>2020 - Digital Transformation</h3>
				<ul>
					<li>Developed our first online marketplace platform</li>
					<li>Implemented farm-to-table delivery services</li>
					<li>Reached 1,000 satisfied customers</li>
					<li>Introduced organic certification program</li>
					<li>Survived and adapted during global pandemic challenges</li>
				</ul>
			</div>
		</div>
		
		<div class="timeline-item">
			<div class="timeline-marker">🌿</div>
			<div class="timeline-content">
				<h3>2021 - Sustainability Focus</h3>
				<ul>
					<li>Achieved carbon-neutral farming operations</li>
					<li>Launched renewable energy initiatives</li>
					<li>Established seed bank for heritage varieties</li>
					<li>Created educational programs for sustainable agriculture</li>
					<li>Won "Best Sustainable Business" regional award</li>
				</ul>
			</div>
		</div>
		
		<div class="timeline-item">
			<div class="timeline-marker">🤝</div>
			<div class="timeline-content">
				<h3>2022 - Community Growth</h3>
				<ul>
					<li>Formed cooperative with 100+ local farmers</li>
					<li>Opened three physical distribution centers</li>
					<li>Launched farmer training and mentorship programs</li>
					<li>Introduced fair trade pricing model</li>
					<li>Expanded to serve 5,000+ families nationwide</li>
				</ul>
			</div>
		</div>
		
		<div class="timeline-item">
			<div class="timeline-marker">🏆</div>
			<div class="timeline-content">
				<h3>2023 - Recognition & Innovation</h3>
				<ul>
					<li>Received national award for agricultural innovation</li>
					<li>Implemented blockchain technology for supply chain transparency</li>
					<li>Launched mobile app with 10,000+ downloads</li>
					<li>Established research partnership with local universities</li>
					<li>Achieved B-Corporation certification</li>
				</ul>
			</div>
		</div>
		
		<div class="timeline-item">
			<div class="timeline-marker">🚀</div>
			<div class="timeline-content">
				<h3>2024 - Future Vision</h3>
				<ul>
					<li>Launched comprehensive e-commerce platform</li>
					<li>Expanded to international markets</li>
					<li>Introduced AI-powered crop optimization</li>
					<li>Serving 25,000+ customers across multiple countries</li>
					<li>Planning vertical farming and urban agriculture initiatives</li>
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	.history-container {
		padding: var(--space-8) var(--space-4);
		max-width: 800px;
	}
	
	.history-header {
		text-align: center;
		margin-bottom: var(--space-16);
	}
	
	.history-header h1 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
	}
	
	.history-header p {
		color: #6B7280;
		font-size: var(--text-lg);
		margin-bottom: 0;
	}
	
	.timeline {
		position: relative;
		padding-left: var(--space-8);
	}
	
	.timeline::before {
		content: '';
		position: absolute;
		left: 1.5rem;
		top: 0;
		bottom: 0;
		width: 3px;
		background: linear-gradient(to bottom, var(--color-primary), var(--color-primary-accent));
		border-radius: 2px;
	}
	
	.timeline-item {
		position: relative;
		margin-bottom: var(--space-12);
		padding-left: var(--space-8);
	}
	
	.timeline-marker {
		position: absolute;
		left: -2rem;
		top: 0;
		width: 3rem;
		height: 3rem;
		background: var(--color-neutral-white);
		border: 3px solid var(--color-primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
		box-shadow: var(--shadow-md);
	}
	
	.timeline-content {
		background: var(--color-neutral-white);
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		border-left: 4px solid var(--color-primary-accent);
	}
	
	.timeline-content h3 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
		font-size: var(--text-xl);
	}
	
	.timeline-content ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.timeline-content li {
		position: relative;
		padding-left: var(--space-6);
		margin-bottom: var(--space-3);
		color: #6B7280;
		line-height: 1.6;
	}
	
	.timeline-content li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--color-primary);
		font-weight: bold;
		font-size: var(--text-lg);
	}
	
	.timeline-content li:last-child {
		margin-bottom: 0;
	}
	
	@media (max-width: 768px) {
		.timeline {
			padding-left: var(--space-6);
		}
		
		.timeline::before {
			left: 1rem;
		}
		
		.timeline-item {
			padding-left: var(--space-6);
		}
		
		.timeline-marker {
			left: -1.25rem;
			width: 2.5rem;
			height: 2.5rem;
			font-size: var(--text-base);
		}
		
		.timeline-content {
			padding: var(--space-4);
		}
		
		.timeline-content h3 {
			font-size: var(--text-lg);
		}
	}
</style>