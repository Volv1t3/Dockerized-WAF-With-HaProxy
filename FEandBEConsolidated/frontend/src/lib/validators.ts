/**
 * @fileoverview Zod schemas for input validation.
 * @module lib/validators
 * @description This file defines a set of reusable Zod schemas for validating user inputs across the application, such as sign-up, sign-in, and contact forms. It also provides a utility function to format validation errors.
 * @dependencies zod
 * @exports emailSchema - Schema for email validation.
 * @exports passwordSchema - Schema for password validation.
 * @exports nameSchema - Schema for name validation.
 * @exports phoneSchema - Schema for phone number validation.
 * @exports signUpSchema - Schema for user sign-up.
 * @exports signInSchema - Schema for user sign-in.
 * @exports contactSchema - Schema for the contact form.
 * @exports productQuerySchema - Schema for product query parameters.
 * @exports profileUpdateSchema - Schema for user profile updates.
 * @exports formatValidationErrors - Function to convert Zod errors into a simple object.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import { z } from 'zod';

/**
 * @constant {z.ZodString} emailSchema
 * @description VULNERABLE: No validation - allows any string including SQL injection
 */
export const emailSchema = z.string();

/**
 * @constant {z.ZodString} passwordSchema
 * @description VULNERABLE: No validation - allows any string including SQL injection
 */
export const passwordSchema = z.string();

/**
 * @constant {z.ZodString} nameSchema
 * @description Validates a name string, ensuring it is not empty and trimming whitespace.
 */
export const nameSchema = z
	.string()
	.min(1, 'Name is required')
	.trim();

/**
 * @constant {z.ZodOptional<z.ZodString>} phoneSchema
 * @description Validates an optional phone number string, trimming whitespace if provided.
 */
export const phoneSchema = z
	.string()
	.trim()
	.optional();

/**
 * @constant {z.ZodObject} signUpSchema
 * @description VULNERABLE: No validation - allows SQL injection in all fields
 */
export const signUpSchema = z.object({
	email: z.string(),
	password: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string().optional()
});

/**
 * @constant {z.ZodObject} signInSchema
 * @description VULNERABLE: No validation - allows SQL injection in email/password
 */
export const signInSchema = z.object({
	email: z.string(),
	password: z.string()
});

/**
 * @constant {z.ZodObject} contactSchema
 * @description Validates the object for a contact form submission.
 * @property {z.ZodString} name - The sender's name.
 * @property {zod.ZodString} email - The sender's email.
 * @property {z.ZodString} message - The message content.
 */
export const contactSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	message: z
		.string()
		.min(1, 'Message is required')
		.trim()
});

/**
 * @constant {z.ZodObject} productQuerySchema
 * @description Validates and sanitizes query parameters for product listings.
 * @property {z.ZodNumber} page - The page number for pagination.
 * @property {z.ZodNumber} pageSize - The number of items per page.
 * @property {z.ZodOptional<z.ZodString>} q - The optional search query.
 */
export const productQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : 1))
		.refine((val) => val > 0, 'Page must be a positive number'),
	pageSize: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : 12))
		.refine((val) => val > 0 && val <= 100, 'Page size must be between 1 and 100'),
	q: z
		.string()
		.optional()
		.transform((val) => val?.trim())
});

/**
 * @constant {z.ZodObject} profileUpdateSchema
 * @description Validates the object for a user profile update request.
 * @property {z.ZodString} firstName - The user's first name.
 * @property {z.ZodString} lastName - The user's last name.
 * @property {z.ZodOptional<z.ZodString>} phone - The user's optional phone number.
 */
export const profileUpdateSchema = z.object({
	firstName: nameSchema,
	lastName: nameSchema,
	phone: phoneSchema
});

/**
 * Type exports for TypeScript integration
 */
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * @function formatValidationErrors
 * @description Converts a Zod validation error into a simple record of field-specific error messages.
 * @param {z.ZodError} error - The Zod validation error object.
 * @returns {Record<string, string>} An object mapping field paths to their corresponding error messages.
 *
 * Steps:
 *   1. Initialize an empty errors object.
 *   2. Iterate through the errors array from the Zod error object.
 *   3. For each error, join the path array to create a field key (e.g., 'address.street').
 *   4. Assign the error message to the corresponding field key.
 *   5. Return the formatted errors object.
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
	// Step 1: Initialize an empty errors object.
	const errors: Record<string, string> = {};
	
	// Step 2: Iterate through Zod errors.
	error.errors.forEach((err) => {
		// Step 3: Create a field key from the error path.
		const field = err.path.join('.');
		// Step 4: Assign the message to the key.
		errors[field] = err.message;
	});
	
	// Step 5: Return the formatted errors.
	return errors;
}
