/**
 * @fileoverview Main entry point for the AgriCommerce backend API.
 * @module index
 * @description This file sets up an Express.js server, configures middleware (JSON parsing, URL encoding, cookie parsing, CORS), defines authentication logic, and registers various API routes for user management, product browsing, discounts, purchases, and contact form submissions. It also includes health and debug endpoints.
 * @dependencies express, dotenv, cookie-parser, cors, bcrypt, ./lib/db, ./lib/jwt, ./lib/validators, ./types/express
 * @exports app - The Express application instance.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { db } from './lib/db.js';
import { signJWT, verifyJWT, getCookieName } from './lib/jwt.js';
import { signInSchema, signUpSchema, contactSchema, productQuerySchema, formatValidationErrors } from './lib/validators.js';
import './types/express.js'; // Extends Express Request type

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
// Define the port for the server, defaulting to 33771
const port = process.env.PORT || 33771;

// Middleware setup
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));
// Parse cookies from request headers
app.use(cookieParser());
// SECURITY REDUCED: Allow all origins for testing
app.use(cors({ 
	credentials: true, 
	origin: true, // Allow all origins
	optionsSuccessStatus: 200
}));

/**
 * @function authMiddleware
 * @description Middleware to authenticate users based on JWT stored in cookies.
 * It decodes the JWT, verifies its validity, and attaches user information to the request object (`req.user`).
 * If no valid token is found, `req.user` remains null.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Initialize `req.user` to `null`.
 *   2. Retrieve the authentication token from cookies using `getCookieName()`.
 *   3. If a token exists, verify it using `verifyJWT()`.
 *   4. If the token is valid, attempt to find the user in the database using the `userId` from the payload.
 *   5. If the user is found, attach their `id`, `email`, `firstName`, and `lastName` to `req.user`.
 *   6. Catch and log any errors during the authentication process.
 *   7. Call `next()` to pass control to the next middleware or route handler.
 */
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	// Step 1: Initialize req.user as null.
	req.user = null;
	// Step 2: Get the authentication token from cookies.
	const token = req.cookies[getCookieName()];
	
	// Step 3: If a token exists, verify it.
	if (token) {
		const payload = verifyJWT(token);
		// Step 4: If payload is valid, fetch user details.
		if (payload) {
			try {
				const user = await db.user.findUnique({
					where: { id: payload.userId },
					select: { id: true, email: true, firstName: true, lastName: true }
				});
				// Step 5: Attach user to request if found.
				if (user) req.user = user;
			} catch (error) {
				// Step 6: Log any errors during user lookup.
				console.error('Auth middleware error:', error);
			}
		}
	}
	// Step 7: Proceed to the next middleware/route.
	next();
};

// Apply authentication middleware to all routes
app.use(authMiddleware);

/**
 * @function app.options('*')
 * @description Handles CORS preflight requests for all routes.
 * It sets necessary CORS headers to allow cross-origin requests, especially for credentials.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {void}
 *
 * Steps:
 *   1. Set `Access-Control-Allow-Origin` header to allow the requesting origin.
 *   2. Set `Access-Control-Allow-Methods` header for allowed HTTP methods.
 *   3. Set `Access-Control-Allow-Headers` header for allowed request headers.
 *   4. Set `Access-Control-Allow-Credentials` to 'true'.
 *   5. Send a 200 OK status.
 */
// SECURITY REDUCED: Permissive CORS headers
app.options('*', (req: Request, res: Response) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Access-Control-Allow-Headers', '*');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.sendStatus(200);
});

// --- Auth routes ---

