#!/usr/bin/env node

/**
 * Environment Debug Script
 * 
 * Helps debug environment variable configuration issues.
 * Run with: node debug-env.js
 */

console.log('🔍 AgriCommerce Environment Debug');
console.log('================================\n');

// Check Node.js version
console.log(`Node.js Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}\n`);

// Check environment variables
console.log('Environment Variables:');
console.log('---------------------');

const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV', 'PORT'];
const optionalVars = ['COOKIE_SECURE'];

requiredVars.forEach(varName => {
	const value = process.env[varName];
	if (value) {
		// Mask sensitive values
		const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
			? `${value.substring(0, 8)}...` 
			: value;
		console.log(`✅ ${varName}: ${displayValue}`);
	} else {
		console.log(`❌ ${varName}: NOT SET`);
	}
});

optionalVars.forEach(varName => {
	const value = process.env[varName];
	if (value) {
		console.log(`ℹ️  ${varName}: ${value}`);
	} else {
		console.log(`ℹ️  ${varName}: NOT SET (optional)`);
	}
});

console.log('\nCurrent Working Directory:', process.cwd());

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
	console.log('✅ .env file found');
	try {
		const envContent = fs.readFileSync(envPath, 'utf8');
		const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
		console.log(`   Contains ${lines.length} configuration lines`);
	} catch (error) {
		console.log('❌ Error reading .env file:', error.message);
	}
} else {
	console.log('⚠️  .env file not found');
}

// Check package.json
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
	console.log('✅ package.json found');
} else {
	console.log('❌ package.json not found');
}

console.log('\n🔧 Troubleshooting Tips:');
console.log('- Ensure .env file exists and contains JWT_SECRET');
console.log('- Check that environment variables are properly loaded');
console.log('- Verify DATABASE_URL format is correct');
console.log('- Make sure you\'re running from the correct directory');