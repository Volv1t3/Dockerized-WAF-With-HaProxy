<!--
	About Us Page
	
	Information about AgriCommerce mission, values, and team.
	Showcases the company's commitment to sustainable agriculture.
-->

<script>
	/**
	 * @fileoverview About Us page component for AgriCommerce.
	 * @module routes/about/+page
	 * @description This component provides information about AgriCommerce's mission, values, history, and team. It highlights the company's commitment to sustainable agriculture and community support.
	 * @dependencies None
	 * @exports default - The default Svelte page component.
	 * @author Gemini
	 * @lastModified 2025-11-11
	 */
</script>

<svelte:head>
	<title>About Us - AgriCommerce</title>
	<meta name="description" content="Learn about AgriCommerce's mission to connect communities with quality agricultural products and promote sustainable farming practices." />
</svelte:head>

<div class="about-container container">
	<!-- Hero Section -->
	<section class="about-hero">
		<div class="hero-content">
			<h1>About AgriCommerce</h1>
			<p class="hero-subtitle">
				Connecting communities with quality agricultural products while promoting sustainable farming practices for a better tomorrow.
			</p>
		</div>
		<div class="hero-image">
			<div class="hero-placeholder">
				<span class="hero-icon">🌾</span>
				<p>Sustainable farming imagery</p>
			</div>
		</div>
	</section>

	<!-- Mission Section -->
	<section class="mission-section py-8">
		<div class="section-content">
			<h2>Our Mission</h2>
			<p class="mission-text">
				At AgriCommerce, we believe in the power of sustainable agriculture to nourish communities 
				and protect our planet. Our mission is to bridge the gap between local farmers and consumers, 
				ensuring that fresh, quality produce reaches your table while supporting environmentally 
				responsible farming practices.
			</p>
		</div>
	</section>

	<!-- Values Section -->
	<section class="values-section py-8">
		<h2 class="section-title text-center">Our Values</h2>
		<div class="values-grid">
			<div class="value-card card">
				<div class="value-icon">🌱</div>
				<h3>Sustainability</h3>
				<p>
					We partner with farmers who prioritize soil health, biodiversity, and 
					environmentally responsible practices that protect our ecosystem for future generations.
				</p>
			</div>
			
			<div class="value-card card">
				<div class="value-icon">🤝</div>
				<h3>Community</h3>
				<p>
					Building strong relationships between farmers and consumers creates a supportive 
					network that benefits everyone in the agricultural community.
				</p>
			</div>
			
			<div class="value-card card">
				<div class="value-icon">✨</div>
				<h3>Quality</h3>
				<p>
					We maintain the highest standards for freshness and quality, ensuring that 
					every product meets our rigorous criteria before reaching your table.
				</p>
			</div>
			
			<div class="value-card card">
				<div class="value-icon">🌍</div>
				<h3>Transparency</h3>
				<p>
					We believe in open communication about our farming practices, sourcing methods, 
					and the journey from farm to table.
				</p>
			</div>
		</div>
	</section>

	<!-- Story Section -->
	<section class="story-section py-8">
		<div class="story-content">
			<div class="story-text">
				<h2>Our Story</h2>
				<p>
					Founded in 2018 by three agricultural engineering students, AgriCommerce began 
					with a small organic farm in rural Ecuador. What started with a 500kg harvest 
					has grown into a comprehensive platform serving 25,000+ customers across multiple countries.
				</p>
				<p>
					From our humble beginnings with 5 local families, we've expanded to partner with 
					100+ farmers in our cooperative. Through digital transformation, sustainability 
					focus, and community growth, we've achieved carbon-neutral operations and 
					B-Corporation certification.
				</p>
				<p>
					Today, we continue to innovate with AI-powered crop optimization and blockchain 
					technology for supply chain transparency, always maintaining our commitment to 
					sustainable agriculture and community support.
				</p>
			</div>
			<div class="story-stats">
				<div class="stat-item">
					<span class="stat-number">100+</span>
					<span class="stat-label">Partner Farmers</span>
				</div>
				<div class="stat-item">
					<span class="stat-number">25,000+</span>
					<span class="stat-label">Customers Served</span>
				</div>
				<div class="stat-item">
					<span class="stat-number">6</span>
					<span class="stat-label">Years Growing</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Team Section -->
	<section class="team-section py-8">
		<h2 class="section-title text-center">Meet Our Team</h2>
		<div class="team-grid">
			<div class="team-member card">
				<div class="member-avatar">👩‍🌾</div>
				<h3>Sarah Johnson</h3>
				<p class="member-role">Founder & CEO</p>
				<p class="member-bio">
					Agricultural engineer with 15 years of experience in sustainable farming practices 
					and community development.
				</p>
			</div>
			
			<div class="team-member card">
				<div class="member-avatar">👨‍💼</div>
				<h3>Michael Chen</h3>
				<p class="member-role">Operations Director</p>
				<p class="member-bio">
					Supply chain expert focused on creating efficient, sustainable distribution 
					networks that benefit both farmers and consumers.
				</p>
			</div>
			
			<div class="team-member card">
				<div class="member-avatar">👩‍💻</div>
				<h3>Emily Rodriguez</h3>
				<p class="member-role">Technology Lead</p>
				<p class="member-bio">
					Software engineer passionate about using technology to solve real-world 
					problems in agriculture and food distribution.
				</p>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section py-8">
		<div class="cta-content card">
			<h2>Join Our Community</h2>
			<p>
				Ready to experience the difference that fresh, sustainable agriculture can make? 
				Explore our products and become part of the AgriCommerce family.
			</p>
			<div class="cta-actions">
				<a href="/store" class="btn btn-primary">
					Shop Now
				</a>
				<a href="/contact" class="btn btn-outline">
					Get in Touch
				</a>
			</div>
		</div>
	</section>
