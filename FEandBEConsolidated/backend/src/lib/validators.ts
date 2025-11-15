/**
 * @fileoverview Zod schemas for input validation and utility for formatting validation errors.
 * @module lib/validators
 * @description This module defines Zod schemas for various API inputs such as sign-up, sign-in, contact forms, and product queries. It also provides a helper function to format Zod validation errors into a more readable object.
 * @dependencies zod
 * @exports emailSchema - Zod schema for email validation.
 * @exports passwordSchema - Zod schema for password validation.
 * @exports nameSchema - Zod schema for name validation.
 * @exports phoneSchema - Zod schema for optional phone number validation.
 * @exports signUpSchema - Zod schema for user sign-up input.
 * @exports signInSchema - Zod schema for user sign-in input.
 * @exports contactSchema - Zod schema for contact form input.
 * @exports productQuerySchema - Zod schema for product query parameters.
 * @exports SignUpInput - TypeScript type inferred from `signUpSchema`.
 * @exports SignInInput - TypeScript type inferred from `signInSchema`.
 * @exports ContactInput - TypeScript type inferred from `contactSchema`.
 * @exports ProductQuery - TypeScript type inferred from `productQuerySchema`.
 * @exports formatValidationErrors - Function to format Zod errors.
 * @author Gemini
 * @lastModified 2025-11-11
 */

import { z } from 'zod';

/**
 * @constant {ZodString} emailSchema - Zod schema for email validation.
 * Requires a valid email format, converts to lowercase, and trims whitespace.
 */
export const emailSchema = z.string().email().toLowerCase().trim();
/**
 * @constant {ZodString} passwordSchema - Zod schema for password validation.
 * Requires a minimum length of 6 characters.
 */
export const passwordSchema = z.string().min(6);
/**
 * @constant {ZodString} nameSchema - Zod schema for name validation.
 * Requires at least one character and trims whitespace.
 */
export const nameSchema = z.string().min(1).trim();
/**
 * @constant {ZodOptional<ZodString>} phoneSchema - Zod schema for optional phone number validation.
 * Trims whitespace and is optional.
 */
export const phoneSchema = z.string().trim().optional();

/**
 * @constant {ZodObject} signUpSchema - Zod schema for user sign-up input.
 * Combines `emailSchema`, `passwordSchema`, `nameSchema` (for first and last name), and `phoneSchema`.
 */
export const signUpSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	firstName: nameSchema,
	lastName: nameSchema,
	phone: phoneSchema
});

/**
 * @constant {ZodObject} signInSchema - Zod schema for user sign-in input.
 * Requires non-empty `email` and `password` strings, with email trimmed.
 */
export const signInSchema = z.object({
	email: z.string().min(1).trim(),
	password: z.string().min(1)
});

/**
 * @constant {ZodObject} contactSchema - Zod schema for contact form input.
 * Requires non-empty `name`, `email`, and `message` fields, with name and message trimmed.
 */
export const contactSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	message: z.string().min(1).trim()
});

/**
 * @constant {ZodObject} productQuerySchema - Zod schema for product query parameters.
 * Parses `page` and `pageSize` as numbers (defaulting to 1 and 12 respectively) and trims the optional `q` (search query).
 */
export const productQuerySchema = z.object({
	page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
	pageSize: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 12)),
	q: z.string().optional().transform((val) => val?.trim())
});

/**
 * @typedef {z.infer<typeof signUpSchema>} SignUpInput - TypeScript type inferred from `signUpSchema`.
 */
export type SignUpInput = z.infer<typeof signUpSchema>;
/**
 * @typedef {z.infer<typeof signInSchema>} SignInInput - TypeScript type inferred from `signInSchema`.
 */
export type SignInInput = z.infer<typeof signInSchema>;
/**
 * @typedef {z.infer<typeof contactSchema>} ContactInput - TypeScript type inferred from `contactSchema`.
 */
export type ContactInput = z.infer<typeof contactSchema>;
/**
 * @typedef {z.infer<typeof productQuerySchema>} ProductQuery - TypeScript type inferred from `productQuerySchema`.
 */
export type ProductQuery = z.infer<typeof productQuerySchema>;

/**
 * @function formatValidationErrors
 * @description Formats a Zod error object into a flat object where keys are field paths and values are error messages.
 * @param {z.ZodError} error - The Zod error object to format.
 * @returns {Record<string, string>} An object mapping field names to their first validation error message.
 *
 * Steps:
 *   1. Initialize an empty object `errors`.
 *   2. Iterate over each error in `error.errors`.
 *   3. For each error, join its `path` array to form a field string (e.g., "firstName").
 *   4. Assign the error's `message` to the corresponding field in the `errors` object.
 *   5. Return the `errors` object.
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
	// Step 1: Initialize an empty errors object.
	const errors: Record<string, string> = {};
	// Step 2: Iterate over each Zod error.
	error.errors.forEach((err) => {
		// Step 3: Create a field path string.
		const field = err.path.join('.');
		// Step 4: Assign the error message to the field.
		errors[field] = err.message;
	});
	// Step 5: Return the formatted errors.
	return errors;
}
