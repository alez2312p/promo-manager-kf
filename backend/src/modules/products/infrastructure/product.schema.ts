import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be at most 150 characters'),
  sku: z
    .string({ required_error: 'Product SKU is required' })
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU must be at most 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'SKU can only contain alphanumeric characters, dashes, and underscores'),
  price: z
    .number({ required_error: 'Price is required' })
    .positive('Price must be greater than 0'),
  categoryId: z.string().uuid('Category ID must be a valid UUID').nullable().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  sku: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().uuid('Category ID must be a valid UUID').nullable().optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
});
