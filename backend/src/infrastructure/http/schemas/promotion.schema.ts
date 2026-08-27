import { z } from 'zod';

export const createPromotionSchema = z.object({
  code: z
    .string({ required_error: 'Promotion code is required' })
    .min(3, 'Code must be at least 3 characters')
    .max(30, 'Code must be at most 30 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain alphanumeric characters, dashes, and underscores'),
  name: z
    .string({ required_error: 'Promotion name is required' })
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description max 500 characters').optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
    required_error: 'Discount type is required (PERCENTAGE or FIXED_AMOUNT)',
  }),
  value: z
    .number({ required_error: 'Discount value is required' })
    .positive('Discount value must be positive'),
  minSpend: z.number().nonnegative('Minimum spend must be >= 0').optional().nullable(),
  maxDiscount: z.number().positive('Maximum discount must be positive').optional().nullable(),
  startDate: z.string().datetime({ message: 'Start date must be an ISO 8601 string' }).transform((val) => new Date(val)),
  endDate: z.string().datetime({ message: 'End date must be an ISO 8601 string' }).transform((val) => new Date(val)),
  usageLimit: z.number().int().positive('Usage limit must be a positive integer').optional().nullable(),
  categoryIds: z.array(z.string().uuid('Invalid category ID format')).optional(),
  productIds: z.array(z.string().uuid('Invalid product ID format')).optional(),
});

export const updatePromotionSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
  value: z.number().positive().optional(),
  minSpend: z.number().nonnegative().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  startDate: z.string().datetime().transform((val) => new Date(val)).optional(),
  endDate: z.string().datetime().transform((val) => new Date(val)).optional(),
  usageLimit: z.number().int().positive().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

export const updatePromotionStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'ACTIVE', 'FINISHED'], {
    required_error: 'Status is required (SCHEDULED, ACTIVE, or FINISHED)',
  }),
});

export const promotionQuerySchema = z.object({
  status: z.enum(['SCHEDULED', 'ACTIVE', 'FINISHED']).optional(),
  search: z.string().optional(),
});

export const promotionIdParamSchema = z.object({
  id: z.string().uuid('Invalid promotion ID format'),
});
