import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../application/category.service';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.status(200).json({
        data: categories.map((c) => c.toJSON()),
        count: categories.length,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      res.status(201).json({
        message: 'Category created successfully',
        data: category.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await this.categoryService.getCategoryById(req.params.id);
      res.status(200).json({
        data: category.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };
}
