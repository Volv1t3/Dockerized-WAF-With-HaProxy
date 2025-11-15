import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { db } from './lib/db.js';
import { signJWT, verifyJWT, getCookieName } from './lib/jwt.js';
import { signInSchema, signUpSchema, contactSchema, productQuerySchema, formatValidationErrors } from './lib/validators.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 33771;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: true }));

// Auth middleware
const authMiddleware = async (req, res, next) => {
	const token = req.cookies[getCookieName()];
	req.user = null;
	
	if (token) {
		const payload = verifyJWT(token);
		if (payload) {
			try {
				const user = await db.user.findUnique({
					where: { id: payload.userId },
					select: { id: true, email: true, firstName: true, lastName: true }
				});
				if (user) req.user = user;
			} catch (error) {
				console.error('Auth middleware error:', error);
			}
		}
	}
	next();
};

app.use(authMiddleware);

// Auth routes
app.post('/api/auth/sign-in', async (req, res) => {
	try {
		const { email, password } = req.body;
		
		const user = await db.user.findUnique({
			where: { email },
			select: { id: true, email: true, passwordHash: true, firstName: true, lastName: true }
		});
		
		const invalidError = { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
		
		if (!user) return res.status(401).json(invalidError);
		
		const isValid = await bcrypt.compare(password, user.passwordHash);
		if (!isValid) return res.status(401).json(invalidError);
		
		const token = signJWT({ userId: user.id, email: user.email });
		
		res.cookie('agri_auth', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7 * 1000
		});
		
		res.json({
			user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
			message: 'Signed in successfully'
		});
	} catch (error) {
		console.error('Sign-in error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

app.post('/api/auth/sign-out', (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
	}
	
	res.clearCookie('agri_auth', { path: '/' });
	res.json({ message: 'Signed out successfully' });
});

app.post('/api/auth/sign-up', async (req, res) => {
	try {
		const validation = signUpSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: formatValidationErrors(validation.error) }
			});
		}
		
		const { email, password, firstName, lastName, phone } = validation.data;
		
		const existing = await db.user.findUnique({ where: { email } });
		if (existing) {
			return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'An account with this email already exists' } });
		}
		
		const passwordHash = await bcrypt.hash(password, 12);
		
		const user = await db.user.create({
			data: { email, passwordHash, firstName, lastName, phone: phone || null },
			select: { id: true, email: true, firstName: true, lastName: true, createdAt: true }
		});
		
		const token = signJWT({ userId: user.id, email: user.email });
		
		res.cookie('agri_auth', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 1000
		});
		
		res.status(201).json({
			user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
			message: 'Account created successfully'
		});
	} catch (error) {
		console.error('Sign-up error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

// Products routes
app.get('/api/products', async (req, res) => {
	try {
		const validation = productQuerySchema.safeParse(req.query);
		if (!validation.success) {
			return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters' } });
		}
		
		const { page, pageSize, q } = validation.data;
		const skip = (page - 1) * pageSize;
		
		const whereConditions = q ? {
			OR: [
				{ name: { contains: q } },
				{ summary: { contains: q } },
				{ description: { contains: q } }
			]
		} : {};
		
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
		
		const totalPages = Math.ceil(totalCount / pageSize);
		
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
		console.error('Get products error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

app.get('/api/products/:id', async (req, res) => {
	try {
		const { id } = req.params;
		
		const product = await db.product.findFirst({
			where: { OR: [{ id }, { slug: id }] },
			select: { id: true, name: true, slug: true, summary: true, description: true, priceCents: true, imageUrl: true, createdAt: true, updatedAt: true }
		});
		
		if (!product) {
			return res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' } });
		}
		
		res.json(product);
	} catch (error) {
		console.error('Get product error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

// Other routes
app.get('/api/discounts', async (req, res) => {
	try {
		const now = new Date();
		const discounts = await db.discount.findMany({
			where: { active: true, startsAt: { lte: now }, endsAt: { gte: now } },
			select: { id: true, title: true, description: true, percentOff: true, active: true, startsAt: true, endsAt: true },
			orderBy: { percentOff: 'desc' }
		});
		res.json(discounts);
	} catch (error) {
		console.error('Get discounts error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

app.get('/api/health', async (req, res) => {
	try {
		await db.$queryRaw`SELECT 1`;
		res.json({
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV,
			database: 'connected'
		});
	} catch (error) {
		res.status(503).json({
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			error: error.message
		});
	}
});

app.get('/api/me', (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
	}
	res.json(req.user);
});

app.get('/api/purchases', async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
	}
	
	try {
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
		res.json(purchases);
	} catch (error) {
		console.error('Get purchases error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

app.post('/api/contact', async (req, res) => {
	try {
		const validation = contactSchema.safeParse(req.body);
		if (!validation.success) {
			return res.status(400).json({
				error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: formatValidationErrors(validation.error) }
			});
		}
		
		const { name, email, message } = validation.data;
		console.log('Contact form submission:', { name, email, message, timestamp: new Date().toISOString() });
		
		res.status(202).json({ message: 'Thank you for your message. We will get back to you soon!' });
	} catch (error) {
		console.error('Contact form error:', error);
		res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
	}
});

app.get('/api/debug/auth', (req, res) => {
	const token = req.cookies[getCookieName()];
	res.json({
		timestamp: new Date().toISOString(),
		hasToken: !!token,
		tokenPreview: token ? token.substring(0, 20) + '...' : null,
		userFromAuth: req.user,
		jwtSecret: !!process.env.JWT_SECRET,
		nodeEnv: process.env.NODE_ENV
	});
});

app.get('/api/env-check', (req, res) => {
	res.json({
		DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
		JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
		NODE_ENV: process.env.NODE_ENV || 'NOT SET',
		PORT: process.env.PORT || 'NOT SET'
	});
});

app.listen(port, () => {
	console.log(`AgriCommerce Backend API listening at http://localhost:${port}`);
});
