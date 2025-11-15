import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'agri_auth';

export function signJWT(payload) {
	return jwt.sign(payload, JWT_SECRET, {
		algorithm: 'HS256',
		expiresIn: JWT_EXPIRES_IN
	});
}

export function verifyJWT(token) {
	try {
		return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
	} catch (error) {
		return null;
	}
}

export function getCookieName() {
	return COOKIE_NAME;
}