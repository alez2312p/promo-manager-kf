import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500).optional().nullable(),
});

export const categoryIdParamSchema = z.object({
  id: z.string().uuid('Invalid category ID format'),
});
