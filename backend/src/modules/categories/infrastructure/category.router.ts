import { Router } from 'express';
import { prisma } from '../../../infrastructure/database/prisma';
import { PrismaCategoryRepository } from './prisma-category.repository';
import { CategoryService } from '../application/category.service';
import { CategoryController } from './category.controller';
import { validateRequest } from '../../../infrastructure/http/middlewares/validate-request.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from './category.schema';

export const createCategoryRouter = (
  categoryService?: CategoryService
): Router => {
  const router = Router();

  const service =
    categoryService ??
    new CategoryService(new PrismaCategoryRepository(prisma));
  const controller = new CategoryController(service);

  // GET /api/categories
  router.get('/', controller.getAll);

  // GET /api/categories/:id
  router.get(
    '/:id',
    validateRequest({ params: categoryIdParamSchema }),
    controller.getById
  );

  // POST /api/categories
  router.post(
    '/',
    validateRequest({ body: createCategorySchema }),
    controller.create
  );

  // PUT /api/categories/:id
  router.put(
    '/:id',
    validateRequest({
      params: categoryIdParamSchema,
      body: updateCategorySchema,
    }),
    controller.update
  );

  // DELETE /api/categories/:id
  router.delete(
    '/:id',
    validateRequest({ params: categoryIdParamSchema }),
    controller.delete
  );

  return router;
};

export const categoryRouter = createCategoryRouter();
