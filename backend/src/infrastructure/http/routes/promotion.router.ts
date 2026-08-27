import { Router } from 'express';
import { prisma } from '../../database/prisma';
import { PrismaPromotionRepository } from '../../database/prisma-promotion.repository';
import { PromotionService } from '../../../application/services/promotion.service';
import { PromotionController } from '../controllers/promotion.controller';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
  createPromotionSchema,
  promotionIdParamSchema,
  promotionQuerySchema,
  updatePromotionSchema,
  updatePromotionStatusSchema,
} from '../schemas/promotion.schema';

export const createPromotionRouter = (
  promotionService?: PromotionService
): Router => {
  const router = Router();

  // Dependency injection
  const service =
    promotionService ??
    new PromotionService(new PrismaPromotionRepository(prisma));
  const controller = new PromotionController(service);

  // Routes

  // Metrics endpoint (must be registered before /:id)
  router.get('/metrics', controller.getMetrics);

  // List all promotions
  router.get(
    '/',
    validateRequest({ query: promotionQuerySchema }),
    controller.getAll
  );

  // Get single promotion
  router.get(
    '/:id',
    validateRequest({ params: promotionIdParamSchema }),
    controller.getById
  );

  // Create new promotion
  router.post(
    '/',
    validateRequest({ body: createPromotionSchema }),
    controller.create
  );

  // Update promotion status (SCHEDULED -> ACTIVE -> FINISHED)
  router.patch(
    '/:id/status',
    validateRequest({
      params: promotionIdParamSchema,
      body: updatePromotionStatusSchema,
    }),
    controller.updateStatus
  );

  // Update promotion details
  router.put(
    '/:id',
    validateRequest({
      params: promotionIdParamSchema,
      body: updatePromotionSchema,
    }),
    controller.update
  );

  // Delete promotion (only if SCHEDULED)
  router.delete(
    '/:id',
    validateRequest({ params: promotionIdParamSchema }),
    controller.delete
  );

  return router;
};

export const promotionRouter = createPromotionRouter();