</div>

<style>
	.about-container {
		padding: var(--space-8) var(--space-4);
	}

	/* Hero Section */
	.about-hero {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-12);
		align-items: center;
		margin-bottom: var(--space-16);
	}

	.hero-content h1 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-4);
	}

	.hero-subtitle {
		font-size: var(--text-lg);
		color: #6B7280;
		line-height: 1.6;
	}

	.hero-placeholder {
		background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-accent) 100%);
		border-radius: var(--radius-xl);
		padding: var(--space-12);
		text-align: center;
		color: var(--color-primary-dark);
		min-height: 300px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.hero-icon {
		font-size: 4rem;
		margin-bottom: var(--space-4);
	}

	/* Mission Section */
	.mission-section {
		background-color: var(--color-neutral-light);
		border-radius: var(--radius-xl);
		padding: var(--space-12);
		margin-bottom: var(--space-8);
	}

	.mission-text {
		font-size: var(--text-lg);
		line-height: 1.7;
		color: #6B7280;
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	/* Values Section */
	.values-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-6);
		margin-top: var(--space-8);
	}

	.value-card {
		text-align: center;
		padding: var(--space-6);
		transition: transform var(--transition-normal);
	}

	.value-card:hover {
		transform: translateY(-4px);
	}

	.value-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
	}

	.value-card h3 {
		color: var(--color-neutral-dark);
		margin-bottom: var(--space-3);
	}

	.value-card p {
		color: #6B7280;
		line-height: 1.6;
	}

	/* Story Section */
	.story-content {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: var(--space-12);
		align-items: start;
	}

	.story-text p {
		color: #6B7280;
		line-height: 1.7;
		margin-bottom: var(--space-4);
	}

	.story-stats {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.stat-item {
		text-align: center;
		padding: var(--space-4);
		background-color: var(--color-neutral-light);
		border-radius: var(--radius-lg);
	}

	.stat-number {
		display: block;
		font-size: var(--text-3xl);
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: var(--space-2);
	}

	.stat-label {
		color: #6B7280;
		font-size: var(--text-sm);
		font-weight: 500;
	}

	/* Team Section */
	.team-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-6);
		margin-top: var(--space-8);
	}

	.team-member {
		text-align: center;
		padding: var(--space-6);
	}

	.member-avatar {
		font-size: 4rem;
		margin-bottom: var(--space-4);
	}

	.member-role {
		color: var(--color-primary);
		font-weight: 500;
		margin-bottom: var(--space-3);
	}

	.member-bio {
		color: #6B7280;
		font-size: var(--text-sm);
		line-height: 1.6;
	}

	/* CTA Section */
	.cta-section {
		margin-top: var(--space-16);
	}

	.cta-content {
		text-align: center;
		padding: var(--space-12);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: var(--color-neutral-white);
	}

	.cta-content h2 {
		color: var(--color-neutral-white);
		margin-bottom: var(--space-4);
	}

	.cta-content p {
		font-size: var(--text-lg);
		margin-bottom: var(--space-8);
		opacity: 0.9;
	}

	.cta-actions {
		display: flex;
		gap: var(--space-4);
		justify-content: center;
		flex-wrap: wrap;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.about-hero {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.story-content {
			grid-template-columns: 1fr;
		}

		.story-stats {
			flex-direction: row;
			justify-content: space-around;
		}

		.cta-actions {
			flex-direction: column;
			align-items: center;
		}
	}
</style>