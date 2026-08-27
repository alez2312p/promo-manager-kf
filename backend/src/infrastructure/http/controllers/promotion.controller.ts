import { Request, Response, NextFunction } from 'express';
import { PromotionService } from '../../../application/services/promotion.service';

export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.promotionService.createPromotion(req.body);
      res.status(201).json({
        message: 'Promotion created successfully',
        data: result.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        status: req.query.status as any,
        search: req.query.search as string | undefined,
      };
      const result = await this.promotionService.getAllPromotions(filters);
      res.status(200).json({
        data: result.map((p) => p.toJSON()),
        count: result.length,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.promotionService.getPromotionById(req.params.id);
      res.status(200).json({
        data: result.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.promotionService.getMetrics();
      res.status(200).json({
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.promotionService.updatePromotionStatus(
        req.params.id,
        req.body
      );
      res.status(200).json({
        message: 'Promotion status updated successfully',
        data: result.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.promotionService.updatePromotion(
        req.params.id,
        req.body
      );
      res.status(200).json({
        message: 'Promotion updated successfully',
        data: result.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.promotionService.deletePromotion(req.params.id);
      res.status(200).json({
        message: 'Promotion deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
