import { z } from 'zod';

export const emailSchema = z.string().email().toLowerCase().trim();
export const passwordSchema = z.string().min(6);
export const nameSchema = z.string().min(1).trim();
export const phoneSchema = z.string().trim().optional();

export const signUpSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	firstName: nameSchema,
	lastName: nameSchema,
	phone: phoneSchema
});

export const signInSchema = z.object({
	email: z.string().min(1).trim(),
	password: z.string().min(1)
});

export const contactSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	message: z.string().min(1).trim()
});

export const productQuerySchema = z.object({
	page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
	pageSize: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 12)),
	q: z.string().optional().transform((val) => val?.trim())
});

export function formatValidationErrors(error) {
	const errors = {};
	error.errors.forEach((err) => {
		const field = err.path.join('.');
		errors[field] = err.message;
	});
	return errors;
}