/**
 * @function app.post('/api/auth/sign-in')
 * @description Handles user sign-in. Authenticates user credentials, generates a JWT, and sets it as an HTTP-only cookie.
 * @param {Request} req - The Express request object, expecting `email` and `password` in the body.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Extract `email` and `password` from the request body.
 *   2. Find the user by `email` in the database.
 *   3. If user not found or password invalid, return 401 with an error.
 *   4. Compare the provided password with the stored hash using `bcrypt.compare()`.
 *   5. If passwords don't match, return 401 with an error.
 *   6. Sign a new JWT using `signJWT()` with user `id` and `email`.
 *   7. Set the JWT as an HTTP-only cookie (`agri_auth`) with appropriate options.
 *   8. Return 200 OK with selected user details and a success message.
 *   9. Catch and log any errors, returning a 500 internal server error.
 */
app.post('/api/auth/sign-in', async (req: Request, res: Response) => {
	try {
		// Step 1: Extract credentials.
		const { email, password } = req.body;
		
		// Step 2: Find user by email.
		const user = await db.user.findUnique({
			where: { email },
			select: { id: true, email: true, passwordHash: true, firstName: true, lastName: true }
		});
		
		const invalidError = { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
		
		// Step 3 & 5: Check if user exists and password is valid.
		if (!user) return res.status(401).json(invalidError);
		
		const isValid = await bcrypt.compare(password, user.passwordHash);
		if (!isValid) return res.status(401).json(invalidError);
		
		// Step 6: Sign JWT.
		const token = signJWT({ userId: user.id, email: user.email });
		
		// Step 7: Set authentication cookie.
		res.cookie('agri_auth', token, {
			httpOnly: true,
			secure: false, // Set to false for localhost development
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
			domain: '.evolvlabs.com' // Use leading dot for subdomain support
		});
		
		// Step 8: Return success response.
		res.json({
			user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
			message: 'Signed in successfully'
		});
	} catch (error) {
		// Step 9: Handle errors.
		console.error('Sign-in error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.post('/api/auth/sign-out')
 * @description Handles user sign-out. Clears the authentication cookie.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {void}
 *
 * Steps:
 *   1. Check if `req.user` exists; if not, return 401 unauthorized.
 *   2. Clear the `agri_auth` cookie.
 *   3. Return 200 OK with a success message.
 */
app.post('/api/auth/sign-out', (req: Request, res: Response) => {
	// Step 1: Check if user is authenticated.
	if (!req.user) {
		return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
	}
	
	// Step 2: Clear the authentication cookie.
	res.clearCookie('agri_auth', { path: '/', domain: '.evolvlabs.com' });
	// Step 3: Return success message.
	res.json({ message: 'Signed out successfully' });
});

/**
 * @function app.post('/api/auth/sign-up')
 * @description Handles user registration. Validates input, hashes password, creates a new user, and sets an authentication cookie.
 * @param {Request} req - The Express request object, expecting `email`, `password`, `firstName`, `lastName`, and optional `phone` in the body.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Validate request body against `signUpSchema`. If validation fails, return 400 with validation errors.
 *   2. Extract validated user data.
 *   3. Check if a user with the provided `email` already exists. If so, return 409 conflict.
 *   4. Hash the user's password using `bcrypt.hash()`.
 *   5. Create a new user in the database with the hashed password.
 *   6. Sign a new JWT for the newly created user.
 *   7. Set the JWT as an HTTP-only cookie.
 *   8. Return 201 Created with selected user details and a success message.
 *   9. Catch and log any errors, returning a 500 internal server error.
 */
app.post('/api/auth/sign-up', async (req: Request, res: Response) => {
	try {
		// Step 1: Validate request body.
		const validation = signUpSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: formatValidationErrors(validation.error) }
			});
		}
		
		// Step 2: Extract validated data.
		const { email, password, firstName, lastName, phone } = validation.data;
		
		// Step 3: Check for existing user.
		const existing = await db.user.findUnique({ where: { email } });
		if (existing) {
			return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'An account with this email already exists' } });
		}
		
		// Step 4: Hash password.
		const passwordHash = await bcrypt.hash(password, 12);
		
		// Step 5: Create new user.
		const user = await db.user.create({
			data: { email, passwordHash, firstName, lastName, phone: phone || null },
			select: { id: true, email: true, firstName: true, lastName: true }
		});
		
		// Step 6: Sign JWT for new user.
		const token = signJWT({ userId: user.id, email: user.email });
		
		// Step 7: Set authentication cookie.
		res.cookie('agri_auth', token, {
			httpOnly: true,
			secure: false, // Set to false for localhost development
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 1000, // 1 hour
			domain: '.evolvlabs.com'
		});
		
		// Step 8: Return success response.
		res.status(201).json({
			user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
			message: 'Account created successfully'
		});
	} catch (error) {
		// Step 9: Handle errors.
		console.error('Sign-up error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

// --- Products routes ---

/**
 * @function app.get('/api/products')
 * @description Retrieves a paginated and searchable list of products.
 * @param {Request} req - The Express request object, expecting optional `page`, `pageSize`, and `q` (search query) in query parameters.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Validate query parameters against `productQuerySchema`. If validation fails, return 400.
 *   2. Extract validated `page`, `pageSize`, and `q`.
 *   3. Calculate `skip` value for pagination.
 *   4. Construct `whereConditions` for database query based on `q`.
 *   5. Perform parallel database queries to fetch products and their total count.
 *   6. Calculate `totalPages`.
 *   7. Return 200 OK with products, pagination metadata, and the search query.
 *   8. Catch and log any errors, returning a 500 internal server error.
 */
app.get('/api/products', async (req: Request, res: Response) => {
	try {
		// Step 1: Validate query parameters.
		const validation = productQuerySchema.safeParse(req.query);
		if (!validation.success) {
			return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters' } });
		}
		
		// Step 2: Extract validated data.
		const { page, pageSize, q } = validation.data;
		// Step 3: Calculate skip for pagination.
		const skip = (page - 1) * pageSize;
		
		// Step 4: Construct search conditions.
		const whereConditions = q ? {
			OR: [
				{ name: { contains: q, mode: 'insensitive' } },
				{ summary: { contains: q, mode: 'insensitive' } },
				{ description: { contains: q, mode: 'insensitive' } }
			]
		} : {};
		
		// Step 5: Fetch products and total count in parallel.
		const [products, totalCount] = await Promise.all([
			db.product.findMany({
				where: whereConditions,
				select: { id: true, name: true, slug: true, summary: true, priceCents: true, imageUrl: true, createdAt: true },
				orderBy: { createdAt: 'desc' },
				skip,
				take: pageSize
			}),
			db.product.count({ where: whereConditions })
		]);
		
		// Step 6: Calculate total pages.
		const totalPages = Math.ceil(totalCount / pageSize);
		
		// Step 7: Return products and pagination info.
		res.json({
			products,
			pagination: {
				page, pageSize, totalCount, totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1
			},
			query: q || null
		});
	} catch (error) {
		// Step 8: Handle errors.
		console.error('Get products error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.get('/api/products/:id')
 * @description Retrieves details for a single product by its ID or slug.
 * @param {Request} req - The Express request object, expecting `id` (product ID or slug) in URL parameters.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Extract `id` from URL parameters.
 *   2. Find the product in the database by `id` or `slug`.
 *   3. If product not found, return 404.
 *   4. Return 200 OK with the product details.
 *   5. Catch and log any errors, returning a 500 internal server error.
 */
app.get('/api/products/:id', async (req: Request, res: Response) => {
	try {
		// Step 1: Extract product ID/slug.
		const { id } = req.params;
		
		// Step 2: Find product by ID or slug.
		const product = await db.product.findFirst({
			where: { OR: [{ id }, { slug: id }] },
			select: { id: true, name: true, slug: true, summary: true, description: true, priceCents: true, imageUrl: true, createdAt: true, updatedAt: true }
		});
		
		// Step 3: If product not found, return 404.
		if (!product) {
			return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' } });
		}
		
		// Step 4: Return product details.
		res.json(product);
	} catch (error) {
		// Step 5: Handle errors.
		console.error('Get product error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

// --- Shopping Cart routes ---

/**
 * @function app.post('/api/cart/add')
 * @description Adds an item to the shopping cart. For authenticated users, stores in database; for guests, returns success for localStorage handling.
 * @param {Request} req - The Express request object, expecting `productId` and `quantity` in the body.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Extract `productId` and `quantity` from request body.
 *   2. Validate that the product exists in the database.
 *   3. If user is authenticated, this endpoint returns success (cart managed client-side).
 *   4. Return 200 OK with success message and product details.
 *   5. Catch and log any errors, returning a 500 internal server error.
 */
app.post('/api/cart/add', async (req: Request, res: Response) => {
	try {
		// Step 1: Extract cart item data.
		const { productId, quantity } = req.body;
		
		if (!productId || !quantity || quantity < 1) {
			return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Product ID and valid quantity are required' } });
		}
		
		// Step 2: Validate product exists.
		const product = await db.product.findUnique({
			where: { id: productId },
			select: { id: true, name: true, priceCents: true, imageUrl: true }
		});
		
		if (!product) {
			return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' } });
		}
		
		// Step 3 & 4: Return success (cart managed client-side).
		res.json({
			message: 'Item added to cart successfully',
			product,
			quantity
		});
	} catch (error) {
		// Step 5: Handle errors.
		console.error('Add to cart error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.post('/api/cart/checkout')
 * @description Processes cart checkout and creates a purchase record for authenticated users.
 * @param {Request} req - The Express request object, expecting `items` array and `paymentInfo` in the body.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Check if user is authenticated; if not, return 401 unauthorized.
 *   2. Extract `items` and `paymentInfo` from request body.
 *   3. Validate that all products in the cart exist and calculate total.
 *   4. Create a new purchase record with associated purchase items.
 *   5. Return 201 Created with purchase details and success message.
 *   6. Catch and log any errors, returning a 500 internal server error.
 */
app.post('/api/cart/checkout', async (req: Request, res: Response) => {
	
	try {
		// Step 2: Extract checkout data.
		const { items, paymentInfo } = req.body;
		
		if (!items || !Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Cart items are required' } });
		}
		
		// Step 3: Validate products and calculate total.
		let totalCents = 0;
		const validatedItems = [];
		
		for (const item of items) {
			const product = await db.product.findUnique({
				where: { id: item.productId },
				select: { id: true, name: true, priceCents: true }
			});
			
			if (!product) {
				return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: `Product ${item.productId} not found` } });
			}
			
			const itemTotal = product.priceCents * item.quantity;
			totalCents += itemTotal;
			
			validatedItems.push({
				productId: product.id,
				quantity: item.quantity,
				priceCentsAtPurchase: product.priceCents
			});
		}
		
		// Step 4: Create purchase record only if user is authenticated.
		let purchase = null;
		if (req.user) {
			purchase = await db.purchase.create({
				data: {
					userId: req.user.id,
					totalCents,
					items: {
						create: validatedItems
					}
				},
				select: {
					id: true,
					totalCents: true,
					createdAt: true,
					items: {
						select: {
							id: true,
							quantity: true,
							priceCentsAtPurchase: true,
							product: {
								select: { id: true, name: true, imageUrl: true }
							}
						}
					}
				}
			});
		}
		
		// Step 5: Return purchase confirmation.
		res.status(201).json({
			message: 'Order placed successfully!',
			purchase,
			authenticated: !!req.user
		});
	} catch (error) {
		// Step 6: Handle errors.
		console.error('Checkout error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

// --- VULNERABLE CATCH-ALL ENDPOINTS FOR SECURITY TESTING ---

/**
 * @function app.all('/api/vulnerable/performUserRequest')
 * @description VULNERABLE: Catch-all endpoint that executes any command without validation
 * @param {Request} req - Accepts command via JSON body or URL parameter
 * @param {Response} res - Returns raw query results
 * @security VULNERABLE to SQL injection, command injection, and data exposure
 */
app.all('/api/vulnerable/performUserRequest', async (req: Request, res: Response) => {
	try {
		// Get command from URL parameter or JSON body
		const command = req.query.command || req.body.command;
		
		if (!command) {
			return res.status(400).json({ error: 'Command parameter required' });
		}
		
		// VULNERABLE: Execute any SQL command without validation
		const result = await db.$queryRawUnsafe(command);
		
		res.json({
			command: command,
			result: result,
			timestamp: new Date().toISOString(),
			method: req.method,
			source: req.query.command ? 'URL parameter' : 'JSON body'
		});
	} catch (error: any) {
		console.error('Vulnerable user request error:', error);
		res.status(500).json({ 
			error: 'Database error', 
			details: error.message,
			command: req.query.command || req.body.command
		});
	}
});

/**
 * @function app.all('/api/vulnerable/performAdminRequest')
 * @description VULNERABLE: Admin catch-all endpoint that executes any command without validation
 * @param {Request} req - Accepts command via JSON body or URL parameter
 * @param {Response} res - Returns raw query results with admin privileges
 * @security VULNERABLE to SQL injection, privilege escalation, and sensitive data exposure
 */
app.all('/api/vulnerable/performAdminRequest', async (req: Request, res: Response) => {
	try {
		// Get command from URL parameter or JSON body
		const command = req.query.command || req.body.command;
		
		if (!command) {
			return res.status(400).json({ error: 'Command parameter required' });
		}
		
		// VULNERABLE: Execute any SQL command with "admin" privileges (no actual verification)
		const result = await db.$queryRawUnsafe(command);
		
		res.json({
			command: command,
			result: result,
			timestamp: new Date().toISOString(),
			method: req.method,
			source: req.query.command ? 'URL parameter' : 'JSON body',
			privileges: 'admin',
			warning: 'This endpoint exposes sensitive data without proper authorization'
		});
	} catch (error: any) {
		console.error('Vulnerable admin request error:', error);
		res.status(500).json({ 
			error: 'Database error', 
			details: error.message,
			command: req.query.command || req.body.command
		});
	}
});

// --- Database Schema Endpoint ---

/**
 * @function app.get('/api/schema')
 * @description Returns the database schema information for visualization
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @returns {void}
 */
app.get('/api/schema', (req: Request, res: Response) => {
	const schema = {
		tables: [
			{
				name: 'users',
				columns: [
					{ name: 'id', type: 'String', primaryKey: true, description: 'Unique identifier (cuid)' },
					{ name: 'email', type: 'String', unique: true, description: 'User email address' },
					{ name: 'passwordHash', type: 'String', description: 'Hashed password' },
					{ name: 'firstName', type: 'String', description: 'User first name' },
					{ name: 'lastName', type: 'String', description: 'User last name' },
					{ name: 'phone', type: 'String?', description: 'Optional phone number' },
					{ name: 'createdAt', type: 'DateTime', description: 'Account creation timestamp' },
					{ name: 'updatedAt', type: 'DateTime', description: 'Last update timestamp' }
				],
				relations: ['purchases']
			},
			{
				name: 'products',
				columns: [
					{ name: 'id', type: 'String', primaryKey: true, description: 'Unique identifier (cuid)' },
					{ name: 'name', type: 'String', description: 'Product name' },
					{ name: 'slug', type: 'String', unique: true, description: 'URL-friendly identifier' },
					{ name: 'summary', type: 'String', description: 'Short product description' },
					{ name: 'description', type: 'String', description: 'Full product description' },
					{ name: 'priceCents', type: 'Int', description: 'Price in cents' },
					{ name: 'imageUrl', type: 'String?', description: 'Optional product image URL' },
					{ name: 'createdAt', type: 'DateTime', description: 'Product creation timestamp' },
					{ name: 'updatedAt', type: 'DateTime', description: 'Last update timestamp' }
				],
				relations: ['purchaseItems']
			},
			{
				name: 'purchases',
				columns: [
					{ name: 'id', type: 'String', primaryKey: true, description: 'Unique identifier (cuid)' },
					{ name: 'userId', type: 'String', foreignKey: 'users.id', description: 'Reference to user' },
					{ name: 'totalCents', type: 'Int', description: 'Total purchase amount in cents' },
					{ name: 'createdAt', type: 'DateTime', description: 'Purchase timestamp' }
				],
				relations: ['user', 'items']
			},
			{
				name: 'purchase_items',
				columns: [
					{ name: 'id', type: 'String', primaryKey: true, description: 'Unique identifier (cuid)' },
					{ name: 'purchaseId', type: 'String', foreignKey: 'purchases.id', description: 'Reference to purchase' },
					{ name: 'productId', type: 'String', foreignKey: 'products.id', description: 'Reference to product' },
					{ name: 'quantity', type: 'Int', description: 'Quantity purchased' },
					{ name: 'priceCentsAtPurchase', type: 'Int', description: 'Price at time of purchase' }
				],
				relations: ['purchase', 'product']
			},
			{
				name: 'discounts',
				columns: [
					{ name: 'id', type: 'String', primaryKey: true, description: 'Unique identifier (cuid)' },
					{ name: 'title', type: 'String', description: 'Discount title' },
					{ name: 'description', type: 'String', description: 'Discount description' },
					{ name: 'percentOff', type: 'Int', description: 'Percentage discount' },
					{ name: 'active', type: 'Boolean', description: 'Whether discount is active' },
					{ name: 'startsAt', type: 'DateTime', description: 'Discount start time' },
					{ name: 'endsAt', type: 'DateTime', description: 'Discount end time' }
				]
			}
		]
	};
	
	res.json(schema);
});

// --- Other routes ---

/**
 * @function app.get('/api/discounts')
 * @description Retrieves a list of active discounts.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Get the current date and time.
 *   2. Query the database for active discounts (active, startsAt <= now, endsAt >= now).
 *   3. Return 200 OK with the list of discounts.
 *   4. Catch and log any errors, returning a 500 internal server error.
 */
app.get('/api/discounts', async (req: Request, res: Response) => {
	try {
		// Step 1: Get current date.
		const now = new Date();
		// Step 2: Query for active discounts.
		const discounts = await db.discount.findMany({
			where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
			select: { id: true, title: true, description: true, percentOff: true, active: true, startsAt: true, endsAt: true },
			orderBy: { percentOff: 'desc' }
		});
		// Step 3: Return discounts.
		res.json(discounts);
	} catch (error) {
		// Step 4: Handle errors.
		console.error('Get discounts error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.get('/api/health')
 * @description Provides a health check endpoint for the API.
 * It tests the database connection and returns server status information.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Attempt a simple database query to check connectivity.
 *   2. If successful, return 200 OK with 'healthy' status and server details.
 *   3. If the database query fails, return 503 Service Unavailable with 'unhealthy' status and error details.
 */
app.get('/api/health', async (req: Request, res: Response) => {
	try {
		// Step 1: Test database connection.
		await db.$queryRaw`SELECT 1`;
		// Step 2: Return healthy status.
		res.json({
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV,
			database: 'connected'
		});
	} catch (error: any) {
		// Step 3: Return unhealthy status on error.
		res.status(503).json({
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			error: error.message
		});
	}
});

/**
 * @function app.get('/api/me')
 * @description Retrieves the profile information of the currently authenticated user.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Check if `req.user` exists; if not, return 401 unauthorized.
 *   2. Query the database for the user's full profile using `req.user.id`.
 *   3. If user not found (should not happen if `req.user` is set), return 404.
 *   4. Determine if the user is an admin (by email `admin@agricommerce.com`).
 *   5. Return 200 OK with the user's profile and `isAdmin` flag.
 *   6. Catch and log any errors, returning a 500 internal server error.
 */
app.get('/api/me', async (req: Request, res: Response) => {
	// Step 1: Check authentication.
	if (!req.user) {
		return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
	}
	
	try {
		// Step 2: Fetch user profile from database.
		const user = await db.user.findUnique({
			where: { id: req.user.id },
			select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true, updatedAt: true }
		});
		
		// Step 3: If user not found, return 404.
		if (!user) {
			return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
		}
		
		// Step 4: Determine admin status.
		const isAdmin = user.email === 'admin@agricommerce.com';
		// Step 5: Return user profile with admin status.
		res.json({ ...user, isAdmin });
	} catch (error) {
		// Step 6: Handle errors.
		console.error('Get user profile error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

// --- Admin routes ---

/**
 * @function app.get('/api/admin/users')
 * @description Retrieves a list of all user accounts. Restricted to admin users only.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Check if `req.user` exists and if their email is `admin@agricommerce.com`. If not, return 403 forbidden.
 *   2. Query the database for all user accounts, selecting specific fields.
 *   3. Return 200 OK with the list of users.
 *   4. Catch and log any errors, returning a 500 internal server error.
 */
app.get('/api/admin/users', async (req: Request, res: Response) => {
	// Step 1: Check for admin access.
	if (!req.user || req.user.email !== 'admin@agricommerce.com') {
		return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
	}
	
	try {
		// Step 2: Fetch all users.
		const users = await db.user.findMany({
			select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true },
			orderBy: { createdAt: 'desc' }
		});
		// Step 3: Return users.
		res.json(users);
	} catch (error) {
		// Step 4: Handle errors.
		console.error('Get users error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.delete('/api/admin/users/:id')
 * @description Deletes a user account by ID. Restricted to admin users only.
 * Admins cannot delete their own account.
 * @param {Request} req - The Express request object, expecting `id` (user ID) in URL parameters.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Check for admin access. If not, return 403 forbidden.
 *   2. Extract `id` from URL parameters.
 *   3. Prevent an admin from deleting their own account by checking `id` against `req.user.id`. If attempting to delete self, return 400.
 *   4. Delete the user from the database.
 *   5. Return 200 OK with a success message.
 *   6. Catch and log any errors, returning a 500 internal server error.
 */
app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
	// Step 1: Check for admin access.
	if (!req.user || req.user.email !== 'admin@agricommerce.com') {
		return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
	}
	
	try {
		// Step 2: Extract user ID to delete.
		const { id } = req.params;
		
		// Step 3: Prevent self-deletion.
		if (id === req.user.id) {
			return res.status(400).json({ error: { code: 'INVALID_OPERATION', message: 'Cannot delete your own account' } });
		}
		
		// Step 4: Delete user.
		await db.user.delete({ where: { id } });
		// Step 5: Return success message.
		res.json({ message: 'User deleted successfully' });
	} catch (error) {
		// Step 6: Handle errors.
		console.error('Delete user error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.put('/api/admin/users/:id')
 * @description Updates a user account by ID. Restricted to admin users only.
 * @param {Request} req - The Express request object, expecting `id` (user ID) in URL parameters and `firstName`, `lastName`, `phone` in the body.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Check for admin access. If not, return 403 forbidden.
 *   2. Extract `id` from URL parameters and update fields from the request body.
 *   3. Update the user in the database.
 *   4. Return 200 OK with the updated user details.
 *   5. Catch and log any errors, returning a 500 internal server error.
 */
app.put('/api/admin/users/:id', async (req: Request, res: Response) => {
	// Step 1: Check for admin access.
	if (!req.user || req.user.email !== 'admin@agricommerce.com') {
		return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Admin access required' } });
	}
	
	try {
		// Step 2: Extract user ID and update data.
		const { id } = req.params;
		const { firstName, lastName, phone } = req.body;
		
		// Step 3: Update user.
		const user = await db.user.update({
			where: { id },
			data: { firstName, lastName, phone: phone || null },
			select: { id: true, email: true, firstName: true, lastName: true, phone: true }
		});
		
		// Step 4: Return updated user.
		res.json(user);
	} catch (error) {
		// Step 5: Handle errors.
		console.error('Update user error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.get('/api/purchases')
 * @description Retrieves the purchase history for the authenticated user.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Check if `req.user` exists; if not, return 401 unauthorized.
 *   2. Query the database for purchases associated with `req.user.id`, including nested item and product details.
 *   3. Return 200 OK with the purchase history.
 *   4. Catch and log any errors, returning a 500 internal server error.
 */
app.get('/api/purchases', async (req: Request, res: Response) => {
	// Step 1: Check authentication.
	if (!req.user) {
		return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
	}
	
	try {
		// Step 2: Fetch purchase history for the authenticated user.
		const purchases = await db.purchase.findMany({
			where: { userId: req.user.id },
			select: {
				id: true, totalCents: true, createdAt: true,
				items: {
					select: {
						id: true, quantity: true, priceCentsAtPurchase: true,
						product: { select: { id: true, name: true, slug: true, imageUrl: true } }
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		});
		// Step 3: Return purchase history.
		res.json(purchases);
	} catch (error) {
		// Step 4: Handle errors.
		console.error('Get purchases error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.post('/api/contact')
 * @description Handles contact form submissions. Validates input and simulates sending a message.
 * @param {Request} req - The Express request object, expecting `name`, `email`, and `message` in the body.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * Steps:
 *   1. Validate request body against `contactSchema`. If validation fails, return 400.
 *   2. Extract validated `name`, `email`, and `message`.
 *   3. Log the contact form submission details.
 *   4. Return 202 Accepted with a success message (simulating asynchronous processing).
 *   5. Catch and log any errors, returning a 500 internal server error.
 */
app.post('/api/contact', async (req: Request, res: Response) => {
	try {
		// Step 1: Validate request body.
		const validation = contactSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: formatValidationErrors(validation.error) }
			});
		}
		
		// Step 2: Extract validated data.
		const { name, email, message } = validation.data;
		// Step 3: Log submission.
		console.log('Contact form submission:', { name, email, message, timestamp: new Date().toISOString() });
		
		// Step 4: Return success (simulated).
		res.status(202).json({ message: 'Thank you for your message. We will get back to you soon!' });
	} catch (error) {
		// Step 5: Handle errors.
		console.error('Contact form error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

/**
 * @function app.get('/api/debug/auth')
 * @description Provides authentication debugging information.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {void}
 *
 * Steps:
 *   1. Retrieve the authentication token from cookies.
 *   2. Return 200 OK with information about the token presence, a token preview, authenticated user data (`req.user`), JWT secret status, and Node environment.
 */
app.get('/api/debug/auth', (req: Request, res: Response) => {
	// Step 1: Get token from cookies.
	const token = req.cookies[getCookieName()];
	// Step 2: Return debug information.
	res.json({
		timestamp: new Date().toISOString(),
		hasToken: !!token,
		tokenPreview: token ? token.substring(0, 20) + '...' : null,
		userFromAuth: req.user,
		jwtSecret: !!process.env.JWT_SECRET,
		nodeEnv: process.env.NODE_ENV
	});
});

/**
 * @function app.get('/api/env-check')
 * @description Provides an endpoint to check the status of critical environment variables.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {void}
 *
 * Steps:
 *   1. Check the presence of `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, and `PORT` environment variables.
 *   2. Return 200 OK with their status ('SET' or 'NOT SET').
 */
app.get('/api/env-check', (req: Request, res: Response) => {
	// Step 1 & 2: Return status of environment variables.
	res.json({
		DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
		JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
		NODE_ENV: process.env.NODE_ENV || 'NOT SET',
		PORT: process.env.PORT || 'NOT SET'
	});
});

// Start the server
app.listen(port, () => {
	console.log(`AgriCommerce Backend API listening at http://localhost:${port}`);
});