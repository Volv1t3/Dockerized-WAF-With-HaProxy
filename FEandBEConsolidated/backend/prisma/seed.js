/**
 * Database Seed Script
 * 
 * Populates the database with sample data for development and testing.
 * Creates products, discounts, and sample user with purchase history.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Sample products data with agricultural theme
 */
const sampleProducts = [
	{
		name: 'Organic Lettuce',
		slug: 'organic-lettuce',
		summary: 'Fresh, crispy organic lettuce grown locally',
		description: 'Our organic lettuce is grown using sustainable farming practices without harmful pesticides. Perfect for salads, sandwiches, and healthy meals.',
		priceCents: 399, // $3.99
		imageUrl: null
	},
	{
		name: 'Heirloom Tomatoes',
		slug: 'heirloom-tomatoes',
		summary: 'Vine-ripened heirloom tomatoes, full of flavor',
		description: 'These beautiful heirloom tomatoes are vine-ripened to perfection. Each variety offers unique flavors and colors, perfect for gourmet cooking.',
		priceCents: 549, // $5.49
		imageUrl: null
	},
	{
		name: 'Rainbow Carrots',
		slug: 'rainbow-carrots',
		summary: 'Colorful, sweet carrots packed with nutrients',
		description: 'Our rainbow carrots come in vibrant colors including purple, orange, yellow, and white. Sweet, crunchy, and packed with vitamins.',
		priceCents: 299, // $2.99
		imageUrl: null
	},
	{
		name: 'Fresh Spinach',
		slug: 'fresh-spinach',
		summary: 'Nutrient-rich baby spinach leaves',
		description: 'Tender baby spinach leaves, perfect for salads, smoothies, or cooking. Rich in iron, vitamins, and antioxidants.',
		priceCents: 349, // $3.49
		imageUrl: null
	},
	{
		name: 'Sweet Bell Peppers',
		slug: 'sweet-bell-peppers',
		summary: 'Crisp and colorful bell peppers',
		description: 'A mix of red, yellow, and green bell peppers. Sweet, crunchy, and perfect for cooking, grilling, or eating fresh.',
		priceCents: 449, // $4.49
		imageUrl: null
	},
	{
		name: 'Organic Herbs Bundle',
		slug: 'organic-herbs-bundle',
		summary: 'Fresh basil, parsley, and cilantro',
		description: 'A bundle of the most popular fresh herbs: basil, parsley, and cilantro. Grown organically and harvested fresh.',
		priceCents: 599, // $5.99
		imageUrl: null
	}
];

/**
 * Sample discounts data
 */
const sampleDiscounts = [
	{
		title: 'Spring Fresh Sale',
		description: 'Get 15% off all fresh vegetables this spring season',
		percentOff: 15,
		active: true,
		startsAt: new Date('2024-03-01'),
		endsAt: new Date('2024-05-31')
	},
	{
		title: 'Organic Bundle Deal',
		description: 'Save 20% when you buy 3 or more organic products',
		percentOff: 20,
		active: true,
		startsAt: new Date('2024-01-01'),
		endsAt: new Date('2024-12-31')
	},
	{
		title: 'Summer Harvest Special',
		description: 'Limited time offer on seasonal summer produce',
		percentOff: 25,
		active: false, // Future promotion
		startsAt: new Date('2024-06-01'),
		endsAt: new Date('2024-08-31')
	}
];

/**
 * Main seed function
 */
async function main() {
	console.log('🌱 Starting database seed...');

	try {
		// Clear existing data (in development only)
		console.log('🧹 Cleaning existing data...');
		await prisma.purchaseItem.deleteMany();
		await prisma.purchase.deleteMany();
		await prisma.discount.deleteMany();
		await prisma.product.deleteMany();
		await prisma.user.deleteMany();

		// Create products
		console.log('📦 Creating products...');
		const products = [];
		for (const productData of sampleProducts) {
			const product = await prisma.product.create({
				data: productData
			});
			products.push(product);
			console.log(`   ✅ Created product: ${product.name}`);
		}

		// Create discounts
		console.log('🏷️ Creating discounts...');
		for (const discountData of sampleDiscounts) {
			const discount = await prisma.discount.create({
				data: discountData
			});
			console.log(`   ✅ Created discount: ${discount.title}`);
		}

		// Create sample users
		console.log('👤 Creating sample users...');
		const passwordHash = await bcrypt.hash('password123', 12);
		
		// Create admin user
		const adminUser = await prisma.user.create({
			data: {
				email: 'admin@agricommerce.com',
				passwordHash,
				firstName: 'Admin',
				lastName: 'User',
				phone: '+1-555-0100'
			}
		});
		console.log(`   ✅ Created admin user: ${adminUser.email}`);
		
		// Create demo user
		const sampleUser = await prisma.user.create({
			data: {
				email: 'demo@agricommerce.com',
				passwordHash,
				firstName: 'Demo',
				lastName: 'User',
				phone: '+1-555-0123'
			}
		});
		console.log(`   ✅ Created demo user: ${sampleUser.email}`);

		// Create sample purchases for the user
		console.log('🛒 Creating sample purchases...');
		
		// Purchase 1: Recent order
		const purchase1 = await prisma.purchase.create({
			data: {
				userId: sampleUser.id,
				totalCents: 1247, // $12.47
				createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
				items: {
					create: [
						{
							productId: products[0].id, // Organic Lettuce
							quantity: 2,
							priceCentsAtPurchase: products[0].priceCents
						},
						{
							productId: products[2].id, // Rainbow Carrots
							quantity: 1,
							priceCentsAtPurchase: products[2].priceCents
						},
						{
							productId: products[3].id, // Fresh Spinach
							quantity: 1,
							priceCentsAtPurchase: products[3].priceCents
						}
					]
				}
			}
		});

		// Purchase 2: Older order
		const purchase2 = await prisma.purchase.create({
			data: {
				userId: sampleUser.id,
				totalCents: 998, // $9.98
				createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
				items: {
					create: [
						{
							productId: products[1].id, // Heirloom Tomatoes
							quantity: 1,
							priceCentsAtPurchase: products[1].priceCents
						},
						{
							productId: products[4].id, // Sweet Bell Peppers
							quantity: 1,
							priceCentsAtPurchase: products[4].priceCents
						}
					]
				}
			}
		});

		console.log(`   ✅ Created purchase: ${purchase1.id}`);
		console.log(`   ✅ Created purchase: ${purchase2.id}`);

		console.log('🎉 Database seed completed successfully!');
		console.log('\n📋 Sample Data Summary:');
		console.log(`   • ${sampleProducts.length} products created`);
		console.log(`   • ${sampleDiscounts.length} discounts created`);
		console.log(`   • 1 sample user created (demo@agricommerce.com / password123)`);
		console.log(`   • 2 sample purchases created`);
		console.log('\n🚀 You can now start the application and explore the features!');

	} catch (error) {
		console.error('❌ Error during database seed:', error);
		throw error;
	}
}

/**
 * Execute seed function
 */
main()
	.catch((e) => {
		console.error('💥 Seed script failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});