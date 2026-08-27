import { Router } from 'express';
import { prisma } from '../../../infrastructure/database/prisma';
import { PrismaProductRepository } from './prisma-product.repository';
import { PrismaCategoryRepository } from '../../categories/infrastructure/prisma-category.repository';
import { ProductService } from '../application/product.service';
import { ProductController } from './product.controller';
import { validateRequest } from '../../../infrastructure/http/middlewares/validate-request.middleware';
import {
  createProductSchema,
  productIdParamSchema,
} from './product.schema';

export const createProductRouter = (
  productService?: ProductService
): Router => {
  const router = Router();

  const service =
    productService ??
    new ProductService(
      new PrismaProductRepository(prisma),
      new PrismaCategoryRepository(prisma)
    );
  const controller = new ProductController(service);

  // GET /api/products (includes Category)
  router.get('/', controller.getAll);

  // GET /api/products/:id
  router.get(
    '/:id',
    validateRequest({ params: productIdParamSchema }),
    controller.getById
  );

  // POST /api/products
  router.post(
    '/',
    validateRequest({ body: createProductSchema }),
    controller.create
  );

  // DELETE /api/products/:id
  router.delete(
    '/:id',
    validateRequest({ params: productIdParamSchema }),
    controller.delete
  );

  return router;
};

export const productRouter = createProductRouter();
